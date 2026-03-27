# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-03-27

### Added
- Initial release of QA Agent
- Autonomous testing with local Ollama models
- Browser automation with Playwright
- Automatic bug detection and ticket generation
- Session recording (video + screenshots)
- Support for multiple Ollama models
- CLI with interactive and direct modes
- Configuration file customization
- QA guidelines system prompt

### Features
- AI-driven exploration of web applications
- Intelligent action sequencing
- Error and crash detection
- Screenshot capture for evidence
- Video recording of full sessions
- Markdown bug report generation
- Session logging with detailed traces

---

## [Unreleased]

### Planned
- [ ] Multi-browser support (Firefox, Safari, Edge)
- [ ] Database of known bugs
- [ ] Jira/GitHub Issues integration
- [ ] Performance profiling mode
- [ ] Visual regression testing
- [ ] Mobile device emulation
- [ ] Multi-language testing support
- [ ] Parallel test sessions
- [ ] Custom hook system for plugins

---

## How to Update This File

When making changes, please add an entry under [Unreleased] in the appropriate section:

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Now removed features

### Fixed
- Any bug fixes

### Security
- Any security fixes

Example:
```markdown
## [Unreleased]

### Added
- Support for Firefox browser
- API endpoint documentation

### Fixed
- Agent crash on empty pages
```

Then when releasing, create a new section with the version and date.
