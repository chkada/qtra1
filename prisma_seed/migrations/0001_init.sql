
-- 0001_init.sql : initial schema for Qindil Phase 1 (Postgres)

CREATE TYPE booking_status AS ENUM ('PENDING','CONFIRMED','COMPLETED','EXPIRED','REJECTED','CANCELLED');

CREATE TABLE teachers (
  id TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  "displayName" TEXT NOT NULL,
  "photoUrl" TEXT,
  location TEXT,
  country TEXT DEFAULT 'Algeria',
  specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
  languages JSONB NOT NULL DEFAULT '[]'::jsonb,
  "hourlyRateCents" INTEGER NOT NULL DEFAULT 0,
  "modeOnline" BOOLEAN DEFAULT TRUE,
  "modeInPerson" BOOLEAN DEFAULT FALSE,
  "introText" TEXT,
  "introVideoUrl" TEXT,
  "subscriptionActive" BOOLEAN DEFAULT FALSE,
  "trialEndsAt" TIMESTAMPTZ,
  "subscriptionExpiresAt" TIMESTAMPTZ,
  "isVerified" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  "teacherId" TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  "studentName" TEXT NOT NULL,
  "studentPhone" TEXT NOT NULL,
  "studentEmail" TEXT,
  "requestedTimeUtc" TIMESTAMPTZ NOT NULL,
  "durationMinutes" INTEGER DEFAULT 60,
  status booking_status DEFAULT 'PENDING',
  "idempotencyKey" TEXT UNIQUE,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now(),
  "expiresAt" TIMESTAMPTZ NOT NULL
);

-- Prevent double-booking the same teacher for same timestamp
CREATE UNIQUE INDEX ux_bookings_teacher_time ON bookings ("teacherId", "requestedTimeUtc");

CREATE TABLE proxy_sessions (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  "proxyIdentifier" TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "expiresAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  "proxySessionId" TEXT NOT NULL REFERENCES proxy_sessions(id) ON DELETE CASCADE,
  "senderType" TEXT NOT NULL,
  "senderId" TEXT,
  body TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  delivered BOOLEAN DEFAULT FALSE
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  to TEXT,
  body TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "sentAt" TIMESTAMPTZ
);

-- basic indices
CREATE INDEX idx_teachers_specialties ON teachers USING gin (specialties jsonb_path_ops);
CREATE INDEX idx_teachers_languages ON teachers USING gin (languages jsonb_path_ops);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_proxy_expires ON proxy_sessions ("expiresAt");
CREATE INDEX idx_notifications_status ON notifications (status);
