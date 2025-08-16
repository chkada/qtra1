import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Breadcrumb, BreadcrumbItem, createBreadcrumbsFromPath, useBreadcrumbs } from './Breadcrumb';
import { renderHook, act } from '@testing-library/react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Home: () => <div data-testid="home-icon" />,
}));

const mockBreadcrumbItems: BreadcrumbItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
  },
  {
    id: 'courses',
    label: 'Courses',
    href: '/courses',
  },
  {
    id: 'mathematics',
    label: 'Mathematics',
    href: '/courses/mathematics',
  },
  {
    id: 'algebra',
    label: 'Algebra',
    current: true,
  },
];

const CustomIcon = () => <div data-testid="custom-icon" />;

describe('Breadcrumb', () => {
  const defaultProps = {
    items: mockBreadcrumbItems,
  };

  describe('Rendering', () => {
    it('renders breadcrumb items correctly', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
      expect(screen.getByText('Algebra')).toBeInTheDocument();
    });

    it('renders home icon by default', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    });

    it('does not render home icon when showHomeIcon is false', () => {
      render(<Breadcrumb {...defaultProps} showHomeIcon={false} />);
      
      expect(screen.queryByTestId('home-icon')).not.toBeInTheDocument();
    });

    it('renders custom icons for items', () => {
      const itemsWithIcon = [
        {
          id: 'custom',
          label: 'Custom',
          icon: CustomIcon,
        },
      ];
      
      render(<Breadcrumb items={itemsWithIcon} />);
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders separators between items', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      const separators = screen.getAllByTestId('chevron-right-icon');
      expect(separators).toHaveLength(3); // 4 items = 3 separators
    });

    it('renders custom separator', () => {
      const customSeparator = <span data-testid="custom-separator">|</span>;
      render(<Breadcrumb {...defaultProps} separator={customSeparator} />);
      
      const separators = screen.getAllByTestId('custom-separator');
      expect(separators).toHaveLength(3);
    });

    it('applies custom className', () => {
      const { container } = render(
        <Breadcrumb {...defaultProps} className="custom-breadcrumb" />
      );
      
      expect(container.querySelector('.custom-breadcrumb')).toBeInTheDocument();
    });

    it('applies correct size classes', () => {
      const { rerender } = render(<Breadcrumb {...defaultProps} size="sm" />);
      expect(document.querySelector('.text-xs')).toBeInTheDocument();
      
      rerender(<Breadcrumb {...defaultProps} size="lg" />);
      expect(document.querySelector('.text-base')).toBeInTheDocument();
    });

    it('hides on mobile when showOnMobile is false', () => {
      const { container } = render(
        <Breadcrumb {...defaultProps} showOnMobile={false} />
      );
      
      expect(container.querySelector('.hidden.sm\\:flex')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders clickable links for items with href', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveAttribute('href', '/');
      
      const coursesLink = screen.getByRole('link', { name: /courses/i });
      expect(coursesLink).toHaveAttribute('href', '/courses');
    });

    it('renders current item as non-clickable', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      const currentItem = screen.getByText('Algebra');
      expect(currentItem).not.toHaveAttribute('href');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });

    it('calls onItemClick when item is clicked', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();
      
      render(<Breadcrumb {...defaultProps} onItemClick={onItemClick} />);
      
      const homeItem = screen.getByRole('button', { name: /home/i });
      await user.click(homeItem);
      
      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'home', label: 'Home' }),
        0
      );
    });

    it('does not call onItemClick for current item', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();
      
      render(<Breadcrumb {...defaultProps} onItemClick={onItemClick} />);
      
      const currentItem = screen.getByText('Algebra');
      await user.click(currentItem);
      
      expect(onItemClick).not.toHaveBeenCalled();
    });

    it('prevents default when onItemClick is provided', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();
      
      render(<Breadcrumb {...defaultProps} onItemClick={onItemClick} />);
      
      const homeItem = screen.getByRole('button', { name: /home/i });
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
      
      fireEvent.click(homeItem, clickEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Item Collapsing', () => {
    const manyItems: BreadcrumbItem[] = [
      { id: '1', label: 'Item 1', href: '/1' },
      { id: '2', label: 'Item 2', href: '/2' },
      { id: '3', label: 'Item 3', href: '/3' },
      { id: '4', label: 'Item 4', href: '/4' },
      { id: '5', label: 'Item 5', href: '/5' },
      { id: '6', label: 'Item 6', href: '/6' },
      { id: '7', label: 'Item 7', current: true },
    ];

    it('shows ellipsis when items exceed maxItems', () => {
      render(<Breadcrumb items={manyItems} maxItems={5} />);
      
      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('shows all items when count is within maxItems', () => {
      render(<Breadcrumb items={manyItems} maxItems={10} />);
      
      expect(screen.queryByText('...')).not.toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 7')).toBeInTheDocument();
    });

    it('does not make ellipsis clickable', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();
      
      render(<Breadcrumb items={manyItems} maxItems={5} onItemClick={onItemClick} />);
      
      const ellipsis = screen.getByText('...');
      await user.click(ellipsis);
      
      expect(onItemClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper navigation landmark', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb navigation');
    });

    it('uses custom aria-label', () => {
      render(<Breadcrumb {...defaultProps} ariaLabel="Custom navigation" />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Custom navigation');
    });

    it('marks current item with aria-current', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      const currentItem = screen.getByText('Algebra');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });

    it('hides decorative elements from screen readers', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      const separators = screen.getAllByTestId('chevron-right-icon');
      separators.forEach(separator => {
        expect(separator.closest('[aria-hidden="true"]')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('renders nothing when items array is empty', () => {
      const { container } = render(<Breadcrumb items={[]} />);
      
      expect(container.firstChild).toBeNull();
    });
  });
});

describe('createBreadcrumbsFromPath', () => {
  it('creates breadcrumbs from simple path', () => {
    const breadcrumbs = createBreadcrumbsFromPath('/courses/mathematics');
    
    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0]).toEqual({
      id: 'home',
      label: 'Home',
      href: '/',
    });
    expect(breadcrumbs[1]).toEqual({
      id: 'courses',
      label: 'Courses',
      href: '/courses',
    });
    expect(breadcrumbs[2]).toEqual({
      id: 'mathematics',
      label: 'Mathematics',
      href: undefined,
      current: true,
    });
  });

  it('uses custom path labels', () => {
    const pathLabels = {
      '': 'Dashboard',
      'courses': 'All Courses',
      'mathematics': 'Math Courses',
    };
    
    const breadcrumbs = createBreadcrumbsFromPath('/courses/mathematics', pathLabels);
    
    expect(breadcrumbs[0].label).toBe('Dashboard');
    expect(breadcrumbs[1].label).toBe('All Courses');
    expect(breadcrumbs[2].label).toBe('Math Courses');
  });

  it('handles root path', () => {
    const breadcrumbs = createBreadcrumbsFromPath('/');
    
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      id: 'home',
      label: 'Home',
      href: '/',
    });
  });

  it('capitalizes segment names when no labels provided', () => {
    const breadcrumbs = createBreadcrumbsFromPath('/user-profile/settings');
    
    expect(breadcrumbs[1].label).toBe('User-profile');
    expect(breadcrumbs[2].label).toBe('Settings');
  });
});

describe('useBreadcrumbs', () => {
  it('initializes with provided items', () => {
    const initialItems = [{ id: 'test', label: 'Test' }];
    const { result } = renderHook(() => useBreadcrumbs(initialItems));
    
    expect(result.current.items).toEqual(initialItems);
  });

  it('adds new items', () => {
    const { result } = renderHook(() => useBreadcrumbs());
    
    act(() => {
      result.current.addItem({ id: 'new', label: 'New Item' });
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({ id: 'new', label: 'New Item' });
  });

  it('removes items by id', () => {
    const initialItems = [
      { id: 'item1', label: 'Item 1' },
      { id: 'item2', label: 'Item 2' },
    ];
    const { result } = renderHook(() => useBreadcrumbs(initialItems));
    
    act(() => {
      result.current.removeItem('item1');
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('item2');
  });

  it('updates items', () => {
    const initialItems = [{ id: 'item1', label: 'Item 1' }];
    const { result } = renderHook(() => useBreadcrumbs(initialItems));
    
    act(() => {
      result.current.updateItem('item1', { label: 'Updated Item' });
    });
    
    expect(result.current.items[0].label).toBe('Updated Item');
  });

  it('sets current item', () => {
    const initialItems = [
      { id: 'item1', label: 'Item 1', current: true },
      { id: 'item2', label: 'Item 2' },
    ];
    const { result } = renderHook(() => useBreadcrumbs(initialItems));
    
    act(() => {
      result.current.setCurrentItem('item2');
    });
    
    expect(result.current.items[0].current).toBe(false);
    expect(result.current.items[1].current).toBe(true);
  });

  it('resets items', () => {
    const initialItems = [{ id: 'item1', label: 'Item 1' }];
    const { result } = renderHook(() => useBreadcrumbs(initialItems));
    
    const newItems = [{ id: 'new', label: 'New' }];
    
    act(() => {
      result.current.reset(newItems);
    });
    
    expect(result.current.items).toEqual(newItems);
  });

  it('resets to empty array when no items provided', () => {
    const initialItems = [{ id: 'item1', label: 'Item 1' }];
    const { result } = renderHook(() => useBreadcrumbs(initialItems));
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.items).toEqual([]);
  });
});