import type Stripe from 'stripe'
import { getAdminDb } from './firebaseAdmin.js'
import { PRICE_IDS } from './stripe.js'

function planFromPriceId(priceId: string | undefined): 'basico' | 'flota' | 'empresa' | undefined {
  if (priceId === PRICE_IDS.basico) return 'basico'
  if (priceId === PRICE_IDS.flota) return 'flota'
  if (priceId === PRICE_IDS.empresa) return 'empresa'
  return undefined
}

/** Mirrors a Stripe subscription's status/plan/period onto the company doc
 * it belongs to (identified by `subscription.metadata.companyId`, set when
 * the subscription is created) — the single source of truth
 * `firestore.rules` and the client both read to decide trial/paid access.
 *
 * Shared by the Stripe webhook (the normal path) and by
 * api/stripe/sync-subscription.ts (a client-triggered fast path used right
 * after a payment succeeds), so a customer who just paid becomes active
 * immediately even if that one activation webhook is delayed or dropped —
 * both call exactly the same write, so they can never disagree. */
export async function syncSubscriptionToFirestore(subscription: Stripe.Subscription): Promise<void> {
  const companyId = subscription.metadata.companyId
  if (!companyId) {
    console.error('Subscription sin companyId en metadata', subscription.id)
    return
  }

  const adminDb = await getAdminDb()
  const companyRef = adminDb.collection('companies').doc(companyId)

  // A comped company's plan is admin-controlled and must stay unlimited
  // until the admin explicitly revokes it (api/admin/grant-plan.ts) — never
  // silently downgraded or expired by a Stripe event. This matters even
  // though grant-plan.ts never touches Stripe itself: this same handler
  // fires for ANY subscription tied to this companyId via metadata,
  // including one from *before* the comp (e.g. a real paying customer who
  // later got a gifted plan on top) — without this guard, a delayed webhook
  // for that old subscription could overwrite the gift.
  const companySnap = await companyRef.get()
  if (companySnap.data()?.comped) {
    console.log('Ignorando sync de suscripción: empresa con plan regalado', companyId)
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  const item = subscription.items.data[0]
  const resolvedPlan = planFromPriceId(priceId) ?? null

  await companyRef.update({
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    plan: resolvedPlan,
    currentPeriodEnd: item ? new Date(item.current_period_end * 1000).toISOString() : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    // A scheduled plan change (api/stripe/change-plan.ts) only actually
    // takes effect later, at the Subscription Schedule's phase boundary —
    // that's when Stripe swaps the price and this event fires with it
    // already resolved to the plan that was pending, so this is where
    // `pendingPlan` gets cleared, not at the moment the schedule was set up.
    ...(companySnap.data()?.pendingPlan === resolvedPlan ? { pendingPlan: null } : {}),
  })
}
