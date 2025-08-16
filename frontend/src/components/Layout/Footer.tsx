import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Heart,
} from 'lucide-react';

export interface FooterProps {
  /**
   * Company/brand name
   */
  brandName?: string;
  /**
   * Company description
   */
  description?: string;
  /**
   * Contact information
   */
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  /**
   * Social media links
   */
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  /**
   * Footer navigation links
   */
  links?: {
    title: string;
    items: {
      label: string;
      href: string;
    }[];
  }[];
  /**
   * Copyright text
   */
  copyright?: string;
  /**
   * Show newsletter signup
   */
  showNewsletter?: boolean;
  /**
   * Newsletter signup handler
   */
  onNewsletterSignup?: (email: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Footer component with branding, links, and contact information
 */
export const Footer = ({
  brandName = 'Qindil',
  description = 'Connecting students with qualified teachers for personalized learning experiences.',
  contact = {
    email: 'hello@qindil.com',
    phone: '+1 (555) 123-4567',
    address: '123 Education St, Learning City, LC 12345',
  },
  socialLinks = {},
  links = [],
  copyright,
  showNewsletter = true,
  onNewsletterSignup,
  className = '',
}: FooterProps) => {
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Default footer links
  const defaultLinks = [
    {
      title: 'Platform',
      items: [
        { label: 'Find Teachers', href: '/teachers' },
        { label: 'How it Works', href: '/how-it-works' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Success Stories', href: '/testimonials' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', href: '/help' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Community', href: '/community' },
      ],
    },
    {
      title: 'Company',
      items: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Blog', href: '/blog' },
        { label: 'Press', href: '/press' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Accessibility', href: '/accessibility' },
      ],
    },
  ];

  const footerLinks = links.length > 0 ? links : defaultLinks;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setIsSubmitting(true);
    try {
      if (onNewsletterSignup) {
        await onNewsletterSignup(newsletterEmail);
      }
      setNewsletterEmail('');
    } catch (error) {
      console.error('Newsletter signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
  };

  const currentYear = new Date().getFullYear();
  const copyrightText =
    copyright || `© ${currentYear} ${brandName}. All rights reserved.`;

  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-aguirre-sky rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {brandName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xl font-bold">{brandName}</span>
              </div>

              <p className="text-gray-300 mb-6 max-w-sm">{description}</p>

              {/* Contact Info */}
              <div className="space-y-3">
                {contact.email && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Mail className="w-4 h-4 text-aguirre-sky" />
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:text-aguirre-sky transition-colors"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Phone className="w-4 h-4 text-aguirre-sky" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="hover:text-aguirre-sky transition-colors"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}

                {contact.address && (
                  <div className="flex items-start space-x-3 text-gray-300">
                    <MapPin className="w-4 h-4 text-aguirre-sky mt-0.5" />
                    <span>{contact.address}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {Object.keys(socialLinks).length > 0 && (
                <div className="flex space-x-4 mt-6">
                  {Object.entries(socialLinks).map(([platform, url]) => {
                    const IconComponent =
                      socialIcons[platform as keyof typeof socialIcons];
                    if (!IconComponent || !url) return null;

                    return (
                      <motion.a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-aguirre-sky hover:bg-gray-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Follow us on ${platform}`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </motion.a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Links */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerLinks.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                      {section.title}
                    </h3>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <Link
                            href={item.href}
                            className="text-gray-300 hover:text-aguirre-sky transition-colors text-sm"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            {showNewsletter && (
              <div className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  Stay Updated
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get the latest updates and educational content delivered to
                  your inbox.
                </p>

                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="newsletter-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aguirre-sky focus:border-transparent"
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-aguirre-sky text-white px-4 py-2 rounded-md font-medium hover:bg-aguirre-sky/90 focus:outline-none focus:ring-2 focus:ring-aguirre-sky focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </motion.button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">{copyrightText}</div>

            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for education</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
