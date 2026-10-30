import { createHighlighter, type Highlighter } from 'shiki'
import { isSupportedLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from './languages'

// ─── Shiki Singleton ──────────────────────────────────────────────────
// Shiki ships every grammar/theme as a WASM bundle. Loading them all
// once at startup avoids a per-request cold start.

/**
 * VS Code's Light+ and Dark+, rendered into CSS variables
 * (`defaultColor: false`); app/globals.css picks the one of the current
 * theme and puts the code on our card instead of the theme's background.
 */
export const CODE_THEMES = { light: 'light-plus', dark: 'dark-plus' } as const

/**
 * The few colours of both themes that miss 4.5:1 on our card (#ffffff,
 * #212225), moved along their own hue until they reach it. Checked for every
 * colour of both themes in src/test/code-contrast.test.ts.
 */
export const CODE_COLOR_REPLACEMENTS: Record<string, Record<string, string>> = {
  [CODE_THEMES.light]: {
    '#d16969': '#b45a5a',
  },
  [CODE_THEMES.dark]: {
    '#000080': '#8585c2',
    '#646695': '#8688ac',
    '#f44747': '#f55050',
    '#808080': '#8a8a8a',
    '#d16969': '#d26c6c',
  },
}

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [CODE_THEMES.light, CODE_THEMES.dark],
      langs:  SUPPORTED_LANGUAGES.filter((l) => l !== 'plaintext') as string[],
    })
  }
  return highlighterPromise
}

/**
 * Renders code as syntax-highlighted HTML (server-side).
 * Falls back to plaintext if the language is unknown.
 */
export async function renderHighlightedHtml(code: string, language: string): Promise<string> {
  const highlighter = await getHighlighter()
  const lang: SupportedLanguage = isSupportedLanguage(language) ? language : 'plaintext'

  return highlighter.codeToHtml(code, {
    // Shiki's `text` grammar still wraps each line in a span, which is what
    // we want so the line-number CSS keeps working.
    lang:              lang === 'plaintext' ? 'text' : lang,
    themes:            CODE_THEMES,
    defaultColor:      false,
    colorReplacements: CODE_COLOR_REPLACEMENTS,
  })
}
