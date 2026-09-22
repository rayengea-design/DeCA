import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/context/AuthContext'

const schema = z
  .object({
    nombre: z.string().min(2, 'Obligatorio'),
    email: z.string().email('Introduce un email válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
    aceptaTerminos: z.literal(true, { message: 'Tienes que aceptar los términos para continuar' }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function SignupPage() {
  const { user, signup } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // Guards the `if (user) …` redirect below from racing our own post-signup
  // `navigate()` call: `signup()` can flip `user` to truthy (via Firebase's
  // onAuthStateChanged) on the same tick we're about to navigate ourselves,
  // which would otherwise send a brand-new signup through `/app` (dropping
  // the `nombre` we're handing to `/configurar-empresa`) instead of straight
  // there. State, not a ref, because it needs to affect this render.
  const [justSignedUp, setJustSignedUp] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (user && !justSignedUp) return <Navigate to="/app" replace />

  async function onSubmit(values: FormValues) {
    setError(null)
    setLoading(true)
    try {
      await signup(values.email, values.password)
      setJustSignedUp(true)
      navigate('/configurar-empresa', { state: { nombre: values.nombre } })
    } catch (err) {
      if (err instanceof Error && err.message.includes('auth/email-already-in-use')) {
        setError('Ya existe una cuenta con ese email. Prueba a iniciar sesión.')
      } else {
        setError('No se pudo crear la cuenta. Inténtalo de nuevo.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo />
          <p className="text-sm text-ink-400">Empieza tu prueba gratis</p>
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
            <Label htmlFor="nombre">Nombre de la empresa</Label>
            <Input id="nombre" autoComplete="organization" {...register('nombre')} />
            {errors.nombre && <p className="text-xs text-brand-600">{errors.nombre.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-xs text-brand-600">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password && <p className="text-xs text-brand-600">{errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-brand-600">{errors.confirmPassword.message}</p>}
          </div>
          <label className="flex items-start gap-2 text-xs text-ink-500">
            <input type="checkbox" className="mt-0.5" {...register('aceptaTerminos')} />
            <span>
              He leído y acepto los{' '}
              <Link to="/terminos" target="_blank" className="font-medium text-brand-600 hover:underline">
                Términos de Servicio
              </Link>{' '}
              y la{' '}
              <Link to="/privacidad" target="_blank" className="font-medium text-brand-600 hover:underline">
                Política de Privacidad
              </Link>
              .
            </span>
          </label>
          {errors.aceptaTerminos && <p className="-mt-2 text-xs text-brand-600">{errors.aceptaTerminos.message}</p>}
          <Button type="submit" disabled={loading} className="mt-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear cuenta
          </Button>
          <Button type="button" variant="outline" disabled className="justify-center">
            Continuar con Google (próximamente)
          </Button>
          <p className="text-center text-xs text-ink-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
