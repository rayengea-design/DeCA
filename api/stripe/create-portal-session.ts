import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin'
import { getStripe } from '../_lib/stripe'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { company } = await requireCompanyAdmin(req)
    const customerId = company.stripeCustomerId as string | undefined
    if (!customerId) return res.status(400).json({ error: 'Esta empresa todavía no tiene una suscripción' })

    const origin = `https://${req.headers.host}`
    const session = await getStripe().billingPortal.sessions.create({
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
