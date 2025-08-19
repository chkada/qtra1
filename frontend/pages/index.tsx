import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TeacherCard from '../components/Teachers/TeacherCard';
import Navbar from '../components/UI/Navbar';
import { Button } from '../src/components/UI/Button';
import { Input } from '../src/components/UI/Input';
import { Select } from '../src/components/UI/Select';
import supabase, { isValidConfig } from '../src/utils/supabaseClient';
import mockTeachers, { type Teacher } from '../src/data/mockTeachers';
import { motion } from 'framer-motion';
import { Search, Star, Users, BookOpen, ArrowRight } from 'lucide-react';
import Stats from '../src/components/UI/Stats';

export default function HomePage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  useEffect(() => {
    async function fetchTeachers() {
      try {
        setLoading(true);

        if (!isValidConfig) {
          // Use mock data when Supabase is not configured
          console.warn('Using mock teacher data - Supabase not configured');
          setTeachers(mockTeachers);
          return;
        }

        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('subscription_active', true)
          .limit(6); // Show only top 6 teachers on homepage

        if (error) {
          throw error;
        }

        setTeachers(data || []);
      } catch (err) {
        console.error('Error fetching teachers:', err);
        // Fallback to mock data on error
        console.warn('Falling back to mock teacher data');
        setTeachers(mockTeachers.slice(0, 6)); // Show only top 6 teachers
      } finally {
        setLoading(false);
      }
    }

    fetchTeachers();
  }, []);

  // Get unique subjects and languages for filters
  const subjects = Array.from(new Set((teachers || []).flatMap(t => t.subjects || [])));
  const languages = Array.from(new Set((teachers || []).flatMap(t => t.languages || [])));

  // Filter teachers based on search and filters
  const filteredTeachers = (teachers || []).filter(teacher => {
    const matchesSearch = !searchTerm || 
      teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      teacher.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = !selectedSubject || teacher.subjects?.includes(selectedSubject);
    const matchesLanguage = !selectedLanguage || teacher.languages?.includes(selectedLanguage);
    
    return matchesSearch && matchesSubject && matchesLanguage;
  });

  const handleSearch = () => {
    // Navigate to teachers page with filters
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedSubject) params.set('subject', selectedSubject);
    if (selectedLanguage) params.set('language', selectedLanguage);
    
    router.push(`/teachers?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-aguirre-blue-100/20 overflow-hidden">
        <div className="container mx-auto px-4 py-24 text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Find Your Perfect
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aguirre-blue-500 to-aguirre-sky-500"> Teacher</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Connect with qualified educators from around the world. Learn at your own pace with personalized one-on-one sessions.
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for subjects, teachers, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full !py-4 !rounded-full"
                leftIcon={<Search className="w-6 h-6" />}
              />
              <Button 
                onClick={handleSearch} 
                className="absolute right-2 top-1/2 -translate-y-1/2 !rounded-full !px-6"
                size="lg"
              >
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <Stats />

      {/* Featured Teachers Section */}
      <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Meet Our Top Educators</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Discover our community of dedicated teachers, passionate about sharing their knowledge and helping you succeed.
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center mt-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-aguirre-blue-500"></div>
            </div>
          ) : error ? (
            <div className="mt-12 text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-8 rounded-xl shadow-md"> 
              <p className="text-lg">{error}</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="mt-12 text-center text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-12 rounded-xl shadow-lg">
              <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">No Teachers Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">We couldn't find any teachers matching your criteria. Try a different search or browse all available teachers.</p>
              <Button 
                onClick={() => router.push('/teachers')} 
                variant="primary"
                size="lg"
              >
                Browse All Teachers
              </Button>
            </div>
          ) : (
            <>
              <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {filteredTeachers.map((teacher) => (
                  <TeacherCard key={teacher.id} teacher={teacher} />
                ))}
              </div>
              <div className="text-center mt-20">
                <Button 
                  onClick={() => router.push('/teachers')} 
                  size="lg"
                  variant="secondary"
                  className="px-10 py-4 text-lg"
                >
                  Explore All Teachers
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
