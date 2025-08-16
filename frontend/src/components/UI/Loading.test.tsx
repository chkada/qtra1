import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Loading } from './Loading';

describe('Loading', () => {
  it('renders with default props', () => {
    render(<Loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders spinner variant by default', () => {
    render(<Loading />);
    const svg = screen.getByRole('img', { name: 'Loading' });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin');
  });

  it('renders dots variant', () => {
    render(<Loading variant="dots" />);
    const container = screen.getByRole('status');
    // Check for dots container
    const dotsContainer = container.querySelector('.flex.space-x-1');
    expect(dotsContainer).toBeInTheDocument();
    // Should have 3 dots
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots).toHaveLength(3);
  });

  it('renders pulse variant', () => {
    render(<Loading variant="pulse" />);
    const container = screen.getByRole('status');
    const pulseElement = container.querySelector('.rounded-full');
    expect(pulseElement).toBeInTheDocument();
  });

  it('renders bars variant', () => {
    render(<Loading variant="bars" />);
    const container = screen.getByRole('status');
    // Check for bars container
    const barsContainer = container.querySelector('.flex.items-end.space-x-1');
    expect(barsContainer).toBeInTheDocument();
    // Should have 4 bars
    const bars = barsContainer?.children;
    expect(bars).toHaveLength(4);
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Loading size="sm" />);
    let svg = screen.getByRole('img', { name: 'Loading' });
    expect(svg).toHaveClass('w-4', 'h-4');

    rerender(<Loading size="md" />);
    svg = screen.getByRole('img', { name: 'Loading' });
    expect(svg).toHaveClass('w-6', 'h-6');

    rerender(<Loading size="lg" />);
    svg = screen.getByRole('img', { name: 'Loading' });
    expect(svg).toHaveClass('w-8', 'h-8');

    rerender(<Loading size="xl" />);
    svg = screen.getByRole('img', { name: 'Loading' });
    expect(svg).toHaveClass('w-12', 'h-12');
  });

  it('applies correct color classes', () => {
    const { rerender } = render(<Loading color="primary" />);
    let svg = screen.getByRole('img', { name: 'Loading' });
    expect(svg).toHaveClass('text-aguirre-sky');

    rerender(<Loading color="secondary" />);
    svg = screen.getByRole('img', { name: 'Loading' });
    expect(svg).toHaveClass('text-golden-glow');

    rerender(<Loading color="white" />);
    svg = screen.getByRole('img', { name: 'Loading' });
    expect(svg).toHaveClass('text-white');

    rerender(<Loading color="gray" />);
    svg = screen.getByRole('img', { name: 'Loading' });
    expect(svg).toHaveClass('text-gray-500');
  });

  it('renders with loading text', () => {
    render(<Loading text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument(); // sr-only text
  });

  it('centers content when centered prop is true', () => {
    render(<Loading centered />);
    const container = screen.getByRole('status');
    expect(container).toHaveClass('justify-center');
  });

  it('applies custom className', () => {
    render(<Loading className="custom-loading" />);
    const container = screen.getByRole('status');
    expect(container).toHaveClass('custom-loading');
  });

  it('has proper accessibility attributes', () => {
    render(<Loading />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });

  it('adjusts layout when text is provided', () => {
    render(<Loading text="Loading data..." />);
    const container = screen.getByRole('status');
    expect(container).toHaveClass('flex-col', 'space-y-2');
  });

  it('applies correct text size based on size prop', () => {
    const { rerender } = render(<Loading text="Loading..." size="sm" />);
    let textElement = screen.getByText('Loading...');
    expect(textElement).toHaveClass('text-sm');

    rerender(<Loading text="Loading..." size="lg" />);
    textElement = screen.getByText('Loading...');
    expect(textElement).toHaveClass('text-lg');
  });

  it('renders dots with correct size', () => {
    render(<Loading variant="dots" size="lg" />);
    const container = screen.getByRole('status');
    const dots = container.querySelectorAll('.rounded-full');
    dots.forEach((dot) => {
      expect(dot).toHaveClass('w-3', 'h-3');
    });
  });

  it('renders bars with correct dimensions', () => {
    render(<Loading variant="bars" size="md" />);
    const container = screen.getByRole('status');
    const barsContainer = container.querySelector('.flex.items-end.space-x-1');
    const bars = barsContainer?.children;

    if (bars) {
      Array.from(bars).forEach((bar) => {
        expect(bar).toHaveClass('w-1', 'h-4');
      });
    }
  });
});
