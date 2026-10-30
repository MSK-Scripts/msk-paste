import { SiteFrame } from '@/components/site/SiteFrame'
import { StatusPanel } from '@/components/StatusPanel'

export default function NotFound() {
  return (
    <SiteFrame>
      <div className="tool-column py-[var(--space-section)]">
        <StatusPanel variant="notFound" />
      </div>
    </SiteFrame>
  )
}
