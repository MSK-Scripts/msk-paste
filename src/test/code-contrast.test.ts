import { bundledThemes } from 'shiki'
import { describe, expect, it } from 'vitest'

import { CODE_COLOR_REPLACEMENTS, CODE_THEMES } from '../lib/highlight'
import { colorUtilities, resolveColor, sourceTokens } from './tokens'

/**
 * Every colour a code theme can paint text in reaches 4.5:1 on the card the
 * code sits on, after the replacements in src/lib/highlight.ts. The card
 * colours come from app/globals.css, the theme colours from Shiki itself, so
 * a Shiki update that changes a colour shows up here.
 */

function contrastRatio(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = (hex.slice(1, 7).match(/../g) ?? []).map((x) => {
      const c = parseInt(x, 16) / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!
  }
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

const tokens = sourceTokens()
const card = colorUtilities().card!

describe.each([
  ['light', CODE_THEMES.light, resolveColor(card, tokens.light)],
  ['dark', CODE_THEMES.dark, resolveColor(card, tokens.dark)],
] as const)('%s code theme on the card', (_mode, name, background) => {
  it('paints every token colour at 4.5:1 or more', async () => {
    const theme = (await bundledThemes[name]()).default
    const replace = CODE_COLOR_REPLACEMENTS[name] ?? {}
    const colors = new Set<string>()
    const base = theme.colors?.['editor.foreground']
    if (base) colors.add(base)
    for (const rule of theme.tokenColors ?? []) {
      const fg = rule.settings?.foreground
      if (fg) colors.add(fg)
    }
    const low = [...colors]
      .filter((c) => /^#[0-9a-fA-F]{6}/.test(c))
      .map((c) => replace[c.slice(0, 7).toLowerCase()] ?? c.slice(0, 7).toLowerCase())
      .filter((c) => contrastRatio(c, background) < 4.5)
    expect(low).toEqual([])
  })
})
