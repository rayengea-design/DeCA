import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin.js'
import { getStripe } from '../_lib/stripe.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { company } = await requireCompanyAdmin(req)
    const customerId = company.stripeCustomerId as string | undefined
    if (!customerId) return res.status(400).json({ error: 'Esta empresa todavía no tiene una suscripción' })

    const stripe = await getStripe()
    // Fixed canonical origin rather than `req.headers.host`: the Host header is
    // client-controllable, and this value ends up as a redirect target, so it
    // shouldn't be derived from untrusted input. Falls back to the request
    // host only for Vercel preview deployments (non-production).
    const origin =
      process.env.VERCEL_ENV === 'production' || !req.headers.host
        ? 'https://www.kreanex.es'
        : `https://${req.headers.host}`
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app/facturacion`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    console.error('create-portal-session error', err)
    return res.status(500).json({ error: 'No se pudo abrir el portal de facturación' })
  }
}
