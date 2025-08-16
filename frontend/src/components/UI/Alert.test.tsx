import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders with default props', () => {
    render(<Alert>Test message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Alert title="Test Title">Test message</Alert>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders success variant with correct styling', () => {
    render(<Alert variant="success">Success message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(
      'bg-green-50',
      'border-green-200',
      'text-green-800'
    );
  });

  it('renders error variant with correct styling', () => {
    render(<Alert variant="error">Error message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
  });

  it('renders warning variant with correct styling', () => {
    render(<Alert variant="warning">Warning message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(
      'bg-yellow-50',
      'border-yellow-200',
      'text-yellow-800'
    );
  });

  it('renders info variant with correct styling', () => {
    render(<Alert variant="info">Info message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
  });

  it('shows icon by default', () => {
    render(<Alert variant="success">Success message</Alert>);
    // Check if icon is present (CheckCircle for success)
    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    render(
      <Alert variant="success" showIcon={false}>
        Success message
      </Alert>
    );
    // Check if icon is not present
    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('renders dismiss button when dismissible is true', () => {
    const onDismiss = jest.fn();
    render(
      <Alert dismissible onDismiss={onDismiss}>
        Dismissible message
      </Alert>
    );
    expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = jest.fn();
    render(
      <Alert dismissible onDismiss={onDismiss}>
        Dismissible message
      </Alert>
    );

    fireEvent.click(screen.getByLabelText('Dismiss alert'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render dismiss button when dismissible is false', () => {
    render(<Alert dismissible={false}>Non-dismissible message</Alert>);
    expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Alert className="custom-class">Test message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<Alert>Accessible message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('renders complex content', () => {
    render(
      <Alert title="Complex Alert">
        <div>
          <p>This is a paragraph</p>
          <button>Action Button</button>
        </div>
      </Alert>
    );

    expect(screen.getByText('Complex Alert')).toBeInTheDocument();
    expect(screen.getByText('This is a paragraph')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });
});
