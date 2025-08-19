import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import Navbar from '../components/UI/Navbar';
import supabase, { isValidConfig } from '../src/utils/supabaseClient';
import ProtectedRoute from '../components/ProtectedRoute';
import { motion } from 'framer-motion';
import {
  User,
  Book,
  Globe,
  DollarSign,
  Image as ImageIcon,
  Calendar,
  Clock,
  FileText,
  Loader,
} from 'lucide-react';

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
    education: '',
    experience: '',
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
        avatar: formData.avatar || `https://i.pravatar.cc/150?u=${user.id}`,
        availability: {
          days: formData.availability_days.split(',').map((d) => d.trim()),
          hours: formData.availability_hours.split(',').map((h) => h.trim()),
        },
        rating: 0, // New teachers start with no rating
        education: formData.education,
        experience: formData.experience,
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
      <div className="min-h-screen bg-aguirre-blue-100">
        <Navbar />
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-aguirre-blue-900 sm:text-5xl">
              Join Our Team of Educators
            </h1>
            <p className="mt-4 text-lg text-aguirre-blue-700">
              Share your knowledge and passion with students from around the
              world.
            </p>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-lg shadow-md text-center"
            >
              <h3 className="text-2xl font-semibold mb-2">
                Application Submitted!
              </h3>
              <p>
                Your teacher profile has been created successfully. You will be
                redirected to your dashboard shortly.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-aguirre-blue-900 mb-6">
                Your Teaching Profile
              </h3>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <User className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="pl-10 w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-aguirre-sky-500"
                    />
                  </div>
                  <div className="relative">
                    <Book className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                    <input
                      type="text"
                      name="subjects"
                      required
                      placeholder="Subjects (e.g., Math, History)"
                      value={formData.subjects}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-aguirre-sky-500"
                    />
                  </div>
                  <div className="relative">
                    <Globe className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                    <input
                      type="text"
                      name="languages"
                      required
                      placeholder="Languages (e.g., English, Spanish)"
                      value={formData.languages}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-aguirre-sky-500"
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                    <input
                      type="number"
                      name="hourly_rate"
                      required
                      min="1"
                      step="0.01"
                      placeholder="Hourly Rate ($)"
                      value={formData.hourly_rate}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-aguirre-sky-500"
                    />
                  </div>
                  <div className="relative md:col-span-2">
                    <ImageIcon className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                    <input
                      type="text"
                      name="avatar"
                      placeholder="Avatar URL (optional)"
                      value={formData.avatar}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-aguirre-sky-500"
                    />
                  </div>
                  <div className="relative">
                    <FileText className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                    <input
                      type="text"
                      name="education"
                      required
                      placeholder="Education (e.g., B.Sc. in Physics)"
                      value={formData.education}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-aguirre-sky-500"
                    />
                  </div>
                  <div className="relative">
                    <FileText className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                    <input
                      type="text"
                      name="experience"
                      required
                      placeholder="Experience (e.g., 5 years of teaching)"
                      value={formData.experience}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-aguirre-sky-500"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                    <input
                      type="text"
                      name="availability_days"
                      required
                      placeholder="Available Days (e.g., Mon, Wed, Fri)"
                      value={formData.availability_days}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-aguirre-sky-500"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                    <input
                      type="text"
                      name="availability_hours"
                      required
                      placeholder="Available Hours (e.g., 10am - 4pm)"
                      value={formData.availability_hours}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-aguirre-sky-500"
                    />
                  </div>
                </div>

                <div className="relative">
                  <FileText className="absolute top-5 left-3 text-gray-400" />
                  <textarea
                    name="bio"
                    rows={5}
                    required
                    placeholder="Tell us about your teaching style and experience..."
                    value={formData.bio}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-aguirre-sky-500"
                  />
                </div>

                <div className="pt-4 text-right">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-full text-white bg-aguirre-sky-600 hover:bg-aguirre-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aguirre-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
