import Stripe from 'stripe'

let cached: Stripe | null = null

// A function, not a module-level constant: throwing at import time crashes
// the whole serverless function before any handler's try/catch can run,
// which Vercel then reports as an opaque "FUNCTION_INVOCATION_FAILED" with
// no detail at all. Calling this lazily, from inside a handler, means a
// missing/bad env var instead surfaces as a normal caught error with an
// actual message.
export function getStripe(): Stripe {
  if (cached) return cached
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('Falta STRIPE_SECRET_KEY en las variables de entorno')
  cached = new Stripe(secretKey)
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
