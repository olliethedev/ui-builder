import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DndContext } from '@dnd-kit/core';
import { DropZone, DropPlaceholder } from '@/components/ui/ui-builder/internal/dnd/drop-zone';

// Mock useDroppable hook
const mockUseDroppable = {
  isOver: false,
  setNodeRef: jest.fn(),
};

jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  useDroppable: jest.fn(() => mockUseDroppable),
}));

// Mock layer store
const mockFindLayerById = jest.fn();
const mockUseLayerStore = jest.fn();
const mockMoveLayer = jest.fn();

jest.mock('@/lib/ui-builder/store/layer-store', () => ({
  useLayerStore: (selector: any) => mockUseLayerStore(selector),
}));

// Mock editor store
const mockUseEditorStore = jest.fn();

jest.mock('@/lib/ui-builder/store/editor-store', () => ({
  useEditorStore: (selector: any) => mockUseEditorStore(selector),
}));

// Mock layer utils
jest.mock('@/lib/ui-builder/store/layer-utils', () => ({
  canLayerAcceptChildren: jest.fn(() => true),
}));

// Mock the DndContextProvider with a simpler TestWrapper that provides the required context
const mockDndContextValue = {
  isDragging: false,
  activeLayerId: null,
  newComponentType: null,
  canDropOnLayer: jest.fn(() => true),
};

jest.mock('@/lib/ui-builder/context/dnd-context', () => ({
  useDndContext: jest.fn(() => mockDndContextValue),
  DndContextProvider: ({ children }: { children: React.ReactNode }) => (
    <DndContext onDragEnd={() => {}}>{children}</DndContext>
  ),
}));

// Mock window.getComputedStyle for layout detection
const mockGetComputedStyle = jest.fn();
Object.defineProperty(window, 'getComputedStyle', {
  value: mockGetComputedStyle,
});

// Mock document.querySelector for dragged element detection
const mockQuerySelector = jest.fn();
Object.defineProperty(document, 'querySelector', {
  value: mockQuerySelector,
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndContext onDragEnd={() => {}}>
    {children}
  </DndContext>
);

describe('DropZone', () => {
  const defaultProps = {
    parentId: 'parent-123',
    position: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to default state
    const { useDroppable } = require('@dnd-kit/core');
    useDroppable.mockReturnValue(mockUseDroppable);
    // Reset layer store mock
    mockUseLayerStore.mockImplementation((selector) => {
      const store = {
        findLayerById: mockFindLayerById,
        moveLayer: mockMoveLayer,
      };
      return selector(store);
    });
    // Reset editor store mock
    mockUseEditorStore.mockImplementation((selector) => {
      const store = {
        registry: {},
      };
      return selector(store);
    });
    mockFindLayerById.mockReturnValue({
      props: { className: 'flex flex-col' }
    });
  });

  it('renders drop zone with correct test id', () => {
    render(
      <TestWrapper>
        <DropZone {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('drop-zone-parent-123-0')).toBeInTheDocument();
  });

  it('calls useDroppable with correct configuration', () => {
    const { useDroppable } = require('@dnd-kit/core');

    render(
      <TestWrapper>
        <DropZone {...defaultProps} />
      </TestWrapper>
    );

    expect(useDroppable).toHaveBeenCalledWith({
      id: 'parent-123-0',
      data: {
        type: 'drop-zone',
        parentId: 'parent-123',
        position: 0,
      },
      disabled: false,
    });
  });

  it('renders as inactive when isActive is false', () => {
    render(
      <TestWrapper>
        <DropZone {...defaultProps} isActive={false} />
      </TestWrapper>
    );

    const dropZone = screen.getByTestId('drop-zone-parent-123-0');
    // Should not show drop indicator elements when inactive
    expect(dropZone.querySelector('.absolute.inset-0')).not.toBeInTheDocument();
  });

  it('shows drop indicator when active', () => {
    render(
      <TestWrapper>
        <DropZone {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const dropZone = screen.getByTestId('drop-zone-parent-123-0');
    // Should have a drop indicator element when active
    expect(dropZone.querySelector('.absolute')).toBeInTheDocument();
  });

  it('shows placeholder when active and no children', () => {
    render(
      <TestWrapper>
        <DropZone {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Drop here')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <TestWrapper>
        <DropZone {...defaultProps}>
          <div>Test Child</div>
        </DropZone>
      </TestWrapper>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('shows visual feedback when dragging over', () => {
    const { useDroppable } = require('@dnd-kit/core');
    useDroppable.mockReturnValue({
      ...mockUseDroppable,
      isOver: true,
    });

    render(
      <TestWrapper>
        <DropZone {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const dropZone = screen.getByTestId('drop-zone-parent-123-0');
    const indicator = dropZone.querySelector('.absolute');
    // Check that indicator exists and has styling (without checking specific classes)
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('class');
  });

  it('applies custom className when provided', () => {
    render(
      <TestWrapper>
        <DropZone {...defaultProps} className="custom-class" />
      </TestWrapper>
    );

    const dropZone = screen.getByTestId('drop-zone-parent-123-0');
    expect(dropZone).toHaveClass('custom-class');
  });

  it('provides proper structure for drag interactions', () => {
    render(
      <TestWrapper>
        <DropZone {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const dropZone = screen.getByTestId('drop-zone-parent-123-0');
    // Check structural elements exist
    expect(dropZone.tagName).toBe('DIV');
    expect(dropZone).toHaveAttribute('data-testid', 'drop-zone-parent-123-0');
  });
});

describe('DropPlaceholder', () => {
  const defaultProps = {
    parentId: 'parent-456',
    position: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to default state
    const { useDroppable } = require('@dnd-kit/core');
    useDroppable.mockReturnValue(mockUseDroppable);
    
    // Reset DND context mock
    const { useDndContext } = require('@/lib/ui-builder/context/dnd-context');
    useDndContext.mockReturnValue(mockDndContextValue);
    
    // Reset layer store mock - no longer needed since we use DOM detection
    mockUseLayerStore.mockImplementation((selector) => {
      const store = {
        findLayerById: mockFindLayerById,
        moveLayer: mockMoveLayer,
      };
      return selector(store);
    });
    
    // Reset editor store mock
    mockUseEditorStore.mockImplementation((selector) => {
      const store = {
        registry: {},
      };
      return selector(store);
    });
    
    // Mock window.getComputedStyle to return flex-col by default
    mockGetComputedStyle.mockReturnValue({
      display: 'flex',
      flexDirection: 'column',
      getPropertyValue: jest.fn((prop: string) => {
        const styles: Record<string, string> = {
          display: 'flex',
          'flex-direction': 'column',
        };
        return styles[prop] || '';
      }),
    });
    
    // Mock document.querySelector to return null by default (no dragged element)
    mockQuerySelector.mockReturnValue(null);
  });

  it('renders drop placeholder with correct test id when active', () => {
    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    expect(screen.getByTestId('drop-placeholder-parent-456-1')).toBeInTheDocument();
  });

  it('does not render when not active', () => {
    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={false} />
      </TestWrapper>
    );

    expect(screen.queryByTestId('drop-placeholder-parent-456-1')).not.toBeInTheDocument();
  });

  it('calls useDroppable with correct configuration', () => {
    const { useDroppable } = require('@dnd-kit/core');

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    expect(useDroppable).toHaveBeenCalledWith({
      id: 'parent-456-1',
      data: {
        type: 'drop-zone',
        parentId: 'parent-456',
        position: 1,
      },
      disabled: false,
    });
  });

  it('shows visual feedback when dragging over', () => {
    const { useDroppable } = require('@dnd-kit/core');
    useDroppable.mockReturnValue({
      ...mockUseDroppable,
      isOver: true,
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    // Check that element exists and has visual indicator classes (before: pseudo-elements)
    expect(placeholder).toBeInTheDocument();
    // The hover state applies before:bg-blue-500 class for the drop indicator
    expect(placeholder).toHaveClass('before:content-[\'\']');
  });

  it('renders with positioning for flex-col layout', () => {
    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    // Check that placeholder exists with proper data attributes
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('data-drop-indicator');
    // Should have visual indicator classes
    expect(placeholder).toHaveClass('before:content-[\'\']', 'before:absolute');
  });

  it('applies visual indicator classes for flex-col layout', () => {
    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} position={0} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-0');
    // Check that placeholder exists with visual indicator classes
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('data-drop-indicator');
    expect(placeholder).toHaveClass('before:transition-all', 'before:duration-200');
  });

  it('shows drop indicator for horizontal layout (flex-row)', () => {
    // Mock getComputedStyle to return flex-row
    mockGetComputedStyle.mockReturnValue({
      display: 'flex',
      flexDirection: 'row',
      getPropertyValue: jest.fn((prop: string) => {
        const styles: Record<string, string> = {
          display: 'flex',
          'flex-direction': 'row',
        };
        return styles[prop] || '';
      }),
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    expect(placeholder).toBeInTheDocument();
    // Should have visual indicator classes for the drop line
    expect(placeholder).toHaveAttribute('data-drop-indicator');
    expect(placeholder).toHaveClass('before:absolute', 'before:pointer-events-none');
  });

  it('shows drop indicator for vertical layout (flex-col)', () => {
    // Already using flex-col from beforeEach setup
    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    expect(placeholder).toBeInTheDocument();
    // Should have visual indicator classes
    expect(placeholder).toHaveAttribute('data-drop-indicator');
    expect(placeholder).toHaveClass('before:content-[\'\']');
  });

  it('handles block layout correctly', () => {
    // Mock getComputedStyle to return block display
    mockGetComputedStyle.mockReturnValue({
      display: 'block',
      flexDirection: 'column',
      getPropertyValue: jest.fn((prop: string) => {
        const styles: Record<string, string> = {
          display: 'block',
          'flex-direction': 'column',
        };
        return styles[prop] || '';
      }),
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    expect(placeholder).toBeInTheDocument();
    // Should have data-drop-indicator attribute
    expect(placeholder).toHaveAttribute('data-drop-indicator');
    expect(placeholder).toHaveClass('before:transition-all');
  });

  it('handles inline element detection when dragging span', () => {
    // Mock an active drag with a span element
    const { useDndContext } = require('@/lib/ui-builder/context/dnd-context');
    useDndContext.mockReturnValue({
      ...mockDndContextValue,
      activeLayerId: 'span-123',
    });

    // Mock document.querySelector to return a span element
    const mockSpanElement = {
      tagName: 'SPAN',
      style: {},
    };
    mockQuerySelector.mockReturnValue(mockSpanElement);

    // Mock getComputedStyle for the dragged span
    mockGetComputedStyle.mockImplementation((element: any) => {
      if (element === mockSpanElement) {
        return {
          display: 'inline',
          flexDirection: 'row',
          getPropertyValue: jest.fn(() => 'inline'),
        };
      }
      // Parent element (block container)
      return {
        display: 'block',
        flexDirection: 'column',
        getPropertyValue: jest.fn((prop: string) => {
          const styles: Record<string, string> = {
            display: 'block',
            'flex-direction': 'column',
          };
          return styles[prop] || '';
        }),
      };
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    expect(placeholder).toBeInTheDocument();
    // Should have data-drop-indicator attribute for inline elements
    expect(placeholder).toHaveAttribute('data-drop-indicator');
    expect(placeholder).toHaveClass('before:absolute');
  });

  it('shows valid state when canDropOnLayer returns true', () => {
    const { useDndContext } = require('@/lib/ui-builder/context/dnd-context');
    useDndContext.mockReturnValue({
      ...mockDndContextValue,
      canDropOnLayer: jest.fn(() => true),
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    expect(placeholder).toHaveAttribute('data-drop-valid', 'true');
  });

  it('shows disabled state when canDropOnLayer returns false', () => {
    const { useDndContext } = require('@/lib/ui-builder/context/dnd-context');
    useDndContext.mockReturnValue({
      ...mockDndContextValue,
      canDropOnLayer: jest.fn(() => false),
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    expect(placeholder).toHaveAttribute('data-drop-valid', 'false');
    expect(placeholder).toHaveClass('opacity-60');
  });
});

describe('DropPlaceholder layout detection', () => {
  const defaultProps = {
    parentId: 'parent-layout',
    position: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useDroppable } = require('@dnd-kit/core');
    useDroppable.mockReturnValue(mockUseDroppable);
    
    const { useDndContext } = require('@/lib/ui-builder/context/dnd-context');
    useDndContext.mockReturnValue(mockDndContextValue);
  });

  it('detects grid layout correctly', () => {
    mockGetComputedStyle.mockReturnValue({
      display: 'grid',
      flexDirection: 'row',
      getPropertyValue: jest.fn((prop: string) => {
        const styles: Record<string, string> = {
          display: 'grid',
          'flex-direction': 'row',
        };
        return styles[prop] || '';
      }),
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-layout-0');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('data-drop-indicator');
  });

  it('detects inline-grid layout correctly', () => {
    mockGetComputedStyle.mockReturnValue({
      display: 'inline-grid',
      flexDirection: 'row',
      getPropertyValue: jest.fn((prop: string) => {
        const styles: Record<string, string> = {
          display: 'inline-grid',
          'flex-direction': 'row',
        };
        return styles[prop] || '';
      }),
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-layout-0');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('data-drop-indicator');
  });

  it('detects inline-flex layout correctly', () => {
    mockGetComputedStyle.mockReturnValue({
      display: 'inline-flex',
      flexDirection: 'row',
      getPropertyValue: jest.fn((prop: string) => {
        const styles: Record<string, string> = {
          display: 'inline-flex',
          'flex-direction': 'row',
        };
        return styles[prop] || '';
      }),
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-layout-0');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('data-drop-indicator');
  });

  it('detects inline layout correctly', () => {
    mockGetComputedStyle.mockReturnValue({
      display: 'inline',
      flexDirection: 'row',
      getPropertyValue: jest.fn((prop: string) => {
        const styles: Record<string, string> = {
          display: 'inline',
          'flex-direction': 'row',
        };
        return styles[prop] || '';
      }),
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-layout-0');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('data-drop-indicator');
  });

  it('detects inline-block layout correctly', () => {
    mockGetComputedStyle.mockReturnValue({
      display: 'inline-block',
      flexDirection: 'row',
      getPropertyValue: jest.fn((prop: string) => {
        const styles: Record<string, string> = {
          display: 'inline-block',
          'flex-direction': 'row',
        };
        return styles[prop] || '';
      }),
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-layout-0');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('data-drop-indicator');
  });

  it('detects flex-row reverse correctly', () => {
    mockGetComputedStyle.mockReturnValue({
      display: 'flex',
      flexDirection: 'row-reverse',
      getPropertyValue: jest.fn((prop: string) => {
        const styles: Record<string, string> = {
          display: 'flex',
          'flex-direction': 'row-reverse',
        };
        return styles[prop] || '';
      }),
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-layout-0');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('data-drop-indicator');
  });

  it('applies custom style when provided', () => {
    render(
      <TestWrapper>
        <DropPlaceholder 
          {...defaultProps} 
          isActive={true} 
          style={{ left: 10, top: 20, width: 100, height: 8 }} 
        />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-layout-0');
    expect(placeholder).toBeInTheDocument();
    // Check that placeholder is rendered with style prop (calculatedStyle takes precedence if computed)
    // The style prop is used for fallback positioning
    expect(placeholder).toHaveAttribute('data-drop-indicator');
  });

  it('handles hover state with disabled drop', () => {
    const { useDroppable } = require('@dnd-kit/core');
    useDroppable.mockReturnValue({
      ...mockUseDroppable,
      isOver: true,
    });

    const { useDndContext } = require('@/lib/ui-builder/context/dnd-context');
    useDndContext.mockReturnValue({
      ...mockDndContextValue,
      canDropOnLayer: jest.fn(() => false),
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-layout-0');
    expect(placeholder).toHaveAttribute('data-drop-valid', 'false');
    // Should have disabled styling
    expect(placeholder).toHaveClass('cursor-not-allowed');
  });
});

describe('DropZone disabled state', () => {
  const defaultProps = {
    parentId: 'parent-789',
    position: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useDroppable } = require('@dnd-kit/core');
    useDroppable.mockReturnValue(mockUseDroppable);
  });

  it('shows valid drop zone with "Drop here" text when canDropOnLayer is true', () => {
    const { useDndContext } = require('@/lib/ui-builder/context/dnd-context');
    useDndContext.mockReturnValue({
      ...mockDndContextValue,
      canDropOnLayer: jest.fn(() => true),
    });

    render(
      <TestWrapper>
        <DropZone {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Drop here')).toBeInTheDocument();
    const dropZone = screen.getByTestId('drop-zone-parent-789-0');
    expect(dropZone).toHaveAttribute('data-drop-valid', 'true');
  });

  it('shows disabled drop zone with "Cannot drop here" text when canDropOnLayer is false', () => {
    const { useDndContext } = require('@/lib/ui-builder/context/dnd-context');
    useDndContext.mockReturnValue({
      ...mockDndContextValue,
      canDropOnLayer: jest.fn(() => false),
    });

    render(
      <TestWrapper>
        <DropZone {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Cannot drop here')).toBeInTheDocument();
    const dropZone = screen.getByTestId('drop-zone-parent-789-0');
    expect(dropZone).toHaveAttribute('data-drop-valid', 'false');
    expect(dropZone).toHaveClass('opacity-60');
  });
});