import { isSubscribed } from '@/lib/trial'
import type { Company, PlanId, SelfServePlanId } from '@/types/deca'

export const TRIAL_MEMBER_LIMIT = 3

export const WHATSAPP_CONTACT_URL = `https://wa.me/34600794114?text=${encodeURIComponent(
  'Hola, me interesa el plan Flota+ de DeCA.',
)}`

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
    price: '5€/mes',
    memberLimit: 3,
    features: ['Hasta 3 conductores', 'DeCA ilimitados', 'Historial y exportación CSV'],
  },
  {
    id: 'flota',
    name: 'Flota',
    price: '25€/mes',
    memberLimit: 10,
    features: ['Hasta 10 conductores', 'Corrección de documentos', 'Soporte prioritario'],
  },
  {
    id: 'empresa',
    name: 'Empresa',
    price: '75€/mes',
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

/** Days left until the subscription's current billing period ends — when
 * `cancelAtPeriodEnd` is set, that's also the day access actually stops
 * (Stripe keeps a canceled subscription usable through what's already been
 * paid for, rather than cutting it off immediately). `null` when there's no
 * period on file yet (webhook hasn't landed, or no subscription at all).
 * Takes just the one field it needs (not a full `Company`) so it also works
 * for the admin panel's row type, which isn't a `Company`. */
export function daysUntilPeriodEnd(company: { currentPeriodEnd?: string | null }, now = Date.now()): number | null {
  if (!company.currentPeriodEnd) return null
  const ms = new Date(company.currentPeriodEnd).getTime() - now
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}
