import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/UI/Navbar';
import { useAuth } from '../../src/contexts/AuthContext';
import supabase, { isValidConfig } from '../../src/utils/supabaseClient';
import mockTeachers from '../../src/data/mockTeachers';
import { motion } from 'framer-motion';
import { Star, MapPin, BookOpen, Clock, Calendar, ChevronLeft } from 'lucide-react';

type Teacher = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  hourly_rate: number;
  subjects: string[];
  languages: string[];
  education: string;
  experience: string;
  bio: string;
  availability: Record<string, string[]>;
  location: string;
};

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export default function TeacherDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    async function fetchTeacher() {
      try {
        setLoading(true);

        if (!isValidConfig) {
          // Use mock data when Supabase is not configured
          console.warn('Using mock teacher data - Supabase not configured');
          const mockTeacher = mockTeachers.find((t) => t.id === id);
          if (mockTeacher) {
            setTeacher(mockTeacher);
          } else {
            setError('Teacher not found');
          }
          return;
        }

        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setTeacher(data);
      } catch (err: any) {
        console.error('Error fetching teacher:', err);
        // Fallback to mock data on error
        console.warn('Falling back to mock teacher data');
        const mockTeacher = mockTeachers.find((t) => t.id === id);
        if (mockTeacher) {
          setTeacher(mockTeacher);
        } else {
          setError(err.message || 'Failed to load teacher details');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTeacher();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      router.push('/login?redirect=' + router.asPath);
      return;
    }

    if (!selectedDate || !selectedTime || !teacher) {
      setBookingError('Please select a date and time');
      return;
    }

    setBookingError(null);

    try {
      if (!isValidConfig) {
        // Mock booking success when Supabase is not configured
        console.warn('Mock booking created - Supabase not configured');
        setBookingSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }

      // Calculate start and end time (assuming 1-hour sessions)
      const startTime = new Date(`${selectedDate}T${selectedTime}`);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour

      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            teacher_id: teacher.id,
            user_id: user.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: 'pending',
            hourly_rate: teacher.hourly_rate,
          },
        ])
        .select();

      if (error) throw error;

      setBookingSuccess(true);
      setTimeout(() => {
        router.push('/bookings');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setBookingError(err.message || 'Failed to create booking');
    }
  };

  // Generate available dates (next 14 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      dates.push(dateString);
    }

    return dates;
  };

  // Generate available times based on teacher's availability and selected date
  const getAvailableTimes = () => {
    if (!teacher || !selectedDate) return [];

    const dayOfWeek = new Date(selectedDate)
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    // Get availability for the selected day from teacher's availability
    const availableTimesForDay = teacher.availability?.[dayOfWeek] || [];

    return availableTimesForDay;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-aguirre-light-gray">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-aguirre-blue"></div>
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-aguirre-light-gray">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-red-500 text-center bg-red-100 p-4 rounded-lg">
            {error || 'Teacher not found'}
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/teachers')}
              className="px-4 py-2 bg-aguirre-blue text-white rounded-lg hover:bg-aguirre-dark-blue transition-colors flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back to Teachers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aguirre-light-gray">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants} className="mb-6">
            <button
              onClick={() => router.push('/teachers')}
              className="text-aguirre-blue hover:text-aguirre-dark-blue font-medium transition-colors flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to all teachers
            </button>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Teacher Header */}
            <motion.div
              variants={itemVariants}
              className="p-8 border-b border-gray-200"
            >
              <div className="flex flex-col sm:flex-row items-start">
                <img
                  src={teacher.avatar || 'https://via.placeholder.com/150'}
                  alt={teacher.name}
                  className="h-32 w-32 rounded-full border-4 border-white shadow-md mr-8 mb-4 sm:mb-0"
                />
                <div className="flex-grow">
                  <h1 className="text-4xl font-bold text-gray-800">{teacher.name}</h1>
                  <div className="flex items-center mt-2 text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 font-semibold">{teacher.rating.toFixed(1)}</span>
                    </div>
                    <span className="mx-2">·</span>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="ml-1">{teacher.location}</span>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-aguirre-blue mt-3">${teacher.hourly_rate}/hour</p>
                </div>
              </div>
            </motion.div>

            {/* Teacher Details */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column - Bio & Details */}
                <motion.div
                  variants={containerVariants}
                  className="lg:col-span-2"
                >
                  <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">About Me</h2>
                    <p className="text-gray-700 leading-relaxed mb-8">{teacher.bio}</p>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <BookOpen className="h-6 w-6 text-aguirre-blue mr-4 mt-1" />
                        <div>
                          <h4 className="font-semibold">Subjects</h4>
                          <div className="flex flex-wrap mt-1">
                            {teacher.subjects?.map((subject) => (
                              <span
                                key={subject}
                                className="bg-aguirre-sky text-aguirre-blue text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <BookOpen className="h-6 w-6 text-aguirre-blue mr-4 mt-1" />
                        <div>
                          <h4 className="font-semibold">Languages</h4>
                          <div className="flex flex-wrap mt-1">
                            {teacher.languages?.map((language) => (
                              <span
                                key={language}
                                className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2"
                              >
                                {language}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <BookOpen className="h-6 w-6 text-aguirre-blue mr-4 mt-1" />
                        <div>
                          <h4 className="font-semibold">Education</h4>
                          <p className="text-gray-700">{teacher.education}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-6 w-6 text-aguirre-blue mr-4 mt-1" />
                        <div>
                          <h4 className="font-semibold">Experience</h4>
                          <p className="text-gray-700">{teacher.experience}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Right Column - Booking */}
                <motion.div variants={itemVariants}>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Book a Session</h2>

                    {bookingSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-100 text-green-800 p-4 rounded-lg text-center"
                      >
                        Booking successful! Redirecting...
                      </motion.div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleBooking();
                        }}
                      >
                        {bookingError && (
                          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-sm">
                            {bookingError}
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="h-4 w-4 inline mr-2" />
                            Select Date
                          </label>
                          <select
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-aguirre-blue focus:ring focus:ring-aguirre-blue focus:ring-opacity-50 transition"
                            value={selectedDate}
                            onChange={(e) => {
                              setSelectedDate(e.target.value);
                              setSelectedTime(''); // Reset time when date changes
                            }}
                            required
                          >
                            <option value="">Select a date</option>
                            {getAvailableDates().map((date) => (
                              <option key={date} value={date}>
                                {new Date(date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="h-4 w-4 inline mr-2" />
                            Select Time
                          </label>
                          <select
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-aguirre-blue focus:ring focus:ring-aguirre-blue focus:ring-opacity-50 transition"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            disabled={!selectedDate}
                            required
                          >
                            <option value="">Select a time</option>
                            {getAvailableTimes().map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mb-6">
                          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                            <span>Hourly Rate:</span>
                            <span className="font-semibold">${teacher.hourly_rate}</span>
                          </div>
                          <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                            <span>Total:</span>
                            <span>${teacher.hourly_rate}</span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={!selectedDate || !selectedTime}
                          className="w-full py-3 px-4 bg-aguirre-blue text-white font-semibold rounded-lg hover:bg-aguirre-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aguirre-blue disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          Book Now
                        </motion.button>

                        {!user && (
                          <p className="text-xs text-gray-500 mt-3 text-center">
                            You'll be asked to sign in to complete your booking.
                          </p>
                        )}
                      </form>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
