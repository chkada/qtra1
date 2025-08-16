import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useReducedMotion } from '../../hooks/useReducedMotion';

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
  const prefersReducedMotion = useReducedMotion();
  
  // Format hourly rate from cents to dollars/currency
  const formattedRate = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(hourlyRateCents / 100);

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    hover: prefersReducedMotion ? {
      boxShadow:
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.15, ease: 'easeOut' }
    } : {
      y: -8,
      scale: 1.02,
      boxShadow:
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.3, ease: 'easeOut' }
    },
  };

  // Image animation variants
  const imageVariants = {
    hover: prefersReducedMotion ? {
      transition: { duration: 0.1 }
    } : {
      scale: 1.1,
      transition: { duration: 0.3 }
    }
  };

  // Tag animation variants
  const tagVariants = {
    hover: prefersReducedMotion ? {
      backgroundColor: 'rgba(255, 193, 7, 0.3)',
      transition: { duration: 0.1 }
    } : {
      scale: 1.05,
      backgroundColor: 'rgba(255, 193, 7, 0.3)',
      transition: { duration: 0.2 }
    }
  };

  // Price animation variants
  const priceVariants = {
    hover: prefersReducedMotion ? {
      color: '#f97316',
      transition: { duration: 0.1 }
    } : {
      scale: 1.05,
      color: '#f97316',
      transition: { duration: 0.2 }
    }
  };

  // View profile animation variants
  const viewProfileVariants = {
    hover: prefersReducedMotion ? {
      x: 2,
      transition: { duration: 0.1 }
    } : {
      x: 5,
      scale: 1.05,
      transition: { duration: 0.2 }
    }
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
            <motion.div 
              className="relative w-16 h-16 rounded-full overflow-hidden bg-warm-beige mr-4 flex-shrink-0"
              variants={imageVariants}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-warm-beige text-aguirre-sky text-xl font-bold">
                  {displayName?.charAt(0) || '?'}
                </div>
              )}
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
              <p className="text-sm text-gray-600">
                {location}, {country}
              </p>
            </div>
          </div>

          {variant === 'default' && (
            <>
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Specialties
                </h4>
                <div className="flex flex-wrap gap-1">
                  {(specialties || []).map((specialty, index) => (
                    <motion.span
                      key={index}
                      className="inline-block bg-golden-glow/20 text-gray-800 rounded-full px-2 py-0.5 text-xs cursor-pointer"
                      variants={tagVariants}
                      whileHover="hover"
                    >
                      {specialty}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Languages
                </h4>
                <div className="flex flex-wrap gap-1">
                  {(languages || []).map((language, index) => (
                    <motion.span
                      key={index}
                      className="inline-block bg-aguirre-sky/10 text-aguirre-sky rounded-full px-2 py-0.5 text-xs cursor-pointer"
                      variants={tagVariants}
                      whileHover="hover"
                    >
                      {language}
                    </motion.span>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
            <motion.span 
              className="text-lg font-bold text-sunrise-orange"
              variants={priceVariants}
              whileHover="hover"
            >
              {formattedRate}
              <span className="text-sm font-normal">/hour</span>
            </motion.span>
            <motion.span 
              className="text-sm text-aguirre-sky font-medium flex items-center"
              variants={viewProfileVariants}
              whileHover="hover"
            >
              View Profile
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Card;
