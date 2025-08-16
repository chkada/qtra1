
import supabase from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function createProxySessionForBooking(bookingId: string, expiresAt: Date) {
  // generate a dev-mode proxy identifier (fake E.164-like)
  const rand = Math.floor(100000 + Math.random() * 900000);
  const proxyIdentifier = `proxy:+1000000${rand}`;
  
  const { data, error } = await supabase
    .from('proxy_sessions')
    .insert({
      id: uuidv4(),
      booking_id: bookingId,
      proxy_identifier: proxyIdentifier,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error('Error creating proxy session:', error);
    throw error;
  }

  return data[0];
}
