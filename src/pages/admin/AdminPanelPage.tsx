import { AlertCircle, Gift, Loader2, ShieldOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useAuth } from '@/context/AuthContext'
import { daysUntilPeriodEnd, PLAN_NAMES } from '@/lib/plans'
import { formatDate } from '@/lib/utils'
import { type AdminCompanyRow, grantPlan, listAllCompanies } from '@/services/adminService'
import type { PlanId } from '@/types/deca'

const GRANTABLE_PLANS: PlanId[] = ['basico', 'flota', 'empresa', 'flota_plus']

export function AdminPanelPage() {
  const { user, loading: authLoading } = useAuth()
  const [companies, setCompanies] = useState<AdminCompanyRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Record<string, PlanId>>({})

  useEffect(() => {
    if (!user) return
    listAllCompanies(user)
      .then(setCompanies)
      .catch((err) => {
        if (err instanceof Error && err.message.includes('acceso')) setForbidden(true)
        else setError('No se pudo cargar la lista de empresas.')
      })
  }, [user])

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

  if (forbidden) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink-50 px-4 text-center">
        <ShieldOff className="h-8 w-8 text-ink-400" />
        <p className="font-semibold text-ink-900">No tienes acceso a esta página</p>
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
          <div className="overflow-x-auto rounded-lg border border-ink-100 bg-white">
            <table className="w-full min-w-[1050px] text-left text-sm">
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
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b border-ink-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{c.nombre || '—'}</p>
                      <p className="text-xs text-ink-400">{c.nif || 'Sin NIF'}</p>
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
                    <td className="px-4 py-3 text-ink-500">{c.subscriptionStatus ?? '—'}</td>
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
                        <Button size="sm" variant="outline" disabled={pendingId === c.id} onClick={() => handleGrant(c.id)}>
                          {pendingId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gift className="h-3.5 w-3.5" />}
                          Regalar
                        </Button>
                        {c.comped && (
                          <Button size="sm" variant="ghost" disabled={pendingId === c.id} onClick={() => handleRevoke(c.id)}>
                            Quitar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
