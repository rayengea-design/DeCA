import { Link, useParams } from 'react-router-dom'
import { MarketingHeader } from '@/components/layout/MarketingHeader'
import { Button } from '@/components/ui/Button'
import { getGuide, GUIDES_ORG } from '@/content/guides'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { useJsonLd } from '@/hooks/useJsonLd'

export function GuideArticlePage() {
  const { slug } = useParams()
  const guide = slug ? getGuide(slug) : undefined

  useDocumentMeta(
    guide ? guide.metaTitle : 'Guía no encontrada | DeCA',
    guide?.description,
    guide ? `https://www.kreanex.es/guias/${guide.slug}` : undefined,
  )

  useJsonLd(
    'guide-jsonld',
    guide
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              headline: guide.h1,
              description: guide.description,
              datePublished: guide.datePublished,
              dateModified: guide.dateModified,
              inLanguage: 'es-ES',
              mainEntityOfPage: `https://www.kreanex.es/guias/${guide.slug}`,
              author: { '@type': 'Organization', name: GUIDES_ORG },
              publisher: {
                '@type': 'Organization',
                name: GUIDES_ORG,
                logo: { '@type': 'ImageObject', url: 'https://www.kreanex.es/pwa-512x512.png' },
              },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.kreanex.es/' },
                { '@type': 'ListItem', position: 2, name: 'Guías', item: 'https://www.kreanex.es/guias' },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: guide.h1,
                  item: `https://www.kreanex.es/guias/${guide.slug}`,
                },
              ],
            },
            ...(guide.faqs && guide.faqs.length
              ? [
                  {
                    '@type': 'FAQPage',
                    mainEntity: guide.faqs.map((f) => ({
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

  if (!guide) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-heading text-2xl font-bold text-ink-900">Guía no encontrada</h1>
        <Button asChild>
          <Link to="/guias">Ver todas las guías</Link>
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
          ·{' '}
          <Link to="/guias" className="hover:text-ink-700">
            Guías
          </Link>
        </nav>

        <article>
          <h1 className="font-heading text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl">{guide.h1}</h1>
          <p className="mt-4 text-lg text-ink-600">{guide.intro}</p>

          {guide.sections.map((s) => (
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

          {guide.faqs && guide.faqs.length > 0 && (
            <section className="mt-10">
              <h2 className="font-heading text-2xl font-bold text-ink-900">Preguntas frecuentes</h2>
              <div className="mt-4">
                {guide.faqs.map((f) => (
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
        </aside>
      </main>
    </div>
  )
}
