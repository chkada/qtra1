const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read seed data
const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, '../prisma_seed/seed/seed.json'), 'utf8'));

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Seed teachers
    console.log('Seeding teachers...');
    for (const teacher of seedData.teachers) {
      const teacherId = uuidv4();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('teachers')
        .insert({
          id: teacherId,
          name: teacher.name,
          avatar: teacher.avatar,
          rating: teacher.rating || 0,
          hourly_rate: teacher.hourlyRate,
          subjects: teacher.subjects,
          languages: teacher.languages,
          education: teacher.education,
          experience: teacher.experience,
          bio: teacher.bio,
          availability: teacher.availability || {},
          location: teacher.location,
          subscription_active: true,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) {
        console.error(`Error seeding teacher ${teacher.name}:`, error);
      } else {
        console.log(`Teacher ${teacher.name} seeded with ID: ${data.id}`);
      }
    }

    // Seed bookings
    console.log('Seeding bookings...');
    const { data: teachers } = await supabase.from('teachers').select('id');
    
    if (!teachers || teachers.length === 0) {
      console.error('No teachers found to create bookings for');
      return;
    }

    for (const booking of seedData.bookings) {
      const bookingId = uuidv4();
      const teacherId = teachers[Math.floor(Math.random() * teachers.length)].id;
      const now = new Date();
      const requestedTime = new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time in next 7 days
      const expiresAt = new Date(requestedTime.getTime() + 72 * 60 * 60 * 1000); // 72 hours after requested time

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          id: bookingId,
          teacher_id: teacherId,
          student_name: booking.studentName,
          student_phone: booking.studentPhone,
          student_email: booking.studentEmail,
          requested_time_utc: requestedTime.toISOString(),
          duration_minutes: booking.durationMinutes || 60,
          status: 'pending',
          idempotency_key: uuidv4(),
          expires_at: expiresAt.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(`Error seeding booking for ${booking.studentName}:`, error);
      } else {
        console.log(`Booking for ${booking.studentName} seeded with ID: ${data.id}`);

        // Create proxy session for this booking
        const proxySessionId = uuidv4();
        const rand = Math.floor(100000 + Math.random() * 900000);
        const proxyIdentifier = `proxy:+1000000${rand}`;

        const { error: proxyError } = await supabase
          .from('proxy_sessions')
          .insert({
            id: proxySessionId,
            booking_id: bookingId,
            proxy_identifier: proxyIdentifier,
            expires_at: expiresAt.toISOString(),
            created_at: now.toISOString()
          });

        if (proxyError) {
          console.error(`Error creating proxy session for booking ${bookingId}:`, proxyError);
        } else {
          console.log(`Proxy session created for booking ${bookingId}`);
        }
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();