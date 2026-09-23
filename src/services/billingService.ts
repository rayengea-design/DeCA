import type { User } from 'firebase/auth'
import type { SelfServePlanId } from '@/types/deca'

async function callBillingApi(path: string, user: User, body?: Record<string, unknown>): Promise<Record<string, unknown>> {
  const idToken = await user.getIdToken()
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(body ?? {}),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data) throw new Error(data?.error ?? 'No se pudo completar la solicitud')
  return data
}

/** Starts a new subscription without leaving the app — returns a Stripe
 * PaymentIntent client secret to confirm with Elements (see
 * components/billing/EmbeddedPayment.tsx). */
export async function createSubscriptionIntent(user: User, plan: SelfServePlanId): Promise<string> {
  const { clientSecret } = await callBillingApi('/api/stripe/create-subscription-intent', user, { plan })
  return clientSecret as string
}

export async function openBillingPortal(user: User): Promise<string> {
  const { url } = await callBillingApi('/api/stripe/create-portal-session', user)
  return url as string
}

/** `scheduled: true` means the change was scheduled for the end of the
 * current period (the normal case); `false` means it instead undid a
 * previously-scheduled change by re-picking the plan already active. */
export async function changePlan(user: User, plan: SelfServePlanId): Promise<{ scheduled: boolean }> {
  const data = await callBillingApi('/api/stripe/change-plan', user, { plan })
  return { scheduled: Boolean(data.scheduled) }
}

/** `cancel: true` cancels at the end of the current billing period (access
 * continues until then); `false` undoes that before the period ends. */
export async function setSubscriptionCancellation(user: User, cancel: boolean): Promise<void> {
  await callBillingApi('/api/stripe/cancel-subscription', user, { cancel })
}
