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
    onSelectElement: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders children correctly", () => {
    render(
      <ElementSelector {...defaultProps}>
        <div>Test Content</div>
      </ElementSelector>
    );
    
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("shows selection overlay when element has bounds", async () => {
    render(
      <ElementSelector {...defaultProps}>
        <div>Test Content</div>
      </ElementSelector>
    );
    
    await waitFor(() => {
      const overlay = document.querySelector('.fixed.pointer-events-auto');
      expect(overlay).toBeInTheDocument();
    });
  });

  it("calls onSelectElement when overlay is clicked", async () => {
    const mockOnSelect = jest.fn();
    render(
      <ElementSelector {...defaultProps} onSelectElement={mockOnSelect}>
        <div>Test Content</div>
      </ElementSelector>
    );
    
    await waitFor(() => {
      const overlay = document.querySelector('.fixed.pointer-events-auto');
      expect(overlay).toBeInTheDocument();
    });

    const overlay = document.querySelector('.fixed.pointer-events-auto') as HTMLElement;
    fireEvent.click(overlay);
    
    expect(mockOnSelect).toHaveBeenCalledWith("test-layer");
  });

  it("shows blue border when selected", async () => {
    render(
      <ElementSelector {...defaultProps} isSelected={true}>
        <div>Test Content</div>
      </ElementSelector>
    );
    
    await waitFor(() => {
      const overlay = document.querySelector('.border-blue-500');
      expect(overlay).toBeInTheDocument();
    });
  });

  it("shows light blue border on hover", async () => {
    render(
      <ElementSelector {...defaultProps}>
        <div>Test Content</div>
      </ElementSelector>
    );
    
    await waitFor(() => {
      const overlay = document.querySelector('.fixed.pointer-events-auto');
      expect(overlay).toBeInTheDocument();
    });

    const overlay = document.querySelector('.fixed.pointer-events-auto') as HTMLElement;
    fireEvent.mouseEnter(overlay);
    
    await waitFor(() => {
      expect(overlay).toHaveClass('border-blue-300');
    });
  });

  it("shows layer label when selected", async () => {
    render(
      <ElementSelector {...defaultProps} isSelected={true}>
        <div>Test Content</div>
      </ElementSelector>
    );
    
    await waitFor(() => {
      expect(screen.getByText("Test Layer")).toBeInTheDocument();
    });
  });

  it("does not show overlay for page layers", () => {
    render(
      <ElementSelector {...defaultProps} isPageLayer={true}>
        <div>Test Content</div>
      </ElementSelector>
    );
    
    const overlay = document.querySelector('.fixed.pointer-events-auto');
    expect(overlay).not.toBeInTheDocument();
  });

  it("handles resize events", async () => {
    render(
      <ElementSelector {...defaultProps}>
        <div>Test Content</div>
      </ElementSelector>
    );
    
    await waitFor(() => {
      expect(mockResizeObserver.observe).toHaveBeenCalled();
    });
    
    fireEvent(window, new Event('resize'));
    // Should not crash
  });
}); 