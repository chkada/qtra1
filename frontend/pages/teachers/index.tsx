import React, { useState, useEffect } from 'react';
import Navbar from '../../components/UI/Navbar';
import TeacherCard from '../../components/Teachers/TeacherCard';
import supabase, { isValidConfig } from '../../src/utils/supabaseClient';
import mockTeachers, { Teacher } from '../../src/data/mockTeachers';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { Button } from '../../src/components/UI/Button';
import { Input } from '../../src/components/UI/Input';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    subject: '',
    language: '',
    minRating: 0,
    maxPrice: 1000,
  });

  const [subjects, setSubjects] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchTeachers() {
      try {
        setLoading(true);

        let teacherData = [];

        if (!isValidConfig) {
          // Use mock data when Supabase is not configured
          console.warn('Using mock teacher data - Supabase not configured');
          teacherData = mockTeachers;
        } else {
          const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('subscription_active', true);

          if (error) {
            throw error;
          }

          teacherData = data || [];
        }

        setTeachers(teacherData);

        // Extract unique subjects and languages
        if (teacherData) {
          const allSubjects = teacherData.flatMap(
            (teacher) => teacher.subjects || []
          );
          const allLanguages = teacherData.flatMap(
            (teacher) => teacher.languages || []
          );

          setSubjects([...new Set(allSubjects)]);
          setLanguages([...new Set(allLanguages)]);
        }
      } catch (err: any) {
        console.error('Error fetching teachers:', err);
        // Fallback to mock data on error
        console.warn('Falling back to mock teacher data');
        const teacherData = mockTeachers;
        setTeachers(teacherData);

        const allSubjects = teacherData.flatMap(
          (teacher) => teacher.subjects || []
        );
        const allLanguages = teacherData.flatMap(
          (teacher) => teacher.languages || []
        );

        setSubjects([...new Set(allSubjects)]);
        setLanguages([...new Set(allLanguages)]);
      } finally {
        setLoading(false);
      }
    }

    fetchTeachers();
  }, []);

  const filteredTeachers = (teachers || []).filter((teacher) => {
    // Filter by subject
    if (
      filters.subject &&
      (!teacher.subjects || !teacher.subjects.includes(filters.subject))
    ) {
      return false;
    }

    // Filter by language
    if (
      filters.language &&
      (!teacher.languages || !teacher.languages.includes(filters.language))
    ) {
      return false;
    }

    // Filter by rating
    if (teacher.rating < filters.minRating) {
      return false;
    }

    // Filter by price
    if (teacher.hourly_rate > filters.maxPrice) {
      return false;
    }

    return true;
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]:
        name === 'minRating' || name === 'maxPrice' ? Number(value) : value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      subject: '',
      language: '',
      minRating: 0,
      maxPrice: 1000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Explore Our World-Class Educators
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Find the perfect teacher to help you achieve your learning goals, no matter the subject or language.
          </p>
        </header>

        {/* Search and Filter Controls */}
        <div className="mb-8 sticky top-20 z-20 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm py-4 rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4">
            <div className="w-full md:w-1/2 lg:w-2/3">
              <Input
                placeholder="Search by name, subject, or keyword..."
                icon={<Search className="w-5 h-5 text-gray-400" />}
                className="w-full !py-3"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
              </Button>
              <Button onClick={resetFilters} variant="ghost">
                Reset
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {isFiltersOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Subject Filter */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-aguirre-blue-500 focus:ring-aguirre-blue-500"
                    value={filters.subject}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Language Filter */}
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-aguirre-blue-500 focus:ring-aguirre-blue-500"
                    value={filters.language}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Languages</option>
                    {languages.map((language) => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Rating: <span className="font-bold text-aguirre-blue-500">{filters.minRating.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    id="minRating"
                    name="minRating"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={handleFilterChange}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-aguirre-blue-500"
                  />
                </div>

                {/* Price Filter */}
                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Price: <span className="font-bold text-aguirre-blue-500">${filters.maxPrice}</span>
                  </label>
                  <input
                    type="range"
                    id="maxPrice"
                    name="maxPrice"
                    min="0"
                    max="500"
                    step="10"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-aguirre-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Teachers List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-aguirre-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg bg-red-100 dark:bg-red-900/20 p-6 rounded-lg">{error}</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">No Teachers Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">No teachers match your current filters. Try adjusting your criteria or resetting the filters.</p>
            <Button onClick={resetFilters} variant="primary">
              Reset Filters
            </Button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredTeachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
