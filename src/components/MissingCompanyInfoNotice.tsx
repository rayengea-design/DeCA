import { AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export function MissingCompanyInfoNotice() {
  return (
    <Card className="mx-auto max-w-lg border-amber-200 bg-amber-50">
      <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
        <AlertCircle className="h-8 w-8 text-amber-600" />
        <p className="font-semibold text-amber-900">Faltan los datos de tu empresa</p>
        <p className="text-sm text-amber-700">
          Necesitamos el NIF/CIF y el domicilio de tu empresa antes de poder generar un DeCA — aparecerán en el
          documento como tu parte del transporte.
        </p>
        <Button asChild>
          <Link to="/app/facturacion">Completar datos</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
