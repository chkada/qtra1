import React from 'react';
import { useRouter } from 'next/router';

import { Teacher } from '../../src/data/mockTeachers';

type TeacherCardProps = {
  teacher: Teacher;
};

export default function TeacherCard({ teacher }: TeacherCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/teachers/${teacher.id}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-center mb-4">
          <img
            src={teacher.avatar || 'https://via.placeholder.com/150'}
            alt={teacher.name}
            className="h-16 w-16 rounded-full mr-4 object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {teacher.name}
            </h3>
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(teacher.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1 text-sm text-gray-600">
                {teacher.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">{teacher.location}</span>
            <span className="text-indigo-600 font-bold">
              ${teacher.hourlyRate}/hr
            </span>
          </div>

          <div className="flex flex-wrap">
            {teacher.subjects?.slice(0, 3).map((subject) => (
              <span
                key={subject}
                className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded mr-2 mb-2"
              >
                {subject}
              </span>
            ))}
            {teacher.subjects?.length > 3 && (
              <span className="text-xs text-gray-500 flex items-center">
                +{teacher.subjects.length - 3} more
              </span>
            )}
          </div>
        </div>

        <button
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/teachers/${teacher.id}`);
          }}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
