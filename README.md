# MSK Paste

> A privacy-friendly, self-hosted pastebin alternative — part of the
> [MSK Scripts](https://www.msk-scripts.de) ecosystem alongside
> [MSK Shortener](https://s.msk-scripts.de).

[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE.md)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-000000?logo=next.js)](https://nextjs.org)

**Live:** [paste.msk-scripts.de](https://paste.msk-scripts.de)

---

## ✨ Features

- 📝 **Plain-text pastes** with optional title (up to 1 MB)
- 🎨 **Syntax highlighting** for 30+ languages via [Shiki](https://shiki.style)
- ⏱️ **Expiration** — 10 min · 1 h · 1 d · 1 w · 1 mo · 1 y
- 🔥 **Burn after read** — paste self-destructs after the first view
- 🔒 **Password protection** with bcrypt (cost 12)
- 🔗 **Custom paste IDs** (`paste.msk-scripts.de/my-snippet`)
- 🛠️ **REST API** for CLI / scripting workflows
- 🌍 **Bilingual UI** (German / English) with cookie-based switching
- 📊 **Public stats page** — aggregate numbers only
- 🛡️ **Privacy by default** — no analytics, no GeoIP, IP addresses stored
  only as HMAC-SHA-256 hashes

## 🛡️ Privacy & Security

- **No tracking, no analytics, no third-party scripts** other than Google Fonts.
- **IPs are never stored.** Rate limiting uses HMAC-SHA-256(ip, secret).
- **Passwords** are stored as bcrypt hashes (cost 12) only.
- **Expired pastes are deleted**, not soft-deleted.
- **Cookies:** exactly one — `NEXT_LOCALE` for the language preference.

See [`/privacy`](https://paste.msk-scripts.de/privacy) for the full policy.

## 🚀 Tech stack

| Layer        | Choice                                  |
|--------------|-----------------------------------------|
| Framework    | Next.js 15 (App Router) + TypeScript    |
| Database     | MariaDB via `mysql2`                    |
| Styling      | Tailwind CSS + MSK design tokens        |
| Validation   | Zod 4                                   |
| i18n         | next-intl v4 (cookie-based, no prefix)  |
| Highlighting | Shiki (server-rendered)                 |
| Password     | bcryptjs                                |
| Charts       | Recharts                                |
| Hosting      | Debian + Apache2 reverse proxy + systemd|
| CI/CD        | GitHub Actions (SCP + SSH)              |

Deliberately **not** used: Prisma, Redis, any analytics, any auth provider.

## 🏃 Quick start (development)

```bash
# 1. Clone & install
git clone https://github.com/MSK-Scripts/msk-paste.git
cd msk-paste
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env: set DB credentials and IP_HASH_SECRET (openssl rand -hex 32)

# 3. Run migrations
npm run migrate

# 4. Start the dev server
npm run dev
# → http://localhost:3000
```

For a production deploy on Debian/Ubuntu use the install script:

```bash
curl -fsSL https://raw.githubusercontent.com/MSK-Scripts/msk-paste/main/deployment/scripts/install.sh | sudo bash
```

Details: [`deployment/README.md`](deployment/README.md).

## 📡 REST API

### `POST /api/pastes`

```bash
curl -X POST https://paste.msk-scripts.de/api/pastes \
  -H 'Content-Type: application/json' \
  -d '{
    "content":       "console.log(\"hello world\")",
    "title":         "My snippet",
    "language":      "javascript",
    "expiresIn":     "1w",
    "burnAfterRead": false
  }'
```

Response:

```json
{
  "pasteId":       "X7q9bA2k",
  "url":           "https://paste.msk-scripts.de/X7q9bA2k",
  "rawUrl":        "https://paste.msk-scripts.de/raw/X7q9bA2k",
  "deleteToken":   "dk_a7c4f2e1...",
  "expiresAt":     "2026-05-20T16:00:00.000Z",
  "hasPassword":   false,
  "burnAfterRead": false
}
```

| Method   | Path                          | Purpose                              |
|----------|-------------------------------|--------------------------------------|
| `POST`   | `/api/pastes`                 | Create a paste                       |
| `GET`    | `/api/pastes/:id`             | Fetch paste metadata + content       |
| `POST`   | `/api/pastes/:id/verify`      | Verify password, returns content     |
| `DELETE` | `/api/pastes/:id?token=…`     | Delete a paste with its delete token |
| `GET`    | `/api/stats`                  | Aggregate statistics                 |
| `POST`   | `/api/locale`                 | Set language cookie (`de` / `en`)    |

## 🛠️ Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm start            # Start production server on port 3012
npm run lint         # ESLint
npm run type-check   # TypeScript --noEmit
npm run migrate      # Apply DB migrations
npm run cleanup      # Delete expired pastes (run via cron)
```

## 📜 License

[AGPL-3.0-or-later](LICENSE.md) — if you fork or host MSK Paste publicly,
please share your source code under the same license.

## 🙋 Support / contact

Author: **Moritz Kohm — MSK Scripts**
Email: `moritz.kohm@gmail.com`
Website: [www.msk-scripts.de](https://www.msk-scripts.de)

Issues and feature requests → [GitHub Issues](https://github.com/MSK-Scripts/msk-paste/issues)
