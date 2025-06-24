import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddComponentsPopover } from '@/components/ui/ui-builder/internal/components/add-component-popover';

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
        expect(screen.getByPlaceholderText('Find components')).toBeInTheDocument();
      });
    });

    it('should render component search input with search icon', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Find components')).toBeInTheDocument();
      });
    });
  });

  describe('Tab-based Component Grouping', () => {
    it('should render tabs for each component group', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        // Should show tabs for different groups - check by the formatted names
        expect(screen.getByText('Ui')).toBeInTheDocument();
        expect(screen.getByText('Components')).toBeInTheDocument();
        expect(screen.getByText('Other')).toBeInTheDocument();
      });
    });

    it('should render components with grey box previews in active tab', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        // Components in the first tab should be visible by default
        expect(screen.getByText('Button')).toBeInTheDocument();
        expect(screen.getByText('Input')).toBeInTheDocument();
        expect(screen.getByText('Card')).toBeInTheDocument();
      });

      // Check for grey box previews (muted background divs) - but they might be lazy loaded
      await waitFor(() => {
        const greyBoxes = screen.getAllByRole('generic').filter(el => 
          el.className.includes('bg-muted') || el.className.includes('rounded border')
        );
        expect(greyBoxes.length).toBeGreaterThan(0);
      });
    });

    it('should limit tabs to maximum of 3', async () => {
      // Mock registry with more than 3 groups
      const registryWithManyGroups = {
        ...mockRegistry,
        ExtraComponent1: {
          component: () => null,
          name: 'ExtraComponent1',
          from: '@/group1/component'
        },
        ExtraComponent2: {
          component: () => null,
          name: 'ExtraComponent2',
          from: '@/group2/component'
        }
      };

      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          registry: registryWithManyGroups,
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
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBeLessThanOrEqual(3);
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
        expect(screen.queryByPlaceholderText('Find components')).not.toBeInTheDocument();
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
    it('should filter components based on search input across tabs', async () => {
      render(
        <AddComponentsPopover parentLayerId="parent-1">
          <button>Add Component</button>
        </AddComponentsPopover>
      );

      const trigger = screen.getByText('Add Component');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Find components')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Find components');
      fireEvent.change(searchInput, { target: { value: 'Button' } });

      // Should still show Button
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
        expect(screen.getByPlaceholderText('Find components')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Find components');
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

    it('should handle empty registry gracefully', async () => {
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

      // Should not render tabs when no components
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });

    it('should handle single group with single tab', async () => {
      // Mock registry with only one group
      const singleGroupRegistry = {
        Button: {
          component: () => null,
          name: 'Button',
          from: '@/components/ui/button'
        },
      };

      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          registry: singleGroupRegistry,
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
        expect(screen.getByText('Ui')).toBeInTheDocument();
        expect(screen.getByText('Button')).toBeInTheDocument();
      });
    });
  });

  describe('Component Preview Boxes', () => {
    it('should render grey preview boxes for each component', async () => {
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

      // Check for preview containers - these should exist even if lazy loading is happening
      const previewContainers = screen.getAllByRole('generic').filter(el => 
        el.className.includes('flex-shrink-0') && 
        el.className.includes('w-10') && 
        el.className.includes('h-8')
      );
      
      // Should have at least one preview container for components in the active tab
      expect(previewContainers.length).toBeGreaterThan(0);
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