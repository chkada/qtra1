import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Select from './Select';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  return {
    motion: {
      ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('Select', () => {
  it('renders with placeholder when no value is selected', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<Select options={mockOptions} placeholder="Choose an option" />);
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });

  it('renders with label when provided', () => {
    render(<Select options={mockOptions} label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with helper text when provided', () => {
    render(<Select options={mockOptions} helperText="Helper text" />);
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  it('renders with error message when provided', () => {
    render(<Select options={mockOptions} error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('renders with selected value when defaultValue is provided', () => {
    render(<Select options={mockOptions} defaultValue="option2" />);
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('renders with selected value when value is provided', () => {
    render(<Select options={mockOptions} value="option3" />);
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<Select options={mockOptions} />);
    
    // Dropdown should be closed initially
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    
    // Click to open dropdown
    fireEvent.click(screen.getByRole('combobox'));
    
    // Dropdown should be open
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('selects an option when clicked', () => {
    const handleChange = jest.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    
    // Open dropdown
    fireEvent.click(screen.getByRole('combobox'));
    
    // Click an option
    fireEvent.click(screen.getByText('Option 2'));
    
    // Dropdown should close and selection should update
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('does not open dropdown when disabled', () => {
    render(<Select options={mockOptions} disabled />);
    
    // Click to try to open dropdown
    fireEvent.click(screen.getByRole('combobox'));
    
    // Dropdown should still be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows required indicator when required is true', () => {
    render(<Select options={mockOptions} label="Test Label" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('applies fullWidth class when fullWidth is true', () => {
    render(<Select options={mockOptions} fullWidth />);
    const selectContainer = screen.getByRole('combobox').parentElement?.parentElement;
    expect(selectContainer).toHaveClass('w-full');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Select options={mockOptions} size="sm" />);
    expect(screen.getByRole('combobox')).toHaveClass('h-8');
    
    rerender(<Select options={mockOptions} size="lg" />);
    expect(screen.getByRole('combobox')).toHaveClass('h-12');
  });
});