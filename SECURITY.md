# Security Policy

## Supported Versions

Use this table to learn which versions of Terminal Launcher receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability in Terminal Launcher, please report it to us.

### How to Report

**DO NOT create a public issue for security reports!**

Instead:

1. Send an email to: **[security@yourdomain.com]** (replace with your contact)
2. Use subject: `[SECURITY] Terminal Launcher - [brief description]`
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Possible fixes (if any)

### What to Expect

- **Acknowledgment**: We will respond within 48 hours
- **Updates**: We will keep you informed of progress
- **Disclosure**: We will coordinate public disclosure after fix

### Process

1. You report the vulnerability
2. We acknowledge and assess impact
3. We develop a fix
4. We release a patch
5. We publish a security advisory
6. Public disclosure (with your consent)

## Security Best Practices for Users

### Updates

- Always use the latest version of Terminal Launcher
- Enable automatic updates if available
- Check the Releases page regularly

### Workspaces

- Do not commit sensitive data to `.terminal-manager/`
- Use `.gitignore` to exclude secrets
- Be cautious when importing sessions from untrusted sources

### Commands

- Review commands before execution
- Do not run commands from untrusted sources
- Use working directory restrictions when possible

## Known Security Considerations

### Electron Security

Terminal Launcher is built on Electron. We follow best practices:

- ✅ Content Security Policy (CSP) implemented
- ✅ Context isolation enabled
- ✅ Node integration disabled in renderer
- ✅ Remote module disabled
- ✅ WebSecurity enabled

### File System Access

The application has file system access through:

- Reading/writing terminal logs
- Saving sessions and settings
- Importing/exporting commands

We minimize risks through:

- Workspace isolation
- Path validation
- User confirmation for dangerous operations

## Security Updates

Security updates will be released as:

- **Patch releases**: for critical vulnerabilities
- **Minor releases**: for significant security improvements
- **Security advisories**: published on GitHub

Subscribe to releases to receive notifications.

## Contact

For security questions or concerns:

- Email: security@yourdomain.com
- GitHub Security Advisories: [Enable in repository settings](https://github.com/IgorPushechnikov/terminal-launcher/security/advisories)

## Acknowledgments

We appreciate responsible disclosure and will acknowledge contributors who help improve our security (with permission).

---

**Last updated**: April 2026
