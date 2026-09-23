import { AlertCircle, ExternalLink, Gift, Loader2, ShieldOff, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useAuth } from '@/context/AuthContext'
import { daysUntilPeriodEnd, PLAN_NAMES } from '@/lib/plans'
import { formatDate } from '@/lib/utils'
import {
  AdminApiError,
  type AdminCompanyRow,
  deleteCompany,
  grantPlan,
  listAllCompanies,
} from '@/services/adminService'
import type { PlanId } from '@/types/deca'

const GRANTABLE_PLANS: PlanId[] = ['basico', 'flota', 'empresa', 'flota_plus']

type PlanFilter = 'all' | 'trial' | 'comped' | PlanId
const PLAN_FILTER_OPTIONS: { value: PlanFilter; label: string }[] = [
  { value: 'all', label: 'Todos los planes' },
  { value: 'trial', label: 'Prueba' },
  { value: 'basico', label: PLAN_NAMES.basico },
  { value: 'flota', label: PLAN_NAMES.flota },
  { value: 'empresa', label: PLAN_NAMES.empresa },
  { value: 'flota_plus', label: PLAN_NAMES.flota_plus },
  { value: 'comped', label: 'Regalado' },
]

type StatusFilter = 'all' | 'trial' | 'active' | 'past_due' | 'canceled'
const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'trial', label: 'En prueba' },
  { value: 'active', label: 'Activa' },
  { value: 'past_due', label: 'Pago pendiente' },
  { value: 'canceled', label: 'Cancelada' },
]

// Only for statuses that can actually land here — grant-plan.ts and the
// Stripe webhook only ever write these, plus null while on the free trial.
const STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  past_due: 'Pago pendiente',
  canceled: 'Cancelada',
  trialing: 'En prueba (Stripe)',
  incomplete: 'Pago incompleto',
  incomplete_expired: 'Pago incompleto (caducado)',
  unpaid: 'Impagada',
}

export function AdminPanelPage() {
  const { user, loading: authLoading, loginWithGoogle } = useAuth()
  const [companies, setCompanies] = useState<AdminCompanyRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Record<string, PlanId>>({})
  const [googleLoading, setGoogleLoading] = useState(false)
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<AdminCompanyRow | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) return
    listAllCompanies(user)
      .then((data) => {
        setForbidden(false)
        setCompanies(data)
      })
      .catch((err) => {
        if (err instanceof AdminApiError && err.status === 403) setForbidden(true)
        else setError('No se pudo cargar la lista de empresas.')
      })
  }, [user])

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch {
      setError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.')
    } finally {
      setGoogleLoading(false)
    }
  }

  if (!authLoading && !user) return <Navigate to="/login" replace />

  async function handleGrant(companyId: string) {
    if (!user) return
    const plan = selectedPlan[companyId] ?? 'basico'
    setPendingId(companyId)
    setError(null)
    try {
      await grantPlan(user, companyId, plan)
      setCompanies((prev) =>
        prev?.map((c) => (c.id === companyId ? { ...c, plan, subscriptionStatus: 'active', comped: true } : c)) ?? null,
      )
    } catch {
      setError('No se pudo regalar el plan. Inténtalo de nuevo.')
    } finally {
      setPendingId(null)
    }
  }

  async function handleRevoke(companyId: string) {
    if (!user) return
    setPendingId(companyId)
    setError(null)
    try {
      await grantPlan(user, companyId, null)
      setCompanies(
        (prev) =>
          prev?.map((c) => (c.id === companyId ? { ...c, plan: null, subscriptionStatus: null, comped: false } : c)) ??
          null,
      )
    } catch {
      setError('No se pudo quitar el plan. Inténtalo de nuevo.')
    } finally {
      setPendingId(null)
    }
  }

  const filteredCompanies = useMemo(() => {
    if (!companies) return null
    const q = search.trim().toLowerCase()
    return companies.filter((c) => {
      if (planFilter === 'trial' && c.plan) return false
      if (planFilter === 'comped' && !c.comped) return false
      if (planFilter !== 'all' && planFilter !== 'trial' && planFilter !== 'comped' && c.plan !== planFilter) {
        return false
      }
      if (statusFilter === 'trial' && c.plan) return false
      if (statusFilter !== 'all' && statusFilter !== 'trial' && c.subscriptionStatus !== statusFilter) return false
      if (q && !c.nombre.toLowerCase().includes(q) && !c.nif.toLowerCase().includes(q)) return false
      return true
    })
  }, [companies, planFilter, statusFilter, search])

  async function handleDeleteConfirm() {
    if (!user || !deleteTarget || deleteConfirmText !== deleteTarget.nombre) return
    setDeleting(true)
    setError(null)
    try {
      await deleteCompany(user, deleteTarget.id)
      setCompanies((prev) => prev?.filter((c) => c.id !== deleteTarget.id) ?? null)
      setDeleteTarget(null)
      setDeleteConfirmText('')
    } catch {
      setError('No se pudo eliminar la empresa. Inténtalo de nuevo.')
    } finally {
      setDeleting(false)
    }
  }

  if (forbidden) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink-50 px-4 text-center">
        <ShieldOff className="h-8 w-8 text-ink-400" />
        <p className="font-semibold text-ink-900">No tienes acceso a esta página</p>
        <p className="max-w-sm text-sm text-ink-400">
          El panel de administración solo se puede usar iniciando sesión con Google, con el email
          autorizado.
        </p>
        <Button type="button" variant="outline" disabled={googleLoading} onClick={handleGoogleSignIn}>
          {googleLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Continuar con Google
        </Button>
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-100 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Logo size="sm" />
          <p className="text-sm font-semibold text-ink-900">Panel de administración</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-brand-50 px-4 py-3 text-sm text-brand-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {!companies ? (
          <div className="flex items-center justify-center py-16 text-ink-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Empresas', value: companies.length },
                {
                  label: 'Suscripciones activas',
                  value: companies.filter((c) => c.subscriptionStatus === 'active' && !c.comped).length,
                },
                { label: 'Planes regalados', value: companies.filter((c) => c.comped).length },
                {
                  label: 'Pago pendiente',
                  value: companies.filter((c) => c.subscriptionStatus === 'past_due').length,
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-ink-100 bg-white px-4 py-3">
                  <p className="text-lg font-bold text-ink-900">{stat.value}</p>
                  <p className="text-xs text-ink-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Input
                placeholder="Buscar por nombre o NIF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-56 text-sm"
              />
              <Select value={planFilter} onValueChange={(v) => setPlanFilter(v as PlanFilter)}>
                <SelectTrigger className="h-9 w-40 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_FILTER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="h-9 w-44 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-ink-400">
                {filteredCompanies?.length ?? 0} de {companies.length}
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-ink-100 bg-white">
              <table className="w-full min-w-[1150px] text-left text-sm">
                <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                  <tr>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Alta</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Renovación</th>
                    <th className="px-4 py-3">DeCA</th>
                    <th className="px-4 py-3">Equipo</th>
                    <th className="px-4 py-3">Regalar plan</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies?.map((c) => (
                    <tr key={c.id} className="border-b border-ink-50 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink-900">{c.nombre || '—'}</p>
                        <p className="text-xs text-ink-400">{c.nif || 'Sin NIF'}</p>
                        {c.stripeCustomerId && (
                          <a
                            href={`https://dashboard.stripe.com/customers/${c.stripeCustomerId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ver en Stripe
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-500">{c.createdAt ? formatDate(c.createdAt) : '—'}</td>
                      <td className="px-4 py-3">
                        {c.plan ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                            {PLAN_NAMES[c.plan]}
                            {c.comped && ' (regalo)'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                            Prueba
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {c.subscriptionStatus ? (STATUS_LABELS[c.subscriptionStatus] ?? c.subscriptionStatus) : '—'}
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {c.currentPeriodEnd ? (
                          <>
                            <p>{formatDate(c.currentPeriodEnd)}</p>
                            <p className="text-xs text-ink-400">
                              {c.cancelAtPeriodEnd ? 'Cancelada · ' : ''}
                              {daysUntilPeriodEnd(c)} días
                            </p>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-500">{c.decaCount}</td>
                      <td className="px-4 py-3 text-ink-500">{c.memberCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedPlan[c.id] ?? 'basico'}
                            onValueChange={(v) => setSelectedPlan((prev) => ({ ...prev, [c.id]: v as PlanId }))}
                          >
                            <SelectTrigger className="h-8 w-28 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {GRANTABLE_PLANS.map((p) => (
                                <SelectItem key={p} value={p}>
                                  {PLAN_NAMES[p]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pendingId === c.id}
                            onClick={() => handleGrant(c.id)}
                          >
                            {pendingId === c.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Gift className="h-3.5 w-3.5" />
                            )}
                            Regalar
                          </Button>
                          {c.comped && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={pendingId === c.id}
                              onClick={() => handleRevoke(c.id)}
                            >
                              Quitar
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeleteTarget(c)
                            setDeleteConfirmText('')
                          }}
                          title="Eliminar esta empresa por completo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar {deleteTarget?.nombre}</DialogTitle>
            <DialogDescription>
              Esto borra para siempre su acceso (todas las cuentas de su equipo), todos sus DeCA y PDFs, y cancela su
              suscripción de Stripe si tiene una activa. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <p className="mb-1.5 text-sm text-ink-500">
            Escribe <span className="font-semibold text-ink-900">{deleteTarget?.nombre}</span> para confirmar:
          </p>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleting || deleteConfirmText !== deleteTarget?.nombre}
              onClick={handleDeleteConfirm}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
