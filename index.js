#!/usr/bin/env node
// index.js — CLI entry point
// Usage: node index.js [--url <url>] [--goal <goal>] [--model <model>]

import "dotenv/config";
import { parseArgs } from "util";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { isRunning, listModels } from "./ollama.js";
import { runAgent } from "./agent.js";
import { readFileSync } from "fs";

const config = JSON.parse(readFileSync("./config.json", "utf-8"));

// ─── Parse CLI args ────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    url: { type: "string" },
    goal: { type: "string" },
    model: { type: "string" },
    headless: { type: "boolean", default: false },
  },
  strict: false,
});

// ─── Startup banner ────────────────────────────────────────────────────────────

console.log(chalk.bold.cyan(`
  ██████╗  █████╗      █████╗  ██████╗ ███████╗███╗   ██╗████████╗
 ██╔═══██╗██╔══██╗    ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
 ██║   ██║███████║    ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
 ██║▄▄ ██║██╔══██║    ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
 ╚██████╔╝██║  ██║    ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   
  ╚══▀▀═╝ ╚═╝  ╚═╝    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   
`));
console.log(chalk.dim("  Local AI QA Agent — powered by Ollama + Playwright\n"));

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Check Ollama is running
  const spinner = ora("Checking Ollama...").start();
  const ollamaOk = await isRunning();
  if (!ollamaOk) {
    spinner.fail("Ollama is not running. Start it with: ollama serve");
    process.exit(1);
  }

  const models = await listModels();
  spinner.succeed(`Ollama running  (${models.length} model${models.length !== 1 ? "s" : ""} available)`);

  // 2. Pick model
  const defaultModel = args.model ?? config.model ?? "qwen2.5:7b";
  let selectedModel = defaultModel;

  if (models.length > 1 && !args.model) {
    const { model } = await inquirer.prompt([
      {
        type: "list",
        name: "model",
        message: "Which model?",
        choices: models,
        default: models.find((m) => m.includes(defaultModel)) ?? models[0],
      },
    ]);
    selectedModel = model;
  } else if (models.length === 0) {
    console.error(chalk.red("No models found. Run: ollama pull qwen2.5:7b"));
    process.exit(1);
  }

  console.log(chalk.dim(`  Model: ${selectedModel}\n`));

  // 3. Get target URL
  let targetUrl = args.url ?? config.defaultUrl;
  if (!targetUrl) {
    const { url } = await inquirer.prompt([
      {
        type: "input",
        name: "url",
        message: "Target URL to test:",
        validate: (v) => v.startsWith("http") || "Must start with http:// or https://",
      },
    ]);
    targetUrl = url;
  }

  // 4. Get test goal
  let testGoal = args.goal ?? config.defaultGoal;
  if (!testGoal) {
    const { goal } = await inquirer.prompt([
      {
        type: "input",
        name: "goal",
        message: "Test goal (or press Enter for default):",
        default: "Explore the app thoroughly as a new user. Test all main features, navigation, forms, and edge cases. Report any bugs.",
      },
    ]);
    testGoal = goal;
  }

  // 5. Run
  const sessionId = `session_${Date.now()}`;
  console.log();

  try {
    const result = await runAgent({
      url: targetUrl,
      goal: testGoal,
      model: selectedModel,
      sessionId,
    });

    // Summary
    console.log(chalk.bold.cyan("\n  Session complete"));
    console.log(chalk.dim(`  Steps run:   ${result.stepsRun}`));
    console.log(chalk.dim(`  Bugs found:  ${result.bugsFound.length}`));
    console.log(chalk.dim(`  Session log: output/sessions/${sessionId}.json`));

    if (result.bugsFound.length > 0) {
      console.log(chalk.bold("\n  Bug summary:"));
      result.bugsFound.forEach((b, i) => {
        const color = { critical: "red", high: "red", medium: "yellow", low: "dim" }[b.severity] ?? "white";
        console.log(chalk[color](`  ${i + 1}. [${b.severity}] ${b.title}`));
      });
    }

    console.log();
  } catch (err) {
    console.error(chalk.red(`\n  Fatal error: ${err.message}`));
    console.error(chalk.dim(err.stack));
    process.exit(1);
  }
}

main();