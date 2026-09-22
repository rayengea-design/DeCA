import type { VercelResponse } from '@vercel/node'
import { trivialValue } from './lib2/trivial'

export default function handler(_req: unknown, res: VercelResponse) {
  res.status(200).json({ ok: true, value: trivialValue() })
}
