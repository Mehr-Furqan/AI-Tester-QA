// agent.js — main QA agent loop
// Connects Ollama, browser, capture, and ticket modules

import fs from "fs";
import path from "path";
import chalk from "chalk";
import { chat } from "./ollama.js";
import { launchBrowser, closeBrowser, getPageState, takeScreenshot, doAction } from "./browser.js";
import { savePageVideo, screenshotSummary } from "./capture.js";
import { createTicket } from "./ticket.js";

const SYSTEM_PROMPT = fs.readFileSync(path.resolve("prompts/system.txt"), "utf8");
const QA_GUIDELINES = fs.readFileSync(path.resolve("prompts/qa-guidelines.txt"), "utf8");
const MAX_STEPS = 50;
const STEP_DELAY_MS = 300;   // reduced from 1200 — faster execution

export async function runAgent({ url, goal, model = "qwen2.5:7b", sessionId }) {
  console.log(chalk.bold.cyan("\n  QA Agent starting"));
  console.log(chalk.dim(`  Session: ${sessionId}`));
  console.log(chalk.dim(`  Target:  ${url}`));
  console.log(chalk.dim(`  Goal:    ${goal}\n`));

  const sessionLog = [];
  const bugsFound = [];
  let step = 0;
  let failedActionCount = 0;      // consecutive failures
  let lastActionKey = "";         // action type only (not text) for loop detection
  let sameActionCount = 0;
  let lastActionFailed = false;

  const page = await launchBrowser({ record: true, sessionId });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(600);  // reduced from 1500

  const messages = [
    {
      role: "user",
      content: `Testing goal: ${goal}\n\nStart URL: ${url}\n\nBegin exploring. Respond with your first action as JSON.`,
    },
  ];

  while (step < MAX_STEPS) {
    const pageState = await getPageState(page);
    const screenshotPath = await takeScreenshot(page, sessionId, step);

    // Build comprehensive state message with visual guidance
    const stateMessage = {
      role: "user",
      content: JSON.stringify({
        step,
        lastActionFailed,
        url: pageState.url,
        title: pageState.title,
        bodyText: pageState.bodyText.substring(0, 2000), // Limit text
        // Separate inputs from buttons/links — helps model reason correctly
        inputs: pageState.interactable.filter((e) => e.isInput).slice(0, 15),
        buttons: pageState.interactable.filter((e) => !e.isInput).slice(0, 20),
        errors: pageState.errors,
        consoleErrors: (global._consoleErrors ?? []).slice(-5),
        accessibility: {
          hasAriaLabels: pageState.interactable.some((e) => e.ariaLabel),
          hasFormLabels: pageState.interactable.filter((e) => e.isInput && e.label).length,
          hasHeadings: pageState.bodyText.split('\n').filter((l) => /^#{1,6}/.test(l)).length,
        },
        screenshotPath,
        instructions: "IMPORTANT: Use visible element text/labels for actions. For 'click': use the exact visible button text. For 'type': identify the field by label or placeholder. ONLY use actions: click, type, navigate, scroll, hover, press, wait, report_bug, done",
      }),
    };

    messages.push(stateMessage);

    const window = [
      { role: "user", content: SYSTEM_PROMPT },
      { role: "user", content: QA_GUIDELINES },
      ...messages.slice(-12),  // adjusted window for guidelines
    ];

    let action;
    try {
      action = await chat(window, { model });
    } catch (err) {
      console.error(chalk.red(`  Model error at step ${step}: ${err.message}`));
      await page.waitForTimeout(800);  // reduced from 2000
      step++;
      continue;
    }

    messages.push({ role: "assistant", content: JSON.stringify(action) });

    // Validate action — only allow known actions
    const ALLOWED_ACTIONS = ["click", "type", "navigate", "scroll", "hover", "press", "wait", "report_bug", "done"];
    if (!ALLOWED_ACTIONS.includes(action.action)) {
      console.warn(chalk.red(`  ✗ Invalid action "${action.action}" — must be one of: ${ALLOWED_ACTIONS.join(", ")}`));
      console.log(chalk.cyan(`  Forcing scroll to explore page and find valid elements`));
      
      // Force a valid action
      await doAction(page, { action: "scroll", direction: "down" });
      sameActionCount = 0;
      lastActionKey = "";
      step++;
      await page.waitForTimeout(STEP_DELAY_MS);
      continue;
    }

    // Loop detection — track by action+selector combo, ignore description/text variations
    const actionKey = `${action.action}:${action.selector ?? ""}:${action.url ?? ""}`;
    if (actionKey === lastActionKey) {
      sameActionCount++;
    } else {
      sameActionCount = 0;
      lastActionKey = actionKey;
    }

    // Force escape if truly stuck
    if (sameActionCount >= 2) {
      console.warn(chalk.yellow(`  Stuck on same action — forcing scroll + navigate`));
      await doAction(page, { action: "scroll", direction: "down" });
      await page.waitForTimeout(300);  // reduced from 800
      sameActionCount = 0;
      lastActionFailed = false;
      step++;
      continue;
    }

    // Also escape if too many consecutive failures
    if (failedActionCount >= 4) {
      console.warn(chalk.yellow(`  Too many failures — scrolling to explore`));
      await doAction(page, { action: "scroll", direction: "down" });
      failedActionCount = 0;
      lastActionFailed = false;
      step++;
      continue;
    }

    const stepLog = { step, action, screenshot: screenshotPath, url: pageState.url };
    sessionLog.push(stepLog);
    logAction(step, action);

    if (action.action === "done") {
      console.log(chalk.green(`\n  Done: ${action.summary}`));
      break;
    }

    if (action.action === "report_bug") {
      const bugIndex = bugsFound.length;
      console.log(chalk.red.bold(`\n  BUG #${bugIndex + 1}: [${action.severity?.toUpperCase()}] ${action.title}`));

      const videoPath = await savePageVideo(page, sessionId, bugIndex);
      const screenshots = screenshotSummary(sessionId);

      const bug = {
        ...action,
        bugIndex,
        sessionId,
        step,
        url: pageState.url,
        videoPath,
        screenshots: screenshots.slice(-5),
        stepsToReproduce: sessionLog.slice(Math.max(0, step - 8), step + 1),
      };

      bugsFound.push(bug);
      await createTicket(bug);

      console.log(chalk.dim("  Continuing test...\n"));
      failedActionCount = 0;
      lastActionFailed = false;
      step++;
      await page.waitForTimeout(400);  // reduced from 1200
      continue;
    }

    const success = await doAction(page, action);
    lastActionFailed = !success;
    if (!success) {
      failedActionCount++;
      console.warn(chalk.yellow(`  Action failed (${action.action}): Will retry with different approach`));
      
      // On repeated failures, force exploration
      if (failedActionCount >= 2) {
        console.log(chalk.cyan(`  Switching to scroll to explore page layout`));
        await doAction(page, { action: "scroll", direction: "down" });
        failedActionCount = 0;
        lastActionKey = "";
      }
    } else {
      failedActionCount = 0;
    }

    step++;
    await page.waitForTimeout(STEP_DELAY_MS);
  }

  // Save full session log
  const sessionDir = path.resolve("output/sessions");
  fs.mkdirSync(sessionDir, { recursive: true });
  fs.writeFileSync(
    path.join(sessionDir, `${sessionId}.json`),
    JSON.stringify({ sessionId, url, goal, steps: sessionLog, bugs: bugsFound }, null, 2)
  );

  await closeBrowser();

  return { sessionId, stepsRun: step, bugsFound };
}

function logAction(step, action) {
  const icons = {
    click: "◉",
    type: "✎",
    navigate: "→",
    scroll: "↓",
    hover: "◎",
    press: "⏎",
    wait: "…",
    report_bug: "🐛",
    done: "✓",
  };
  const icon = icons[action.action] ?? "·";
  const desc = action.description ?? action.title ?? "";
  console.log(
    chalk.dim(`  [${String(step).padStart(2, "0")}]`) +
    " " +
    chalk.bold(icon) +
    " " +
    chalk.white(action.action) +
    chalk.dim(` — ${desc}`)
  );
}
