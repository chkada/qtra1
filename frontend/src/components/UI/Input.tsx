import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label for the input
   */
  label?: string;
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Left icon
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon
   */
  rightIcon?: React.ReactNode;
  /**
   * Input size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Full width
   */
  fullWidth?: boolean;
}

/**
 * Input component for forms
 */
export const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    size = 'md',
    fullWidth = false,
    className = '',
    id,
    disabled,
    ...props
  },
  ref
) => {
  // Generate a unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Base classes for the input
  const baseClasses = 'rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-aguirre-sky focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };
  
  // State classes
  const stateClasses = error
    ? 'border-sunrise-orange text-sunrise-orange focus:border-sunrise-orange'
    : 'border-gray-300 text-gray-900 focus:border-aguirre-sky';
  
  // Disabled classes
  const disabledClasses = 'opacity-50 cursor-not-allowed bg-gray-100';
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Icon padding classes
  const iconPaddingClasses = {
    left: leftIcon ? 'pl-10' : '',
    right: rightIcon ? 'pr-10' : '',
  };
  
  // Combine all classes
  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    stateClasses,
    disabled && disabledClasses,
    widthClasses,
    iconPaddingClasses.left,
    iconPaddingClasses.right,
    className,
  ].filter(Boolean).join(' ');
  
  // Animation variants for the input
  const inputVariants = {
    focus: { scale: 1.01 },
    blur: { scale: 1 },
  };
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium mb-1 ${error ? 'text-sunrise-orange' : 'text-gray-700'}`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            {leftIcon}
          </div>
        )}
        <motion.input
          id={inputId}
          ref={ref}
          className={inputClasses}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${inputId}-helper ${inputId}-error`}
          initial="blur"
          whileFocus="focus"
          variants={inputVariants}
          transition={{ duration: 0.2 }}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            {rightIcon}
          </div>
        )}
      </div>
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-sunrise-orange">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;