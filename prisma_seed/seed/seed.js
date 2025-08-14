
/**
 * Seed script for Qindil Phase 1.
 * Usage:
 *   export DATABASE_URL=postgres://user:pass@localhost:5432/qindil_dev
 *   npm install pg
 *   node seed.js
 */

const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('Please set DATABASE_URL env var.');
    process.exit(1);
  }
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  const teachers = seed.teachers || [];
  const bookings = seed.bookings || [];

  try {
    console.log('Seeding teachers...');
    for (const t of teachers) {
      await client.query(
        `INSERT INTO teachers(id, "userId", "displayName", "photoUrl", location, country, specialties, languages, "hourlyRateCents", "modeOnline", "modeInPerson", "introText", "introVideoUrl", "subscriptionActive", "trialEndsAt", "subscriptionExpiresAt", "isVerified", "createdAt", "updatedAt")
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT (id) DO NOTHING`,
        [
          t.id, t.userId, t.displayName, t.photoUrl, t.location, t.country,
          JSON.stringify(t.specialties), JSON.stringify(t.languages), t.hourlyRateCents,
          t.modeOnline, t.modeInPerson, t.introText, t.introVideoUrl, t.subscriptionActive,
          t.trialEndsAt, t.subscriptionExpiresAt, t.isVerified, t.createdAt, t.createdAt
        ]
      );
    }

    console.log('Seeding bookings...');
    for (const b of bookings) {
      await client.query(
        `INSERT INTO bookings(id, "teacherId", "studentName", "studentPhone", "studentEmail", "requestedTimeUtc", "durationMinutes", status, "idempotencyKey", "createdAt", "updatedAt", "expiresAt")
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id) DO NOTHING`,
        [
          b.id, b.teacherId, b.studentName, b.studentPhone, b.studentEmail, b.requestedTimeUtc, b.durationMinutes, b.status, b.idempotencyKey, b.createdAt, b.updatedAt, b.expiresAt
        ]
      );
    }

    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed error', err);
  } finally {
    await client.end();
  }
}

main();
