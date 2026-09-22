import { zodResolver } from '@hookform/resolvers/zod'
import { Bookmark, CheckCircle2, Copy, Download, Loader2, MessageCircle, Plus } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DecaFormFields } from '@/components/deca/DecaFormFields'
import { MissingCompanyInfoNotice } from '@/components/MissingCompanyInfoNotice'
import { TrialExhaustedNotice } from '@/components/TrialExhaustedNotice'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useAuth } from '@/context/AuthContext'
import { decaFormSchema, type DecaFormFieldValues } from '@/lib/decaFormSchema'
import { isTrialExhausted } from '@/lib/trial'
import { shareDecaPdf } from '@/lib/utils'
import { createDecaDocument } from '@/services/decaService'
import { decaFileName } from '@/services/pdfGenerator'
import { createSavedTrip, listSavedTrips } from '@/services/tripService'
import type { DecaRecord, SavedTrip } from '@/types/deca'

export function NewDecaPage() {
  const { user, profile, company } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<DecaRecord | null>(null)
  const [copyOk, setCopyOk] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([])
  const [saveAsTrip, setSaveAsTrip] = useState(false)
  const [tripLabel, setTripLabel] = useState('')

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
      fechaTransporte: new Date().toISOString().slice(0, 10),
    },
  })

  const role = watch('ownRole')

  useEffect(() => {
    if (!company) return
    listSavedTrips(company.id).then(setSavedTrips)
  }, [company])

  if (company && isTrialExhausted(company)) return <TrialExhaustedNotice />
  if (company && (!company.nif || !company.domicilio)) return <MissingCompanyInfoNotice />

  function applySavedTrip(tripId: string) {
    const trip = savedTrips.find((t) => t.id === tripId)
    if (!trip) return
    reset({
      ownRole: role,
      counterpartNombre: trip.counterpartNombre,
      counterpartNif: trip.counterpartNif,
      counterpartDomicilio: trip.counterpartDomicilio,
      origen: trip.origen,
      destino: trip.destino,
      naturalezaMercancia: trip.naturalezaMercancia,
      peso: trip.peso,
      fechaTransporte: new Date().toISOString().slice(0, 10),
    })
  }

  async function onSubmit(values: DecaFormFieldValues) {
    if (!user || !company || !company.nif || !company.domicilio) return
    setSubmitting(true)
    try {
      const ownParty = { nombre: company.nombre, nif: company.nif, domicilio: company.domicilio }
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

      if (saveAsTrip && tripLabel.trim()) {
        const saved = await createSavedTrip(company.id, {
          nombre: tripLabel.trim(),
          counterpartNombre: values.counterpartNombre,
          counterpartNif: values.counterpartNif,
          counterpartDomicilio: values.counterpartDomicilio,
          origen: values.origen,
          destino: values.destino,
          naturalezaMercancia: values.naturalezaMercancia,
          peso: values.peso,
        })
        setSavedTrips((prev) => [saved, ...prev])
      }
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
    setSaveAsTrip(false)
    setTripLabel('')
    reset({ ownRole: role, fechaTransporte: new Date().toISOString().slice(0, 10) })
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
      {savedTrips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Viaje recurrente</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={applySavedTrip}>
              <SelectTrigger>
                <SelectValue placeholder="Rellenar desde un viaje guardado…" />
              </SelectTrigger>
              <SelectContent>
                {savedTrips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {company && (
        <DecaFormFields register={register} control={control} errors={errors} role={role} company={company} />
      )}

      <Card>
        <CardContent className="flex flex-col gap-3 pt-5">
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input
              type="checkbox"
              checked={saveAsTrip}
              onChange={(e) => setSaveAsTrip(e.target.checked)}
            />
            <Bookmark className="h-4 w-4 text-ink-400" />
            Guardar esta combinación como viaje recurrente
          </label>
          {saveAsTrip && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tripLabel">Nombre para identificarlo</Label>
              <Input
                id="tripLabel"
                placeholder="Ej. Murcia → Madrid, Cliente X"
                value={tripLabel}
                onChange={(e) => setTripLabel(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Generar DeCA
      </Button>
    </form>
  )
}
