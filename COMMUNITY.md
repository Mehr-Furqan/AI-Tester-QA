<!-- This file is displayed on GitHub when users visit the repository -->

# Welcome to QA Agent! 👋

Thank you for your interest in contributing to the QA Agent project. This is a quick reference for getting started.

## 🚀 Quick Start for Contributors

### 1. **Read First**
- [README.md](README.md) — Project overview and usage
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines
- [DEVELOPMENT.md](DEVELOPMENT.md) — Technical setup for developing

### 2. **Set Up Locally**
```bash
git clone https://github.com/Mehr-Furqan/AI-Tester-QA.git
cd AI-Tester-QA
npm install
npm run check  # Verify Ollama is running
```

### 3. **Find Something to Work On**
- Check [Issues](https://github.com/Mehr-Furqan/AI-Tester-QA/issues) marked:
  - `good first issue` — Perfect for newcomers
  - `help wanted` — Need community assistance
  - `docs` — Documentation improvements

- Want to add a feature? Open an issue first to discuss!

### 4. **Make Your Changes**
- Create a feature branch: `git checkout -b feature/your-feature`
- Follow code standards in [DEVELOPMENT.md](DEVELOPMENT.md)
- Commit with clear messages: `git commit -m "feat: description"`
- Push: `git push origin feature/your-feature`
- Open a Pull Request with description

### 5. **Get Feedback**
- Maintainers will review your PR
- Make requested changes if any
- Once approved, it gets merged! 🎉

## 📚 Key Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | How to use the tool |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Developer guide & architecture |
| [CHANGELOG.md](CHANGELOG.md) | What's new in each release |
| [SECURITY.md](SECURITY.md) | Security guidelines |
| License | MIT — Use, modify, distribute freely |

## 🛠️ Common Tasks

### Report a Bug
Open an [issue](https://github.com/Mehr-Furqan/AI-Tester-QA/issues/new?template=bug_report.md) with:
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node version, OS, model)

### Suggest a Feature
Open an [issue](https://github.com/Mehr-Furqan/AI-Tester-QA/issues/new?template=feature_request.md) with:
- Use case / problem it solves
- Proposed solution
- Any alternatives considered

### Fix a Bug or Add a Feature
1. Create a branch: `git checkout -b fix/bug-name`
2. Make changes following [code standards](DEVELOPMENT.md)
3. Test thoroughly
4. Submit a [Pull Request](https://github.com/Mehr-Furqan/AI-Tester-QA/compare)

### Improve Documentation
1. Edit README.md, CONTRIBUTING.md, or DEVELOPMENT.md
2. Submit a PR with clear description
3. No code changes needed, but helps users a lot!

## 💡 Project Structure

```
qa-agent/
├── index.js              ← CLI entry point
├── agent.js              ← Main QA logic
├── browser.js            ← Playwright wrapper
├── ollama.js             ← AI model interface
├── capture.js            ← Screenshots/videos
├── ticket.js             ← Bug reports
├── README.md             ← Start here!
├── CONTRIBUTING.md       ← Before contributing
└── DEVELOPMENT.md        ← Developer details
```

## 🎯 Code Standards

- **JavaScript**: ES2022+, 2-space indentation
- **Naming**: `camelCase` for variables, `PascalCase` for classes
- **Comments**: Use JSDoc for functions
- **Files**: Keep under 300 lines when possible

Example:
```javascript
/**
 * Executes a browser action
 * @param {string} action - Action type
 * @param {Object} params - Action parameters
 * @returns {Promise<boolean>} Success status
 */
export async function executeAction(action, params) {
  // Implementation
}
```

## 🧪 Testing Before PR

```bash
# Verify Ollama is running
npm run check

# Test your changes
npm start

# Try different scenarios
node index.js --url https://example.com --goal "Test login"
node index.js --model mistral
```

## 📋 PR Checklist

Before submitting:
- [ ] Code follows style guidelines
- [ ] Changes are tested locally
- [ ] Comments/docs updated if needed
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages are clear
- [ ] Related issues referenced

## 🤝 Community Guidelines

- **Be respectful** — We welcome all experience levels
- **Be helpful** — Help others learn and grow
- **Be clear** — Use plain language in issues/PRs
- **Be patient** — Reviews take time, we're volunteers

## ❓ Need Help?

- **Setup issues?** Check [DEVELOPMENT.md](DEVELOPMENT.md) troubleshooting
- **How to contribute?** Read [CONTRIBUTING.md](CONTRIBUTING.md)
- **Usage questions?** See [README.md](README.md)
- **Still stuck?** Open an issue with your question

## 🎉 Recognition

Contributors are recognized through:
- GitHub contributors graph
- Commit history
- Release notes (for major contributions)
- Special thanks in documentation

## 📞 Contacts

- Questions? Open a [discussion](https://github.com/Mehr-Furqan/AI-Tester-QA/discussions)
- Bug found? Report an [issue](https://github.com/Mehr-Furqan/AI-Tester-QA/issues)
- Security issue? See [SECURITY.md](SECURITY.md)

---

**Thank you for contributing to QA Agent! 🚀**

We're excited to work with you. If you're new to open source, don't worry — we're here to help!
