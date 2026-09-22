import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Clock, FileText, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/context/AuthContext'
import { updateCompanyInfo } from '@/services/companyService'
import { getDecaDocumentCount } from '@/services/decaService'

const TRIAL_DOC_LIMIT = 10
const TRIAL_DAY_LIMIT = 5

const infoSchema = z.object({
  nif: z.string().min(3, 'Obligatorio'),
  domicilio: z.string().min(5, 'Obligatorio'),
})

type InfoFormValues = z.infer<typeof infoSchema>

export function BillingPage() {
  const { profile, company } = useAuth()
  // Captured once per mount (not read live) — this page doesn't need to
  // tick in real time, and calling `Date.now()` directly during render is
  // an impure read React's compiler warns against.
  const [now] = useState(() => Date.now())
  const [docsUsed, setDocsUsed] = useState<number | null>(null)
  const [savedInfo, setSavedInfo] = useState<{ nif: string; domicilio: string } | null>(null)
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoError, setInfoError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InfoFormValues>({ resolver: zodResolver(infoSchema) })

  useEffect(() => {
    if (!company) return
    getDecaDocumentCount(company.id).then(setDocsUsed)
  }, [company])

  if (profile && profile.role !== 'admin') return <Navigate to="/app" replace />
  if (!company) return null

  const nif = savedInfo?.nif ?? company.nif
  const domicilio = savedInfo?.domicilio ?? company.domicilio

  const daysElapsed = Math.floor((now - new Date(company.createdAt).getTime()) / (24 * 60 * 60 * 1000))
  const daysRemaining = Math.max(0, TRIAL_DAY_LIMIT - daysElapsed)
  const docsRemaining = docsUsed === null ? null : Math.max(0, TRIAL_DOC_LIMIT - docsUsed)
  const trialExpired = daysRemaining <= 0 || (docsRemaining !== null && docsRemaining <= 0)

  async function onSubmitInfo(values: InfoFormValues) {
    setInfoError(null)
    setSavingInfo(true)
    try {
      await updateCompanyInfo(company!.id, values)
      setSavedInfo(values)
    } catch {
      setInfoError('No se pudieron guardar los datos. Inténtalo de nuevo.')
    } finally {
      setSavingInfo(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Tu plan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between rounded-md border border-ink-100 px-4 py-3">
            <div>
              <p className="font-semibold text-ink-900">Prueba gratis</p>
              <p className="text-sm text-ink-400">
                {trialExpired
                  ? 'Tu periodo de prueba ha terminado.'
                  : `Hasta ${TRIAL_DOC_LIMIT} DeCA o ${TRIAL_DAY_LIMIT} días, lo que llegue antes.`}
              </p>
            </div>
            {trialExpired ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <AlertCircle className="h-3.5 w-3.5" />
                Finalizada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <Clock className="h-3.5 w-3.5" />
                En prueba
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-md border border-ink-100 px-4 py-3">
              <FileText className="h-5 w-5 shrink-0 text-ink-400" />
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {docsUsed === null ? '—' : `${Math.min(docsUsed, TRIAL_DOC_LIMIT)}/${TRIAL_DOC_LIMIT}`}
                </p>
                <p className="text-xs text-ink-400">Documentos generados</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-ink-100 px-4 py-3">
              <Clock className="h-5 w-5 shrink-0 text-ink-400" />
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {daysRemaining}/{TRIAL_DAY_LIMIT} días restantes
                </p>
                <p className="text-xs text-ink-400">Desde el alta de tu empresa</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Button disabled className="self-start">
              Gestionar facturación
            </Button>
            <p className="text-xs text-ink-400">
              Próximamente: elige un plan de pago y gestiona tu suscripción y método de pago desde aquí.
            </p>
          </div>
        </CardContent>
      </Card>

      {(!nif || !domicilio) && (
        <Card>
          <CardHeader>
            <CardTitle>Completa los datos de facturación</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmitInfo)} className="flex flex-col gap-4">
              {infoError && (
                <div className="flex items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {infoError}
                </div>
              )}
              {savedInfo && (
                <div className="flex items-center gap-2 rounded-md bg-ink-50 px-3 py-2 text-sm text-ink-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-500" />
                  Datos guardados.
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
              <Button type="submit" disabled={savingInfo} className="self-start">
                {savingInfo && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
