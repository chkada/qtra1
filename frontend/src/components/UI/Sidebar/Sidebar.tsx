import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Checkbox } from '@/components/UI/Checkbox';
import { Select } from '@/components/UI/Select';
import { Input } from '@/components/UI/Input';

export interface FilterOption {
  id: string;
  label: string;
  value: string | number;
  count?: number;
}

export interface FilterGroup {
  id: string;
  title: string;
  type: 'checkbox' | 'select' | 'range' | 'search';
  options?: FilterOption[];
  value?: any;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface SidebarProps {
  /**
   * Whether the sidebar is open (for mobile)
   */
  isOpen?: boolean;
  /**
   * Callback when sidebar is closed
   */
  onClose?: () => void;
  /**
   * Filter groups to display
   */
  filterGroups: FilterGroup[];
  /**
   * Callback when filters change
   */
  onFiltersChange?: (filters: Record<string, any>) => void;
  /**
   * Current filter values
   */
  filters?: Record<string, any>;
  /**
   * Sidebar title
   */
  title?: string;
  /**
   * Show clear all button
   */
  showClearAll?: boolean;
  /**
   * Callback when clear all is clicked
   */
  onClearAll?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Sidebar position
   */
  position?: 'left' | 'right';
  /**
   * Sidebar width
   */
  width?: 'sm' | 'md' | 'lg';
}

/**
 * Responsive sidebar component for filtering
 */
export const Sidebar = ({
  isOpen = false,
  onClose,
  filterGroups = [],
  onFiltersChange,
  filters = {},
  title = 'Filters',
  showClearAll = true,
  onClearAll,
  className = '',
  position = 'left',
  width = 'md',
}: SidebarProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(
      filterGroups
        .filter((group) => group.defaultExpanded !== false)
        .map((group) => group.id)
    )
  );

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleFilterChange = (groupId: string, value: any) => {
    const newFilters = { ...filters, [groupId]: value };
    onFiltersChange?.(newFilters);
  };

  const handleCheckboxChange = (groupId: string, optionValue: string, checked: boolean) => {
    const currentValues = filters[groupId] || [];
    const newValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter((v: string) => v !== optionValue);
    handleFilterChange(groupId, newValues);
  };

  const getWidthClasses = () => {
    switch (width) {
      case 'sm':
        return 'w-64';
      case 'lg':
        return 'w-96';
      default:
        return 'w-80';
    }
  };

  const getPositionClasses = () => {
    return position === 'right' ? 'right-0' : 'left-0';
  };

  const sidebarContent = (
    <div className={`h-full flex flex-col bg-white border-r border-gray-200 ${getWidthClasses()}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5 text-aguirre-sky" />
          {title}
        </h2>
        {onClose && (
          <Button
            variant="text"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Clear All Button */}
      {showClearAll && (
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Filter Groups */}
      <div className="flex-1 overflow-y-auto">
        {filterGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const currentValue = filters[group.id];

          return (
            <div key={group.id} className="border-b border-gray-200">
              {/* Group Header */}
              {group.collapsible ? (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <span className="font-medium text-gray-900">{group.title}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <div className="p-4 pb-2">
                  <h3 className="font-medium text-gray-900">{group.title}</h3>
                </div>
              )}

              {/* Group Content */}
              <AnimatePresence>
                {(!group.collapsible || isExpanded) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className={group.collapsible ? 'px-4 pb-4' : 'px-4 pb-4'}>
                      {/* Checkbox Group */}
                      {group.type === 'checkbox' && group.options && (
                        <div className="space-y-2">
                          {group.options.map((option) => (
                            <div key={option.id} className="flex items-center justify-between">
                              <Checkbox
                                id={`${group.id}-${option.id}`}
                                label={option.label}
                                checked={(currentValue || []).includes(option.value)}
                                onChange={(checked) =>
                                  handleCheckboxChange(group.id, option.value.toString(), checked)
                                }
                                className="flex-1"
                              />
                              {option.count !== undefined && (
                                <span className="text-sm text-gray-500 ml-2">({option.count})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Select Group */}
                      {group.type === 'select' && group.options && (
                        <Select
                          value={currentValue || ''}
                          onChange={(value) => handleFilterChange(group.id, value)}
                          placeholder={group.placeholder || 'Select option'}
                          options={group.options.map((option) => ({
                            value: option.value.toString(),
                            label: option.label,
                          }))}
                        />
                      )}

                      {/* Search Group */}
                      {group.type === 'search' && (
                        <Input
                          type="text"
                          value={currentValue || ''}
                          onChange={(e) => handleFilterChange(group.id, e.target.value)}
                          placeholder={group.placeholder || 'Search...'}
                        />
                      )}

                      {/* Range Group */}
                      {group.type === 'range' && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={currentValue?.min || ''}
                              onChange={(e) =>
                                handleFilterChange(group.id, {
                                  ...currentValue,
                                  min: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              placeholder="Min"
                              min={group.min}
                              max={group.max}
                              step={group.step}
                            />
                            <Input
                              type="number"
                              value={currentValue?.max || ''}
                              onChange={(e) =>
                                handleFilterChange(group.id, {
                                  ...currentValue,
                                  max: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              placeholder="Max"
                              min={group.min}
                              max={group.max}
                              step={group.step}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block ${className}`}>
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: position === 'right' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: position === 'right' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 ${getPositionClasses()} h-full z-50 lg:hidden`}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;