import { LegalLayout } from '@/components/layout/LegalLayout'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export function LegalNoticePage() {
  useDocumentMeta('Aviso Legal | DeCA', 'Aviso Legal de DeCA conforme a la LSSI-CE: identificación del prestador del servicio.')
  return (
    <LegalLayout title="Aviso Legal" updatedAt="23 de septiembre de 2026">
      <section>
        <h2>1. Datos identificativos</h2>
        <p>
          En cumplimiento del deber de información del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de
          la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que este sitio web
          (kreanex.es y el propio servicio DeCA) es titularidad de:
        </p>
        <ul>
          <li>
            <strong>Denominación social:</strong> Grupo Noveldi SL
          </li>
          <li>
            <strong>CIF:</strong> B04414645
          </li>
          <li>
            <strong>Domicilio social:</strong> Urbanización La Paloma 58, Venta Melilla, 30850 Totana (Murcia), España
          </li>
          <li>
            <strong>Correo electrónico de contacto:</strong>{' '}
            <a href="mailto:info@gruponoveldisl.es" className="font-medium text-brand-600 hover:underline">
              info@gruponoveldisl.es
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Objeto</h2>
        <p>
          Este Aviso Legal regula el acceso y uso general del sitio web. Las condiciones específicas de contratación y
          uso del servicio DeCA se recogen en los{' '}
          <a href="/terminos" className="font-medium text-brand-600 hover:underline">
            Términos de Servicio
          </a>
          , y el tratamiento de datos personales en la{' '}
          <a href="/privacidad" className="font-medium text-brand-600 hover:underline">
            Política de Privacidad
          </a>
          .
        </p>
      </section>

      <section>
        <h2>3. Propiedad intelectual e industrial</h2>
        <p>
          El nombre "DeCA", el diseño, los textos, el código y demás contenidos de este sitio y de la aplicación son
          propiedad de Grupo Noveldi SL o se usan con la debida autorización. Queda prohibida su reproducción,
          distribución o transformación sin autorización expresa, salvo en lo estrictamente necesario para el uso
          normal del servicio por parte del Cliente.
        </p>
      </section>

      <section>
        <h2>4. Enlaces a terceros</h2>
        <p>
          Este sitio puede enlazar a servicios de terceros (por ejemplo, WhatsApp o la pasarela de pago Stripe).
          Grupo Noveldi SL no se hace responsable del contenido o las prácticas de privacidad de esos sitios de
          terceros, ajenos a nuestro control.
        </p>
      </section>

      <section>
        <h2>5. Legislación aplicable</h2>
        <p>
          Este Aviso Legal se rige por la legislación española. Para cualquier controversia relacionada con el sitio
          web en sí (al margen de lo específicamente regulado en los Términos de Servicio), las partes se someten a
          los juzgados y tribunales de Murcia, salvo fuero imperativo distinto que resulte de aplicación.
        </p>
      </section>
    </LegalLayout>
  )
}
