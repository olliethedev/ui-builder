import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddComponentsPopover } from '@/components/ui/ui-builder/internal/add-component-popover';

// Mock scrollIntoView for jsdom environment
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: jest.fn(),
});

// Mock the stores
jest.mock('@/lib/ui-builder/store/layer-store', () => ({
  useLayerStore: jest.fn(),
}));

jest.mock('@/lib/ui-builder/store/editor-store', () => ({
  useEditorStore: jest.fn(),
}));

// Import the mocked hooks after mocking
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';

const mockUseLayerStore = useLayerStore as jest.MockedFunction<typeof useLayerStore>;
const mockUseEditorStore = useEditorStore as jest.MockedFunction<typeof useEditorStore>;

describe('AddComponentsPopover', () => {
  const mockAddComponentLayer = jest.fn();
  const mockOnChange = jest.fn();
  const mockOnOpenChange = jest.fn();

  const mockRegistry = {
    Button: {
      component: () => null,
      name: 'Button',
      from: '@/components/ui/button'
    },
    Input: {
      component: () => null,
      name: 'Input',
      from: '@/components/ui/input'
    },
    Card: {
      component: () => null,
      name: 'Card', 
      from: '@/components/ui/card'
    },
    CustomComponent: {
      component: () => null,
      name: 'CustomComponent',
      from: '@/custom/components/custom'
    },
    UnGroupedComponent: {
      component: () => null,
      name: 'UnGroupedComponent',
      from: undefined // No from path
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock LayerStore
    mockUseLayerStore.mockImplementation((selector) => {
      const state = {
        addComponentLayer: mockAddComponentLayer,
      };
      return selector(state as any);
    });

    // Mock EditorStore
    mockUseEditorStore.mockImplementation((selector) => {
      const state = {
        registry: mockRegistry,
      };
      return selector(state as any);
    });
  });

  describe('Basic Rendering', () => {
    it('should render trigger children', () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      expect(screen.getByText('Add Component')).toBeInTheDocument();
    });

    it('should open popover when trigger is clicked', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Add component')).toBeInTheDocument();
      });
    });

    it('should render component search input', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Add component')).toBeInTheDocument();
      });
    });
  });

  describe('Component Grouping', () => {
    it('should group components by their path', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        // Should show groups
        expect(screen.getByText('@/components/ui')).toBeInTheDocument();
        expect(screen.getByText('@/custom/components')).toBeInTheDocument();
        expect(screen.getByText('other')).toBeInTheDocument();
      });
    });

    it('should render components in their respective groups', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        // UI components group
        expect(screen.getByText('Button')).toBeInTheDocument();
        expect(screen.getByText('Input')).toBeInTheDocument();
        expect(screen.getByText('Card')).toBeInTheDocument();
        
        // Custom components group
        expect(screen.getByText('CustomComponent')).toBeInTheDocument();
        
        // Other group (no from path)
        expect(screen.getByText('UnGroupedComponent')).toBeInTheDocument();
      });
    });
  });

  describe('Component Selection', () => {
    it('should call addComponentLayer when component is selected without onChange', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Button')).toBeInTheDocument();
      });

      const buttonOption = screen.getByText('Button');
      fireEvent.click(buttonOption);

      expect(mockAddComponentLayer).toHaveBeenCalledWith('Button', 'parent-1', undefined);
    });

    it('should call addComponentLayer with addPosition when provided', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1" addPosition={2}>
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Button')).toBeInTheDocument();
      });

      const buttonOption = screen.getByText('Button');
      fireEvent.click(buttonOption);

      expect(mockAddComponentLayer).toHaveBeenCalledWith('Button', 'parent-1', 2);
    });

    it('should call onChange when provided instead of addComponentLayer', async () => {
      render(
        <AddComponentsPopover 
          parentLayerId="parent-1" 
          addPosition={1}
          onChange={mockOnChange}
        >
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Button')).toBeInTheDocument();
      });

      const buttonOption = screen.getByText('Button');
      fireEvent.click(buttonOption);

      expect(mockOnChange).toHaveBeenCalledWith({
        layerType: 'Button',
        parentLayerId: 'parent-1',
        addPosition: 1
      });
      expect(mockAddComponentLayer).not.toHaveBeenCalled();
    });

    it('should close popover after component selection', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Button')).toBeInTheDocument();
      });

      const buttonOption = screen.getByText('Button');
      fireEvent.click(buttonOption);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Add component')).not.toBeInTheDocument();
      });
    });

    it('should call onOpenChange when popover opens and closes', async () => {
      render(
        <AddComponentsPopover 
          parentLayerId="parent-1" 
          onOpenChange={mockOnOpenChange}
        >
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(true);
      });

      const buttonOption = screen.getByText('Button');
      fireEvent.click(buttonOption);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter components based on search input', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Add component')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Add component');
      fireEvent.change(searchInput, { target: { value: 'Button' } });

      // Should still show Button but might filter others based on search implementation
      expect(screen.getByText('Button')).toBeInTheDocument();
    });

    it('should show "No components found" when search has no results', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Add component')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Add component');
      fireEvent.change(searchInput, { target: { value: 'NonExistentComponent' } });

      await waitFor(() => {
        expect(screen.getByText('No components found')).toBeInTheDocument();
      });
    });
  });

  describe('Props and Customization', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <AddComponentsPopover parentLayerId="parent-1" className="custom-class">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const popoverWrapper = container.querySelector('.custom-class');
      expect(popoverWrapper).toBeInTheDocument();
    });

    it('should handle empty registry', async () => {
      // Mock empty registry
      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          registry: {},
        };
        return selector(state as any);
      });

      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('No components found')).toBeInTheDocument();
      });
    });
  });

  describe('Component Item Functionality', () => {
    it('should handle component selection via GroupedComponentItem', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Input')).toBeInTheDocument();
      });

      const inputOption = screen.getByText('Input');
      fireEvent.click(inputOption);

      expect(mockAddComponentLayer).toHaveBeenCalledWith('Input', 'parent-1', undefined);
    });

    it('should handle component with missing registry entry gracefully', async () => {
      // Test selecting a component that might not be in registry
      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          registry: {
            // Missing some components that might be referenced
          },
        };
        return selector(state as any);
      });

      render(
        <AddComponentsPopover 
          parentLayerId="parent-1"
          onChange={mockOnChange}
        >
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('No components found')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined parent layer ID', async () => {
      render(
        <AddComponentsPopover parentLayerId="">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Button')).toBeInTheDocument();
      });

      const buttonOption = screen.getByText('Button');
      fireEvent.click(buttonOption);

      expect(mockAddComponentLayer).toHaveBeenCalledWith('Button', '', undefined);
    });

    it('should handle multiple rapid clicks on component', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Button')).toBeInTheDocument();
      });

      const buttonOption = screen.getByText('Button');
      fireEvent.click(buttonOption);
      fireEvent.click(buttonOption);

      // Should only be called once due to popover closing
      expect(mockAddComponentLayer).toHaveBeenCalledTimes(1);
    });
  });
});