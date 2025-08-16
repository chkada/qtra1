
import supabase from '../supabaseClient';

export async function sendDevNotification({ bookingId, to, channel, body, payload }: { bookingId?: string, to?: string, channel: string, body: string, payload?: any }) {
  // Persist notification record in Supabase
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      booking_id: bookingId || null,
      to: to || null,
      channel,
      body,
      payload: payload || {},
      status: 'sent',
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }

  console.log('[DEV NOTIF] channel=', channel, 'to=', to, 'body=', body);
  return data[0];
}
