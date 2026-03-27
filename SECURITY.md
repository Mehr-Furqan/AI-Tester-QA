# Security Policy

## Reporting a Security Vulnerability

Please **do NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email security details to the maintainers or open a private security advisory on GitHub:

1. Go to the repository
2. Click "Security" tab
3. Click "Report a vulnerability"
4. Describe the issue privately

## Security Guidelines for Contributors

When contributing code, please ensure:

### 1. No Sensitive Data
- ❌ Never commit API keys, passwords, or tokens
- ❌ Never hardcode credentials
- ✅ Use environment variables (`.env` file)
- ✅ Use `.gitignore` to exclude sensitive files

### 2. Dependency Security
- Run `npm audit` before committing
- Update vulnerable packages
- Report to maintainers if found

### 3. User Input Handling
- Validate URLs before navigation
- Sanitize any user-provided text
- Escape special characters appropriately

### 4. Browser Automation Safety
- Respect website terms of service
- Don't overload servers with rapid requests
- Use reasonable delays between actions
- Respect `robots.txt` and rate limits

## Known Security Considerations

- This tool runs local AI models (no external data sent)
- Playwright runs a real browser (can visit any website)
- Browser may download files/data from tested websites
- Session logs contain page state/URLs/actions
- No encryption on stored session data

## Recommendations for Users

1. **Only test websites you own or have permission to test**
2. **Run on a separate development machine, not production**
3. **Don't test with sensitive URLs containing auth tokens**
4. **Clear output directory periodically** (contains screenshots)
5. **Keep Node.js and dependencies updated**
6. **Use strong passwords for any accounts accessed**

## Supported Versions

We will provide security patches for:
- Current version
- Previous minor version (e.g., if 1.2.0 is current, we patch 1.1.x)

## Vulnerability Disclosure

When a security issue is reported:

1. Maintainers will acknowledge within 48 hours
2. We'll work on a fix privately
3. A patch release will be prepared
4. Security advisory will be published
5. Reporters will be credited (unless anonymity requested)

Thank you for helping keep this project secure!
