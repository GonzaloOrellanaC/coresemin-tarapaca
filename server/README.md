# coresemin-server

Simple Node.js + TypeScript server for Coresemin — provides API for news/ publicaciones, JWT auth, MongoDB and Socket.IO.

Quick start:

1. cd server
2. npm install
3. set environment variables `MONGO_URI` and `JWT_SECRET` (or use defaults)
4. npm run dev

API endpoints:
- `GET /api/news` — list
- `GET /api/news/:slug` — get by slug
- `POST /api/news` — create (requires `Authorization: Bearer <token>`)

Socket.IO: server emits `newsCreated` when a new news item is created.
