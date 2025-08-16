import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Layout, AuthenticatedLayout, GuestLayout, AuthLayout } from './Layout';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Header component
jest.mock('./Header', () => ({
  Header: ({ isAuthenticated, user, onLogin, onLogout }: any) => (
    <header data-testid="header">
      {isAuthenticated ? (
        <div>
          <span>User: {user?.name}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={onLogin}>Login</button>
      )}
    </header>
  ),
}));

// Mock Footer component
jest.mock('./Footer', () => ({
  Footer: (props: any) => (
    <footer data-testid="footer">Footer - {props.brandName || 'Qindil'}</footer>
  ),
}));

// Mock UI components
jest.mock('../UI/Alert', () => ({
  Alert: ({ variant, title, content, onDismiss }: any) => (
    <div data-testid={`alert-${variant}`}>
      {title && <h4>{title}</h4>}
      <p>{content}</p>
      {onDismiss && <button onClick={onDismiss}>Dismiss</button>}
    </div>
  ),
}));

jest.mock('../UI/Loading', () => ({
  Loading: ({ size, variant, color }: any) => (
    <div data-testid="loading">
      Loading {size} {variant} {color}
    </div>
  ),
}));

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'student' as const,
};

const mockAlerts = [
  {
    id: '1',
    variant: 'success' as const,
    title: 'Success',
    content: 'Operation completed successfully',
    dismissible: true,
    onDismiss: jest.fn(),
  },
  {
    id: '2',
    variant: 'error' as const,
    content: 'An error occurred',
  },
];

describe('Layout', () => {
  beforeEach(() => {
    // Reset document title and meta tags
    document.title = '';
    const existingMeta = document.querySelector('meta[name="description"]');
    if (existingMeta) {
      existingMeta.remove();
    }
  });

  it('renders children content', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders header and footer by default', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('hides header when hideHeader is true', () => {
    render(
      <Layout hideHeader>
        <div>Content</div>
      </Layout>
    );

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('hides footer when hideFooter is true', () => {
    render(
      <Layout hideFooter>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('sets document title', async () => {
    render(
      <Layout title="Test Page">
        <div>Content</div>
      </Layout>
    );

    await waitFor(() => {
      expect(document.title).toBe('Test Page | Qindil');
    });
  });

  it('sets document title without appending Qindil if already included', async () => {
    render(
      <Layout title="Test Page | Qindil">
        <div>Content</div>
      </Layout>
    );

    await waitFor(() => {
      expect(document.title).toBe('Test Page | Qindil');
    });
  });

  it('sets meta description', async () => {
    render(
      <Layout description="Test description">
        <div>Content</div>
      </Layout>
    );

    await waitFor(() => {
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      expect(metaDescription).toHaveAttribute('content', 'Test description');
    });
  });

  it('shows loading overlay when isLoading is true', () => {
    render(
      <Layout isLoading loadingMessage="Please wait...">
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders alerts', () => {
    render(
      <Layout alerts={mockAlerts}>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByTestId('alert-success')).toBeInTheDocument();
    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(
      screen.getByText('Operation completed successfully')
    ).toBeInTheDocument();
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('applies custom className to main content', () => {
    const { container } = render(
      <Layout className="custom-main">
        <div>Content</div>
      </Layout>
    );

    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('custom-main');
  });

  it('applies custom containerClassName', () => {
    const { container } = render(
      <Layout containerClassName="custom-container">
        <div>Content</div>
      </Layout>
    );

    expect(container.firstChild).toHaveClass('custom-container');
  });

  describe('Layout variants', () => {
    it('renders default variant correctly', () => {
      const { container } = render(
        <Layout variant="default">
          <div>Content</div>
        </Layout>
      );

      expect(container.firstChild).toHaveClass(
        'min-h-screen',
        'flex',
        'flex-col'
      );
    });

    it('renders centered variant correctly', () => {
      const { container } = render(
        <Layout variant="centered">
          <div>Content</div>
        </Layout>
      );

      expect(container.firstChild).toHaveClass(
        'items-center',
        'justify-center'
      );
    });

    it('renders full-width variant correctly', () => {
      const { container } = render(
        <Layout variant="full-width">
          <div>Content</div>
        </Layout>
      );

      expect(container.firstChild).toHaveClass('w-full');
    });

    it('renders sidebar variant correctly', () => {
      const { container } = render(
        <Layout variant="sidebar">
          <div>Content</div>
        </Layout>
      );

      expect(container.firstChild).toHaveClass('lg:flex-row');
    });
  });

  it('passes header props correctly', () => {
    render(
      <Layout header={{ isAuthenticated: true, user: mockUser }}>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('User: John Doe')).toBeInTheDocument();
  });

  it('passes footer props correctly', () => {
    render(
      <Layout footer={{ brandName: 'Custom Brand' }}>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('Footer - Custom Brand')).toBeInTheDocument();
  });
});

describe('AuthenticatedLayout', () => {
  it('renders with authenticated user', () => {
    const mockOnLogout = jest.fn();
    render(
      <AuthenticatedLayout user={mockUser} onLogout={mockOnLogout}>
        <div>Authenticated Content</div>
      </AuthenticatedLayout>
    );

    expect(screen.getByText('User: John Doe')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Authenticated Content')).toBeInTheDocument();
  });
});

describe('GuestLayout', () => {
  it('renders with login option', () => {
    const mockOnLogin = jest.fn();
    render(
      <GuestLayout onLogin={mockOnLogin}>
        <div>Guest Content</div>
      </GuestLayout>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Guest Content')).toBeInTheDocument();
  });
});

describe('AuthLayout', () => {
  it('renders centered layout without header and footer', () => {
    render(
      <AuthLayout>
        <div>Auth Form</div>
      </AuthLayout>
    );

    expect(screen.getByText('Auth Form')).toBeInTheDocument();
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('applies gradient background', () => {
    const { container } = render(
      <AuthLayout>
        <div>Auth Form</div>
      </AuthLayout>
    );

    expect(container.firstChild).toHaveClass('bg-gradient-to-br');
  });
});
