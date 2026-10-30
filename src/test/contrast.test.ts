import { describe, expect, it } from 'vitest'

import { CHANNELS, colorUtilities, over, resolveColor, sourceTokens } from './tokens'

/**
 * Contrast of the design tokens against WCAG 2.2 AA, in both themes.
 *
 * The tokens come straight from app/globals.css (src/test/tokens.ts),
 * including the hover fill and the soft surface mixed from `--primary` in
 * oklab. Every pair is a combination that is rendered: text (4.5:1) or a
 * control border, focus ring or sign (3:1) on the surface it sits on.
 *
 * The coverage tests make sure no colour utility is left without a pair and
 * no source token without a utility, so a new colour cannot ship untested.
 */

type Ref = string | { over: [color: Ref, surface: Ref, opacity: number] }
type Pair = [label: string, fg: Ref, bg: Ref, need: number]

const tint = (color: string, surface: string, opacity: number): Ref => ({ over: [color, surface, opacity] })

const STATUS = ['success', 'warning', 'danger', 'info'] as const

const PAIRS: Pair[] = [
  ['Text on the ground', 'foreground', 'background', 4.5],
  ['Text on the tile', 'foreground', 'muted', 4.5],
  ['Text on a card', 'card-foreground', 'card', 4.5],
  ['Muted text on the ground', 'muted-foreground', 'background', 4.5],
  ['Muted text on the tile', 'muted-foreground', 'muted', 4.5],
  ['Muted text on a card', 'muted-foreground', 'card', 4.5],

  // MSK green: fill with its label, and green text on every surface.
  ['Label on the primary fill', 'primary-foreground', 'primary', 4.5],
  ['Label on the primary hover fill', 'primary-foreground', 'primary-hover', 4.5],
  ['Green text on the ground', 'primary', 'background', 4.5],
  ['Green text on the tile', 'primary', 'muted', 4.5],
  ['Green text on a card', 'primary', 'card', 4.5],
  ['Hovered green link on the ground', 'primary-hover', 'background', 4.5],
  ['Hovered green link on a card', 'primary-hover', 'card', 4.5],

  // Soft green surface: the current nav item, the highlighted figure.
  ['Text on the soft green surface', 'foreground', 'accent-soft', 4.5],
  ['Muted text on the soft green surface', 'muted-foreground', 'accent-soft', 4.5],
  ['Green text on the soft green surface', 'primary', 'accent-soft', 4.5],

  // Anthracite band (page heads, footer).
  ['Text in the anthracite band', 'band-foreground', 'band', 4.5],
  ['Muted text in the anthracite band', 'band-muted', 'band', 4.5],
  ['Green text in the anthracite band', 'band-accent', 'band', 4.5],
  ['Label on green in the band', 'band-accent-foreground', 'band-accent', 4.5],

  // Controls (WCAG 1.4.11): field borders and the focus ring.
  ['Form control border on a card', 'input', 'card', 3],
  ['Form control border on the ground', 'input', 'background', 3],
  ['Focus ring on the ground', 'ring', 'background', 3],
  ['Focus ring on a card', 'ring', 'card', 3],

  // Status colours as text and sign, also on their own tint (the error box
  // uses 8 %, 10 % is the stricter case).
  ...STATUS.flatMap((s): Pair[] => [
    [`Status ${s} on the ground`, s, 'background', 4.5],
    [`Status ${s} on a card`, s, 'card', 4.5],
    [`Status ${s} on its tint over a card`, s, tint(s, 'card', 0.1), 4.5],
  ]),
  ['Label on the danger button', 'danger-foreground', 'danger', 4.5],

  // Chart series on a card and the tile.
  ...[1, 2, 3, 4, 5].flatMap((n): Pair[] => [
    [`Chart ${n} on a card`, `chart-${n}`, 'card', 3],
    [`Chart ${n} on the tile`, `chart-${n}`, 'muted', 3],
  ]),
]

/**
 * Utilities without a pair: hairlines that never carry or sit under text,
 * and the 4 px brand stripe above the header bar, which is decoration and
 * neither a control nor information (WCAG 1.4.11 does not apply to it).
 */
const NO_PAIR = ['border', 'band-line', 'brand']

const utilities = colorUtilities()
const tokens = sourceTokens()

/** WCAG 2 contrast ratio of two `#rrggbb` colours. */
function contrastRatio(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = (hex.slice(1).match(/../g) ?? []).map((x) => {
      const c = parseInt(x, 16) / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!
  }
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

function resolve(ref: Ref, theme: Record<string, string>): string {
  if (typeof ref !== 'string') {
    const [color, surface, opacity] = ref.over
    return over(resolve(color, theme), resolve(surface, theme), opacity)
  }
  if (ref.startsWith('#')) return ref
  const expr = utilities[ref]
  if (!expr) throw new Error(`no colour utility "${ref}" in @theme inline`)
  return resolveColor(expr, theme)
}

function names(ref: Ref): string[] {
  if (typeof ref !== 'string') return [...names(ref.over[0]), ...names(ref.over[1])]
  return ref.startsWith('#') ? [] : [ref]
}

describe.each([
  ['Light theme', tokens.light],
  ['Dark theme', tokens.dark],
])('%s: contrast reaches WCAG AA', (_name, theme) => {
  it.each(PAIRS)('%s', (_label, fg, bg, need) => {
    expect(contrastRatio(resolve(fg, theme), resolve(bg, theme))).toBeGreaterThanOrEqual(need)
  })
})

describe('Coverage', () => {
  const covered = new Set(PAIRS.flatMap(([, fg, bg]) => [...names(fg), ...names(bg)]))

  it('every colour utility of globals.css is in at least one pair', () => {
    const missing = Object.keys(utilities).filter((name) => !covered.has(name) && !NO_PAIR.includes(name))
    expect(missing).toEqual([])
  })

  it('every utility a pair names exists', () => {
    expect([...covered].filter((name) => !(name in utilities))).toEqual([])
  })

  it('every colour source token is read by a utility', () => {
    const read = Object.values(utilities).join(' ')
    const orphans = Object.entries(tokens.light)
      .filter(([, value]) => CHANNELS.test(value))
      .map(([name]) => name)
      .filter((name) => !read.includes(`var(--${name})`))
    expect(orphans).toEqual([])
  })
})

describe('The tokens are the shop\'s', () => {
  it('round-trip to the shop\'s hex values', () => {
    expect(resolve('primary', tokens.light)).toBe('#27762e')
    expect(resolve('primary', tokens.dark)).toBe('#6dbb3d')
    expect(resolve('background', tokens.light)).toBe('#f6f6f4')
    expect(resolve('background', tokens.dark)).toBe('#18191b')
    expect(resolve('primary-hover', tokens.light)).toBe('#1d5e23')
  })
})
