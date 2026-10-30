import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * The head of a page on the anthracite band: kicker, heading, lead and an
 * optional row below (actions, a back link). The heading starts with its
 * most telling words and stays under 22 characters per line.
 */
export function PageHead({
  kicker,
  title,
  lead,
  children,
  size = 'page',
}: {
  kicker?:   ReactNode
  title:     ReactNode
  lead?:     ReactNode
  children?: ReactNode
  /** `tool` for the home page, where the heading is the product. */
  size?:     'tool' | 'page'
}) {
  return (
    <div className="surface-band">
      <div className="tool-column grid gap-3 py-[clamp(2.5rem,1.5rem+3vw,5.5rem)]">
        {kicker && <p className="kicker">{kicker}</p>}
        <h1
          className={cn(
            'max-w-[22ch] font-display font-[750] tracking-[-0.02em]',
            size === 'tool' ? 'text-display' : 'text-h2',
          )}
        >
          {title}
        </h1>
        {lead && <p className="max-w-[60ch] text-lead text-band-muted">{lead}</p>}
        {children}
      </div>
    </div>
  )
}
