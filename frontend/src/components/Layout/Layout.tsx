import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header, HeaderProps } from './Header';
import { Footer, FooterProps } from './Footer';
import { Alert } from '../UI/Alert';
import { Loading } from '../UI/Loading';
import { Sidebar, SidebarProps } from '../UI/Sidebar';

export interface LayoutProps {
  /**
   * Page content
   */
  children: React.ReactNode;
  /**
   * Header configuration
   */
  header?: Partial<HeaderProps>;
  /**
   * Footer configuration
   */
  footer?: Partial<FooterProps>;
  /**
   * Page title for SEO
   */
  title?: string;
  /**
   * Page description for SEO
   */
  description?: string;
  /**
   * Show loading overlay
   */
  isLoading?: boolean;
  /**
   * Loading message
   */
  loadingMessage?: string;
  /**
   * Global alerts/notifications
   */
  alerts?: {
    id: string;
    variant: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    content: string;
    dismissible?: boolean;
    onDismiss?: () => void;
  }[];
  /**
   * Layout variant
   */
  variant?: 'default' | 'centered' | 'full-width' | 'sidebar';
  /**
   * Hide header
   */
  hideHeader?: boolean;
  /**
   * Hide footer
   */
  hideFooter?: boolean;
  /**
   * Additional CSS classes for main content
   */
  className?: string;
  /**
   * Additional CSS classes for the container
   */
  containerClassName?: string;
  /**
   * Sidebar configuration (only used with sidebar variant)
   */
  sidebar?: Partial<SidebarProps>;
  /**
   * Whether sidebar is open on mobile (only used with sidebar variant)
   */
  sidebarOpen?: boolean;
  /**
   * Callback when sidebar is closed on mobile (only used with sidebar variant)
   */
  onSidebarClose?: () => void;
}

/**
 * Main layout wrapper component
 */
export const Layout = ({
  children,
  header = {},
  footer = {},
  title,
  description,
  isLoading = false,
  loadingMessage = 'Loading...',
  alerts = [],
  variant = 'default',
  hideHeader = false,
  hideFooter = false,
  className = '',
  containerClassName = '',
  sidebar = {},
  sidebarOpen = false,
  onSidebarClose,
}: LayoutProps) => {
  // Set document title
  React.useEffect(() => {
    if (title) {
      document.title = title.includes('Qindil') ? title : `${title} | Qindil`;
    }
  }, [title]);

  // Set meta description
  React.useEffect(() => {
    if (description) {
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }
    }
  }, [description]);

  // Layout variants
  const getLayoutClasses = () => {
    const baseClasses = 'min-h-screen flex flex-col';

    switch (variant) {
      case 'centered':
        return `${baseClasses} items-center justify-center`;
      case 'full-width':
        return `${baseClasses} w-full`;
      case 'sidebar':
        return `${baseClasses} lg:flex-row`;
      default:
        return baseClasses;
    }
  };

  const getMainClasses = () => {
    const baseClasses = 'flex-1';

    switch (variant) {
      case 'centered':
        return `${baseClasses} flex items-center justify-center p-4`;
      case 'full-width':
        return `${baseClasses} w-full`;
      case 'sidebar':
        return `${baseClasses} lg:flex-1`;
      default:
        return `${baseClasses} flex flex-col`;
    }
  };

  const getContentClasses = () => {
    if (variant === 'full-width') {
      return 'w-full';
    }
    if (variant === 'centered') {
      return 'w-full max-w-md';
    }
    return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8';
  };

  return (
    <div className={`${getLayoutClasses()} ${containerClassName}`}>
      {/* Global Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <Loading size="lg" variant="spinner" color="primary" />
              <p className="mt-4 text-gray-600 font-medium">{loadingMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 100, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  variant={alert.variant}
                  title={alert.title}
                  content={alert.content}
                  dismissible={alert.dismissible}
                  onDismiss={alert.onDismiss}
                  showIcon
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      {!hideHeader && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Header {...header} />
        </motion.div>
      )}

      {/* Sidebar Layout */}
      {variant === 'sidebar' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block"
          >
            <Sidebar
              {...sidebar}
              className="h-full border-r border-gray-200"
            />
          </motion.div>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={onSidebarClose}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 z-50 lg:hidden"
                >
                  <Sidebar
                    {...sidebar}
                    isOpen={sidebarOpen}
                    onClose={onSidebarClose}
                    className="h-full bg-white shadow-xl"
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className={`flex-1 overflow-auto ${className}`}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={getContentClasses()}
            >
              {children}
            </motion.div>
          </main>
        </div>
      ) : (
        /* Regular Layout */
        <main className={`${getMainClasses()} ${className}`}>
          {variant === 'default' ? (
            <div className={getContentClasses()}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {children}
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={getContentClasses()}
            >
              {children}
            </motion.div>
          )}
        </main>
      )}

      {/* Footer */}
      {!hideFooter && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Footer {...footer} />
        </motion.div>
      )}
    </div>
  );
};

/**
 * Layout component with authentication context
 */
export const AuthenticatedLayout = ({
  children,
  user,
  onLogout,
  ...props
}: LayoutProps & {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: 'student' | 'teacher' | 'admin';
  };
  onLogout?: () => void;
}) => {
  return (
    <Layout
      {...props}
      header={{
        isAuthenticated: true,
        user,
        onLogout,
        ...props.header,
      }}
    >
      {children}
    </Layout>
  );
};

/**
 * Layout component for guest/unauthenticated users
 */
export const GuestLayout = ({
  children,
  onLogin,
  ...props
}: LayoutProps & {
  onLogin?: () => void;
}) => {
  return (
    <Layout
      {...props}
      header={{
        isAuthenticated: false,
        onLogin,
        ...props.header,
      }}
    >
      {children}
    </Layout>
  );
};

/**
 * Minimal layout for auth pages (login, register, etc.)
 */
export const AuthLayout = ({
  children,
  ...props
}: Omit<LayoutProps, 'variant'>) => {
  return (
    <Layout
      {...props}
      variant="centered"
      hideHeader
      hideFooter
      containerClassName="bg-gradient-to-br from-aguirre-sky/5 to-golden-glow/5"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {children}
      </motion.div>
    </Layout>
  );
};

export default Layout;
