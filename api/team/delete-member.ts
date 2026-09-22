import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminAuth, getAdminDb } from '../_lib/firebaseAdmin.js'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin.js'

/** Hard-deletes a driver's account (Firebase Auth + their users/{uid}
 * profile) — unlike setTeamMemberDisabled, this can't be undone, and the
 * client SDK has no way to delete another user's Auth account at all (it can
 * only delete auth.currentUser), hence this needs the Admin SDK. Every DeCA
 * that driver ever created is completely untouched: decaDocs has
 * `allow delete: if false` in firestore.rules with no exception, and each
 * record already carries its own createdByEmail/createdByName denormalized
 * at creation time, so the history view keeps showing who made it forever,
 * independent of whether their account still exists. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { uid: adminUid, companyRef } = await requireCompanyAdmin(req)

    const targetUid = req.body?.uid as string | undefined
    if (!targetUid) return res.status(400).json({ error: 'Falta uid' })
    if (targetUid === adminUid) return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' })

    const adminDb = await getAdminDb()
    const targetRef = adminDb.collection('users').doc(targetUid)
    const targetSnap = await targetRef.get()
    const target = targetSnap.data()
    if (!target || target.companyId !== companyRef.id) {
      return res.status(404).json({ error: 'No se encontró esa cuenta en tu equipo' })
    }
    if (target.role === 'admin') {
      return res.status(400).json({
        error: 'No se puede eliminar una cuenta de administrador. Cámbiale el rol a conductor primero.',
      })
    }

    const adminAuth = await getAdminAuth()
    await adminAuth.deleteUser(targetUid).catch((err: { code?: string }) => {
      // Already gone from Auth (e.g. removed by hand before) — still clean
      // up the leftover Firestore profile below instead of failing here.
      if (err?.code !== 'auth/user-not-found') throw err
    })

    await targetRef.delete()
    // A disabled seat was already freed when it was disabled — only an
    // active one frees a seat on delete, mirroring setTeamMemberDisabled's
    // own accounting so memberCount never drifts either way.
    if (!target.disabled) {
      await companyRef.update({ memberCount: FieldValue.increment(-1) })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    console.error('team/delete-member error', err)
    return res.status(500).json({ error: 'No se pudo eliminar la cuenta' })
  }
}
