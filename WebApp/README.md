# WebApp PowerPC

Pequeña Next.js app para controlar un JSON llamado `PowerPC.json`.

Scripts:

- npm run dev -> inicia en modo desarrollo

Endpoints:

- POST /api/setPowerTrue -> escribe `{ value: true }` en `data/PowerPC.json`
- GET /PowerPC -> rewrites a `/api/powerpc`, devuelve 200 si el value es true (y lo cambia a false), o 401 en caso contrario
