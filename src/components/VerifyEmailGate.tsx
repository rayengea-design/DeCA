import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

/** Blocks `/configurar-empresa` (the only route that can ever mint a new
 * company — see AuthContext.setupCompany) until a password-account user has
 * confirmed their email. That single choke point is deliberate: it stops
 * anyone from registering a company under an email they don't own, without
 * touching `/app` at all, so a team member's account — created directly by
 * their own company admin via teamService.createTeamMember, which never
 * sends a verification email and never routes through this page — is never
 * affected. Google accounts skip this entirely; Google already verifies the
 * email before Firebase ever sees it. */
function isRateLimitError(err: unknown): boolean {
  return err instanceof Error && 'code' in err && (err as { code: string }).code === 'auth/too-many-requests'
}

export function VerifyEmailGate() {
  const { user, loading, emailVerified, verificationEmailFailed, resendVerificationEmail, checkEmailVerified } =
    useAuth()
  const [resent, setResent] = useState(false)
  const [resending, setResending] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    )
  }

  // Not signed in — CompanySetupPage's own guard redirects to /login.
  if (!user) return <Outlet />

  const isPasswordAccount = user.providerData.some((p) => p.providerId === 'password')
  if (!isPasswordAccount || emailVerified) return <Outlet />

  async function handleResend() {
    setResending(true)
    setError(null)
    try {
      await resendVerificationEmail()
      setResent(true)
    } catch (err) {
      setError(
        isRateLimitError(err)
          ? 'Se han pedido demasiados envíos seguidos — Firebase bloquea el envío durante un rato. Espera unos 30-60 minutos e inténtalo de nuevo.'
          : 'No se pudo reenviar el email. Espera unos minutos e inténtalo de nuevo.',
      )
    } finally {
      setResending(false)
    }
  }

  async function handleCheck() {
    setChecking(true)
    setError(null)
    try {
      const verified = await checkEmailVerified()
      if (!verified) {
        setError('Todavía no hemos detectado la confirmación. Comprueba que hayas pulsado el enlace del email.')
      }
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo />
        </div>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-ink-100 bg-white p-6 text-center shadow-sm">
          <Mail className="h-8 w-8 text-brand-500" />
          <div>
            <p className="font-semibold text-ink-900">Confirma tu email</p>
            {verificationEmailFailed ? (
              <p className="mt-1 text-sm text-ink-400">
                No hemos podido enviar el email de confirmación a <strong>{user.email}</strong> todavía
                (puede que se haya superado el límite de envíos por ahora). Pulsa "Reenviar email" para
                intentarlo de nuevo — puede que tengas que esperar unos minutos.
              </p>
            ) : (
              <p className="mt-1 text-sm text-ink-400">
                Te hemos enviado un enlace de confirmación a <strong>{user.email}</strong>. Ábrelo para
                poder configurar tu empresa — así comprobamos que el email es real.
              </p>
            )}
          </div>
          {error && (
            <div className="flex w-full items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-left text-sm text-brand-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <Button type="button" onClick={handleCheck} disabled={checking} className="w-full">
            {checking && <Loader2 className="h-4 w-4 animate-spin" />}
            Ya he confirmado mi email
          </Button>
          <Button type="button" variant="outline" onClick={handleResend} disabled={resending || resent} className="w-full">
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : resent ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : null}
            {resent ? 'Email reenviado' : 'Reenviar email'}
          </Button>
        </div>
      </div>
    </div>
  )
}
