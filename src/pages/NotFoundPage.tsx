import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export function NotFoundPage() {
  useDocumentMeta('Página no encontrada | DeCA')
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-50 px-4 text-center">
      <Logo />
      <p className="font-heading text-6xl font-extrabold text-ink-900">404</p>
      <p className="text-ink-500">Esta página no existe o se ha movido.</p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
