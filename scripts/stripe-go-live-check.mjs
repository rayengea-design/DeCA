// Comprobación de solo lectura (no cambia NADA en Stripe) de que la cuenta
// está lista para cobrar de verdad: impuestos, precios, webhooks y datos
// fiscales del propio negocio. Ejecútalo tú mismo con tu clave — nunca la
// pegues en el chat.
//
// Uso:
//   node scripts/stripe-go-live-check.mjs sk_live_...
// o, si ya la tienes en el entorno:
//   STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-go-live-check.mjs

import Stripe from 'stripe'

const key = process.argv[2] || process.env.STRIPE_SECRET_KEY
if (!key) {
  console.error('Uso: node scripts/stripe-go-live-check.mjs sk_live_...')
  process.exit(1)
}
if (!key.startsWith('sk_live_')) {
  console.warn('⚠ Esta clave no empieza por "sk_live_" — parece una clave de TEST, no la de producción real.\n')
}

const stripe = new Stripe(key)

async function main() {
  console.log('=== Cuenta y datos fiscales del negocio ===')
  const account = await stripe.accounts.retrieve()
  console.log('País de la cuenta:', account.country)
  console.log('Nombre público del negocio:', account.business_profile?.name ?? '(no configurado)')
  console.log('Email de soporte:', account.business_profile?.support_email ?? account.email ?? '(no configurado)')
  console.log(
    'NIF/CIF del negocio registrado en Stripe:',
    account.company?.tax_id_provided
      ? 'Sí'
      : 'NO — falta poner el CIF de Grupo Noveldi SL en Settings → Business → Tax details (aparece como el EMISOR en cada factura)',
  )

  console.log('\n=== Stripe Tax (cálculo automático de IVA) ===')
  try {
    const registrations = await stripe.tax.registrations.list({ limit: 10 })
    const spain = registrations.data.find((r) => r.country === 'ES')
    if (spain) {
      console.log(`✔ Registrado para cobrar impuestos en España (estado: ${spain.status})`)
      if (spain.status !== 'active') {
        console.log(`  ⚠ El estado no es "active" — revísalo en Settings → Tax → Registrations.`)
      }
    } else {
      console.log('✘ NO hay ningún registro de Stripe Tax para España — el IVA NO se está aplicando todavía.')
      console.log('  Ve a Settings → Tax → Registrations y añade España.')
    }
  } catch (err) {
    console.log('No se pudo comprobar — puede que Stripe Tax no esté activado en esta cuenta todavía:', err.message)
  }

  console.log('\n=== Precios activos ===')
  const prices = await stripe.prices.list({ active: true, limit: 30, expand: ['data.product'] })
  if (prices.data.length === 0) {
    console.log('✘ No hay ningún precio activo en modo real — hay que crear los planes (Básico/Flota/Empresa) en Stripe en modo LIVE, no solo en test.')
  }
  for (const p of prices.data) {
    const productName = typeof p.product === 'object' && p.product && 'name' in p.product ? p.product.name : p.product
    const amount = p.unit_amount != null ? (p.unit_amount / 100).toFixed(2) : '?'
    console.log(`- ${p.id} · ${productName} · ${amount} ${p.currency.toUpperCase()} · tax_behavior: ${p.tax_behavior}`)
    if (p.tax_behavior === 'unspecified') {
      console.log(
        '  ⚠ tax_behavior es "unspecified" — con impuestos automáticos activados, Stripe puede rechazar el pago con este precio. Edítalo en el Dashboard y fija si el precio ya incluye IVA o no.',
      )
    }
  }
  console.log('\n  Comprueba que STRIPE_PRICE_BASICO / STRIPE_PRICE_FLOTA / STRIPE_PRICE_EMPRESA en Vercel apuntan a estos IDs (los de modo LIVE, no a los que empiezan igual pero son de test).')

  console.log('\n=== Webhooks configurados ===')
  const webhooks = await stripe.webhookEndpoints.list({ limit: 20 })
  if (webhooks.data.length === 0) {
    console.log('✘ No hay ningún webhook configurado en modo real.')
  }
  let hasCorrectWebhook = false
  for (const w of webhooks.data) {
    console.log(`- ${w.url} (${w.status})`)
    console.log(`  eventos: ${w.enabled_events.join(', ')}`)
    if (w.url.includes('/api/stripe/webhook') && w.status === 'enabled') hasCorrectWebhook = true
  }
  console.log(
    hasCorrectWebhook
      ? '✔ Hay un webhook activo apuntando a /api/stripe/webhook'
      : '✘ No encuentro un webhook activo apuntando a https://www.kreanex.es/api/stripe/webhook — créalo en Settings → Webhooks (modo LIVE) y copia su clave de firma a STRIPE_WEBHOOK_SECRET en Vercel.',
  )

  console.log('\n=== Esto Stripe no lo deja comprobar por API — revísalo tú en el Dashboard ===')
  console.log('- Settings → Customer emails: activa el envío automático de recibos/facturas por email a tus clientes.')
  console.log('- Confirma que STRIPE_SECRET_KEY y VITE_STRIPE_PUBLISHABLE_KEY en Vercel son las claves "sk_live_"/"pk_live_", no las de test.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
