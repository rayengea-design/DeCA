import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/context/AuthContext'

const schema = z.object({
  nombre: z.string().min(2, 'Obligatorio'),
  nif: z.string().min(3, 'Obligatorio'),
  domicilio: z.string().min(5, 'Obligatorio'),
})

type FormValues = z.infer<typeof schema>

export function CompanySetupPage() {
  const { user, company, loading: authLoading, setupCompany } = useAuth()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // The state param covers email/password and Google signup (both hand the
  // company/display name forward explicitly). A returning Google user who
  // signs in via /login with no company yet won't have that state, so fall
  // back to their Google profile name rather than leaving the field blank.
  const prefillNombre = (location.state as { nombre?: string } | null)?.nombre ?? user?.displayName ?? ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: prefillNombre, nif: '', domicilio: '' },
  })

  if (!authLoading && !user) return <Navigate to="/login" replace />
  if (company) return <Navigate to="/app" replace />

  async function onSubmit(values: FormValues) {
    setError(null)
    setSubmitting(true)
    try {
      await setupCompany(values)
    } catch {
      setError('No se pudo configurar la cuenta. Inténtalo de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo />
          <p className="text-sm text-ink-400">Un último paso antes de empezar</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Datos de tu empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">Nombre de la empresa</Label>
                <Input id="nombre" {...register('nombre')} />
                {errors.nombre && <p className="text-xs text-brand-600">{errors.nombre.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nif">NIF/CIF</Label>
                <Input id="nif" {...register('nif')} />
                {errors.nif && <p className="text-xs text-brand-600">{errors.nif.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="domicilio">Domicilio fiscal</Label>
                <Input id="domicilio" {...register('domicilio')} />
                {errors.domicilio && <p className="text-xs text-brand-600">{errors.domicilio.message}</p>}
              </div>
              <p className="text-xs text-ink-400">
                Estos datos son los de tu empresa como cliente de DeCA (para la facturación) — el nombre/NIF/domicilio
                de cargador o transportista de cada porte se rellenan aparte, en cada DeCA.
              </p>
              <Button type="submit" disabled={submitting} className="mt-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Continuar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
