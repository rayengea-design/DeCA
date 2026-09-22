import {
  CheckCircle2,
  Clock,
  Download,
  History,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: QrCode,
    title: 'PDF con QR en segundos',
    description: 'Rellenas el porte y descargas el DeCA oficial con su código QR de verificación al instante.',
  },
  {
    icon: ShieldCheck,
    title: 'Cumplimiento normativo verificado',
    description: 'Cada campo exigido por la Orden FOM/2861/2012 y la Resolución de 5 de junio de 2026, sin dejar huecos.',
  },
  {
    icon: Users,
    title: 'Un acceso por conductor',
    description: 'Cada conductor genera y ve solo sus DeCA. Tú, como gestor de flota, los ves todos desde un panel.',
  },
  {
    icon: History,
    title: 'Corrección sin perder trazabilidad',
    description: 'Si un dato cambia, emites una corrección enlazada al documento original, tal y como exige la ley.',
  },
  {
    icon: Download,
    title: 'Historial y exportación a CSV',
    description: 'Busca por matrícula o fecha y exporta el histórico completo para tu gestoría o una inspección.',
  },
  {
    icon: MessageCircle,
    title: 'Envío por WhatsApp',
    description: 'Comparte el PDF real con el conductor o el cargador con un solo toque, sin descargar nada a mano.',
  },
  {
    icon: Smartphone,
    title: 'Funciona en el móvil, sin cobertura',
    description: 'Se instala como una app y sigue funcionando aunque la conexión falle en carretera.',
  },
  {
    icon: Clock,
    title: 'Listo antes del 5 de octubre',
    description: 'Da de alta a tu flota hoy y llega con margen a la fecha en que el DeCA pasa a ser obligatorio.',
  },
]

interface PricingPlan {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
}

const plans: PricingPlan[] = [
  {
    name: 'Básico',
    price: '19€',
    period: '/mes',
    description: 'Para autónomos y flotas pequeñas que empiezan con el DeCA.',
    features: ['Hasta 3 conductores', 'DeCA ilimitados', 'Historial y exportación CSV', 'Envío por WhatsApp'],
    cta: 'Empezar prueba gratis',
  },
  {
    name: 'Flota',
    price: '49€',
    period: '/mes',
    description: 'Para empresas de transporte con varios conductores en ruta.',
    features: [
      'Hasta 10 conductores',
      'Todo lo del plan Básico',
      'Corrección de documentos',
      'Soporte prioritario',
    ],
    cta: 'Empezar prueba gratis',
    highlighted: true,
  },
  {
    name: 'Flota+',
    price: 'A medida',
    description: 'Para grupos logísticos con muchos conductores o necesidades propias.',
    features: ['Conductores ilimitados', 'Facturación a medida', 'Alta asistida del equipo', 'SLA dedicado'],
    cta: 'Hablar con nosotros',
  },
]

const faqs = [
  {
    q: '¿Qué es el DeCA y por qué es obligatorio?',
    a: 'El Documento electrónico de Control Administrativo (DeCA) es el documento que deben llevar los transportes nacionales de mercancías por carretera en España, según la Orden FOM/2861/2012 y la Resolución de 5 de junio de 2026. Desde el 5 de octubre de 2026 es obligatorio en cada porte.',
  },
  {
    q: '¿Qué pasa si no lo llevo?',
    a: 'No llevarlo, o llevarlo mal cumplimentado, puede suponer una sanción de entre 401€ y 20.000€ según la infracción.',
  },
  {
    q: '¿Cada conductor necesita su propia cuenta?',
    a: 'Sí, y es lo recomendable: das de alta a cada conductor con su acceso, cada uno genera y ve solo sus propios DeCA, y tú ves los de toda la empresa.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Gestionas tu suscripción, cambias de plan o cancelas desde tu propio panel, sin llamadas ni permanencia.',
  },
  {
    q: '¿Necesito instalar algo?',
    a: 'No. Funciona desde el navegador del móvil o el ordenador, y se puede añadir a la pantalla de inicio como una app.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-ink-100 py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="font-semibold text-ink-900">{q}</span>
        <span className={cn('shrink-0 text-xl leading-none text-ink-400 transition-transform', open && 'rotate-45')}>
          +
        </span>
      </button>
      {open && <p className="mt-2 text-sm text-ink-500">{a}</p>}
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-600 md:flex">
            <a href="#funciones" className="hover:text-ink-900">
              Funciones
            </a>
            <a href="#precios" className="hover:text-ink-900">
              Precios
            </a>
            <a href="#faq" className="hover:text-ink-900">
              Preguntas frecuentes
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/login">Prueba gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(192,9,14,0.35),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-300">
            Obligatorio desde el 5 de octubre de 2026
          </span>
          <h1 className="max-w-2xl font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Genera el DeCA de cada porte en menos de un minuto
          </h1>
          <p className="max-w-xl text-lg text-ink-200">
            El Documento electrónico de Control Administrativo, sin rellenar formularios largos en la web del
            Ministerio. PDF oficial con QR, cumplimiento verificado y todo el equipo desde el móvil.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/login">Empieza gratis 14 días</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              <a href="#precios">Ver precios</a>
            </Button>
          </div>
          <p className="text-sm text-ink-400">Sin tarjeta de crédito · Cancela cuando quieras</p>
        </div>
      </section>

      {/* Sanction strip */}
      <section className="border-b border-ink-100 bg-brand-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-4 text-center sm:flex-row sm:justify-center sm:gap-3 sm:px-6">
          <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm font-medium text-brand-700">
            No llevar el DeCA en regla puede suponer una sanción de entre 401€ y 20.000€ por infracción.
          </p>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink-900">Las herramientas oficiales no están pensadas para tu día a día</h2>
            <p className="mt-3 text-ink-500">
              La web "SIMPLE" del Ministerio obliga a rellenar formularios largos cada vez, no guarda un historial
              ordenado por empresa y no está pensada para que la use un conductor desde el móvil en el momento de
              cargar.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink-900">DeCA hace el mismo trámite en un minuto</h2>
            <p className="mt-3 text-ink-500">
              Genera el documento oficial, con su código QR de verificación, cumpliendo al 100% con la normativa
              vigente. Sin papeleo, sin dobles formularios, sin dudas de si está bien hecho.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funciones" className="border-y border-ink-100 bg-ink-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold text-ink-900">Todo lo que necesita tu flota</h2>
            <p className="mt-2 text-ink-500">Una sola herramienta para generar, corregir y compartir cada DeCA.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border border-ink-100 bg-white p-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-ink-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-ink-900">Cómo funciona</h2>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            { step: '1', title: 'Rellena el porte', body: 'Origen, destino, mercancía, matrículas, cargador y transportista.' },
            { step: '2', title: 'Genera el DeCA', body: 'El PDF oficial con QR se crea al instante, listo para descargar.' },
            { step: '3', title: 'Compártelo', body: 'Envíalo por WhatsApp o que el conductor lo lleve desde el móvil.' },
          ].map((s) => (
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

      {/* Pricing */}
      <section id="precios" className="border-t border-ink-100 bg-ink-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold text-ink-900">Precios simples, sin sorpresas</h2>
            <p className="mt-2 text-ink-500">14 días de prueba gratis en cualquier plan. Sin tarjeta de crédito.</p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
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
                  <Link to="/login">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-heading text-3xl font-bold text-ink-900">Preguntas frecuentes</h2>
        <div className="mt-8">
          {faqs.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ink-900">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-white">Empieza a generar tus DeCA hoy</h2>
          <p className="max-w-xl text-ink-300">
            Da de alta tu empresa en menos de dos minutos y ten tu primer DeCA listo antes de terminar el café.
          </p>
          <Button asChild size="lg">
            <Link to="/login">Empieza gratis 14 días</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-ink-400 sm:flex-row sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} DeCA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
