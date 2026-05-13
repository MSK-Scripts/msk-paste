# Security Policy

## Supported versions

This project receives security updates on its `main` branch. Older
versions are not actively maintained.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security-related reports.**

Instead, please use one of the private channels below:

1. **Preferred:** [GitHub Security Advisories](https://github.com/MSK-Scripts/msk-paste/security/advisories/new)
2. **Email:** `moritz.kohm@gmail.com` (PGP available on request)

Include:

- A description of the vulnerability
- Steps to reproduce (proof-of-concept welcome)
- The affected version / commit SHA
- The impact you anticipate (data leak, code execution, …)

You will receive an acknowledgement within **72 hours**. The fix
timeline depends on severity but we aim for:

| Severity | Target fix     |
|----------|----------------|
| Critical | 7 days         |
| High     | 14 days        |
| Medium   | 30 days        |
| Low      | next release   |

Coordinated disclosure is appreciated.

## Defensive measures already in place

- All inputs validated with Zod (server-side).
- Passwords are stored as bcrypt hashes (cost 12).
- Content rendered via Shiki — HTML is escaped by the highlighter.
- Strict CSP, HSTS headers, no `X-Powered-By`.
- Rate limiting (10 paste creates per hour per IP hash).
- IP addresses stored as HMAC-SHA-256(ip, secret).
- `.env` permissions: `chmod 600`.
- Reserved paste IDs blocked at create time.
- Delete tokens are cryptographically random (32 bytes hex).

Thanks for keeping MSK Paste safe!
