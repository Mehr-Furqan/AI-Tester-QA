// ticket.js — creates bug tickets
// Asks user where to send each ticket: file, Jira, or both

import fs from "fs";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { generate } from "./ollama.js";

// ─── Interactive destination picker ───────────────────────────────────────────

export async function createTicket(bug) {
  const { destination } = await inquirer.prompt([
    {
      type: "list",
      name: "destination",
      message: chalk.yellow(`  Where to send bug #${bug.bugIndex + 1}?`),
      choices: [
        { name: "  Save as file  (JSON + Markdown)", value: "file" },
        { name: "  Push to Jira", value: "jira" },
        { name: "  Both  (file + Jira)", value: "both" },
        { name: "  Skip this bug", value: "skip" },
      ],
    },
  ]);

  if (destination === "skip") {
    console.log(chalk.dim("  Skipped.\n"));
    return null;
  }

  console.log(chalk.dim("  Generating ticket with AI..."));
  const ticket = await generateTicketContent(bug);

  if (destination === "file" || destination === "both") {
    await saveToFile(ticket, bug);
  }

  if (destination === "jira" || destination === "both") {
    await pushToJira(ticket, bug);
  }

  return ticket;
}

// ─── AI-generated ticket content ──────────────────────────────────────────────

async function generateTicketContent(bug) {
  const stepsText = (bug.stepsToReproduce ?? [])
    .map((s, i) => `${i + 1}. [${s.action?.action}] ${s.action?.description ?? ""}`)
    .join("\n");

  const prompt = `You are a QA engineer writing a detailed bug report. Based on the information below, write a structured bug report.

Bug title: ${bug.title}
Description: ${bug.description}
Severity: ${bug.severity}
Category: ${bug.category ?? "functional"}
URL where found: ${bug.url}

Recent steps before bug:
${stepsText}

Write a professional bug report with these exact sections:
## Summary
(one sentence)

## Steps to Reproduce
(numbered list, clear and specific)

## Expected Behavior
(what should happen)

## Actual Behavior  
(what actually happened)

## Severity
${bug.severity}

## Environment
- Browser: Chromium (Playwright)
- Viewport: 1280x800
- OS: macOS

## Additional Notes
(any extra observations)`;

  const content = await generate(prompt);

  return {
    id: `BUG-${Date.now()}`,
    title: bug.title,
    severity: bug.severity,
    category: bug.category ?? "functional",
    url: bug.url,
    sessionId: bug.sessionId,
    step: bug.step,
    videoPath: bug.videoPath,
    screenshots: bug.screenshots ?? [],
    markdownContent: content,
    createdAt: new Date().toISOString(),
    raw: bug,
  };
}

// ─── Save to file ──────────────────────────────────────────────────────────────

async function saveToFile(ticket, bug) {
  const dir = path.resolve("output/tickets");
  fs.mkdirSync(dir, { recursive: true });

  const baseName = `${bug.sessionId}_bug${bug.bugIndex}`;

  // JSON — full structured data
  const jsonPath = path.join(dir, `${baseName}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(ticket, null, 2));

  // Markdown — human-readable report
  const mdPath = path.join(dir, `${baseName}.md`);
  const md = buildMarkdown(ticket);
  fs.writeFileSync(mdPath, md);

  console.log(chalk.green(`  Saved: ${mdPath}`));
  if (ticket.videoPath) console.log(chalk.green(`  Video: ${ticket.videoPath}`));
  console.log();

  return { jsonPath, mdPath };
}

function buildMarkdown(ticket) {
  const screenshots = ticket.screenshots?.map((s) => `![screenshot](${s})`).join("\n") ?? "";
  const video = ticket.videoPath ? `\n**Video:** [Recording](${ticket.videoPath})\n` : "";

  return `# ${ticket.title}

**ID:** ${ticket.id}  
**Severity:** ${ticket.severity}  
**Category:** ${ticket.category}  
**URL:** ${ticket.url}  
**Session:** ${ticket.sessionId}  
**Found at step:** ${ticket.step}  
**Date:** ${ticket.createdAt}
${video}
---

${ticket.markdownContent}

---

## Evidence

${screenshots || "_No screenshots attached_"}
`;
}

// ─── Push to Jira ──────────────────────────────────────────────────────────────

async function pushToJira(ticket, bug) {
  const { JIRA_URL, JIRA_TOKEN, JIRA_EMAIL, JIRA_PROJECT_KEY } = process.env;

  if (!JIRA_URL || !JIRA_TOKEN || !JIRA_EMAIL || !JIRA_PROJECT_KEY) {
    console.error(chalk.red("  Jira not configured. Add JIRA_URL, JIRA_TOKEN, JIRA_EMAIL, JIRA_PROJECT_KEY to .env"));
    return null;
  }

  const severityToJiraPriority = {
    critical: "Highest",
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  const body = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      summary: ticket.title,
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: ticket.markdownContent }],
          },
          ...(ticket.videoPath
            ? [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: `Video recording: ${ticket.videoPath}` }],
                },
              ]
            : []),
        ],
      },
      issuetype: { name: "Bug" },
      priority: { name: severityToJiraPriority[ticket.severity] ?? "Medium" },
      labels: ["qa-agent", ticket.category, `session-${ticket.sessionId}`],
    },
  };

  try {
    const res = await fetch(`${JIRA_URL}/rest/api/3/issue`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString("base64")}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Jira API ${res.status}: ${err}`);
    }

    const data = await res.json();
    const issueUrl = `${JIRA_URL}/browse/${data.key}`;
    console.log(chalk.green(`  Jira ticket created: ${issueUrl}\n`));
    return data;
  } catch (err) {
    console.error(chalk.red(`  Jira push failed: ${err.message}\n`));
    return null;
  }
}