import React from 'react';
import { render, screen } from '@testing-library/react';
import { Icon, iconVariants, iconNames } from '@/components/ui/ui-builder/icon';

// Mock console.error to test error cases
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Home: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
    <svg ref={ref} data-testid="home-icon" {...props}>
      <path d="home-icon-path" />
    </svg>
  )),
  User: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
    <svg ref={ref} data-testid="user-icon" {...props}>
      <path d="user-icon-path" />
    </svg>
  )),
  Search: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
    <svg ref={ref} data-testid="search-icon" {...props}>
      <path d="search-icon-path" />
    </svg>
  )),
  // Mock an invalid icon that doesn't exist
  LucideInvalidIcon: undefined,
  icons: 'not-an-icon', // Should be filtered out
}));

describe('Icon', () => {
  beforeEach(() => {
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it('should render with default variants', () => {
    render(<Icon iconName="Home" data-testid="icon" />);
    
    const icon = screen.getByTestId('home-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('inline-flex');
    expect(icon).toHaveClass('h-6'); // medium size
    expect(icon).toHaveClass('w-6');
    expect(icon).toHaveClass('text-primary');
    expect(icon).toHaveClass('rotate-0');
  });

  it('should apply custom size variants', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    const expectedClasses = [
      ['h-4', 'w-4'],
      ['h-6', 'w-6'],
      ['h-8', 'w-8']
    ];

    sizes.forEach((size, index) => {
      render(<Icon iconName="User" size={size} data-testid={`icon-${size}`} />);
      const icon = screen.getByTestId('user-icon');
      expect(icon).toHaveClass(expectedClasses[index][0]);
      expect(icon).toHaveClass(expectedClasses[index][1]);
    });
  });

  it('should apply custom color variants', () => {
    const colors = [
      'accent', 'accentForeground', 'primary', 'primaryForeground',
      'secondary', 'secondaryForeground', 'destructive', 'destructiveForeground',
      'muted', 'mutedForeground', 'background', 'foreground'
    ] as const;
    
    const expectedClasses = [
      'text-accent', 'text-accent-foreground', 'text-primary', 'text-primary-foreground',
      'text-secondary', 'text-secondary-foreground', 'text-destructive', 'text-destructive-foreground',
      'text-muted', 'text-muted-foreground', 'text-background', 'text-foreground'
    ];

    colors.forEach((color, index) => {
      render(<Icon iconName="Search" color={color} data-testid={`icon-${color}`} />);
      const icon = screen.getByTestId('search-icon');
      expect(icon).toHaveClass(expectedClasses[index]);
    });
  });

  it('should apply custom rotate variants', () => {
    const rotateValues = ['none', '90', '180', '270'] as const;
    const expectedClasses = ['rotate-0', 'rotate-90', 'rotate-180', 'rotate-270'];

    rotateValues.forEach((rotate, index) => {
      render(<Icon iconName="Home" rotate={rotate} data-testid={`icon-${rotate}`} />);
      const icon = screen.getByTestId('home-icon');
      expect(icon).toHaveClass(expectedClasses[index]);
    });
  });

  it('should combine multiple variants', () => {
    render(
      <Icon 
        iconName="User"
        size="large"
        color="destructive"
        rotate="180"
        data-testid="combined-icon"
      />
    );

    const icon = screen.getByTestId('user-icon');
    expect(icon).toHaveClass('inline-flex');
    expect(icon).toHaveClass('h-8');
    expect(icon).toHaveClass('w-8');
    expect(icon).toHaveClass('text-destructive');
    expect(icon).toHaveClass('rotate-180');
  });

  it('should accept custom className', () => {
    render(<Icon iconName="Home" className="custom-icon-class" />);
    
    const icon = screen.getByTestId('home-icon');
    expect(icon).toHaveClass('custom-icon-class');
    expect(icon).toHaveClass('inline-flex'); // Should still have default classes
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<SVGSVGElement>();
    render(<Icon iconName="Home" ref={ref} />);
    
    expect(ref.current).toBeDefined();
    expect(ref.current?.tagName).toBe('svg');
  });

  it('should pass through other SVG attributes', () => {
    render(
      <Icon 
        iconName="Search"
        aria-label="Search icon"
        role="img"
        id="search-icon-id"
      />
    );

    const icon = screen.getByTestId('search-icon');
    expect(icon).toHaveAttribute('aria-label', 'Search icon');
    expect(icon).toHaveAttribute('role', 'img');
    expect(icon).toHaveAttribute('id', 'search-icon-id');
  });

  it('should render different icon components', () => {
    render(<Icon iconName="Home" />);
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    
    render(<Icon iconName="User" />);
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    
    render(<Icon iconName="Search" />);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('should handle non-existent icon gracefully', () => {
    render(<Icon iconName={'NonExistentIcon' as any} data-testid="non-existent" />);
    
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Icon "NonExistentIcon" does not exist in lucide-react'
    );
    
    // Should render nothing when icon doesn't exist
    expect(screen.queryByTestId('non-existent')).not.toBeInTheDocument();
  });

  it('should have correct displayName', () => {
    expect(Icon.displayName).toBe('Icon');
  });
});

describe('iconVariants', () => {
  it('should generate correct class for default variants', () => {
    const result = iconVariants();
    expect(result).toContain('inline-flex');
    expect(result).toContain('h-6');
    expect(result).toContain('w-6');
    expect(result).toContain('text-primary');
    expect(result).toContain('rotate-0');
  });

  it('should generate correct class for custom variants', () => {
    const result = iconVariants({
      size: 'large',
      color: 'destructive',
      rotate: '90',
    });

    expect(result).toContain('inline-flex');
    expect(result).toContain('h-8');
    expect(result).toContain('w-8');
    expect(result).toContain('text-destructive');
    expect(result).toContain('rotate-90');
  });

  it('should handle className override', () => {
    const result = iconVariants({
      className: 'custom-icon-class',
    });

    expect(result).toContain('custom-icon-class');
    expect(result).toContain('inline-flex');
  });
});

describe('iconNames', () => {
  it('should be an array of icon names', () => {
    expect(Array.isArray(iconNames)).toBe(true);
    expect(iconNames.length).toBeGreaterThan(0);
  });

  it('should contain valid icon names', () => {
    expect(iconNames).toContain('Home' as any);
    expect(iconNames).toContain('User' as any);
    expect(iconNames).toContain('Search' as any);
  });

  it('should filter out invalid entries', () => {
    // icons should be filtered out
    expect(iconNames).not.toContain('icons');
    // LucideInvalidIcon should be filtered since it starts with 'Lucide'
    expect(iconNames).not.toContain('LucideInvalidIcon');
  });

  it('should be of the correct tuple type', () => {
    // Ensure the first element exists (minimum length requirement)
    expect(iconNames[0]).toBeDefined();
  });
});