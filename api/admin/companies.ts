import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAdminDb } from '../_lib/firebaseAdmin'
import { ApiError } from '../_lib/requireCompanyAdmin'
import { requirePlatformAdmin } from '../_lib/requirePlatformAdmin'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    await requirePlatformAdmin(req)

    const snap = await getAdminDb().collection('companies').orderBy('createdAt', 'desc').get()
    const companies = snap.docs.map((d) => {
      const c = d.data()
      return {
        id: d.id,
        nombre: c.nombre ?? '',
        nif: c.nif ?? '',
        createdAt: c.createdAt ?? null,
        plan: c.plan ?? null,
        subscriptionStatus: c.subscriptionStatus ?? null,
        comped: c.comped ?? false,
        decaCount: c.decaCount ?? 0,
        memberCount: c.memberCount ?? 1,
        hasStripeCustomer: Boolean(c.stripeCustomerId),
      }
    })

    return res.status(200).json({ companies })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    console.error('admin/companies error', err)
    return res.status(500).json({ error: 'No se pudo cargar la lista de empresas' })
  }
}
