
Qindil Phase 1 - Prisma schema, SQL migration, and seed files
============================================================

Files created under: /mnt/data/qindil_prisma_seed

Files:
- schema.prisma                 -> Prisma schema for models (teachers, bookings, proxy_sessions, messages, notifications)
- migrations/0001_init.sql      -> SQL migration file you can run against your Postgres DB
- seed/seed.json                -> JSON file with sample teachers & bookings (20 teachers, 10 bookings)
- seed/seed.js                  -> Node seed script (uses 'pg').

How to apply migration (simple steps):
1. Ensure you have Postgres running and DATABASE_URL set, e.g.:
   export DATABASE_URL=postgres://user:password@localhost:5432/qindil_dev

2. Run the SQL migration directly (psql):
   psql "$DATABASE_URL" -f "/mnt/data/qindil_prisma_seed/migrations/0001_init.sql"

   Or use Prisma migrate (if you use Prisma CLI):
   - Copy schema.prisma into your prisma folder and run:
     npx prisma migrate dev --name init

How to run the seed script:
1. Install dependencies:
   npm install pg

2. Ensure seed/seed.json is present in current directory (seed/seed.json)

3. Run the seed script from the seed directory:
   cd /mnt/data/qindil_prisma_seed/seed
   DATABASE_URL="$DATABASE_URL" node seed.js

Notes:
- The migration SQL creates tables and indices compatible with PostgreSQL.
- The seed script uses simple INSERT ... ON CONFLICT DO NOTHING to avoid duplication on re-run.
- For local development you can use Docker Compose to run Postgres + Redis (not included in this script).

