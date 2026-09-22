import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { getStripeClient } from '@/lib/stripeClient'

interface PaymentFormProps {
  onSuccess: () => void
  onCancel: () => void
}

function PaymentForm({ onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    // `redirect: 'if_required'` is what keeps this in-app: Stripe only
    // navigates away as a last resort, for the handful of banks whose 3D
    // Secure challenge genuinely requires a full-page redirect rather than
    // the in-page modal most EU cards use today. That step itself is a
    // regulatory requirement (PSD2/SCA) that exists no matter which Stripe
    // integration is used — not something either Checkout or Elements adds.
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/app/facturacion?checkout=exito`,
      },
    })

    if (confirmError) {
      setError(confirmError.message ?? 'No se pudo procesar el pago. Revisa los datos e inténtalo de nuevo.')
      setSubmitting(false)
      return
    }
    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      onSuccess()
      return
    }
    setError('El pago no se pudo confirmar. Inténtalo de nuevo.')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={!stripe || !elements || submitting} className="flex-1">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Pagar y suscribirme
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

interface EmbeddedPaymentProps {
  clientSecret: string
  onSuccess: () => void
  onCancel: () => void
}

/** The card form itself, rendered inline in the page (inside an iframe
 * Stripe.js controls, so raw card data never touches our server — same PCI
 * scope as the redirect-based Checkout this replaces) instead of navigating
 * to a Stripe-hosted page. */
export function EmbeddedPayment({ clientSecret, onSuccess, onCancel }: EmbeddedPaymentProps) {
  return (
    <Elements stripe={getStripeClient()} options={{ clientSecret, locale: 'es' }}>
      <PaymentForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  )
}
