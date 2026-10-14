import {
  Bookmark,
  Building2,
  CheckCircle2,
  CreditCard,
  Download,
  FileCheck,
  History,
  Lock,
  MessageCircle,
  QrCode,
  Server,
  ShieldCheck,
  Smartphone,
  Truck,
  User,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { MarketingHeader } from '@/components/layout/MarketingHeader'
import { Button } from '@/components/ui/Button'
import {
  COMPARISON,
  daysUntilMandatory,
  FAQS,
  FEATURES,
  FEATURES_HEADING,
  FINAL_CTA,
  HERO,
  heroBadge,
  type IconName,
  isMandatoryYet,
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
} from '@/content/landing'
import { WHATSAPP_CONTACT_URL } from '@/lib/plans'
import { cn } from '@/lib/utils'

// Resolves the icon names stored in the (React-free) landing content module to
// actual lucide components for rendering.
const ICONS: Record<IconName, LucideIcon> = {
  QrCode,
  ShieldCheck,
  Users,
  History,
  Bookmark,
  Download,
  MessageCircle,
  Smartphone,
  Lock,
  CreditCard,
  User,
  Truck,
  Building2,
  Server,
}

function planHref(hrefKind: 'registro' | 'whatsapp'): string {
  return hrefKind === 'whatsapp' ? WHATSAPP_CONTACT_URL : '/registro'
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-ink-100 py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="font-semibold text-ink-900">{q}</span>
        <span className={cn('shrink-0 text-xl leading-none text-ink-400 transition-transform', open && 'rotate-45')}>
          +
        </span>
      </button>
      {/* Always rendered so crawlers and AI assistants read the answer; only
          visually collapsed when closed (better for SEO/GEO and a11y than
          removing it from the DOM until clicked). */}
      <p className={cn('mt-2 text-sm text-ink-500', !open && 'sr-only')}>{a}</p>
    </div>
  )
}

export function LandingPage() {
  const mandatory = isMandatoryYet()
  const days = daysUntilMandatory()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <MarketingHeader onLanding />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(192,9,14,0.35),_transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-300">
              {heroBadge()}
            </span>
            <h1 className="max-w-2xl font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              {HERO.h1}
            </h1>
            <p className="max-w-xl text-lg text-ink-200">{HERO.subtitle}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/registro">Empieza gratis</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                <a href="#precios">Ver precios</a>
              </Button>
            </div>
            <p className="text-sm text-ink-400">{HERO.note}</p>
          </div>

          {/* Product mockup — an illustrated preview of the actual PDF a DeCA
              generates, not a stock photo, so nothing here overstates or
              misrepresents what the product does. */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-6 rounded-[2rem] bg-brand-500/10 blur-2xl" />
            <div className="relative mx-auto w-72 -rotate-2 rounded-2xl border border-white/10 bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div>
                  <p className="font-heading text-sm font-extrabold text-ink-900">DeCA</p>
                  <p className="text-[10px] text-ink-400">Documento electrónico de Control Administrativo</p>
                </div>
                <ShieldCheck className="h-5 w-5 shrink-0 text-brand-500" />
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {['Cargador', 'Transportista', 'Mercancía', 'Origen — Destino', 'Matrículas'].map((label) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-ink-400">{label}</span>
                    <span className="h-1.5 w-14 rounded-full bg-ink-100" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-3">
                <div className="grid h-14 w-14 shrink-0 grid-cols-4 grid-rows-4 gap-0.5 rounded bg-ink-900 p-1.5">
                  {[1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1].map((on, i) => (
                    <span key={i} className={cn('rounded-[1px]', on ? 'bg-white' : 'bg-transparent')} />
                  ))}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-ink-900">QR de verificación</p>
                  <p className="text-[10px] text-ink-400">Listo para inspección</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-500" />
              PDF listo al instante
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 text-center text-xs font-medium text-ink-500 sm:grid-cols-4 sm:px-6">
          {TRUST_ITEMS.map((t) => {
            const Icon = ICONS[t.icon]
            return (
              <div key={t.text} className="flex flex-col items-center gap-1.5">
                <Icon className="h-5 w-5 text-brand-500" />
                {t.text}
              </div>
            )
          })}
        </div>
      </section>

      {/* Sanction strip */}
      <section className="border-b border-ink-100 bg-brand-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-4 text-center sm:flex-row sm:justify-center sm:gap-3 sm:px-6">
          <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm font-medium text-brand-700">{SANCTION_TEXT}</p>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink-900">{PROBLEM.h2}</h2>
            <p className="mt-3 text-ink-500">{PROBLEM.p}</p>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink-900">{SOLUTION.h2}</h2>
            <p className="mt-3 text-ink-500">{SOLUTION.p}</p>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto rounded-xl border border-ink-100">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-5 py-3 font-semibold">&nbsp;</th>
                <th className="px-5 py-3 font-semibold">SIMPLE (Ministerio)</th>
                <th className="px-5 py-3 font-semibold text-brand-600">DeCA</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.item} className="border-t border-ink-100">
                  <td className="px-5 py-3.5 font-medium text-ink-900">{row.item}</td>
                  <td className="px-5 py-3.5 text-ink-500">
                    <span className="inline-flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 shrink-0 text-ink-300" />
                      {row.simple}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-ink-900">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-500" />
                      {row.deca}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Features */}
      <section id="funciones" className="border-y border-ink-100 bg-ink-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold text-ink-900">{FEATURES_HEADING.h2}</h2>
            <p className="mt-2 text-ink-500">{FEATURES_HEADING.sub}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = ICONS[f.icon]
              return (
                <div key={f.title} className="rounded-lg border border-ink-100 bg-white p-5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-ink-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-500">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-ink-900">{STEPS_HEADING.h2}</h2>
          <p className="mt-2 text-ink-500">{STEPS_HEADING.sub}</p>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 font-heading text-lg font-bold text-white">
                {s.step}
              </span>
              <h3 className="mt-4 font-semibold text-ink-900">{s.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section id="para-quien" className="border-y border-ink-100 bg-ink-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold text-ink-900">{USE_CASES_HEADING.h2}</h2>
            <p className="mt-2 text-ink-500">{USE_CASES_HEADING.sub}</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {USE_CASES.map((u) => {
              const Icon = ICONS[u.icon]
              return (
                <div key={u.title} className="rounded-xl border border-ink-100 bg-white p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-ink-900">{u.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-500">{u.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-heading text-3xl font-bold text-ink-900">{SECURITY.h2}</h2>
            <p className="mt-3 text-ink-500">{SECURITY.p}</p>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-ink-600">
              <li className="flex items-start gap-2">
                <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                {SECURITY.bullets[0]}
              </li>
              <li className="flex items-start gap-2">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                {SECURITY.bullets[1]}
              </li>
              <li className="flex items-start gap-2">
                <Server className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                {SECURITY.bullets[2]}
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-ink-100 bg-ink-50 p-8 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-brand-500" />
            <p className="mt-4 font-heading text-lg font-bold text-ink-900">Cumplimiento por diseño</p>
            <p className="mt-1.5 text-sm text-ink-500">
              Cada campo obligatorio de la normativa está en el formulario — no se puede generar un DeCA incompleto.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="border-t border-ink-100 bg-ink-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold text-ink-900">{PRICING_HEADING.h2}</h2>
            <p className="mt-2 text-ink-500">{PRICING_HEADING.sub}</p>
            <p className="mt-1 text-xs text-ink-400">{PRICING_HEADING.note}</p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            {PLANS_MARKETING.map((plan) => {
              const href = planHref(plan.hrefKind)
              return (
                <div
                  key={plan.name}
                  className={cn(
                    'flex flex-col rounded-xl border bg-white p-6',
                    plan.highlighted ? 'border-brand-500 shadow-lg ring-1 ring-brand-500' : 'border-ink-100 shadow-sm',
                  )}
                >
                  {plan.highlighted && (
                    <span className="mb-3 inline-flex w-fit items-center rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                      Más popular
                    </span>
                  )}
                  <h3 className="font-heading text-xl font-bold text-ink-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-ink-500">{plan.description}</p>
                  <p className="mt-5 flex items-baseline gap-1">
                    <span className="font-heading text-3xl font-extrabold text-ink-900">{plan.price}</span>
                    {plan.period && <span className="text-sm text-ink-400">{plan.period}</span>}
                  </p>
                  <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-ink-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-6" variant={plan.highlighted ? 'default' : 'outline'}>
                    {href.startsWith('http') ? (
                      <a href={href} target="_blank" rel="noreferrer">
                        {plan.cta}
                      </a>
                    ) : (
                      <Link to={href}>{plan.cta}</Link>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
          <p className="mt-6 text-center text-xs text-ink-400">
            Cambia de plan cuando quieras: el nuevo precio se aplica en tu siguiente renovación, sin cobros
            sorpresa a mitad de mes.
          </p>
        </div>
      </section>

      {/* Mid-page CTA */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-14 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-ink-900">{MID_CTA.h2}</h2>
          <p className="max-w-lg text-ink-500">{MID_CTA.p}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-500">
            {MID_CTA.bullets.map((b) => (
              <li key={b} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-500" />
                {b}
              </li>
            ))}
          </ul>
          <Button asChild size="lg">
            <Link to="/registro">Empieza gratis</Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-heading text-3xl font-bold text-ink-900">Preguntas frecuentes</h2>
        <div className="mt-8">
          {FAQS.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(192,9,14,0.3),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6">
          {!mandatory && days <= 30 && (
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-300">
              Quedan {days} {days === 1 ? 'día' : 'días'} para que sea obligatorio
            </span>
          )}
          <h2 className="font-heading text-3xl font-bold text-white">{FINAL_CTA.h2}</h2>
          <p className="max-w-xl text-ink-300">{FINAL_CTA.p}</p>
          <Button asChild size="lg">
            <Link to="/registro">Empieza gratis</Link>
          </Button>
          <p className="text-xs text-ink-400">{FINAL_CTA.note}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-sm text-ink-400 sm:px-6">
          <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
            <Logo />
            <nav className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/generar-deca" className="hover:text-ink-700">
                Generar DeCA
              </Link>
              <Link to="/programa-deca" className="hover:text-ink-700">
                Programa DeCA
              </Link>
              <Link to="/alternativa-simple-ministerio" className="hover:text-ink-700">
                Alternativa a SIMPLE
              </Link>
              <Link to="/guias" className="hover:text-ink-700">
                Guías
              </Link>
              <Link to="/terminos" className="hover:text-ink-700">
                Términos de Servicio
              </Link>
              <Link to="/privacidad" className="hover:text-ink-700">
                Política de Privacidad
              </Link>
              <Link to="/aviso-legal" className="hover:text-ink-700">
                Aviso Legal
              </Link>
            </nav>
          </div>
          <div className="flex w-full flex-col items-center gap-1 border-t border-ink-100 pt-4 text-center text-xs sm:flex-row sm:justify-between sm:text-left">
            <p>© {new Date().getFullYear()} DeCA. Todos los derechos reservados.</p>
            <p>Grupo Noveldi SL · CIF B04414645 · Urbanización La Paloma 58, 30850 Totana (Murcia)</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
