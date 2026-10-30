# Security and privacy

## 🛡️ Privacy & Security

- **No tracking, no analytics.** The only third-party script is Cloudflare Turnstile on the create page.
- **Spam protection:** Turnstile, a honeypot, a signed form timestamp, daily limits per address and
  content checks (encoded files, link spam, repeats). Scripts need an API key.
- **IPs are never stored.** Rate limiting uses HMAC-SHA-256(ip, secret).
- **Passwords** are stored as bcrypt hashes (cost 12) only.
- **Expired pastes are deleted**, not soft-deleted.
- **Cookies:** exactly one, `NEXT_LOCALE`, for the language preference.

See [`/privacy`](https://paste.msk-scripts.de/privacy) for the full policy.
