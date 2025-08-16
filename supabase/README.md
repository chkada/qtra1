# Supabase Setup Guide

## Overview

This project uses Supabase as the backend solution for:
- Data storage (PostgreSQL database)
- Authentication and authorization
- Real-time functionality

## Setup Instructions

### 1. Create a Supabase Project

1. Sign up or log in at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys (anon key and service role key)

### 2. Configure Environment Variables

Create `.env` files in both the backend and frontend directories using the provided `.env.example` templates:

```bash
# Backend .env file
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Frontend .env file
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Apply Database Migrations

You can apply the database migrations in two ways:

#### Option 1: Using the Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/migrations/20240101000000_initial_schema.sql`
4. Paste and run the SQL in the editor

#### Option 2: Using the Supabase CLI

1. Install the Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref your_project_ref`
4. Apply migrations: `supabase db push`

### 4. Seed the Database

Run the seed script to populate the database with initial data:

```bash
cd supabase
npm install
node seed.js
```

## Database Schema

The database includes the following tables:

- `teachers`: Teacher profiles
- `bookings`: Booking requests
- `proxy_sessions`: Proxy communication sessions
- `messages`: Messages within proxy sessions
- `notifications`: System notifications
- `users`: User accounts (linked to Supabase Auth)

## Security

Row Level Security (RLS) policies are implemented for all tables to ensure proper access control:

- Public data (like teacher profiles) is readable by everyone
- Protected data requires authentication
- Role-based access control for admin operations
- Teachers can only access their own data and related bookings

## Authentication

The system uses Supabase Auth with JWT tokens for authentication. The backend validates these tokens and implements additional authorization middleware for role-based access control.

## Real-time Functionality

Supabase's real-time capabilities can be used for features like:

- Live chat in proxy sessions
- Instant booking notifications
- Real-time status updates

To enable real-time subscriptions, use the Supabase client's `.subscribe()` method in your frontend components.