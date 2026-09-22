import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

/** Cached so Stripe.js (a real external script) only ever loads once per
 * page session, no matter how many times the embedded payment form mounts. */
export function getStripeClient(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined
    stripePromise = key ? loadStripe(key) : Promise.resolve(null)
  }
  return stripePromise
}
