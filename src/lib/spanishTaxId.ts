// Formato de NIF/DNI (personas físicas), NIE (extranjeros) o CIF (empresas)
// — valida solo el FORMATO (8 dígitos + letra / X·Y·Z + 7 dígitos + letra /
// letra + 7 dígitos + dígito o letra), no el dígito de control. Suficiente
// para pillar erratas obvias antes de que Stripe rechace el valor al generar
// la factura (ver api/_lib/customerFiscalSync.ts).
const NIF_DNI = /^\d{8}[A-Z]$/
const NIE = /^[XYZ]\d{7}[A-Z]$/
const CIF = /^[A-HJNPQRSUVW]\d{7}[0-9A-J]$/

export function isValidSpanishTaxId(raw: string): boolean {
  const value = raw.trim().toUpperCase().replace(/[\s-]/g, '')
  return NIF_DNI.test(value) || NIE.test(value) || CIF.test(value)
}
