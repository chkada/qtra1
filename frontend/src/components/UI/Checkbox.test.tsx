import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Checkbox from './Checkbox';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
  };
});

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox label="Test Checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders checked when checked prop is true', () => {
    render(<Checkbox label="Test Checkbox" checked={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders checked when defaultChecked prop is true', () => {
    render(<Checkbox label="Test Checkbox" defaultChecked={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders with label when provided', () => {
    render(<Checkbox label="Test Checkbox" />);
    expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
  });

  it('renders with helper text when provided', () => {
    render(<Checkbox label="Test Checkbox" helperText="Helper text" />);
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  it('renders with error message when provided', () => {
    render(<Checkbox label="Test Checkbox" error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('calls onChange when clicked', () => {
    const handleChange = jest.fn();
    render(<Checkbox label="Test Checkbox" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Test Checkbox'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('does not call onChange when disabled', () => {
    const handleChange = jest.fn();
    render(<Checkbox label="Test Checkbox" onChange={handleChange} disabled />);

    fireEvent.click(screen.getByText('Test Checkbox'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('shows required indicator when required is true', () => {
    render(<Checkbox label="Test Checkbox" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('applies name and value attributes when provided', () => {
    render(<Checkbox name="test-name" value="test-value" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('name', 'test-name');
    expect(checkbox).toHaveAttribute('value', 'test-value');
  });

  it('applies additional className when provided', () => {
    render(<Checkbox className="custom-class" />);
    const checkboxContainer =
      screen.getByRole('checkbox').parentElement?.parentElement?.parentElement;
    expect(checkboxContainer).toHaveClass('custom-class');
  });

  it('toggles checked state when clicked', () => {
    render(<Checkbox label="Test Checkbox" />);
    const checkbox = screen.getByRole('checkbox');

    // Initially unchecked
    expect(checkbox).not.toBeChecked();

    // Click to check
    fireEvent.click(screen.getByText('Test Checkbox'));
    expect(checkbox).toBeChecked();

    // Click to uncheck
    fireEvent.click(screen.getByText('Test Checkbox'));
    expect(checkbox).not.toBeChecked();
  });
});
