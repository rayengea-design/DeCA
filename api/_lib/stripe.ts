import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY
if (!secretKey) throw new Error('Falta STRIPE_SECRET_KEY en las variables de entorno')

export const stripe = new Stripe(secretKey)

export const PRICE_IDS = {
  basico: process.env.STRIPE_PRICE_BASICO ?? '',
  flota: process.env.STRIPE_PRICE_FLOTA ?? '',
} as const

export type PlanId = keyof typeof PRICE_IDS
