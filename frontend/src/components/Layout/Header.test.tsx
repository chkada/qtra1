import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from './Header';
import { NavigationItem } from '../UI/Navigation';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  BookOpen: () => <div data-testid="book-icon" />,
}));

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'student' as const,
};

const mockTeacher = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  role: 'teacher' as const,
  avatar: 'https://example.com/avatar.jpg',
};

const mockNavigationItems: NavigationItem[] = [
  { label: 'Custom Home', href: '/custom' },
  { label: 'Custom About', href: '/custom-about' },
];

describe('Header', () => {
  it('renders with default props', () => {
    render(<Header />);

    expect(screen.getByText('Qindil')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders custom logo', () => {
    const customLogo = <div data-testid="custom-logo">Custom Logo</div>;
    render(<Header logo={customLogo} />);

    expect(screen.getByTestId('custom-logo')).toBeInTheDocument();
  });

  it('renders logo as image when string provided', () => {
    render(<Header logo="https://example.com/logo.png" />);

    const logoImg = screen.getByAltText('Qindil');
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('renders custom navigation items', () => {
    render(<Header navigationItems={mockNavigationItems} />);

    expect(screen.getByText('Custom Home')).toBeInTheDocument();
    expect(screen.getByText('Custom About')).toBeInTheDocument();
  });

  it('renders default navigation when no items provided', () => {
    render(<Header />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Find Teachers')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders authentication buttons when not authenticated', () => {
    render(<Header isAuthenticated={false} onLogin={jest.fn()} />);

    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('calls onLogin when auth buttons are clicked', () => {
    const mockOnLogin = jest.fn();
    render(<Header isAuthenticated={false} onLogin={mockOnLogin} />);

    fireEvent.click(screen.getByText('Get Started'));
    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });

  it('renders user menu when authenticated', () => {
    render(<Header isAuthenticated={true} user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument(); // Avatar initial
  });

  it('renders user avatar when provided', () => {
    render(<Header isAuthenticated={true} user={mockTeacher} />);

    const avatar = screen.getByAltText('Jane Smith');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('opens and closes user menu on click', async () => {
    render(<Header isAuthenticated={true} user={mockUser} />);

    const userButton = screen.getByText('John Doe');

    // Menu should not be visible initially
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();

    // Click to open menu
    fireEvent.click(userButton);
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('My Bookings')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });

    // Click to close menu
    fireEvent.click(userButton);
    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  it('shows teacher-specific menu items for teachers', async () => {
    render(<Header isAuthenticated={true} user={mockTeacher} />);

    const userButton = screen.getByText('Jane Smith');
    fireEvent.click(userButton);

    await waitFor(() => {
      expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();
    });
  });

  it('calls onLogout when sign out is clicked', async () => {
    const mockOnLogout = jest.fn();
    render(
      <Header isAuthenticated={true} user={mockUser} onLogout={mockOnLogout} />
    );

    const userButton = screen.getByText('John Doe');
    fireEvent.click(userButton);

    await waitFor(() => {
      const signOutButton = screen.getByText('Sign out');
      fireEvent.click(signOutButton);
    });

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('closes user menu when clicking outside', async () => {
    render(<Header isAuthenticated={true} user={mockUser} />);

    const userButton = screen.getByText('John Doe');
    fireEvent.click(userButton);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    // Click outside overlay
    const overlay = document.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
    }

    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  it('closes user menu when menu item is clicked', async () => {
    render(<Header isAuthenticated={true} user={mockUser} />);

    const userButton = screen.getByText('John Doe');
    fireEvent.click(userButton);

    await waitFor(() => {
      const profileLink = screen.getByText('Profile');
      fireEvent.click(profileLink);
    });

    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<Header className="custom-header" />);

    expect(container.firstChild).toHaveClass('custom-header');
  });

  it('has proper accessibility attributes', async () => {
    render(<Header isAuthenticated={true} user={mockUser} />);

    const userButton = screen.getByRole('button');
    expect(userButton).toHaveAttribute('aria-expanded', 'false');
    expect(userButton).toHaveAttribute('aria-haspopup', 'true');

    fireEvent.click(userButton);

    await waitFor(() => {
      expect(userButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('displays user email in dropdown', async () => {
    render(<Header isAuthenticated={true} user={mockUser} />);

    const userButton = screen.getByText('John Doe');
    fireEvent.click(userButton);

    await waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('renders proper icons in user menu', async () => {
    render(<Header isAuthenticated={true} user={mockUser} />);

    const userButton = screen.getByText('John Doe');
    fireEvent.click(userButton);

    await waitFor(() => {
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
      expect(screen.getByTestId('book-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });
  });
});
