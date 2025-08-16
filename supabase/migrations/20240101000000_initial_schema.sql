-- Create tables for Supabase

-- Teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  hourly_rate NUMERIC(10,2) NOT NULL,
  subjects TEXT[] NOT NULL,
  languages TEXT[] NOT NULL,
  education TEXT,
  experience TEXT,
  bio TEXT NOT NULL,
  availability JSONB DEFAULT '{}'::jsonb,
  location TEXT,
  subscription_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id),
  student_name TEXT NOT NULL,
  student_phone TEXT NOT NULL,
  student_email TEXT,
  requested_time_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'pending',
  idempotency_key TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, requested_time_utc)
);

-- Proxy sessions table
CREATE TABLE IF NOT EXISTS public.proxy_sessions (
  id UUID PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  proxy_identifier TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY,
  proxy_session_id UUID NOT NULL REFERENCES public.proxy_sessions(id),
  sender_type TEXT NOT NULL,
  sender_id TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id),
  to TEXT,
  channel TEXT NOT NULL,
  body TEXT NOT NULL,
  payload JSONB,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  teacher_id UUID REFERENCES public.teachers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies

-- Enable Row Level Security
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Teachers policies
CREATE POLICY "Teachers are viewable by everyone" 
  ON public.teachers FOR SELECT 
  USING (true);

CREATE POLICY "Teachers can be created by admins" 
  ON public.teachers FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Teachers can be updated by admins or the teacher themselves" 
  ON public.teachers FOR UPDATE 
  TO authenticated 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() ->> 'role' = 'teacher' AND id::text = (auth.jwt() ->> 'teacher_id'))
  );

CREATE POLICY "Teachers can be deleted by admins" 
  ON public.teachers FOR DELETE 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Bookings policies
CREATE POLICY "Bookings are viewable by authenticated users" 
  ON public.bookings FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Bookings can be created by authenticated users" 
  ON public.bookings FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Bookings can be updated by admins or the teacher assigned" 
  ON public.bookings FOR UPDATE 
  TO authenticated 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() ->> 'role' = 'teacher' AND teacher_id::text = (auth.jwt() ->> 'teacher_id'))
  );

-- Proxy sessions policies
CREATE POLICY "Proxy sessions are viewable by authenticated users" 
  ON public.proxy_sessions FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Proxy sessions can be created by authenticated users" 
  ON public.proxy_sessions FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Messages policies
CREATE POLICY "Messages are viewable by authenticated users" 
  ON public.messages FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Messages can be created by authenticated users" 
  ON public.messages FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Notifications are viewable by admins and the recipient" 
  ON public.notifications FOR SELECT 
  TO authenticated 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    to = auth.uid()::text OR
    (auth.jwt() ->> 'role' = 'teacher' AND booking_id IN (
      SELECT id FROM public.bookings WHERE teacher_id::text = (auth.jwt() ->> 'teacher_id')
    ))
  );

CREATE POLICY "Notifications can be created by authenticated users" 
  ON public.notifications FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Users policies
CREATE POLICY "Users can view their own user data" 
  ON public.users FOR SELECT 
  TO authenticated 
  USING (id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update their own data" 
  ON public.users FOR UPDATE 
  TO authenticated 
  USING (id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');