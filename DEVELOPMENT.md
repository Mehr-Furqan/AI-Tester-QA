# Development Guide

Detailed development documentation for QA Agent contributors.

## Local Development Setup

### Step 1: Clone and Install

```bash
git clone https://github.com/yourusername/qa-agent.git
cd qa-agent
npm install
```

### Step 2: Start Ollama

In a separate terminal:
```bash
ollama serve
```

### Step 3: Download a Model

```bash
# Download the default model
ollama pull qwen2.5:7b

# Or download an alternative
ollama pull mistral
```

### Step 4: Verify Setup

```bash
npm run check
# Should output: ✓ Ollama running
```

## Development Workflow

### Running Tests Locally

```bash
# Run on a public test site
npm start
# Then enter: https://example.com

# Or run directly with options
node index.js --url https://httpbin.org/forms/post --goal "Test form submission"
```

### Debugging

#### 1. **Using console.log**

```javascript
// Add debug output
console.log(chalk.yellow("DEBUG:"), JSON.stringify(state, null, 2));
```

Run with:
```bash
NODE_DEBUG=* npm start 2>&1 | head -100
```

#### 2. **Using Node debugger**

```bash
node --inspect-brk index.js
```

Then open `chrome://inspect` in Chrome DevTools.

#### 3. **Check Session Logs**

After a run, inspect the session file:
```bash
cat output/sessions/[sessionId].json | jq .
```

### Modifying Core Logic

#### Adding a New Action Type

In `agent.js`, actions follow this pattern:

```javascript
// 1. Add to action list in decision prompt
case "type_text":
  await page.type(locator, text);
  break;

// 2. Handle execution
case "scroll":
  await page.evaluate(() => window.scrollBy(0, 300));
  break;
```

#### Adding a New Detection Feature

In `ticket.js`:

```javascript
function detectPerformanceIssue(pageState) {
  const metrics = pageState.metrics;
  if (metrics.loadTime > 3000) {
    return { type: "performance", severity: "medium" };
  }
  return null;
}
```

#### Customizing AI Behavior

Edit `prompts/system.txt` and `prompts/qa-guidelines.txt`:

```txt
You are a QA tester. Your behavior:
- Always test edge cases
- Check for accessibility violations
- Verify form validation
- Report any console errors
```

## Code Organization

### Adding a New Module

```javascript
// new-module.js
// Description of what this module does

/**
 * Brief description
 * @param {Object} options - Configuration
 * @returns {Promise<Result>} What it returns
 */
export async function doSomething(options) {
  // Implementation
}

export function helper() {
  // Used by main function
}
```

### Module Dependencies

```
index.js (entry)
  ↓
runner.js (orchestration)
  ↓
agent.js (main loop)
  ├→ browser.js (Playwright)
  ├→ ollama.js (AI model)
  ├→ capture.js (recording)
  └→ ticket.js (bug reports)
```

**Rule**: Modules should only depend on modules below them (prevent circular deps).

## Testing Different Models

```bash
# Fast & lightweight
node index.js --model qwen2.5:7b

# Better quality, slower
node index.js --model qwen2.5:14b

# Industry standard
node index.js --model llama2

# Very fast
node index.js --model mistral

# Coding-focused
node index.js --model neural-chat
```

Compare results in `output/tickets/` to see which works best.

## Performance Tuning

### Reduce Test Time

In `config.json`:
```json
{
  "maxSteps": 20,          // Reduce from 50
  "stepDelayMs": 500       // Reduce from 1200
}
```

### Improve Decision Quality

```json
{
  "maxSteps": 100,         // Increase from 50
  "stepDelayMs": 2000      // Increase from 1200
}
```

## Common Development Tasks

### 1. Add a New CLI Option

In `index.js`:

```javascript
const { values: args } = parseArgs({
  options: {
    url: { type: "string" },
    goal: { type: "string" },
    model: { type: "string" },
    timeout: { type: "string" },  // NEW
    // ...
  },
});
```

Then pass it through:
```javascript
await runAgent({
  url: args.url,
  goal: args.goal,
  model: args.model,
  timeout: parseInt(args.timeout) || 30000,  // NEW
});
```

### 2. Add Configuration Option

In `config.json`:
```json
{
  "model": "qwen2.5:7b",
  "apiTimeout": 30000,     // NEW
  "maxRetries": 3          // NEW
}
```

Load in code:
```javascript
const config = JSON.parse(readFileSync("./config.json", "utf-8"));
const timeout = config.apiTimeout || 30000;
```

### 3. Log Session Data

Sessions are saved as JSON in `output/sessions/`:

```javascript
// In agent.js
sessionLog.push({
  step: step,
  action: action,
  pageState: pageState,
  result: result,
  timestamp: new Date().toISOString()
});

// Save at end
fs.writeFileSync(
  `output/sessions/${sessionId}.json`,
  JSON.stringify(sessionLog, null, 2)
);
```

## Debugging Agent Decisions

### Check Why Agent Failed

1. Look at session log:
   ```bash
   cat output/sessions/[id].json | jq '.[0:5]'
   ```

2. Check screenshots:
   ```bash
   ls -la output/screenshots/
   ```

3. Look at any generated tickets:
   ```bash
   cat output/tickets/[id]_bug1.md
   ```

### Improve Decision Making

Add debug output to `agent.js`:

```javascript
console.log(chalk.cyan("Page state:"), {
  title: pageState.title,
  url: pageState.url,
  elementCount: pageState.elements.length
});

console.log(chalk.cyan("AI Decision:"), decision);
```

## Performance Testing

### Benchmark a Test Run

```bash
time node index.js --url https://example.com
```

### Profile Memory Usage

```bash
node --max-old-space-size=2048 index.js
```

## CI/CD Integration

For GitHub Actions, create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run check
```

## Releasing New Versions

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Create git tag: `git tag v1.2.3`
4. Push: `git push origin v1.2.3`
5. GitHub Actions auto-publishes

## Tips & Tricks

### Quick Test Different URLs

```bash
for url in https://example.com https://test.com; do
  node index.js --url $url --goal "Quick smoke test"
done
```

### Extract Bug Count from Session

```bash
cat output/sessions/[id].json | jq '[.[] | select(.bugDetected == true)] | length'
```

### View Session Summary

```bash
cat output/sessions/[id].json | jq '{
  steps: length,
  bugs: [.[] | select(.bugDetected == true)] | length,
  lastUrl: .[-1].pageState.url
}'
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Ollama Documentation](https://ollama.ai)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

## Getting Help

- Check existing issues on GitHub
- Ask in discussions
- Review past PRs for similar changes
- Open a draft PR for early feedback
