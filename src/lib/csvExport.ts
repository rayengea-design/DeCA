import type { DecaRecord } from '@/types/deca'

function csvCell(value: string) {
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

export function decaDocsToCsv(docs: DecaRecord[]): string {
  const headers = [
    'Fecha transporte',
    'Origen',
    'Destino',
    'Matrícula tractora',
    'Matrícula remolque',
    'Naturaleza mercancía',
    'Peso (kg)',
    'Bultos',
    'Cargador contractual',
    'NIF cargador',
    'Transportista efectivo',
    'NIF transportista',
    'Estado',
    'Creado por',
    'Fecha de creación',
    'Enlace PDF',
  ]

  const rows = docs.map((d) => [
    d.fechaTransporte,
    d.origen,
    d.destino,
    d.matriculaTractora,
    d.matriculaRemolque ?? '',
    d.naturalezaMercancia,
    d.peso,
    d.bultos ?? '',
    d.cargador.nombre,
    d.cargador.nif,
    d.transportista.nombre,
    d.transportista.nif,
    d.status === 'active' ? 'Activo' : 'Sustituido',
    d.createdByName || d.createdByEmail,
    new Date(d.createdAt).toLocaleString('es-ES'),
    d.publicUrl,
  ])

  const lines = [headers, ...rows].map((row) => row.map((cell) => csvCell(String(cell))).join(','))
  // Leading BOM so Excel opens the UTF-8 file with accents intact instead of mojibake.
  return '﻿' + lines.join('\r\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
