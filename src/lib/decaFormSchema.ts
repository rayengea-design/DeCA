import { z } from 'zod'

export const decaFormSchema = z.object({
  ownRole: z.enum(['cargador', 'transportista']),
  ownNombre: z.string().min(2, 'Obligatorio'),
  ownNif: z.string().min(5, 'Obligatorio'),
  ownDomicilio: z.string().optional(),
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
