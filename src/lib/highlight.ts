import {
  createHighlighter,
  type Highlighter,
} from 'shiki'
import { isSupportedLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from './languages'

// ─── Shiki Singleton ──────────────────────────────────────────────────
// Shiki ships every grammar/theme as a WASM bundle. Loading them all
// once at startup avoids a per-request cold start.

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark-dimmed'],
      langs:  SUPPORTED_LANGUAGES.filter((l) => l !== 'plaintext') as string[],
    })
  }
  return highlighterPromise
}

/**
 * Renders code as syntax-highlighted HTML (server-side).
 * Falls back to plaintext if the language is unknown.
 */
export async function renderHighlightedHtml(
  code:     string,
  language: string
): Promise<string> {
  const highlighter = await getHighlighter()
  const lang: SupportedLanguage = isSupportedLanguage(language) ? language : 'plaintext'

  if (lang === 'plaintext') {
    // Shiki's `text` grammar still wraps each line in a span, which is what
    // we want so the line-number CSS keeps working.
    return highlighter.codeToHtml(code, {
      lang:  'text',
      theme: 'github-dark-dimmed',
    })
  }

  return highlighter.codeToHtml(code, {
    lang,
    theme: 'github-dark-dimmed',
  })
}
