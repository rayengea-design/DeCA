import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin'
import { PRICE_IDS, stripe, type PlanId } from '../_lib/stripe'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const plan = req.body?.plan as PlanId | undefined
    if (!plan || !(plan in PRICE_IDS) || !PRICE_IDS[plan]) {
      return res.status(400).json({ error: 'Plan inválido' })
    }

    const { email, companyRef, company } = await requireCompanyAdmin(req)
    const origin = `https://${req.headers.host}`

    let customerId = company.stripeCustomerId as string | undefined
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: company.nombre,
        metadata: { companyId: companyRef.id },
      })
      customerId = customer.id
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
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    console.error('create-checkout-session error', err)
    return res.status(500).json({ error: 'No se pudo iniciar el pago' })
  }
}
