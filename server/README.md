# coresemin-server

Node.js + TypeScript server for Coresemin — provides API for news/publicaciones, JWT auth, **MongoDB (Mongoose)** and Socket.IO.

## Requisitos

- Node.js 18+
- MongoDB: se usa Mongoose contra `MONGO_URI`. Para desarrollo local:
  `mongodb://localhost:27017/coresemin` (default en `src/config.ts`).
  En producción se usa un cluster MongoDB Atlas (ver `.env`).

## Quick start

1. `npm install`
2. Configura las variables de entorno `MONGO_URI`, `JWT_SECRET`, `ADMIN_USER` y `ADMIN_PASS` en `.env` (o usa los defaults).
3. `npm run dev`  (o `npm run build && npm start`)

El servidor conecta a MongoDB al arrancar (ver `src/db/connection.ts`) y sirve
los endpoints usando el modelo `src/models/News.ts`.

## API endpoints

- `GET /api/news` — list
- `GET /api/news/:slug` — get by slug
- `POST /api/news` — create (requiere `Authorization: Bearer <token>`)
- `PUT /api/news/:id` — update (requiere token)
- `DELETE /api/news/:id` — delete (requiere token)

Socket.IO: el servidor emite `newsCreated` / `newsUpdated` / `newsDeleted`.

## Migración de datos (db.json → MongoDB)

Históricamente la app usaba `db.json` (lowdb). Para migrar los datos existentes
a MongoDB, desde la raíz del proyecto:

```bash
node scripts/migrate-dbjson-to-mongo.cjs
```

El script lee `MONGO_URI` del `.env` y hace *upsert* por `slug` (es idempotente,
no duplica noticias). Requiere acceso de red al cluster desde donde se ejecuta.

