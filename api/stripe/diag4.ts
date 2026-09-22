import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin'
import { getStripe, PRICE_IDS } from '../_lib/stripe'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const stripe = getStripe()
    let authError: string | null = null
    try {
      await requireCompanyAdmin(req)
    } catch (e) {
      authError = e instanceof ApiError ? `ApiError(${e.status}): ${e.message}` : String(e)
    }
    res.status(200).json({ ok: true, stripeOk: Boolean(stripe), priceIds: PRICE_IDS, authError })
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null })
  }
}
