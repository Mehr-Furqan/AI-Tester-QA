#!/usr/bin/env node
// runner.js — Executes QA testing sessions

import { runAgent } from './agent.js';
import { randomBytes } from 'crypto';
import inquirer from 'inquirer';
import chalk from 'chalk';

function generateSessionId() {
  return randomBytes(4).toString('hex');
}

async function main() {
  const sessionId = generateSessionId();
  
  console.log(chalk.bold.cyan('\n🤖 QA Agent Runner\n'));
  
  // Prompt user for inputs
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Enter the test URL:',
      default: 'https://example.com',
      validate: (input) => {
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      },
    },
    {
      type: 'input',
      name: 'goal',
      message: 'Enter the testing goal:',
      default: 'Explore the app thoroughly and test all features',
    },
    {
      type: 'input',
      name: 'model',
      message: 'Enter the model to use:',
      default: 'qwen2.5:7b',
    },
  ]);

  const url = answers.url;
  const goal = answers.goal;
  const model = answers.model;

  try {
    const result = await runAgent({ url, goal, model, sessionId });
    console.log('\n✓ Session complete:', result);
    process.exit(0);
  } catch (error) {
    console.error('✗ Session failed:', error.message);
    process.exit(1);
  }
}

main();
