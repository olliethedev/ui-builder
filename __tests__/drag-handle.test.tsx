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

  it('applies default styling classes', () => {
    render(
      <TestWrapper>
        <DragHandle {...defaultProps} />
      </TestWrapper>
    );

    const dragHandle = screen.getByTestId('drag-handle-test-layer-id');
    expect(dragHandle).toHaveClass('absolute', 'top-0', 'right-0', 'cursor-grab', 'bg-blue-500');
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

  it('applies dragging styles when isDragging is true', () => {
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
    expect(dragHandle).toHaveClass('opacity-100', 'cursor-grabbing');
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
});