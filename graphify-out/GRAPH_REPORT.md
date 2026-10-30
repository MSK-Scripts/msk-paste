# Graph Report - msk-paste  (2026-10-30)

## Corpus Check
- 102 files · ~47,596 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 641 nodes · 1125 edges · 40 communities (26 shown, 11 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fd43f2b5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- MSK Paste (project)
- [id]/page.tsx
- PasteResult.tsx
- index.tsx
- compilerOptions
- api-key.ts
- dependencies
- paste.ts
- devDependencies
- spamGuard.ts
- HeaderBar.tsx
- Server Install Script
- MSK Paste Landing Page Screenshot
- backup.sh
- layout.tsx
- MSK Shortener Landing Page Screenshot
- MSK Logo (public/logo.png)
- Mirror to Codeberg Workflow
- tokens.ts
- next.config.ts
- Auto Release Workflow
- update.sh
- 001_create_pastes.sql
- Design System: MSK Paste
- postcss.config.mjs
- msk-cron.sh
- CreatePasteForm.tsx
- PasteView.tsx
- ThemeSwitch.tsx
- REST API and API keys
- DeletePasteButton.tsx
- CreatePasteForm
- Features
- Security and privacy
- proxy.ts
- 003_api_keys.sql
- api-key.sh script

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 20 edges
2. `execute()` - 16 edges
3. `guardCreate()` - 16 edges
4. `POST()` - 14 edges
5. `getPasteRow()` - 14 edges
6. `Design System: MSK Paste` - 14 edges
7. `MSK Paste (project)` - 14 edges
8. `isPasteExpired()` - 13 edges
9. `pasteHasPassword()` - 13 edges
10. `cn()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Burn After Read` --semantically_similar_to--> `Cleanup Cron (expired paste deletion)`  [INFERRED] [semantically similar]
  README.md → deployment/README.md
- `CodeQL Advanced Workflow` --conceptually_related_to--> `Defensive Measures in Place`  [INFERRED]
  .github/workflows/codeql.yml → SECURITY.md
- `GitHub Sponsors Funding Config` --references--> `MSK Paste (project)`  [INFERRED]
  .github/FUNDING.yml → README.md
- `Deny GPL-2.0 / GPL-3.0 Dependencies` --conceptually_related_to--> `AGPL-3.0-or-later License`  [AMBIGUOUS]
  .github/workflows/dependency-review.yml → LICENSE.md
- `POST()` --calls--> `isLocale()`  [EXTRACTED]
  app/api/locale/route.ts → src/i18n/config.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Push-to-production pipeline** — _github_workflows_deploy_deploy_workflow, _github_workflows_deploy_scp_ssh_deploy, deployment_readme_github_secrets, deployment_readme_systemd_unit, deployment_readme_apache_reverse_proxy, deployment_readme_install_sh [EXTRACTED 1.00]
- **CI security and quality gate suite** — _github_workflows_codeql_codeql_workflow, _github_workflows_eslint_eslint_workflow, _github_workflows_dependency_review_dependency_review_workflow, _github_dependabot_dependabot_config, contributing_pr_quality_gate [INFERRED 0.85]
- **Privacy-preserving paste lifecycle** — readme_privacy_by_default, readme_ip_hmac_hashing, readme_expiration_policy, readme_burn_after_read, deployment_readme_cleanup_cron [INFERRED 0.85]

## Communities (40 total, 11 thin omitted)

### Community 0 - "MSK Paste (project)"
Cohesion: 0.05
Nodes (51): Dependabot Configuration, Group Minor and Patch Updates, Ignore Major Version Bumps, GitHub Sponsors Funding Config, Bug Report Template, Issue Template Config (blank issues disabled), Feature Request Template, Pull Request Template (+43 more)

### Community 1 - "[id]/page.tsx"
Cohesion: 0.11
Nodes (32): DELETE(), GET(), RouteContext, POST(), RouteContext, GET(), RouteContext, sanitizeFilename() (+24 more)

### Community 2 - "PasteResult.tsx"
Cohesion: 0.22
Nodes (7): CopyButton(), CopyButtonProps, Copy, FieldProps, PasteResult(), PasteResultProps, CreatePasteResponse

### Community 3 - "index.tsx"
Cohesion: 0.15
Nodes (13): Clock, DeviceMobile, Fire, LinkSimple, Plus, QrCode, ShieldCheck, SmileySad (+5 more)

### Community 4 - "compilerOptions"
Cohesion: 0.06
Nodes (33): ./app/*, dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+25 more)

### Community 5 - "api-key.ts"
Cohesion: 0.10
Nodes (37): GET(), dynamic, StatsPage(), create(), fail(), findKeys(), findOne(), formatDate() (+29 more)

### Community 6 - "dependencies"
Cohesion: 0.05
Nodes (39): bcryptjs, class-variance-authority, clsx, dotenv, @fontsource-variable/archivo, @fontsource-variable/source-sans-3, mysql2, nanoid (+31 more)

### Community 7 - "paste.ts"
Cohesion: 0.08
Nodes (39): MAX_PASTE_SIZE_BYTES, POST(), buildPasteUrl(), buildRawUrl(), jsonError(), parseJsonBody(), zodToApiError(), bearerKey() (+31 more)

### Community 8 - "devDependencies"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, description, devDependencies, eslint, eslint-config-next, postcss, tailwindcss (+35 more)

### Community 9 - "spamGuard.ts"
Cohesion: 0.07
Nodes (41): dynamic, FACTS, HomePage(), ChartBar, checkFormStamp(), issueFormStamp(), MAX_FORM_AGE_MS, MIN_FILL_MS (+33 more)

### Community 10 - "HeaderBar.tsx"
Cohesion: 0.06
Nodes (46): POST(), SECTIONS, GithubMark(), ArrowSquareOut, CaretDown, Globe, List, X (+38 more)

### Community 11 - "Server Install Script"
Cohesion: 0.43
Nodes (7): DEBIAN_FRONTEND, log_err(), log_info(), log_ok(), log_step(), log_warn(), install.sh script

### Community 12 - "MSK Paste Landing Page Screenshot"
Cohesion: 0.36
Nodes (8): MSK Paste Wordmark and Tagline, Content Textarea With Byte Counter, Create Paste Form, MSK Dark Theme With Green Accent, MSK Paste Landing Page Screenshot, 1 MB Paste Size Limit (1048576 bytes), Syntax Highlighting Promise, Optional Title Field

### Community 13 - "backup.sh"
Cohesion: 0.60
Nodes (3): log_err(), log_ok(), backup.sh script

### Community 14 - "layout.tsx"
Cohesion: 0.40
Nodes (3): metadata, viewport, ThemeProvider()

### Community 15 - "MSK Shortener Landing Page Screenshot"
Cohesion: 0.53
Nodes (6): Hero Headline: 'Long URLs? Make them short.', MSK Dark Design Language (dark surface, green accent), Privacy Tagline: no cookies, no trackers, no signup, MSK Shortener as UI Reference Implementation for MSK Paste, MSK Shortener Landing Page Screenshot, Long URL Input Card with Placeholder

### Community 17 - "MSK Logo (public/logo.png)"
Cohesion: 0.60
Nodes (5): Site Favicon / Header Logo Asset, Stylized Letter M Wordmark, MSK Brand Identity, MSK Green Accent Color, MSK Logo (public/logo.png)

### Community 18 - "Mirror to Codeberg Workflow"
Cohesion: 0.50
Nodes (4): Mirror to Codeberg Workflow, Exact Mirror with --prune, origin/HEAD Deletion Before Push, Codeberg Config Stored as Secrets, not Variables

### Community 19 - "tokens.ts"
Cohesion: 0.10
Nodes (28): CODE_COLOR_REPLACEMENTS, CODE_THEMES, tokens, NO_PAIR, Pair, PAIRS, Ref, resolve() (+20 more)

### Community 24 - "Design System: MSK Paste"
Cohesion: 0.10
Nodes (18): Accessibility, Adding a colour, Adding an icon, Code view, Colour, Components, Design System: MSK Paste, Exclusion list (+10 more)

### Community 28 - "CreatePasteForm.tsx"
Cohesion: 0.17
Nodes (10): EXPIRES_IN_OPTIONS, GUARD_MESSAGES, RENEW_CAPTCHA, ArrowRight, CaretRight, CircleNotch, TurnstileApi, TurnstileWidget() (+2 more)

### Community 29 - "PasteView.tsx"
Cohesion: 0.23
Nodes (9): DownloadSimple, Eye, EyeSlash, LockSimple, PasswordPromptProps, VerifyResponse, PasteView(), PasteViewProps (+1 more)

### Community 30 - "ThemeSwitch.tsx"
Cohesion: 0.32
Nodes (7): Monitor, Moon, Sun, noSubscription(), ThemeSwitch(), ThemeSwitchLabels, useHydrated()

### Community 31 - "REST API and API keys"
Cohesion: 0.40
Nodes (4): 🔑 API keys, `POST /api/pastes`, 📡 REST API, REST API and API keys

### Community 32 - "DeletePasteButton.tsx"
Cohesion: 0.40
Nodes (3): DeletePasteButton(), DeletePasteButtonProps, Check

### Community 33 - "CreatePasteForm"
Cohesion: 0.83
Nodes (4): CreatePasteForm(), handleReset(), handleSubmit(), renewCaptcha()

## Ambiguous Edges - Review These
- `AGPL-3.0-or-later License` → `Deny GPL-2.0 / GPL-3.0 Dependencies`  [AMBIGUOUS]
  .github/workflows/dependency-review.yml · relation: conceptually_related_to

## Knowledge Gaps
- **193 isolated node(s):** `PageProps`, `PageProps`, `RouteContext`, `RouteContext`, `MAX_PASTE_SIZE_BYTES` (+188 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 246 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `AGPL-3.0-or-later License` and `Deny GPL-2.0 / GPL-3.0 Dependencies`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `execute()` connect `api-key.ts` to `[id]/page.tsx`, `paste.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `SiteFrame()` connect `HeaderBar.tsx` to `[id]/page.tsx`, `api-key.ts`, `spamGuard.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `PageProps`, `PageProps`, `RouteContext` to the rest of the system?**
  _193 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MSK Paste (project)` be split into smaller, more focused modules?**
  _Cohesion score 0.05052790346907994 - nodes in this community are weakly interconnected._
- **Should `[id]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11205073995771671 - nodes in this community are weakly interconnected._