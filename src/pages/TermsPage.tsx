import { LegalLayout } from '@/components/layout/LegalLayout'

export function TermsPage() {
  return (
    <LegalLayout title="Términos de Servicio" updatedAt="22 de septiembre de 2026">
      <section>
        <h2>1. Quiénes somos</h2>
        <p>
          DeCA es un servicio operado por <strong>Grupo Noveldi SL</strong>, con CIF <strong>B04414645</strong> y
          domicilio en Urbanización La Paloma 58, Venta Melilla, 30850 Totana (Murcia), España (en adelante, "DeCA",
          "nosotros"). Estos Términos de Servicio regulan el acceso y uso de la aplicación DeCA por parte de cualquier
          empresa o profesional que cree una cuenta (en adelante, el "Cliente" o "tú").
        </p>
      </section>

      <section>
        <h2>2. Objeto del servicio</h2>
        <p>
          DeCA permite generar, corregir y conservar el Documento electrónico de Control Administrativo (DeCA)
          exigido por la Orden FOM/2861/2012 y la Resolución de 5 de junio de 2026 de la DGTCF para el transporte
          nacional de mercancías por carretera, así como gestionar el acceso de los conductores de tu empresa a esa
          herramienta.
        </p>
        <p>
          DeCA es una herramienta de generación documental. La exactitud de los datos introducidos en cada DeCA
          (cargador, transportista, mercancía, matrículas, etc.) es responsabilidad exclusiva del Cliente y de la
          persona que rellena el formulario en cada caso; DeCA no verifica ni puede verificar la veracidad de esos
          datos frente a terceros ni frente a la Administración.
        </p>
      </section>

      <section>
        <h2>3. Cuenta, alta y periodo de prueba</h2>
        <p>
          El alta se realiza dando de alta la empresa del Cliente y, sobre ella, una o varias cuentas de usuario
          (administrador y conductores). Toda nueva cuenta de empresa dispone de un periodo de prueba gratuito
          limitado a <strong>10 documentos DeCA generados o 5 días naturales desde el alta, lo que ocurra primero</strong>.
          Transcurrido el periodo de prueba, la generación de nuevos documentos requiere una suscripción de pago
          activa; los documentos ya generados durante la prueba permanecen accesibles y descargables sin coste,
          conforme a la obligación legal de conservación de 1 año.
        </p>
        <p>
          El Cliente es responsable de mantener la confidencialidad de las credenciales de sus cuentas y de las que
          cree para sus conductores, así como de toda actividad realizada desde ellas.
        </p>
      </section>

      <section>
        <h2>4. Precio, facturación y cancelación</h2>
        <p>
          Los planes de pago disponibles y sus precios se muestran en la página de precios de DeCA. La contratación,
          renovación y cobro de las suscripciones se gestiona a través de nuestro proveedor de pagos (Stripe), que
          actúa como encargado del tratamiento de los datos de pago; DeCA no almacena datos de tarjeta en sus propios
          sistemas. Las facturas correspondientes a cada cobro se emiten y envían automáticamente a la dirección de
          email de la cuenta.
        </p>
        <p>
          El Cliente puede cancelar su suscripción en cualquier momento desde su panel de facturación, sin
          permanencia. La cancelación surte efecto al final del periodo ya pagado; no se realizan devoluciones
          proporcionales por el tiempo no consumido salvo que la ley aplicable disponga otra cosa.
        </p>
      </section>

      <section>
        <h2>5. Uso aceptable</h2>
        <p>
          El Cliente se compromete a usar DeCA conforme a la normativa de transporte aplicable y a no utilizar el
          servicio para generar documentos con datos falsos, ni para fines distintos de la gestión documental del
          transporte de su propia empresa.
        </p>
      </section>

      <section>
        <h2>6. Conservación y disponibilidad de los documentos</h2>
        <p>
          Los DeCA generados se conservan durante el plazo mínimo legal de 1 año desde su emisión. DeCA pone medios
          razonables para garantizar la disponibilidad del servicio, pero no garantiza un funcionamiento
          ininterrumpido; en caso de incidencia que afecte a la descarga de un documento, el Cliente puede solicitar
          soporte a través del contacto indicado en el punto 8.
        </p>
      </section>

      <section>
        <h2>7. Limitación de responsabilidad</h2>
        <p>
          DeCA se presta "tal cual". En la medida permitida por la ley, Grupo Noveldi SL no será responsable de
          sanciones administrativas, pérdidas económicas o daños derivados de datos incorrectos introducidos por el
          Cliente en un DeCA, de un uso del servicio contrario a estos Términos, o de causas de fuerza mayor ajenas a
          nuestro control razonable.
        </p>
      </section>

      <section>
        <h2>8. Modificaciones y contacto</h2>
        <p>
          Podemos actualizar estos Términos para reflejar cambios en el servicio o en la normativa aplicable;
          notificaremos cambios relevantes con antelación razonable. Para cualquier consulta sobre estos Términos,
          puedes escribirnos a{' '}
          <a href="mailto:info@gruponoveldisl.es" className="font-medium text-brand-600 hover:underline">
            info@gruponoveldisl.es
          </a>
          .
        </p>
      </section>

      <section>
        <h2>9. Ley aplicable y jurisdicción</h2>
        <p>
          Estos Términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a
          los juzgados y tribunales de Murcia, salvo que la normativa de protección de consumidores disponga un fuero
          distinto de carácter imperativo.
        </p>
      </section>
    </LegalLayout>
  )
}
