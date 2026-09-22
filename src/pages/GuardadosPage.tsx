import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/context/AuthContext'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import {
  createSavedCounterparty,
  deleteSavedCounterparty,
  listSavedCounterparties,
  updateSavedCounterparty,
} from '@/services/counterpartyService'
import { createSavedTrip, deleteSavedTrip, listSavedTrips, updateSavedTrip } from '@/services/tripService'
import type { SavedCounterparty, SavedTrip } from '@/types/deca'

const counterpartySchema = z.object({
  nombre: z.string().min(2, 'Obligatorio'),
  nif: z.string().min(5, 'Obligatorio'),
  domicilio: z.string().optional(),
})
type CounterpartyFormValues = z.infer<typeof counterpartySchema>

const tripSchema = z.object({
  nombre: z.string().min(2, 'Obligatorio'),
  counterpartNombre: z.string().min(2, 'Obligatorio'),
  counterpartNif: z.string().min(5, 'Obligatorio'),
  counterpartDomicilio: z.string().optional(),
  origen: z.string().min(2, 'Obligatorio'),
  destino: z.string().min(2, 'Obligatorio'),
  naturalezaMercancia: z.string().min(2, 'Obligatorio'),
  peso: z.string().optional(),
})
type TripFormValues = z.infer<typeof tripSchema>

export function GuardadosPage() {
  useDocumentMeta('Empresas y viajes guardados | DeCA')
  const { company } = useAuth()

  if (!company) return null

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <CounterpartiesSection companyId={company.id} />
      <SavedTripsSection companyId={company.id} />
    </div>
  )
}

function CounterpartiesSection({ companyId }: { companyId: string }) {
  const [items, setItems] = useState<SavedCounterparty[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CounterpartyFormValues>({ resolver: zodResolver(counterpartySchema) })

  useEffect(() => {
    listSavedCounterparties(companyId)
      .then(setItems)
      .finally(() => setLoading(false))
  }, [companyId])

  async function onCreate(values: CounterpartyFormValues) {
    setError(null)
    try {
      const created = await createSavedCounterparty(companyId, values)
      setItems((prev) => [created, ...prev])
      reset()
    } catch {
      setError('No se pudo guardar la empresa. Inténtalo de nuevo.')
    }
  }

  async function handleUpdate(id: string, values: CounterpartyFormValues) {
    setPendingId(id)
    setError(null)
    try {
      await updateSavedCounterparty(companyId, id, values)
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...values } : i)))
      setEditingId(null)
    } catch {
      setError('No se pudo actualizar la empresa. Inténtalo de nuevo.')
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar esta empresa guardada? No afecta a los DeCA ya generados.')) return
    setPendingId(id)
    setError(null)
    try {
      await deleteSavedCounterparty(companyId, id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch {
      setError('No se pudo eliminar la empresa. Inténtalo de nuevo.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresas guardadas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-xs text-ink-400">
          Clientes o proveedores habituales — se sugieren por autocompletado al escribir su nombre en
          un DeCA nuevo, sin depender de una ruta o mercancía concreta.
        </p>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onCreate)} className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="cp-nombre">Nombre / Razón social</Label>
            <Input id="cp-nombre" placeholder="Ej. Transportes García SL" {...register('nombre')} />
            {errors.nombre && <p className="text-xs text-brand-600">{errors.nombre.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cp-nif">NIF/CIF</Label>
            <Input id="cp-nif" {...register('nif')} />
            {errors.nif && <p className="text-xs text-brand-600">{errors.nif.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cp-domicilio">Domicilio (opcional)</Label>
            <Input id="cp-domicilio" {...register('domicilio')} />
          </div>
          <Button type="submit" size="sm" className="self-start sm:col-span-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Guardar empresa
          </Button>
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-6 text-ink-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-ink-400">Todavía no tienes ninguna empresa guardada.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) =>
              editingId === item.id ? (
                <EditableCounterpartyRow
                  key={item.id}
                  item={item}
                  saving={pendingId === item.id}
                  onCancel={() => setEditingId(null)}
                  onSave={(values) => handleUpdate(item.id, values)}
                />
              ) : (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-ink-100 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">{item.nombre}</p>
                    <p className="truncate text-xs text-ink-400">
                      {item.nif}
                      {item.domicilio ? ` · ${item.domicilio}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pendingId === item.id}
                      onClick={() => setEditingId(item.id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pendingId === item.id}
                      onClick={() => handleDelete(item.id)}
                    >
                      {pendingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EditableCounterpartyRow({
  item,
  saving,
  onSave,
  onCancel,
}: {
  item: SavedCounterparty
  saving: boolean
  onSave: (values: CounterpartyFormValues) => void
  onCancel: () => void
}) {
  const [nombre, setNombre] = useState(item.nombre)
  const [nif, setNif] = useState(item.nif)
  const [domicilio, setDomicilio] = useState(item.domicilio ?? '')
  const valid = nombre.trim().length >= 2 && nif.trim().length >= 5

  return (
    <div className="flex flex-col gap-2 rounded-md border border-brand-200 bg-brand-50/30 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre / Razón social" />
        <Input value={nif} onChange={(e) => setNif(e.target.value)} placeholder="NIF/CIF" />
        <Input
          value={domicilio}
          onChange={(e) => setDomicilio(e.target.value)}
          placeholder="Domicilio (opcional)"
          className="sm:col-span-2"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!valid || saving}
          onClick={() => onSave({ nombre: nombre.trim(), nif: nif.trim(), domicilio: domicilio.trim() || undefined })}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Guardar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          <X className="h-3.5 w-3.5" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}

function SavedTripsSection({ companyId }: { companyId: string }) {
  const [items, setItems] = useState<SavedTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TripFormValues>({ resolver: zodResolver(tripSchema) })

  useEffect(() => {
    listSavedTrips(companyId)
      .then(setItems)
      .finally(() => setLoading(false))
  }, [companyId])

  async function onCreate(values: TripFormValues) {
    setError(null)
    try {
      const created = await createSavedTrip(companyId, values)
      setItems((prev) => [created, ...prev])
      reset()
      setShowAddForm(false)
    } catch {
      setError('No se pudo guardar el viaje. Inténtalo de nuevo.')
    }
  }

  async function handleUpdate(id: string, values: TripFormValues) {
    setPendingId(id)
    setError(null)
    try {
      await updateSavedTrip(companyId, id, values)
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...values } : i)))
      setEditingId(null)
    } catch {
      setError('No se pudo actualizar el viaje. Inténtalo de nuevo.')
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar este viaje guardado?')) return
    setPendingId(id)
    setError(null)
    try {
      await deleteSavedTrip(companyId, id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch {
      setError('No se pudo eliminar el viaje. Inténtalo de nuevo.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Viajes guardados</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm((v) => !v)}>
          {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showAddForm ? 'Cerrar' : 'Nuevo viaje'}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-xs text-ink-400">
          Combinaciones completas de contraparte, ruta y mercancía — se aplican de una vez desde el
          selector "Viaje recurrente" al crear un DeCA nuevo.
        </p>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleSubmit(onCreate)} className="grid gap-3 rounded-md border border-ink-100 p-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="t-nombre">Etiqueta</Label>
              <Input id="t-nombre" placeholder="Ej. Murcia → Madrid, Cliente X" {...register('nombre')} />
              {errors.nombre && <p className="text-xs text-brand-600">{errors.nombre.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="t-counterpartNombre">Contraparte</Label>
              <Input id="t-counterpartNombre" {...register('counterpartNombre')} />
              {errors.counterpartNombre && (
                <p className="text-xs text-brand-600">{errors.counterpartNombre.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-counterpartNif">NIF/CIF contraparte</Label>
              <Input id="t-counterpartNif" {...register('counterpartNif')} />
              {errors.counterpartNif && <p className="text-xs text-brand-600">{errors.counterpartNif.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-counterpartDomicilio">Domicilio contraparte (opcional)</Label>
              <Input id="t-counterpartDomicilio" {...register('counterpartDomicilio')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-origen">Origen</Label>
              <Input id="t-origen" {...register('origen')} />
              {errors.origen && <p className="text-xs text-brand-600">{errors.origen.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-destino">Destino</Label>
              <Input id="t-destino" {...register('destino')} />
              {errors.destino && <p className="text-xs text-brand-600">{errors.destino.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-mercancia">Naturaleza de la mercancía</Label>
              <Input id="t-mercancia" {...register('naturalezaMercancia')} />
              {errors.naturalezaMercancia && (
                <p className="text-xs text-brand-600">{errors.naturalezaMercancia.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-peso">Peso (kg, opcional)</Label>
              <Input id="t-peso" {...register('peso')} />
            </div>
            <Button type="submit" size="sm" className="self-start sm:col-span-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Guardar viaje
            </Button>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-6 text-ink-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-ink-400">Todavía no tienes ningún viaje guardado.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) =>
              editingId === item.id ? (
                <EditableTripRow
                  key={item.id}
                  item={item}
                  saving={pendingId === item.id}
                  onCancel={() => setEditingId(null)}
                  onSave={(values) => handleUpdate(item.id, values)}
                />
              ) : (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-ink-100 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">{item.nombre}</p>
                    <p className="truncate text-xs text-ink-400">
                      {item.counterpartNombre} · {item.origen} → {item.destino} · {item.naturalezaMercancia}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pendingId === item.id}
                      onClick={() => setEditingId(item.id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pendingId === item.id}
                      onClick={() => handleDelete(item.id)}
                    >
                      {pendingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EditableTripRow({
  item,
  saving,
  onSave,
  onCancel,
}: {
  item: SavedTrip
  saving: boolean
  onSave: (values: TripFormValues) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState({
    nombre: item.nombre,
    counterpartNombre: item.counterpartNombre,
    counterpartNif: item.counterpartNif,
    counterpartDomicilio: item.counterpartDomicilio ?? '',
    origen: item.origen,
    destino: item.destino,
    naturalezaMercancia: item.naturalezaMercancia,
    peso: item.peso ?? '',
  })

  function set<K extends keyof typeof values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const valid =
    values.nombre.trim().length >= 2 &&
    values.counterpartNombre.trim().length >= 2 &&
    values.counterpartNif.trim().length >= 5 &&
    values.origen.trim().length >= 2 &&
    values.destino.trim().length >= 2 &&
    values.naturalezaMercancia.trim().length >= 2

  return (
    <div className="flex flex-col gap-2 rounded-md border border-brand-200 bg-brand-50/30 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          value={values.nombre}
          onChange={(e) => set('nombre', e.target.value)}
          placeholder="Etiqueta"
          className="sm:col-span-2"
        />
        <Input
          value={values.counterpartNombre}
          onChange={(e) => set('counterpartNombre', e.target.value)}
          placeholder="Contraparte"
          className="sm:col-span-2"
        />
        <Input
          value={values.counterpartNif}
          onChange={(e) => set('counterpartNif', e.target.value)}
          placeholder="NIF/CIF contraparte"
        />
        <Input
          value={values.counterpartDomicilio}
          onChange={(e) => set('counterpartDomicilio', e.target.value)}
          placeholder="Domicilio contraparte (opcional)"
        />
        <Input value={values.origen} onChange={(e) => set('origen', e.target.value)} placeholder="Origen" />
        <Input value={values.destino} onChange={(e) => set('destino', e.target.value)} placeholder="Destino" />
        <Input
          value={values.naturalezaMercancia}
          onChange={(e) => set('naturalezaMercancia', e.target.value)}
          placeholder="Naturaleza de la mercancía"
        />
        <Input value={values.peso} onChange={(e) => set('peso', e.target.value)} placeholder="Peso (kg, opcional)" />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!valid || saving}
          onClick={() =>
            onSave({
              nombre: values.nombre.trim(),
              counterpartNombre: values.counterpartNombre.trim(),
              counterpartNif: values.counterpartNif.trim(),
              counterpartDomicilio: values.counterpartDomicilio.trim() || undefined,
              origen: values.origen.trim(),
              destino: values.destino.trim(),
              naturalezaMercancia: values.naturalezaMercancia.trim(),
              peso: values.peso.trim() || undefined,
            })
          }
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Guardar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          <X className="h-3.5 w-3.5" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}
