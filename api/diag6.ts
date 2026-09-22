import type { VercelResponse } from '@vercel/node'
import { getStripe } from './_lib/stripe'

export default async function handler(_req: unknown, res: VercelResponse) {
  try {
    const stripe = await getStripe()
    res.status(200).json({ ok: true, stripeOk: Boolean(stripe) })
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null })
  }
}
