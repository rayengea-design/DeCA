import { LegalLayout } from '@/components/layout/LegalLayout'

export function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidad" updatedAt="22 de septiembre de 2026">
      <section>
        <h2>1. Responsable del tratamiento</h2>
        <p>
          El responsable del tratamiento de los datos personales recogidos a través de DeCA es{' '}
          <strong>Grupo Noveldi SL</strong>, CIF <strong>B04414645</strong>, con domicilio en Urbanización La Paloma
          58, Venta Melilla, 30850 Totana (Murcia), España. Contacto:{' '}
          <a href="mailto:info@gruponoveldisl.es" className="font-medium text-brand-600 hover:underline">
            info@gruponoveldisl.es
          </a>
          .
        </p>
      </section>

      <section>
        <h2>2. Qué datos tratamos</h2>
        <ul>
          <li>
            <strong>Datos de cuenta</strong>: email y contraseña (gestionados por Firebase Authentication), nombre de
            la persona usuaria si se facilita.
          </li>
          <li>
            <strong>Datos de la empresa cliente</strong>: nombre, NIF/CIF y domicilio fiscal, usados para la
            facturación del servicio.
          </li>
          <li>
            <strong>Datos incluidos en cada DeCA generado</strong>: identificación de cargador y transportista,
            matrículas, mercancía, origen/destino y fecha del porte — datos que el propio Cliente introduce para
            cumplir con su obligación legal de documentación del transporte.
          </li>
          <li>
            <strong>Datos de pago</strong>: cuando exista una suscripción activa, los datos de la tarjeta o medio de
            pago los trata directamente nuestro proveedor de pagos (Stripe) como encargado del tratamiento; DeCA no
            almacena ni accede a esos datos.
          </li>
          <li>
            <strong>Datos técnicos básicos</strong>: los estrictamente necesarios para el funcionamiento de la sesión
            (autenticación) y para el funcionamiento de la aplicación como PWA instalable.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Con qué finalidad y base legal</h2>
        <ul>
          <li>
            Prestar el servicio contratado (generación de DeCA, gestión de equipo, historial) — base legal: ejecución
            del contrato (art. 6.1.b RGPD).
          </li>
          <li>
            Cumplir con la obligación legal de conservación de cada DeCA durante 1 año — base legal: cumplimiento de
            una obligación legal (art. 6.1.c RGPD), derivada de la normativa de transporte citada en estos
            documentos.
          </li>
          <li>
            Gestionar el cobro de la suscripción y emitir factura — base legal: ejecución del contrato y obligaciones
            fiscales.
          </li>
          <li>
            Comunicaciones de servicio (avisos sobre la cuenta, la prueba gratuita o la facturación) — base legal:
            interés legítimo en mantener informado al Cliente sobre su propio servicio.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Con quién compartimos los datos</h2>
        <p>
          Usamos terceros que actúan como encargados del tratamiento, bajo contrato y únicamente para prestar el
          servicio:
        </p>
        <ul>
          <li>
            <strong>Google Firebase / Google Cloud</strong> (autenticación, base de datos y almacenamiento de los
            PDF).
          </li>
          <li>
            <strong>Vercel</strong> (alojamiento de la aplicación web).
          </li>
          <li>
            <strong>Stripe</strong> (procesamiento de pagos y emisión de facturas), cuando exista una suscripción de
            pago.
          </li>
        </ul>
        <p>
          No vendemos ni cedemos datos personales a terceros con fines publicitarios. Algunos de estos proveedores
          pueden tratar datos fuera del Espacio Económico Europeo; en esos casos se apoyan en las garantías previstas
          por el RGPD (cláusulas contractuales tipo u otro mecanismo equivalente).
        </p>
      </section>

      <section>
        <h2>5. Cuánto tiempo conservamos los datos</h2>
        <p>
          Los datos de cada DeCA se conservan un mínimo de 1 año desde su emisión, por obligación legal. Los datos de
          la cuenta y de la empresa se conservan mientras la cuenta permanezca activa y, tras su baja, durante el
          plazo necesario para cumplir obligaciones legales (fiscales, contables) que nos sean de aplicación.
        </p>
      </section>

      <section>
        <h2>6. Tus derechos</h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y
          portabilidad escribiendo a{' '}
          <a href="mailto:info@gruponoveldisl.es" className="font-medium text-brand-600 hover:underline">
            info@gruponoveldisl.es
          </a>
          , indicando el derecho que deseas ejercer y adjuntando copia de un documento que acredite tu identidad. Si
          consideras que no hemos atendido correctamente tu solicitud, tienes derecho a reclamar ante la Agencia
          Española de Protección de Datos (www.aepd.es).
        </p>
      </section>

      <section>
        <h2>7. Seguridad</h2>
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger los datos (cifrado en tránsito,
          control de acceso por empresa mediante reglas de seguridad a nivel de base de datos, aislamiento de los
          datos de cada empresa cliente respecto a las demás).
        </p>
      </section>

      <section>
        <h2>8. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad para reflejar cambios en el servicio o en la normativa;
          la fecha de la última actualización aparece al principio de esta página.
        </p>
      </section>
    </LegalLayout>
  )
}
