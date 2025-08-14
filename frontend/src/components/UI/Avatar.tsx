import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface AvatarProps {
  /**
   * Image source URL
   */
  src?: string;
  /**
   * Alt text for the image
   */
  alt: string;
  /**
   * Size of the avatar
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Whether to show a status indicator
   */
  status?: 'online' | 'offline' | 'busy' | 'away' | 'none';
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Avatar component for displaying user profile images
 */
export const Avatar = ({
  src,
  alt,
  size = 'md',
  status = 'none',
  className = '',
}: AvatarProps) => {
  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  // Status indicator colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-sunrise-orange',
    away: 'bg-yellow-400',
    none: 'hidden',
  };

  // Status indicator sizes
  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  // Animation variants
  const avatarVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.05 },
  };

  return (
    <motion.div
      className={`relative inline-block ${sizeClasses[size]} ${className}`}
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={avatarVariants}
      transition={{ duration: 0.2 }}
    >
      <div className="relative w-full h-full rounded-full overflow-hidden bg-warm-beige">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-warm-beige text-aguirre-sky font-bold">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {status !== 'none' && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white ${statusColors[status]} ${statusSizes[size]}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </motion.div>
  );
};

export default Avatar;