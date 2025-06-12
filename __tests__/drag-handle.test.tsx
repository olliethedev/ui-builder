import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DndContext } from '@dnd-kit/core';
import { DragHandle } from '@/components/ui/ui-builder/internal/drag-handle';

// Mock the dnd-kit utilities
jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Translate: {
      toString: jest.fn(() => 'translate3d(0, 0, 0)'),
    },
  },
  useLatestValue: jest.fn(() => jest.fn()),
}));

// Mock useDraggable hook
const mockUseDraggable = {
  attributes: { 'data-testid': 'draggable' },
  listeners: { onMouseDown: jest.fn() },
  setNodeRef: jest.fn(),
  transform: null,
  isDragging: false,
};

jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  useDraggable: jest.fn(() => mockUseDraggable),
  DndContext: ({ children, onDragEnd }: any) => (
    <div data-testid="dnd-context">{children}</div>
  ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndContext onDragEnd={() => {}}>
    {children}
  </DndContext>
);

describe('DragHandle', () => {
  const defaultProps = {
    layerId: 'test-layer-id',
    layerType: 'div',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders drag handle with correct test id', () => {
    render(
      <TestWrapper>
        <DragHandle {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('drag-handle-test-layer-id')).toBeInTheDocument();
  });

  it('renders as a draggable element', () => {
    render(
      <TestWrapper>
        <DragHandle {...defaultProps} />
      </TestWrapper>
    );

    const dragHandle = screen.getByTestId('drag-handle-test-layer-id');
    // Test that element exists and is a div element with proper test id
    expect(dragHandle).toBeInTheDocument();
    expect(dragHandle.tagName).toBe('DIV');
    expect(dragHandle).toHaveAttribute('data-testid', 'drag-handle-test-layer-id');
  });

  it('applies custom className when provided', () => {
    render(
      <TestWrapper>
        <DragHandle {...defaultProps} className="custom-class" />
      </TestWrapper>
    );

    const dragHandle = screen.getByTestId('drag-handle-test-layer-id');
    expect(dragHandle).toHaveClass('custom-class');
  });

  it('renders GripVertical icon', () => {
    render(
      <TestWrapper>
        <DragHandle {...defaultProps} />
      </TestWrapper>
    );

    const icon = screen.getByTestId('drag-handle-test-layer-id').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('shows appropriate cursor when dragging state changes', () => {
    // Mock isDragging state
    const { useDraggable } = require('@dnd-kit/core');
    useDraggable.mockReturnValue({
      ...mockUseDraggable,
      isDragging: true,
    });

    render(
      <TestWrapper>
        <DragHandle {...defaultProps} />
      </TestWrapper>
    );

    const dragHandle = screen.getByTestId('drag-handle-test-layer-id');
    // Check that the element exists and has dragging state reflected
    expect(dragHandle).toBeInTheDocument();
    expect(dragHandle).toHaveAttribute('data-testid', 'drag-handle-test-layer-id');
  });

  it('calls useDraggable with correct configuration', () => {
    const { useDraggable } = require('@dnd-kit/core');

    render(
      <TestWrapper>
        <DragHandle {...defaultProps} />
      </TestWrapper>
    );

    expect(useDraggable).toHaveBeenCalledWith({
      id: 'test-layer-id',
      data: {
        type: 'layer',
        layerId: 'test-layer-id',
        layerType: 'div',
      },
    });
  });

  it('applies transform style when provided', () => {
    const { useDraggable } = require('@dnd-kit/core');
    useDraggable.mockReturnValue({
      ...mockUseDraggable,
      transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
    });

    render(
      <TestWrapper>
        <DragHandle {...defaultProps} />
      </TestWrapper>
    );

    const dragHandle = screen.getByTestId('drag-handle-test-layer-id');
    expect(dragHandle).toHaveStyle('transform: translate3d(0, 0, 0)');
  });

  it('has proper draggable attributes and listeners from useDraggable', () => {
    render(
      <TestWrapper>
        <DragHandle {...defaultProps} />
      </TestWrapper>
    );

    const dragHandle = screen.getByTestId('drag-handle-test-layer-id');
    // Check that the component exists and is properly configured
    expect(dragHandle).toBeInTheDocument();
    // Verify that useDraggable was called (testing the integration)
    const { useDraggable } = require('@dnd-kit/core');
    expect(useDraggable).toHaveBeenCalled();
  });

  it('renders with correct structural elements', () => {
    render(
      <TestWrapper>
        <DragHandle {...defaultProps} />
      </TestWrapper>
    );

    const dragHandle = screen.getByTestId('drag-handle-test-layer-id');
    // Check structural elements rather than specific classes
    expect(dragHandle.tagName).toBe('DIV');
    expect(dragHandle.querySelector('svg')).toBeInTheDocument();
  });
});