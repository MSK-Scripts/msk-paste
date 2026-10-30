# Development

## 🚀 Tech stack

| Layer        | Choice                                  |
|--------------|-----------------------------------------|
| Framework    | Next.js 16 (App Router) + TypeScript    |
| Database     | MariaDB via `mysql2`                    |
| Styling      | Tailwind CSS 4 + the tokens of msk-scripts.de ([DESIGN.md](../DESIGN.md)) |
| Fonts, icons | Archivo, Source Sans 3 (Fontsource, served locally), Phosphor |
| Themes       | Light, dark and system via next-themes  |
| Validation   | Zod 4                                   |
| i18n         | next-intl v4 (cookie-based, no prefix)  |
| Highlighting | Shiki 4, Light+ and Dark+, server-rendered |
| Password     | bcryptjs                                |
| Charts       | Plain bars rendered on the server       |
| Tests        | Vitest                                  |
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

Details: [`deployment/README.md`](../deployment/README.md).

## 🛠️ Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm start            # Start production server on port 3012
npm run lint         # ESLint
npm run type-check   # TypeScript --noEmit
npm run migrate      # Apply DB migrations
npm run cleanup      # Delete expired pastes (run via cron)
npm run api-key -- help   # Manage API keys (see below)
```
