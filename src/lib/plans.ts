import { isSubscribed } from '@/lib/trial'
import type { Company, PlanId, SelfServePlanId } from '@/types/deca'

export const TRIAL_MEMBER_LIMIT = 3

interface PlanDef {
  id: SelfServePlanId
  name: string
  price: string
  memberLimit: number
  features: string[]
}

// Kept in sync by hand with the mirror copy in firestore.rules'
// `memberLimit()` (rules can't import this) and with the Stripe Price ids in
// api/_lib/stripe.ts — the price shown here is cosmetic only, Stripe is the
// actual source of truth for what gets charged.
export const PLANS: PlanDef[] = [
  {
    id: 'basico',
    name: 'Básico',
    price: '19€/mes',
    memberLimit: 3,
    features: ['Hasta 3 conductores', 'DeCA ilimitados', 'Historial y exportación CSV'],
  },
  {
    id: 'flota',
    name: 'Flota',
    price: '49€/mes',
    memberLimit: 10,
    features: ['Hasta 10 conductores', 'Corrección de documentos', 'Soporte prioritario'],
  },
  {
    id: 'empresa',
    name: 'Empresa',
    price: '99€/mes',
    memberLimit: 50,
    features: ['Hasta 50 conductores', 'Todo lo del plan Flota', 'Soporte prioritario'],
  },
]

export const PLAN_NAMES: Record<PlanId, string> = {
  basico: 'Básico',
  flota: 'Flota',
  empresa: 'Empresa',
  flota_plus: 'Flota+',
}

const PLAN_MEMBER_LIMITS: Record<PlanId, number> = {
  basico: 3,
  flota: 10,
  empresa: 50,
  flota_plus: Infinity,
}

/** How many active team accounts (admin + non-disabled conductores) this
 * company is allowed — the trial and every paid plan below Flota+ cap the
 * team size, so a company can't outgrow its subscription for free. */
export function memberLimitFor(company: Company): number {
  if (isSubscribed(company) && company.plan) return PLAN_MEMBER_LIMITS[company.plan]
  return TRIAL_MEMBER_LIMIT
}
