<div align="center">

# MSK Paste

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-27762e.svg)](LICENSE.md)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)](https://www.typescriptlang.org)

**Self-hosted pastebin with syntax highlighting, expiry and password protection.**

</div>

MSK Paste shares code and text under a short link: highlighted on the server, with an expiry you
choose, an optional password or deletion after the first view, and a delete token instead of an
account. No tracking, no analytics.

It is part of the MSK Scripts ecosystem and runs at **[paste.msk-scripts.de](https://paste.msk-scripts.de)**.
You are welcome to use it there or to host your own instance.

## Quick start

```bash
git clone https://github.com/MSK-Scripts/msk-paste.git
cd msk-paste
npm install
cp .env.example .env   # database credentials and IP_HASH_SECRET
npm run migrate
npm run dev            # http://localhost:3000
```

## Documentation

| Topic | |
|---|---|
| [Features](docs/features.md) | What MSK Paste does |
| [Development](docs/development.md) | Tech stack, local setup, scripts |
| [REST API and API keys](docs/api.md) | Endpoints, examples, issuing keys on the server |
| [Security and privacy](docs/security-privacy.md) | What is stored, spam protection |
| [Design system](DESIGN.md) | Colours, type, layout, the code view |
| [Deployment guide](deployment/README.md) | Apache, MariaDB, systemd, CI/CD |
| [Contributing, support and license](docs/contributing-and-license.md) | Contact, the AGPL in short |

## Help and contributing

Questions and bugs go to the [issue tracker](https://github.com/MSK-Scripts/msk-paste/issues);
security issues as described in [SECURITY.md](SECURITY.md). Contributions are welcome: please open
an issue before larger changes, keep pull requests focused and read [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[GNU Affero General Public License v3.0 or later](LICENSE.md) © [MSK Scripts](https://msk-scripts.de).
If you fork MSK Paste or host it publicly, share your source code under the same license.
