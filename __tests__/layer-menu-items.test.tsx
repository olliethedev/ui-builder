import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayerMenuItems } from '@/components/ui/ui-builder/internal/components/layer-menu-items';
import type { ComponentLayer, ComponentRegistry } from '@/components/ui/ui-builder/types';
import { z } from 'zod';

// Mock the stores
jest.mock('@/lib/ui-builder/store/layer-store', () => ({
  useLayerStore: jest.fn(),
}));

jest.mock('@/lib/ui-builder/store/editor-store', () => ({
  useEditorStore: jest.fn(),
}));

// Mock the layer actions hook
jest.mock('@/lib/ui-builder/hooks/use-layer-actions', () => ({
  useGlobalLayerActions: jest.fn(),
}));

// Mock schema utils
jest.mock('@/lib/ui-builder/store/schema-utils', () => ({
  hasAnyChildrenField: jest.fn(),
  hasChildrenFieldOfTypeString: jest.fn(),
  canComponentAcceptChildren: jest.fn(),
}));

// Mock context menu components
jest.mock('@/components/ui/context-menu', () => ({
  ContextMenuItem: ({ children, onSelect, disabled, className }: any) => (
    <div
      data-testid="context-menu-item"
      onClick={onSelect}
      data-disabled={disabled}
      className={className}
    >
      {children}
    </div>
  ),
  ContextMenuSeparator: () => <hr data-testid="context-menu-separator" />,
  ContextMenuShortcut: ({ children }: any) => (
    <span data-testid="context-menu-shortcut">{children}</span>
  ),
}));

// Mock AddComponentsPopover
jest.mock('@/components/ui/ui-builder/internal/components/add-component-popover', () => ({
  AddComponentsPopover: ({ children }: any) => (
    <div data-testid="add-components-popover">{children}</div>
  ),
}));

import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import { useGlobalLayerActions } from '@/lib/ui-builder/hooks/use-layer-actions';
import { canComponentAcceptChildren } from '@/lib/ui-builder/store/schema-utils';

const mockUseLayerStore = useLayerStore as jest.MockedFunction<typeof useLayerStore>;
const mockUseEditorStore = useEditorStore as jest.MockedFunction<typeof useEditorStore>;
const mockUseGlobalLayerActions = useGlobalLayerActions as jest.MockedFunction<typeof useGlobalLayerActions>;
const mockCanComponentAcceptChildren = canComponentAcceptChildren as jest.MockedFunction<typeof canComponentAcceptChildren>;

describe('LayerMenuItems', () => {
  const mockLayer: ComponentLayer = {
    id: 'layer-1',
    type: 'div',
    name: 'Test Layer',
    props: {},
    children: [],
  };

  const mockRegistry: ComponentRegistry = {
    div: {
      schema: z.object({
        className: z.string().optional(),
        children: z.array(z.any()).optional(),
      }),
      from: '@/components/div',
      component: () => null,
    },
  };

  const mockHandleCopy = jest.fn();
  const mockHandleCut = jest.fn();
  const mockHandlePaste = jest.fn();
  const mockHandleDelete = jest.fn();
  const mockHandleDuplicate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup layer store mock
    mockUseLayerStore.mockImplementation((selector: any) => {
      const state = {
        findLayerById: jest.fn().mockReturnValue(mockLayer),
        isLayerAPage: jest.fn().mockReturnValue(false),
      };
      return selector(state);
    });

    // Setup editor store mock
    mockUseEditorStore.mockImplementation((selector: any) => {
      const state = {
        registry: mockRegistry,
        allowPagesCreation: true,
        allowPagesDeletion: true,
      };
      return selector(state);
    });

    // Setup layer actions mock
    mockUseGlobalLayerActions.mockReturnValue({
      clipboard: { layer: null, isCut: false, sourceLayerId: null },
      canPaste: false,
      handleCopy: mockHandleCopy,
      handleCut: mockHandleCut,
      handlePaste: mockHandlePaste,
      handleDelete: mockHandleDelete,
      handleDuplicate: mockHandleDuplicate,
      canPerformPaste: jest.fn().mockReturnValue(false),
    });

    // Setup schema utils mocks
    mockCanComponentAcceptChildren.mockReturnValue(true);
  });

  it('should render copy menu item', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('should render cut menu item', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    expect(screen.getByText('Cut')).toBeInTheDocument();
  });

  it('should render paste menu item', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    expect(screen.getByText('Paste')).toBeInTheDocument();
  });

  it('should render duplicate menu item', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    expect(screen.getByText('Duplicate')).toBeInTheDocument();
  });

  it('should render delete menu item', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should render shortcuts for each menu item', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    const shortcuts = screen.getAllByTestId('context-menu-shortcut');
    expect(shortcuts.length).toBeGreaterThan(0);
  });

  it('should render Add Child option when component can have children', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    expect(screen.getByText('Add Child')).toBeInTheDocument();
  });

  it('should not render Add Child option when showAddChild is false', () => {
    render(<LayerMenuItems layerId="layer-1" showAddChild={false} />);

    expect(screen.queryByText('Add Child')).not.toBeInTheDocument();
  });

  it('should not render Add Child option when component cannot have children', () => {
    mockCanComponentAcceptChildren.mockReturnValue(false);

    render(<LayerMenuItems layerId="layer-1" />);

    expect(screen.queryByText('Add Child')).not.toBeInTheDocument();
  });

  it('should not render Add Child option when component only accepts string children', () => {
    mockCanComponentAcceptChildren.mockReturnValue(false);

    render(<LayerMenuItems layerId="layer-1" />);

    expect(screen.queryByText('Add Child')).not.toBeInTheDocument();
  });

  it('should call handleCopy when copy is clicked', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    fireEvent.click(screen.getByText('Copy'));

    expect(mockHandleCopy).toHaveBeenCalled();
  });

  it('should call handleCut when cut is clicked', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    fireEvent.click(screen.getByText('Cut'));

    expect(mockHandleCut).toHaveBeenCalled();
  });

  it('should call handlePaste when paste is clicked', () => {
    mockUseGlobalLayerActions.mockReturnValue({
      clipboard: { layer: mockLayer, isCut: false, sourceLayerId: 'layer-1' },
      canPaste: true,
      handleCopy: mockHandleCopy,
      handleCut: mockHandleCut,
      handlePaste: mockHandlePaste,
      handleDelete: mockHandleDelete,
      handleDuplicate: mockHandleDuplicate,
      canPerformPaste: jest.fn().mockReturnValue(true),
    });

    render(<LayerMenuItems layerId="layer-1" />);

    fireEvent.click(screen.getByText('Paste'));

    expect(mockHandlePaste).toHaveBeenCalled();
  });

  it('should call handleDuplicate when duplicate is clicked', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    fireEvent.click(screen.getByText('Duplicate'));

    expect(mockHandleDuplicate).toHaveBeenCalled();
  });

  it('should call handleDelete when delete is clicked', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    fireEvent.click(screen.getByText('Delete'));

    expect(mockHandleDelete).toHaveBeenCalled();
  });

  it('should call onAction callback after performing an action', () => {
    const onAction = jest.fn();

    render(<LayerMenuItems layerId="layer-1" onAction={onAction} />);

    fireEvent.click(screen.getByText('Copy'));

    expect(onAction).toHaveBeenCalled();
  });

  it('should not render cut option for pages when page deletion is not allowed', () => {
    mockUseLayerStore.mockImplementation((selector: any) => {
      const state = {
        findLayerById: jest.fn().mockReturnValue(mockLayer),
        isLayerAPage: jest.fn().mockReturnValue(true),
      };
      return selector(state);
    });

    mockUseEditorStore.mockImplementation((selector: any) => {
      const state = {
        registry: mockRegistry,
        allowPagesCreation: true,
        allowPagesDeletion: false,
      };
      return selector(state);
    });

    render(<LayerMenuItems layerId="layer-1" />);

    expect(screen.queryByText('Cut')).not.toBeInTheDocument();
  });

  it('should not render delete option for pages when page deletion is not allowed', () => {
    mockUseLayerStore.mockImplementation((selector: any) => {
      const state = {
        findLayerById: jest.fn().mockReturnValue(mockLayer),
        isLayerAPage: jest.fn().mockReturnValue(true),
      };
      return selector(state);
    });

    mockUseEditorStore.mockImplementation((selector: any) => {
      const state = {
        registry: mockRegistry,
        allowPagesCreation: true,
        allowPagesDeletion: false,
      };
      return selector(state);
    });

    render(<LayerMenuItems layerId="layer-1" />);

    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should not render duplicate option for pages when page creation is not allowed', () => {
    mockUseLayerStore.mockImplementation((selector: any) => {
      const state = {
        findLayerById: jest.fn().mockReturnValue(mockLayer),
        isLayerAPage: jest.fn().mockReturnValue(true),
      };
      return selector(state);
    });

    mockUseEditorStore.mockImplementation((selector: any) => {
      const state = {
        registry: mockRegistry,
        allowPagesCreation: false,
        allowPagesDeletion: true,
      };
      return selector(state);
    });

    render(<LayerMenuItems layerId="layer-1" />);

    expect(screen.queryByText('Duplicate')).not.toBeInTheDocument();
  });

  it('should disable paste when canPaste is false', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    const pasteItem = screen.getByText('Paste').closest('[data-testid="context-menu-item"]');
    expect(pasteItem).toHaveAttribute('data-disabled', 'true');
  });

  it('should enable paste when canPaste is true', () => {
    mockUseGlobalLayerActions.mockReturnValue({
      clipboard: { layer: mockLayer, isCut: false, sourceLayerId: 'layer-1' },
      canPaste: true,
      handleCopy: mockHandleCopy,
      handleCut: mockHandleCut,
      handlePaste: mockHandlePaste,
      handleDelete: mockHandleDelete,
      handleDuplicate: mockHandleDuplicate,
      canPerformPaste: jest.fn().mockReturnValue(true),
    });

    render(<LayerMenuItems layerId="layer-1" />);

    const pasteItem = screen.getByText('Paste').closest('[data-testid="context-menu-item"]');
    expect(pasteItem).toHaveAttribute('data-disabled', 'false');
  });

  it('should handle layer not found gracefully', () => {
    mockUseLayerStore.mockImplementation((selector: any) => {
      const state = {
        findLayerById: jest.fn().mockReturnValue(undefined),
        isLayerAPage: jest.fn().mockReturnValue(false),
      };
      return selector(state);
    });

    render(<LayerMenuItems layerId="non-existent" />);

    // Should still render without crashing
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('should render separator after Add Child when it is shown', () => {
    render(<LayerMenuItems layerId="layer-1" />);

    const separators = screen.getAllByTestId('context-menu-separator');
    expect(separators.length).toBeGreaterThan(0);
  });
});
