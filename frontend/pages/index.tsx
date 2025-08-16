import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TeacherCard from '../components/Teachers/TeacherCard';
import Navbar from '../components/UI/Navbar';
import { Button } from '../src/components/UI/Button';
import { Input } from '../src/components/UI/Input';
import { Select } from '../src/components/UI/Select';
import supabase, { isValidConfig } from '../src/utils/supabaseClient';
import { mockTeachers } from '../src/data/mockTeachers';
import { Search, Star, Users, BookOpen, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const subjects = [...new Set((teachers || []).flatMap(t => t.subjects || []))];
  const languages = [...new Set((teachers || []).flatMap(t => t.languages || []))];

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-500"> Teacher</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with qualified educators from around the world. Learn at your own pace with personalized one-on-one sessions.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Search for subjects, teachers, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    icon={<Search className="w-5 h-5" />}
                  />
                </div>
                <Select
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  options={[
                    { value: '', label: 'All Subjects' },
                    ...subjects.map(subject => ({ value: subject, label: subject }))
                  ]}
                  placeholder="All Subjects"
                  className="w-full"
                />
                <Select
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  options={[
                    { value: '', label: 'All Languages' },
                    ...languages.map(language => ({ value: language, label: language }))
                  ]}
                  placeholder="All Languages"
                  className="w-full"
                />
              </div>
              <div className="mt-4 flex justify-center">
                <Button onClick={handleSearch} className="px-8 py-3">
                  <Search className="w-5 h-5 mr-2" />
                  Search Teachers
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">500+</h3>
                <p className="text-gray-600">Qualified Teachers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">50+</h3>
                <p className="text-gray-600">Subjects Available</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">4.9</h3>
                <p className="text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Teachers Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Teachers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet some of our top-rated educators who are ready to help you achieve your learning goals.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center bg-red-50 p-6 rounded-lg">{error}</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center text-gray-500 bg-gray-50 p-12 rounded-lg">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No teachers found</h3>
            <p>Try adjusting your search criteria or browse all teachers.</p>
            <Button 
              onClick={() => router.push('/teachers')} 
              variant="outline" 
              className="mt-4"
            >
              Browse All Teachers
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTeachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
            
            {/* View All Teachers Button */}
            <div className="text-center mt-12">
              <Button 
                onClick={() => router.push('/teachers')} 
                size="lg"
                className="px-8 py-4"
              >
                View All Teachers
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting started with Qindil is simple. Follow these easy steps to begin your learning journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Your Teacher</h3>
              <p className="text-gray-600">Browse our qualified teachers and find the perfect match for your learning needs.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book a Session</h3>
              <p className="text-gray-600">Schedule a convenient time for your one-on-one learning session.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
              <p className="text-gray-600">Connect with your teacher and begin your personalized learning experience.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
