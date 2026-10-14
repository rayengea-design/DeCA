import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { COMMERCIAL_PAGES, type CommercialPage } from './src/content/commercial.ts'
import { GUIDES, GUIDES_ORG, type Guide } from './src/content/guides.ts'
import {
  COMPARISON,
  FAQS,
  FEATURES,
  FEATURES_HEADING,
  FINAL_CTA,
  HERO,
  heroBadge,
  MID_CTA,
  PLANS_MARKETING,
  PRICING_HEADING,
  PROBLEM,
  SANCTION_TEXT,
  SECURITY,
  SOLUTION,
  STEPS,
  STEPS_HEADING,
  TRUST_ITEMS,
  USE_CASES,
  USE_CASES_HEADING,
} from './src/content/landing.ts'

const SITE = 'https://www.kreanex.es'
// Prefilled WhatsApp link for the Flota+ CTA. Mirrors WHATSAPP_CONTACT_URL in
// src/lib/plans.ts, duplicated here because that module can't be imported from
// the Node build config (it uses the '@' path alias). Keep the number in sync.
const WHATSAPP_URL = 'https://wa.me/34600794114'

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

/** Static HTML for a commercial landing page (/generar-deca, etc.), from the
 * same content module the React CommercialPage renders. */
function commercialBodyHtml(page: CommercialPage): string {
  const sections = page.sections
    .map((s) => {
      const paras = (s.paragraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join('\n')
      const bullets = s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''
      return `<section><h2>${esc(s.heading)}</h2>\n${paras}\n${bullets}</section>`
    })
    .join('\n')
  const faqs = page.faqs?.length
    ? `<section><h2>Preguntas frecuentes</h2>${page.faqs
        .map((f) => `<div><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
        .join('')}</section>`
    : ''
  const related = COMMERCIAL_PAGES.filter((p) => p.slug !== page.slug)
    .map((p) => `<a href="${SITE}/${p.slug}">${esc(p.navLabel)}</a>`)
    .join('\n')
  return `${navHtml()}
<main>
<nav aria-label="Miga de pan"><a href="${SITE}/">Inicio</a> · ${esc(page.h1)}</nav>
<article>
<h1>${esc(page.h1)}</h1>
<p>${esc(page.intro)}</p>
<p><a href="${SITE}/registro">Empieza gratis</a> — 10 DeCA o 5 días gratis, sin tarjeta de crédito.</p>
${sections}
${midCtaHtml()}
${faqs}
</article>
${ctaHtml()}
<nav aria-label="Más sobre DeCA">${related}
<a href="${SITE}/guias">Guías sobre el DeCA</a></nav>
</main>`
}

function commercialJsonLd(page: CommercialPage): string {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: page.h1, item: `${SITE}/${page.slug}` },
      ],
    },
  ]
  if (page.faqs?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

/** Static HTML of the whole marketing landing, built from the SAME content
 * module the React page renders (src/content/landing.ts), so crawlers and AI
 * assistants read the real H1, value props, pricing and the full FAQ without
 * running JavaScript. The SPA mounts over it for real users. */
function homeBodyHtml(): string {
  const trust = TRUST_ITEMS.map((t) => `<li>${esc(t.text)}</li>`).join('')
  const comparisonRows = COMPARISON.map(
    (r) =>
      `<tr><th scope="row">${esc(r.item)}</th><td>SIMPLE (Ministerio): ${esc(r.simple)}</td><td>DeCA: ${esc(r.deca)}</td></tr>`,
  ).join('')
  const features = FEATURES.map((f) => `<div><h3>${esc(f.title)}</h3><p>${esc(f.description)}</p></div>`).join('')
  const steps = STEPS.map((s) => `<li><strong>${esc(s.title)}.</strong> ${esc(s.body)}</li>`).join('')
  const useCases = USE_CASES.map((u) => `<div><h3>${esc(u.title)}</h3><p>${esc(u.body)}</p></div>`).join('')
  const securityBullets = SECURITY.bullets.map((b) => `<li>${esc(b)}</li>`).join('')
  const plans = PLANS_MARKETING.map((p) => {
    const href = p.hrefKind === 'whatsapp' ? WHATSAPP_URL : `${SITE}/registro`
    const feats = p.features.map((f) => `<li>${esc(f)}</li>`).join('')
    const price = `${esc(p.price)}${p.period ? esc(p.period) : ''}`
    return `<div><h3>${esc(p.name)} — ${price}</h3><p>${esc(p.description)}</p><ul>${feats}</ul><a href="${href}">${esc(p.cta)}</a></div>`
  }).join('')
  const faqs = FAQS.map((f) => `<div><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('')
  const midBullets = MID_CTA.bullets.map((b) => `<li>${esc(b)}</li>`).join('')

  return `${navHtml()}
<main>
<section>
<p>${esc(heroBadge())}</p>
<h1>${esc(HERO.h1)}</h1>
<p>${esc(HERO.subtitle)}</p>
<a href="${SITE}/registro">Empieza gratis</a> <a href="${SITE}/#precios">Ver precios</a>
<p>${esc(HERO.note)}</p>
</section>
<section aria-label="Garantías"><ul>${trust}</ul></section>
<section><p>${esc(SANCTION_TEXT)}</p></section>
<section>
<div><h2>${esc(PROBLEM.h2)}</h2><p>${esc(PROBLEM.p)}</p></div>
<div><h2>${esc(SOLUTION.h2)}</h2><p>${esc(SOLUTION.p)}</p></div>
<table><thead><tr><th></th><th>SIMPLE (Ministerio)</th><th>DeCA</th></tr></thead><tbody>${comparisonRows}</tbody></table>
</section>
<section id="funciones"><h2>${esc(FEATURES_HEADING.h2)}</h2><p>${esc(FEATURES_HEADING.sub)}</p>${features}</section>
<section><h2>${esc(STEPS_HEADING.h2)}</h2><p>${esc(STEPS_HEADING.sub)}</p><ol>${steps}</ol></section>
<section id="para-quien"><h2>${esc(USE_CASES_HEADING.h2)}</h2><p>${esc(USE_CASES_HEADING.sub)}</p>${useCases}</section>
<section><h2>${esc(SECURITY.h2)}</h2><p>${esc(SECURITY.p)}</p><ul>${securityBullets}</ul></section>
<section id="precios"><h2>${esc(PRICING_HEADING.h2)}</h2><p>${esc(PRICING_HEADING.sub)}</p><p>${esc(PRICING_HEADING.note)}</p>${plans}</section>
<section><h2>${esc(MID_CTA.h2)}</h2><p>${esc(MID_CTA.p)}</p><ul>${midBullets}</ul><a href="${SITE}/registro">Empieza gratis</a></section>
<section id="faq"><h2>Preguntas frecuentes</h2>${faqs}</section>
<section><h2>${esc(FINAL_CTA.h2)}</h2><p>${esc(FINAL_CTA.p)}</p><a href="${SITE}/registro">Empieza gratis</a><p>${esc(FINAL_CTA.note)}</p></section>
<nav aria-label="Enlaces útiles">
<a href="${SITE}/generar-deca">Generar el DeCA online</a>
<a href="${SITE}/programa-deca">Programa para el DeCA</a>
<a href="${SITE}/alternativa-simple-ministerio">Alternativa a SIMPLE del Ministerio</a>
<a href="${SITE}/guias">Guías sobre el DeCA</a>
</nav>
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

/** Build-time prerender of the marketing pages: writes real static HTML for the
 * home (/), /guias and every /guias/<slug> into dist, so Google, ChatGPT,
 * Perplexity and WhatsApp link previews get full content without executing
 * JavaScript. The SPA still mounts over it for real users navigating
 * client-side. */
function prerenderGuides(): Plugin {
  return {
    name: 'prerender-guides',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(import.meta.dirname, 'dist')
      // Captured once, with the root still empty, BEFORE any injection below —
      // every page (home and guides) is rendered from this clean template.
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

      // Commercial / transactional landing pages (top-level slugs)
      for (const page of COMMERCIAL_PAGES) {
        const dir = path.join(outDir, page.slug)
        mkdirSync(dir, { recursive: true })
        writeFileSync(
          path.join(dir, 'index.html'),
          renderPage(template, {
            title: page.metaTitle,
            description: page.description,
            canonical: `${SITE}/${page.slug}`,
            body: commercialBodyHtml(page),
            jsonLd: commercialJsonLd(page),
          }),
          'utf-8',
        )
      }

      // Home (/): fill the otherwise-empty <div id="root"> of the built
      // index.html with the real landing content. Only the root is replaced —
      // all the existing <head> meta and JSON-LD in index.html stay as they are.
      writeFileSync(
        path.join(outDir, 'index.html'),
        template.replace('<div id="root"></div>', `<div id="root">${homeBodyHtml()}</div>`),
        'utf-8',
      )

      // eslint-disable-next-line no-console
      console.log(
        `[prerender] home + ${GUIDES.length + 1} guías + ${COMMERCIAL_PAGES.length} páginas comerciales escritas en dist`,
      )
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
