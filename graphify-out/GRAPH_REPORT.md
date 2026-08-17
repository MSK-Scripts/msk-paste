# Graph Report - .  (2026-08-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 343 nodes · 579 edges · 29 communities (19 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2ffdb912`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- paste.ts
- pastes/route.ts
- password/page.tsx
- compilerOptions
- index.ts
- Production Dependencies
- Database Migrations and Stats
- Development Dependencies
- Project Metadata
- config.ts
- Project Documentation
- install.sh
- npm Ecosystem
- Root Layout and Fonts
- ESLint Configuration
- Backup Scripts
- Next.js Configuration
- Update Scripts
- Funding Configuration
- Issue Template Configuration
- 001_create_pastes.sql
- tailwind.config.ts
- Bug Report Template
- Feature Request Template
- Mirror Workflow
- Release Workflow
- MSK Scripts Logo

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 20 edges
2. `getPasteRow()` - 14 edges
3. `isPasteExpired()` - 13 edges
4. `pasteHasPassword()` - 13 edges
5. `consumeView()` - 12 edges
6. `POST()` - 11 edges
7. `POST()` - 11 edges
8. `jsonError()` - 10 edges
9. `execute()` - 10 edges
10. `PastePage()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `MSK Paste UI Screenshot` --references--> `MSK Paste README`  [INFERRED]
  public/msk_paste.png → README.md
- `MSK Shortener UI Screenshot` --references--> `MSK Paste README`  [INFERRED]
  public/msk_shortener.png → README.md
- `StatsPage()` --calls--> `getGlobalStats()`  [EXTRACTED]
  app/stats/page.tsx → src/lib/stats.ts
- `PasswordPage()` --calls--> `getPasteRow()`  [EXTRACTED]
  app/[id]/password/page.tsx → src/lib/paste.ts
- `PasswordPage()` --calls--> `isPasteExpired()`  [EXTRACTED]
  app/[id]/password/page.tsx → src/lib/paste.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI/CD Pipeline** — github_workflows_codeql, github_workflows_dependency_review, github_workflows_eslint [EXTRACTED 1.00]
- **Project Governance & Contribution** — github_funding, github_pull_request_template, github_issue_template_bug_report, github_issue_template_feature_request, github_issue_template_config [INFERRED 0.90]

## Communities (29 total, 10 thin omitted)

### Community 0 - "paste.ts"
Cohesion: 0.13
Nodes (33): DELETE(), GET(), RouteContext, POST(), RouteContext, GET(), RouteContext, sanitizeFilename() (+25 more)

### Community 1 - "pastes/route.ts"
Cohesion: 0.09
Nodes (29): MAX_PASTE_SIZE_BYTES, POST(), buildPasteUrl(), buildRawUrl(), envInt(), createPaste(), generateUniquePasteId(), PasteError (+21 more)

### Community 2 - "password/page.tsx"
Cohesion: 0.10
Nodes (17): getOrigin(), PageProps, PasswordPage(), SECTIONS, dynamic, StatsPage(), Footer(), Header() (+9 more)

### Community 3 - "compilerOptions"
Cohesion: 0.06
Nodes (32): ./app/*, dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+24 more)

### Community 4 - "index.ts"
Cohesion: 0.11
Nodes (21): CopyButton(), CopyButtonProps, CreatePasteForm(), EXPIRES_IN_OPTIONS, DeletePasteButton(), DeletePasteButtonProps, PasswordPrompt(), PasswordPromptProps (+13 more)

### Community 5 - "Production Dependencies"
Cohesion: 0.08
Nodes (25): bcryptjs, dotenv, mysql2, nanoid, next, next-intl, dependencies, bcryptjs (+17 more)

### Community 6 - "Database Migrations and Stats"
Cohesion: 0.19
Nodes (18): GET(), main(), ensureMigrationsTable(), getExecutedMigrations(), main(), MIGRATIONS_DIR, IMPORTANT: dotenv MUST be loaded before anything else so that ENV variables, runMigration() (+10 more)

### Community 7 - "Development Dependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+13 more)

### Community 8 - "Project Metadata"
Cohesion: 0.10
Nodes (19): description, engines, node, license, name, overrides, eslint, postcss (+11 more)

### Community 9 - "config.ts"
Cohesion: 0.26
Nodes (10): POST(), LanguageSwitcher(), DEFAULT_LOCALE, isLocale(), Locale, LOCALE_COOKIE, LOCALE_FLAGS, LOCALE_LABELS (+2 more)

### Community 10 - "Project Documentation"
Cohesion: 0.22
Nodes (9): Code of Conduct, Contributing Guide, Deployment Guide, Deployment Workflow, GNU Affero General Public License v3, MSK Paste UI Screenshot, MSK Shortener UI Screenshot, MSK Paste README (+1 more)

### Community 11 - "install.sh"
Cohesion: 0.43
Nodes (7): DEBIAN_FRONTEND, log_err(), log_info(), log_ok(), log_step(), log_warn(), install.sh script

### Community 12 - "npm Ecosystem"
Cohesion: 0.29
Nodes (7): GitHub Actions Ecosystem, Dependabot Configuration, Pull Request Template, CodeQL Workflow, Dependency Review Workflow, ESLint Workflow, npm Ecosystem

### Community 13 - "Root Layout and Fonts"
Cohesion: 0.33
Nodes (4): inter, jetbrainsMono, metadata, viewport

### Community 14 - "ESLint Configuration"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 15 - "Backup Scripts"
Cohesion: 0.83
Nodes (3): log_err(), log_ok(), backup.sh script

### Community 16 - "Next.js Configuration"
Cohesion: 0.50
Nodes (3): csp, nextConfig, withNextIntl

## Knowledge Gaps
- **131 isolated node(s):** `PageProps`, `PageProps`, `RouteContext`, `RouteContext`, `MAX_PASTE_SIZE_BYTES` (+126 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Production Dependencies` to `Project Metadata`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Development Dependencies` to `Project Metadata`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `execute()` connect `Database Migrations and Stats` to `paste.ts`, `pastes/route.ts`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `PageProps`, `PageProps`, `RouteContext` to the rest of the system?**
  _131 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `paste.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12896405919661733 - nodes in this community are weakly interconnected._
- **Should `pastes/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09206349206349207 - nodes in this community are weakly interconnected._
- **Should `password/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0957983193277311 - nodes in this community are weakly interconnected._