/**
 * The one place icons come from: Phosphor, regular weight, through its SSR
 * build so the same import works in server and client components.
 *
 * Every icon is decorative by default (aria-hidden, not focusable). Give one
 * an aria-label or aria-labelledby and it is announced instead.
 *
 * Only icons something imports are listed. A new one goes into the import
 * and the export list below, in alphabetical order.
 */
import type { Icon, IconProps } from '@phosphor-icons/react'
import {
  ArrowRight as ArrowRightBase,
  ArrowSquareOut as ArrowSquareOutBase,
  CaretDown as CaretDownBase,
  CaretRight as CaretRightBase,
  ChartBar as ChartBarBase,
  Check as CheckBase,
  CircleNotch as CircleNotchBase,
  Clock as ClockBase,
  Copy as CopyBase,
  DownloadSimple as DownloadSimpleBase,
  Eye as EyeBase,
  EyeSlash as EyeSlashBase,
  Fire as FireBase,
  Globe as GlobeBase,
  List as ListBase,
  LockSimple as LockSimpleBase,
  Monitor as MonitorBase,
  Moon as MoonBase,
  SmileySad as SmileySadBase,
  Sun as SunBase,
  X as XBase,
} from '@phosphor-icons/react/dist/ssr'
import { forwardRef } from 'react'

function decorative(Base: Icon): Icon {
  const Decorative = forwardRef<SVGSVGElement, IconProps>(function Decorative(props, ref) {
    const labelled = props['aria-label'] != null || props['aria-labelledby'] != null
    return <Base ref={ref} aria-hidden={labelled ? undefined : true} focusable="false" {...props} />
  })
  Decorative.displayName = Base.displayName
  return Decorative
}

export const ArrowRight = decorative(ArrowRightBase)
export const ArrowSquareOut = decorative(ArrowSquareOutBase)
export const CaretDown = decorative(CaretDownBase)
export const CaretRight = decorative(CaretRightBase)
export const ChartBar = decorative(ChartBarBase)
export const Check = decorative(CheckBase)
export const CircleNotch = decorative(CircleNotchBase)
export const Clock = decorative(ClockBase)
export const Copy = decorative(CopyBase)
export const DownloadSimple = decorative(DownloadSimpleBase)
export const Eye = decorative(EyeBase)
export const EyeSlash = decorative(EyeSlashBase)
export const Fire = decorative(FireBase)
export const Globe = decorative(GlobeBase)
export const List = decorative(ListBase)
export const LockSimple = decorative(LockSimpleBase)
export const Monitor = decorative(MonitorBase)
export const Moon = decorative(MoonBase)
export const SmileySad = decorative(SmileySadBase)
export const Sun = decorative(SunBase)
export const X = decorative(XBase)
