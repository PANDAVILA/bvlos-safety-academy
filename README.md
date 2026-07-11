# BVLOS Safety Academy

Plataforma web completa para BVLOS Safety Academy: LMS de cursos, noticias, informes técnicos,
tienda de recursos digitales (ebooks/plantillas), consultoría con captación de leads, y un
espacio de acceso a la app **AeroSafety Case**.

## Stack técnico

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Drizzle ORM** + **SQLite** (better-sqlite3) — fácilmente migrable a Postgres/MySQL en producción
- **NextAuth.js** (credenciales, JWT) para registro/login de alumnos
- **Stripe** y **PayPal** para pago de cursos y productos digitales
- Diseño con la paleta de marca (navy/dorado) y motivo de "carta aeronáutica"

## Primeros pasos

```bash
npm install
cp .env.local.example .env.local   # ya viene copiado y con NEXTAUTH_SECRET generado
npx drizzle-kit push               # crea las tablas en data/bvlos.db
npx tsx scripts/seed.ts            # carga cursos, noticias, informes y productos de ejemplo
npm run dev
```

Abre http://localhost:3000

## Configurar los pagos

### Stripe
1. Crea una cuenta en https://dashboard.stripe.com
2. Copia tu clave secreta de prueba (`sk_test_...`) en `STRIPE_SECRET_KEY`
3. Para los webhooks en local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   y copia el `whsec_...` que te da en `STRIPE_WEBHOOK_SECRET`
4. Sin esta configuración, el botón de Stripe mostrará un aviso de que falta configurar la clave
   (no rompe el resto de la web).

### PayPal
1. Crea una app en https://developer.paypal.com/dashboard/applications
2. Copia el **Client ID** en `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (visible en el navegador, es público)
   y también en `PAYPAL_CLIENT_ID`
3. Copia el **Secret** en `PAYPAL_CLIENT_SECRET`
4. Deja `PAYPAL_ENV=sandbox` para pruebas; cámbialo a `live` cuando pases a producción

### Cómo funciona el checkout
- Al pagar, se crea un registro en la tabla `orders` con estado `pending`
- Stripe confirma el pago vía webhook (`/api/webhooks/stripe`) → estado `paid` + inscripción automática al curso
- PayPal confirma el pago al capturar la orden (`/api/checkout/paypal/capture`) → mismo efecto
- Los cursos gratuitos se inscriben al instante sin pasar por pasarela

## Conectar la app AeroSafety Case

En `/aerosafety-case` hay un botón "Probar la app" que enlaza a la variable de entorno
`NEXT_PUBLIC_AEROSAFETY_CASE_URL`. Actualiza esa variable con la URL donde tengas desplegada
tu aplicación AeroSafety Case (por ejemplo, tu proyecto de Vercel).

## Estructura de contenido

- **Cursos**: `lib/db/schema.ts` → tablas `courses`, `modules`, `lessons`. Edítalos directamente
  en `scripts/seed.ts` o crea un panel de administración más adelante.
- **Noticias/Informes**: tabla `articles`, campo `type` (`news` | `report`)
- **Tienda**: tabla `products`
- Todas las imágenes de marca están en `public/brand/`

## Producción

- Cambia el proveedor de base de datos a Postgres para despliegues serios (Drizzle lo soporta
  cambiando el dialecto y el cliente; el esquema se mantiene casi igual).
- Despliega en Vercel, Render o cualquier host compatible con Next.js.
- Asegúrate de configurar `NEXTAUTH_URL` con tu dominio real y las claves de Stripe/PayPal en modo
  `live`.

## Cuentas de prueba

No hay usuarios precargados: crea una cuenta desde `/registro`.
