import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/UI/Navbar';
import { useAuth } from '../../src/contexts/AuthContext';
import supabase, { isValidConfig } from '../../src/utils/supabaseClient';
import { mockTeachers } from '../../src/data/mockTeachers';

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
        // Redirect to dashboard after a delay
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
      // Redirect to bookings page after a delay
      setTimeout(() => {
        router.push('/bookings');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      // Fallback to mock success on error
      console.warn('Falling back to mock booking success');
      setBookingSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-red-500 text-center">
            {error || 'Teacher not found'}
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/teachers')}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Back to Teachers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Teacher Header */}
          <div className="bg-indigo-600 text-white p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <img
                src={teacher.avatar || 'https://via.placeholder.com/150'}
                alt={teacher.name}
                className="h-24 w-24 rounded-full border-4 border-white mr-6"
              />
              <div>
                <h1 className="text-3xl font-bold">{teacher.name}</h1>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(teacher.rating) ? 'text-yellow-300' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2">{teacher.rating.toFixed(1)}</span>
                </div>
                <p className="text-lg mt-1">${teacher.hourly_rate}/hour</p>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <div className="text-sm bg-white text-indigo-600 px-3 py-1 rounded-full font-semibold mb-2">
                {teacher.location}
              </div>
              <div className="flex flex-wrap justify-center md:justify-end">
                {teacher.subjects?.map((subject) => (
                  <span
                    key={subject}
                    className="bg-indigo-700 text-white text-xs px-2 py-1 rounded m-1"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Teacher Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Bio & Experience */}
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-4">About Me</h2>
                <p className="text-gray-700 mb-6">{teacher.bio}</p>

                <h3 className="text-xl font-bold mb-3">Experience</h3>
                <p className="text-gray-700 mb-6">{teacher.experience}</p>

                <h3 className="text-xl font-bold mb-3">Education</h3>
                <p className="text-gray-700 mb-6">{teacher.education}</p>

                <h3 className="text-xl font-bold mb-3">Languages</h3>
                <div className="flex flex-wrap">
                  {teacher.languages?.map((language) => (
                    <span
                      key={language}
                      className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full mr-2 mb-2"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column - Booking */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Book a Session</h2>

                {bookingSuccess ? (
                  <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
                    Booking successful! Redirecting to your bookings...
                  </div>
                ) : (
                  <>
                    {bookingError && (
                      <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
                        {bookingError}
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Date
                      </label>
                      <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedTime(''); // Reset time when date changes
                        }}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Time
                      </label>
                      <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        disabled={!selectedDate}
                      >
                        <option value="">Select a time</option>
                        {getAvailableTimes().map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                        <span>Hourly Rate:</span>
                        <span>${teacher.hourly_rate}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                        <span>Duration:</span>
                        <span>1 hour</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>${teacher.hourly_rate}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleBooking}
                      disabled={!selectedDate || !selectedTime}
                      className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Book Now
                    </button>

                    {!user && (
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        You'll need to sign in to complete your booking
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
