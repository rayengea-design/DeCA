import { Download, Eye, EyeOff, FileDown, Loader2, MessageCircle, Pencil } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'
import { decaDocsToCsv, downloadCsv } from '@/lib/csvExport'
import { cn, formatDateTime, shareDecaPdf } from '@/lib/utils'
import { listDecaDocuments, setDecaHidden } from '@/services/decaService'
import { decaFileName } from '@/services/pdfGenerator'
import type { DecaRecord } from '@/types/deca'

function StatusBadge({ status }: { status: DecaRecord['status'] }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
        status === 'active' ? 'bg-green-100 text-green-700' : 'bg-ink-100 text-ink-500'
      }`}
    >
      {status === 'active' ? 'Activo' : 'Sustituido'}
    </span>
  )
}

export function HistoryPage() {
  const { user, profile, company } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [docs, setDocs] = useState<DecaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [matricula, setMatricula] = useState('')
  const [fecha, setFecha] = useState('')
  const [view, setView] = useState<'visibles' | 'ocultos'>('visibles')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [sharingId, setSharingId] = useState<string | null>(null)

  useEffect(() => {
    if (!company || !user) return
    // Admins see every DeCA the company has issued; a driver only ever sees
    // the ones they created themselves — enforced again server-side by
    // firestore.rules, this is just the matching query shape.
    listDecaDocuments(company.id, isAdmin ? undefined : user.uid)
      .then(setDocs)
      .finally(() => setLoading(false))
  }, [company, user, isAdmin])

  const docsById = useMemo(() => new Map(docs.map((d) => [d.id, d])), [docs])

  const filtered = useMemo(() => {
    const matriculaTerm = matricula.trim().toLowerCase()
    return docs
      .filter((d) => (view === 'ocultos' ? d.hidden : !d.hidden))
      .filter((d) => !matriculaTerm || d.matriculaTractora.toLowerCase().includes(matriculaTerm))
      .filter((d) => !fecha || d.fechaTransporte === fecha)
  }, [docs, matricula, fecha, view])

  const hiddenCount = useMemo(() => docs.filter((d) => d.hidden).length, [docs])

  function handleExportCsv() {
    const csv = decaDocsToCsv(filtered)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`DeCA_${company?.nombre ?? 'historial'}_${stamp}.csv`, csv)
  }

  async function handleSetHidden(id: string, hidden: boolean) {
    if (!company) return
    setPendingId(id)
    try {
      await setDecaHidden(company.id, id, hidden)
      setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, hidden } : d)))
    } finally {
      setPendingId(null)
    }
  }

  async function handleShareWhatsApp(d: DecaRecord) {
    setSharingId(d.id)
    try {
      await shareDecaPdf(
        d.publicUrl,
        decaFileName(d.matriculaTractora, d.fechaTransporte),
        `DeCA ${d.matriculaTractora} · ${d.origen} → ${d.destino}`,
      )
    } finally {
      setSharingId(null)
    }
  }

  function ReplacementNote({ d }: { d: DecaRecord }) {
    if (d.status !== 'superseded' || !d.supersededBy) return null
    const replacement = docsById.get(d.supersededBy)
    if (!replacement) return null
    return (
      <a
        href={replacement.publicUrl}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-brand-600 hover:underline"
      >
        Ver DeCA vigente que lo sustituye →
      </a>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold text-ink-900">Historial de DeCA</h1>
        <div className="inline-flex self-start rounded-md border border-ink-200 bg-white p-0.5 text-sm">
          <button
            onClick={() => setView('visibles')}
            className={cn(
              'rounded px-3 py-1 font-medium transition-colors',
              view === 'visibles' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            Visibles
          </button>
          <button
            onClick={() => setView('ocultos')}
            className={cn(
              'rounded px-3 py-1 font-medium transition-colors',
              view === 'ocultos' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            Ocultos{hiddenCount > 0 ? ` (${hiddenCount})` : ''}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Input
          placeholder="Buscar por matrícula..."
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
        />
        <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <Button
          type="button"
          variant="outline"
          onClick={handleExportCsv}
          disabled={filtered.length === 0}
          className="sm:w-auto"
        >
          <FileDown className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-ink-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-400">
          {view === 'ocultos' ? 'No hay documentos ocultos.' : 'No hay documentos que coincidan.'}
        </p>
      ) : (
        <>
          {/* Mobile: stacked cards (a wide table doesn't fit a phone screen) */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filtered.map((d) => (
              <div key={d.id} className="rounded-lg border border-ink-100 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink-900">
                      {d.origen} → {d.destino}
                    </p>
                    <p className="text-xs text-ink-400">{d.fechaTransporte}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-ink-400">Matrícula</p>
                    <p className="text-ink-700">{d.matriculaTractora}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">Mercancía</p>
                    <p className="truncate text-ink-700">{d.naturalezaMercancia}</p>
                  </div>
                </div>
                <ReplacementNote d={d} />
                <div className="mt-3 flex items-center justify-between border-t border-ink-50 pt-3">
                  <div>
                    <p className="text-xs text-ink-400">Creado: {formatDateTime(d.createdAt)}</p>
                    {isAdmin && (
                      <p className="text-xs text-ink-400">Por: {d.createdByName || d.createdByEmail}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={d.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </a>
                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(d)}
                      disabled={sharingId === d.id}
                      title="Enviar por WhatsApp"
                      className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:underline disabled:opacity-50"
                    >
                      {sharingId === d.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <MessageCircle className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {d.status === 'active' && (
                      <Link
                        to={`/app/historial/${d.id}/corregir`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Corregir
                      </Link>
                    )}
                    <button
                      disabled={pendingId === d.id}
                      onClick={() => handleSetHidden(d.id, !d.hidden)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900 disabled:opacity-50"
                    >
                      {d.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      {d.hidden ? 'Recuperar' : 'Ocultar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop / tablet: table */}
          <div className="hidden overflow-x-auto rounded-lg border border-ink-100 bg-white sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50 text-xs uppercase text-ink-400">
                <tr>
                  <th className="px-4 py-2.5">Fecha transporte</th>
                  <th className="px-4 py-2.5">Origen → Destino</th>
                  <th className="px-4 py-2.5">Matrícula</th>
                  <th className="px-4 py-2.5">Mercancía</th>
                  {isAdmin && <th className="px-4 py-2.5">Creado por</th>}
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5">Creado</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                    <td className="px-4 py-2.5 font-medium text-ink-900">{d.fechaTransporte}</td>
                    <td className="px-4 py-2.5 text-ink-600">
                      {d.origen} → {d.destino}
                    </td>
                    <td className="px-4 py-2.5 text-ink-600">{d.matriculaTractora}</td>
                    <td className="px-4 py-2.5 text-ink-600">{d.naturalezaMercancia}</td>
                    {isAdmin && (
                      <td className="px-4 py-2.5 text-ink-600">{d.createdByName || d.createdByEmail}</td>
                    )}
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={d.status} />
                        <ReplacementNote d={d} />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-ink-400">{formatDateTime(d.createdAt)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={d.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </a>
                        <button
                          type="button"
                          onClick={() => handleShareWhatsApp(d)}
                          disabled={sharingId === d.id}
                          title="Enviar por WhatsApp"
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                        >
                          {sharingId === d.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <MessageCircle className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {d.status === 'active' && (
                          <Link
                            to={`/app/historial/${d.id}/corregir`}
                            title="Corregir DeCA"
                            className="inline-flex items-center gap-1 text-ink-400 hover:text-ink-900"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        <button
                          disabled={pendingId === d.id}
                          onClick={() => handleSetHidden(d.id, !d.hidden)}
                          title={d.hidden ? 'Recuperar' : 'Ocultar del historial'}
                          className="inline-flex items-center gap-1 text-ink-400 hover:text-ink-900 disabled:opacity-50"
                        >
                          {d.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
