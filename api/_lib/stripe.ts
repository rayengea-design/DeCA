import type Stripe from 'stripe'

let cached: Stripe | null = null

// Async with a dynamic `import()`, not a static top-level one — see the same
// comment in firebaseAdmin.ts. Also means a missing STRIPE_SECRET_KEY
// surfaces as a normal caught error instead of an opaque
// "FUNCTION_INVOCATION_FAILED".
export async function getStripe(): Promise<Stripe> {
  if (cached) return cached
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('Falta STRIPE_SECRET_KEY en las variables de entorno')
  const { default: StripeCtor } = await import('stripe')
  cached = new StripeCtor(secretKey)
  return cached
}

export const PRICE_IDS = {
  basico: process.env.STRIPE_PRICE_BASICO ?? '',
  flota: process.env.STRIPE_PRICE_FLOTA ?? '',
  empresa: process.env.STRIPE_PRICE_EMPRESA ?? '',
} as const

// 'flota_plus' deliberately excluded — it's sales-assisted/custom, never
// sold through self-serve Checkout, so it has no Stripe Price to map to.
export type PlanId = keyof typeof PRICE_IDS
