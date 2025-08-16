import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navigation, NavigationItem } from './Navigation';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

const mockItems: NavigationItem[] = [
  {
    label: 'Home',
    href: '/',
    active: true,
  },
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Services',
    children: [
      {
        label: 'Web Development',
        href: '/services/web',
      },
      {
        label: 'Mobile Apps',
        href: '/services/mobile',
      },
    ],
  },
  {
    label: 'Contact',
    onClick: jest.fn(),
  },
  {
    label: 'Disabled',
    href: '/disabled',
    disabled: true,
  },
];

describe('Navigation', () => {
  it('renders navigation items', () => {
    render(<Navigation items={mockItems} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('shows active state for active items', () => {
    render(<Navigation items={mockItems} />);

    const homeLink = screen.getByText('Home').closest('span');
    expect(homeLink).toHaveClass('text-aguirre-sky', 'bg-aguirre-sky/10');
  });

  it('renders links for items with href', () => {
    render(<Navigation items={mockItems} />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');

    const aboutLink = screen.getByText('About').closest('a');
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('handles click events for items with onClick', () => {
    const mockOnClick = jest.fn();
    const itemsWithClick = [
      {
        label: 'Click Me',
        onClick: mockOnClick,
      },
    ];

    render(<Navigation items={itemsWithClick} />);

    fireEvent.click(screen.getByText('Click Me'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('shows mobile toggle button', () => {
    render(<Navigation items={mockItems} showMobileToggle />);

    const toggleButton = screen.getByLabelText('Toggle mobile menu');
    expect(toggleButton).toBeInTheDocument();
  });

  it('hides mobile toggle when showMobileToggle is false', () => {
    render(<Navigation items={mockItems} showMobileToggle={false} />);

    const toggleButton = screen.queryByLabelText('Toggle mobile menu');
    expect(toggleButton).not.toBeInTheDocument();
  });

  it('toggles mobile menu when toggle button is clicked', () => {
    const mockToggle = jest.fn();
    render(
      <Navigation
        items={mockItems}
        showMobileToggle
        isMobileOpen={false}
        onMobileToggle={mockToggle}
      />
    );

    const toggleButton = screen.getByLabelText('Toggle mobile menu');
    fireEvent.click(toggleButton);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('shows mobile navigation when isMobileOpen is true', () => {
    render(
      <Navigation
        items={mockItems}
        showMobileToggle
        isMobileOpen={true}
        onMobileToggle={jest.fn()}
      />
    );

    const mobileNav = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    });
    expect(mobileNav).toBeInTheDocument();
  });

  it('handles dropdown items', () => {
    render(<Navigation items={mockItems} />);

    const servicesButton = screen.getByRole('button', { name: /services/i });
    expect(servicesButton).toHaveAttribute('aria-expanded', 'false');
    expect(servicesButton).toHaveAttribute('aria-haspopup', 'true');

    // Initially, dropdown items should not be visible
    expect(screen.queryByText('Web Development')).not.toBeInTheDocument();
    expect(screen.queryByText('Mobile Apps')).not.toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<Navigation items={mockItems} />);

    const servicesButton = screen.getByRole('button', { name: /services/i });
    fireEvent.click(servicesButton);

    expect(servicesButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Mobile Apps')).toBeInTheDocument();
  });

  it('closes dropdown when clicked again', () => {
    render(<Navigation items={mockItems} />);

    const servicesButton = screen.getByRole('button', { name: /services/i });

    // Open dropdown
    fireEvent.click(servicesButton);
    expect(screen.getByText('Web Development')).toBeInTheDocument();

    // Close dropdown
    fireEvent.click(servicesButton);
    expect(servicesButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('disables disabled items', () => {
    render(<Navigation items={mockItems} />);

    const disabledButton = screen.getByText('Disabled').closest('button');
    expect(disabledButton).toBeDisabled();
    expect(disabledButton).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('applies custom className', () => {
    render(<Navigation items={mockItems} className="custom-nav" />);

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toHaveClass('custom-nav');
  });

  it('applies custom mobile className', () => {
    render(
      <Navigation
        items={mockItems}
        isMobileOpen={true}
        mobileClassName="custom-mobile-nav"
      />
    );

    const mobileNav = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    });
    expect(mobileNav).toHaveClass('custom-mobile-nav');
  });

  it('renders vertical orientation', () => {
    render(<Navigation items={mockItems} orientation="vertical" />);

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toHaveClass('flex-col', 'space-y-1');
  });

  it('renders horizontal orientation by default', () => {
    render(<Navigation items={mockItems} />);

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toHaveClass('items-center', 'space-x-1');
  });

  it('closes mobile menu when item is clicked', () => {
    const mockToggle = jest.fn();
    const itemsWithClick = [
      {
        label: 'Mobile Item',
        onClick: jest.fn(),
      },
    ];

    render(
      <Navigation
        items={itemsWithClick}
        isMobileOpen={true}
        onMobileToggle={mockToggle}
      />
    );

    // Click on mobile navigation item
    const mobileItem = screen.getAllByText('Mobile Item')[1]; // Second one is in mobile nav
    fireEvent.click(mobileItem);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(<Navigation items={mockItems} />);

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();

    const toggleButton = screen.getByLabelText('Toggle mobile menu');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });
});
