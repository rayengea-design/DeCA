import { Link } from 'react-router-dom'
import logoMark from '@/assets/logo.png'
import { cn } from '@/lib/utils'

interface LogoProps {
  light?: boolean
  size?: 'sm' | 'md'
  to?: string
  className?: string
}

export function Logo({ light = false, size = 'md', to = '/', className }: LogoProps) {
  const isMd = size === 'md'
  return (
    <Link to={to} className={cn('flex items-center gap-2.5', className)}>
      <img src={logoMark} alt="" className={isMd ? 'h-9 w-9' : 'h-7 w-7'} />
      <span
        className={cn(
          'font-heading font-extrabold tracking-tight',
          isMd ? 'text-xl' : 'text-base',
          light ? 'text-white' : 'text-ink-900',
        )}
      >
        DeCA
      </span>
    </Link>
  )
}
