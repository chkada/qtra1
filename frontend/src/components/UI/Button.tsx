import React from 'react';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Is the button in a loading state
   */
  isLoading?: boolean;
  /**
   * Icon to display before the button text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display after the button text
   */
  rightIcon?: React.ReactNode;
  /**
   * Button content
   */
  children: React.ReactNode;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  // Base classes for all buttons
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-aguirre-sky focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-aguirre-sky text-white hover:bg-aguirre-sky/90 active:bg-aguirre-sky/80',
    secondary: 'bg-golden-glow text-gray-900 hover:bg-golden-glow/90 active:bg-golden-glow/80',
    outline: 'border border-aguirre-sky text-aguirre-sky hover:bg-aguirre-sky/10 active:bg-aguirre-sky/20',
    text: 'text-aguirre-sky hover:bg-aguirre-sky/10 active:bg-aguirre-sky/20',
  };
  
  // Disabled classes
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  // Loading classes
  const loadingClasses = 'relative text-transparent transition-none hover:text-transparent';
  
  // Combine all classes
  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    isLoading && loadingClasses,
    (disabled || isLoading) && disabledClasses,
    className,
  ].filter(Boolean).join(' ');
  
  // Animation variants for the button
  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };
  
  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || isLoading}
      whileHover={!(disabled || isLoading) ? 'hover' : undefined}
      whileTap={!(disabled || isLoading) ? 'tap' : undefined}
      variants={buttonVariants}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;