import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, BookOpen, Globe } from 'lucide-react';
import Card from '../UI/Card';
import Badge from '../UI/Badge';
import Button from '../UI/Button';
import { Teacher } from '../../data/mockTeachers';

export interface TeacherCardProps {
  /**
   * Teacher data to display
   */
  teacher: Teacher;
  /**
   * Additional class names to apply to the card
   */
  className?: string;
  /**
   * Whether to show the full teacher bio
   */
  showFullBio?: boolean;
  /**
   * Whether to highlight this card as featured
   */
  featured?: boolean;
  /**
   * Callback for when the book button is clicked
   */
  onBookNow?: (teacherId: string) => void;
}

/**
 * Card component to display teacher information
 */
export const TeacherCard = ({
  teacher,
  className = '',
  showFullBio = false,
  featured = false,
  onBookNow,
}: TeacherCardProps) => {
  // Truncate bio if not showing full bio
  const displayBio = showFullBio
    ? teacher.bio
    : teacher.bio.length > 120
      ? `${teacher.bio.substring(0, 120)}...`
      : teacher.bio;

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: {
      y: -5,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      className={`h-full ${className}`}
    >
      <Card
        className={`h-full flex flex-col ${featured ? 'border-primary-500 dark:border-primary-400' : ''}`}
      >
        {/* Featured badge */}
        {(featured || teacher.featured) && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge color="primary" className="shadow-md">
              Featured
            </Badge>
          </div>
        )}

        {/* Teacher header with avatar and basic info */}
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
            <Image
              src={teacher.avatar}
              alt={teacher.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{teacher.name}</h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin size={14} className="mr-1" />
              <span>{teacher.location}</span>
            </div>
            <div className="flex items-center mt-1">
              <div className="flex items-center text-yellow-500">
                <Star size={16} className="fill-current" />
                <span className="ml-1 font-medium">{teacher.rating}</span>
              </div>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {teacher.reviewCount} reviews
              </span>
            </div>
          </div>
        </div>

        {/* Teacher details */}
        <div className="flex-grow p-4">
          {/* Subjects */}
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <BookOpen
                size={16}
                className="mr-2 text-primary-600 dark:text-primary-400"
              />
              <span className="font-medium">Subjects</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {teacher.subjects.map((subject) => (
                <Badge key={subject} color="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <Globe
                size={16}
                className="mr-2 text-primary-600 dark:text-primary-400"
              />
              <span className="font-medium">Languages</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {teacher.languages.map((language) => (
                <span
                  key={language}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Clock
                size={16}
                className="mr-2 text-primary-600 dark:text-primary-400"
              />
              <span className="font-medium">Availability</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>{teacher.availability.days.join(', ')}</div>
              <div>{teacher.availability.hours.join(' | ')}</div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {displayBio}
          </p>
        </div>

        {/* Footer with price and action buttons */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {teacher.currency} {teacher.hourlyRate}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {' '}
                / hour
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium">{teacher.experience} years</span>{' '}
              <span className="text-gray-600 dark:text-gray-400">
                experience
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => onBookNow && onBookNow(teacher.id)}
            >
              Book Now
            </Button>
            <Link href={`/teachers/${teacher.id}`} className="flex-1">
              <Button variant="secondary" className="w-full">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default TeacherCard;
