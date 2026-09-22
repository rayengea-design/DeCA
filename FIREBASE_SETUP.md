# Configuración de Firebase — DeCA

Esta app es **multi-empresa (multi-tenant)**: cada empresa cliente tiene sus datos
completamente aislados (documentos, histórico). No existe registro
público — **tú (el administrador de la plataforma) das de alta a cada cliente manualmente**
desde la consola de Firebase, y ellos entran con esas credenciales.

## 1. Crear el proyecto

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto nuevo (ej. `mi-deca`).
2. En **Authentication** → **Sign-in method**, activa **Email/contraseña**.
3. Activa **Firestore Database** (modo producción, región `eur3` o la más cercana).
4. Activa **Storage**.

## 2. Variables de entorno

En **Configuración del proyecto** → **General** → **Tus apps**, crea una app web y copia las credenciales a un archivo `.env` (copia `.env.example`):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3. Reglas de seguridad

Este repo incluye `firestore.rules` y `storage.rules`. Despliégalas con la Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes,storage
```

(Nota: es `storage`, no `storage:rules` — la CLI de Firebase interpreta mal ese sufijo.)

**Importante sobre `firestore:indexes`:** el Historial de un conductor necesita un índice
compuesto (`createdBy` + `createdAt`) para funcionar — sin desplegar `firestore.indexes.json`,
la app de cualquier conductor mostrará su historial vacío con un error de "índice necesario"
en la consola. Tras desplegarlo, el índice tarda uno o dos minutos en construirse (puedes
comprobar el estado en **Firestore Database** → **Índices** en la consola de Firebase).

**Importante sobre `storage.rules`:** los PDF del DeCA se guardan bajo `deca/{companyId}/` con **lectura pública** y sin login. Esto es un requisito legal de la Resolución de 5 de junio de 2026 (el QR debe llevar a una descarga directa, sin autenticación ni botones). No lo cambies a lectura privada o los DeCA dejarán de ser válidos ante una inspección en carretera.

## 4. Dar de alta a un cliente nuevo

1. En **Authentication** → **Users** → **Añadir usuario**, crea el email y contraseña que le
   darás a esa empresa. Cópiaselos por el canal que prefieras.
2. Esa empresa entra en `/login` con esas credenciales. Al ser su primer acceso, la app le
   pedirá una sola vez los datos de su empresa (nombre, NIF, domicilio) — con eso crea su
   propio espacio aislado (`companyId`) automáticamente. A partir de ahí ya ve su propia
   página, con su propio histórico, sin ver nada de otras empresas.
3. Repite el proceso por cada cliente nuevo.

No hay manera de que alguien cree su propia cuenta sin que tú generes antes sus
credenciales — es intencional, para controlar quién puede entrar.

## 5. Administrador de empresa y conductores

La primera persona que hace el `/configurar-empresa` de una empresa queda como
**administrador** de esa empresa (`role: 'admin'`). Desde su cuenta ve dos secciones extra en
el menú que un conductor normal no ve:

- **Equipo**: crea cuentas de conductores directamente desde la app (nombre, email,
  contraseña — se las pasa él mismo, no hay envío de invitación por correo). Esto NO requiere
  entrar en la consola de Firebase — es él mismo, ya logueado como admin, quien lo hace.
- **Ajustes**: datos fiscales de la empresa.

Diferencia de lo que ve cada uno en **Historial**:

- **Administrador**: ve todos los DeCA que ha generado cualquiera de su empresa, con una
  columna "Creado por".
- **Conductor**: solo ve los DeCA que él mismo ha generado.

Esto está reforzado en `firestore.rules` (no solo en la interfaz) — un conductor no puede
leer los DeCA de otro conductor ni aunque manipule las peticiones a mano.

Para desactivar a un conductor, el propio administrador puede hacerlo desde **Equipo** (botón
"Desactivar") — usa el mismo mecanismo de corte de acceso inmediato explicado en el punto
siguiente, sin tocar la consola de Firebase.

## 6. Revocar el acceso a un administrador (vía consola de Firebase)

Para un conductor, usa el botón "Desactivar" de **Equipo** (punto anterior). Para revocar a
un **administrador** de empresa (no hay nadie por encima de él dentro de la app que pueda
hacerlo desde la interfaz), hazlo manualmente desde la consola:

**Borrar o deshabilitar la cuenta solo en Authentication NO cierra su sesión ya abierta.**
Si ya tenía la app abierta en su navegador, ese token sigue siendo técnicamente válido hasta
una hora — Firebase no lo revoca en tiempo real por sí solo. Para un corte de acceso
inmediato (en segundos, en cualquier pestaña que tenga abierta):

1. Ve a **Firestore Database** → colección `users` → el documento con su `uid`.
2. Añade el campo `disabled` con valor `true` (tipo booleano).
3. Guarda. Su sesión se cierra sola en cuestión de segundos, y aunque conserve el
   `email`/contraseña, la app no le dejará ni leer ni escribir nada aunque insista.

Hazlo **además** de deshabilitar/borrar su cuenta en Authentication (para que tampoco pueda
volver a iniciar sesión con esas credenciales) — las dos cosas juntas son el corte completo.

Para devolverle el acceso más adelante, basta con borrar ese campo `disabled` (o ponerlo a
`false`) y reactivar su cuenta en Authentication si la habías deshabilitado allí también.

## 7. Primer uso

1. `npm install && npm run dev`
2. Date de alta a ti mismo siguiendo el paso 4 (crea tu usuario en Authentication, entra en
   `/login`, rellena tus propios datos cuando te lo pida) — quedas como administrador.
3. Ve a **Nuevo DeCA** y genera el primer documento de prueba.
4. Si tienes conductores, ve a **Equipo** y dales de alta.

## 8. Despliegue en tu propio dominio

Se construye como sitio estático (`npm run build` → carpeta `dist/`) y se puede desplegar en:

- **Firebase Hosting** (recomendado, mismo proyecto que Auth/Firestore/Storage): `firebase init hosting` → `firebase deploy --only hosting`, y luego conectar tu dominio desde **Hosting** → **Añadir dominio personalizado** (Firebase te dará los registros DNS que hay que añadir en el proveedor del dominio).
- **Vercel** o **Netlify**: importar el repo, configurar las variables `VITE_FIREBASE_*` como variables de entorno del proyecto, y apuntar tu dominio ahí.

En cualquier caso, añade tu dominio a **Authentication** → **Settings** → **Authorized domains** en Firebase, o el login fallará una vez esté en ese dominio.
