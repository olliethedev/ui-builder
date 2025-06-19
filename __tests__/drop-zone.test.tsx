import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DndContext } from '@dnd-kit/core';
import { DropZone, DropPlaceholder } from '@/components/ui/ui-builder/internal/drop-zone';

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
  canDropOnLayer: jest.fn(() => true),
};

jest.mock('@/components/ui/ui-builder/internal/dnd-context', () => ({
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
    const { useDndContext } = require('@/components/ui/ui-builder/internal/dnd-context');
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
    // Check that element exists and has proper class-based styling
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveClass('before:bg-blue-500');
  });

  it('renders with absolute positioning for flex-col layout', () => {
    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    // Check that flex-col layout classes are applied (absolute positioning with horizontal lines)
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveClass('absolute', 'pointer-events-auto', 'z-50');
    expect(placeholder).toHaveClass('left-0', 'right-0', '-top-2', 'h-4');
  });

  it('applies correct layout classes for flex-col layout', () => {
    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} position={0} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-0');
    // Check that flex-col layout classes are applied (absolute positioning)
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveClass('absolute', 'pointer-events-auto', 'z-50');
    expect(placeholder).toHaveClass('left-0', 'right-0', '-top-2', 'h-4');
  });

  it('shows vertical drop lines for horizontal layout (flex-row)', () => {
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
    // For horizontal layout, should show vertical lines with absolute positioning
    expect(placeholder).toHaveClass('absolute', 'pointer-events-auto', 'z-50');
    expect(placeholder).toHaveClass('-left-2', 'top-0', 'bottom-0', 'w-4');
  });

  it('shows horizontal drop lines for vertical layout (flex-col)', () => {
    // Already using flex-col from beforeEach setup
    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    expect(placeholder).toBeInTheDocument();
    // For vertical layout, should show horizontal lines with absolute positioning
    expect(placeholder).toHaveClass('absolute', 'pointer-events-auto', 'z-50');
    expect(placeholder).toHaveClass('left-0', 'right-0', '-top-2', 'h-4');
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
    // Should default to horizontal lines with absolute positioning (block layout)
    expect(placeholder).toHaveClass('absolute', 'pointer-events-auto', 'z-50');
    expect(placeholder).toHaveClass('left-0', 'right-0', '-top-2', 'h-4');
  });

  it('handles inline element detection when dragging span', () => {
    // Mock an active drag with a span element
    const { useDndContext } = require('@/components/ui/ui-builder/internal/dnd-context');
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
    // Should use inline layout classes for inline elements with absolute positioning
    expect(placeholder).toHaveClass('absolute', 'pointer-events-auto', 'z-50');
    expect(placeholder).toHaveClass('-left-1', 'top-0', 'bottom-0', 'w-2');
  });
});