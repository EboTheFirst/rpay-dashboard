import { cn } from '@/lib/utils'

interface RpayLogoProps {
  className?: string
  size?: number
}

export function RpayLogo({ className, size = 24 }: RpayLogoProps) {
  return (
    <img
      src="/images/rpay.png"
      alt="RPAY"
      width={size}
      height={size}
      className={cn('object-contain', className)}
    />
  )
}
