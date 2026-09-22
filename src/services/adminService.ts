import type { User } from 'firebase/auth'
import type { PlanId } from '@/types/deca'

export interface AdminCompanyRow {
  id: string
  nombre: string
  nif: string
  createdAt: string | null
  plan: PlanId | null
  subscriptionStatus: string | null
  comped: boolean
  decaCount: number
  memberCount: number
  hasStripeCustomer: boolean
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

export class AdminApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function callAdminApi(path: string, user: User, init?: RequestInit) {
  const idToken = await user.getIdToken()
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}`, ...init?.headers },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data) throw new AdminApiError(res.status, data?.error ?? 'No se pudo completar la solicitud')
  return data
}

export async function listAllCompanies(user: User): Promise<AdminCompanyRow[]> {
  const data = await callAdminApi('/api/admin/companies', user)
  return data.companies
}

export async function grantPlan(user: User, companyId: string, plan: PlanId | null): Promise<void> {
  await callAdminApi('/api/admin/grant-plan', user, { method: 'POST', body: JSON.stringify({ companyId, plan }) })
}
