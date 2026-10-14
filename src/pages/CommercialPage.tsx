import { Link } from 'react-router-dom'
import { MarketingHeader } from '@/components/layout/MarketingHeader'
import { Button } from '@/components/ui/Button'
import { getCommercialPage } from '@/content/commercial'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { useJsonLd } from '@/hooks/useJsonLd'

const SITE = 'https://www.kreanex.es'

/** Renders one top-level commercial landing page (e.g. /generar-deca). The
 * slug is fixed per route in App.tsx rather than read from the URL, so each
 * page is an explicit, crawlable route. Mirrors GuideArticlePage's look, with
 * an extra above-the-fold CTA since these pages target buyer intent. */
export function CommercialPage({ slug }: { slug: string }) {
  const page = getCommercialPage(slug)

  useDocumentMeta(
    page ? page.metaTitle : 'Página no encontrada | DeCA',
    page?.description,
    page ? `${SITE}/${page.slug}` : undefined,
  )

  useJsonLd(
    'commercial-jsonld',
    page
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
                { '@type': 'ListItem', position: 2, name: page.h1, item: `${SITE}/${page.slug}` },
              ],
            },
            ...(page.faqs && page.faqs.length
              ? [
                  {
                    '@type': 'FAQPage',
                    mainEntity: page.faqs.map((f) => ({
                      '@type': 'Question',
                      name: f.q,
                      acceptedAnswer: { '@type': 'Answer', text: f.a },
                    })),
                  },
                ]
              : []),
          ],
        }
      : {},
  )

  if (!page) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-heading text-2xl font-bold text-ink-900">Página no encontrada</h1>
        <Button asChild>
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <nav className="mb-6 text-sm text-ink-400">
          <Link to="/" className="hover:text-ink-700">
            Inicio
          </Link>{' '}
          · <span className="text-ink-500">{page.h1}</span>
        </nav>

        <article>
          <h1 className="font-heading text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl">{page.h1}</h1>
          <p className="mt-4 text-lg text-ink-600">{page.intro}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/registro">Empieza gratis</Link>
            </Button>
            <span className="text-sm text-ink-400">10 DeCA o 5 días gratis · Sin tarjeta de crédito</span>
          </div>

          {page.sections.map((s) => (
            <section key={s.heading} className="mt-8">
              <h2 className="font-heading text-2xl font-bold text-ink-900">{s.heading}</h2>
              {s.paragraphs?.map((p, i) => (
                <p key={i} className="mt-3 text-ink-600">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-600">
                  {s.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <aside className="mt-10 flex flex-col items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-ink-700">
              ¿Listo para generar tu DeCA? Pruébalo gratis: 10 documentos o 5 días, sin tarjeta.
            </p>
            <Button asChild className="shrink-0">
              <Link to="/registro">Empieza gratis</Link>
            </Button>
          </aside>

          {page.faqs && page.faqs.length > 0 && (
            <section className="mt-10">
              <h2 className="font-heading text-2xl font-bold text-ink-900">Preguntas frecuentes</h2>
              <div className="mt-4">
                {page.faqs.map((f) => (
                  <div key={f.q} className="border-b border-ink-100 py-4">
                    <h3 className="font-semibold text-ink-900">{f.q}</h3>
                    <p className="mt-2 text-sm text-ink-500">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="mt-12 rounded-xl border border-brand-200 bg-brand-50 p-6 text-center">
          <h2 className="font-heading text-xl font-bold text-ink-900">Genera tu DeCA en menos de un minuto</h2>
          <p className="mt-2 text-sm text-ink-600">10 DeCA o 5 días gratis. Sin tarjeta de crédito.</p>
          <Button asChild size="lg" className="mt-4">
            <Link to="/registro">Empieza gratis</Link>
          </Button>
          <p className="mt-4 text-xs text-ink-500">
            Conforme a la Orden FOM/2861/2012 · Datos de cada empresa aislados · Pagos y factura vía Stripe
          </p>
          <p className="mt-4 text-sm">
            <Link to="/guias" className="font-medium text-brand-600 hover:underline">
              Ver las guías sobre el DeCA
            </Link>
          </p>
        </aside>
      </main>
    </div>
  )
}
