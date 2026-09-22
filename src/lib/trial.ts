import type { Company } from '@/types/deca'

export const TRIAL_DOC_LIMIT = 10
export const TRIAL_DAY_LIMIT = 5

/** 'active' or 'past_due' both count as "still has access" — Stripe keeps
 * retrying a failed card for a while under 'past_due' before eventually
 * canceling, and locking the company out on the very first failed charge
 * would be harsher than necessary. Kept in sync by hand with the same
 * check in firestore.rules' `canCreateDeca()`. */
export function isSubscribed(company: Company): boolean {
  return company.subscriptionStatus === 'active' || company.subscriptionStatus === 'past_due'
}

export function daysSinceSignup(company: Company, now = Date.now()): number {
  return Math.floor((now - new Date(company.createdAt).getTime()) / (24 * 60 * 60 * 1000))
}

export function isTrialExhausted(company: Company, now = Date.now()): boolean {
  if (isSubscribed(company)) return false
  const docsUsed = company.decaCount ?? 0
  return docsUsed >= TRIAL_DOC_LIMIT || daysSinceSignup(company, now) >= TRIAL_DAY_LIMIT
}
