import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar, FilterGroup } from './Sidebar';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
}));

// Mock UI components
jest.mock('@/components/UI/Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/UI/Checkbox', () => ({
  Checkbox: ({ label, ...props }: any) => (
    <div>
      <input type="checkbox" {...props} />
      {label && <label>{label}</label>}
    </div>
  ),
}));

jest.mock('@/components/UI/Select', () => ({
  Select: ({ options, placeholder, ...props }: any) => (
    <select {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((option: any) => (
        <option key={option.id} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock('@/components/UI/Input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}));

const mockFilterGroups: FilterGroup[] = [
  {
    id: 'category',
    title: 'Category',
    type: 'checkbox',
    options: [
      { id: 'math', label: 'Mathematics', value: 'math', count: 15 },
      { id: 'science', label: 'Science', value: 'science', count: 8 },
      { id: 'english', label: 'English', value: 'english', count: 12 },
    ],
  },
  {
    id: 'level',
    title: 'Level',
    type: 'select',
    options: [
      { id: 'beginner', label: 'Beginner', value: 'beginner' },
      { id: 'intermediate', label: 'Intermediate', value: 'intermediate' },
      { id: 'advanced', label: 'Advanced', value: 'advanced' },
    ],
    placeholder: 'Select level',
  },
  {
    id: 'price',
    title: 'Price Range',
    type: 'range',
    min: 0,
    max: 1000,
    step: 10,
  },
  {
    id: 'search',
    title: 'Search',
    type: 'search',
    placeholder: 'Search teachers...',
  },
  {
    id: 'collapsible',
    title: 'Collapsible Group',
    type: 'checkbox',
    collapsible: true,
    defaultExpanded: false,
    options: [
      { id: 'option1', label: 'Option 1', value: 'option1' },
      { id: 'option2', label: 'Option 2', value: 'option2' },
    ],
  },
];

describe('Sidebar', () => {
  const defaultProps = {
    filterGroups: mockFilterGroups,
    onFiltersChange: jest.fn(),
    onClose: jest.fn(),
    onClearAll: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Clear All Filters')).toBeInTheDocument();
      expect(screen.getByTestId('filter-icon')).toBeInTheDocument();
    });

    it('renders custom title', () => {
      render(<Sidebar {...defaultProps} title="Custom Filters" />);
      
      expect(screen.getByText('Custom Filters')).toBeInTheDocument();
    });

    it('hides clear all button when showClearAll is false', () => {
      render(<Sidebar {...defaultProps} showClearAll={false} />);
      
      expect(screen.queryByText('Clear All Filters')).not.toBeInTheDocument();
    });

    it('renders all filter groups', () => {
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Level')).toBeInTheDocument();
      expect(screen.getByText('Price Range')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <Sidebar {...defaultProps} className="custom-class" />
      );
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Checkbox Filters', () => {
    it('renders checkbox options with counts', () => {
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
      expect(screen.getByText('(15)')).toBeInTheDocument();
      expect(screen.getByText('Science')).toBeInTheDocument();
      expect(screen.getByText('(8)')).toBeInTheDocument();
    });

    it('handles checkbox selection', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);
      
      const mathCheckbox = screen.getByLabelText('Mathematics');
      await user.click(mathCheckbox);
      
      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
        category: ['math'],
      });
    });

    it('handles multiple checkbox selections', async () => {
      const user = userEvent.setup();
      const filters = { category: ['math'] };
      render(<Sidebar {...defaultProps} filters={filters} />);
      
      const scienceCheckbox = screen.getByLabelText('Science');
      await user.click(scienceCheckbox);
      
      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
        category: ['math', 'science'],
      });
    });

    it('handles checkbox deselection', async () => {
      const user = userEvent.setup();
      const filters = { category: ['math', 'science'] };
      render(<Sidebar {...defaultProps} filters={filters} />);
      
      const mathCheckbox = screen.getByLabelText('Mathematics');
      await user.click(mathCheckbox);
      
      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
        category: ['science'],
      });
    });
  });

  describe('Select Filters', () => {
    it('renders select with placeholder', () => {
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByText('Select level')).toBeInTheDocument();
    });

    it('handles select change', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);
      
      const select = screen.getByDisplayValue('');
      await user.selectOptions(select, 'beginner');
      
      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
        level: 'beginner',
      });
    });
  });

  describe('Range Filters', () => {
    it('renders min and max inputs', () => {
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });

    it('handles min value change', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);
      
      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '100');
      
      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
        price: { min: 100 },
      });
    });

    it('handles max value change', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);
      
      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '500');
      
      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
        price: { max: 500 },
      });
    });

    it('preserves existing range values when updating', async () => {
      const user = userEvent.setup();
      const filters = { price: { min: 100 } };
      render(<Sidebar {...defaultProps} filters={filters} />);
      
      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '500');
      
      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
        price: { min: 100, max: 500 },
      });
    });
  });

  describe('Search Filters', () => {
    it('renders search input with placeholder', () => {
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Search teachers...')).toBeInTheDocument();
    });

    it('handles search input change', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search teachers...');
      await user.type(searchInput, 'john');
      
      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
        search: 'john',
      });
    });
  });

  describe('Collapsible Groups', () => {
    it('renders collapsible group header as button', () => {
      render(<Sidebar {...defaultProps} />);
      
      const collapsibleButton = screen.getByRole('button', { name: /collapsible group/i });
      expect(collapsibleButton).toBeInTheDocument();
      expect(collapsibleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows chevron down when collapsed', () => {
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('expands group when clicked', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);
      
      const collapsibleButton = screen.getByRole('button', { name: /collapsible group/i });
      await user.click(collapsibleButton);
      
      expect(collapsibleButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('shows options when expanded', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);
      
      const collapsibleButton = screen.getByRole('button', { name: /collapsible group/i });
      await user.click(collapsibleButton);
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Clear All Functionality', () => {
    it('calls onClearAll when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);
      
      const clearButton = screen.getByText('Clear All Filters');
      await user.click(clearButton);
      
      expect(defaultProps.onClearAll).toHaveBeenCalled();
    });
  });

  describe('Mobile Behavior', () => {
    it('shows close button on mobile when onClose is provided', () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);
      
      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} isOpen={true} />);
      
      const closeButton = screen.getByLabelText('Close filters');
      await user.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not show close button when onClose is not provided', () => {
      const { onClose, ...propsWithoutClose } = defaultProps;
      render(<Sidebar {...propsWithoutClose} isOpen={true} />);
      
      expect(screen.queryByLabelText('Close filters')).not.toBeInTheDocument();
    });
  });

  describe('Width and Position', () => {
    it('applies correct width classes', () => {
      const { rerender } = render(<Sidebar {...defaultProps} width="sm" />);
      expect(document.querySelector('.w-64')).toBeInTheDocument();
      
      rerender(<Sidebar {...defaultProps} width="lg" />);
      expect(document.querySelector('.w-96')).toBeInTheDocument();
      
      rerender(<Sidebar {...defaultProps} width="md" />);
      expect(document.querySelector('.w-80')).toBeInTheDocument();
    });

    it('applies correct position classes', () => {
      const { rerender } = render(<Sidebar {...defaultProps} position="left" />);
      expect(document.querySelector('.left-0')).toBeInTheDocument();
      
      rerender(<Sidebar {...defaultProps} position="right" />);
      expect(document.querySelector('.right-0')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for collapsible groups', () => {
      render(<Sidebar {...defaultProps} />);
      
      const collapsibleButton = screen.getByRole('button', { name: /collapsible group/i });
      expect(collapsibleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('has proper labels for form controls', () => {
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByLabelText('Mathematics')).toBeInTheDocument();
      expect(screen.getByLabelText('Science')).toBeInTheDocument();
      expect(screen.getByLabelText('English')).toBeInTheDocument();
    });

    it('has proper aria-label for close button', () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);
      
      expect(screen.getByLabelText('Close filters')).toBeInTheDocument();
    });
  });
});