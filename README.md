# UpWifiDispositives

Repositorio con dos partes principales:

- `WebApp/` — Next.js + TypeScript webapp que expone endpoints para controlar un archivo `data/PowerPC.json` y una UI minimal con autenticación JWT.
- `PowerESP8266/` — código para el dispositivo (sketch de Arduino/ESP8266).

Este README resume cómo ejecutar, desarrollar y desplegar la parte web.

## Estructura principal

- `WebApp/` — aplicación Next.js (Pages router)
  - `pages/` — páginas y APIs (ej. `pages/api/setPowerTrue.ts`)
  - `public/` — assets estáticos (favicon.svg, favicon.png, icon-*.png, splash-*.png, screenshots)
  - `scripts/generate-icons.js` — script que genera iconos/splash/screenshots desde `public/favicon.png` o `public/favicon.svg`
- `PowerESP8266/` — firmware para el dispositivo (archivo `.ino`).

## Ejecutar en desarrollo (WebApp)

1. Entra en la carpeta WebApp:

```powershell
cd WebApp
npm install
npm run dev
```

2. Abre `http://localhost:3000`.

Endpoints principales:
- POST `/api/setPowerTrue` — protegido; establece el estado a true en la base de datos.
- GET `/PowerPC` — rewrites a `/api/powerpc`, devuelve 200 y cambia a false si el estado en la base de datos era true; devuelve 401 si no.
- GET `/api/PowerPCStatus` — devuelve el estado actual (leído desde la base de datos cuando esté disponible; cae a un valor en memoria si no hay DB configurada).

La app utiliza un sistema de autenticación JWT con cookie `upw_token`. Las credenciales y secretos están en `.env` (no subir al repo).

## Variables de entorno

Coloca un `.env` dentro de `WebApp/` con al menos:

```
user=tu_usuario
password=tu_contraseña
AUTH_SECRET=una_clave_segura_larga
NEXT_PUBLIC_VERSION=v1.0.0
```

Configura estos mismos valores en el panel de Vercel cuando despliegues.

## Generar iconos / PWA assets

El repo incluye `scripts/generate-icons.js`. Usa `sharp` para generar:

- `icon-192.png`, `icon-512.png`
- `splash-*.png` para varias resoluciones de arranque
- `screenshot-wide.png`, `screenshot-portrait.png`

Ejecutar desde la raíz del proyecto o desde `WebApp` (el script usa la carpeta `WebApp/public`):

```powershell
cd WebApp
npm run generate-icons
```

Nota: `sharp` necesita binarios nativos — en Vercel puede requerir pasos adicionales. Si la build de Vercel falla por `sharp`, considera generar los PNGs localmente y subirlos al repo o usar una acción CI que prepare los assets antes del deploy.

## PWA / iOS

- `public/manifest.json` contiene `icons`, `splash_screens` y `screenshots` usados para la experiencia de instalación más rica.
- Se añadió `pages/_document.tsx` para inyectar meta tags Apple startup images que apuntan a los `splash-*.png` generados.

## Despliegue en Vercel

Opciones para que Vercel detecte la app en la subcarpeta `WebApp`:

1. `vercel.json` en la raíz (ya incluido) apuntará el builder a `WebApp/package.json`.
2. En el dashboard de Vercel, durante la importación del repositorio, establece "Root Directory" = `WebApp`.
3. Desde la CLI puedes desplegar desde `WebApp` con:

```powershell
cd WebApp
vercel --prod
```

Recuerda configurar las variables de entorno en Vercel (AUTH_SECRET, user, password) y tener en cuenta `sharp` (ver nota arriba).

## Calidad y comprobaciones

- Si TypeScript advierte sobre `jsonwebtoken`, instala sus tipos dev:

```powershell
cd WebApp
npm install --save-dev @types/jsonwebtoken
```

- Para validar: `npx tsc --noEmit` dentro de `WebApp`.

## Problemas comunes

- Error al cargar `favicon.svg` en la auditoría: si prefieres evitar solicitudes a SVGs, elimina la entrada SVG en `public/manifest.json` y deja solo los PNGs.
- Builds en Vercel fallando por `sharp`: generar assets en CI o localmente y subir los PNGs al repo suele ser la forma más robusta.

---

Si quieres, puedo:
- generar versiones de iconos a mayor resolución (2048px) para downscale de alta calidad,
- incrustar la fuente Inter en `favicon.svg` para que el texto renderice exactamente igual en cualquier máquina,
- o preparar un pequeño GitHub Action que genere assets antes del push.
