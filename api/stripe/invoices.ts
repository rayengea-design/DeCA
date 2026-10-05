import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin.js'
import { getStripe } from '../_lib/stripe.js'

/** Read-only: the company's own Stripe invoices, so an admin can see and
 * download every charge from inside the app without opening the Stripe
 * billing portal. A company that never subscribed has no Stripe customer yet
 * — that's an empty list, not an error. Draft invoices (no number/PDF) are
 * left out: they're internal Stripe state, not something the client issued. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { company } = await requireCompanyAdmin(req)
    const customerId = company.stripeCustomerId as string | undefined
    if (!customerId) return res.status(200).json({ invoices: [] })

    const stripe = await getStripe()
    const list = await stripe.invoices.list({ customer: customerId, limit: 24 })
    const invoices = list.data
      .filter((inv) => inv.status !== 'draft')
      .map((inv) => ({
        id: inv.id,
        number: inv.number,
        created: inv.created, // unix seconds
        total: inv.total, // smallest currency unit, tax included
        currency: inv.currency,
        status: inv.status,
        hostedUrl: inv.hosted_invoice_url,
        pdfUrl: inv.invoice_pdf,
      }))

    return res.status(200).json({ invoices })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    console.error('stripe/invoices error', err)
    return res.status(500).json({ error: 'No se pudieron cargar las facturas' })
  }
}
