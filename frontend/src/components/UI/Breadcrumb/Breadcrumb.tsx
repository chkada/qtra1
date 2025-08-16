import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface BreadcrumbItem {
  /** Unique identifier for the breadcrumb item */
  id: string;
  /** Display label for the breadcrumb item */
  label: string;
  /** URL or path for navigation */
  href?: string;
  /** Whether this item is the current page (non-clickable) */
  current?: boolean;
  /** Icon component to display before the label */
  icon?: React.ComponentType<{ className?: string }>;
  /** Additional data for custom handling */
  data?: Record<string, any>;
}

export interface BreadcrumbProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Custom separator between breadcrumb items */
  separator?: React.ReactNode;
  /** Whether to show home icon for the first item */
  showHomeIcon?: boolean;
  /** Maximum number of items to show before collapsing */
  maxItems?: number;
  /** Custom click handler for breadcrumb items */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  /** Custom className for styling */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show on mobile devices */
  showOnMobile?: boolean;
  /** Custom aria-label for accessibility */
  ariaLabel?: string;
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const iconSizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  showHomeIcon = true,
  maxItems = 5,
  onItemClick,
  className,
  size = 'md',
  showOnMobile = true,
  ariaLabel = 'Breadcrumb navigation',
}) => {
  // Handle collapsed items when there are too many
  const getDisplayItems = () => {
    if (items.length <= maxItems) {
      return items;
    }

    // Always show first item, last item, and current item
    const firstItem = items[0];
    const lastItem = items[items.length - 1];
    const remainingSlots = maxItems - 2; // Reserve slots for first and last

    if (remainingSlots <= 1) {
      return [firstItem, lastItem];
    }

    // Show first item, ellipsis, and last few items
    const ellipsisItem: BreadcrumbItem = {
      id: 'ellipsis',
      label: '...',
      current: false,
    };

    const endItems = items.slice(-(remainingSlots - 1));
    return [firstItem, ellipsisItem, ...endItems];
  };

  const displayItems = getDisplayItems();

  const handleItemClick = (item: BreadcrumbItem, index: number, event: React.MouseEvent) => {
    if (item.current || item.id === 'ellipsis') {
      event.preventDefault();
      return;
    }

    if (onItemClick) {
      event.preventDefault();
      onItemClick(item, index);
    }
  };

  const renderSeparator = () => {
    if (separator) {
      return separator;
    }

    return (
      <ChevronRight
        className={cn(
          'text-gray-400',
          iconSizeClasses[size]
        )}
        aria-hidden="true"
      />
    );
  };

  const renderItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const isEllipsis = item.id === 'ellipsis';
    const isClickable = !item.current && !isEllipsis && (item.href || onItemClick);
    const IconComponent = item.icon;
    const showIcon = showHomeIcon && index === 0 && !IconComponent;

    const itemContent = (
      <>
        {showIcon && (
          <Home
            className={cn(
              'mr-1',
              iconSizeClasses[size],
              item.current ? 'text-gray-500' : 'text-gray-400'
            )}
            aria-hidden="true"
          />
        )}
        {IconComponent && (
          <IconComponent
            className={cn(
              'mr-1',
              iconSizeClasses[size],
              item.current ? 'text-gray-500' : 'text-gray-400'
            )}
          />
        )}
        <span className="truncate">{item.label}</span>
      </>
    );

    const itemClasses = cn(
      'flex items-center transition-colors duration-200',
      sizeClasses[size],
      {
        'text-gray-500 font-medium': item.current,
        'text-gray-600 hover:text-gray-800 cursor-pointer': isClickable,
        'text-gray-400': isEllipsis,
        'max-w-[150px] sm:max-w-[200px]': !isLast, // Truncate long items except the last one
      }
    );

    if (isClickable && item.href && !onItemClick) {
      return (
        <motion.a
          key={item.id}
          href={item.href}
          className={itemClasses}
          onClick={(e) => handleItemClick(item, index, e)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-current={item.current ? 'page' : undefined}
        >
          {itemContent}
        </motion.a>
      );
    }

    if (isClickable) {
      return (
        <motion.button
          key={item.id}
          type="button"
          className={itemClasses}
          onClick={(e) => handleItemClick(item, index, e)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-current={item.current ? 'page' : undefined}
        >
          {itemContent}
        </motion.button>
      );
    }

    return (
      <span
        key={item.id}
        className={itemClasses}
        aria-current={item.current ? 'page' : undefined}
      >
        {itemContent}
      </span>
    );
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'flex items-center space-x-1 overflow-hidden',
        {
          'hidden sm:flex': !showOnMobile,
        },
        className
      )}
    >
      <ol className="flex items-center space-x-1 min-w-0">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          
          return (
            <React.Fragment key={item.id}>
              <li className="flex items-center min-w-0">
                {renderItem(item, index, isLast)}
              </li>
              {!isLast && (
                <li className="flex items-center" aria-hidden="true">
                  {renderSeparator()}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

// Utility function to create breadcrumb items from a path
export const createBreadcrumbsFromPath = (
  path: string,
  pathLabels?: Record<string, string>
): BreadcrumbItem[] => {
  const segments = path.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Add home item
  items.push({
    id: 'home',
    label: pathLabels?.[''] || 'Home',
    href: '/',
  });

  // Add path segments
  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;
    
    items.push({
      id: segment,
      label: pathLabels?.[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : href,
      current: isLast,
    });
  });

  return items;
};

// Hook for managing breadcrumb state
export const useBreadcrumbs = (initialItems: BreadcrumbItem[] = []) => {
  const [items, setItems] = React.useState<BreadcrumbItem[]>(initialItems);

  const addItem = React.useCallback((item: BreadcrumbItem) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateItem = React.useCallback((id: string, updates: Partial<BreadcrumbItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const setCurrentItem = React.useCallback((id: string) => {
    setItems(prev => prev.map(item => ({
      ...item,
      current: item.id === id,
    })));
  }, []);

  const reset = React.useCallback((newItems: BreadcrumbItem[] = []) => {
    setItems(newItems);
  }, []);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    setCurrentItem,
    reset,
    setItems,
  };
};