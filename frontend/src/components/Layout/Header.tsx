import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, LogOut, Settings, BookOpen } from 'lucide-react';
import { Navigation, NavigationItem } from '../UI/Navigation';
import { Button } from '../UI/Button';

export interface HeaderProps {
  /**
   * Whether user is authenticated
   */
  isAuthenticated?: boolean;
  /**
   * User information
   */
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: 'student' | 'teacher' | 'admin';
  };
  /**
   * Logo URL or component
   */
  logo?: React.ReactNode | string;
  /**
   * Navigation items
   */
  navigationItems?: NavigationItem[];
  /**
   * Login handler
   */
  onLogin?: () => void;
  /**
   * Logout handler
   */
  onLogout?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Header component with navigation and user menu
 */
export const Header = ({
  isAuthenticated = false,
  user,
  logo,
  navigationItems = [],
  onLogin,
  onLogout,
  className = '',
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Default navigation items if none provided
  const defaultNavItems: NavigationItem[] = [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Find Teachers',
      href: '/teachers',
    },
    {
      label: 'About',
      href: '/about',
    },
    {
      label: 'Contact',
      href: '/contact',
    },
  ];

  const navItems =
    navigationItems.length > 0 ? navigationItems : defaultNavItems;

  // User menu items
  const userMenuItems = [
    {
      label: 'Profile',
      href: '/profile',
      icon: <User className="w-4 h-4" />,
    },
    {
      label: 'My Bookings',
      href: '/bookings',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  // Add teacher-specific menu items
  if (user?.role === 'teacher') {
    userMenuItems.splice(1, 0, {
      label: 'Teacher Dashboard',
      href: '/dashboard',
      icon: <BookOpen className="w-4 h-4" />,
    });
  }

  const handleMobileToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header
      className={`bg-white shadow-sm border-b border-gray-200 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              {typeof logo === 'string' ? (
                <img className="h-8 w-auto" src={logo} alt="Qindil" />
              ) : logo ? (
                logo
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-aguirre-sky rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Q</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    Qindil
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Navigation
              items={navItems}
              showMobileToggle={false}
              className="flex items-center space-x-1"
            />
          </div>

          {/* Right side - Auth buttons or User menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              /* User Menu */
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:text-aguirre-sky hover:bg-aguirre-sky/5 transition-colors"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  {user.avatar ? (
                    <img
                      className="w-8 h-8 rounded-full"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-aguirre-sky rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium">
                    {user.name}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    {userMenuItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-aguirre-sky/5 hover:text-aguirre-sky transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ))}

                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center space-x-2">
                <Button
                  variant="text"
                  size="sm"
                  onClick={onLogin}
                  className="hidden md:inline-flex"
                >
                  Sign in
                </Button>
                <Button variant="primary" size="sm" onClick={onLogin}>
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Navigation
              items={navItems}
              showMobileToggle={true}
              isMobileOpen={isMobileMenuOpen}
              onMobileToggle={handleMobileToggle}
              className="md:hidden"
              mobileClassName="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
