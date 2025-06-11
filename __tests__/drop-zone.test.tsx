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

  it('does not show drop indicator when not active', () => {
    render(
      <TestWrapper>
        <DropZone {...defaultProps} isActive={false} />
      </TestWrapper>
    );

    const dropZone = screen.getByTestId('drop-zone-parent-123-0');
    expect(dropZone.querySelector('.absolute')).not.toBeInTheDocument();
  });

  it('shows drop indicator when active', () => {
    render(
      <TestWrapper>
        <DropZone {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const dropZone = screen.getByTestId('drop-zone-parent-123-0');
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

  it('applies hover styles when isOver is true', () => {
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
    expect(indicator).toHaveClass('bg-blue-500/20', 'border-2', 'border-blue-500');
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
});

describe('DropPlaceholder', () => {
  const defaultProps = {
    parentId: 'parent-456',
    position: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
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

  it('applies hover styles when isOver is true', () => {
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
    expect(placeholder).toHaveClass('bg-blue-500/30', 'border-blue-500');
  });

  it('applies default styles when not hovering', () => {
    render(
      <TestWrapper>
        <DropPlaceholder {...defaultProps} isActive={true} />
      </TestWrapper>
    );

    const placeholder = screen.getByTestId('drop-placeholder-parent-456-1');
    expect(placeholder).toHaveClass('bg-blue-200/20', 'border-blue-300', 'border-dashed');
  });
});