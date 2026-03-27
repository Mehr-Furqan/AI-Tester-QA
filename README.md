# QA Agent 🤖

A local AI-powered QA testing agent that autonomously explores and tests web applications using **Ollama** (local LLM) and **Playwright** (browser automation).

## Features

- **Local AI Processing** — Runs entirely on your machine using Ollama (no external APIs)
- **Autonomous Testing** — AI intelligently explores apps, tests features, and detects bugs
- **Browser Recording** — Captures screenshots and videos of test sessions
- **Bug Ticket Generation** — Automatically creates bug reports with evidence
- **Session Management** — Tracks test runs with session IDs and detailed logs
- **Fast & Lightweight** — Minimal dependencies, runs quickly with configurable models

## Quick Start

### Prerequisites

- **Node.js** >= 20.0.0 ([download](https://nodejs.org/))
- **Ollama** ([download](https://ollama.ai/)) with a model installed
  - Default: `qwen2.5:7b` (lightweight, fast)
  - Alternatives: `llama2`, `mistral`, `neural-chat`

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/qa-agent.git
cd qa-agent

# Install dependencies
npm install

# Verify Ollama is running
npm run check
```

### First Run

1. **Start Ollama** (in another terminal):
   ```bash
   ollama serve
   ```

2. **Run the agent**:
   ```bash
   npm start
   ```

3. **Follow the prompts**:
   - Enter the URL to test
   - Enter the testing goal (e.g., "Test login and user profile features")
   - Select a model
   - Watch the browser as the AI explores your application

## Usage

### Basic Commands

```bash
# Interactive mode (recommended for first run)
npm start

# Test a specific URL
npm run test:url

# Check Ollama status
npm run check

# Run with custom parameters
node index.js --url https://example.com --goal "Test checkout flow" --model llama2
```

### CLI Options

| Option     | Description                           | Example                    |
|-----------|---------------------------------------|---------------------------|
| `--url`   | Target URL to test                    | `--url https://example.com` |
| `--goal`  | Testing objective/description         | `--goal "Test login flow"` |
| `--model` | Ollama model to use                   | `--model qwen2.5:7b`      |
| `--headless` | Run browser in headless mode         | `--headless`              |

## Configuration

Edit `config.json` to customize behavior:

```json
{
  "model": "qwen2.5:7b",           // Default Ollama model
  "defaultUrl": "",                 // Pre-filled URL (optional)
  "defaultGoal": "...",             // Default testing goal
  "maxSteps": 50,                   // Max AI actions per session
  "stepDelayMs": 1200,              // Delay between actions (ms)
  "viewport": { "width": 1280, "height": 800 },
  "keepSessionDays": 7              // Session retention period
}
```

## Project Structure

```
qa-agent/
├── index.js              # CLI entry point
├── agent.js              # Main QA agent loop
├── browser.js            # Playwright wrapper
├── ollama.js             # Ollama integration
├── capture.js            # Screenshot & video handling
├── ticket.js             # Bug report generation
├── runner.js             # Session runner
├── system.txt            # Default system prompt
├── config.json           # Configuration
├── package.json          # Dependencies
├── prompts/
│   ├── system.txt        # System prompt customization
│   └── qa-guidelines.txt # QA behavior guidelines
├── output/
│   ├── sessions/         # Session JSON logs
│   ├── tickets/          # Generated bug reports
│   ├── screenshots/      # Captured screenshots
│   └── videos/           # Session recordings
└── README.md             # This file
```

## How It Works

1. **Agent Loop**: The AI analyzes the current page state (screenshot + DOM structure)
2. **Decision Making**: Uses Ollama to decide what action to take next
3. **Action Execution**: Uses Playwright to interact with the page
4. **Bug Detection**: Identifies crashes, errors, and unexpected behavior
5. **Documentation**: Records findings with screenshots and creates bug tickets

### Example Output

After a test run, you'll find:
- `output/sessions/[id].json` — Complete session log with actions & results
- `output/tickets/[id]_bug1.md` — Markdown bug reports
- `output/screenshots/` — Visual evidence
- `output/videos/` — Full test session recording

## Models

The agent works with any Ollama model. Popular options:

| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| `qwen2.5:7b` | 5GB | Fast ⚡ | Good | Default |
| `mistral` | 5GB | Fast ⚡ | Very Good |
| `llama2` | 7GB | Medium | Good |
| `neural-chat` | 5GB | Fast ⚡ | Good |
| `qwen2.5:14b` | 9GB | Medium | Excellent |

Install with: `ollama pull qwen2.5:7b`

## Troubleshooting

### ❌ "Ollama is not running"
```bash
# In another terminal:
ollama serve
```

### ❌ "Model not found"
```bash
# Download the model:
ollama pull qwen2.5:7b
```

### ❌ Browser window won't open
- Check your system doesn't block Chromium launches
- Try: `node index.js --headless` for headless mode

### ❌ Slow test runs
- Reduce `maxSteps` in `config.json`
- Use a faster model: `ollama pull mistral`
- Increase `stepDelayMs` if actions are failing

## API Usage

Use the agent programmatically:

```javascript
import { runAgent } from "./agent.js";

await runAgent({
  url: "https://example.com",
  goal: "Test the checkout process",
  model: "qwen2.5:7b",
  sessionId: "custom-session-123"
});
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- How to report bugs
- Development setup
- Code standards
- Process for submitting pull requests

## License

MIT License — See LICENSE file for details

## Support

- 📖 [Ollama Documentation](https://ollama.ai)
- 🎭 [Playwright Documentation](https://playwright.dev)
- 💬 Open an issue on GitHub for questions

## Roadmap

- [ ] Support for more browsers (Firefox, Safari, Edge)
- [ ] Database of known bugs (avoid duplicates)
- [ ] Integration with issue tracking systems (Jira, GitHub Issues)
- [ ] Performance profiling mode
- [ ] Visual regression detection
- [ ] Mobile device emulation
- [ ] Multi-language support

---

**Made with ❤️ by the QA Agent community**
