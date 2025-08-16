import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export interface NavigationItem {
  /**
   * Navigation item label
   */
  label: string;
  /**
   * Navigation item href
   */
  href?: string;
  /**
   * Click handler for navigation item
   */
  onClick?: () => void;
  /**
   * Whether the item is active
   */
  active?: boolean;
  /**
   * Sub-navigation items
   */
  children?: NavigationItem[];
  /**
   * Whether the item is disabled
   */
  disabled?: boolean;
}

export interface NavigationProps {
  /**
   * Navigation items
   */
  items: NavigationItem[];
  /**
   * Whether to show mobile menu toggle
   */
  showMobileToggle?: boolean;
  /**
   * Mobile menu open state
   */
  isMobileOpen?: boolean;
  /**
   * Mobile menu toggle handler
   */
  onMobileToggle?: () => void;
  /**
   * Navigation orientation
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Mobile menu className
   */
  mobileClassName?: string;
}

/**
 * Responsive navigation menu component
 */
export const Navigation = ({
  items,
  showMobileToggle = true,
  isMobileOpen = false,
  onMobileToggle,
  orientation = 'horizontal',
  className = '',
  mobileClassName = '',
}: NavigationProps) => {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const toggleDropdown = (label: string) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(label)) {
      newOpenDropdowns.delete(label);
    } else {
      newOpenDropdowns.add(label);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.onClick) {
      item.onClick();
    }
    // Close mobile menu when item is clicked
    if (onMobileToggle && isMobileOpen) {
      onMobileToggle();
    }
  };

  // Desktop navigation item component
  const DesktopNavItem = ({ item }: { item: NavigationItem }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openDropdowns.has(item.label);

    if (hasChildren) {
      return (
        <div className="relative group">
          <button
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              item.active
                ? 'text-aguirre-sky bg-aguirre-sky/10'
                : 'text-gray-700 hover:text-aguirre-sky hover:bg-aguirre-sky/5'
            } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !item.disabled && toggleDropdown(item.label)}
            disabled={item.disabled}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <span>{item.label}</span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
              >
                {item.children?.map((child, index) => (
                  <DesktopNavItem key={index} item={child} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    const content = (
      <span
        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          item.active
            ? 'text-aguirre-sky bg-aguirre-sky/10'
            : 'text-gray-700 hover:text-aguirre-sky hover:bg-aguirre-sky/5'
        } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !item.disabled && handleItemClick(item)}
      >
        {item.label}
      </span>
    );

    if (item.href && !item.disabled) {
      return (
        <Link href={item.href} className="block">
          {content}
        </Link>
      );
    }

    return (
      <button className="block w-full text-left" disabled={item.disabled}>
        {content}
      </button>
    );
  };

  // Mobile navigation item component
  const MobileNavItem = ({ item }: { item: NavigationItem }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openDropdowns.has(item.label);

    if (hasChildren) {
      return (
        <div>
          <button
            className={`flex items-center justify-between w-full px-3 py-2 text-base font-medium transition-colors ${
              item.active
                ? 'text-aguirre-sky bg-aguirre-sky/10'
                : 'text-gray-700 hover:text-aguirre-sky hover:bg-aguirre-sky/5'
            } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !item.disabled && toggleDropdown(item.label)}
            disabled={item.disabled}
            aria-expanded={isOpen}
          >
            <span>{item.label}</span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden bg-gray-50 border-l-2 border-aguirre-sky/20 ml-3"
              >
                {item.children?.map((child, index) => (
                  <div key={index} className="pl-4">
                    <MobileNavItem item={child} />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    const content = (
      <span
        className={`block px-3 py-2 text-base font-medium transition-colors ${
          item.active
            ? 'text-aguirre-sky bg-aguirre-sky/10'
            : 'text-gray-700 hover:text-aguirre-sky hover:bg-aguirre-sky/5'
        } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !item.disabled && handleItemClick(item)}
      >
        {item.label}
      </span>
    );

    if (item.href && !item.disabled) {
      return (
        <Link href={item.href} className="block">
          {content}
        </Link>
      );
    }

    return (
      <button className="block w-full text-left" disabled={item.disabled}>
        {content}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={`hidden md:flex ${
          orientation === 'vertical'
            ? 'flex-col space-y-1'
            : 'items-center space-x-1'
        } ${className}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {items.map((item, index) => (
          <DesktopNavItem key={index} item={item} />
        ))}
      </nav>

      {/* Mobile Menu Toggle */}
      {showMobileToggle && (
        <button
          className="md:hidden p-2 rounded-md text-gray-700 hover:text-aguirre-sky hover:bg-aguirre-sky/5 transition-colors"
          onClick={onMobileToggle}
          aria-expanded={isMobileOpen}
          aria-label="Toggle mobile menu"
        >
          <motion.div
            animate={{ rotate: isMobileOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isMobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.div>
        </button>
      )}

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden overflow-hidden bg-white border-t border-gray-200 ${mobileClassName}`}
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {items.map((item, index) => (
                <MobileNavItem key={index} item={item} />
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
