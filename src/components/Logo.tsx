import { FileCheck2 } from 'lucide-react'
import { Link } from 'react-router-dom'
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
      <span
        className={cn(
          'flex items-center justify-center rounded-lg bg-brand-500 text-white',
          isMd ? 'h-9 w-9' : 'h-7 w-7',
        )}
      >
        <FileCheck2 className={isMd ? 'h-5 w-5' : 'h-4 w-4'} />
      </span>
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
