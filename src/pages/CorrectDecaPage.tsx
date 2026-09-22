import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { DecaFormFields } from '@/components/deca/DecaFormFields'
import { TrialExhaustedNotice } from '@/components/TrialExhaustedNotice'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useAuth } from '@/context/AuthContext'
import { decaFormSchema, type DecaFormFieldValues } from '@/lib/decaFormSchema'
import { isTrialExhausted } from '@/lib/trial'
import { correctDecaDocument, getDecaDocument } from '@/services/decaService'
import type { DecaRecord } from '@/types/deca'

export function CorrectDecaPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile, company } = useAuth()
  const navigate = useNavigate()
  const [original, setOriginal] = useState<DecaRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<DecaFormFieldValues>({ resolver: zodResolver(decaFormSchema) })

  const role = watch('ownRole')

  useEffect(() => {
    if (!company || !id) return
    getDecaDocument(company.id, id)
      .then((record) => {
        setOriginal(record)
        if (record) {
          const own = record.ownRole === 'cargador' ? record.cargador : record.transportista
          const counterpart = record.ownRole === 'cargador' ? record.transportista : record.cargador
          reset({
            ownRole: record.ownRole,
            ownNombre: own.nombre,
            ownNif: own.nif,
            ownDomicilio: own.domicilio,
            counterpartNombre: counterpart.nombre,
            counterpartNif: counterpart.nif,
            counterpartDomicilio: counterpart.domicilio,
            origen: record.origen,
            destino: record.destino,
            naturalezaMercancia: record.naturalezaMercancia,
            peso: record.peso,
            bultos: record.bultos,
            fechaTransporte: record.fechaTransporte,
            matriculaTractora: record.matriculaTractora,
            matriculaRemolque: record.matriculaRemolque,
            autorizacionEspecial: record.autorizacionEspecial,
            observacionesCargador: record.observacionesCargador,
            observacionesTransportista: record.observacionesTransportista,
          })
        }
      })
      // A driver may land here (typed URL) for a DeCA that isn't theirs —
      // firestore.rules denies the read outright, which throws rather than
      // resolving to a missing doc. Treat that the same as "not found".
      .catch(() => setOriginal(null))
      .finally(() => setLoading(false))
  }, [company, id, reset])

  async function onSubmit(values: DecaFormFieldValues) {
    if (!user || !company || !original) return
    if (reason.trim().length < 5) {
      setReasonError('Explica brevemente el motivo de la corrección (mínimo 5 caracteres).')
      return
    }
    setReasonError(null)
    setSubmitting(true)
    try {
      const ownParty = { nombre: values.ownNombre, nif: values.ownNif, domicilio: values.ownDomicilio }
      const counterpart = {
        nombre: values.counterpartNombre,
        nif: values.counterpartNif,
        domicilio: values.counterpartDomicilio,
      }
      await correctDecaDocument(
        company.id,
        original,
        {
          ownRole: values.ownRole,
          cargador: values.ownRole === 'cargador' ? ownParty : counterpart,
          transportista: values.ownRole === 'transportista' ? ownParty : counterpart,
          origen: values.origen,
          destino: values.destino,
          naturalezaMercancia: values.naturalezaMercancia,
          peso: values.peso,
          bultos: values.bultos,
          fechaTransporte: values.fechaTransporte,
          matriculaTractora: values.matriculaTractora,
          matriculaRemolque: values.matriculaRemolque,
          autorizacionEspecial: values.autorizacionEspecial,
          observacionesCargador: values.observacionesCargador,
          observacionesTransportista: values.observacionesTransportista,
        },
        reason.trim(),
        { uid: user.uid, email: user.email ?? '', nombre: profile?.nombre },
      )
      navigate('/app/historial')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-ink-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }

  if (!original) return <Navigate to="/app/historial" replace />

  if (company && isTrialExhausted(company)) return <TrialExhaustedNotice />

  if (original.status === 'superseded') {
    return (
      <div className="mx-auto max-w-lg py-16 text-center text-sm text-ink-400">
        Este DeCA ya ha sido sustituido y no se puede corregir de nuevo.{' '}
        {original.supersededBy && (
          <Button variant="ghost" onClick={() => navigate('/app/historial')} className="mt-2">
            Volver al historial
          </Button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex max-w-2xl flex-col gap-5">
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-start gap-3 pt-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Vas a generar un nuevo DeCA que sustituye al actual (nº {original.id.slice(0, 8).toUpperCase()})
            </p>
            <p className="mt-1 text-sm text-amber-700">
              El documento original quedará marcado como sustituido y su PDF avisará de que ya no es
              válido, enlazando al nuevo. Esto cumple el procedimiento de corrección exigido por la
              Resolución de 5 de junio de 2026 — nunca se borra ni edita el original.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Motivo de la corrección</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <Label htmlFor="reason">Explica qué ha cambiado y por qué (obligatorio)</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej.: se corrige la matrícula del remolque, indicada erróneamente en el documento original."
          />
          {reasonError && <p className="text-xs text-brand-600">{reasonError}</p>}
        </CardContent>
      </Card>

      <DecaFormFields
        register={register}
        control={control}
        errors={errors}
        role={role}
        companyName={company?.nombre ?? 'Tu empresa'}
      />

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/app/historial')}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Generar DeCA corregido
        </Button>
      </div>
    </form>
  )
}
