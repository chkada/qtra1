import React, { forwardRef, useId } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'size' | keyof MotionProps
  > {
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
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
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
    const prefersReducedMotion = useReducedMotion();
    
    // Generate a unique ID using React's useId hook to prevent hydration issues
    const generatedId = useId();
    const inputId = id || generatedId;

    // Base classes for the input
    const baseClasses =
      'rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-aguirre-sky focus:ring-offset-2';

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
    ]
      .filter(Boolean)
      .join(' ');

    // Animation variants for the input
    const inputVariants = {
      focus: prefersReducedMotion ? {
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        borderColor: "#3b82f6",
        transition: { duration: 0.1 }
      } : { 
        scale: 1.01,
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        borderColor: "#3b82f6",
        transition: { duration: 0.2 }
      },
      blur: { 
        scale: 1,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        transition: { duration: prefersReducedMotion ? 0.1 : 0.2 }
      },
      initial: {
        scale: 1,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }
    };

    // Label animation variants
    const labelVariants = {
      focus: { 
        color: "#3b82f6",
        scale: prefersReducedMotion ? 1 : 1.02,
        transition: { duration: prefersReducedMotion ? 0.1 : 0.2 }
      },
      blur: { 
        color: error ? "#f97316" : "#374151",
        scale: 1,
        transition: { duration: prefersReducedMotion ? 0.1 : 0.2 }
      }
    };

    // Icon animation variants
    const iconVariants = {
      focus: { 
        scale: prefersReducedMotion ? 1 : 1.1, 
        color: "#3b82f6",
        transition: { duration: prefersReducedMotion ? 0.1 : 0.2 }
      },
      blur: { 
        scale: 1, 
        color: "#6b7280",
        transition: { duration: prefersReducedMotion ? 0.1 : 0.2 }
      }
    };

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <motion.label
            htmlFor={inputId}
            className={`block text-sm font-medium mb-1 ${error ? 'text-sunrise-orange' : 'text-gray-700'}`}
            variants={labelVariants}
            initial="blur"
          >
            {label}
          </motion.label>
        )}
        <div className="relative">
          {leftIcon && (
            <motion.div 
              className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500"
              variants={iconVariants}
              initial="blur"
            >
              {leftIcon}
            </motion.div>
          )}
          <motion.input
            id={inputId}
            ref={ref}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${inputId}-helper ${inputId}-error`}
            initial="initial"
            whileFocus="focus"
            animate="blur"
            variants={inputVariants}
            onFocus={(e) => {
              // Trigger label animation on focus
              if (label) {
                const labelElement = document.querySelector(`label[for="${inputId}"]`) as any;
                if (labelElement && labelElement.style) {
                  labelElement.style.color = '#3b82f6';
                  labelElement.style.transform = 'scale(1.02)';
                }
              }
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              // Trigger label animation on blur
              if (label) {
                const labelElement = document.querySelector(`label[for="${inputId}"]`) as any;
                if (labelElement && labelElement.style) {
                  labelElement.style.color = error ? '#f97316' : '#374151';
                  labelElement.style.transform = 'scale(1)';
                }
              }
              props.onBlur?.(e);
            }}
            {...(props as any)}
          />
          {rightIcon && (
            <motion.div 
              className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500"
              variants={iconVariants}
              initial="blur"
            >
              {rightIcon}
            </motion.div>
          )}
        </div>
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-sunrise-orange"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
