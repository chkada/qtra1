import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import Navbar from '../components/UI/Navbar';
import supabase, { isValidConfig } from '../src/utils/supabaseClient';
import ProtectedRoute from '../components/ProtectedRoute';

type Booking = {
  id: string;
  teacher_id: string;
  user_id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  user: {
    full_name: string;
    email: string;
  };
};

type TeacherProfile = {
  id: string;
  user_id: string;
  name: string;
  subjects: string[];
  languages: string[];
  hourly_rate: number;
  bio: string;
  availability: {
    days: string[];
    hours: string[];
  };
  avatar: string;
  rating: number;
};

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    if (user) {
      fetchTeacherProfile();
      fetchBookings();
    }
  }, [user]);

  const fetchTeacherProfile = async () => {
    try {
      if (!isValidConfig) {
        // Mock teacher profile when Supabase is not configured
        console.warn('Using mock teacher profile - Supabase not configured');
        setTeacherProfile({
          id: 'mock-teacher-1',
          user_id: user?.id || 'mock-user',
          name: 'Mock Teacher',
          subjects: ['Mathematics', 'Physics'],
          languages: ['English', 'Spanish'],
          hourly_rate: 25,
          bio: 'This is a mock teacher profile for development.',
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday'],
            hours: ['09:00', '10:00', '11:00'],
          },
          avatar: '/api/placeholder/150/150',
          rating: 4.8,
        });
        return;
      }

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setTeacherProfile(data);
      }
    } catch (error: any) {
      console.error('Error fetching teacher profile:', error.message);
      // Fallback to mock data on error
      console.warn('Falling back to mock teacher profile');
      setTeacherProfile({
        id: 'mock-teacher-1',
        user_id: user?.id || 'mock-user',
        name: 'Mock Teacher',
        subjects: ['Mathematics', 'Physics'],
        languages: ['English', 'Spanish'],
        hourly_rate: 25,
        bio: 'This is a mock teacher profile for development.',
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday'],
          hours: ['09:00', '10:00', '11:00'],
        },
        avatar: '/api/placeholder/150/150',
        rating: 4.8,
      });
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');

      if (!isValidConfig) {
        // Mock bookings when Supabase is not configured
        console.warn('Using mock bookings - Supabase not configured');
        const mockBookings = [
          {
            id: 'mock-booking-1',
            teacher_id: 'mock-teacher-1',
            user_id: user?.id || 'mock-user',
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
            status: 'pending' as const,
            created_at: new Date().toISOString(),
            user: {
              full_name: 'Mock Student',
              email: 'student@example.com',
            },
          },
          {
            id: 'mock-booking-2',
            teacher_id: 'mock-teacher-1',
            user_id: user?.id || 'mock-user',
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            time: '14:00',
            status: 'confirmed' as const,
            created_at: new Date().toISOString(),
            user: {
              full_name: 'Another Student',
              email: 'student2@example.com',
            },
          },
        ];
        setBookings(mockBookings);
        setLoading(false);
        return;
      }

      let query;

      if (teacherProfile) {
        // If user is a teacher, get bookings for their teacher profile
        query = supabase
          .from('bookings')
          .select(
            `
            *,
            user:users(full_name, email)
          `
          )
          .eq('teacher_id', teacherProfile.id)
          .order('date', { ascending: false });
      } else {
        // Otherwise get bookings made by this user
        query = supabase
          .from('bookings')
          .select(
            `
            *,
            teacher:teachers(name, avatar)
          `
          )
          .eq('user_id', user?.id)
          .order('date', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setBookings(data);
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error.message);
      // Fallback to mock data on error
      console.warn('Falling back to mock bookings');
      const mockBookings = [
        {
          id: 'mock-booking-1',
          teacher_id: 'mock-teacher-1',
          user_id: user?.id || 'mock-user',
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          status: 'pending' as const,
          created_at: new Date().toISOString(),
          user: {
            full_name: 'Mock Student',
            email: 'student@example.com',
          },
        },
      ];
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: 'confirmed' | 'cancelled'
  ) => {
    try {
      if (!isValidConfig) {
        // Mock booking status update when Supabase is not configured
        console.warn('Mock booking status update - Supabase not configured');
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId ? { ...booking, status } : booking
          )
        );
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings after update
      fetchBookings();
    } catch (error: any) {
      console.error('Error updating booking:', error.message);
      setError(`Failed to ${status} booking`);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            <div className="mt-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`${
                    activeTab === 'bookings'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('bookings')}
                >
                  Bookings
                </button>

                <button
                  className={`${
                    activeTab === 'profile'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('profile')}
                >
                  Teacher Profile
                </button>
              </nav>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md my-6">
                <p className="text-red-700">{error}</p>
              </div>
            ) : activeTab === 'bookings' ? (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {teacherProfile ? 'Student Bookings' : 'Your Bookings'}
                </h2>

                {bookings.length === 0 ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                    <p className="text-gray-500">
                      {teacherProfile
                        ? 'You have no student bookings yet.'
                        : 'You have not made any bookings yet.'}
                    </p>
                    {!teacherProfile && (
                      <button
                        onClick={() => router.push('/teachers')}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Find Teachers
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <li key={booking.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {booking.user && (
                                  <div>
                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                      {booking.user.full_name ||
                                        booking.user.email}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {booking.user.email}
                                    </p>
                                  </div>
                                )}
                                {booking.teacher && (
                                  <div className="flex items-center">
                                    <img
                                      src={
                                        booking.teacher.avatar ||
                                        'https://via.placeholder.com/40'
                                      }
                                      alt={booking.teacher.name}
                                      className="h-10 w-10 rounded-full mr-3"
                                    />
                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                      {booking.teacher.name}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${
                                    booking.status === 'confirmed'
                                      ? 'bg-green-100 text-green-800'
                                      : booking.status === 'cancelled'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {booking.status.charAt(0).toUpperCase() +
                                    booking.status.slice(1)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <svg
                                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {formatDate(booking.date)}
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                  <svg
                                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {booking.time}
                                </p>
                              </div>

                              {teacherProfile &&
                                booking.status === 'pending' && (
                                  <div className="mt-2 flex space-x-2 sm:mt-0">
                                    <button
                                      onClick={() =>
                                        updateBookingStatus(
                                          booking.id,
                                          'confirmed'
                                        )
                                      }
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() =>
                                        updateBookingStatus(
                                          booking.id,
                                          'cancelled'
                                        )
                                      }
                                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                )}

                              {!teacherProfile &&
                                booking.status === 'pending' && (
                                  <div className="mt-2 sm:mt-0">
                                    <button
                                      onClick={() =>
                                        updateBookingStatus(
                                          booking.id,
                                          'cancelled'
                                        )
                                      }
                                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                      Cancel Booking
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Teacher Profile
                </h2>

                {!teacherProfile ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
                    <p className="text-gray-500 mb-4">
                      You don't have a teacher profile yet. Create one to start
                      teaching!
                    </p>
                    <button
                      onClick={() => router.push('/become-teacher')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Become a Teacher
                    </button>
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Teacher Information
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Personal details and application.
                        </p>
                      </div>
                      <button
                        onClick={() => router.push('/edit-teacher-profile')}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Edit Profile
                      </button>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <div className="flex items-center mb-4">
                        <img
                          src={
                            teacherProfile.avatar ||
                            'https://via.placeholder.com/100'
                          }
                          alt={teacherProfile.name}
                          className="h-24 w-24 rounded-full mr-6 object-cover"
                        />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {teacherProfile.name}
                          </h3>
                          <div className="flex items-center mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-5 w-5 ${i < Math.floor(teacherProfile.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-1 text-sm text-gray-600">
                              {teacherProfile.rating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-indigo-600 font-bold mt-1">
                            ${teacherProfile.hourly_rate}/hr
                          </p>
                        </div>
                      </div>

                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 mt-4">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Subjects
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <div className="flex flex-wrap">
                              {teacherProfile.subjects.map((subject) => (
                                <span
                                  key={subject}
                                  className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded mr-2 mb-2"
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </div>

                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Languages
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <div className="flex flex-wrap">
                              {teacherProfile.languages.map((language) => (
                                <span
                                  key={language}
                                  className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2 mb-2"
                                >
                                  {language}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </div>

                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">
                            Bio
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {teacherProfile.bio}
                          </dd>
                        </div>

                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Available Days
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {teacherProfile.availability?.days?.join(', ') ||
                              'Not specified'}
                          </dd>
                        </div>

                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Available Hours
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {teacherProfile.availability?.hours?.join(', ') ||
                              'Not specified'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
