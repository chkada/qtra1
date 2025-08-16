
import express from 'express';
import supabase from '../supabaseClient';
import { sendDevNotification } from '../services/notification.dev';
import { createProxySessionForBooking } from '../services/proxy.service';
import { addMinutes, addHours } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// POST /api/bookings
router.post('/', authenticate, async (req, res) => {
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
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .single();

    if (teacherError || !teacher || !teacher.subscription_active) {
      return res.status(404).json({ error: 'Teacher not found or not active' });
    }

    // Idempotency: if idempotencyKey provided and booking exists, return it
    if (idempotencyKey) {
      const { data: existing } = await supabase
        .from('bookings')
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .single();

      if (existing) {
        return res.status(200).json({ 
          bookingId: existing.id, 
          status: existing.status, 
          expiresAt: existing.expires_at 
        });
      }
    }

    // Check for double booking
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('requested_time_utc', requestedTimeUtc.toISOString())
      .single();

    if (existingBooking) {
      return res.status(409).json({ error: 'Time slot already booked' });
    }

    const expiresAt = addHours(now, 72);
    const bookingId = uuidv4();

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        id: bookingId,
        teacher_id: teacherId,
        student_name: studentName,
        student_phone: studentPhone,
        student_email: studentEmail || null,
        requested_time_utc: requestedTimeUtc.toISOString(),
        duration_minutes: durationMinutes,
        idempotency_key: idempotencyKey || null,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        created_at: now.toISOString()
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking create error', bookingError);
      return res.status(500).json({ error: 'Failed to create booking' });
    }

    // Create proxy session
    const proxySession = await createProxySessionForBooking(bookingId, expiresAt);

    // Create notification (dev adapter)
    const template = `Qindil — New booking request\nStudent: ${studentName}\nTime: ${requestedTime}\nProxy chat: https://localhost:4000/proxy/${proxySession.id}`;
    await sendDevNotification({ 
      bookingId, 
      to: teacher.id, 
      channel: 'whatsapp', 
      body: template, 
      payload: { proxySessionId: proxySession.id } 
    });

    return res.status(201).json({ 
      bookingId, 
      status: booking.status, 
      expiresAt: booking.expires_at, 
      proxySessionId: proxySession.id 
    });
  } catch (err: any) {
    console.error('Booking create error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
