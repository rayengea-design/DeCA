import type Stripe from 'stripe'
import type { DocumentReference } from 'firebase-admin/firestore'

/** `company.stripeSubscriptionId` is only ever updated by the
 * `customer.subscription.updated` webhook (or the fast-path writes in
 * cancel-subscription.ts/change-plan.ts) — if that webhook has ever failed
 * to deliver at the wrong moment, it can keep pointing at a subscription
 * that's since been fully canceled (e.g. replaced by a fresh one after a
 * failed payment). Retrieving a canceled subscription still succeeds, but
 * every write action on it (scheduling a plan change, canceling again)
 * fails outright, so this looks up the customer's actual current
 * subscription and repairs Firestore instead of surfacing a confusing
 * error for something the customer didn't do wrong. */
export async function resolveActiveSubscription(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  stripeCustomerId: string | undefined,
  companyRef: DocumentReference,
): Promise<Stripe.Subscription> {
  if (subscription.status !== 'canceled' || !stripeCustomerId) return subscription

  const candidates = await stripe.subscriptions.list({ customer: stripeCustomerId, status: 'all', limit: 10 })
  const replacement = candidates.data
    .filter((s) => s.status !== 'canceled')
    .sort((a, b) => b.created - a.created)[0]
  if (!replacement) return subscription

  await companyRef.update({ stripeSubscriptionId: replacement.id })
  return replacement
}
