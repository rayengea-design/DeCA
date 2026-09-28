import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { GUIDES, GUIDES_ORG, type Guide } from './src/content/guides.ts'

const SITE = 'https://www.kreanex.es'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** The shared marketing nav, as plain static HTML so crawlers and AI
 * assistants that don't run JS still see the links to the rest of the site. */
function navHtml(): string {
  return `<header><nav aria-label="Principal">
<a href="${SITE}/">Inicio</a>
<a href="${SITE}/#funciones">Funciones</a>
<a href="${SITE}/#para-quien">Para quién es</a>
<a href="${SITE}/#precios">Precios</a>
<a href="${SITE}/guias">Guías</a>
<a href="${SITE}/#faq">Preguntas frecuentes</a>
<a href="${SITE}/login">Iniciar sesión</a>
<a href="${SITE}/registro">Prueba gratis</a>
</nav></header>`
}

function ctaHtml(): string {
  return `<aside><h2>Genera tu DeCA en menos de un minuto</h2>
<p>10 DeCA o 5 días gratis. Sin tarjeta de crédito.</p>
<a href="${SITE}/registro">Empieza gratis</a>
<p>Conforme a la Orden FOM/2861/2012 · Datos de cada empresa aislados · Pagos y factura vía Stripe</p></aside>`
}

function midCtaHtml(): string {
  return `<aside><p>¿Necesitas generar tu DeCA? Pruébalo gratis: 10 documentos o 5 días, sin tarjeta.</p>
<a href="${SITE}/registro">Empieza gratis</a></aside>`
}

function guideBodyHtml(guide: Guide): string {
  const sections = guide.sections
    .map((s) => {
      const paras = (s.paragraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join('\n')
      const bullets = s.bullets?.length
        ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
        : ''
      return `<section><h2>${esc(s.heading)}</h2>\n${paras}\n${bullets}</section>`
    })
    .join('\n')

  const faqs = guide.faqs?.length
    ? `<section><h2>Preguntas frecuentes</h2>${guide.faqs
        .map((f) => `<div><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
        .join('')}</section>`
    : ''

  return `${navHtml()}
<main>
<nav aria-label="Miga de pan"><a href="${SITE}/">Inicio</a> · <a href="${SITE}/guias">Guías</a></nav>
<article>
<h1>${esc(guide.h1)}</h1>
<p>${esc(guide.intro)}</p>
${sections}
${midCtaHtml()}
${faqs}
</article>
${ctaHtml()}
</main>`
}

function guidesIndexBodyHtml(): string {
  const items = GUIDES.map(
    (g) =>
      `<li><a href="${SITE}/guias/${g.slug}"><h2>${esc(g.h1)}</h2><p>${esc(g.description)}</p></a></li>`,
  ).join('\n')
  return `${navHtml()}
<main>
<nav aria-label="Miga de pan"><a href="${SITE}/">Inicio</a> · Guías</nav>
<h1>Guías sobre el DeCA</h1>
<p>Todo lo que necesitas saber sobre el Documento electrónico de Control Administrativo del transporte.</p>
<ul>${items}</ul>
${ctaHtml()}
</main>`
}

function guideJsonLd(guide: Guide): string {
  const graph: unknown[] = [
    {
      '@type': 'Article',
      headline: guide.h1,
      description: guide.description,
      datePublished: guide.datePublished,
      dateModified: guide.dateModified,
      inLanguage: 'es-ES',
      mainEntityOfPage: `${SITE}/guias/${guide.slug}`,
      author: { '@type': 'Organization', name: GUIDES_ORG },
      publisher: {
        '@type': 'Organization',
        name: GUIDES_ORG,
        logo: { '@type': 'ImageObject', url: `${SITE}/pwa-512x512.png` },
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Guías', item: `${SITE}/guias` },
        { '@type': 'ListItem', position: 3, name: guide.h1, item: `${SITE}/guias/${guide.slug}` },
      ],
    },
  ]
  if (guide.faqs?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: guide.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

/** Renders one HTML page from the built SPA template: swaps in per-page
 * title/description/canonical, injects the static body inside #root so the
 * content is readable without JS, and adds the page-specific JSON-LD. */
function renderPage(
  template: string,
  opts: { title: string; description: string; canonical: string; body: string; jsonLd?: string },
): string {
  let html = template
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(opts.title)}</title>`)
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[\s\S]*?(")/,
    `$1${esc(opts.description)}$2`,
  )
  html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${opts.canonical}$2`)
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${opts.canonical}$2`)
  html = html.replace(
    /(<meta\s+property="og:title"\s+content=")[\s\S]*?(")/,
    `$1${esc(opts.title)}$2`,
  )
  html = html.replace(
    /(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/,
    `$1${esc(opts.description)}$2`,
  )
  if (opts.jsonLd) {
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json">${opts.jsonLd}</script>\n  </head>`,
    )
  }
  html = html.replace('<div id="root"></div>', `<div id="root">${opts.body}</div>`)
  return html
}

/** Build-time prerender of the marketing guides: writes real static HTML for
 * /guias and every /guias/<slug> into dist, so Google, ChatGPT, Perplexity and
 * WhatsApp link previews get full content without executing JavaScript. The
 * SPA still hydrates over it for real users navigating client-side. */
function prerenderGuides(): Plugin {
  return {
    name: 'prerender-guides',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(import.meta.dirname, 'dist')
      const template = readFileSync(path.join(outDir, 'index.html'), 'utf-8')

      // Guides index
      const indexDir = path.join(outDir, 'guias')
      mkdirSync(indexDir, { recursive: true })
      writeFileSync(
        path.join(indexDir, 'index.html'),
        renderPage(template, {
          title: 'Guías sobre el DeCA | Documento electrónico de Control Administrativo',
          description:
            'Guías claras sobre el DeCA: qué es, quién está obligado, sanciones y cómo generarlo. Actualizadas a 2026.',
          canonical: `${SITE}/guias`,
          body: guidesIndexBodyHtml(),
        }),
        'utf-8',
      )

      // One page per guide
      for (const guide of GUIDES) {
        const dir = path.join(outDir, 'guias', guide.slug)
        mkdirSync(dir, { recursive: true })
        writeFileSync(
          path.join(dir, 'index.html'),
          renderPage(template, {
            title: guide.metaTitle,
            description: guide.description,
            canonical: `${SITE}/guias/${guide.slug}`,
            body: guideBodyHtml(guide),
            jsonLd: guideJsonLd(guide),
          }),
          'utf-8',
        )
      }

      // eslint-disable-next-line no-console
      console.log(`[prerender-guides] ${GUIDES.length + 1} static pages written to dist/guias`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'DeCA',
        short_name: 'DeCA',
        description: 'Documento electrónico de Control Administrativo',
        theme_color: '#C0090E',
        background_color: '#F5F5F5',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The app shell (HTML/JS/CSS/icons) is precached so the app opens
        // instantly and works even through a brief connectivity drop.
        // Firestore/Storage requests are deliberately left alone here —
        // they're either a streaming channel (not cacheable this way) or
        // need to hit the network anyway to actually create a DeCA — see
        // AuthContext's Firestore persistence for the part of "offline"
        // that's real (reading previously-loaded data).
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
    prerenderGuides(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
