import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Autocomplete } from '@/components/ui/Autocomplete'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import type { DecaFormFieldValues } from '@/lib/decaFormSchema'
import type { Company, PartyRole, SavedCounterparty } from '@/types/deca'

interface DecaFormFieldsProps {
  register: UseFormRegister<DecaFormFieldValues>
  control: Control<DecaFormFieldValues>
  setValue: UseFormSetValue<DecaFormFieldValues>
  errors: FieldErrors<DecaFormFieldValues>
  role: PartyRole
  company: Company
  counterparties: SavedCounterparty[]
  origenSuggestions: string[]
  destinoSuggestions: string[]
  mercanciaSuggestions: string[]
}

export function DecaFormFields({
  register,
  control,
  setValue,
  errors,
  role,
  company,
  counterparties,
  origenSuggestions,
  destinoSuggestions,
  mercanciaSuggestions,
}: DecaFormFieldsProps) {
  function applyCounterparty(nombre: string) {
    const match = counterparties.find((c) => c.nombre === nombre)
    if (!match) return
    setValue('counterpartNif', match.nif)
    setValue('counterpartDomicilio', match.domicilio ?? '')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tu rol en este transporte</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="ownRole"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                {(['transportista', 'cargador'] as PartyRole[]).map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => field.onChange(option)}
                    className={`rounded-md border p-3 text-left text-sm transition-colors ${
                      field.value === option
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    <p className="font-semibold">
                      {option === 'transportista' ? 'Transportista efectivo' : 'Cargador contractual'}
                    </p>
                    <p className="text-xs text-ink-400">
                      {option === 'transportista'
                        ? `${company.nombre} realiza el transporte`
                        : `${company.nombre} contrata el transporte`}
                    </p>
                  </button>
                ))}
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {role === 'transportista' ? 'Transportista efectivo' : 'Cargador contractual'}{' '}
            <span className="font-normal text-ink-400">(tú)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {/* Bloqueado a la identidad registrada de tu empresa: la suscripción
              es por empresa, así que este lado del DeCA no puede ser una
              empresa distinta — solo la contraparte (abajo) es libre. */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Nombre / Razón social</Label>
            <p className="rounded-md border border-ink-100 bg-ink-50 px-3 py-2 text-sm text-ink-700">
              {company.nombre}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>NIF/CIF</Label>
            <p className="rounded-md border border-ink-100 bg-ink-50 px-3 py-2 text-sm text-ink-700">{company.nif}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Domicilio</Label>
            <p className="rounded-md border border-ink-100 bg-ink-50 px-3 py-2 text-sm text-ink-700">
              {company.domicilio}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{role === 'transportista' ? 'Cargador contractual' : 'Transportista efectivo'}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="counterpartNombre">Nombre / Razón social</Label>
            <Controller
              name="counterpartNombre"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  id="counterpartNombre"
                  value={field.value}
                  onChange={field.onChange}
                  onPickSuggestion={applyCounterparty}
                  onBlur={field.onBlur}
                  suggestions={counterparties.map((c) => c.nombre)}
                  placeholder="Empieza a escribir para ver empresas guardadas…"
                />
              )}
            />
            {errors.counterpartNombre && (
              <p className="text-xs text-brand-600">{errors.counterpartNombre.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="counterpartNif">NIF/CIF</Label>
            <Input id="counterpartNif" {...register('counterpartNif')} />
            {errors.counterpartNif && <p className="text-xs text-brand-600">{errors.counterpartNif.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="counterpartDomicilio">Domicilio (opcional)</Label>
            <Input id="counterpartDomicilio" {...register('counterpartDomicilio')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Envío</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="origen">Origen</Label>
            <Controller
              name="origen"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  id="origen"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  suggestions={origenSuggestions}
                />
              )}
            />
            {errors.origen && <p className="text-xs text-brand-600">{errors.origen.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="destino">Destino</Label>
            <Controller
              name="destino"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  id="destino"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  suggestions={destinoSuggestions}
                />
              )}
            />
            {errors.destino && <p className="text-xs text-brand-600">{errors.destino.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="naturalezaMercancia">Naturaleza de la mercancía</Label>
            <Controller
              name="naturalezaMercancia"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  id="naturalezaMercancia"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  suggestions={mercanciaSuggestions}
                />
              )}
            />
            {errors.naturalezaMercancia && (
              <p className="text-xs text-brand-600">{errors.naturalezaMercancia.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="peso">Peso (kg)</Label>
            <Input id="peso" {...register('peso')} />
            {errors.peso && <p className="text-xs text-brand-600">{errors.peso.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bultos">Nº de bultos (opcional)</Label>
            <Input id="bultos" {...register('bultos')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fechaTransporte">Fecha del transporte</Label>
            <Input id="fechaTransporte" type="date" {...register('fechaTransporte')} />
            {errors.fechaTransporte && (
              <p className="text-xs text-brand-600">{errors.fechaTransporte.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="autorizacionEspecial">Autorización especial (opcional)</Label>
            <Input id="autorizacionEspecial" {...register('autorizacionEspecial')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehículo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="matriculaTractora">Matrícula tractora</Label>
            <Input id="matriculaTractora" {...register('matriculaTractora')} />
            {errors.matriculaTractora && (
              <p className="text-xs text-brand-600">{errors.matriculaTractora.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="matriculaRemolque">Matrícula remolque (opcional)</Label>
            <Input id="matriculaRemolque" {...register('matriculaRemolque')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observaciones (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="observacionesCargador">Del cargador contractual</Label>
            <Textarea id="observacionesCargador" {...register('observacionesCargador')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="observacionesTransportista">Del transportista efectivo</Label>
            <Textarea id="observacionesTransportista" {...register('observacionesTransportista')} />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
