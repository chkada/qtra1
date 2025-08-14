
import prisma from '../prismaClient';
import { v4 as uuidv4 } from 'uuid';

export async function createProxySessionForBooking(bookingId: string, expiresAt: Date) {
  // generate a dev-mode proxy identifier (fake E.164-like)
  const rand = Math.floor(100000 + Math.random() * 900000);
  const proxyIdentifier = `proxy:+1000000${rand}`;
  const session = await prisma.proxySession.create({
    data: {
      bookingId,
      proxyIdentifier,
      expiresAt
    }
  });
  return session;
}
