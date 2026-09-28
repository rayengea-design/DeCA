import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'

/** Shared top navigation for the public marketing pages (landing + guides).
 * On the landing page the in-page sections are reached with plain hash links
 * (#funciones); from any other page they need to point back to the landing
 * first (/#funciones), so the same menu works everywhere. */
export function MarketingHeader({ onLanding = false }: { onLanding?: boolean }) {
  const prefix = onLanding ? '' : '/'
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" aria-label="Inicio">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-600 md:flex">
          <a href={`${prefix}#funciones`} className="hover:text-ink-900">
            Funciones
          </a>
          <a href={`${prefix}#para-quien`} className="hover:text-ink-900">
            Para quién es
          </a>
          <a href={`${prefix}#precios`} className="hover:text-ink-900">
            Precios
          </a>
          <Link to="/guias" className="hover:text-ink-900">
            Guías
          </Link>
          <a href={`${prefix}#faq`} className="hover:text-ink-900">
            Preguntas frecuentes
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/registro">Prueba gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
