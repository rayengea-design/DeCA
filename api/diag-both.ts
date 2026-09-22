import type { VercelResponse } from '@vercel/node'

export default async function handler(_req: unknown, res: VercelResponse) {
  try {
    const Stripe = (await import('stripe')).default
    const { cert, getApps, initializeApp } = await import('firebase-admin/app')
    const { getAuth } = await import('firebase-admin/auth')

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_invalid')

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT ?? ''
    const parsed = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'))
    if (!getApps().length) initializeApp({ credential: cert(parsed) })
    const auth = getAuth()

    res.status(200).json({ ok: true, stripeOk: Boolean(stripe), authOk: Boolean(auth) })
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null })
  }
}
