import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  /**
   * Alert variant/type
   */
  variant?: 'success' | 'error' | 'warning' | 'info';
  /**
   * Alert title
   */
  title?: string;
  /**
   * Alert message content
   */
  children: React.ReactNode;
  /**
   * Whether the alert can be dismissed
   */
  dismissible?: boolean;
  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to show the icon
   */
  showIcon?: boolean;
}

/**
 * Alert component for displaying notifications and messages
 */
export const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  showIcon = true,
}: AlertProps) => {
  // Base classes for all alerts
  const baseClasses = 'relative rounded-md p-4 border';

  // Variant classes with brand colors
  const variantClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  // Icon mapping
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  // Icon colors
  const iconColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  const IconComponent = icons[variant];

  // Combine all classes
  const alertClasses = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(' ');

  // Animation variants
  const alertVariants = {
    initial: { opacity: 0, y: -10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  return (
    <motion.div
      className={alertClasses}
      variants={alertVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${iconColors[variant]}`} />
          </div>
        )}
        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <motion.button
                type="button"
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  variant === 'success'
                    ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                    : variant === 'error'
                      ? 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                      : variant === 'warning'
                        ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
                        : 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                }`}
                onClick={onDismiss}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Alert;
