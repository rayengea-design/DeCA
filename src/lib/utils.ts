import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Opens WhatsApp's "click to chat" link with a pre-filled message — no
 * phone number needed, the person sending it picks the contact themselves
 * (the driver, in this app's case). Works on both desktop (web.whatsapp.com)
 * and mobile (opens the app) since wa.me redirects appropriately. This is
 * only a fallback for `shareDecaPdf` below: a wa.me link can carry text but
 * there's no way to attach a file to it. */
export function buildWhatsAppShareUrl(publicUrl: string, label: string) {
  const text = `${label}\n${publicUrl}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

/** Shares the actual PDF file (not just its link) through the device's
 * native share sheet, so picking WhatsApp attaches the document itself —
 * this is what the Web Share API's `files` support is for, and it's
 * available on Android Chrome and iOS Safari. Desktop browsers generally
 * don't support sharing files this way, and there's no way to attach a
 * file to a wa.me URL, so there we fall back to the old link-only share. */
export async function shareDecaPdf(pdfUrl: string, fileName: string, label: string) {
  if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
    try {
      const blob = await (await fetch(pdfUrl)).blob()
      const file = new File([blob], fileName, { type: 'application/pdf' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: label, text: label })
        return
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return // user closed the share sheet
      // otherwise fall through to the link-based fallback below
    }
  }
  window.open(buildWhatsAppShareUrl(pdfUrl, label), '_blank', 'noreferrer')
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
