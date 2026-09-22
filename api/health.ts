import type { VercelResponse } from '@vercel/node'

export default function handler(_req: unknown, res: VercelResponse) {
  res.status(200).json({ ok: true, node: process.version })
}
