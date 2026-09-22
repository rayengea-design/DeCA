import type Stripe from 'stripe'

interface CompanyFiscalInfo {
  nombre: string
  nif?: string
  domicilio?: string
}

/** Creates the company's Stripe Customer (first checkout ever) or keeps an
 * existing one's invoicing details in sync with the company's current
 * nombre/nif/domicilio — Stripe pulls name/address/tax ID straight from the
 * Customer object onto every invoice PDF it generates, and without them an
 * invoice isn't valid for the client's own accounting/tax filing. Returns
 * the Stripe customer id either way. */
export async function ensureStripeCustomer(
  stripe: Stripe,
  existingCustomerId: string | undefined,
  email: string,
  company: CompanyFiscalInfo,
): Promise<string> {
  const address = company.domicilio ? { line1: company.domicilio, country: 'ES' } : undefined

  if (!existingCustomerId) {
    const customer = await stripe.customers.create({
      email,
      name: company.nombre,
      address,
      tax_id_data: company.nif ? [{ type: 'es_cif', value: company.nif }] : undefined,
    })
    return customer.id
  }

  await stripe.customers.update(existingCustomerId, { name: company.nombre, address }).catch(() => null)

  if (company.nif) {
    const existingTaxIds = await stripe.customers.listTaxIds(existingCustomerId).catch(() => null)
    const alreadyHasIt = existingTaxIds?.data.some((t) => t.value === company.nif)
    if (!alreadyHasIt) {
      await stripe.customers.createTaxId(existingCustomerId, { type: 'es_cif', value: company.nif }).catch(() => null)
    }
  }

  return existingCustomerId
}
