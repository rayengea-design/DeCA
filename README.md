# DeCA

Herramienta para generar el **Documento electrónico de Control
Administrativo (DeCA)**, obligatorio desde el 5 de octubre de 2026 para transporte
nacional/cabotaje de mercancías (Orden FOM/2861/2012, Disposición Transitoria 8ª de la
Ley de Movilidad Sostenible, y Resolución de 5 de junio de 2026 de la DGTCF).

Genera un PDF nativo con los 6 datos obligatorios, incrusta un código QR con enlace de
descarga directa (HTTPS, sin login, tal y como exige la normativa), lo aloja en Firebase
Storage y guarda un histórico de un año en Firestore.

Es **multi-empresa**: no hay registro público — el administrador de la plataforma da de
alta a cada cliente desde Firebase, y en su primer login esa empresa configura sus propios
datos, quedando completamente aislada del resto (documentos, histórico). La marca (logo y
colores) es la misma para todos los clientes, los datos no se comparten.

## Stack

React 19 + TypeScript + Vite 7 + Tailwind CSS 3 + Firebase (Auth, Firestore, Storage) +
`pdf-lib` + `qrcode`.

## Puesta en marcha

Ver [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) para crear el proyecto de Firebase, las reglas
de seguridad y el primer usuario.

```bash
npm install
cp .env.example .env   # rellenar con las credenciales de Firebase
npm run dev            # http://localhost:3000
```

## Comandos

```bash
npm run dev         # servidor de desarrollo
npm run build       # type-check + build de producción
npm run lint        # oxlint
npm run preview     # sirve el build de producción
```

## Cómo funciona

1. **Alta de cliente**: el administrador crea el usuario (email/contraseña) desde Firebase
   Authentication. En su primer login, la app pide una vez el nombre de la empresa y crea su
   `companyId` propio en Firestore (`companies/{companyId}`) más un `users/{uid}` que apunta
   a él. Todo lo que esa empresa haga a partir de ahí vive bajo `companies/{companyId}/...` —
   las reglas de Firestore (`firestore.rules`) impiden que un usuario lea o escriba datos de
   una empresa distinta a la suya.
2. **Nuevo DeCA**: formulario con los campos exigidos por el art. 6 de la Orden
   FOM/2861/2012 (cargador contractual, transportista efectivo, origen/destino, mercancía,
   fecha, matrícula, autorización especial y observaciones). El nombre/NIF/domicilio de la
   propia empresa se rellenan aquí mismo, en cada DeCA — no hay un ajuste fijo guardado una
   sola vez, porque en la práctica varían según el porte (distinta razón social o domicilio
   según la carga).
3. Al enviar, se genera un `docId` único, se construye el PDF (con QR incrustado apuntando a
   su propia URL pública) y se sube a Firebase Storage en `deca/{companyId}/{docId}.pdf` — la
   URL es pública y determinista, sin token ni login, cumpliendo el requisito de descarga
   directa en carretera.
4. El registro (todos los campos + URL) se guarda en Firestore
   (`companies/{companyId}/decaDocs`) para el histórico de 1 año exigido por normativa.
5. **Historial** lista y permite buscar (por matrícula y fecha), descargar, ocultar y
   recuperar los DeCA generados por esa empresa — ocultar es solo una vista, nunca borra el
   documento ni su PDF.
6. **Corregir DeCA** (apartado Quinto de la Resolución): si hay que cambiar un dato ya emitido
   (matrícula, mercancía, etc.), el botón de lápiz genera un DeCA nuevo con los datos
   corregidos y un motivo obligatorio, enlazado al original (`supersedes`/`supersededBy`). El
   original se marca `superseded` — nunca se edita ni se borra — y su PDF (misma URL/QR) se
   sobrescribe con un aviso "Este documento ya no es válido" que enlaza al nuevo, para que
   nadie que escanee un QR impreso antiguo se quede con datos obsoletos. Si cambia la
   matrícula, se anota automáticamente en el campo `g) Matrícula` del nuevo PDF ("cambio de
   vehículo"), tal y como exige el art. 6.g de la Orden FOM/2861/2012.
7. **Equipo** (solo para el administrador de la empresa): crea cuentas de conductores desde
   la propia app (sin backend — usa una segunda instancia de Firebase App solo para el alta,
   así el admin nunca pierde su propia sesión al crear la del conductor). Un conductor solo
   ve en el Historial los DeCA que él mismo ha generado; el administrador los ve todos, con
   una columna extra indicando quién los creó. Ambas cosas están reforzadas en
   `firestore.rules`, no solo ocultas en la interfaz.

## Por qué no hay un botón de "eliminar"

La Resolución de 5 de junio de 2026 exige conservar cada DeCA **al menos 1 año**. Si se
pudiera borrar antes de ese plazo y luego se requiere en una inspección, la empresa se
expone a la misma sanción que si nunca lo hubiera generado (401-2.000€, hasta 20.000€ si
hay indicios de manipulación). Por eso:

- `firestore.rules` bloquea el borrado de `decaDocs` a nivel de base de datos
  (`allow delete: if false`) — no depende de que la interfaz no lo ofrezca.
- La única acción disponible es **ocultar** (`hidden: true`), que solo cambia qué se muestra
  en el listado — el registro y el PDF siguen intactos y recuperables en cualquier momento.

Pasado el año de conservación obligatoria, sí tendría sentido añadir una purga/borrado real
de documentos antiguos, pero eso no está implementado todavía.
