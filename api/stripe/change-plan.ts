import type { VercelRequest, VercelResponse } from '@vercel/node'
import type Stripe from 'stripe'
import { ensureStripeCustomer, FiscalSyncError } from '../_lib/customerFiscalSync.js'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin.js'
import { getStripe, PRICE_IDS, type PlanId } from '../_lib/stripe.js'

/** Switches an already-subscribed company to a different self-serve plan
 * (up or down) on their existing Stripe subscription, instead of sending
 * them through Checkout again. `proration_behavior: 'always_invoice'` bills
 * and attempts to charge the prorated difference immediately (using the
 * saved default payment method) instead of silently rolling it into next
 * month's invoice with no visible charge or confirmation — that silent
 * behavior read as "the plan change did nothing" to a customer expecting to
 * pay more (or see a credit) right away. `plan`/`subscriptionStatus`/
 * `currentPeriodEnd`/`cancelAtPeriodEnd` are written to Firestore here too,
 * not left solely to the `customer.subscription.updated` webhook (which has
 * shown intermittent delivery failures in production) — same fast-path
 * pattern as cancel-subscription.ts. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const plan = req.body?.plan as PlanId | undefined
    if (!plan || !(plan in PRICE_IDS) || !PRICE_IDS[plan]) {
      return res.status(400).json({ error: 'Plan inválido' })
    }

    const { email, company, companyRef } = await requireCompanyAdmin(req)
    if (!company.nif || !company.domicilio) {
      return res.status(400).json({ error: 'Completa el NIF/CIF y el domicilio de tu empresa antes de cambiar de plan' })
    }

    const subscriptionId = company.stripeSubscriptionId as string | undefined
    if (!subscriptionId) return res.status(400).json({ error: 'Esta empresa todavía no tiene una suscripción activa' })

    const stripe = await getStripe()
    // Keep the invoice's fiscal data current in case nif/domicilio changed
    // since the subscription started.
    await ensureStripeCustomer(stripe, company.stripeCustomerId as string | undefined, email, {
      nombre: company.nombre as string,
      nif: company.nif as string,
      domicilio: company.domicilio as string,
    })

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const itemId = subscription.items.data[0]?.id
    if (!itemId) return res.status(500).json({ error: 'No se encontró el detalle de la suscripción' })
    if (subscription.items.data[0]?.price.id === PRICE_IDS[plan]) {
      return res.status(400).json({ error: 'Ya tienes contratado ese plan' })
    }

    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, price: PRICE_IDS[plan] }],
      proration_behavior: 'always_invoice',
      metadata: { ...subscription.metadata, plan },
      expand: ['latest_invoice'],
    })

    const item = updated.items.data[0]
    await companyRef.update({
      plan,
      subscriptionStatus: updated.status,
      currentPeriodEnd: item ? new Date(item.current_period_end * 1000).toISOString() : null,
      cancelAtPeriodEnd: updated.cancel_at_period_end,
    })

    const invoice = updated.latest_invoice as Stripe.Invoice | null
    return res.status(200).json({
      ok: true,
      charged: invoice?.amount_paid ?? null,
      currency: invoice?.currency ?? null,
      invoiceStatus: invoice?.status ?? null,
    })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    if (err instanceof FiscalSyncError) return res.status(400).json({ error: err.message })
    console.error('change-plan error', err)
    return res.status(500).json({ error: 'No se pudo cambiar de plan' })
  }
}
