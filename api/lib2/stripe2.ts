export async function getStripe2() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('missing key')
  const { default: StripeCtor } = await import('stripe')
  return new StripeCtor(secretKey)
}
