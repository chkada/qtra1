import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export interface CardProps {
  /**
   * Teacher ID
   */
  id: string;
  /**
   * Teacher display name
   */
  displayName: string;
  /**
   * Teacher location
   */
  location: string;
  /**
   * Teacher country
   */
  country: string;
  /**
   * Teacher specialties
   */
  specialties: string[];
  /**
   * Teacher languages
   */
  languages: string[];
  /**
   * Teacher hourly rate in cents
   */
  hourlyRateCents: number;
  /**
   * Teacher profile image URL
   */
  imageUrl?: string;
  /**
   * Card variant
   */
  variant?: 'default' | 'compact';
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Card component for teacher profiles
 */
export const Card = ({
  id,
  displayName,
  location,
  country,
  specialties,
  languages,
  hourlyRateCents,
  imageUrl,
  variant = 'default',
  className = '',
}: CardProps) => {
  // Format hourly rate from cents to dollars/currency
  const formattedRate = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(hourlyRateCents / 100);

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
  };

  return (
    <motion.div
      className={`bg-white rounded-lg overflow-hidden border border-gray-200 ${className}`}
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={cardVariants}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/teacher/${id}`} className="block h-full">
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-warm-beige mr-4 flex-shrink-0">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-warm-beige text-aguirre-sky text-xl font-bold">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
              <p className="text-sm text-gray-600">{location}, {country}</p>
            </div>
          </div>

          {variant === 'default' && (
            <>
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Specialties</h4>
                <div className="flex flex-wrap gap-1">
                  {specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-block bg-golden-glow/20 text-gray-800 rounded-full px-2 py-0.5 text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Languages</h4>
                <div className="flex flex-wrap gap-1">
                  {languages.map((language, index) => (
                    <span
                      key={index}
                      className="inline-block bg-aguirre-sky/10 text-aguirre-sky rounded-full px-2 py-0.5 text-xs"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-lg font-bold text-sunrise-orange">
              {formattedRate}<span className="text-sm font-normal">/hour</span>
            </span>
            <span className="text-sm text-aguirre-sky font-medium">View Profile</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Card;