import type { VercelResponse } from '@vercel/node'

export default async function handler(_req: unknown, res: VercelResponse) {
  try {
    const Stripe = (await import('stripe')).default
    const hasKey = Boolean(process.env.STRIPE_SECRET_KEY)
    const keyPrefix = process.env.STRIPE_SECRET_KEY?.slice(0, 8) ?? null
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_invalid')
    const products = hasKey
      ? await stripe.products.list({ limit: 1 }).catch((e) => ({ error: String(e) }))
      : null
    res.status(200).json({ ok: true, hasKey, keyPrefix, apiCallOk: Boolean(products && !('error' in products)) })
  } catch (err) {
    res.status(500).json({ ok: false, stage: 'stripe', error: String(err), stack: err instanceof Error ? err.stack : null })
  }
}
