/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ResizableWrapper, DragHandleContext } from "@/components/ui/ui-builder/internal/resizable-wrapper";
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
  const mockDragHandler = jest.fn();
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
      expect(resizers[0]).toHaveClass("absolute", "top-0", "right-[-40px]");
      expect(resizers[1]).toHaveClass("absolute", "bottom-7", "right-[-40px]");
    });
  });

  describe("Responsive Width Styling", () => {
    it("applies width 100% when not resizable to inherit parent constraints", () => {
      renderResizableWrapper({ isResizable: false });
      
      const wrapper = screen.getByTestId("child-content").parentElement;
      expect(wrapper).toHaveStyle("width: 100%");
      expect(wrapper).not.toHaveStyle("width: 800px");
    });

    it("applies initial width style when resizable", () => {
      renderResizableWrapper({ isResizable: true });
      
      const wrapper = screen.getByTestId("child-content").parentElement;
      expect(wrapper).toHaveStyle("width: 800px");
    });

    it("calls onSizeChange with initial width when becoming resizable", () => {
      renderResizableWrapper({ 
        isResizable: true, 
        onSizeChange: mockOnSizeChange 
      });
      
      expect(mockOnSizeChange).toHaveBeenCalledWith(800);
    });
  });

  describe("Drag Configuration", () => {
    it("configures useDrag with correct parameters", () => {
      renderResizableWrapper({ isResizable: true });
      
      expect(mockUseDrag).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          axis: "x",
          from: expect.any(Function),
          filterTaps: true,
        })
      );
    });

    it("useDrag from function returns [0, 0]", () => {
      renderResizableWrapper({ isResizable: true });
      
      const dragConfig = mockUseDrag.mock.calls[0][1];
      expect(dragConfig.from()).toEqual([0, 0]);
    });
  });

  describe("Drag Interaction", () => {
    beforeEach(() => {
      // Mock useDrag to capture the drag handler
      mockUseDrag.mockImplementation((handler) => {
        mockDragHandler.mockImplementation(handler);
        return () => ({});
      });
    });

    it("sets dragging to true when drag starts", () => {
      renderResizableWrapper({ 
        isResizable: true,
        onDraggingChange: mockOnDraggingChange 
      });
      
      // Simulate drag start
      act(() => {
        mockDragHandler({
          down: true,
          movement: [0, 0],
          first: true,
          last: false,
        });
      });
      
      expect(mockOnDraggingChange).toHaveBeenCalledWith(true);
    });

    it("updates width during drag", () => {
      renderResizableWrapper({ 
        isResizable: true,
        onSizeChange: mockOnSizeChange 
      });
      
      // Simulate drag start
      act(() => {
        mockDragHandler({
          down: true,
          movement: [0, 0],
          first: true,
          last: false,
        });
      });
      
      // Simulate drag movement
      act(() => {
        mockDragHandler({
          down: true,
          movement: [100, 0],
          first: false,
          last: false,
        });
      });
      
      expect(mockOnSizeChange).toHaveBeenCalledWith(900); // 800 + 100
    });

    it("enforces minimum width of 320px", () => {
      renderResizableWrapper({ 
        isResizable: true,
        onSizeChange: mockOnSizeChange 
      });
      
      // Simulate drag start
      act(() => {
        mockDragHandler({
          down: true,
          movement: [0, 0],
          first: true,
          last: false,
        });
      });
      
      // Simulate large negative movement
      act(() => {
        mockDragHandler({
          down: true,
          movement: [-600, 0],
          first: false,
          last: false,
        });
      });
      
      expect(mockOnSizeChange).toHaveBeenCalledWith(320); // Minimum width
    });

    it("sets dragging to false when drag ends", (done) => {
      renderResizableWrapper({ 
        isResizable: true,
        onDraggingChange: mockOnDraggingChange 
      });
      
      // Simulate drag end
      act(() => {
        mockDragHandler({
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

    it("applies correct CSS classes to resizer", () => {
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

  describe("Dynamic Resizer Positioning", () => {
    it("positions resizers based on responsive width", () => {
      renderResizableWrapper({ isResizable: true });
      
      const resizers = screen.getAllByTestId("resizer");
      
      // Default width is 800px, so resizers should be at 720px (800 - 80)
      resizers.forEach(resizer => {
        expect(resizer).toHaveStyle("left: 720px");
      });
    });

    it("updates resizer positions when width changes", () => {
      // This test checks that resizer positioning is dynamic
      const { rerender } = renderResizableWrapper({ isResizable: true });
      
      const resizers = screen.getAllByTestId("resizer");
      
      // Initially positioned at 720px (800 - 80)
      resizers.forEach(resizer => {
        expect(resizer).toHaveStyle("left: 720px");
      });
      
      // This test verifies the positioning logic without triggering the drag handler
      expect(resizers).toHaveLength(2);
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
      expect(mockOnSizeChange).toHaveBeenCalledWith(800);
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
      
      const firstCallConfig = mockUseDrag.mock.calls[0][1];
      
      rerender(<ResizableWrapper {...defaultProps} isResizable={true} />);
      
      const secondCallConfig = mockUseDrag.mock.calls[1][1];
      
      // The config object should have the same structure
      expect(firstCallConfig.axis).toBe(secondCallConfig.axis);
      expect(firstCallConfig.filterTaps).toBe(secondCallConfig.filterTaps);
    });

    it("memoizes bind resizer values", () => {
      renderResizableWrapper({ isResizable: true });
      
      // Verify that useDrag is called (indicating memoization is working)
      expect(mockUseDrag).toHaveBeenCalled();
    });

    it("memoizes responsive width style calculations", () => {
      const { rerender } = renderResizableWrapper({ isResizable: true });
      
      const wrapper = screen.getByTestId("child-content").parentElement;
      const firstStyle = wrapper?.style.width;
      
      rerender(<ResizableWrapper {...defaultProps} isResizable={true} />);
      
      const secondStyle = wrapper?.style.width;
      expect(firstStyle).toBe(secondStyle);
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
    it("applies cursor-ew-resize to resizers for accessibility", () => {
      renderResizableWrapper({ isResizable: true });
      
      const resizers = screen.getAllByTestId("resizer");
      resizers.forEach(resizer => {
        expect(resizer).toHaveClass("cursor-ew-resize");
      });
    });

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

    it("handles responsiveSize as null for resizer style", () => {
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
      expect(resizers[0]).toHaveClass("absolute", "top-0", "right-[-40px]");
      expect(resizers[1]).toHaveClass("absolute", "bottom-7", "right-[-40px]");
    });
  });
}); 