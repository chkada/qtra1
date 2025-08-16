import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingProps {
  /**
   * Loading spinner variant
   */
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  /**
   * Size of the loading indicator
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Color theme
   */
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  /**
   * Loading text to display
   */
  text?: string;
  /**
   * Whether to center the loading indicator
   */
  centered?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Loading component with various spinner animations
 */
export const Loading = ({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  centered = false,
  className = '',
}: LoadingProps) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  // Color classes
  const colorClasses = {
    primary: 'text-aguirre-sky',
    secondary: 'text-golden-glow',
    white: 'text-white',
    gray: 'text-gray-500',
  };

  // Text size classes
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  // Container classes
  const containerClasses = [
    'flex items-center',
    centered ? 'justify-center' : '',
    text ? 'flex-col space-y-2' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Spinner component
  const SpinnerVariant = () => (
    <motion.svg
      className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );

  // Dots component
  const DotsVariant = () => {
    const dotSize = {
      sm: 'w-1 h-1',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    };

    return (
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`${dotSize[size]} ${colorClasses[color]} bg-current rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
    );
  };

  // Pulse component
  const PulseVariant = () => (
    <motion.div
      className={`${sizeClasses[size]} ${colorClasses[color]} bg-current rounded-full`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
      }}
    />
  );

  // Bars component
  const BarsVariant = () => {
    const barHeight = {
      sm: 'h-3',
      md: 'h-4',
      lg: 'h-6',
      xl: 'h-8',
    };

    const barWidth = {
      sm: 'w-0.5',
      md: 'w-1',
      lg: 'w-1.5',
      xl: 'w-2',
    };

    return (
      <div className="flex items-end space-x-1">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className={`${barWidth[size]} ${barHeight[size]} ${colorClasses[color]} bg-current`}
            animate={{
              scaleY: [1, 0.3, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.1,
            }}
          />
        ))}
      </div>
    );
  };

  // Render the appropriate variant
  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant />;
      case 'pulse':
        return <PulseVariant />;
      case 'bars':
        return <BarsVariant />;
      default:
        return <SpinnerVariant />;
    }
  };

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      {renderVariant()}
      {text && (
        <span
          className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium`}
        >
          {text}
        </span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;
