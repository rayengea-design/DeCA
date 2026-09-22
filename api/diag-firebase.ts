import type { VercelResponse } from '@vercel/node'

export default async function handler(_req: unknown, res: VercelResponse) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT
    const hasVar = Boolean(raw)
    const rawLength = raw?.length ?? 0

    const { cert, getApps, initializeApp } = await import('firebase-admin/app')
    let decodeOk = false
    let projectId: string | null = null
    let clientEmail: string | null = null
    let certOk = false
    let certError: string | null = null

    if (raw) {
      const decoded = Buffer.from(raw, 'base64').toString('utf-8')
      const parsed = JSON.parse(decoded)
      decodeOk = true
      projectId = parsed.project_id ?? null
      clientEmail = parsed.client_email ?? null
      try {
        if (!getApps().length) initializeApp({ credential: cert(parsed) })
        certOk = true
      } catch (e) {
        certError = String(e)
      }
    }

    res.status(200).json({ ok: true, hasVar, rawLength, decodeOk, projectId, clientEmail, certOk, certError })
  } catch (err) {
    res
      .status(500)
      .json({ ok: false, stage: 'firebase-admin', error: String(err), stack: err instanceof Error ? err.stack : null })
  }
}
