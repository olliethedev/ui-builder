import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DndContext } from '@dnd-kit/core';
import { DraggableNewComponent } from '@/components/ui/ui-builder/internal/dnd/draggable-new-component';

// Mock useDraggable hook
const mockUseDraggable = {
  attributes: { 'aria-describedby': 'test-id' },
  listeners: { onMouseDown: jest.fn() },
  setNodeRef: jest.fn(),
  setActivatorNodeRef: jest.fn(),
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

describe('DraggableNewComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useDraggable } = require('@dnd-kit/core');
    useDraggable.mockReturnValue(mockUseDraggable);
  });

  it('renders children correctly', () => {
    render(
      <TestWrapper>
        <DraggableNewComponent componentType="Button">
          <span>Button Component</span>
        </DraggableNewComponent>
      </TestWrapper>
    );

    expect(screen.getByText('Button Component')).toBeInTheDocument();
  });

  it('renders drag handle with GripVertical icon', () => {
    render(
      <TestWrapper>
        <DraggableNewComponent componentType="Button">
          <span>Button</span>
        </DraggableNewComponent>
      </TestWrapper>
    );

    // Check for drag handle aria label
    expect(screen.getByLabelText('Drag Button to canvas')).toBeInTheDocument();
  });

  it('calls useDraggable with correct configuration', () => {
    const { useDraggable } = require('@dnd-kit/core');
    
    render(
      <TestWrapper>
        <DraggableNewComponent componentType="Card">
          <span>Card</span>
        </DraggableNewComponent>
      </TestWrapper>
    );

    expect(useDraggable).toHaveBeenCalledWith({
      id: 'new-component-Card',
      data: {
        type: 'new-component',
        componentType: 'Card',
      },
    });
  });

  it('applies opacity when dragging', () => {
    const { useDraggable } = require('@dnd-kit/core');
    useDraggable.mockReturnValue({
      ...mockUseDraggable,
      isDragging: true,
    });

    render(
      <TestWrapper>
        <DraggableNewComponent componentType="Button">
          <span>Button</span>
        </DraggableNewComponent>
      </TestWrapper>
    );

    const wrapper = screen.getByText('Button').parentElement?.parentElement;
    expect(wrapper).toHaveClass('opacity-50');
  });

  it('calls onDragStart when dragging begins', () => {
    const onDragStart = jest.fn();
    const { useDraggable } = require('@dnd-kit/core');
    
    // First render with isDragging = false
    useDraggable.mockReturnValue({
      ...mockUseDraggable,
      isDragging: false,
    });

    const { rerender } = render(
      <TestWrapper>
        <DraggableNewComponent componentType="Button" onDragStart={onDragStart}>
          <span>Button</span>
        </DraggableNewComponent>
      </TestWrapper>
    );

    expect(onDragStart).not.toHaveBeenCalled();

    // Simulate drag start by changing isDragging
    useDraggable.mockReturnValue({
      ...mockUseDraggable,
      isDragging: true,
    });

    rerender(
      <TestWrapper>
        <DraggableNewComponent componentType="Button" onDragStart={onDragStart}>
          <span>Button</span>
        </DraggableNewComponent>
      </TestWrapper>
    );

    expect(onDragStart).toHaveBeenCalledTimes(1);
  });

  it('applies custom className when provided', () => {
    render(
      <TestWrapper>
        <DraggableNewComponent componentType="Button" className="custom-class">
          <span>Button</span>
        </DraggableNewComponent>
      </TestWrapper>
    );

    const wrapper = screen.getByText('Button').parentElement?.parentElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes on drag handle', () => {
    render(
      <TestWrapper>
        <DraggableNewComponent componentType="Input">
          <span>Input</span>
        </DraggableNewComponent>
      </TestWrapper>
    );

    const dragHandle = screen.getByLabelText('Drag Input to canvas');
    expect(dragHandle).toHaveClass('cursor-grab');
  });
});
