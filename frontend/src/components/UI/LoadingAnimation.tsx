import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface LoadingAnimationProps {
  /**
   * Type of loading animation
   */
  type?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'skeleton';
  /**
   * Size of the loading animation
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Color of the loading animation
   */
  color?: 'primary' | 'secondary' | 'gray';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Loading text to display
   */
  text?: string;
}

/**
 * Loading animation component with various styles
 */
export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  className = '',
  text,
}) => {
  const shouldReduceMotion = useReducedMotion();
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Color classes
  const colorClasses = {
    primary: 'text-aguirre-sky',
    secondary: 'text-golden-glow',
    gray: 'text-gray-500',
  };

  // Spinner animation
  const SpinnerAnimation = () => (
    <motion.div
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      animate={shouldReduceMotion ? {} : { rotate: 360 }}
      transition={shouldReduceMotion ? {} : {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <svg
        className="w-full h-full"
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
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );

  // Dots animation
  const DotsAnimation = () => {
    const dotVariants = {
      initial: { y: 0 },
      animate: { y: -10 },
    };

    const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4';

    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`${dotSize} ${colorClasses[color]} bg-current rounded-full`}
            variants={dotVariants}
            initial="initial"
            animate={shouldReduceMotion ? "initial" : "animate"}
            transition={shouldReduceMotion ? {} : {
              duration: 0.6,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
    );
  };

  // Pulse animation
  const PulseAnimation = () => (
    <motion.div
      className={`${sizeClasses[size]} ${colorClasses[color]} bg-current rounded-full ${className}`}
      animate={shouldReduceMotion ? {} : {
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={shouldReduceMotion ? {} : {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );

  // Bars animation
  const BarsAnimation = () => {
    const barHeight = size === 'sm' ? 'h-4' : size === 'md' ? 'h-8' : 'h-12';
    const barWidth = size === 'sm' ? 'w-1' : size === 'md' ? 'w-2' : 'w-3';

    return (
      <div className={`flex items-end space-x-1 ${className}`}>
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className={`${barWidth} ${colorClasses[color]} bg-current`}
            animate={shouldReduceMotion ? {} : {
              height: [
                size === 'sm' ? 8 : size === 'md' ? 16 : 24,
                size === 'sm' ? 16 : size === 'md' ? 32 : 48,
                size === 'sm' ? 8 : size === 'md' ? 16 : 24,
              ],
            }}
            transition={shouldReduceMotion ? {} : {
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  };

  // Skeleton animation
  const SkeletonAnimation = () => (
    <div className={`space-y-3 ${className}`}>
      <motion.div
        className="h-4 bg-gray-300 rounded"
        animate={shouldReduceMotion ? {} : {
          opacity: [0.5, 1, 0.5],
        }}
        transition={shouldReduceMotion ? {} : {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="h-4 bg-gray-300 rounded w-3/4"
        animate={shouldReduceMotion ? {} : {
          opacity: [0.5, 1, 0.5],
        }}
        transition={shouldReduceMotion ? {} : {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        }}
      />
      <motion.div
        className="h-4 bg-gray-300 rounded w-1/2"
        animate={shouldReduceMotion ? {} : {
          opacity: [0.5, 1, 0.5],
        }}
        transition={shouldReduceMotion ? {} : {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.4,
        }}
      />
    </div>
  );

  // Render the appropriate animation
  const renderAnimation = () => {
    switch (type) {
      case 'dots':
        return <DotsAnimation />;
      case 'pulse':
        return <PulseAnimation />;
      case 'bars':
        return <BarsAnimation />;
      case 'skeleton':
        return <SkeletonAnimation />;
      default:
        return <SpinnerAnimation />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderAnimation()}
      {text && (
        <motion.p
          className={`text-sm ${colorClasses[color]} font-medium`}
          animate={shouldReduceMotion ? {} : {
            opacity: [0.5, 1, 0.5],
          }}
          transition={shouldReduceMotion ? {} : {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingAnimation;