import supabase from '../supabaseClient';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRY = '24h';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  
  // Create a custom JWT token with user info
  const user: AuthUser = {
    id: data.user.id,
    email: data.user.email || '',
    role: 'user', // Default role, can be updated based on your user management
  };

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  
  return {
    user,
    token,
    supabaseToken: data.session.access_token,
  };
}

export async function signOut(token: string) {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
}

export async function verifyToken(token: string): Promise<AuthUser> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}