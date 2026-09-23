import type { VercelRequest, VercelResponse } from '@vercel/node'
import type Stripe from 'stripe'
import { getAdminDb } from '../_lib/firebaseAdmin.js'
import { getStripe, PRICE_IDS } from '../_lib/stripe.js'

// Stripe signature verification needs the exact raw request body — Vercel's
// default JSON body parsing would re-serialize it and break the signature.
export const config = { api: { bodyParser: false } }

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function planFromPriceId(priceId: string | undefined): 'basico' | 'flota' | 'empresa' | undefined {
  if (priceId === PRICE_IDS.basico) return 'basico'
  if (priceId === PRICE_IDS.flota) return 'flota'
  if (priceId === PRICE_IDS.empresa) return 'empresa'
  return undefined
}

/** Mirrors a Stripe subscription's status/plan/period onto the company doc
 * it belongs to (identified by `subscription.metadata.companyId`, set when
 * the Checkout Session was created) — the single source of truth
 * `firestore.rules` and the client both read to decide trial/paid access. */
async function syncSubscription(subscription: Stripe.Subscription) {
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
    console.log('Ignorando webhook de suscripción: empresa con plan regalado', companyId)
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  const signature = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !webhookSecret) return res.status(500).send('Webhook no configurado')

  let event: Stripe.Event
  try {
    const rawBody = await readRawBody(req)
    const stripe = await getStripe()
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('Firma de webhook inválida', err)
    return res.status(400).send('Firma inválida')
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const stripe = await getStripe()
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await syncSubscription(subscription)
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscription(event.data.object as Stripe.Subscription)
        break
      }
      // invoice.payment_failed doesn't need its own handler: Stripe also
      // fires customer.subscription.updated with status 'past_due' (and
      // eventually 'unpaid'/'canceled') for the same event, which
      // syncSubscription already picks up — handling both would just update
      // the same fields twice.
      default:
        break
    }
    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('Error procesando webhook', event.type, err)
    return res.status(500).send('Error interno')
  }
}
