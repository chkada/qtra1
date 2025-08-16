import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from './Footer';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
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
  Facebook: () => <div data-testid="facebook-icon" />,
  Twitter: () => <div data-testid="twitter-icon" />,
  Instagram: () => <div data-testid="instagram-icon" />,
  Linkedin: () => <div data-testid="linkedin-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Heart: () => <div data-testid="heart-icon" />,
}));

const mockContact = {
  email: 'test@example.com',
  phone: '+1 234 567 8900',
  address: '123 Test Street, Test City, TC 12345',
};

const mockSocialLinks = {
  facebook: 'https://facebook.com/qindil',
  twitter: 'https://twitter.com/qindil',
  instagram: 'https://instagram.com/qindil',
  linkedin: 'https://linkedin.com/company/qindil',
};

const mockLinks = [
  {
    title: 'Custom Section',
    items: [
      { label: 'Custom Link 1', href: '/custom1' },
      { label: 'Custom Link 2', href: '/custom2' },
    ],
  },
];

describe('Footer', () => {
  it('renders with default props', () => {
    render(<Footer />);

    expect(screen.getByText('Qindil')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Connecting students with qualified teachers for personalized learning experiences.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Made with')).toBeInTheDocument();
    expect(screen.getByText('for education')).toBeInTheDocument();
  });

  it('renders custom brand name and description', () => {
    render(
      <Footer brandName="Custom Brand" description="Custom description text" />
    );

    expect(screen.getByText('Custom Brand')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<Footer contact={mockContact} />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1 234 567 8900')).toBeInTheDocument();
    expect(
      screen.getByText('123 Test Street, Test City, TC 12345')
    ).toBeInTheDocument();

    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
    expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer socialLinks={mockSocialLinks} />);

    expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
    expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
    expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();

    const facebookLink = screen.getByLabelText('Follow us on facebook');
    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/qindil');
    expect(facebookLink).toHaveAttribute('target', '_blank');
    expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders custom footer links', () => {
    render(<Footer links={mockLinks} />);

    expect(screen.getByText('Custom Section')).toBeInTheDocument();
    expect(screen.getByText('Custom Link 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Link 2')).toBeInTheDocument();
  });

  it('renders default footer links when none provided', () => {
    render(<Footer />);

    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();

    expect(screen.getByText('Find Teachers')).toBeInTheDocument();
    expect(screen.getByText('Help Center')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('renders newsletter signup by default', () => {
    render(<Footer />);

    expect(screen.getByText('Stay Updated')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });

  it('hides newsletter when showNewsletter is false', () => {
    render(<Footer showNewsletter={false} />);

    expect(screen.queryByText('Stay Updated')).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Enter your email')
    ).not.toBeInTheDocument();
  });

  it('handles newsletter signup', async () => {
    const mockOnNewsletterSignup = jest.fn().mockResolvedValue(undefined);
    render(<Footer onNewsletterSignup={mockOnNewsletterSignup} />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const subscribeButton = screen.getByText('Subscribe');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(subscribeButton);

    expect(mockOnNewsletterSignup).toHaveBeenCalledWith('test@example.com');

    await waitFor(() => {
      expect(emailInput).toHaveValue('');
    });
  });

  it('shows loading state during newsletter submission', async () => {
    const mockOnNewsletterSignup = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    render(<Footer onNewsletterSignup={mockOnNewsletterSignup} />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const subscribeButton = screen.getByText('Subscribe');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(subscribeButton);

    expect(screen.getByText('Subscribing...')).toBeInTheDocument();
    expect(subscribeButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('Subscribe')).toBeInTheDocument();
    });
  });

  it('prevents empty email submission', () => {
    const mockOnNewsletterSignup = jest.fn();
    render(<Footer onNewsletterSignup={mockOnNewsletterSignup} />);

    const subscribeButton = screen.getByText('Subscribe');
    fireEvent.click(subscribeButton);

    expect(mockOnNewsletterSignup).not.toHaveBeenCalled();
  });

  it('renders custom copyright text', () => {
    render(<Footer copyright="Custom copyright 2024" />);

    expect(screen.getByText('Custom copyright 2024')).toBeInTheDocument();
  });

  it('renders current year in default copyright', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);

    expect(
      screen.getByText(`© ${currentYear} Qindil. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Footer className="custom-footer" />);

    expect(container.firstChild).toHaveClass('custom-footer');
  });

  it('has proper accessibility attributes', () => {
    render(<Footer />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    expect(emailInput).toHaveAttribute('id', 'newsletter-email');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toBeRequired();

    const label = screen.getByLabelText('Email address');
    expect(label).toBeInTheDocument();
  });

  it('renders brand initial correctly', () => {
    render(<Footer brandName="TestBrand" />);

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('handles contact links correctly', () => {
    render(<Footer contact={mockContact} />);

    const emailLink = screen.getByText('test@example.com');
    const phoneLink = screen.getByText('+1 234 567 8900');

    expect(emailLink.closest('a')).toHaveAttribute(
      'href',
      'mailto:test@example.com'
    );
    expect(phoneLink.closest('a')).toHaveAttribute(
      'href',
      'tel:+1 234 567 8900'
    );
  });

  it('handles missing contact information gracefully', () => {
    render(<Footer contact={{}} />);

    expect(screen.queryByTestId('mail-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('phone-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('map-pin-icon')).not.toBeInTheDocument();
  });

  it('handles missing social links gracefully', () => {
    render(<Footer socialLinks={{}} />);

    expect(screen.queryByTestId('facebook-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('twitter-icon')).not.toBeInTheDocument();
  });
});
