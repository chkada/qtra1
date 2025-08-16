import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/UI/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../src/contexts/AuthContext';
import supabase, { isValidConfig } from '../src/utils/supabaseClient';

type Booking = {
  id: string;
  teacher_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  teacher?: {
    name: string;
    avatar: string;
  };
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    async function fetchBookings() {
      try {
        setLoading(true);

        // If Supabase is not configured, use mock data
        if (!isValidConfig) {
          console.log('Supabase not configured, using mock bookings data');
          const mockBookings = [
            {
              id: 'mock-booking-1',
              teacher_id: 'mock-teacher-1',
              user_id: user.id,
              start_time: new Date(
                Date.now() + 24 * 60 * 60 * 1000
              ).toISOString(),
              end_time: new Date(
                Date.now() + 25 * 60 * 60 * 1000
              ).toISOString(),
              status: 'confirmed',
              created_at: new Date().toISOString(),
              teacher: {
                name: 'Dr. Sarah Johnson',
                avatar: 'https://via.placeholder.com/150',
              },
            },
            {
              id: 'mock-booking-2',
              teacher_id: 'mock-teacher-2',
              user_id: user.id,
              start_time: new Date(
                Date.now() - 24 * 60 * 60 * 1000
              ).toISOString(),
              end_time: new Date(
                Date.now() - 23 * 60 * 60 * 1000
              ).toISOString(),
              status: 'completed',
              created_at: new Date(
                Date.now() - 48 * 60 * 60 * 1000
              ).toISOString(),
              teacher: {
                name: 'Prof. Michael Chen',
                avatar: 'https://via.placeholder.com/150',
              },
            },
          ];
          setBookings(mockBookings);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('bookings')
          .select(
            `
            *,
            teacher:teacher_id (name, avatar)
          `
          )
          .eq('user_id', user.id)
          .order('start_time', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        // Fallback to mock data if Supabase fails
        const mockBookings = [
          {
            id: 'mock-booking-1',
            teacher_id: 'mock-teacher-1',
            user_id: user.id,
            start_time: new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ).toISOString(),
            end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
            status: 'confirmed',
            created_at: new Date().toISOString(),
            teacher: {
              name: 'Dr. Sarah Johnson',
              avatar: 'https://via.placeholder.com/150',
            },
          },
        ];
        setBookings(mockBookings);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [user]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                You don't have any bookings yet.
              </p>
              <button
                onClick={() => router.push('/teachers')}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Find a Teacher
              </button>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <li key={booking.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {booking.teacher?.avatar && (
                            <img
                              className="h-10 w-10 rounded-full mr-4"
                              src={booking.teacher.avatar}
                              alt={booking.teacher?.name || 'Teacher'}
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-indigo-600">
                              {booking.teacher?.name || 'Unknown Teacher'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(booking.start_time)} -{' '}
                              {formatDate(booking.end_time)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/bookings/${booking.id}`)}
                          className="text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </button>
                        {booking.status.toLowerCase() !== 'cancelled' &&
                          booking.status.toLowerCase() !== 'completed' && (
                            <button
                              className="text-sm text-red-600 hover:text-red-900"
                              // This would need to be implemented with a proper API call
                              onClick={() =>
                                alert(
                                  'Cancel booking functionality would go here'
                                )
                              }
                            >
                              Cancel
                            </button>
                          )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
