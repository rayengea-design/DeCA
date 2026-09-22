import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'

interface LegalLayoutProps {
  title: string
  updatedAt: string
  children: ReactNode
}

export function LegalLayout({ title, updatedAt, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ink-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo size="sm" />
          <Link to="/" className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-heading text-3xl font-bold text-ink-900">{title}</h1>
        <p className="mt-2 text-sm text-ink-400">Última actualización: {updatedAt}</p>
        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-ink-600 [&_h2]:mt-2 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink-900 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </main>
    </div>
  )
}
