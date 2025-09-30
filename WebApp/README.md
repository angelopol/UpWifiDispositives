# WebApp PowerPC

Pequeña Next.js app para controlar el estado de encendido de un dispositivo (almacenado en la base de datos SQL).

Scripts:

 
Scripts:

- npm run dev -> inicia en modo desarrollo

Endpoints:

Endpoints:

- POST /api/setPowerTrue -> establece el estado a true (protegido, requiere cookie JWT)
- GET /PowerPC -> rewrites a `/api/powerpc`, devuelve 200 si el value es true (y lo cambia a false), o 401 en caso contrario

Storage: the app uses a MySQL database (see `DB_HOST`, `DB_USER`, `DB_NAME` env vars). If no DB is configured the app falls back to an in-memory value for the running process only.

Vercel deployment
-----------------

If you import the repository into Vercel, it may not automatically detect that the Next.js app lives in the `WebApp/` subfolder. Two easy options:

1) Add a `vercel.json` at the repository root that points Vercel to `WebApp` (there's a `vercel.json` in the repo root already). Vercel will use `WebApp/package.json` and build the Next app inside that folder.

2) From the Vercel dashboard, create a new Project -> "Import Git Repository" -> under "Root Directory" set `WebApp` before connecting.

From the command line you can also deploy from the `WebApp` folder directly:

```powershell
cd WebApp; vercel --prod
```

Notes:
- The `sharp` package is present and requires platform-native binaries; if Vercel's build environment needs extra flags, check the Vercel docs for installing native modules or use the `@vercel/static-build` approach if you only need static output.
- Environment variables (like `AUTH_SECRET`) should be configured in the Vercel project settings (do not commit them to git).

```

Endpoints:

- POST /api/setPowerTrue -> escribe `{ value: true }` en `data/PowerPC.json`
- GET /PowerPC -> rewrites a `/api/powerpc`, devuelve 200 si el value es true (y lo cambia a false), o 401 en caso contrario
