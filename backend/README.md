
# Qindil Backend Scaffold (dev-mode)

This scaffold includes a minimal Express + TypeScript backend with a POST /api/bookings endpoint,
dev-mode notification adapter, and proxy relay endpoints.

Prereqs: Node.js 20+, Postgres + Redis (use docker-compose.yml at project root).

Setup (local):
1. Copy your Prisma schema into backend/prisma/schema.prisma or point PRISMA_SCHEMA env.
2. Install deps:
   npm install
3. Generate Prisma client if using Prisma:
   npx prisma generate
4. Start (dev):
   npm run dev
5. Ensure DATABASE_URL env var points to Postgres (the docker-compose included binds Postgres to localhost:5432).

Endpoints:
- POST /api/bookings
- GET /api/proxy/:proxyId
- POST /api/proxy/:proxyId/messages
- GET /api/proxy/:proxyId/messages

Note: This scaffold assumes Prisma models exist. Use the SQL migration in the other package to create tables.
