import React from 'react';
import { motion } from 'framer-motion';

export interface BadgeProps {
  /**
   * Badge content
   */
  children: React.ReactNode;
  /**
   * Badge variant
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /**
   * Badge size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the badge is rounded
   */
  rounded?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Badge component for displaying status indicators or counts
 */
export const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  className = '',
}: BadgeProps) => {
  // Variant classes
  const variantClasses = {
    primary: 'bg-aguirre-sky text-white',
    secondary: 'bg-gray-200 text-gray-800',
    success: 'bg-green-500 text-white',
    warning: 'bg-golden-glow text-gray-900',
    error: 'bg-sunrise-orange text-white',
    info: 'bg-blue-500 text-white',
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5',
  };

  // Animation variants
  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
  };

  return (
    <motion.span
      className={`
        inline-flex items-center justify-center font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
      `}
      initial="initial"
      animate="animate"
      variants={badgeVariants}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  );
};

export default Badge;