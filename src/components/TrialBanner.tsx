import { AlertCircle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { daysSinceSignup, isSubscribed, isTrialExhausted, TRIAL_DAY_LIMIT, TRIAL_DOC_LIMIT } from '@/lib/trial'

/** Slim bar across the app shell that keeps the free trial visible: how many
 * DeCA / days are left, or that it has run out, with a direct link to the
 * plans for an admin. Renders nothing once the company is subscribed or has a
 * comped plan — only the free trial needs the nudge. */
export function TrialBanner() {
  const { company, profile } = useAuth()
  if (!company || isSubscribed(company) || company.comped) return null

  const isAdmin = profile?.role === 'admin'
  const docsLeft = Math.max(0, TRIAL_DOC_LIMIT - (company.decaCount ?? 0))
  const daysLeft = Math.max(0, TRIAL_DAY_LIMIT - daysSinceSignup(company))
  const exhausted = isTrialExhausted(company)
  // Amber while there's comfortable runway, red when it's run out or about to
  // (the last document or the last day) so the nudge gets more urgent.
  const urgent = exhausted || docsLeft <= 1 || daysLeft <= 1

  const tone = urgent
    ? 'border-brand-200 bg-brand-50 text-brand-800'
    : 'border-amber-200 bg-amber-50 text-amber-800'

  return (
    <div className={`mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border px-4 py-2.5 text-sm ${tone}`}>
      {urgent ? <AlertCircle className="h-4 w-4 shrink-0" /> : <Clock className="h-4 w-4 shrink-0" />}
      <span className="font-medium">
        {exhausted ? (
          'Tu prueba gratuita ha terminado.'
        ) : (
          <>
            Prueba gratuita: te quedan <strong>{docsLeft}</strong> DeCA y <strong>{daysLeft}</strong>{' '}
            {daysLeft === 1 ? 'día' : 'días'} (lo que llegue antes).
          </>
        )}
      </span>
      {isAdmin ? (
        <Link
          to="/app/facturacion"
          className="ml-auto shrink-0 font-semibold underline underline-offset-2 hover:no-underline"
        >
          {exhausted ? 'Suscríbete para seguir' : 'Ver planes'}
        </Link>
      ) : (
        <span className="ml-auto shrink-0 text-xs opacity-80">Pídele a un administrador que active un plan.</span>
      )}
    </div>
  )
}
