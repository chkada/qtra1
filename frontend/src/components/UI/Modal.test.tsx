import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock Button component
jest.mock('./Button', () => {
  return ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="close-button">
      {children}
    </button>
  );
});

describe('Modal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders close button by default', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByTestId('close-button')).toBeInTheDocument();
  });

  it('does not render close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} showCloseButton={false}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByTestId('close-button')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.click(screen.getByTestId('close-button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders footer when provided', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        footer={<div>Footer content</div>}
      >
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} size="sm">
        <div>Modal content</div>
      </Modal>
    );

    // Check for small size class
    const modalElement = screen.getByRole('dialog');
    expect(modalElement.innerHTML).toContain('max-w-sm');

    // Rerender with large size
    rerender(
      <Modal isOpen={true} onClose={mockOnClose} size="lg">
        <div>Modal content</div>
      </Modal>
    );

    // Check for large size class
    expect(modalElement.innerHTML).toContain('max-w-lg');
  });

  it('applies additional className when provided', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} className="custom-class">
        <div>Modal content</div>
      </Modal>
    );

    const modalElement = screen.getByRole('dialog');
    expect(modalElement.innerHTML).toContain('custom-class');
  });
});