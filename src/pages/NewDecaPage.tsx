import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Copy, Download, Loader2, MessageCircle, Plus } from 'lucide-react'
import QRCode from 'qrcode'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DecaFormFields } from '@/components/deca/DecaFormFields'
import { useAuth } from '@/context/AuthContext'
import { decaFormSchema, type DecaFormFieldValues } from '@/lib/decaFormSchema'
import { shareDecaPdf } from '@/lib/utils'
import { createDecaDocument } from '@/services/decaService'
import { decaFileName } from '@/services/pdfGenerator'
import type { DecaRecord } from '@/types/deca'

export function NewDecaPage() {
  const { user, profile, company } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<DecaRecord | null>(null)
  const [copyOk, setCopyOk] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<DecaFormFieldValues>({
    resolver: zodResolver(decaFormSchema),
    defaultValues: {
      ownRole: 'transportista',
      ownNombre: company?.nombre ?? '',
      fechaTransporte: new Date().toISOString().slice(0, 10),
    },
  })

  const role = watch('ownRole')

  async function onSubmit(values: DecaFormFieldValues) {
    if (!user || !company) return
    setSubmitting(true)
    try {
      const ownParty = { nombre: values.ownNombre, nif: values.ownNif, domicilio: values.ownDomicilio }
      const counterpart = {
        nombre: values.counterpartNombre,
        nif: values.counterpartNif,
        domicilio: values.counterpartDomicilio,
      }

      const record = await createDecaDocument(
        company.id,
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
        { uid: user.uid, email: user.email ?? '', nombre: profile?.nombre },
      )
      setResult(record)
      setQrDataUrl(await QRCode.toDataURL(record.publicUrl, { margin: 1, width: 300 }))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleShareWhatsApp() {
    if (!result) return
    setSharing(true)
    try {
      await shareDecaPdf(
        result.publicUrl,
        decaFileName(result.matriculaTractora, result.fechaTransporte),
        `DeCA ${result.matriculaTractora} · ${result.origen} → ${result.destino}`,
      )
    } finally {
      setSharing(false)
    }
  }

  function startNew() {
    setResult(null)
    setCopyOk(false)
    setQrDataUrl(null)
    reset({ ownRole: role, ownNombre: company?.nombre ?? '', fechaTransporte: new Date().toISOString().slice(0, 10) })
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader className="items-center text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <CardTitle>DeCA generado correctamente</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR del DeCA" className="h-44 w-44 rounded-md border border-ink-100" />
            )}
            <p className="text-center text-sm text-ink-400">
              Descarga el PDF y envíaselo al conductor, o que escanee el QR directamente desde el
              documento impreso/digital.
            </p>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1">
                <a href={result.publicUrl} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </a>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={async () => {
                  await navigator.clipboard.writeText(result.publicUrl)
                  setCopyOk(true)
                  setTimeout(() => setCopyOk(false), 2000)
                }}
              >
                <Copy className="h-4 w-4" />
                {copyOk ? 'Copiado' : 'Copiar enlace'}
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full border-green-200 text-green-700 hover:bg-green-50"
              onClick={handleShareWhatsApp}
              disabled={sharing}
            >
              {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              Enviar por WhatsApp
            </Button>
            <Button variant="ghost" onClick={startNew}>
              <Plus className="h-4 w-4" />
              Crear otro DeCA
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex max-w-2xl flex-col gap-5">
      <DecaFormFields
        register={register}
        control={control}
        errors={errors}
        role={role}
        companyName={company?.nombre ?? 'Tu empresa'}
      />
      <Button type="submit" size="lg" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Generar DeCA
      </Button>
    </form>
  )
}
