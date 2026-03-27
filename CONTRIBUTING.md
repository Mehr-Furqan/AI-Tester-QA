# Contributing to QA Agent

Thank you for considering contributing! This document provides guidelines and instructions for collaborating on the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Report issues professionally

## How to Contribute

### 1. Report Bugs

Found a bug? Open an issue with:

- **Clear title**: "Agent crashes when testing login form"
- **Reproduction steps**: Exact steps to reproduce
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: 
  - Node version: `node --version`
  - Ollama version: `ollama --version`
  - Operating system
  - Model used

**Example issue:**
```
Title: Agent gets stuck in infinite loop on single-page apps

Steps to reproduce:
1. Run agent on https://example.com/spa
2. Set goal to "Test navigation"
3. Wait 20 seconds

Expected: Agent explores different routes
Actual: Agent clicks same button repeatedly

Environment:
- Node 20.10.0
- macOS 14.2
- Model: qwen2.5:7b
```

### 2. Suggest Features

Have an idea? Open an issue with label `enhancement`:

- **Use case**: Why is this useful?
- **Proposed implementation**: How would you solve it?
- **Alternatives**: Any other approaches?

**Example:**
```
Title: Add support for mobile device testing

Use case: Our tests need to cover mobile browsers

Proposed: Add viewport presets (mobile, tablet, desktop)
and emulate touch events using Playwright's mobile emulation.

This would help catch responsive design bugs.
```

### 3. Contribute Code

#### Prerequisites
- Fork the repository
- Clone your fork: `git clone https://github.com/yourname/qa-agent.git`
- Create a feature branch: `git checkout -b feature/your-feature-name`

#### Development Setup

```bash
# Install dependencies
npm install

# Verify everything works
npm run check
npm start
```

#### Code Standards

- **JavaScript**: ES2022+, use `import` statements
- **Formatting**: 2-space indentation
- **Naming**: 
  - Functions/variables: `camelCase`
  - Constants: `UPPER_CASE`
  - Classes: `PascalCase`
- **Comments**: JSDoc style for functions
  ```javascript
  /**
   * Launches browser and initializes page context
   * @param {Object} options - Configuration object
   * @param {boolean} options.record - Record video
   * @param {string} options.sessionId - Session identifier
   * @returns {Promise<Page>} Playwright page object
   */
  export async function launchBrowser({ record = true, sessionId }) {
    // ...
  }
  ```

#### File Organization

- Keep files focused and under 300 lines
- Use descriptive names matching functionality
- One main export per file when possible

```
src/
├── modules/          # Reusable modules
├── utils/            # Helper functions
└── config/           # Configuration
```

### 4. Make Changes

#### Step 1: Create a feature branch
```bash
git checkout -b feature/awesome-feature
```

#### Step 2: Make your changes
- Edit the relevant files
- Test thoroughly
- Add comments for complex logic

#### Step 3: Test locally
```bash
# Verify Ollama is running
npm run check

# Test your changes
npm start
```

#### Step 4: Commit with clear messages
```bash
git add .
git commit -m "feat: add mobile device viewport detection

- Extract viewport presets to config
- Add mobile/tablet/desktop emulation
- Update device selector prompt"
```

**Commit message format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style (no logic change)
- `refactor:` Code restructuring
- `test:` Adding tests
- `perf:` Performance improvements

#### Step 5: Push and create a Pull Request
```bash
git push origin feature/awesome-feature
```

Then open a PR on GitHub with:
- Clear title and description
- Reference any related issues (#123)
- Screenshot/video if UI changes
- Test results

## Pull Request Process

1. **Fork & Branch**: Create a feature branch from `main`
2. **Make Changes**: Follow code standards above
3. **Test**: Verify changes work locally
4. **Commit**: Use clear, descriptive messages
5. **Push**: Push to your fork
6. **PR**: Open PR with description
7. **Review**: Respond to review feedback
8. **Merge**: Maintainers will merge when approved

### PR Checklist

Before submitting, ensure:
- [ ] Code follows style guidelines
- [ ] Comments/docs are updated
- [ ] No console errors or warnings
- [ ] Tested in multiple scenarios
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages are clear
- [ ] Related issues are referenced

## Project Architecture

### Core Modules

| Module | Purpose |
|--------|---------|
| `index.js` | CLI entry point, argument parsing |
| `agent.js` | Main QA loop, decision logic |
| `browser.js` | Playwright wrapper, page interaction |
| `ollama.js` | Ollama API client, model management |
| `capture.js` | Screenshots, videos, session recording |
| `ticket.js` | Bug report generation |
| `runner.js` | Test session orchestration |

### Data Flow

```
User Input (CLI)
    ↓
index.js (parse args)
    ↓
runner.js (initialize session)
    ↓
agent.js (main loop)
    ├→ browser.js (get page state)
    ├→ ollama.js (get AI decision)
    ├→ browser.js (execute action)
    └→ capture.js (record results)
    ↓
output/ (sessions, tickets, screenshots)
```

## Testing Guide

### Manual Testing

```bash
# Test on different URLs
node index.js --url https://example.com

# Test with different models
node index.js --model mistral

# Test headless mode
node index.js --headless

# Test with custom goal
node index.js --goal "Test form validation"
```

### Test Checklist

Before submitting a PR with changes to:

**browser.js:**
- [ ] Page navigation works
- [ ] Screenshots capture correctly
- [ ] Video recording works
- [ ] Mouse/keyboard actions succeed

**ollama.js:**
- [ ] Model detection works
- [ ] Chat requests return valid JSON
- [ ] Error handling works
- [ ] Timeout handling works

**agent.js:**
- [ ] Agent completes without crashing
- [ ] Decision logic is sensible
- [ ] Bug detection identifies real issues
- [ ] Session logs are accurate

**capture.js:**
- [ ] Screenshots save with correct names
- [ ] Videos encode properly
- [ ] Session JSON is valid

## Performance Considerations

When contributing, consider:

- **Speed**: Minimize network requests, optimize loops
- **Memory**: Clean up resources, avoid circular refs
- **Reliability**: Add error handling, graceful failures
- **Scalability**: Design for future features

## Documentation

Help keep docs up to date:

- Update README.md for user-facing changes
- Update code comments for logic changes
- Add JSDoc for new functions
- Update CONTRIBUTING.md if process changes

## Release Process

Maintainers publish releases with:

1. Update version in `package.json`
2. Create git tag: `git tag v1.2.3`
3. Push tag: `git push origin v1.2.3`
4. GitHub Actions auto-publishes to npm

## Questions?

- Open a discussion on GitHub
- Ask in issues (label: `question`)
- Check existing docs first

## Recognition

Contributors are recognized in:
- GitHub contributors graph
- Commit history
- Release notes for major contributions

Thank you for contributing! 🎉
