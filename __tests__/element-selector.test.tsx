import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ElementSelector } from "@/components/ui/ui-builder/internal/components/element-selector";
import { ComponentLayer } from '@/components/ui/ui-builder/types';

// Mock ResizeObserver
const mockResizeObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
};
(global as any).ResizeObserver = jest.fn(() => mockResizeObserver);

// Mock MutationObserver
const mockMutationObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
};
(global as any).MutationObserver = jest.fn(() => mockMutationObserver);

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  top: 100,
  left: 100,
  bottom: 200,
  right: 200,
  width: 100,
  height: 100,
  x: 100,
  y: 100,
  toJSON: jest.fn(),
}));

// Mock the transform hooks that require TransformWrapper
jest.mock('react-zoom-pan-pinch', () => ({
  useTransformEffect: jest.fn((callback) => {
    // Call the callback with mock data
    callback({
      state: { scale: 1, positionX: 0, positionY: 0 },
      instance: { transformState: { scale: 1, positionX: 0, positionY: 0 } }
    });
  }),
  useTransformContext: jest.fn(() => ({
    transformState: { scale: 1, positionX: 0, positionY: 0 },
    instance: { transformState: { scale: 1, positionX: 0, positionY: 0 } }
  })),
  TransformWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TransformComponent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock floating UI
jest.mock('@floating-ui/react', () => ({
  useFloating: jest.fn(() => ({
    refs: {
      setReference: jest.fn(),
      setFloating: jest.fn(),
    },
    floatingStyles: {},
  })),
  offset: jest.fn(),
  autoUpdate: jest.fn(),
  shift: jest.fn(),
  limitShift: jest.fn(),
}));

// Mock AutoFrame context
jest.mock('@/components/ui/ui-builder/internal/canvas/auto-frame', () => ({
  useFrame: jest.fn(() => ({
    document: document,
    window: window,
  })),
}));

// Mock DragHandleContext
jest.mock('@/components/ui/ui-builder/internal/canvas/resizable-wrapper', () => ({
  DragHandleContext: React.createContext({ dragging: false }),
}));

// Mock DND context
jest.mock('@/lib/ui-builder/context/dnd-context', () => ({
  useDndContext: jest.fn(() => ({
    activeLayerId: null,
  })),
}));

// Mock getScrollParent
jest.mock('@/lib/ui-builder/utils/get-scroll-parent', () => ({
  getScrollParent: jest.fn(() => document.body),
}));

// Mock LayerMenu component
jest.mock('@/components/ui/ui-builder/internal/components/layer-menu', () => ({
  LayerMenu: jest.fn(() => <div data-testid="layer-menu">Menu</div>),
}));

// Mock DragHandle component
jest.mock('@/components/ui/ui-builder/internal/dnd/drag-handle', () => ({
  DragHandle: jest.fn(() => <div data-testid="drag-handle">Handle</div>),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

describe("ElementSelector", () => {
  const mockLayer: ComponentLayer = {
    id: "test-layer",
    type: "div",
    name: "Test Layer",
    props: {},
    children: [],
  };

  const defaultProps = {
    layer: mockLayer,
    isSelected: false,
    zIndex: 1,
    totalLayers: 5,
    onSelectElement: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders children correctly", () => {
    render(
      <TestWrapper>
        <ElementSelector {...defaultProps}>
          <div>Test Content</div>
        </ElementSelector>
      </TestWrapper>
    );
    
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("shows selection overlay when element has bounds", async () => {
    render(
      <TestWrapper>
        <ElementSelector {...defaultProps}>
          <div>Test Content</div>
        </ElementSelector>
      </TestWrapper>
    );
    
    await waitFor(() => {
      const overlay = document.querySelector('.fixed.box-border');
      expect(overlay).toBeInTheDocument();
    });
  }, 10000);

  it("calls onSelectElement when overlay is clicked", async () => {
    const mockOnSelect = jest.fn();
    render(
      <TestWrapper>
        <ElementSelector {...defaultProps} onSelectElement={mockOnSelect}>
          <div>Test Content</div>
        </ElementSelector>
      </TestWrapper>
    );
    
    await waitFor(() => {
      const overlay = document.querySelector('.fixed.box-border');
      expect(overlay).toBeInTheDocument();
    });

    const overlay = document.querySelector('.fixed.box-border') as HTMLElement;
    
    // Simulate a simple click
    fireEvent.click(overlay);
    
    expect(mockOnSelect).toHaveBeenCalledWith("test-layer");
  });



  it("shows blue border when selected", async () => {
    render(
      <TestWrapper>
        <ElementSelector {...defaultProps} isSelected={true}>
          <div>Test Content</div>
        </ElementSelector>
      </TestWrapper>
    );
    
    await waitFor(() => {
      const overlay = document.querySelector('.border-blue-500');
      expect(overlay).toBeInTheDocument();
    });
  });

  it("shows light blue border on hover", async () => {
    render(
      <TestWrapper>
        <ElementSelector {...defaultProps}>
          <div>Test Content</div>
        </ElementSelector>
      </TestWrapper>
    );
    
    await waitFor(() => {
      const overlay = document.querySelector('.fixed.box-border');
      expect(overlay).toBeInTheDocument();
    });

    const overlay = document.querySelector('.fixed.box-border') as HTMLElement;
    fireEvent.mouseEnter(overlay);
    
    await waitFor(() => {
      expect(overlay).toHaveClass('hover:border-blue-300');
    });
  });

  it("shows layer label when selected", async () => {
    render(
      <TestWrapper>
        <ElementSelector {...defaultProps} isSelected={true}>
          <div>Test Content</div>
        </ElementSelector>
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText("Test Layer (div)")).toBeInTheDocument();
    });
  });

  it("does not show overlay for page layers", () => {
    render(
      <TestWrapper>
        <ElementSelector {...defaultProps} isPageLayer={true}>
          <div>Test Content</div>
        </ElementSelector>
      </TestWrapper>
    );
    
    const overlay = document.querySelector('.fixed.box-border');
    expect(overlay).not.toBeInTheDocument();
  });

  it("handles resize events", async () => {
    render(
      <TestWrapper>
        <ElementSelector {...defaultProps}>
          <div>Test Content</div>
        </ElementSelector>
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(mockResizeObserver.observe).toHaveBeenCalled();
    });
    
    fireEvent(window, new Event('resize'));
    // Should not crash
  });
}); 