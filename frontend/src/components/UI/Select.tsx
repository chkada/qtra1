import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /**
   * Options for the select
   */
  options: SelectOption[];
  /**
   * Selected value
   */
  value?: string;
  /**
   * Default value
   */
  defaultValue?: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Label for the select
   */
  label?: string;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Error message
   */
  error?: string;
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * Whether the select is required
   */
  required?: boolean;
  /**
   * Whether the select should take up the full width
   */
  fullWidth?: boolean;
  /**
   * Size of the select
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Function called when the value changes
   */
  onChange?: (value: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Select component for selecting from a list of options
 */
export const Select = ({
  options,
  value,
  defaultValue,
  placeholder = 'Select an option',
  label,
  helperText,
  error,
  disabled = false,
  required = false,
  fullWidth = false,
  size = 'md',
  onChange,
  className = '',
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
  const selectRef = useRef<HTMLDivElement>(null);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: SelectOption) => {
    setSelectedValue(option.value);
    setIsOpen(false);
    onChange?.(option.value);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Get the selected option label
  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Size classes
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  };

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-sunrise-orange ml-1">*</span>}
        </label>
      )}

      <div
        ref={selectRef}
        className={`relative ${fullWidth ? 'w-full' : 'w-auto'}`}
      >
        <div
          className={`
            flex items-center justify-between px-3 bg-white border rounded-md cursor-pointer
            ${sizeClasses[size]}
            ${error ? 'border-sunrise-orange' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'hover:border-aguirre-sky'}
            ${isOpen ? 'border-aguirre-sky ring-1 ring-aguirre-sky' : ''}
          `}
          onClick={toggleDropdown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? 'select-label' : undefined}
          role="combobox"
        >
          <span
            className={`block truncate ${!selectedValue ? 'text-gray-500' : 'text-gray-900'}`}
          >
            {displayText}
          </span>
          <ChevronDown
            size={size === 'sm' ? 16 : 20}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={dropdownVariants}
              transition={{ duration: 0.2 }}
              role="listbox"
            >
              {options.map((option) => (
                <li
                  key={option.value}
                  className={`
                    px-3 py-2 cursor-pointer flex items-center justify-between
                    ${option.value === selectedValue ? 'bg-aguirre-sky/10 text-aguirre-sky' : 'text-gray-900 hover:bg-gray-100'}
                  `}
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={option.value === selectedValue}
                >
                  <span>{option.label}</span>
                  {option.value === selectedValue && (
                    <Check size={size === 'sm' ? 16 : 20} className="text-aguirre-sky" />
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {(helperText || error) && (
        <p className={`mt-1 text-sm ${error ? 'text-sunrise-orange' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Select;