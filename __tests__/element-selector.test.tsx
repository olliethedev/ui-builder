import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ElementSelector } from "@/components/ui/ui-builder/internal/element-selector";
import { ComponentLayer } from '@/components/ui/ui-builder/types';

// Mock ResizeObserver
const mockResizeObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
};
(global as any).ResizeObserver = jest.fn(() => mockResizeObserver);

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
      const overlay = document.querySelector('.absolute.box-border');
      expect(overlay).toBeInTheDocument();
    });
  }, 10000);

  it("calls onSelectElement when overlay is clicked with minimal movement", async () => {
    const mockOnSelect = jest.fn();
    render(
      <TestWrapper>
        <ElementSelector {...defaultProps} onSelectElement={mockOnSelect}>
          <div>Test Content</div>
        </ElementSelector>
      </TestWrapper>
    );
    
    await waitFor(() => {
      const overlay = document.querySelector('.absolute.box-border');
      expect(overlay).toBeInTheDocument();
    });

    const overlay = document.querySelector('.absolute.box-border') as HTMLElement;
    
    // Simulate mouse down and up with minimal movement (should trigger selection)
    fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(overlay, { clientX: 102, clientY: 102 }); // 2px movement, under 5px threshold
    
    expect(mockOnSelect).toHaveBeenCalledWith("test-layer");
  });

  it("does not call onSelectElement when overlay is dragged with significant movement", async () => {
    const mockOnSelect = jest.fn();
    render(
      <TestWrapper>
        <ElementSelector {...defaultProps} onSelectElement={mockOnSelect}>
          <div>Test Content</div>
        </ElementSelector>
      </TestWrapper>
    );
    
    await waitFor(() => {
      const overlay = document.querySelector('.absolute.box-border');
      expect(overlay).toBeInTheDocument();
    });

    const overlay = document.querySelector('.absolute.box-border') as HTMLElement;
    
    // Simulate mouse down and up with significant movement (should NOT trigger selection)
    fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(overlay, { clientX: 120, clientY: 120 }); // 28px movement, over 5px threshold
    
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("does not call onSelectElement when interaction takes too long (likely panning)", async () => {
    const mockOnSelect = jest.fn();
    render(
      <TestWrapper>
        <ElementSelector {...defaultProps} onSelectElement={mockOnSelect}>
          <div>Test Content</div>
        </ElementSelector>
      </TestWrapper>
    );
    
    await waitFor(() => {
      const overlay = document.querySelector('.absolute.box-border');
      expect(overlay).toBeInTheDocument();
    });

    const overlay = document.querySelector('.absolute.box-border') as HTMLElement;
    
    // Simulate a long interaction (like panning)
    fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
    
    // Wait longer than the click threshold (200ms)
    await new Promise(resolve => setTimeout(resolve, 250));
    
    fireEvent.mouseUp(overlay, { clientX: 102, clientY: 102 }); // Small movement, but took too long
    
    expect(mockOnSelect).not.toHaveBeenCalled();
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
      const overlay = document.querySelector('.absolute.box-border');
      expect(overlay).toBeInTheDocument();
    });

    const overlay = document.querySelector('.absolute.box-border') as HTMLElement;
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
    
    const overlay = document.querySelector('.absolute.box-border');
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