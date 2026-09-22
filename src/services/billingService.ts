import type { User } from 'firebase/auth'
import type { SelfServePlanId } from '@/types/deca'

async function callBillingApi(path: string, user: User, body?: Record<string, unknown>): Promise<{ url: string }> {
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

export async function startCheckout(user: User, plan: SelfServePlanId): Promise<string> {
  const { url } = await callBillingApi('/api/stripe/create-checkout-session', user, { plan })
  return url
}

export async function openBillingPortal(user: User): Promise<string> {
  const { url } = await callBillingApi('/api/stripe/create-portal-session', user)
  return url
}
