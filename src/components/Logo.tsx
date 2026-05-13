import Image from 'next/image'

interface LogoProps {
  size?: number
}

/**
 * MSK logo — served from /public/logo.png and optimized by next/image.
 */
export function Logo({ size = 32 }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="MSK Logo"
      width={size}
      height={size}
      priority
      className="rounded-lg"
    />
  )
}
