import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

/** A brand-new account has no company name on file yet — the admin normally
 * fills it in when creating the account so it can be set up properly in
 * advance, but if someone reaches this page anyway (e.g. a test account),
 * this stands in rather than blocking them with a form:
 * "empresa.nueva.test@..." → "Empresa Nueva Test". */
function nameFromEmail(email: string) {
  const local = email.split('@')[0] ?? email
  return local
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

export function CompanySetupPage() {
  const { user, company, loading: authLoading, setupCompany } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!user || company || started.current) return
    started.current = true
    setupCompany({ nombre: nameFromEmail(user.email ?? 'Mi empresa') }).catch(() => {
      started.current = false
      setError('No se pudo configurar la cuenta. Recarga la página para reintentarlo.')
    })
  }, [user, company, setupCompany])

  if (!authLoading && !user) return <Navigate to="/login" replace />
  if (company) return <Navigate to="/app" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <Logo />
        {error ? (
          <>
            <p className="text-sm text-brand-600">{error}</p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </>
        ) : (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            <p className="text-sm text-ink-400">Configurando tu cuenta…</p>
          </>
        )}
      </div>
    </div>
  )
}
