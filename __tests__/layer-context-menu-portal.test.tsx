import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LayerContextMenuPortal } from '@/components/ui/ui-builder/internal/components/layer-context-menu-portal';
import type { ComponentLayer } from '@/components/ui/ui-builder/types';

// Mock editor store state
let mockContextMenuState = {
  open: false,
  x: 0,
  y: 0,
  layerId: null as string | null,
};

const mockCloseContextMenu = jest.fn();

jest.mock('@/lib/ui-builder/store/editor-store', () => ({
  useEditorStore: jest.fn((selector) => {
    const state = {
      contextMenu: mockContextMenuState,
      closeContextMenu: mockCloseContextMenu,
      registry: {},
    };
    return selector(state);
  }),
}));

// Mock layer store
const mockFindLayerById = jest.fn();
let mockSelectedLayerId: string | null = 'layer-1';
jest.mock('@/lib/ui-builder/store/layer-store', () => ({
  useLayerStore: jest.fn((selector) => {
    const state = {
      findLayerById: mockFindLayerById,
      selectedLayerId: mockSelectedLayerId,
    };
    return selector(state);
  }),
}));

// Mock DnD context
jest.mock('@/lib/ui-builder/context/dnd-context', () => ({
  useDndContext: jest.fn(() => ({
    isDragging: false,
    activeLayerId: null,
    newComponentType: null,
    canDropOnLayer: () => false,
  })),
}));

// Mock floating-ui - need to track the floating element for contains() checks
let mockFloatingElement: HTMLElement | null = null;
jest.mock('@floating-ui/react', () => ({
  useFloating: jest.fn(() => ({
    refs: {
      setFloating: (el: HTMLElement | null) => {
        mockFloatingElement = el;
      },
      floating: { 
        get current() {
          return mockFloatingElement;
        }
      },
      setPositionReference: jest.fn(),
    },
    floatingStyles: {
      position: 'absolute',
      left: 150,
      top: 250,
    },
  })),
  offset: jest.fn(),
  flip: jest.fn(),
  shift: jest.fn(),
  limitShift: jest.fn(),
}));

// Mock layer actions hook
const mockHandleCopy = jest.fn();
const mockHandleCut = jest.fn();
const mockHandlePaste = jest.fn();
const mockHandleDelete = jest.fn();
const mockHandleDuplicate = jest.fn();

jest.mock('@/lib/ui-builder/hooks/use-layer-actions', () => ({
  useGlobalLayerActions: jest.fn(() => ({
    clipboard: { layer: null, isCut: false, sourceLayerId: null },
    canPaste: true,
    canDuplicate: true,
    canDelete: true,
    canCut: true,
    handleCopy: mockHandleCopy,
    handleCut: mockHandleCut,
    handlePaste: mockHandlePaste,
    handleDelete: mockHandleDelete,
    handleDuplicate: mockHandleDuplicate,
  })),
}));

// Mock schema utils
jest.mock('@/lib/ui-builder/store/schema-utils', () => ({
  canComponentAcceptChildren: jest.fn().mockReturnValue(false),
}));

// Mock AddComponentsPopover
jest.mock('@/components/ui/ui-builder/internal/components/add-component-popover', () => ({
  AddComponentsPopover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useFrame - default to no iframe (uses parent document)
let mockFrameDocument: Document | undefined = undefined;
jest.mock('@/components/ui/ui-builder/internal/canvas/auto-frame', () => ({
  useFrame: jest.fn(() => ({
    document: mockFrameDocument,
    window: undefined,
  })),
}));

describe('LayerContextMenuPortal', () => {
  const mockLayer: ComponentLayer = {
    id: 'layer-1',
    type: 'div',
    name: 'Test Layer',
    props: {},
    children: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockContextMenuState = {
      open: false,
      x: 0,
      y: 0,
      layerId: null,
    };
    // Keep selectedLayerId matching the context menu layer to prevent auto-close
    mockSelectedLayerId = 'layer-1';
    mockFloatingElement = null;
    mockFindLayerById.mockReturnValue(mockLayer);
    // Reset to no iframe context by default
    mockFrameDocument = undefined;
  });

  describe('Rendering', () => {
    it('should not render when context menu is closed', () => {
      mockContextMenuState = {
        open: false,
        x: 0,
        y: 0,
        layerId: null,
      };

      render(<LayerContextMenuPortal />);

      expect(screen.queryByTestId('layer-context-menu-portal')).not.toBeInTheDocument();
    });

    it('should not render when layerId is null', () => {
      mockContextMenuState = {
        open: true,
        x: 100,
        y: 200,
        layerId: null,
      };

      render(<LayerContextMenuPortal />);

      expect(screen.queryByTestId('layer-context-menu-portal')).not.toBeInTheDocument();
    });

    it('should render when context menu is open with valid layerId', () => {
      mockContextMenuState = {
        open: true,
        x: 100,
        y: 200,
        layerId: 'layer-1',
      };

      render(<LayerContextMenuPortal />);

      expect(screen.getByTestId('layer-context-menu-portal')).toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('should use floating-ui for positioning', () => {
      mockContextMenuState = {
        open: true,
        x: 150,
        y: 250,
        layerId: 'layer-1',
      };

      render(<LayerContextMenuPortal />);

      const menu = screen.getByTestId('layer-context-menu-portal');
      // floating-ui provides absolute positioning via floatingStyles mock
      expect(menu).toHaveStyle({
        position: 'absolute',
      });
    });

    it('should call setPositionReference when coordinates change', () => {
      const mockSetPositionReference = jest.fn();
      jest.requireMock('@floating-ui/react').useFloating.mockReturnValue({
        refs: {
          setFloating: (el: HTMLElement | null) => {
            mockFloatingElement = el;
          },
          floating: { 
            get current() {
              return mockFloatingElement;
            }
          },
          setPositionReference: mockSetPositionReference,
        },
        floatingStyles: {
          position: 'absolute',
          left: 150,
          top: 250,
        },
      });

      mockContextMenuState = {
        open: true,
        x: 100,
        y: 200,
        layerId: 'layer-1',
      };

      render(<LayerContextMenuPortal />);

      // setPositionReference should be called with virtual element
      expect(mockSetPositionReference).toHaveBeenCalled();
    });
  });

  describe('Menu items', () => {
    beforeEach(() => {
      mockContextMenuState = {
        open: true,
        x: 100,
        y: 200,
        layerId: 'layer-1',
      };
    });

    it('should render Copy menu item', () => {
      render(<LayerContextMenuPortal />);

      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    it('should render Cut menu item', () => {
      render(<LayerContextMenuPortal />);

      expect(screen.getByText('Cut')).toBeInTheDocument();
    });

    it('should render Paste menu item', () => {
      render(<LayerContextMenuPortal />);

      expect(screen.getByText('Paste')).toBeInTheDocument();
    });

    it('should render Duplicate menu item', () => {
      render(<LayerContextMenuPortal />);

      expect(screen.getByText('Duplicate')).toBeInTheDocument();
    });

    it('should render Delete menu item', () => {
      render(<LayerContextMenuPortal />);

      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Menu interactions', () => {
    beforeEach(() => {
      mockContextMenuState = {
        open: true,
        x: 100,
        y: 200,
        layerId: 'layer-1',
      };
    });

    it('should call handleCopy and closeContextMenu when Copy is clicked', () => {
      render(<LayerContextMenuPortal />);

      const copyItem = screen.getByText('Copy').closest('[data-testid="menu-item"]');
      fireEvent.click(copyItem!);

      expect(mockHandleCopy).toHaveBeenCalled();
      expect(mockCloseContextMenu).toHaveBeenCalled();
    });

    it('should call handleCut and closeContextMenu when Cut is clicked', () => {
      render(<LayerContextMenuPortal />);

      const cutItem = screen.getByText('Cut').closest('[data-testid="menu-item"]');
      fireEvent.click(cutItem!);

      expect(mockHandleCut).toHaveBeenCalled();
      expect(mockCloseContextMenu).toHaveBeenCalled();
    });

    it('should call handlePaste and closeContextMenu when Paste is clicked', () => {
      render(<LayerContextMenuPortal />);

      const pasteItem = screen.getByText('Paste').closest('[data-testid="menu-item"]');
      fireEvent.click(pasteItem!);

      expect(mockHandlePaste).toHaveBeenCalled();
      expect(mockCloseContextMenu).toHaveBeenCalled();
    });

    it('should call handleDuplicate and closeContextMenu when Duplicate is clicked', () => {
      render(<LayerContextMenuPortal />);

      const duplicateItem = screen.getByText('Duplicate').closest('[data-testid="menu-item"]');
      fireEvent.click(duplicateItem!);

      expect(mockHandleDuplicate).toHaveBeenCalled();
      expect(mockCloseContextMenu).toHaveBeenCalled();
    });

    it('should call handleDelete and closeContextMenu when Delete is clicked', () => {
      render(<LayerContextMenuPortal />);

      const deleteItem = screen.getByText('Delete').closest('[data-testid="menu-item"]');
      fireEvent.click(deleteItem!);

      expect(mockHandleDelete).toHaveBeenCalled();
      expect(mockCloseContextMenu).toHaveBeenCalled();
    });
  });

  describe('Close behavior', () => {
    beforeEach(() => {
      mockContextMenuState = {
        open: true,
        x: 100,
        y: 200,
        layerId: 'layer-1',
      };
    });

    it('should close menu when Escape is pressed', () => {
      render(<LayerContextMenuPortal />);

      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(mockCloseContextMenu).toHaveBeenCalled();
    });

    it('should close menu when clicking outside', () => {
      render(<LayerContextMenuPortal />);

      act(() => {
        fireEvent.mouseDown(document.body);
      });

      expect(mockCloseContextMenu).toHaveBeenCalled();
    });

    it('should not close menu when clicking inside', () => {
      render(<LayerContextMenuPortal />);

      const menu = screen.getByTestId('layer-context-menu-portal');
      
      act(() => {
        fireEvent.mouseDown(menu);
      });

      // closeContextMenu should not be called for clicks inside
      // But the individual menu item click handlers will call it
      expect(mockCloseContextMenu).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard shortcuts display', () => {
    beforeEach(() => {
      mockContextMenuState = {
        open: true,
        x: 100,
        y: 200,
        layerId: 'layer-1',
      };
    });

    it('should display keyboard shortcuts', () => {
      render(<LayerContextMenuPortal />);

      const shortcuts = screen.getAllByTestId('menu-shortcut');
      expect(shortcuts.length).toBeGreaterThan(0);
    });
  });

  describe('Iframe event handling', () => {
    beforeEach(() => {
      mockContextMenuState = {
        open: true,
        x: 100,
        y: 200,
        layerId: 'layer-1',
      };
    });

    it('should attach event listeners to iframe document when available', () => {
      // Create a mock iframe document
      const mockIframeDoc = document.implementation.createHTMLDocument('iframe');
      const addEventListenerSpy = jest.spyOn(mockIframeDoc, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(mockIframeDoc, 'removeEventListener');
      
      // Set the mock iframe document
      mockFrameDocument = mockIframeDoc;

      const { unmount } = render(<LayerContextMenuPortal />);

      // Verify listeners were attached to iframe document
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('contextmenu', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      // Unmount and verify cleanup
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('contextmenu', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should close menu when Escape is pressed inside iframe document', () => {
      // Create a mock iframe document
      const mockIframeDoc = document.implementation.createHTMLDocument('iframe');
      mockFrameDocument = mockIframeDoc;

      render(<LayerContextMenuPortal />);

      // Simulate keydown on iframe document
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        mockIframeDoc.dispatchEvent(event);
      });

      expect(mockCloseContextMenu).toHaveBeenCalled();
    });

    it('should close menu when clicking outside inside iframe document', () => {
      // Create a mock iframe document with a body
      const mockIframeDoc = document.implementation.createHTMLDocument('iframe');
      mockFrameDocument = mockIframeDoc;

      render(<LayerContextMenuPortal />);

      // Simulate mousedown on iframe document body
      act(() => {
        const event = new MouseEvent('mousedown', { bubbles: true });
        mockIframeDoc.body.dispatchEvent(event);
      });

      expect(mockCloseContextMenu).toHaveBeenCalled();
    });
  });
});
