import { AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export function TrialExhaustedNotice() {
  return (
    <Card className="mx-auto max-w-lg border-brand-200 bg-brand-50">
      <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
        <AlertCircle className="h-8 w-8 text-brand-600" />
        <p className="font-semibold text-brand-900">Tu prueba gratuita ha terminado</p>
        <p className="text-sm text-brand-700">
          Ya no se pueden generar nuevos DeCA sin una suscripción activa. Tus documentos anteriores siguen
          disponibles en el historial.
        </p>
        <Button asChild>
          <Link to="/app/facturacion">Elegir un plan</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
