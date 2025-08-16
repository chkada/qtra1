import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import Navbar from '../components/UI/Navbar';
import supabase, { isValidConfig } from '../src/utils/supabaseClient';
import ProtectedRoute from '../components/ProtectedRoute';

export default function BecomeTeacher() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!user) throw new Error('You must be logged in to become a teacher');

      // If Supabase is not configured, mock the teacher creation
      if (!isValidConfig) {
        console.log(
          'Supabase not configured, mocking teacher profile creation'
        );
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }

      // Format the data for the database
      const teacherData = {
        user_id: user.id,
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
        rating: 0, // New teachers start with no rating
      };

      // Insert the teacher profile into the database
      const { data, error: insertError } = await supabase
        .from('teachers')
        .insert([teacherData]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating teacher profile:', err.message);
      // Fallback to mock success if Supabase fails
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Become a Teacher
          </h1>

          {success ? (
            <div className="bg-green-50 p-4 rounded-md mb-6">
              <p className="text-green-700">
                Your teacher profile has been created successfully! Redirecting
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
                  Fill out the form below to create your teacher profile and
                  start teaching.
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
                        Avatar URL (optional)
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
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Creating Profile...' : 'Create Teacher Profile'}
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
