import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { z } from 'zod'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/context/AuthContext'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

const schema = z.object({
  email: z.string().email('Introduce un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  useDocumentMeta('Iniciar sesión | DeCA', 'Inicia sesión en tu cuenta de DeCA para generar y gestionar tus documentos de control administrativo.')
  const { user, login, loginWithGoogle, resetPassword } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [resetEmail, setResetEmail] = useState('')
  const [resetSubmitting, setResetSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (user) return <Navigate to="/app" replace />

  async function onSubmit(values: FormValues) {
    setError(null)
    setLoading(true)
    try {
      await login(values.email, values.password)
    } catch {
      setError('Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch {
      setError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.')
      setGoogleLoading(false)
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault()
    setResetSubmitting(true)
    try {
      await resetPassword(resetEmail.trim())
    } catch {
      // Deliberately silent: showing the same "sent" state whether or not
      // the email exists avoids leaking which emails have an account here.
    } finally {
      setResetSubmitting(false)
      setResetSent(true)
    }
  }

  if (mode === 'reset') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3">
            <Logo />
            <p className="text-sm text-ink-400">Recupera el acceso a tu cuenta</p>
          </div>
          {resetSent ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-ink-100 bg-white p-6 text-center shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <p className="text-sm text-ink-700">
                Si existe una cuenta con ese email, te hemos enviado un enlace para restablecer la
                contraseña. Revisa tu bandeja de entrada (y spam).
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMode('login')
                  setResetSent(false)
                }}
              >
                Volver a iniciar sesión
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleReset}
              className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="resetEmail">Email de tu cuenta</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  autoComplete="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={resetSubmitting} className="mt-2">
                {resetSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar enlace de recuperación
              </Button>
              <Button type="button" variant="ghost" onClick={() => setMode('login')}>
                Volver a iniciar sesión
              </Button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo />
          <p className="text-sm text-ink-400">Inicia sesión en tu cuenta</p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-xs text-brand-600">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && <p className="text-xs text-brand-600">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={googleLoading}
            onClick={handleGoogle}
            className="justify-center"
          >
            {googleLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Continuar con Google
          </Button>
          <p className="text-center text-xs text-ink-400">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-medium text-brand-600 hover:underline">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
