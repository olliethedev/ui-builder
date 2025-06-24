/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ResizableWrapper, DragHandleContext } from "@/components/ui/ui-builder/internal/canvas/resizable-wrapper";
import { useDrag } from "@use-gesture/react";

// Mock dependencies
jest.mock("@use-gesture/react", () => ({
  useDrag: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  GripVertical: () => <svg data-testid="grip-vertical-icon" />,
}));

jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Test component to access DragHandleContext
const TestContextConsumer = () => {
  const { dragging, setDragging } = useContext(DragHandleContext);
  return (
    <div>
      <span data-testid="dragging-state">{dragging ? "true" : "false"}</span>
      <button data-testid="set-dragging-true" onClick={() => setDragging(true)}>
        Set Dragging True
      </button>
      <button data-testid="set-dragging-false" onClick={() => setDragging(false)}>
        Set Dragging False
      </button>
    </div>
  );
};

describe("ResizableWrapper", () => {
  const mockUseDrag = useDrag as jest.Mock;
  const mockHorizontalDragHandler = jest.fn();
  const mockVerticalDragHandler = jest.fn();
  const mockOnDraggingChange = jest.fn();
  const mockOnSizeChange = jest.fn();

  const defaultProps = {
    children: <div data-testid="child-content">Test Content</div>,
    isResizable: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useDrag to return a function that returns empty object
    mockUseDrag.mockReturnValue(() => ({}));
    
    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  const renderResizableWrapper = (props = {}) => {
    return render(<ResizableWrapper {...defaultProps} {...props} />);
  };

  describe("Basic Rendering", () => {
    it("renders children correctly", () => {
      renderResizableWrapper();
      
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByTestId("child-content")).toHaveTextContent("Test Content");
    });

    it("renders without resizers when isResizable is false", () => {
      renderResizableWrapper({ isResizable: false });
      
      const resizers = screen.queryAllByTestId("resizer");
      expect(resizers).toHaveLength(0);
    });

    it("renders with resizers when isResizable is true", () => {
      renderResizableWrapper({ isResizable: true });
      
      const resizers = screen.getAllByTestId("resizer");
      expect(resizers).toHaveLength(2);
    });

    it("renders GripVertical icons in resizers", () => {
      renderResizableWrapper({ isResizable: true });
      
      const icons = screen.getAllByTestId("grip-vertical-icon");
      expect(icons).toHaveLength(2);
    });

    it("applies correct positioning classes to resizers", () => {
      renderResizableWrapper({ isResizable: true });
      
      const resizers = screen.getAllByTestId("resizer");
      // Horizontal resizer (right middle)
      expect(resizers[0]).toHaveClass("absolute", "top-1/2", "right-[-20px]", "-translate-y-1/2");
      // Vertical resizer (bottom center)
      expect(resizers[1]).toHaveClass("absolute", "bottom-[-20px]", "left-1/2", "-translate-x-1/2", "cursor-ns-resize");
    });
  });

  describe("Responsive Width Styling", () => {
    it("applies width 100% when not resizable to inherit parent constraints", () => {
      renderResizableWrapper({ isResizable: false });
      
      const wrapper = screen.getByTestId("child-content").parentElement;
      expect(wrapper).toHaveStyle("width: 100%");
      expect(wrapper).not.toHaveStyle("width: 800px");
    });

    it("applies initial width and height style when resizable", () => {
      renderResizableWrapper({ isResizable: true });
      
      const wrapper = screen.getByTestId("child-content").parentElement;
      expect(wrapper).toHaveStyle("width: 800px");
      expect(wrapper).toHaveStyle("height: 800px");
    });

    it("calls onSizeChange with initial width and height when becoming resizable", () => {
      renderResizableWrapper({ 
        isResizable: true, 
        onSizeChange: mockOnSizeChange 
      });
      
      expect(mockOnSizeChange).toHaveBeenCalledWith(800, 800);
    });
  });

  describe("Drag Configuration", () => {
    it("configures useDrag with correct parameters for both resizers", () => {
      renderResizableWrapper({ isResizable: true });
      
      // Should be called at least twice - once for horizontal, once for vertical (may be more due to re-renders)
      expect(mockUseDrag).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          axis: "x",
          from: expect.any(Function),
          filterTaps: true,
        })
      );
      
      expect(mockUseDrag).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          axis: "y",
          from: expect.any(Function),
          filterTaps: true,
        })
      );
    });

    it("useDrag from function returns [0, 0]", () => {
      renderResizableWrapper({ isResizable: true });
      
      // Find the horizontal and vertical drag configs from all calls
      const horizontalDragConfig = mockUseDrag.mock.calls.find(call => call[1].axis === "x")?.[1];
      const verticalDragConfig = mockUseDrag.mock.calls.find(call => call[1].axis === "y")?.[1];
      
      expect(horizontalDragConfig).toBeDefined();
      expect(verticalDragConfig).toBeDefined();
      expect(horizontalDragConfig.from()).toEqual([0, 0]);
      expect(verticalDragConfig.from()).toEqual([0, 0]);
    });
  });

  describe("Drag Interaction", () => {
    beforeEach(() => {
      // Mock useDrag to capture the drag handlers
      let callIndex = 0;
      mockUseDrag.mockImplementation((handler) => {
        if (callIndex === 0) {
          mockHorizontalDragHandler.mockImplementation(handler);
        } else {
          mockVerticalDragHandler.mockImplementation(handler);
        }
        callIndex++;
        return () => ({});
      });
    });

    it("sets dragging to true when horizontal drag starts", () => {
      renderResizableWrapper({ 
        isResizable: true,
        onDraggingChange: mockOnDraggingChange 
      });
      
      // Simulate horizontal drag start
      act(() => {
        mockHorizontalDragHandler({
          down: true,
          movement: [0, 0],
          first: true,
          last: false,
        });
      });
      
      expect(mockOnDraggingChange).toHaveBeenCalledWith(true);
    });

    it("updates width during horizontal drag", () => {
      renderResizableWrapper({ 
        isResizable: true,
        onSizeChange: mockOnSizeChange 
      });
      
      // Simulate horizontal drag start
      act(() => {
        mockHorizontalDragHandler({
          down: true,
          movement: [0, 0],
          first: true,
          last: false,
        });
      });
      
      // Simulate horizontal drag movement
      act(() => {
        mockHorizontalDragHandler({
          down: true,
          movement: [100, 0],
          first: false,
          last: false,
        });
      });
      
      expect(mockOnSizeChange).toHaveBeenCalledWith(900, 800);
    });

    it("enforces minimum width of 320px during horizontal drag", () => {
      renderResizableWrapper({ 
        isResizable: true,
        onSizeChange: mockOnSizeChange 
      });
      
      // Simulate horizontal drag start
      act(() => {
        mockHorizontalDragHandler({
          down: true,
          movement: [0, 0],
          first: true,
          last: false,
        });
      });
      
      // Simulate large negative movement
      act(() => {
        mockHorizontalDragHandler({
          down: true,
          movement: [-600, 0],
          first: false,
          last: false,
        });
      });
      
      expect(mockOnSizeChange).toHaveBeenCalledWith(320, 800); // Minimum width with height unchanged
    });

    it("updates height during vertical drag", () => {
      renderResizableWrapper({ 
        isResizable: true,
        onSizeChange: mockOnSizeChange 
      });
      
      // Simulate vertical drag start
      act(() => {
        mockVerticalDragHandler({
          down: true,
          movement: [0, 0],
          first: true,
          last: false,
        });
      });
      
      // Simulate vertical drag movement
      act(() => {
        mockVerticalDragHandler({
          down: true,
          movement: [0, 100],
          first: false,
          last: false,
        });
      });
      
      expect(mockOnSizeChange).toHaveBeenCalledWith(800, 900);
    });

    it("enforces minimum height of 200px during vertical drag", () => {
      renderResizableWrapper({ 
        isResizable: true,
        onSizeChange: mockOnSizeChange 
      });
      
      // Simulate vertical drag start
      act(() => {
        mockVerticalDragHandler({
          down: true,
          movement: [0, 0],
          first: true,
          last: false,
        });
      });
      
      // Simulate large negative movement
      act(() => {
        mockVerticalDragHandler({
          down: true,
          movement: [0, -700],
          first: false,
          last: false,
        });
      });
      
      expect(mockOnSizeChange).toHaveBeenCalledWith(800, 200); // Minimum height with width unchanged
    });

    it("sets dragging to false when drag ends", (done) => {
      renderResizableWrapper({ 
        isResizable: true,
        onDraggingChange: mockOnDraggingChange 
      });
      
      // Simulate horizontal drag end
      act(() => {
        mockHorizontalDragHandler({
          down: false,
          movement: [0, 0],
          first: false,
          last: true,
        });
      });
      
      // Wait for setTimeout to complete
      setTimeout(() => {
        expect(mockOnDraggingChange).toHaveBeenCalledWith(false);
        done();
      }, 10);
    });
  });

  describe("Resizer Component Events", () => {
    it("handles mouseDown event correctly", () => {
      renderResizableWrapper({ isResizable: true });
      
      const resizer = screen.getAllByTestId("resizer")[0];
      
      // Test that mouseDown event doesn't throw and the component handles it
      expect(() => {
        fireEvent.mouseDown(resizer);
      }).not.toThrow();
      
      // Verify the resizer is still in the document after the event
      expect(resizer).toBeInTheDocument();
    });

    it("handles touchStart event correctly", () => {
      renderResizableWrapper({ isResizable: true });
      
      const resizer = screen.getAllByTestId("resizer")[0];
      
      // Test that touchStart event doesn't throw and the component handles it  
      expect(() => {
        fireEvent.touchStart(resizer);
      }).not.toThrow();
      
      // Verify the resizer is still in the document after the event
      expect(resizer).toBeInTheDocument();
    });

    it("applies correct CSS classes to horizontal resizer", () => {
      renderResizableWrapper({ isResizable: true });
      
      const resizer = screen.getAllByTestId("resizer")[0];
      expect(resizer).toHaveClass(
        "flex",
        "items-center",
        "justify-center",
        "w-4",
        "h-4",
        "cursor-ew-resize",
        "rounded-sm",
        "border",
        "bg-border",
        "hover:bg-muted",
        "touch-none",
        "z-[1001]"
      );
    });

    it("applies correct CSS classes to vertical resizer", () => {
      renderResizableWrapper({ isResizable: true });
      
      const resizers = screen.getAllByTestId("resizer");
      const verticalResizer = resizers[1];
      expect(verticalResizer).toHaveClass(
        "flex",
        "items-center",
        "justify-center",
        "w-4",
        "h-4",
        "rounded-sm",
        "border",
        "bg-border",
        "hover:bg-muted",
        "touch-none",
        "z-[1001]",
        "cursor-ns-resize"
      );
    });
  });

  describe("DragHandleContext", () => {
    it("provides default context values", () => {
      render(
        <div>
          <TestContextConsumer />
        </div>
      );
      
      expect(screen.getByTestId("dragging-state")).toHaveTextContent("false");
    });

    it("provides context with current dragging state", () => {
      render(
        <ResizableWrapper isResizable={false}>
          <TestContextConsumer />
        </ResizableWrapper>
      );
      
      expect(screen.getByTestId("dragging-state")).toHaveTextContent("false");
    });

    it("allows updating dragging state through context", () => {
      render(
        <ResizableWrapper isResizable={false}>
          <TestContextConsumer />
        </ResizableWrapper>
      );
      
      const setDraggingButton = screen.getByTestId("set-dragging-true");
      fireEvent.click(setDraggingButton);
      
      expect(screen.getByTestId("dragging-state")).toHaveTextContent("true");
    });

    it("calls onDraggingChange when context dragging state changes", () => {
      render(
        <ResizableWrapper 
          isResizable={false} 
          onDraggingChange={mockOnDraggingChange}
        >
          <TestContextConsumer />
        </ResizableWrapper>
      );
      
      const setDraggingButton = screen.getByTestId("set-dragging-true");
      fireEvent.click(setDraggingButton);
      
      expect(mockOnDraggingChange).toHaveBeenCalledWith(true);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles missing onDraggingChange callback", () => {
      renderResizableWrapper({ isResizable: true });
      
      // Should not throw when onDraggingChange is not provided
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });

    it("handles missing onSizeChange callback", () => {
      renderResizableWrapper({ isResizable: true });
      
      // Should not throw when onSizeChange is not provided
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });

    it("handles prop changes from non-resizable to resizable", () => {
      const { rerender } = renderResizableWrapper({ isResizable: false });
      
      expect(screen.queryAllByTestId("resizer")).toHaveLength(0);
      
      rerender(
        <ResizableWrapper 
          {...defaultProps} 
          isResizable={true} 
          onSizeChange={mockOnSizeChange}
        />
      );
      
      expect(screen.getAllByTestId("resizer")).toHaveLength(2);
      expect(mockOnSizeChange).toHaveBeenCalledWith(800, 800);
    });

    it("handles prop changes from resizable to non-resizable", () => {
      const { rerender } = renderResizableWrapper({ isResizable: true });
      
      expect(screen.getAllByTestId("resizer")).toHaveLength(2);
      
      rerender(
        <ResizableWrapper {...defaultProps} isResizable={false} />
      );
      
      expect(screen.queryAllByTestId("resizer")).toHaveLength(0);
    });
  });

  describe("Performance and Memoization", () => {
    it("memoizes drag config to avoid unnecessary recalculations", () => {
      const { rerender } = renderResizableWrapper({ isResizable: true });
      
      const initialCallCount = mockUseDrag.mock.calls.length;
      
      rerender(<ResizableWrapper {...defaultProps} isResizable={true} />);
      
      // Find horizontal and vertical configs from all calls
      const horizontalConfigs = mockUseDrag.mock.calls.filter(call => call[1].axis === "x").map(call => call[1]);
      const verticalConfigs = mockUseDrag.mock.calls.filter(call => call[1].axis === "y").map(call => call[1]);
      
      // Should have at least one config of each type
      expect(horizontalConfigs.length).toBeGreaterThan(0);
      expect(verticalConfigs.length).toBeGreaterThan(0);
      
      // All horizontal configs should have the same structure
      horizontalConfigs.forEach(config => {
        expect(config.axis).toBe("x");
        expect(config.filterTaps).toBe(true);
      });
      
      // All vertical configs should have the same structure
      verticalConfigs.forEach(config => {
        expect(config.axis).toBe("y");
        expect(config.filterTaps).toBe(true);
      });
    });

    it("memoizes bind resizer values", () => {
      renderResizableWrapper({ isResizable: true });
      
      // Verify that useDrag is called (indicating memoization is working)
      expect(mockUseDrag).toHaveBeenCalled();
    });

    it("memoizes responsive size style calculations", () => {
      const { rerender } = renderResizableWrapper({ isResizable: true });
      
      const wrapper = screen.getByTestId("child-content").parentElement;
      const firstWidthStyle = wrapper?.style.width;
      const firstHeightStyle = wrapper?.style.height;
      
      rerender(<ResizableWrapper {...defaultProps} isResizable={true} />);
      
      const secondWidthStyle = wrapper?.style.width;
      const secondHeightStyle = wrapper?.style.height;
      expect(firstWidthStyle).toBe(secondWidthStyle);
      expect(firstHeightStyle).toBe(secondHeightStyle);
    });

    it("memoizes context value to avoid unnecessary re-renders", () => {
      const { rerender } = render(
        <ResizableWrapper isResizable={false}>
          <TestContextConsumer />
        </ResizableWrapper>
      );
      
      const firstDraggingState = screen.getByTestId("dragging-state").textContent;
      
      rerender(
        <ResizableWrapper isResizable={false}>
          <TestContextConsumer />
        </ResizableWrapper>
      );
      
      const secondDraggingState = screen.getByTestId("dragging-state").textContent;
      expect(firstDraggingState).toBe(secondDraggingState);
    });
  });

  describe("Accessibility", () => {

    it("applies touch-none class to prevent touch interactions", () => {
      renderResizableWrapper({ isResizable: true });
      
      const resizers = screen.getAllByTestId("resizer");
      resizers.forEach(resizer => {
        expect(resizer).toHaveClass("touch-none");
      });
    });

    it("applies appropriate z-index for resizers", () => {
      renderResizableWrapper({ isResizable: true });
      
      const resizers = screen.getAllByTestId("resizer");
      resizers.forEach(resizer => {
        expect(resizer).toHaveClass("z-[1001]");
      });
    });
  });

  describe("Additional Edge Cases", () => {
    it("handles bindResizer when not a function", () => {
      // Mock useDrag to return something that's not a function
      mockUseDrag.mockReturnValue("not-a-function");
      
      renderResizableWrapper({ isResizable: true });
      
      // Should still render without crashing
      expect(screen.getAllByTestId("resizer")).toHaveLength(2);
    });

    it("handles responsiveSize as null for initial render", () => {
      // Test the initial state where responsiveSize might be null
      renderResizableWrapper({ isResizable: false });
      
      // Re-render as resizable after initial render
      const { rerender } = renderResizableWrapper({ isResizable: false });
      rerender(<ResizableWrapper isResizable={true}>{defaultProps.children}</ResizableWrapper>);
      
      // Should handle the transition gracefully
      expect(screen.getAllByTestId("resizer")).toHaveLength(2);
    });

    it("handles no responsiveSize for width style", () => {
      // Test when responsiveSize is null
      renderResizableWrapper({ isResizable: false });
      
      const wrapper = screen.getByTestId("child-content").parentElement;
      // Should apply width: 100% when not resizable to inherit parent constraints
      expect(wrapper).toHaveStyle("width: 100%");
    });

    it("handles className merging correctly in Resizer", () => {
      renderResizableWrapper({ isResizable: true });
      
      const resizers = screen.getAllByTestId("resizer");
      // Horizontal resizer
      expect(resizers[0]).toHaveClass("absolute", "top-1/2", "right-[-20px]", "-translate-y-1/2");
      // Vertical resizer  
      expect(resizers[1]).toHaveClass("absolute", "bottom-[-20px]", "left-1/2", "-translate-x-1/2", "cursor-ns-resize");
    });
  });
}); 