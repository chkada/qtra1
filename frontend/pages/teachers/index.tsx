import React, { useState, useEffect } from 'react';
import Navbar from '../../components/UI/Navbar';
import TeacherCard from '../../components/Teachers/TeacherCard';
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
  subscription_active: boolean;
};

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Find Your Perfect Teacher
        </h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={filters.subject}
                onChange={handleFilterChange}
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Language
              </label>
              <select
                id="language"
                name="language"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={filters.language}
                onChange={handleFilterChange}
              >
                <option value="">All Languages</option>
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="minRating"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Minimum Rating
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
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">
                {filters.minRating} stars
              </div>
            </div>

            <div>
              <label
                htmlFor="maxPrice"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Maximum Price
              </label>
              <input
                type="range"
                id="maxPrice"
                name="maxPrice"
                min="0"
                max="1000"
                step="10"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">
                ${filters.maxPrice}
              </div>
            </div>
          </div>
        </div>

        {/* Teachers List */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center text-gray-500">
            No teachers match your filters. Try adjusting your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
