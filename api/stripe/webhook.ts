import type { VercelRequest, VercelResponse } from '@vercel/node'
import type Stripe from 'stripe'
import { adminDb } from '../_lib/firebaseAdmin'
import { PRICE_IDS, stripe } from '../_lib/stripe'

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

  const priceId = subscription.items.data[0]?.price.id
  const item = subscription.items.data[0]

  await adminDb
    .collection('companies')
    .doc(companyId)
    .update({
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      plan: planFromPriceId(priceId) ?? null,
      currentPeriodEnd: item ? new Date(item.current_period_end * 1000).toISOString() : null,
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
