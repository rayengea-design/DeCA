// Intenta configurar lo que SÍ se puede hacer por API: registrar el IVA de
// España, crear el webhook en modo real, y fijar el tax_behavior de los 3
// precios. Es idempotente (se puede ejecutar más de una vez sin duplicar
// nada) e informa claramente de qué ha funcionado y qué no (p. ej. por
// falta de permisos en una clave restringida).
//
// Uso:
//   node scripts/stripe-go-live-setup.mjs sk_o_rk_...

import Stripe from 'stripe'

const key = process.argv[2] || process.env.STRIPE_SECRET_KEY
if (!key) {
  console.error('Uso: node scripts/stripe-go-live-setup.mjs <tu clave>')
  process.exit(1)
}

const stripe = new Stripe(key)

const WEBHOOK_URL = 'https://www.kreanex.es/api/stripe/webhook'
const WEBHOOK_EVENTS = ['customer.subscription.updated', 'customer.subscription.deleted', 'checkout.session.completed']
// Exclusive = el precio mostrado (19€) NO incluye IVA, se añade aparte en el
// checkout — es lo que ya dice el texto de la propia app ("El IVA
// correspondiente se calcula y se muestra desglosado en el momento del
// pago"). Cambia a 'inclusive' aquí si prefieres que el cliente pague
// exactamente 19€ con el IVA ya metido dentro.
const TAX_BEHAVIOR = 'exclusive'
const PRICE_IDS = [
  'price_1UIql8Pojx0y16PdD62roNe5', // Básico
  'price_1UIql8Pojx0y16PddS1jbqG5', // Flota
  'price_1UIql8Pojx0y16PdcRtH6gcB', // Empresa
]

function reportError(label, err) {
  const isPermission = err?.code === 'permission_denied' || err?.statusCode === 403 || /permission/i.test(err?.message ?? '')
  console.log(`✘ ${label}: ${isPermission ? 'SIN PERMISO con esta clave' : 'error'} — ${err.message}`)
  return isPermission
}

async function setupTaxRegistration() {
  console.log('\n=== 1. Registro de IVA en España ===')
  try {
    const existing = await stripe.tax.registrations.list({ limit: 10 })
    const spain = existing.data.find((r) => r.country === 'ES')
    if (spain) {
      console.log(`✔ Ya existía un registro para España (estado: ${spain.status}) — no hace falta crear otro.`)
      return
    }
  } catch (err) {
    reportError('No se pudo comprobar los registros existentes', err)
    return
  }

  try {
    const reg = await stripe.tax.registrations.create({
      country: 'ES',
      active_from: 'now',
      country_options: { es: { type: 'standard' } },
    })
    console.log(`✔ Registro de IVA en España creado (estado: ${reg.status}).`)
  } catch (err) {
    reportError('No se pudo crear el registro de IVA', err)
  }
}

async function setupWebhook() {
  console.log('\n=== 2. Webhook en modo real ===')
  let existing
  try {
    existing = await stripe.webhookEndpoints.list({ limit: 50 })
  } catch (err) {
    reportError('No se pudo listar los webhooks existentes', err)
    return
  }

  const already = existing.data.find((w) => w.url === WEBHOOK_URL)
  if (already) {
    console.log(`✔ Ya existe un webhook apuntando a ${WEBHOOK_URL} (estado: ${already.status}) — no creo otro.`)
    console.log('  Si necesitas su clave de firma de nuevo, solo se puede ver una vez al crearlo — revísala en el Dashboard → ese endpoint → "Revelar".')
    return
  }

  try {
    const webhook = await stripe.webhookEndpoints.create({
      url: WEBHOOK_URL,
      enabled_events: WEBHOOK_EVENTS,
      description: 'DeCA — creado automáticamente',
    })
    console.log(`✔ Webhook creado apuntando a ${WEBHOOK_URL}.`)
    console.log(`  CLAVE DE FIRMA (cópiala ahora, no se puede volver a mostrar): ${webhook.secret}`)
    console.log('  → Ponla en Vercel como STRIPE_WEBHOOK_SECRET.')
  } catch (err) {
    reportError('No se pudo crear el webhook', err)
  }
}

async function setupPriceTaxBehavior() {
  console.log('\n=== 3. tax_behavior de los precios ===')
  for (const priceId of PRICE_IDS) {
    try {
      const price = await stripe.prices.retrieve(priceId)
      if (price.tax_behavior === TAX_BEHAVIOR) {
        console.log(`✔ ${priceId}: ya está como "${TAX_BEHAVIOR}" — nada que hacer.`)
        continue
      }
      // Stripe no deja cambiar tax_behavior en un Price ya existente una vez
      // creado — si esto falla, hay que crear un Price nuevo con el
      // comportamiento fijado desde el principio (te lo indico abajo).
      await stripe.prices.update(priceId, { tax_behavior: TAX_BEHAVIOR })
      console.log(`✔ ${priceId}: fijado a "${TAX_BEHAVIOR}".`)
    } catch (err) {
      const cantEdit = reportError(`${priceId}`, err)
      if (!cantEdit) {
        console.log('  (Stripe no permite cambiar el tax_behavior de un precio ya creado — hace falta crear uno nuevo con ese comportamiento y actualizar el ID en Vercel.)')
      }
    }
  }
}

async function main() {
  await setupTaxRegistration()
  await setupWebhook()
  await setupPriceTaxBehavior()
  console.log('\n=== Fin ===')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
