import type { VercelRequest, VercelResponse } from '@vercel/node'
import type Stripe from 'stripe'
import { syncSubscriptionToFirestore } from '../_lib/syncSubscriptionToFirestore.js'
import { getStripe } from '../_lib/stripe.js'

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
          await syncSubscriptionToFirestore(subscription)
        }
        break
      }
      // subscription.created covers the embedded-Elements flow: that flow
      // never opens a Checkout Session, so `checkout.session.completed` never
      // fires for it — the subscription is born `incomplete` (created) and
      // then flips to `active` (updated) once the customer confirms payment.
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscriptionToFirestore(event.data.object as Stripe.Subscription)
        break
      }
      // invoice.payment_failed doesn't need its own handler: Stripe also
      // fires customer.subscription.updated with status 'past_due' (and
      // eventually 'unpaid'/'canceled') for the same event, which
      // syncSubscriptionToFirestore already picks up — handling both would
      // just update the same fields twice.
      default:
        break
    }
    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('Error procesando webhook', event.type, err)
    return res.status(500).send('Error interno')
  }
}
