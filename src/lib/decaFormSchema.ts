import { z } from 'zod'

// The "own" party's nombre/nif/domicilio are NOT form fields — they're
// locked to the signed-in company's own registered identity (see
// DecaFormFields' read-only "tú" card) precisely because the subscription,
// and therefore this whole document, belongs to exactly one company. Only
// the counterpart (the other, external company on this specific shipment)
// is freely typed.
export const decaFormSchema = z.object({
  ownRole: z.enum(['cargador', 'transportista']),
  counterpartNombre: z.string().min(2, 'Obligatorio'),
  counterpartNif: z.string().min(5, 'Obligatorio'),
  counterpartDomicilio: z.string().optional(),
  origen: z.string().min(2, 'Obligatorio'),
  destino: z.string().min(2, 'Obligatorio'),
  naturalezaMercancia: z.string().min(2, 'Obligatorio'),
  peso: z.string().min(1, 'Obligatorio'),
  bultos: z.string().optional(),
  fechaTransporte: z.string().min(1, 'Obligatorio'),
  matriculaTractora: z.string().min(2, 'Obligatorio'),
  matriculaRemolque: z.string().optional(),
  autorizacionEspecial: z.string().optional(),
  observacionesCargador: z.string().optional(),
  observacionesTransportista: z.string().optional(),
})

export type DecaFormFieldValues = z.infer<typeof decaFormSchema>
