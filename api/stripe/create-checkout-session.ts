import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureStripeCustomer } from '../_lib/customerFiscalSync.js'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin.js'
import { getStripe, PRICE_IDS, type PlanId } from '../_lib/stripe.js'

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

    const stripe = await getStripe()
    const origin = `https://${req.headers.host}`

    const customerId = await ensureStripeCustomer(stripe, company.stripeCustomerId as string | undefined, email, {
      nombre: company.nombre as string,
      nif: company.nif as string,
      domicilio: company.domicilio as string,
    })
    if (customerId !== company.stripeCustomerId) {
      await companyRef.update({ stripeCustomerId: customerId })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: companyRef.id,
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      subscription_data: { metadata: { companyId: companyRef.id, plan } },
      success_url: `${origin}/app/facturacion?checkout=exito`,
      cancel_url: `${origin}/app/facturacion?checkout=cancelado`,
      locale: 'es',
      allow_promotion_codes: true,
      // Stripe Tax is already configured on this account (origin address +
      // registro fiscal en España) — this makes Stripe calculate and itemize
      // IVA on every invoice automatically, using the Customer's address
      // (already set to Spain by ensureStripeCustomer above) to determine
      // the rate. Without this, invoices carry no tax line at all.
      automatic_tax: { enabled: true },
      // Stripe enables "Managed Payments" (Stripe as merchant of record,
      // handling tax collection/remittance) by default on newer accounts —
      // it requires a tax_code on every Price and is a real business/legal
      // decision (who the merchant of record is) that shouldn't be turned
      // on as a side effect of a missing config value. Off until that's a
      // deliberate choice.
      managed_payments: { enabled: false },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    console.error('create-checkout-session error', err)
    return res.status(500).json({ error: 'No se pudo iniciar el pago' })
  }
}
