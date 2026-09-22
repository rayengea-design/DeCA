import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Clock, ExternalLink, FileText, Loader2, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { EmbeddedPayment } from '@/components/billing/EmbeddedPayment'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/context/AuthContext'
import { daysUntilPeriodEnd, memberLimitFor, PLAN_NAMES, PLANS, WHATSAPP_CONTACT_URL } from '@/lib/plans'
import { daysSinceSignup, isSubscribed, TRIAL_DAY_LIMIT, TRIAL_DOC_LIMIT } from '@/lib/trial'
import { formatDate } from '@/lib/utils'
import { changePlan, createSubscriptionIntent, openBillingPortal } from '@/services/billingService'
import { updateCompanyInfo } from '@/services/companyService'
import type { SelfServePlanId } from '@/types/deca'

const infoSchema = z.object({
  nif: z.string().min(3, 'Obligatorio'),
  domicilio: z.string().min(5, 'Obligatorio'),
})

type InfoFormValues = z.infer<typeof infoSchema>

export function BillingPage() {
  const { user, profile, company } = useAuth()
  const [searchParams] = useSearchParams()
  const [savedInfo, setSavedInfo] = useState<{ nif: string; domicilio: string } | null>(null)
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoError, setInfoError] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState<SelfServePlanId | 'portal' | null>(null)
  const [billingError, setBillingError] = useState<string | null>(null)
  const [planChanged, setPlanChanged] = useState<SelfServePlanId | null>(null)
  const [checkout, setCheckout] = useState<{ plan: SelfServePlanId; clientSecret: string } | null>(null)
  const [paymentSucceeded, setPaymentSucceeded] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InfoFormValues>({ resolver: zodResolver(infoSchema) })

  if (profile && profile.role !== 'admin') return <Navigate to="/app" replace />
  if (!user || !company) return null

  const nif = savedInfo?.nif ?? company.nif
  const domicilio = savedInfo?.domicilio ?? company.domicilio
  const subscribed = isSubscribed(company)
  const docsUsed = company.decaCount ?? 0
  const daysRemaining = Math.max(0, TRIAL_DAY_LIMIT - daysSinceSignup(company))
  const checkoutResult = searchParams.get('checkout')
  const membersUsed = company.memberCount ?? 1
  const memberLimit = memberLimitFor(company)
  const hasFiscalInfo = Boolean(nif && domicilio)
  const periodEndDays = daysUntilPeriodEnd(company)

  async function handleChoosePlan(plan: SelfServePlanId) {
    setBillingError(null)
    setPaymentSucceeded(false)
    setRedirecting(plan)
    try {
      const clientSecret = await createSubscriptionIntent(user!, plan)
      setCheckout({ plan, clientSecret })
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : 'No se pudo iniciar el pago.')
    } finally {
      setRedirecting(null)
    }
  }

  function handlePaymentSuccess() {
    setCheckout(null)
    setPaymentSucceeded(true)
  }

  async function handleChangePlan(plan: SelfServePlanId) {
    setBillingError(null)
    setPlanChanged(null)
    setRedirecting(plan)
    try {
      await changePlan(user!, plan)
      setPlanChanged(plan)
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : 'No se pudo cambiar de plan.')
    } finally {
      setRedirecting(null)
    }
  }

  async function handleManageBilling() {
    setBillingError(null)
    setRedirecting('portal')
    try {
      window.location.href = await openBillingPortal(user!)
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : 'No se pudo abrir el portal de facturación.')
      setRedirecting(null)
    }
  }

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
      {(checkoutResult === 'exito' || paymentSucceeded) && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Pago completado. Puede tardar unos segundos en reflejarse aquí.
        </div>
      )}
      {checkoutResult === 'cancelado' && (
        <div className="flex items-center gap-2 rounded-md bg-ink-50 px-4 py-3 text-sm text-ink-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Pago cancelado. No se te ha cobrado nada.
        </div>
      )}
      {billingError && (
        <div className="flex items-center gap-2 rounded-md bg-brand-50 px-4 py-3 text-sm text-brand-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {billingError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tu plan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between rounded-md border border-ink-100 px-4 py-3">
            <div>
              <p className="font-semibold text-ink-900">
                {subscribed ? `Plan ${PLAN_NAMES[company.plan ?? 'basico']}` : 'Prueba gratis'}
              </p>
              <p className="text-sm text-ink-400">
                {subscribed
                  ? company.subscriptionStatus === 'past_due'
                    ? 'Hay un problema con tu último cobro — revisa tu método de pago.'
                    : 'Suscripción activa.'
                  : docsUsed >= TRIAL_DOC_LIMIT || daysRemaining <= 0
                    ? 'Tu periodo de prueba ha terminado.'
                    : `Hasta ${TRIAL_DOC_LIMIT} DeCA o ${TRIAL_DAY_LIMIT} días, lo que llegue antes.`}
              </p>
            </div>
            <span
              className={
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ' +
                (subscribed && company.subscriptionStatus !== 'past_due'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-brand-50 text-brand-700')
              }
            >
              {subscribed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              {subscribed ? (company.subscriptionStatus === 'past_due' ? 'Pago pendiente' : 'Activo') : 'En prueba'}
            </span>
          </div>

          {subscribed && company.currentPeriodEnd && (
            <div className="flex items-center gap-3 rounded-md border border-ink-100 px-4 py-3">
              <Clock className="h-5 w-5 shrink-0 text-ink-400" />
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {company.cancelAtPeriodEnd
                    ? `Se cancela el ${formatDate(company.currentPeriodEnd)}`
                    : `Se renueva el ${formatDate(company.currentPeriodEnd)}`}
                </p>
                <p className="text-xs text-ink-400">
                  {periodEndDays === 0
                    ? 'Hoy'
                    : `${periodEndDays} ${periodEndDays === 1 ? 'día' : 'días'} ${company.cancelAtPeriodEnd ? 'de acceso restantes' : 'para el próximo cobro'}`}
                </p>
              </div>
            </div>
          )}

          <div className={`grid gap-4 ${subscribed ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
            {!subscribed && (
              <>
                <div className="flex items-center gap-3 rounded-md border border-ink-100 px-4 py-3">
                  <FileText className="h-5 w-5 shrink-0 text-ink-400" />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {Math.min(docsUsed, TRIAL_DOC_LIMIT)}/{TRIAL_DOC_LIMIT}
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
              </>
            )}
            {subscribed && periodEndDays !== null && (
              <div className="flex items-center gap-3 rounded-md border border-ink-100 px-4 py-3">
                <Clock className="h-5 w-5 shrink-0 text-ink-400" />
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {periodEndDays} {periodEndDays === 1 ? 'día' : 'días'}
                  </p>
                  <p className="text-xs text-ink-400">
                    {company.cancelAtPeriodEnd
                      ? `Pierdes el acceso el ${formatDate(company.currentPeriodEnd!)}`
                      : `Se renueva el ${formatDate(company.currentPeriodEnd!)}`}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-md border border-ink-100 px-4 py-3">
              <Users className="h-5 w-5 shrink-0 text-ink-400" />
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {membersUsed}/{Number.isFinite(memberLimit) ? memberLimit : '∞'}
                </p>
                <p className="text-xs text-ink-400">Cuentas de equipo (admin + conductores)</p>
              </div>
            </div>
          </div>
          {subscribed && company.cancelAtPeriodEnd && (
            <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Has cancelado tu suscripción — sigues teniendo acceso hasta esa fecha, luego pasa a prueba caducada.
            </div>
          )}

          {subscribed && (
            <Button onClick={handleManageBilling} disabled={redirecting !== null} className="self-start">
              {redirecting === 'portal' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Gestionar facturación
            </Button>
          )}
        </CardContent>
      </Card>

      {!hasFiscalInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Completa los datos de facturación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-ink-500">
              Necesarios antes de suscribirte o cambiar de plan — son los datos con los que Stripe emite tus
              facturas, para que puedas contabilizarlas.
            </p>
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

      <Card>
        <CardHeader>
          <CardTitle>
            {checkout ? `Pagar plan ${PLAN_NAMES[checkout.plan]}` : subscribed ? 'Cambiar de plan' : 'Elige un plan'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {planChanged && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Plan cambiado a {PLAN_NAMES[planChanged]}. Puede tardar unos segundos en reflejarse aquí.
            </div>
          )}
          {checkout ? (
            <EmbeddedPayment
              key={checkout.clientSecret}
              clientSecret={checkout.clientSecret}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setCheckout(null)}
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                {PLANS.map((plan) => {
                  const isCurrent = subscribed && company.plan === plan.id
                  return (
                    <div
                      key={plan.id}
                      className={`flex flex-col rounded-lg border p-4 ${isCurrent ? 'border-brand-500 ring-1 ring-brand-500' : 'border-ink-100'}`}
                    >
                      <p className="font-heading text-lg font-bold text-ink-900">{plan.name}</p>
                      <p className="mt-0.5 text-sm text-ink-400">{plan.price}</p>
                      <ul className="mt-3 flex flex-1 flex-col gap-1.5">
                        {plan.features.map((f) => (
                          <li key={f} className="text-xs text-ink-500">
                            · {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => (subscribed ? handleChangePlan(plan.id) : handleChoosePlan(plan.id))}
                        disabled={isCurrent || redirecting !== null || !hasFiscalInfo}
                        className="mt-4"
                        variant={isCurrent ? 'outline' : plan.id === 'flota' ? 'default' : 'outline'}
                        title={!hasFiscalInfo ? 'Completa antes tus datos de facturación' : undefined}
                      >
                        {redirecting === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isCurrent ? 'Plan actual' : subscribed ? `Cambiar a ${plan.name}` : `Elegir ${plan.name}`}
                      </Button>
                    </div>
                  )
                })}
              </div>
              <p className="text-center text-xs text-ink-400">
                El IVA correspondiente se calcula y se muestra desglosado en el momento del pago.
              </p>
              <p className="text-center text-xs text-ink-400">
                ¿Más de 50 conductores?{' '}
                <a
                  href={WHATSAPP_CONTACT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand-600 hover:underline"
                >
                  Habla con nosotros
                </a>{' '}
                sobre el plan Flota+.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
