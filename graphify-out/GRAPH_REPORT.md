# Graph Report - msk-paste  (2026-08-17)

## Corpus Check
- Corpus is ~32,954 words - fits in a single context window. You may not need a graph.

## Summary
- 400 nodes · 662 edges · 27 communities (23 shown, 4 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.81)
- Token cost: 450,193 input · 0 output

## Community Hubs (Navigation)
- Repo Governance and CI
- Paste API Routes
- Interactive Paste Components
- App Pages and Metadata
- TypeScript Compiler Config
- Database Layer and Scripts
- Runtime Dependencies
- Paste Business Logic
- Dev Tooling Dependencies
- Package Manifest
- Locale and i18n
- Server Install Script
- Paste UI Screenshot
- Syntax Highlighting
- Root Layout and Fonts
- Shortener Reference UI
- ESLint Flat Config
- MSK Logo Branding
- Codeberg Mirror Workflow
- Backup Script
- Next Config and CSP
- Release Automation
- Update Script
- Pastes Table Migration
- Tailwind Config

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 20 edges
2. `getPasteRow()` - 14 edges
3. `MSK Paste (project)` - 14 edges
4. `isPasteExpired()` - 13 edges
5. `pasteHasPassword()` - 13 edges
6. `consumeView()` - 12 edges
7. `POST()` - 11 edges
8. `POST()` - 11 edges
9. `jsonError()` - 10 edges
10. `execute()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Burn After Read` --semantically_similar_to--> `Cleanup Cron (expired paste deletion)`  [INFERRED] [semantically similar]
  README.md → deployment/README.md
- `GitHub Sponsors Funding Config` --references--> `MSK Paste (project)`  [INFERRED]
  .github/FUNDING.yml → README.md
- `Deny GPL-2.0 / GPL-3.0 Dependencies` --conceptually_related_to--> `AGPL-3.0-or-later License`  [AMBIGUOUS]
  .github/workflows/dependency-review.yml → LICENSE.md
- `CodeQL Advanced Workflow` --conceptually_related_to--> `Defensive Measures in Place`  [INFERRED]
  .github/workflows/codeql.yml → SECURITY.md
- `PastePage()` --calls--> `renderHighlightedHtml()`  [EXTRACTED]
  app/[id]/page.tsx → src/lib/highlight.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Privacy-preserving paste lifecycle** — readme_privacy_by_default, readme_ip_hmac_hashing, readme_expiration_policy, readme_burn_after_read, deployment_readme_cleanup_cron [INFERRED 0.85]
- **CI security and quality gate suite** — _github_workflows_codeql_codeql_workflow, _github_workflows_eslint_eslint_workflow, _github_workflows_dependency_review_dependency_review_workflow, _github_dependabot_dependabot_config, contributing_pr_quality_gate [INFERRED 0.85]
- **Push-to-production pipeline** — _github_workflows_deploy_deploy_workflow, _github_workflows_deploy_scp_ssh_deploy, deployment_readme_github_secrets, deployment_readme_systemd_unit, deployment_readme_apache_reverse_proxy, deployment_readme_install_sh [EXTRACTED 1.00]

## Communities (27 total, 4 thin omitted)

### Community 0 - "Repo Governance and CI"
Cohesion: 0.06
Nodes (48): Dependabot Configuration, Group Minor and Patch Updates, Ignore Major Version Bumps, GitHub Sponsors Funding Config, Bug Report Template, Issue Template Config (blank issues disabled), Feature Request Template, Pull Request Template (+40 more)

### Community 1 - "Paste API Routes"
Cohesion: 0.12
Nodes (36): DELETE(), GET(), RouteContext, POST(), RouteContext, MAX_PASTE_SIZE_BYTES, POST(), GET() (+28 more)

### Community 2 - "Interactive Paste Components"
Cohesion: 0.08
Nodes (22): CopyButton(), CopyButtonProps, CreatePasteForm(), EXPIRES_IN_OPTIONS, DeletePasteButton(), DeletePasteButtonProps, PasswordPrompt(), PasswordPromptProps (+14 more)

### Community 3 - "App Pages and Metadata"
Cohesion: 0.09
Nodes (14): getOrigin(), PageProps, SECTIONS, dynamic, Footer(), Header(), HeaderProps, Logo() (+6 more)

### Community 4 - "TypeScript Compiler Config"
Cohesion: 0.06
Nodes (32): ./app/*, dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+24 more)

### Community 5 - "Database Layer and Scripts"
Cohesion: 0.16
Nodes (20): GET(), StatsPage(), main(), ensureMigrationsTable(), getExecutedMigrations(), main(), MIGRATIONS_DIR, IMPORTANT: dotenv MUST be loaded before anything else so that ENV variables (+12 more)

### Community 6 - "Runtime Dependencies"
Cohesion: 0.08
Nodes (25): bcryptjs, dotenv, mysql2, nanoid, next, next-intl, dependencies, bcryptjs (+17 more)

### Community 7 - "Paste Business Logic"
Cohesion: 0.12
Nodes (20): CreatedPaste, createPaste(), CreatePasteParams, generateUniquePasteId(), PasteError, isReservedId(), RESERVED_PASTE_IDS, CUSTOM_ID_MAX (+12 more)

### Community 8 - "Dev Tooling Dependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+13 more)

### Community 9 - "Package Manifest"
Cohesion: 0.10
Nodes (19): description, engines, node, license, name, overrides, eslint, postcss (+11 more)

### Community 10 - "Locale and i18n"
Cohesion: 0.21
Nodes (10): POST(), LanguageSwitcher(), DEFAULT_LOCALE, isLocale(), Locale, LOCALE_COOKIE, LOCALE_FLAGS, LOCALE_LABELS (+2 more)

### Community 11 - "Server Install Script"
Cohesion: 0.43
Nodes (7): DEBIAN_FRONTEND, log_err(), log_info(), log_ok(), log_step(), log_warn(), install.sh script

### Community 12 - "Paste UI Screenshot"
Cohesion: 0.36
Nodes (8): MSK Paste Wordmark and Tagline, Content Textarea With Byte Counter, Create Paste Form, MSK Dark Theme With Green Accent, MSK Paste Landing Page Screenshot, 1 MB Paste Size Limit (1048576 bytes), Syntax Highlighting Promise, Optional Title Field

### Community 13 - "Syntax Highlighting"
Cohesion: 0.43
Nodes (6): getHighlighter(), renderHighlightedHtml(), isSupportedLanguage(), LANGUAGE_EXTENSIONS, SUPPORTED_LANGUAGES, SupportedLanguage

### Community 14 - "Root Layout and Fonts"
Cohesion: 0.33
Nodes (4): inter, jetbrainsMono, metadata, viewport

### Community 15 - "Shortener Reference UI"
Cohesion: 0.53
Nodes (6): Hero Headline: 'Long URLs? Make them short.', MSK Dark Design Language (dark surface, green accent), Privacy Tagline: no cookies, no trackers, no signup, MSK Shortener as UI Reference Implementation for MSK Paste, MSK Shortener Landing Page Screenshot, Long URL Input Card with Placeholder

### Community 16 - "ESLint Flat Config"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 17 - "MSK Logo Branding"
Cohesion: 0.60
Nodes (5): Site Favicon / Header Logo Asset, Stylized Letter M Wordmark, MSK Brand Identity, MSK Green Accent Color, MSK Logo (public/logo.png)

### Community 18 - "Codeberg Mirror Workflow"
Cohesion: 0.50
Nodes (4): Mirror to Codeberg Workflow, Exact Mirror with --prune, origin/HEAD Deletion Before Push, Codeberg Config Stored as Secrets, not Variables

### Community 19 - "Backup Script"
Cohesion: 0.83
Nodes (3): log_err(), log_ok(), backup.sh script

### Community 20 - "Next Config and CSP"
Cohesion: 0.50
Nodes (3): csp, nextConfig, withNextIntl

## Ambiguous Edges - Review These
- `AGPL-3.0-or-later License` → `Deny GPL-2.0 / GPL-3.0 Dependencies`  [AMBIGUOUS]
  .github/workflows/dependency-review.yml · relation: conceptually_related_to

## Knowledge Gaps
- **125 isolated node(s):** `PageProps`, `PageProps`, `RouteContext`, `RouteContext`, `MAX_PASTE_SIZE_BYTES` (+120 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `AGPL-3.0-or-later License` and `Deny GPL-2.0 / GPL-3.0 Dependencies`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `Runtime Dependencies` to `Package Manifest`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Tooling Dependencies` to `Package Manifest`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `execute()` connect `Database Layer and Scripts` to `Paste API Routes`, `Paste Business Logic`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `PageProps`, `PageProps`, `RouteContext` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Repo Governance and CI` be split into smaller, more focused modules?**
  _Cohesion score 0.05585106382978723 - nodes in this community are weakly interconnected._
- **Should `Paste API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.11818181818181818 - nodes in this community are weakly interconnected._