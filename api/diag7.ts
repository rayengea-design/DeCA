import type { VercelResponse } from '@vercel/node'
import { getAdminAuth } from './_lib/firebaseAdmin'

export default async function handler(_req: unknown, res: VercelResponse) {
  try {
    const auth = await getAdminAuth()
    res.status(200).json({ ok: true, authOk: Boolean(auth) })
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null })
  }
}
