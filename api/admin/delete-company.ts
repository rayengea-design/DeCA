import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAdminAuth, getAdminDb, getAdminStorage } from '../_lib/firebaseAdmin.js'
import { ApiError } from '../_lib/requireCompanyAdmin.js'
import { requirePlatformAdmin } from '../_lib/requirePlatformAdmin.js'
import { getStripe } from '../_lib/stripe.js'

/** Irreversibly wipes a company: every team member's Firebase Auth account,
 * their `users/{uid}` profiles, the company's PDFs in Storage, its Stripe
 * subscription, and the `companies/{id}` doc with all its subcollections
 * (decaDocs/savedTrips/savedCounterparties, via `recursiveDelete`). Used
 * from the platform admin panel when a customer account needs to go away
 * completely — not the same as a company admin disabling/removing one
 * teammate (api/team/delete-member.ts), which never touches Storage,
 * Stripe, or the company doc itself. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    await requirePlatformAdmin(req)

    const companyId = req.body?.companyId as string | undefined
    if (!companyId) return res.status(400).json({ error: 'Falta companyId' })

    const adminDb = await getAdminDb()
    const companyRef = adminDb.collection('companies').doc(companyId)
    const companySnap = await companyRef.get()
    if (!companySnap.exists) return res.status(404).json({ error: 'No se encontró la empresa' })
    const company = companySnap.data()!

    if (company.stripeSubscriptionId) {
      try {
        const stripe = await getStripe()
        await stripe.subscriptions.cancel(company.stripeSubscriptionId as string)
      } catch (err) {
        console.error('delete-company: no se pudo cancelar la suscripción de Stripe', companyId, err)
      }
    }

    const usersSnap = await adminDb.collection('users').where('companyId', '==', companyId).get()
    const adminAuth = await getAdminAuth()
    for (const userDoc of usersSnap.docs) {
      await adminAuth.deleteUser(userDoc.id).catch((err: { code?: string }) => {
        if (err?.code !== 'auth/user-not-found') throw err
      })
    }
    const usersBatch = adminDb.batch()
    for (const userDoc of usersSnap.docs) usersBatch.delete(userDoc.ref)
    if (usersSnap.size > 0) await usersBatch.commit()

    const bucket = await getAdminStorage()
    await bucket.deleteFiles({ prefix: `deca/${companyId}/` })

    await adminDb.recursiveDelete(companyRef)

    return res.status(200).json({ ok: true, deletedUsers: usersSnap.size })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    console.error('admin/delete-company error', err)
    return res.status(500).json({ error: 'No se pudo eliminar la empresa' })
  }
}
