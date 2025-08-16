import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  it('renders correctly with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-gray-300');
  });

  it('renders with a label', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    const label = screen.getByText('Username');
    expect(label).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('renders helper text when provided', () => {
    render(
      <Input
        label="Password"
        helperText="Must be at least 8 characters"
        placeholder="Enter password"
      />
    );
    expect(
      screen.getByText('Must be at least 8 characters')
    ).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    render(
      <Input
        label="Email"
        error="Invalid email format"
        placeholder="Enter email"
      />
    );
    const input = screen.getByPlaceholderText('Enter email');
    const errorMessage = screen.getByText('Invalid email format');
    const label = screen.getByText('Email');

    expect(input).toHaveClass('border-sunrise-orange');
    expect(errorMessage).toHaveClass('text-sunrise-orange');
    expect(label).toHaveClass('text-sunrise-orange');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders with left and right icons', () => {
    const leftIcon = <span data-testid="left-icon">@</span>;
    const rightIcon = <span data-testid="right-icon">✓</span>;

    render(
      <Input
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        placeholder="With icons"
      />
    );

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('With icons')).toHaveClass(
      'pl-10 pr-10'
    );
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Input size="sm" placeholder="Small" />);
    expect(screen.getByPlaceholderText('Small')).toHaveClass('text-sm');

    rerender(<Input size="md" placeholder="Medium" />);
    expect(screen.getByPlaceholderText('Medium')).toHaveClass('text-base');

    rerender(<Input size="lg" placeholder="Large" />);
    expect(screen.getByPlaceholderText('Large')).toHaveClass('text-lg');
  });

  it('applies fullWidth class when fullWidth is true', () => {
    render(<Input fullWidth placeholder="Full width" />);
    expect(screen.getByPlaceholderText('Full width')).toHaveClass('w-full');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
    expect(screen.getByPlaceholderText('Disabled')).toHaveClass('opacity-50');
  });

  it('calls onChange handler when text is entered', async () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} placeholder="Type here" />);

    await userEvent.type(screen.getByPlaceholderText('Type here'), 'Hello');
    expect(handleChange).toHaveBeenCalledTimes(5); // Once for each character
  });

  it('does not call onChange when disabled', async () => {
    const handleChange = jest.fn();
    render(<Input disabled onChange={handleChange} placeholder="Disabled" />);

    await userEvent.type(screen.getByPlaceholderText('Disabled'), 'Hello');
    expect(handleChange).not.toHaveBeenCalled();
  });
});
