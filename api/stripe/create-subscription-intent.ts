import type { VercelRequest, VercelResponse } from '@vercel/node'
import type Stripe from 'stripe'
import { ensureStripeCustomer, FiscalSyncError } from '../_lib/customerFiscalSync.js'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin.js'
import { getStripe, PRICE_IDS, type PlanId } from '../_lib/stripe.js'

/** Creates a subscription in `incomplete` status and hands back its first
 * invoice's PaymentIntent client secret, so the browser can confirm payment
 * with Stripe Elements embedded directly in the app — no redirect to a
 * Stripe-hosted Checkout page. Stripe auto-expires an incomplete
 * subscription after ~23h if the client secret is never confirmed, so an
 * abandoned attempt here needs no cleanup on our end. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const plan = req.body?.plan as PlanId | undefined
    if (!plan || !(plan in PRICE_IDS) || !PRICE_IDS[plan]) {
      return res.status(400).json({ error: 'Plan inválido' })
    }

    const { email, companyRef, company } = await requireCompanyAdmin(req)
    // A subscription without NIF/domicilio on file would generate invoices
    // the client can't actually book in their own accounting — required
    // before any money changes hands, not just recommended.
    if (!company.nif || !company.domicilio) {
      return res.status(400).json({ error: 'Completa el NIF/CIF y el domicilio de tu empresa antes de suscribirte' })
    }
    if (company.subscriptionStatus === 'active' || company.subscriptionStatus === 'past_due') {
      return res.status(400).json({ error: 'Ya tienes una suscripción activa. Usa "Cambiar de plan" en su lugar.' })
    }

    const stripe = await getStripe()

    const customerId = await ensureStripeCustomer(stripe, company.stripeCustomerId as string | undefined, email, {
      nombre: company.nombre as string,
      nif: company.nif as string,
      domicilio: company.domicilio as string,
    })
    if (customerId !== company.stripeCustomerId) {
      await companyRef.update({ stripeCustomerId: customerId })
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: PRICE_IDS[plan] }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      automatic_tax: { enabled: true },
      metadata: { companyId: companyRef.id, plan },
      expand: ['latest_invoice'],
    })

    // This Stripe API version no longer puts the PaymentIntent on the
    // invoice itself (`latest_invoice.payment_intent`/`confirmation_secret`
    // don't exist here) — it now lives on the invoice's default
    // InvoicePayment, a separate resource. `stripe.invoicePayments.list`
    // can't be combined into the subscription-creation call (expand caps
    // out at 4 levels, one short of reaching `payment_intent` from
    // `latest_invoice`), so this is a second request.
    const invoice = subscription.latest_invoice as Stripe.Invoice | null
    let clientSecret: string | null | undefined
    if (invoice) {
      const invoicePayments = await stripe.invoicePayments.list({
        invoice: invoice.id,
        expand: ['data.payment.payment_intent'],
      })
      const defaultPayment = invoicePayments.data.find((p) => p.is_default)
      const paymentIntent =
        defaultPayment?.payment.type === 'payment_intent' ? defaultPayment.payment.payment_intent : undefined
      clientSecret = typeof paymentIntent === 'object' ? paymentIntent?.client_secret : undefined
    }
    if (!clientSecret) {
      console.error('create-subscription-intent: sin client_secret', subscription.id)
      return res.status(500).json({ error: 'No se pudo preparar el pago. Inténtalo de nuevo.' })
    }

    return res.status(200).json({ clientSecret })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    if (err instanceof FiscalSyncError) return res.status(400).json({ error: err.message })
    console.error('create-subscription-intent error', err)
    return res.status(500).json({ error: 'No se pudo iniciar el pago' })
  }
}
