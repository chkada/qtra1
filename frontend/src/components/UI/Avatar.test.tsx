import React from 'react';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return ({ src, alt }: { src: string; alt: string }) => {
    return <img src={src} alt={alt} />;
  };
});

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
  };
});

describe('Avatar', () => {
  it('renders with image when src is provided', () => {
    render(<Avatar src="/path/to/image.jpg" alt="User Name" />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/path/to/image.jpg');
    expect(image).toHaveAttribute('alt', 'User Name');
  });

  it('renders with first letter of alt text when src is not provided', () => {
    render(<Avatar alt="User Name" />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Avatar alt="User" size="xs" />);
    expect(document.querySelector('.w-6')).toBeInTheDocument();
    
    rerender(<Avatar alt="User" size="xl" />);
    expect(document.querySelector('.w-16')).toBeInTheDocument();
  });

  it('shows status indicator when status is provided', () => {
    const { rerender } = render(<Avatar alt="User" status="online" />);
    expect(document.querySelector('.bg-green-500')).toBeInTheDocument();
    
    rerender(<Avatar alt="User" status="busy" />);
    expect(document.querySelector('.bg-sunrise-orange')).toBeInTheDocument();
    
    rerender(<Avatar alt="User" status="offline" />);
    expect(document.querySelector('.bg-gray-400')).toBeInTheDocument();
    
    rerender(<Avatar alt="User" status="away" />);
    expect(document.querySelector('.bg-yellow-400')).toBeInTheDocument();
  });

  it('does not show status indicator when status is none', () => {
    render(<Avatar alt="User" status="none" />);
    expect(document.querySelector('.hidden')).toBeInTheDocument();
  });

  it('applies additional className when provided', () => {
    render(<Avatar alt="User" className="custom-class" />);
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('sets correct aria-label for status', () => {
    render(<Avatar alt="User" status="online" />);
    const statusIndicator = document.querySelector('[aria-label="Status: online"]');
    expect(statusIndicator).toBeInTheDocument();
  });
});