import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface AnimatedLinkProps {
  /**
   * Link destination
   */
  href: string;
  /**
   * Link content
   */
  children: React.ReactNode;
  /**
   * Link variant
   */
  variant?: 'default' | 'underline' | 'button' | 'subtle';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * External link (opens in new tab)
   */
  external?: boolean;
  /**
   * Disabled state
   */
  disabled?: boolean;
}

/**
 * Animated link component with hover effects
 */
export const AnimatedLink: React.FC<AnimatedLinkProps> = ({
  href,
  children,
  variant = 'default',
  className = '',
  external = false,
  disabled = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  // Base animation variants
  const linkVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  // Underline animation variants
  const underlineVariants = {
    initial: { scaleX: 0, originX: 0 },
    hover: {
      scaleX: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  // Button animation variants
  const buttonVariants = {
    initial: {
      scale: 1,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    hover: {
      scale: 1.02,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      y: -2,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: {
      scale: 0.98,
      y: 0,
      transition: { duration: 0.1 }
    }
  };

  // Subtle animation variants
  const subtleVariants = {
    initial: { opacity: 0.8 },
    hover: {
      opacity: 1,
      x: 3,
      transition: { duration: 0.2 }
    }
  };

  // Get variant styles and animations
  const getVariantConfig = () => {
    switch (variant) {
      case 'underline':
        return {
          variants: linkVariants,
          className: `relative inline-block text-aguirre-sky hover:text-aguirre-sky/80 transition-colors ${className}`,
          showUnderline: true
        };
      case 'button':
        return {
          variants: buttonVariants,
          className: `inline-flex items-center justify-center px-4 py-2 bg-aguirre-sky text-white rounded-md font-medium hover:bg-aguirre-sky/90 transition-colors ${className}`,
          showUnderline: false
        };
      case 'subtle':
        return {
          variants: subtleVariants,
          className: `inline-flex items-center text-gray-600 hover:text-aguirre-sky transition-colors ${className}`,
          showUnderline: false
        };
      default:
        return {
          variants: linkVariants,
          className: `inline-block text-aguirre-sky hover:text-aguirre-sky/80 transition-colors ${className}`,
          showUnderline: false
        };
    }
  };

  const { variants, className: variantClassName, showUnderline } = getVariantConfig();

  // Disabled styles
  const disabledClassName = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : '';

  const finalClassName = `${variantClassName} ${disabledClassName}`.trim();

  // External link props
  const externalProps = external
    ? {
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    : {};

  const linkContent = (
    <motion.span
      className={finalClassName}
      variants={prefersReducedMotion ? {} : variants}
      initial={prefersReducedMotion ? false : "initial"}
      whileHover={!disabled && !prefersReducedMotion ? 'hover' : undefined}
      whileTap={!disabled && !prefersReducedMotion ? 'tap' : undefined}
    >
      {children}
      {showUnderline && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-current"
          variants={prefersReducedMotion ? {} : underlineVariants}
          initial={prefersReducedMotion ? false : "initial"}
        />
      )}
    </motion.span>
  );

  if (external) {
    return (
      <a href={href} {...externalProps}>
        {linkContent}
      </a>
    );
  }

  return (
    <Link href={href}>
      {linkContent}
    </Link>
  );
};

export default AnimatedLink;