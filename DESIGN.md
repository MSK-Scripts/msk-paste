---
name: MSK Paste
description: A web tool of msk-scripts.de. The shop's design system, applied to a paste form and a code view.
colors:
  ground: "#f6f6f4"
  ground-dark: "#18191b"
  card: "#ffffff"
  card-dark: "#212225"
  tile: "#ededea"
  tile-dark: "#111214"
  text: "#1c1d1f"
  text-dark: "#ececea"
  muted-text: "#5a5d61"
  muted-text-dark: "#a7a9ad"
  msk-green: "#27762e"
  msk-green-dark: "#6dbb3d"
  band: "#26282b"
  band-green: "#7cc04b"
typography:
  display: "Archivo Variable, clamp(2.25rem, 1.2rem + 2.4vw, 5rem), 750"
  body: "Source Sans 3 Variable, clamp(1.0625rem, 0.9rem + 0.2vw, 1.25rem), line height 1.6"
---

# Design System: MSK Paste

How paste.msk-scripts.de looks and behaves. MSK Paste uses the design system of the MSK
Scripts shop (msk-scripts.de), the same one MSK Forms and MSK Shortener use. The values live in
[`app/globals.css`](app/globals.css); this file says what they are for.

## Principles

**"Paste, then read."** A visitor either pastes something and shares the link, or opens a
link and reads code. The form is the first thing on the home page; on a paste the code is.

- **Structure before looks.** A good-looking page is forgiven small faults, not large ones.
- **One accent.** Anthracite and white carry the page, MSK green marks the brand and what can
  be acted on.
- **Fewer boxes.** Groups come from spacing and hairlines. Cards are for the form, the code and
  figures.
- **Fluid, not stepped.** Type, spacing and columns grow with the window through `clamp()` up
  to UWQHD; components follow their container.
- **Both themes are equal.** Light is the default ground, dark is a palette of its own, the
  system setting decides (`next-themes`, `defaultTheme="system"`). Every pair is computed.
- **The CSP is a design constraint.** Scripts run under a nonce (`proxy.ts`). Fonts are local,
  code is highlighted on the server, charts are plain bars rendered on the server.

## Exclusion list

Binding for the whole site (decided for msk-scripts.de on 27.10.2026):

- Inter and JetBrains Mono, not even as a fallback.
- The GitHub dark palette, terminal mockups, `>_` icons, green monospace eyebrows with a dash.
- Lucide as the icon set; emoji as icons.
- Rows of three or four equal cards with icon, title and two lines of text.
- Em dashes in visible copy, in both languages.

## Colour

Source tokens are shadcn-style names holding HSL channels (`--primary: 125.3 50.3% 30.8%`),
light in `:root`, dark in `.dark`. `@theme inline` wraps them into utilities
(`bg-primary`, `text-muted-foreground`). Code names the utility, plain CSS writes
`hsl(var(--primary))`.

| Utility | Light | Dark | Role |
|---|---|---|---|
| `background` | `#f6f6f4` | `#18191b` | The ground of every page |
| `card` | `#ffffff` | `#212225` | Cards, the form, the code view, the header bar |
| `muted` | `#ededea` | `#111214` | The tile: hover, code chips |
| `foreground` | `#1c1d1f` | `#ececea` | Text |
| `muted-foreground` | `#5a5d61` | `#a7a9ad` | Secondary text, hints, placeholders |
| `border` | `#dcdcd8` | `#313337` | Hairlines, never text |
| `input` | `#84878b` | `#6d7075` | Field borders, outline buttons (3:1) |
| `primary`, `ring` | `#27762e` | `#6dbb3d` | MSK green: links, the primary fill, focus |
| `primary-hover`, `accent-soft` | derived | derived | Hovered fill; the soft surface of the current item |
| `success`, `warning`, `danger`, `info` | | | Status, always with a word and a sign |
| `band*` | anthracite | same | Page heads and the footer |
| `brand` | `#27762e` | same | The 4 px stripe above the header bar |
| `chart-1` to `chart-5` | | | Chart series |

[`src/test/contrast.test.ts`](src/test/contrast.test.ts) reads the tokens from `globals.css` and
recomputes every rendered pair in both themes (WCAG 2.2 AA: 4.5:1 text, 3:1 controls). Coverage
tests fail when a colour utility has no pair.

## Typography

Archivo (`font-display`) for headings and names, Source Sans 3 (`font-sans`) for everything else,
both variable and loaded locally through `@fontsource-variable` in `app/layout.tsx`. Short codes,
tokens and addresses use the system monospace (`font-mono`); monospace marks what a machine reads.

Sizes: `text-display`, `text-h2`, `text-h3`, `text-lead`, `text-body` (default), `text-small`,
`text-label`. Every maximum is at most 2.5 times its minimum (zoom to 200 %). Running text stays
under 65 characters per line. Figures use `tabular-nums`.

## Layout

- `container-page`: the shell of header, footer and wide pages (statistics), fluid up to UWQHD.
- `tool-column`: the narrower column of the form and the text pages; a paste uses the wider
  `container-page`.
- `--space-section` and `--space-stack` set the rhythm between and inside sections.
- No sideways scrolling down to 320 px; the header menu opens below the bar under 1280 px.

## Components

| Component | Use it for |
|---|---|
| `SiteFrame` | Header, the one `<main id="main">`, footer. Every page renders it. |
| `SiteHeader`, `HeaderBar` | The shop's header: green stripe, the tool's own pages, the shop's product lines with Web tools as the current one, the language. |
| `SiteFooter` | The shop's footer on the band: brand, appearance switch, product, ecosystem, legal. |
| `PageHead` | The head of a page on the band: kicker, heading, lead. `size="tool"` on the home page. |
| `Button` | Every button and button-styled link (`asChild`): `primary`, `outline`, `link`, `ghost`, `danger`, `band`, `band-outline`. |
| `ThemeSwitch` | System, light or dark as three toggle buttons. |
| `LanguagePicker` | A native select that posts to `/api/locale` and refreshes. |
| `PasteView` | A paste: title, meta row, actions, the code view with line numbers and wrapping. |
| `StatsCharts` | The most used languages as bars, each value also as text. |

Navigation lives in one table (`src/components/site/navigation.ts`), so the desktop bar and the
menu cannot drift apart. Shop addresses come from `src/lib/shopUrl.ts`.

## Code view

Shiki renders VS Code's Light+ and Dark+ into CSS variables (`defaultColor: false`,
`src/lib/highlight.ts`); `app/globals.css` (`.code-view`) picks the one of the current theme and
puts the code on our card. The few theme colours that miss 4.5:1 on the card are replaced along
their own hue (`CODE_COLOR_REPLACEMENTS`); [`src/test/code-contrast.test.ts`](src/test/code-contrast.test.ts)
checks every colour of both themes, so a Shiki update that changes one shows up there. Line numbers
are drawn by CSS and are not part of the text a visitor copies.

## Icons

Phosphor, regular weight, imported only from [`src/components/icons`](src/components/icons/index.tsx).
Icons are decorative by default (`aria-hidden`); an icon-only button carries its name on the
button. Brand marks (GitHub) are local SVG.

## Motion

Colour and border transitions of 150 ms on controls, 200 ms for fades and the theme colours.
`prefers-reduced-motion` cuts every animation to 0.01 ms.

## Accessibility

- A skip link to the one `<main id="main">`.
- Focus is a 3 px outline in `ring` with 2 px offset; on the band it turns to the band green.
- Targets are at least 44 px (`min-h-11`, `tap-target`).
- Native first: `<select>`, `<dialog>`, real buttons and links.
- Never colour alone: states carry a word and a sign, charts their figures.
- `prefers-contrast: more` raises muted text and lines; `forced-colors` gives controls a system
  border.

## Two languages

German and English (`messages/de.json`, `messages/en.json`, next-intl). Every visible string,
`aria-label` included, exists in both. The choice is the `NEXT_LOCALE` cookie; addresses carry no
language. The header and footer texts are the shop's and MSK Forms' wording.

## Adding a colour

Ask first whether an existing token fits. Otherwise add the source token in `:root` (and `.dark`
if it differs), the utility in `@theme inline`, every rendered pair to `PAIRS` in
`src/test/contrast.test.ts`, and a row to the table above.

## Adding an icon

Find it in Phosphor (regular), add it to the import and the export list in
`src/components/icons/index.tsx` in alphabetical order, and import it from `@/components/icons`.
