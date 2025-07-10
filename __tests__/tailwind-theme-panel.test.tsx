import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TailwindThemePanel } from '@/components/ui/ui-builder/internal/tailwind-theme-panel';
import { ComponentLayer } from '@/components/ui/ui-builder/types';

// Mock the stores
jest.mock('@/lib/ui-builder/store/layer-store', () => ({
  useLayerStore: jest.fn(),
}));

// Import the mocked hook after mocking
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';

const mockUseLayerStore = useLayerStore as jest.MockedFunction<typeof useLayerStore>;

// Mock EditorStore
jest.mock('@/lib/ui-builder/store/editor-store', () => ({
  useEditorStore: jest.fn(),
}));

// Mock theme hook
jest.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: jest.fn(),
    theme: 'light',
  }),
}));

describe('TailwindThemePanel', () => {
  const mockUpdateLayer = jest.fn();
  const mockFindLayerById = jest.fn();
  
  const mockPageLayer: ComponentLayer = {
    id: 'page-1',
    type: 'page',
    name: 'Test Page',
    props: {
      'data-theme': 'default',
      'data-color': 'blue',
      'data-border-radius': 'medium',
      'data-mode': 'light'
    },
    children: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock LayerStore with both selector and non-selector support
    const mockLayerStore = {
      updateLayer: mockUpdateLayer,
      findLayerById: mockFindLayerById,
      selectedPageId: 'page-1',
    };

    mockUseLayerStore.mockImplementation((selector) => {
      // Handle both selector function calls and direct destructuring
      if (typeof selector === 'function') {
        return selector(mockLayerStore as any);
      }
      // Return the store directly when no selector is provided
      return mockLayerStore as any;
    });
    
    mockFindLayerById.mockReturnValue(mockPageLayer);
  });

  describe('Toggle Custom Theme', () => {
    it('should render with default theme initially', () => {
      render(<TailwindThemePanel />);
      
      expect(screen.getByText('Use Custom Theme')).toBeInTheDocument();
      expect(screen.getByText('Using Your Project\'s Theme')).toBeInTheDocument();
    });

    it('should toggle to custom theme when clicked', () => {
      render(<TailwindThemePanel />);
      
      const toggleButton = screen.getByText('Use Custom Theme');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Use Default Theme')).toBeInTheDocument();
      expect(screen.queryByText('Using Your Project\'s Theme')).not.toBeInTheDocument();
    });

    it('should reset theme props when switching to default theme', async () => {
      // Start with custom theme enabled
      const pageWithCustomTheme = {
        ...mockPageLayer,
        props: {
          'data-color-theme': 'blue',
          'data-mode': 'dark',
          borderRadius: 0.5,
          style: { '--primary': 'hsl(210 100% 50%)' }
        }
      };
      
      mockFindLayerById.mockReturnValue(pageWithCustomTheme);
      
      render(<TailwindThemePanel />);
      
      // Should start with custom theme
      expect(screen.getByText('Use Default Theme')).toBeInTheDocument();
      
      // Switch to default theme
      const toggleButton = screen.getByText('Use Default Theme');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenCalledWith('page-1', {
          style: undefined,
          'data-mode': undefined,
          'data-color-theme': undefined,
          'data-border-radius': undefined,
        });
      });
    });
  });

  describe('Theme Picker', () => {
    beforeEach(() => {
      // Set up page with custom theme enabled
      const pageWithCustomTheme = {
        ...mockPageLayer,
        props: {
          'data-color-theme': 'red',
          'data-mode': 'light',
          borderRadius: 0.5
        }
      };
      mockFindLayerById.mockReturnValue(pageWithCustomTheme);
    });

    it('should render theme picker when custom theme is enabled', () => {
      render(<TailwindThemePanel />);
      
      // Enable custom theme
      const toggleButton = screen.getByText('Use Default Theme');
      expect(toggleButton).toBeInTheDocument();
      
      expect(screen.getByText('Colors')).toBeInTheDocument();
      expect(screen.getByText('Border Radius')).toBeInTheDocument();
      expect(screen.getByText('Mode')).toBeInTheDocument();
    });

    it('should render color options', () => {
      render(<TailwindThemePanel />);
      
      expect(screen.getByText('Red')).toBeInTheDocument();
      expect(screen.getByText('Blue')).toBeInTheDocument();
      expect(screen.getByText('Green')).toBeInTheDocument();
    });

    it('should select color theme', async () => {
      render(<TailwindThemePanel />);
      
      const blueButton = screen.getByText('Blue');
      fireEvent.click(blueButton);
      
      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenCalledWith('page-1', expect.objectContaining({
          'data-color-theme': 'blue',
        }));
      });
    });

    it('should render border radius options', () => {
      render(<TailwindThemePanel />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0.15')).toBeInTheDocument();
      expect(screen.getByText('0.3')).toBeInTheDocument();
      expect(screen.getByText('0.5')).toBeInTheDocument();
      expect(screen.getByText('0.75')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should select border radius', async () => {
      render(<TailwindThemePanel />);
      
      const radiusButton = screen.getByText('0.75');
      fireEvent.click(radiusButton);
      
      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenCalledWith('page-1', expect.objectContaining({
          'data-border-radius': 0.75,
        }));
      });
    });

    it('should render mode options', () => {
      render(<TailwindThemePanel />);
      
      // Verify mode section exists
      expect(screen.getByText('Mode')).toBeInTheDocument();
      
      // Should have both light and dark buttons
      expect(screen.getByText('light')).toBeInTheDocument();
      expect(screen.getByText('dark')).toBeInTheDocument();
      
      // Light button should be selected (border-2 border-primary)
      const lightButton = screen.getByText('light').closest('button');
      expect(lightButton).toHaveClass('border-2', 'border-primary');
      
      // Dark button should not be selected (no border-2 border-primary classes)
      const darkButton = screen.getByText('dark').closest('button');
      expect(darkButton).not.toHaveClass('border-2');
      expect(darkButton).not.toHaveClass('border-primary');
    });

    it('should select mode', async () => {
      render(<TailwindThemePanel />);
      
      // Click on dark button to switch mode
      const darkButton = screen.getByText('dark');
      fireEvent.click(darkButton);
      
      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenCalledWith('page-1', expect.objectContaining({
          'data-mode': 'dark',
        }));
      });
    });

    it('should show selected color with checkmark', () => {
      render(<TailwindThemePanel />);
      
      // Red should be selected by default
      const redButton = screen.getByText('Red').closest('button');
      expect(redButton).toHaveClass('border-primary', 'border-2');
    });

    it('should show selected border radius with highlight', () => {
      render(<TailwindThemePanel />);
      
      // 0.5 should be selected by default
      const radiusButton = screen.getByText('0.5').closest('button');
      expect(radiusButton).toHaveClass('border-primary', 'border-2');
    });

    it('should show selected mode with highlight', () => {
      render(<TailwindThemePanel />);
      
      // Light button should have selected styling (border-2 border-primary)
      const lightButton = screen.getByText('light').closest('button');
      expect(lightButton).toHaveClass('border-2', 'border-primary');
    });
  });

  describe('Theme Picker with invalid props', () => {
    it('should handle invalid color theme prop', () => {
      const pageWithInvalidTheme = {
        ...mockPageLayer,
        props: {
          'data-color-theme': 123, // invalid type
          'data-mode': 'light',
          borderRadius: 0.5
        }
      };
      mockFindLayerById.mockReturnValue(pageWithInvalidTheme);
      
      render(<TailwindThemePanel />);
      
      // Should fall back to 'red' as default
      const redButton = screen.getByText('Red').closest('button');
      expect(redButton).toHaveClass('border-primary', 'border-2');
    });

    it('should handle invalid mode prop', () => {
      const pageWithInvalidMode = {
        ...mockPageLayer,
        props: {
          'data-color-theme': 'red',
          'data-mode': 123, // invalid type
          borderRadius: 0.5
        }
      };
      mockFindLayerById.mockReturnValue(pageWithInvalidMode);
      
      render(<TailwindThemePanel />);
      
      // Should fall back to 'light' as default, so light button should be selected
      const lightButton = screen.getByText('light').closest('button');
      expect(lightButton).toHaveClass('border-2', 'border-primary');
    });

    it('should handle invalid border radius prop', () => {
      const pageWithInvalidRadius = {
        ...mockPageLayer,
        props: {
          'data-color-theme': 'red',
          'data-mode': 'light',
          borderRadius: 'invalid' // invalid type
        }
      };
      mockFindLayerById.mockReturnValue(pageWithInvalidRadius);
      
      render(<TailwindThemePanel />);
      
      // Should fall back to 0.5 as default
      const radiusButton = screen.getByText('0.5').closest('button');
      expect(radiusButton).toHaveClass('border-primary', 'border-2');
    });
  });

  describe('Theme application', () => {
    it('should apply complete theme style with all properties', async () => {
      render(<TailwindThemePanel />);
      
      // Enable custom theme
      const toggleButton = screen.getByText('Use Custom Theme');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenCalledWith('page-1', expect.objectContaining({
          style: expect.objectContaining({
            '--primary': expect.any(String),
            '--secondary': expect.any(String),
            '--muted': expect.any(String),
            '--accent': expect.any(String),
            '--destructive': expect.any(String),
            '--border': expect.any(String),
            '--input': expect.any(String),
            '--ring': expect.any(String),
            '--background': expect.any(String),
            '--foreground': expect.any(String),
            '--card': expect.any(String),
            '--card-foreground': expect.any(String),
            '--popover': expect.any(String),
            '--popover-foreground': expect.any(String),
            '--primary-foreground': expect.any(String),
            '--secondary-foreground': expect.any(String),
            '--muted-foreground': expect.any(String),
            '--accent-foreground': expect.any(String),
            '--destructive-foreground': expect.any(String),
            '--radius': '0.5rem',
            color: expect.any(String),
            borderColor: expect.any(String),
          }),
          'data-mode': 'light',
          'data-color-theme': 'red',
          'data-border-radius': 0.5,
        }));
      });
    });

    it('should not apply theme when disabled', async () => {
      // Start with disabled theme picker
      render(<TailwindThemePanel />);
      
      // The theme picker should not be visible when using default theme
      expect(screen.queryByText('Colors')).not.toBeInTheDocument();
    });
  });

  describe('Component data-testid attributes', () => {
    it('should add data-testid for testing', () => {
      const { container } = render(<TailwindThemePanel />);
      
      // Toggle button should be testable
      const toggleButton = screen.getByRole('button', { name: /toggle/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });
});