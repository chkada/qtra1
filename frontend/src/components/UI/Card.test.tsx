import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from './Card';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('next/image', () => {
  return ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className: string;
  }) => {
    return <img src={src} alt={alt} className={className} />;
  };
});

const mockTeacher = {
  id: '123',
  displayName: 'John Doe',
  location: 'New York',
  country: 'USA',
  specialties: ['Math', 'Physics'],
  languages: ['English', 'Spanish'],
  hourlyRateCents: 2500, // $25.00
};

describe('Card', () => {
  it('renders teacher information correctly', () => {
    render(<Card {...mockTeacher} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('New York, USA')).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('$25')).toBeInTheDocument();
    expect(screen.getByText('/hour')).toBeInTheDocument();
    expect(screen.getByText('View Profile')).toBeInTheDocument();
  });

  it('renders avatar with first letter when no image is provided', () => {
    render(<Card {...mockTeacher} />);
    expect(screen.getByText('J')).toBeInTheDocument(); // First letter of John
  });

  it('renders image when imageUrl is provided', () => {
    render(<Card {...mockTeacher} imageUrl="/path/to/image.jpg" />);
    const image = document.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/path/to/image.jpg');
    expect(image).toHaveAttribute('alt', 'John Doe');
  });

  it('renders compact variant without specialties and languages', () => {
    render(<Card {...mockTeacher} variant="compact" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('New York, USA')).toBeInTheDocument();
    expect(screen.getByText('$25')).toBeInTheDocument();

    // These should not be in the document in compact mode
    expect(screen.queryByText('Specialties')).not.toBeInTheDocument();
    expect(screen.queryByText('Languages')).not.toBeInTheDocument();
  });

  it('links to the teacher profile page', () => {
    render(<Card {...mockTeacher} />);
    const link = document.querySelector('a');
    expect(link).toHaveAttribute('href', '/teacher/123');
  });

  it('formats hourly rate correctly', () => {
    const { rerender } = render(
      <Card {...mockTeacher} hourlyRateCents={2500} />
    );
    expect(screen.getByText('$25')).toBeInTheDocument();

    rerender(<Card {...mockTeacher} hourlyRateCents={3050} />);
    expect(screen.getByText('$31')).toBeInTheDocument();
  });
});
