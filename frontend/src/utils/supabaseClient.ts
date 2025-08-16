import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we have valid Supabase credentials (not placeholder values)
const isValidConfig =
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseKey.includes('placeholder') &&
  supabaseUrl !== 'https://placeholder.supabase.co';

if (!isValidConfig) {
  console.warn(
    'Using placeholder Supabase configuration. Please update .env.local with your actual Supabase credentials.'
  );
}

// Use placeholder values that won't cause createClient to fail
const finalUrl = isValidConfig
  ? supabaseUrl
  : 'https://placeholder.supabase.co';
const finalKey = isValidConfig
  ? supabaseKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI3MjAsImV4cCI6MTk2MDc2ODcyMH0.placeholder';

const supabase = createClient(finalUrl, finalKey);

export default supabase;
export { isValidConfig };
