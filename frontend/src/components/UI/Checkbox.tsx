import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  /**
   * Checkbox label
   */
  label?: string;
  /**
   * Whether the checkbox is checked
   */
  checked?: boolean;
  /**
   * Default checked state
   */
  defaultChecked?: boolean;
  /**
   * Whether the checkbox is disabled
   */
  disabled?: boolean;
  /**
   * Whether the checkbox is required
   */
  required?: boolean;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Error message
   */
  error?: string;
  /**
   * Function called when the checkbox state changes
   */
  onChange?: (checked: boolean) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Name attribute for the input
   */
  name?: string;
  /**
   * Value attribute for the input
   */
  value?: string;
}

/**
 * Checkbox component for boolean input
 */
export const Checkbox = ({
  label,
  checked,
  defaultChecked,
  disabled = false,
  required = false,
  helperText,
  error,
  onChange,
  className = '',
  name,
  value,
}: CheckboxProps) => {
  // Animation variants
  const checkVariants = {
    checked: { scale: 1, opacity: 1 },
    unchecked: { scale: 0, opacity: 0 },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <div className="relative">
            <input
              type="checkbox"
              checked={checked}
              defaultChecked={defaultChecked}
              disabled={disabled}
              required={required}
              onChange={handleChange}
              name={name}
              value={value}
              className="sr-only"
              id={`checkbox-${name || Math.random().toString(36).substr(2, 9)}`}
            />
            <label
              htmlFor={`checkbox-${name || Math.random().toString(36).substr(2, 9)}`}
              className={`
                flex items-center justify-center w-5 h-5 rounded border cursor-pointer
                ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                ${error ? 'border-sunrise-orange' : 'border-gray-300'}
                ${checked || defaultChecked ? 'bg-aguirre-sky border-aguirre-sky' : ''}
              `}
            >
              <motion.div
                initial={checked || defaultChecked ? 'checked' : 'unchecked'}
                animate={checked || defaultChecked ? 'checked' : 'unchecked'}
                variants={checkVariants}
                transition={{ duration: 0.2 }}
              >
                <Check size={14} className="text-white" />
              </motion.div>
            </label>
          </div>
        </div>
        {label && (
          <div className="ml-2 text-sm">
            <label
              htmlFor={`checkbox-${name || Math.random().toString(36).substr(2, 9)}`}
              className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'} cursor-pointer`}
            >
              {label}
              {required && <span className="text-sunrise-orange ml-1">*</span>}
            </label>
          </div>
        )}
      </div>
      {(helperText || error) && (
        <p
          className={`mt-1 text-sm ${error ? 'text-sunrise-orange' : 'text-gray-500'} ml-7`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Checkbox;
