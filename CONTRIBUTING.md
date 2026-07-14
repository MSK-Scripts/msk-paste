# Contributing to MSK Paste

Thanks for taking the time to contribute! MSK Paste is an open-source,
self-hosted pastebin alternative licensed under AGPL-3.0-or-later. Contributions
of all kinds are welcome: bug reports, feature ideas, documentation, and code.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By
participating, you are expected to uphold it. Please report unacceptable
behavior to `info@msk-scripts.de`.

## Ways to contribute

- **Report a bug** — open a [bug report](https://github.com/MSK-Scripts/msk-paste/issues/new?template=bug_report.md)
- **Request a feature** — open a [feature request](https://github.com/MSK-Scripts/msk-paste/issues/new?template=feature_request.md)
- **Report a security issue** — do NOT open a public issue. Follow
  [SECURITY.md](SECURITY.md) instead.
- **Improve docs or code** — send a pull request (see below)

## Development setup

You need Node.js 20+ and a running MariaDB instance.

```bash
git clone https://github.com/MSK-Scripts/msk-paste.git
cd msk-paste
cp .env.example .env
# set IP_HASH_SECRET = $(openssl rand -hex 32) and your DB credentials
npm install
npm run migrate
npm run dev   # http://localhost:3000
```

## Before you open a pull request

Please make sure all of the following pass locally:

```bash
npm run lint         # ESLint, 0 errors
npm run type-check   # TypeScript strict, 0 errors
npm run build        # production build succeeds
```

## Pull request guidelines

- **Keep changes focused.** One logical change per pull request is easier to
  review than a large mixed one.
- **Write in English.** All GitHub content (code comments, commit messages, PR
  titles and bodies) is in English so everyone can follow along.
- **Match the existing style.** TypeScript strict mode, no `any` unless clearly
  justified, server-side data fetching by default, all user-facing strings go
  through `next-intl`.
- **Update translations.** If you touch the UI, add keys to both
  `messages/de.json` and `messages/en.json`.
- **Describe your change.** Fill out the pull request template so reviewers know
  what changed and how you tested it.

## Commit messages

Use clear, present-tense commit messages that describe what the commit does, for
example `Add word-wrap toggle to paste view`. Reference related issues with
`Fixes #123` where applicable.

## Reporting security vulnerabilities

Security issues must not be reported through public issues or pull requests.
Please follow the process described in [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the
project's [AGPL-3.0-or-later](LICENSE.md) license.
