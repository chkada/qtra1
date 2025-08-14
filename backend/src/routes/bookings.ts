
import express from 'express';
import prisma from '../prismaClient';
import { sendDevNotification } from '../services/notification.dev';
import { createProxySessionForBooking } from '../services/proxy.service';
import { addMinutes, addHours } from 'date-fns';

const router = express.Router();

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const {
      teacherId,
      studentName,
      studentPhone,
      studentEmail,
      requestedTime,
      durationMinutes = 60,
      idempotencyKey
    } = req.body;

    if (!teacherId || !studentName || !studentPhone || !requestedTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const requestedTimeUtc = new Date(requestedTime);
    const now = new Date();

    // Minimum lead time 30 minutes
    if (requestedTimeUtc.getTime() < now.getTime() + 30 * 60 * 1000) {
      return res.status(400).json({ error: 'requestedTime must be at least 30 minutes in the future' });
    }

    // Check teacher exists and active
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher || !teacher.subscriptionActive) {
      return res.status(404).json({ error: 'Teacher not found or not active' });
    }

    // Idempotency: if idempotencyKey provided and booking exists, return it
    if (idempotencyKey) {
      const existing = await prisma.booking.findUnique({ where: { idempotencyKey } });
      if (existing) {
        return res.status(200).json({ bookingId: existing.id, status: existing.status, expiresAt: existing.expiresAt });
      }
    }

    // Prevent double-booking via unique index on teacherId+requestedTimeUtc (DB will enforce)
    const expiresAt = addHours(now, 72);

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        teacherId,
        studentName,
        studentPhone,
        studentEmail: studentEmail || null,
        requestedTimeUtc,
        durationMinutes,
        idempotencyKey: idempotencyKey || null,
        expiresAt
      }
    });

    // Create proxy session
    const proxySession = await createProxySessionForBooking(booking.id, expiresAt);

    // Create notification (dev adapter)
    const template = `Qindil — New booking request\nStudent: ${studentName}\nTime: ${requestedTime}\nProxy chat: https://localhost:4000/proxy/${proxySession.id}`;
    await sendDevNotification({ bookingId: booking.id, to: teacher.id, channel: 'whatsapp', body: template, payload: { proxySessionId: proxySession.id } });

    return res.status(201).json({ bookingId: booking.id, status: booking.status, expiresAt: booking.expiresAt, proxySessionId: proxySession.id });
  } catch (err: any) {
    console.error('Booking create error', err);
    // Handle unique constraint violation for double-booking
    if (err.code === 'P2002' || err.code === '23505') {
      return res.status(409).json({ error: 'Time slot already booked' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
