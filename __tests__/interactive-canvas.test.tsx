/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InteractiveCanvas } from "@/components/ui/ui-builder/internal/interactive-canvas";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";

// Mock the useEditorStore
jest.mock("@/lib/ui-builder/store/editor-store", () => ({
  useEditorStore: jest.fn(),
}));

// Mock child components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid={`button-${children}`} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("lucide-react", () => ({
  ZoomIn: () => <svg data-testid="zoom-in-icon" />,
  ZoomOut: () => <svg data-testid="zoom-out-icon" />,
}));

describe("InteractiveCanvas", () => {
  const mockUseEditorStore = useEditorStore as unknown as jest.Mock;

  beforeEach(() => {
    // Default mock implementation
    mockUseEditorStore.mockImplementation((selector) => selector({ previewMode: "default" }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderInteractiveCanvas = (props = {}) => {
    return render(
      <InteractiveCanvas
        disableWheel={false}
        disablePinch={false}
        disableDrag={false}
        {...props}
      >
        <div data-testid="child-content">Child Content</div>
      </InteractiveCanvas>
    );
  };

  it("renders children correctly", () => {
    renderInteractiveCanvas();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("initializes with default scale and translation", () => {
    renderInteractiveCanvas();
    const container = screen.getByTestId("interactive-canvas-container");
    expect(container).toHaveStyle("transform: translate(0px, 5px) scale(0.95)");
  });

  it("applies correct scale and translation based on previewMode", () => {
    // Mock the selector function to return 'tablet'
    mockUseEditorStore.mockImplementation((selector) => selector({ previewMode: "tablet" }));
    
    renderInteractiveCanvas();
    
    const container = screen.getByTestId("interactive-canvas-container");
    expect(container).toHaveStyle("transform: translate(-30px, 5px) scale(0.8)");
  });

  it("applies correct scale and translation based on previewMode desktop", () => {
    // Mock the selector function to return 'desktop'
    mockUseEditorStore.mockImplementation((selector) => selector({ previewMode: "desktop" }));
    
    renderInteractiveCanvas();
    
    const container = screen.getByTestId("interactive-canvas-container");
    expect(container).toHaveStyle("transform: translate(-170px, 5px) scale(0.46)");
  });

  it("handles zoom in correctly", () => {
    renderInteractiveCanvas();
    const zoomInButton = screen.getByTestId("button-ZoomIn");

    fireEvent.click(zoomInButton);

    const container = screen.getByTestId("interactive-canvas-container");
    expect(container).toHaveStyle("transform: translate(0px, 5px) scale(1)"); // 0.95 + 0.05
  });

  it("handles zoom out correctly", () => {
    renderInteractiveCanvas();
    const zoomInButton = screen.getByTestId("button-ZoomIn");

    fireEvent.click(zoomInButton);

    const container = screen.getByTestId("interactive-canvas-container");
    const transform = container.style.transform; // e.g., "translate(0px, 5px) scale(1)"
    
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    expect(scaleMatch).not.toBeNull();
    const scale = parseFloat(scaleMatch![1]);
    expect(scale).toBeCloseTo(1.00, 2); // 0.95 + 0.05 = 1.00
  });

  it("prevents default gesture events", () => {
    const preventDefault = jest.fn();
    renderInteractiveCanvas();

    const gestureChangeEvent = new Event("gesturechange");
    gestureChangeEvent.preventDefault = preventDefault;

    document.dispatchEvent(gestureChangeEvent);
    expect(preventDefault).toHaveBeenCalled();

    const gestureEndEvent = new Event("gestureend");
    gestureEndEvent.preventDefault = preventDefault;

    document.dispatchEvent(gestureEndEvent);
    expect(preventDefault).toHaveBeenCalled();

    const gestureStartEvent = new Event("gesturestart");
    gestureStartEvent.preventDefault = preventDefault;

    document.dispatchEvent(gestureStartEvent);
    expect(preventDefault).toHaveBeenCalled();
  });

  it("handles wheel events for zooming when metaKey or ctrlKey is pressed", () => {
    renderInteractiveCanvas();
    const container = screen.getByTestId("interactive-canvas-container");

    fireEvent.wheel(container, {
      deltaY: -100,
      metaKey: true,
      deltaMode: 0,
    });

    expect(container).toHaveStyle("transform: translate(0px, 5px) scale(1.15)"); //-(-100) / 500 = 0.2; //0.95 + 0.2 = 1.15
  });

  it("handles wheel events for panning when metaKey or ctrlKey is not pressed", () => {
    renderInteractiveCanvas();
    const container = screen.getByTestId("interactive-canvas-container");

    fireEvent.wheel(container, {
      deltaY: 50,
      deltaX: 30,
      deltaMode: 0,
    });

    expect(container).toHaveStyle("transform: translate(-30px, -45px) scale(0.95)");
  });

  it("does not allow scale beyond MAX_SCALE", () => {
    renderInteractiveCanvas();
    const zoomInButton = screen.getByTestId("button-ZoomIn");

    for (let i = 0; i < 100; i++) {
      fireEvent.click(zoomInButton);
    }

    const container = screen.getByTestId("interactive-canvas-container");
    expect(container).toHaveStyle("transform: translate(0px, 5px) scale(5)");
  });

  it("does not allow scale below MIN_SCALE", () => {
    renderInteractiveCanvas();
    const zoomOutButton = screen.getByTestId("button-ZoomOut");

    for (let i = 0; i < 100; i++) {
      fireEvent.click(zoomOutButton);
    }

    const container = screen.getByTestId("interactive-canvas-container");
    expect(container).toHaveStyle("transform: translate(0px, 5px) scale(0.1)");
  });

  it("does not allow translation beyond MAX_TRANSLATION", () => {
    renderInteractiveCanvas();
    const container = screen.getByTestId("interactive-canvas-container");

    fireEvent.wheel(container, {
      deltaY: -6000,
      deltaX: -6000,
      deltaMode: 0,
    });

    expect(container).toHaveStyle("transform: translate(6000px, 6000px) scale(0.95)");
  });

  it("disables wheel interactions when disableWheel is true", () => {
    renderInteractiveCanvas({ disableWheel: true });
    const container = screen.getByTestId("interactive-canvas-container");

    fireEvent.wheel(container, {
      deltaY: -100,
      metaKey: true,
      deltaMode: 0,
    });

    // Scale should remain unchanged
    expect(container).toHaveStyle("transform: translate(0px, 5px) scale(0.95)");
  });
});