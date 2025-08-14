
import prisma from '../prismaClient';

export async function sendDevNotification({ bookingId, to, channel, body, payload }: { bookingId?: string, to?: string, channel: string, body: string, payload?: any }) {
  // Persist notification record and log to console
  const notif = await prisma.notification.create({
    data: {
      bookingId: bookingId || null,
      to: to || null,
      channel,
      body,
      payload: payload || {},
      status: 'sent'
    }
  });
  console.log('[DEV NOTIF] channel=', channel, 'to=', to, 'body=', body);
  return notif;
}
