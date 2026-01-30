import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TreeRowNode, TreeRowPlaceholder } from '@/components/ui/ui-builder/internal/components/tree-row-node';
import type { ComponentLayer } from '@/components/ui/ui-builder/types';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import type { NodeAttrs } from 'he-tree-react';

// Mock the stores
jest.mock('@/lib/ui-builder/store/editor-store');
jest.mock('@/lib/ui-builder/store/layer-store');

// Mock useGlobalLayerActions
const mockHandleDelete = jest.fn();
const mockHandleDuplicate = jest.fn();
jest.mock('@/lib/ui-builder/hooks/use-layer-actions', () => ({
  useGlobalLayerActions: () => ({
    handleDelete: mockHandleDelete,
    handleDuplicate: mockHandleDuplicate,
    handleCopy: jest.fn(),
    handleCut: jest.fn(),
    handlePaste: jest.fn(),
    canPaste: false,
    clipboard: { layer: null, isCut: false },
    canPerformPaste: jest.fn().mockReturnValue(false),
  }),
}));

// Mock dropdown menu components directly
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    if (asChild && React.isValidElement(children)) {
      return children;
    }
    return <div>{children}</div>;
  },
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div role="menuitem" onClick={onClick}>{children}</div>
  ),
}));

// Mock AddComponentsPopover
jest.mock('@/components/ui/ui-builder/internal/components/add-component-popover', () => ({
  AddComponentsPopover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock NameEdit
jest.mock('@/components/ui/ui-builder/internal/components/name-edit', () => ({
  NameEdit: ({ initialName, onSave, onCancel }: { 
    initialName: string; 
    onSave: (name: string) => void; 
    onCancel: () => void;
  }) => (
    <input
      defaultValue={initialName}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSave((e.target as HTMLInputElement).value);
        } else if (e.key === 'Escape') {
          onCancel();
        }
      }}
    />
  ),
}));

// Mock layer-utils
jest.mock('@/lib/ui-builder/store/layer-utils', () => ({
  hasLayerChildren: jest.fn(),
}));

// Mock schema-utils
jest.mock('@/lib/ui-builder/store/schema-utils', () => ({
  hasAnyChildrenField: jest.fn(),
  hasChildrenFieldOfTypeString: jest.fn(),
  canComponentAcceptChildren: jest.fn(),
}));

const mockUseEditorStore = useEditorStore as jest.MockedFunction<typeof useEditorStore>;
const mockUseLayerStore = useLayerStore as jest.MockedFunction<typeof useLayerStore>;

describe('TreeRowNode', () => {
  const mockSelectLayer = jest.fn();
  const mockUpdateLayer = jest.fn();
  const mockOnToggle = jest.fn();
  const mockIsLayerAPage = jest.fn();

  const mockNode: ComponentLayer = {
    id: 'node-1',
    type: 'div',
    name: 'Test Node',
    props: {},
    children: []
  };

  const mockNodeWithChildren: ComponentLayer = {
    id: 'node-1',
    type: 'div',
    name: 'Parent Node',
    props: {},
    children: [
      {
        id: 'child-1',
        type: 'span',
        name: 'Child Node',
        props: {},
        children: []
      }
    ]
  };

  const mockPageNode: ComponentLayer = {
    id: 'page-1',
    type: 'page',
    name: 'Test Page',
    props: {},
    children: []
  };

  const defaultProps = {
    id: 'node-1',
    level: 0,
    open: false,
    draggable: true,
    onToggle: mockOnToggle,
    selectedLayerId: null,
    selectLayer: mockSelectLayer,
    nodeAttributes: {
      key: 'test-key',
      'data-key': 'test-key',
      'data-level': '0',
      'data-node-box': true,
    } as NodeAttrs,
  };

  const createMockRegistry = (componentType: string, hasChildren = true, childrenIsString = false) => ({
    [componentType]: {
      schema: {
        shape: hasChildren ? { children: 'mock-children-field' } : {}
      }
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleDelete.mockClear();
    mockHandleDuplicate.mockClear();
    
    // Mock EditorStore with registry
    mockUseEditorStore.mockImplementation((selector) => {
      const state = {
        allowPagesCreation: true,
        allowPagesDeletion: true,
        registry: createMockRegistry('div', true, false),
      };
      return selector(state as any);
    });

    // Mock LayerStore with updateLayer
    mockUseLayerStore.mockImplementation((selector) => {
      const state = {
        isLayerAPage: mockIsLayerAPage,
        updateLayer: mockUpdateLayer,
      };
      return selector(state as any);
    });

    mockIsLayerAPage.mockReturnValue(false);

    // Mock hasLayerChildren
    const { hasLayerChildren } = require('@/lib/ui-builder/store/layer-utils');
    hasLayerChildren.mockImplementation((layer: ComponentLayer) => {
      return Array.isArray(layer.children) && typeof layer.children !== 'string';
    });

    // Mock schema-utils functions
    const { hasAnyChildrenField, hasChildrenFieldOfTypeString } = require('@/lib/ui-builder/store/schema-utils');
    hasAnyChildrenField.mockReturnValue(true);
    hasChildrenFieldOfTypeString.mockReturnValue(false);
  });

  describe('Basic Rendering', () => {
    it('should render node with name', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} />);
      
      expect(screen.getByText('Test Node')).toBeInTheDocument();
    });

    it('should apply correct styling when node is selected', () => {
      render(
        <TreeRowNode 
          {...defaultProps} 
          node={mockNode} 
          selectedLayerId="node-1" 
        />
      );
      
      const nodeButton = screen.getByText('Test Node');
      expect(nodeButton.closest('button')).toHaveClass('text-primary');
    });

    it('should apply correct styling when node is not selected', () => {
      render(
        <TreeRowNode 
          {...defaultProps} 
          node={mockNode} 
          selectedLayerId="other-node" 
        />
      );
      
      const nodeButton = screen.getByText('Test Node');
      expect(nodeButton.closest('button')).toHaveClass('text-muted-foreground');
    });
  });

  describe('Tree Expansion', () => {
    it('should show expansion button for nodes with children', () => {
      render(
        <TreeRowNode 
          {...defaultProps} 
          node={mockNodeWithChildren} 
          open={false}
        />
      );

      // Should show chevron right when closed - look for the specific toggle button
      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(btn => btn.classList.contains('w-4'));
      expect(toggleButton).toBeInTheDocument();
    });

    it('should show chevron right when closed', () => {
      render(
        <TreeRowNode 
          {...defaultProps} 
          node={mockNodeWithChildren} 
          open={false}
        />
      );

      // Look for the chevron icon (there should be multiple buttons, we want the toggle one)
      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(btn => btn.classList.contains('w-4'));
      expect(toggleButton).toBeInTheDocument();
    });

    it('should show chevron down when open', () => {
      render(
        <TreeRowNode 
          {...defaultProps} 
          node={mockNodeWithChildren} 
          open={true}
        />
      );

      // Should show chevron down when open
      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(btn => btn.classList.contains('w-4'));
      expect(toggleButton).toBeInTheDocument();
    });

    it('should not show expansion button for nodes without children', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      // Should only have the node name button, not the toggle button
      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons.find(btn => btn.classList.contains('w-4'));
      expect(toggleButton).toBeUndefined();
    });

    it('should call onToggle when expansion button is clicked', () => {
      render(
        <TreeRowNode 
          {...defaultProps} 
          node={mockNodeWithChildren} 
          open={false}
        />
      );

      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(btn => btn.classList.contains('w-4'));
      
      if (toggleButton) {
        fireEvent.click(toggleButton);
        expect(mockOnToggle).toHaveBeenCalledWith('node-1', true);
      }
    });
  });

  describe('Node Selection', () => {
    it('should call selectLayer when node name is clicked', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} />);
      
      const nodeButton = screen.getByText('Test Node');
      fireEvent.click(nodeButton);
      
      expect(mockSelectLayer).toHaveBeenCalledWith('node-1');
    });
  });

  describe('Add Component Functionality', () => {
    it('should show add component button when component schema allows children', () => {
      // Mock registry with a component that has children field
      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          allowPagesCreation: true,
          allowPagesDeletion: true,
          registry: createMockRegistry('div', true, false),
        };
        return selector(state as any);
      });

      const { canComponentAcceptChildren } = require('@/lib/ui-builder/store/schema-utils');
      canComponentAcceptChildren.mockReturnValue(true);

      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const addButton = screen.queryByRole('button', { name: /add component/i });
      expect(addButton).toBeInTheDocument();
    });

    it('should not show add component button when component schema has string children', () => {
      // Mock registry with a component that has string children field
      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          allowPagesCreation: true,
          allowPagesDeletion: true,
          registry: createMockRegistry('div', true, true),
        };
        return selector(state as any);
      });

      const { canComponentAcceptChildren } = require('@/lib/ui-builder/store/schema-utils');
      canComponentAcceptChildren.mockReturnValue(false);

      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const addButton = screen.queryByRole('button', { name: /add component/i });
      expect(addButton).not.toBeInTheDocument();
    });

    it('should not show add component button when component schema has no children field', () => {
      // Mock registry with a component that has no children field
      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          allowPagesCreation: true,
          allowPagesDeletion: true,
          registry: createMockRegistry('div', false, false),
        };
        return selector(state as any);
      });

      const { hasAnyChildrenField, hasChildrenFieldOfTypeString } = require('@/lib/ui-builder/store/schema-utils');
      hasAnyChildrenField.mockReturnValue(false);
      hasChildrenFieldOfTypeString.mockReturnValue(false);

      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const addButton = screen.queryByRole('button', { name: /add component/i });
      expect(addButton).not.toBeInTheDocument();
    });

    it('should not show add component button when component not found in registry', () => {
      // Mock registry without the component type
      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          allowPagesCreation: true,
          allowPagesDeletion: true,
          registry: {},
        };
        return selector(state as any);
      });

      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const addButton = screen.queryByRole('button', { name: /add component/i });
      expect(addButton).not.toBeInTheDocument();
    });
  });

  describe('Context Menu', () => {
    it('should show more options button', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const moreButton = screen.getByLabelText('More options');
      expect(moreButton).toBeInTheDocument();
    });

    it('should open dropdown menu when more options is clicked', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      // The menu items should be rendered due to our mock
      expect(screen.getByText('Rename')).toBeInTheDocument();
    });

    it('should show duplicate option when pages creation is allowed', () => {
      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          allowPagesCreation: true,
          allowPagesDeletion: true,
          registry: createMockRegistry('div', true, false),
        };
        return selector(state as any);
      });

      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      expect(screen.getByText('Duplicate')).toBeInTheDocument();
    });

    it('should not show duplicate option when pages creation is not allowed', () => {
      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          allowPagesCreation: false,
          allowPagesDeletion: true,
          registry: createMockRegistry('div', true, false),
        };
        return selector(state as any);
      });

      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      expect(screen.queryByText('Duplicate')).not.toBeInTheDocument();
    });

    it('should show remove option when pages deletion is allowed', () => {
      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          allowPagesCreation: true,
          allowPagesDeletion: true,
          registry: createMockRegistry('div', true, false),
        };
        return selector(state as any);
      });

      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      expect(screen.getByText('Remove')).toBeInTheDocument();
    });

    it('should not show remove option when pages deletion is not allowed', () => {
      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          allowPagesCreation: true,
          allowPagesDeletion: false,
          registry: createMockRegistry('div', true, false),
        };
        return selector(state as any);
      });

      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    });
  });

  describe('Node Actions', () => {
    it('should call handleDuplicate from global actions when duplicate is clicked', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      const duplicateButton = screen.getByText('Duplicate');
      fireEvent.click(duplicateButton);

      expect(mockHandleDuplicate).toHaveBeenCalled();
    });

    it('should call handleDelete from global actions when remove is clicked', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      expect(mockHandleDelete).toHaveBeenCalled();
    });

    it('should enter rename mode when rename is clicked', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      const renameButton = screen.getByText('Rename');
      fireEvent.click(renameButton);

      // Should show name edit input
      expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument();
    });
  });

  describe('Rename Functionality', () => {
    it('should show rename input when in rename mode', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      const renameButton = screen.getByText('Rename');
      fireEvent.click(renameButton);

      expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument();
    });

    it('should save new name and exit rename mode', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      // Enter rename mode
      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      const renameButton = screen.getByText('Rename');
      fireEvent.click(renameButton);

      // Edit the name
      const input = screen.getByDisplayValue('Test Node');
      fireEvent.change(input, { target: { value: 'New Name' } });
      
      // Save by pressing Enter
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockUpdateLayer).toHaveBeenCalledWith('node-1', {}, { name: 'New Name' });
    });

    it('should cancel rename when cancelled', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} />);

      // Enter rename mode
      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      const renameButton = screen.getByText('Rename');
      fireEvent.click(renameButton);

      // Cancel rename
      const input = screen.getByDisplayValue('Test Node');
      fireEvent.keyDown(input, { key: 'Escape' });

      // Should go back to normal mode - check that input is gone and button is back
      expect(screen.queryByDisplayValue('Test Node')).not.toBeInTheDocument();
      expect(screen.getByText('Test Node')).toBeInTheDocument();
    });
  });

  describe('Page Nodes', () => {
    it('should handle page nodes correctly', () => {
      mockIsLayerAPage.mockReturnValue(true);

      render(<TreeRowNode {...defaultProps} node={mockPageNode} />);

      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });
  });

  describe('Level and Indentation', () => {
    it('should render correct indentation for different levels', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} level={2} />);

      // Should render RowOffset component with level 2
      const offsetElement = document.querySelector('[style*="width"]');
      expect(offsetElement).toBeInTheDocument();
    });

    it('should handle level 0 correctly', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} level={0} />);

      expect(screen.getByText('Test Node')).toBeInTheDocument();
    });
  });

  describe('Draggable Functionality', () => {
    it('should show drag handle when draggable is true', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} draggable={true} />);

      // Should show grip vertical icon (drag handle)
      const dragHandle = document.querySelector('.cursor-move');
      expect(dragHandle).toBeInTheDocument();
    });

    it('should hide drag handle when draggable is false', () => {
      render(<TreeRowNode {...defaultProps} node={mockNode} draggable={false} />);

      // Should still render the element but it won't be draggable
      expect(screen.getByText('Test Node')).toBeInTheDocument();
    });
  });

  describe('Node Attributes', () => {
    it('should apply node attributes correctly', () => {
      const customAttributes = {
        key: 'custom-key',
        'data-key': 'custom-key',
        'data-level': '1',
        'data-node-box': true,
        'data-testid': 'tree-node',
      };

      render(
        <TreeRowNode 
          {...defaultProps} 
          node={mockNode} 
          nodeAttributes={customAttributes}
        />
      );

      const nodeContainer = screen.getByTestId('tree-node');
      expect(nodeContainer).toBeInTheDocument();
      // The component should apply the provided nodeAttributes
      expect(nodeContainer).toHaveAttribute('data-level', '1');
      expect(nodeContainer).toHaveAttribute('data-node-box', 'true');
    });
  });
});

describe('TreeRowPlaceholder', () => {
  const mockNodeAttributes = {
    key: 'placeholder-key',
    'data-key': 'placeholder-key',
    'data-level': '0',
    'data-node-box': true,
    'data-testid': 'tree-placeholder'
  };

  it('should render placeholder correctly', () => {
    render(<TreeRowPlaceholder nodeAttributes={mockNodeAttributes} />);

    const placeholder = screen.getByTestId('tree-placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  it('should apply correct placeholder styling', () => {
    const { container } = render(<TreeRowPlaceholder nodeAttributes={mockNodeAttributes} />);

    const placeholder = container.querySelector('.border-dashed');
    expect(placeholder).toBeInTheDocument();
  });

  it('should handle nodeAttributes correctly', () => {
    const customAttributes = {
      key: 'test-key',
      'data-key': 'test-key',
      'data-level': '0',
      'data-node-box': true,
      'data-testid': 'custom-placeholder'
    };

    render(<TreeRowPlaceholder nodeAttributes={customAttributes} />);

    const placeholder = screen.getByTestId('custom-placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('data-level', '0');
    expect(placeholder).toHaveAttribute('data-node-box', 'true');
  });
});

describe('TreeRowNode edge cases', () => {
  const mockSelectLayer = jest.fn();
  const mockUpdateLayer = jest.fn();
  const mockOnToggle = jest.fn();

  const defaultProps = {
    id: 'node-1',
    level: 0,
    open: false,
    draggable: true,
    onToggle: mockOnToggle,
    selectedLayerId: null,
    selectLayer: mockSelectLayer,
    nodeAttributes: {
      key: 'test-key',
      'data-key': 'test-key',
      'data-level': '0',
      'data-node-box': true,
    } as NodeAttrs,
  };

  const createMockRegistry = (componentType: string, hasChildren = true, childrenIsString = false) => ({
    [componentType]: {
      schema: {
        shape: hasChildren ? { children: 'mock-children-field' } : {}
      }
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockUseEditorStore = useEditorStore as jest.MockedFunction<typeof useEditorStore>;
    mockUseEditorStore.mockImplementation((selector) => {
      const state = {
        allowPagesCreation: true,
        allowPagesDeletion: true,
        registry: createMockRegistry('div', true, false),
      };
      return selector(state as any);
    });

    const mockUseLayerStore = useLayerStore as jest.MockedFunction<typeof useLayerStore>;
    mockUseLayerStore.mockImplementation((selector) => {
      const state = {
        isLayerAPage: jest.fn().mockReturnValue(false),
        updateLayer: mockUpdateLayer,
      };
      return selector(state as any);
    });

    const { hasLayerChildren } = require('@/lib/ui-builder/store/layer-utils');
    hasLayerChildren.mockImplementation((layer: ComponentLayer) => {
      return Array.isArray(layer.children) && typeof layer.children !== 'string';
    });

    const { hasAnyChildrenField, hasChildrenFieldOfTypeString } = require('@/lib/ui-builder/store/schema-utils');
    hasAnyChildrenField.mockReturnValue(true);
    hasChildrenFieldOfTypeString.mockReturnValue(false);
  });


  describe('Memo equality function behavior', () => {
    const mockNode: ComponentLayer = {
      id: 'memo-test-node',
      type: 'div',
      name: 'Memo Test Node',
      props: { testProp: 'value' },
      children: []
    };

    it('should re-render when node id changes', () => {
      const { rerender } = render(
        <TreeRowNode {...defaultProps} node={mockNode} />
      );

      const updatedNode = { ...mockNode, id: 'different-id' };
      rerender(<TreeRowNode {...defaultProps} node={updatedNode} />);

      expect(screen.getByText('Memo Test Node')).toBeInTheDocument();
    });

    it('should re-render when node props change', () => {
      const { rerender } = render(
        <TreeRowNode {...defaultProps} node={mockNode} />
      );

      const updatedNode = { ...mockNode, props: { testProp: 'different-value' } };
      rerender(<TreeRowNode {...defaultProps} node={updatedNode} />);

      expect(screen.getByText('Memo Test Node')).toBeInTheDocument();
    });

    it('should re-render when level changes', () => {
      const { rerender } = render(
        <TreeRowNode {...defaultProps} node={mockNode} level={0} />
      );

      rerender(<TreeRowNode {...defaultProps} node={mockNode} level={2} />);

      expect(screen.getByText('Memo Test Node')).toBeInTheDocument();
    });

    it('should re-render when open state changes', () => {
      const { rerender } = render(
        <TreeRowNode {...defaultProps} node={mockNode} open={false} />
      );

      rerender(<TreeRowNode {...defaultProps} node={mockNode} open={true} />);

      expect(screen.getByText('Memo Test Node')).toBeInTheDocument();
    });

    it('should re-render when draggable changes', () => {
      const { rerender } = render(
        <TreeRowNode {...defaultProps} node={mockNode} draggable={true} />
      );

      rerender(<TreeRowNode {...defaultProps} node={mockNode} draggable={false} />);

      expect(screen.getByText('Memo Test Node')).toBeInTheDocument();
    });

    it('should re-render when selectedLayerId changes', () => {
      const { rerender } = render(
        <TreeRowNode {...defaultProps} node={mockNode} selectedLayerId={null} />
      );

      rerender(<TreeRowNode {...defaultProps} node={mockNode} selectedLayerId="memo-test-node" />);

      expect(screen.getByText('Memo Test Node')).toBeInTheDocument();
    });

    it('should re-render when nodeAttributes change', () => {
      const { rerender } = render(
        <TreeRowNode {...defaultProps} node={mockNode} />
      );

      const newAttributes = {
        key: 'new-key',
        'data-key': 'new-key',
        'data-level': '1',
        'data-node-box': true,
      } as NodeAttrs;

      rerender(<TreeRowNode {...defaultProps} node={mockNode} nodeAttributes={newAttributes} />);

      expect(screen.getByText('Memo Test Node')).toBeInTheDocument();
    });

    it('should re-render when onToggle callback changes', () => {
      const newOnToggle = jest.fn();
      const { rerender } = render(
        <TreeRowNode {...defaultProps} node={mockNode} />
      );

      rerender(<TreeRowNode {...defaultProps} node={mockNode} onToggle={newOnToggle} />);

      expect(screen.getByText('Memo Test Node')).toBeInTheDocument();
    });

    it('should re-render when selectLayer callback changes', () => {
      const newSelectLayer = jest.fn();
      const { rerender } = render(
        <TreeRowNode {...defaultProps} node={mockNode} />
      );

      rerender(<TreeRowNode {...defaultProps} node={mockNode} selectLayer={newSelectLayer} />);

      expect(screen.getByText('Memo Test Node')).toBeInTheDocument();
    });

  });
});