import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import Navbar from '../components/UI/Navbar';
import supabase, { isValidConfig } from '../src/utils/supabaseClient';
import ProtectedRoute from '../components/ProtectedRoute';

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

export default function EditTeacherProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: '',
    subjects: '',
    languages: '',
    hourly_rate: '',
    bio: '',
    avatar: '',
    availability_days: '',
    availability_hours: '',
  });

  useEffect(() => {
    if (user) {
      fetchTeacherProfile();
    }
  }, [user]);

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);
      setError('');

      if (!isValidConfig) {
        // Mock teacher profile when Supabase is not configured
        console.warn('Using mock teacher profile - Supabase not configured');
        const mockProfile = {
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
        };
        setTeacherProfile(mockProfile);
        setFormData({
          name: mockProfile.name || '',
          subjects: mockProfile.subjects?.join(', ') || '',
          languages: mockProfile.languages?.join(', ') || '',
          hourly_rate: mockProfile.hourly_rate?.toString() || '',
          bio: mockProfile.bio || '',
          avatar: mockProfile.avatar || '',
          availability_days: mockProfile.availability?.days?.join(', ') || '',
          availability_hours: mockProfile.availability?.hours?.join(', ') || '',
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setTeacherProfile(data);
        setFormData({
          name: data.name || '',
          subjects: data.subjects?.join(', ') || '',
          languages: data.languages?.join(', ') || '',
          hourly_rate: data.hourly_rate?.toString() || '',
          bio: data.bio || '',
          avatar: data.avatar || '',
          availability_days: data.availability?.days?.join(', ') || '',
          availability_hours: data.availability?.hours?.join(', ') || '',
        });
      }
    } catch (error: any) {
      console.error('Error fetching teacher profile:', error.message);
      // Fallback to mock data on error
      console.warn('Falling back to mock teacher profile');
      const mockProfile = {
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
      };
      setTeacherProfile(mockProfile);
      setFormData({
        name: mockProfile.name || '',
        subjects: mockProfile.subjects?.join(', ') || '',
        languages: mockProfile.languages?.join(', ') || '',
        hourly_rate: mockProfile.hourly_rate?.toString() || '',
        bio: mockProfile.bio || '',
        avatar: mockProfile.avatar || '',
        availability_days: mockProfile.availability?.days?.join(', ') || '',
        availability_hours: mockProfile.availability?.hours?.join(', ') || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      if (!user)
        throw new Error('You must be logged in to update your profile');
      if (!teacherProfile) throw new Error('Teacher profile not found');

      // Format the data for the database
      const updatedTeacherData = {
        name: formData.name,
        subjects: formData.subjects.split(',').map((s) => s.trim()),
        languages: formData.languages.split(',').map((l) => l.trim()),
        hourly_rate: parseFloat(formData.hourly_rate),
        bio: formData.bio,
        avatar: formData.avatar || 'https://via.placeholder.com/150',
        availability: {
          days: formData.availability_days.split(',').map((d) => d.trim()),
          hours: formData.availability_hours.split(',').map((h) => h.trim()),
        },
      };

      if (!isValidConfig) {
        // Mock update success when Supabase is not configured
        console.warn('Mock teacher profile update - Supabase not configured');
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }

      // Update the teacher profile in the database
      const { error: updateError } = await supabase
        .from('teachers')
        .update(updatedTeacherData)
        .eq('id', teacherProfile.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error updating teacher profile:', err.message);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Teacher Profile
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Dashboard
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error && !teacherProfile ? (
            <div className="bg-red-50 p-4 rounded-md mb-6">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Dashboard
              </button>
            </div>
          ) : success ? (
            <div className="bg-green-50 p-4 rounded-md mb-6">
              <p className="text-green-700">
                Your teacher profile has been updated successfully! Redirecting
                to dashboard...
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Teacher Profile Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Update your teacher profile information below.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 p-4 mx-6 rounded-md mb-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="border-t border-gray-200"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subjects"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Subjects (comma separated)
                      </label>
                      <input
                        type="text"
                        name="subjects"
                        id="subjects"
                        required
                        placeholder="Mathematics, Physics, Chemistry"
                        value={formData.subjects}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="languages"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Languages (comma separated)
                      </label>
                      <input
                        type="text"
                        name="languages"
                        id="languages"
                        required
                        placeholder="English, Arabic, French"
                        value={formData.languages}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="hourly_rate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Hourly Rate ($)
                      </label>
                      <input
                        type="number"
                        name="hourly_rate"
                        id="hourly_rate"
                        required
                        min="1"
                        step="0.01"
                        value={formData.hourly_rate}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="avatar"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Avatar URL
                      </label>
                      <input
                        type="text"
                        name="avatar"
                        id="avatar"
                        placeholder="https://example.com/your-photo.jpg"
                        value={formData.avatar}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="availability_days"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Available Days (comma separated)
                      </label>
                      <input
                        type="text"
                        name="availability_days"
                        id="availability_days"
                        required
                        placeholder="Monday, Tuesday, Wednesday"
                        value={formData.availability_days}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="availability_hours"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Available Hours (comma separated)
                      </label>
                      <input
                        type="text"
                        name="availability_hours"
                        id="availability_hours"
                        required
                        placeholder="9:00 AM - 12:00 PM, 2:00 PM - 5:00 PM"
                        value={formData.availability_hours}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        id="bio"
                        rows={4}
                        required
                        placeholder="Tell students about yourself, your teaching experience, and your teaching style."
                        value={formData.bio}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
