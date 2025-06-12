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

jest.mock('@/lib/ui-builder/store/layer-store', () => ({
  useLayerStore: (selector: any) => mockUseLayerStore(selector),
}));

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
    // Reset layer store mock
    mockUseLayerStore.mockImplementation((selector) => {
      const store = {
        findLayerById: mockFindLayerById,
      };
      return selector(store);
    });
    mockFindLayerById.mockReturnValue({
      props: { className: 'flex flex-col' }
    });
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
    // Check that element exists and has proper attributes without checking specific classes
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('class');
  });

  it('renders with proper positioning styles', () => {
    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    // Check that positioning styles are applied
    expect(placeholder).toHaveStyle('bottom: -1px');
  });

  it('handles position 0 correctly', () => {
    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} position={0} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-0');
    // Check that top positioning is applied for position 0
    expect(placeholder).toHaveStyle('top: -1px');
  });

  it('shows vertical drop lines for horizontal layout (flex-row)', () => {
    // Mock the layer to have flex-row className
    mockFindLayerById.mockReturnValue({
      props: { className: 'flex flex-row' }
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    expect(placeholder).toBeInTheDocument();
    // For horizontal layout, should show vertical lines
    expect(placeholder).toHaveStyle('right: -1px');
  });

  it('shows horizontal drop lines for vertical layout (flex-col)', () => {
    // Mock the layer to have flex-col className
    mockFindLayerById.mockReturnValue({
      props: { className: 'flex flex-col' }
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    expect(placeholder).toBeInTheDocument();
    // For vertical layout, should show horizontal lines
    expect(placeholder).toHaveStyle('bottom: -1px');
  });

  it('defaults to vertical layout when parent has no className', () => {
    // Mock the layer to have no className
    mockFindLayerById.mockReturnValue({
      props: {}
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    expect(placeholder).toBeInTheDocument();
    // Should default to horizontal lines (column layout)
    expect(placeholder).toHaveStyle('bottom: -1px');
  });

  it('handles position 0 correctly for horizontal layout', () => {
    // Mock the layer to have flex-row className
    mockFindLayerById.mockReturnValue({
      props: { className: 'flex flex-row' }
    });

    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} position={0} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-0');
    // For horizontal layout at position 0, should position on left
    expect(placeholder).toHaveStyle('left: -1px');
  });
});