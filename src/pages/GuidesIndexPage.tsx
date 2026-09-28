import { Link } from 'react-router-dom'
import { MarketingHeader } from '@/components/layout/MarketingHeader'
import { Button } from '@/components/ui/Button'
import { GUIDES } from '@/content/guides'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export function GuidesIndexPage() {
  useDocumentMeta(
    'Guías sobre el DeCA | Documento electrónico de Control Administrativo',
    'Guías claras sobre el DeCA: qué es, quién está obligado, sanciones y cómo generarlo. Actualizadas a 2026.',
    'https://www.kreanex.es/guias',
  )

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <nav className="mb-6 text-sm text-ink-400">
          <Link to="/" className="hover:text-ink-700">
            Inicio
          </Link>{' '}
          · Guías
        </nav>
        <h1 className="font-heading text-3xl font-bold text-ink-900">Guías sobre el DeCA</h1>
        <p className="mt-2 text-ink-500">
          Todo lo que necesitas saber sobre el Documento electrónico de Control Administrativo del transporte.
        </p>

        <div className="mt-8 grid gap-5">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              to={`/guias/${g.slug}`}
              className="block rounded-xl border border-ink-100 p-6 transition hover:border-brand-300 hover:shadow-sm"
            >
              <h2 className="font-heading text-xl font-bold text-ink-900">{g.h1}</h2>
              <p className="mt-2 text-sm text-ink-500">{g.description}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-600">
                Leer guía · {g.readingMinutes} min →
              </span>
            </Link>
          ))}
        </div>

        <aside className="mt-12 rounded-xl border border-brand-200 bg-brand-50 p-6 text-center">
          <h2 className="font-heading text-xl font-bold text-ink-900">Genera tu DeCA en menos de un minuto</h2>
          <p className="mt-2 text-sm text-ink-600">10 DeCA o 5 días gratis. Sin tarjeta de crédito.</p>
          <Button asChild size="lg" className="mt-4">
            <Link to="/registro">Empieza gratis</Link>
          </Button>
        </aside>
      </main>
    </div>
  )
}
