import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib'
import QRCode from 'qrcode'
import type { DecaFormValues } from '@/types/deca'

const BRAND_RED = rgb(0.753, 0.035, 0.055) // #C0090E
const BRAND_RED_DARK = rgb(0.639, 0.031, 0.047) // #A3080C
const INK = rgb(0.04, 0.04, 0.04)
const GRAY = rgb(0.42, 0.42, 0.42)
const LIGHT_GRAY_BG = rgb(0.965, 0.963, 0.96)
const HAIRLINE = rgb(0.88, 0.87, 0.86)

const PAGE_WIDTH = 595.28 // A4 pt
const PAGE_HEIGHT = 841.89
const MARGIN = 40
const ACCENT_BAR_H = 7
const ACCENT_W = 3
const TITLE_H = 26
const ROW_GAP = 8
const SECTION_GAP = 12

interface BuildDecaPdfOptions {
  docId: string
  publicUrl: string
  data: DecaFormValues
  createdAtIso: string
  /** Present when this PDF replaces a previously issued DeCA (Resolución 5
   * junio 2026, apartado Quinto) — rendered as a visible notice so anyone
   * comparing paperwork can see this supersedes an earlier version and why. */
  correctionInfo?: { originalDocId: string; reason: string }
}

async function fetchAsUint8Array(url: string): Promise<Uint8Array> {
  const res = await fetch(url)
  const buf = await res.arrayBuffer()
  return new Uint8Array(buf)
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

export function decaFileName(matricula: string, fecha: string) {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9]+/g, '').toUpperCase()
  return `DeCA_${safe(matricula) || 'SINMATRICULA'}_${fecha || 'sinfecha'}.pdf`
}

interface FieldSpec {
  x: number
  width: number
  label: string
  value: string
  size?: number
}

interface Fonts {
  font: PDFFont
  fontBold: PDFFont
}

function measureField(f: FieldSpec, fonts: Fonts): number {
  const size = f.size ?? 10
  const lines = wrapText(f.value || '—', fonts.fontBold, size, f.width)
  const labelH = f.label ? 11 : 0
  return labelH + lines.length * (size + 3)
}

function drawField(page: PDFPage, f: FieldSpec, topY: number, fonts: Fonts) {
  const size = f.size ?? 10
  if (f.label) {
    page.drawText(f.label.toUpperCase(), { x: f.x, y: topY, size: 6.8, font: fonts.font, color: GRAY })
  }
  const lines = wrapText(f.value || '—', fonts.fontBold, size, f.width)
  let ly = topY - (f.label ? 11 : 0) - size
  for (const line of lines) {
    page.drawText(line, { x: f.x, y: ly, size, font: fonts.fontBold, color: INK })
    ly -= size + 3
  }
}

/** Draws a titled, shaded section box whose height is computed from its actual
 * content (rows of side-by-side fields), so long company names, addresses or
 * observations can never overlap the row below them. Returns the y position
 * immediately below the section (ready for the next one). */
function drawSection(
  page: PDFPage,
  x: number,
  top: number,
  width: number,
  title: string,
  rows: FieldSpec[][],
  fonts: Fonts,
): number {
  const rowHeights = rows.map((row) => Math.max(...row.map((f) => measureField(f, fonts))))
  const contentH = TITLE_H + rowHeights.reduce((a, b) => a + b, 0) + ROW_GAP * Math.max(rows.length - 1, 0) + 10

  page.drawRectangle({ x, y: top - contentH, width, height: contentH, color: LIGHT_GRAY_BG })
  page.drawRectangle({ x, y: top - contentH, width: ACCENT_W, height: contentH, color: BRAND_RED })
  if (title.trim()) {
    page.drawText(title.toUpperCase(), {
      x: x + 14,
      y: top - 15,
      size: 8,
      font: fonts.fontBold,
      color: BRAND_RED_DARK,
    })
  }

  let rowTop = top - TITLE_H
  rows.forEach((row, i) => {
    for (const f of row) drawField(page, f, rowTop, fonts)
    rowTop -= rowHeights[i] + ROW_GAP
  })

  return top - contentH
}

export async function buildDecaPdf({ docId, publicUrl, data, createdAtIso, correctionInfo }: BuildDecaPdfOptions) {
  const pdfDoc = await PDFDocument.create()

  const createdAt = new Date(createdAtIso)
  pdfDoc.setTitle(`DeCA ${data.matriculaTractora} ${data.fechaTransporte}`)
  pdfDoc.setSubject('Documento electrónico de Control Administrativo')
  pdfDoc.setCreator('DeCA')
  pdfDoc.setProducer('DeCA')
  pdfDoc.setCreationDate(createdAt)
  pdfDoc.setModificationDate(createdAt)

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fonts: Fonts = { font, fontBold }

  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    margin: 0,
    width: 320,
    color: { dark: '#0A0A0A', light: '#00000000' },
  })
  const qrBytes = await fetchAsUint8Array(qrDataUrl)
  const qrImage = await pdfDoc.embedPng(qrBytes)

  // Top brand accent bar
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - ACCENT_BAR_H, width: PAGE_WIDTH, height: ACCENT_BAR_H, color: BRAND_RED })

  let y = PAGE_HEIGHT - ACCENT_BAR_H - 28

  // Header: title (left) / doc meta (right)
  const titleX = MARGIN
  page.drawText('DOCUMENTO ELECTRÓNICO DE', { x: titleX, y: y - 2, size: 13, font: fontBold, color: INK })
  page.drawText('CONTROL ADMINISTRATIVO', { x: titleX, y: y - 17, size: 13, font: fontBold, color: INK })
  page.drawText('DeCA', { x: titleX, y: y - 32, size: 9, font: fontBold, color: BRAND_RED })

  const metaLines = [
    `Documento nº ${docId.slice(0, 8).toUpperCase()}`,
    `Emitido: ${createdAt.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
  ]
  metaLines.forEach((line, i) => {
    const w = font.widthOfTextAtSize(line, 8)
    page.drawText(line, { x: PAGE_WIDTH - MARGIN - w, y: y - 4 - i * 11, size: 8, font, color: GRAY })
  })

  y -= 46

  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: HAIRLINE })
  y -= 14

  page.drawText('Cumple con la Orden FOM/2861/2012 y la Resolución de 5 de junio de 2026 (DGTCF)', {
    x: MARGIN,
    y,
    size: 7.5,
    font,
    color: GRAY,
  })
  y -= 22

  if (correctionInfo) {
    const contentWidth0 = PAGE_WIDTH - MARGIN * 2
    const noticeLines = wrapText(
      `Este documento sustituye al DeCA nº ${correctionInfo.originalDocId.slice(0, 8).toUpperCase()}. Motivo: ${correctionInfo.reason}`,
      font,
      8,
      contentWidth0 - 20,
    )
    const noticeH = 10 + noticeLines.length * 11
    page.drawRectangle({ x: MARGIN, y: y - noticeH, width: contentWidth0, height: noticeH, color: rgb(0.996, 0.949, 0.85) })
    page.drawRectangle({ x: MARGIN, y: y - noticeH, width: ACCENT_W, height: noticeH, color: BRAND_RED })
    let noticeY = y - 12
    for (const line of noticeLines) {
      page.drawText(line, { x: MARGIN + 14, y: noticeY, size: 8, font: fontBold, color: BRAND_RED_DARK })
      noticeY -= 11
    }
    y -= noticeH + 12
  }

  const contentWidth = PAGE_WIDTH - MARGIN * 2
  const colGap = 14
  const colWidth = (contentWidth - colGap) / 2
  const col2X = MARGIN + colWidth + colGap

  // a) Cargador contractual / b) Transportista efectivo — two boxes side by
  // side, each internally stacking two fields; height follows content.
  const h1a = drawSection(
    page,
    MARGIN,
    y,
    colWidth,
    'a) Cargador contractual',
    [
      [{ x: MARGIN + 14, width: colWidth - 26, label: 'Nombre / Razón social', value: data.cargador.nombre }],
      [{ x: MARGIN + 14, width: colWidth - 26, label: 'NIF/CIF', value: data.cargador.nif }],
    ],
    fonts,
  )
  const h1b = drawSection(
    page,
    col2X,
    y,
    colWidth,
    'b) Transportista efectivo',
    [
      [{ x: col2X + 14, width: colWidth - 26, label: 'Nombre / Razón social', value: data.transportista.nombre }],
      [{ x: col2X + 14, width: colWidth - 26, label: 'NIF/CIF', value: data.transportista.nif }],
    ],
    fonts,
  )
  y = Math.min(h1a, h1b) - SECTION_GAP

  // c) Origen / Destino
  const h2a = drawSection(
    page,
    MARGIN,
    y,
    colWidth,
    'c) Origen',
    [[{ x: MARGIN + 14, width: colWidth - 26, label: '', value: data.origen, size: 11 }]],
    fonts,
  )
  const h2b = drawSection(
    page,
    col2X,
    y,
    colWidth,
    'Destino',
    [[{ x: col2X + 14, width: colWidth - 26, label: '', value: data.destino, size: 11 }]],
    fonts,
  )
  y = Math.min(h2a, h2b) - SECTION_GAP

  // d) Naturaleza y peso de la mercancía
  const dCol1 = MARGIN + 14
  const dCol1W = contentWidth * 0.5 - 20
  const dCol2 = MARGIN + contentWidth * 0.56
  const dCol2W = contentWidth * 0.2 - 10
  const dCol3 = MARGIN + contentWidth * 0.79
  const dCol3W = contentWidth * 0.19 - 10
  y =
    drawSection(
      page,
      MARGIN,
      y,
      contentWidth,
      'd) Naturaleza y peso de la mercancía',
      [
        [
          { x: dCol1, width: dCol1W, label: 'Naturaleza de la mercancía', value: data.naturalezaMercancia },
          { x: dCol2, width: dCol2W, label: 'Peso (kg)', value: data.peso },
          { x: dCol3, width: dCol3W, label: 'Bultos', value: data.bultos ?? '' },
        ],
      ],
      fonts,
    ) - SECTION_GAP

  // f) Fecha / g) Matrícula / e) Autorización especial — three even columns
  const third = contentWidth / 3
  const matricula = `${data.matriculaTractora}${data.matriculaRemolque ? ' / ' + data.matriculaRemolque : ''}`
  const h4a = drawSection(
    page,
    MARGIN,
    y,
    third,
    'f) Fecha de realización',
    [[{ x: MARGIN + 14, width: third - 26, label: '', value: data.fechaTransporte, size: 11 }]],
    fonts,
  )
  const h4b = drawSection(
    page,
    MARGIN + third,
    y,
    third,
    'g) Matrícula',
    [
      [{ x: MARGIN + third + 14, width: third - 26, label: '', value: matricula, size: 11 }],
      ...(data.cambioVehiculo
        ? [[{ x: MARGIN + third + 14, width: third - 26, label: 'Cambio de vehículo', value: data.cambioVehiculo, size: 8 }]]
        : []),
    ],
    fonts,
  )
  const h4c = drawSection(
    page,
    MARGIN + third * 2,
    y,
    third,
    'e) Autorización especial',
    [
      [
        {
          x: MARGIN + third * 2 + 14,
          width: third - 26,
          label: '',
          value: data.autorizacionEspecial || 'No aplica',
          size: 10,
        },
      ],
    ],
    fonts,
  )
  y = Math.min(h4a, h4b, h4c) - SECTION_GAP

  // h) Observaciones (free text — can be long, hence the dynamic section height)
  if (data.observacionesCargador || data.observacionesTransportista) {
    y =
      drawSection(
        page,
        MARGIN,
        y,
        contentWidth,
        'h) Observaciones',
        [
          [
            {
              x: MARGIN + 14,
              width: colWidth - 20,
              label: 'Cargador contractual',
              value: data.observacionesCargador || '—',
              size: 9,
            },
            {
              x: col2X + 14,
              width: colWidth - 20,
              label: 'Transportista efectivo',
              value: data.observacionesTransportista || '—',
              size: 9,
            },
          ],
        ],
        fonts,
      ) - SECTION_GAP
  }

  // Footer: QR + validity note
  const qrSize = 92
  const footerTop = MARGIN + qrSize + 34
  page.drawLine({
    start: { x: MARGIN, y: footerTop },
    end: { x: PAGE_WIDTH - MARGIN, y: footerTop },
    thickness: 1,
    color: HAIRLINE,
  })

  const qrBoxY = footerTop - qrSize - 14
  page.drawRectangle({
    x: MARGIN,
    y: qrBoxY,
    width: qrSize,
    height: qrSize,
    color: rgb(1, 1, 1),
    borderColor: HAIRLINE,
    borderWidth: 1,
  })
  page.drawImage(qrImage, { x: MARGIN + 6, y: qrBoxY + 6, width: qrSize - 12, height: qrSize - 12 })

  const infoX = MARGIN + qrSize + 18
  const infoWidth = contentWidth - qrSize - 18
  page.drawText('CÓDIGO QR DE VERIFICACIÓN', {
    x: infoX,
    y: footerTop - 14,
    size: 8.5,
    font: fontBold,
    color: BRAND_RED_DARK,
  })

  const validUntil = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
  const noteLines = wrapText(
    `Este QR enlaza a la descarga directa de este documento. Válido para inspección durante 7 días naturales desde su emisión (hasta ${validUntil.toLocaleDateString('es-ES')}). El documento debe conservarse 1 año.`,
    font,
    8,
    infoWidth,
  )
  let noteY = footerTop - 30
  for (const line of noteLines) {
    page.drawText(line, { x: infoX, y: noteY, size: 8, font, color: GRAY })
    noteY -= 11
  }

  noteY -= 5
  const urlLines = wrapText(publicUrl, font, 6.5, infoWidth)
  for (const line of urlLines) {
    page.drawText(line, { x: infoX, y: noteY, size: 6.5, font, color: GRAY })
    noteY -= 9
  }

  // Bottom fine print + accent bar
  const ownName = data.ownRole === 'cargador' ? data.cargador.nombre : data.transportista.nombre
  page.drawText(`Generado por DeCA · ${ownName}`, { x: MARGIN, y: 22, size: 6.5, font, color: GRAY })
  const pageLabel = 'Página 1/1'
  page.drawText(pageLabel, {
    x: PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(pageLabel, 6.5),
    y: 22,
    size: 6.5,
    font,
    color: GRAY,
  })
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: ACCENT_BAR_H, color: BRAND_RED })

  const bytes = await pdfDoc.save()
  return bytes
}

interface SupersededNoticeOptions {
  originalDocId: string
  newDocId: string
  newPublicUrl: string
  reason: string
  supersededAtIso: string
}

/** Overwrites an original DeCA's PDF (same storage path, same public URL) with
 * a short notice once it has been corrected, so anyone who scans an old
 * printed/saved QR is pointed straight at the current, valid document instead
 * of silently reading outdated data. */
export async function buildSupersededNoticePdf({
  originalDocId,
  newDocId,
  newPublicUrl,
  reason,
  supersededAtIso,
}: SupersededNoticeOptions) {
  const pdfDoc = await PDFDocument.create()
  const supersededAt = new Date(supersededAtIso)
  pdfDoc.setTitle(`DeCA ${originalDocId} — sustituido`)
  pdfDoc.setCreator('DeCA')
  pdfDoc.setProducer('DeCA')
  pdfDoc.setCreationDate(supersededAt)
  pdfDoc.setModificationDate(supersededAt)

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const qrDataUrl = await QRCode.toDataURL(newPublicUrl, {
    margin: 0,
    width: 320,
    color: { dark: '#0A0A0A', light: '#00000000' },
  })
  const qrImage = await pdfDoc.embedPng(await fetchAsUint8Array(qrDataUrl))

  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - ACCENT_BAR_H, width: PAGE_WIDTH, height: ACCENT_BAR_H, color: BRAND_RED })

  let y = PAGE_HEIGHT - ACCENT_BAR_H - 28

  page.drawText('ESTE DOCUMENTO YA NO ES VÁLIDO', { x: MARGIN, y, size: 18, font: fontBold, color: BRAND_RED })
  y -= 24

  const contentWidth = PAGE_WIDTH - MARGIN * 2
  const bodyLines = wrapText(
    `El DeCA nº ${originalDocId.slice(0, 8).toUpperCase()} ha sido sustituido por una versión corregida (Resolución de 5 de junio de 2026, apartado Quinto). Motivo: ${reason}`,
    font,
    11,
    contentWidth,
  )
  for (const line of bodyLines) {
    page.drawText(line, { x: MARGIN, y, size: 11, font, color: INK })
    y -= 16
  }
  y -= 10

  page.drawText('Escanea este QR o usa el enlace para descargar el documento vigente:', {
    x: MARGIN,
    y,
    size: 10,
    font,
    color: GRAY,
  })
  y -= 20

  const qrSize = 140
  page.drawImage(qrImage, { x: MARGIN, y: y - qrSize, width: qrSize, height: qrSize })

  const urlLines = wrapText(newPublicUrl, font, 8, contentWidth - qrSize - 20)
  let urlY = y - 14
  for (const line of urlLines) {
    page.drawText(line, { x: MARGIN + qrSize + 20, y: urlY, size: 8, font, color: GRAY })
    urlY -= 11
  }
  page.drawText(`Nuevo documento nº ${newDocId.slice(0, 8).toUpperCase()}`, {
    x: MARGIN + qrSize + 20,
    y: urlY - 10,
    size: 8,
    font: fontBold,
    color: INK,
  })

  page.drawText(
    `Sustituido el ${supersededAt.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    { x: MARGIN, y: 22, size: 6.5, font, color: GRAY },
  )
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: ACCENT_BAR_H, color: BRAND_RED })

  return pdfDoc.save()
}
