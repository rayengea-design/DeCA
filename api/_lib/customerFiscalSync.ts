import type Stripe from 'stripe'

interface CompanyFiscalInfo {
  nombre: string
  nif?: string
  domicilio?: string
}

/** Thrown when Stripe itself rejects the company's fiscal data — most often
 * an invalid-format NIF/NIE/CIF. Callers must surface this to the customer
 * instead of letting the subscription/plan-change proceed anyway: silently
 * swallowing it (as this used to do) means the resulting invoice is
 * generated without a tax ID, with nobody finding out until the client
 * tries to book it in their own accounting. */
export class FiscalSyncError extends Error {}

/** Creates the company's Stripe Customer (first checkout ever) or keeps an
 * existing one's invoicing details in sync with the company's current
 * nombre/nif/domicilio — Stripe pulls name/address/tax ID straight from the
 * Customer object onto every invoice PDF it generates, and without them an
 * invoice isn't valid for the client's own accounting/tax filing (whether
 * that's a company's CIF or a sole trader's own DNI/NIF — Stripe uses the
 * same `es_cif` type for both; it's simply Spain's one fiscal-ID field).
 * Returns the Stripe customer id either way. */
export async function ensureStripeCustomer(
  stripe: Stripe,
  existingCustomerId: string | undefined,
  email: string,
  company: CompanyFiscalInfo,
): Promise<string> {
  const address = company.domicilio ? { line1: company.domicilio, country: 'ES' } : undefined

  try {
    if (!existingCustomerId) {
      const customer = await stripe.customers.create({
        email,
        name: company.nombre,
        address,
        tax_id_data: company.nif ? [{ type: 'es_cif', value: company.nif }] : undefined,
      })
      return customer.id
    }

    await stripe.customers.update(existingCustomerId, { name: company.nombre, address })

    if (company.nif) {
      const existingTaxIds = await stripe.customers.listTaxIds(existingCustomerId)
      const alreadyHasIt = existingTaxIds.data.some((t) => t.value === company.nif)
      if (!alreadyHasIt) {
        await stripe.customers.createTaxId(existingCustomerId, { type: 'es_cif', value: company.nif })
      }
    }

    return existingCustomerId
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    throw new FiscalSyncError(`No se pudieron guardar tus datos fiscales en Stripe (revisa el NIF/CIF): ${message}`)
  }
}
