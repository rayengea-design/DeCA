import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, KeyRound, Loader2, Plus, ShieldCheck, UserX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/context/AuthContext'
import {
  createTeamMember,
  listCompanyUsers,
  sendTeamMemberPasswordReset,
  setTeamMemberDisabled,
} from '@/services/teamService'
import type { UserProfile } from '@/types/deca'

const schema = z.object({
  nombre: z.string().optional(),
  email: z.string().email('Introduce un email válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormValues = z.infer<typeof schema>

export function TeamPage() {
  const { user, profile, company } = useAuth()
  const [members, setMembers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingUid, setPendingUid] = useState<string | null>(null)
  const [resetSentUid, setResetSentUid] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!company) return
    listCompanyUsers(company.id)
      .then(setMembers)
      .finally(() => setLoading(false))
  }, [company])

  if (profile && profile.role !== 'admin') return <Navigate to="/app" replace />

  async function onSubmit(values: FormValues) {
    if (!company) return
    setError(null)
    setCreating(true)
    try {
      const newMember = await createTeamMember(company.id, values.nombre ?? '', values.email, values.password)
      setMembers((prev) => [...prev, newMember])
      reset()
    } catch (err) {
      if (err instanceof Error && err.message.includes('auth/email-already-in-use')) {
        setError('Ese email ya tiene una cuenta.')
      } else {
        setError('No se pudo crear la cuenta. Inténtalo de nuevo.')
      }
    } finally {
      setCreating(false)
    }
  }

  async function toggleDisabled(uid: string, disabled: boolean) {
    setPendingUid(uid)
    try {
      await setTeamMemberDisabled(uid, disabled)
      setMembers((prev) => prev.map((m) => (m.uid === uid ? { ...m, disabled } : m)))
    } finally {
      setPendingUid(null)
    }
  }

  async function handleResetPassword(m: UserProfile) {
    setPendingUid(m.uid)
    setResetError(null)
    try {
      await sendTeamMemberPasswordReset(m.email)
      setResetSentUid(m.uid)
      setTimeout(() => setResetSentUid(null), 4000)
    } catch (err) {
      const code = err instanceof Error ? err.message : ''
      if (code.includes('auth/too-many-requests')) {
        setResetError('Se han pedido demasiados restablecimientos seguidos para este email. Espera unos minutos.')
      } else if (code.includes('auth/user-not-found')) {
        setResetError('No existe ninguna cuenta con ese email en Authentication.')
      } else {
        setResetError('No se pudo enviar el email de restablecimiento. Inténtalo de nuevo.')
      }
    } finally {
      setPendingUid(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Añadir conductor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="nombre">Nombre (opcional)</Label>
                <Input id="nombre" placeholder="Ej. Juan Pérez" {...register('nombre')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-xs text-brand-600">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-xs text-brand-600">{errors.password.message}</p>}
              </div>
            </div>
            <p className="text-xs text-ink-400">
              Se creará su cuenta con esta contraseña — pásasela tú mismo por el canal que
              prefieras. El conductor solo verá los DeCA que él mismo genere; tú los ves todos.
            </p>
            <Button type="submit" disabled={creating} className="self-start">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              <Plus className="h-4 w-4" />
              Crear conductor
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {resetError && (
            <div className="flex items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {resetError}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-8 text-ink-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map((m) => (
                <div
                  key={m.uid}
                  className="flex items-center justify-between rounded-md border border-ink-100 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-ink-900">
                      {m.nombre || m.email}
                      {m.uid === user?.uid && <span className="ml-2 text-xs text-ink-400">(tú)</span>}
                    </p>
                    <p className="text-xs text-ink-400">
                      {m.email} · {m.role === 'admin' ? 'Administrador' : 'Conductor'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pendingUid === m.uid}
                      onClick={() => handleResetPassword(m)}
                      title="Enviarle un email para que elija una contraseña nueva"
                    >
                      {resetSentUid === m.uid ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <KeyRound className="h-3.5 w-3.5" />
                      )}
                      {resetSentUid === m.uid ? 'Email enviado' : 'Restablecer contraseña'}
                    </Button>
                    {m.role !== 'admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pendingUid === m.uid}
                        onClick={() => toggleDisabled(m.uid, !m.disabled)}
                      >
                        {m.disabled ? <ShieldCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                        {m.disabled ? 'Reactivar' : 'Desactivar'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
