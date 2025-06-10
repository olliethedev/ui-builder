/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClickableWrapper } from "@/components/ui/ui-builder/internal/clickable-wrapper";
import { ComponentLayer } from '@/components/ui/ui-builder/types';
import { getScrollParent } from "@/lib/ui-builder/utils/get-scroll-parent";

// Mock the entire get-scroll-parent module
jest.mock("@/lib/ui-builder/utils/get-scroll-parent", () => ({
  getScrollParent: jest.fn(),
}));

// Mock the LayerMenu component
jest.mock("@/components/ui/ui-builder/internal/layer-menu", () => ({
  LayerMenu: ({ layerId, handleDuplicateComponent, handleDeleteComponent }: any) => (
    <div data-testid="layer-menu">
      <span>Layer Menu for {layerId}</span>
      <button onClick={handleDuplicateComponent}>Duplicate</button>
      <button onClick={handleDeleteComponent}>Delete</button>
    </div>
  ),
}));

describe("ClickableWrapper", () => {
  const mockLayer: ComponentLayer = {
    id: "layer-1",
    type: "BUTTON",
    name: "Test Button",
    props: {},
    children: [],
  };

  const defaultProps = {
    layer: mockLayer,
    isSelected: false,
    zIndex: 1,
    totalLayers: 5,
    onSelectElement: jest.fn(),
    children: <span>Child Element</span>,
    onDuplicateLayer: jest.fn(),
    onDeleteLayer: jest.fn(),
    listenToScrollParent: true,
    observeMutations: false,
  };

  let mockResizeObserver: any;
  let mockMutationObserver: any;
  const mockGetScrollParent = getScrollParent as jest.MockedFunction<typeof getScrollParent>;

  beforeAll(() => {
    // Mock ResizeObserver
    mockResizeObserver = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };
    (global as unknown as any).ResizeObserver = jest.fn(() => mockResizeObserver);

    // Mock MutationObserver
    mockMutationObserver = {
      observe: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn().mockReturnValue([]),
    };
    (global as unknown as any).MutationObserver = jest.fn(() => mockMutationObserver);

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

    // Mock getElementById for panel container
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'editor-panel-container') {
        return document.createElement('div');
      }
      return null;
    });

    // Mock window resize event
    Object.defineProperty(window, 'scrollX', { value: 10, writable: true });
    Object.defineProperty(window, 'scrollY', { value: 20, writable: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders children correctly", () => {
      render(<ClickableWrapper {...defaultProps} />);
      expect(screen.getByText("Child Element")).toBeInTheDocument();
    });

    it("renders LayerMenu when isSelected is true", () => {
      render(<ClickableWrapper {...defaultProps} isSelected={true} />);
      expect(screen.getByTestId("layer-menu")).toBeInTheDocument();
      expect(screen.getByText("Layer Menu for layer-1")).toBeInTheDocument();
    });

    it("does not render LayerMenu when isSelected is false", () => {
      render(<ClickableWrapper {...defaultProps} isSelected={false} />);
      expect(screen.queryByTestId("layer-menu")).not.toBeInTheDocument();
    });

    it("renders clickable overlay with correct data-testid", () => {
      render(<ClickableWrapper {...defaultProps} />);
      expect(screen.getByTestId("clickable-overlay")).toBeInTheDocument();
    });
  });

  describe("Event Handling", () => {
    it("calls onSelectElement when clicked", async () => {
      const mockOnSelectElement = jest.fn();
      render(<ClickableWrapper {...defaultProps} onSelectElement={mockOnSelectElement} />);
      
      // Wait for component to mount and set up bounding rect
      await waitFor(() => {
        const clickableElement = document.querySelector('.fixed.box-border');
        expect(clickableElement).toBeInTheDocument();
      });

      const clickableElement = document.querySelector('.fixed.box-border') as HTMLElement;
      fireEvent.click(clickableElement);

      expect(mockOnSelectElement).toHaveBeenCalledWith("layer-1");
    });

    it("stops propagation on click", async () => {
      const mockOnSelectElement = jest.fn();
      const parentClickHandler = jest.fn();
      
      render(
        <div onClick={parentClickHandler}>
          <ClickableWrapper {...defaultProps} onSelectElement={mockOnSelectElement} />
        </div>
      );
      
      await waitFor(() => {
        const clickableElement = document.querySelector('.fixed.box-border');
        expect(clickableElement).toBeInTheDocument();
      });

      const clickableElement = document.querySelector('.fixed.box-border') as HTMLElement;
      fireEvent.click(clickableElement);

      expect(mockOnSelectElement).toHaveBeenCalledWith("layer-1");
      expect(parentClickHandler).not.toHaveBeenCalled();
    });

    it("handles wheel events", async () => {
      const mockScrollableParent = document.createElement('div');
      mockScrollableParent.style.overflow = 'scroll';
      Object.defineProperty(mockScrollableParent, 'scrollLeft', { value: 0, writable: true });
      Object.defineProperty(mockScrollableParent, 'scrollTop', { value: 0, writable: true });
      
      mockGetScrollParent.mockReturnValue(mockScrollableParent);

      render(<ClickableWrapper {...defaultProps} />);
      
      await waitFor(() => {
        const clickableElement = document.querySelector('.fixed.box-border');
        expect(clickableElement).toBeInTheDocument();
      });

      const clickableElement = document.querySelector('.fixed.box-border') as HTMLElement;
      fireEvent.wheel(clickableElement, { deltaX: 10, deltaY: 20 });

      expect(mockScrollableParent.scrollLeft).toBe(10);
      expect(mockScrollableParent.scrollTop).toBe(20);
    });

    it("handles touch events", async () => {
      const mockScrollableParent = document.createElement('div');
      mockScrollableParent.style.overflow = 'scroll';
      Object.defineProperty(mockScrollableParent, 'scrollLeft', { value: 0, writable: true });
      Object.defineProperty(mockScrollableParent, 'scrollTop', { value: 0, writable: true });
      
      mockGetScrollParent.mockReturnValue(mockScrollableParent);

      render(<ClickableWrapper {...defaultProps} />);
      
      await waitFor(() => {
        const clickableElement = document.querySelector('.fixed.box-border');
        expect(clickableElement).toBeInTheDocument();
      });

      const clickableElement = document.querySelector('.fixed.box-border') as HTMLElement;
      
      // Touch start
      fireEvent.touchStart(clickableElement, {
        touches: [{ clientX: 100, clientY: 200 }]
      });

      // Touch move
      fireEvent.touchMove(clickableElement, {
        touches: [{ clientX: 90, clientY: 180 }]
      });

      // Touch end
      fireEvent.touchEnd(clickableElement);

      // Verify scroll was updated
      expect(mockScrollableParent.scrollLeft).toBe(10); // 100 - 90
      expect(mockScrollableParent.scrollTop).toBe(20);  // 200 - 180
    });
  });

  describe("Observer Functionality", () => {
    it("sets up ResizeObserver when component mounts", () => {
      render(<ClickableWrapper {...defaultProps} />);
      expect(global.ResizeObserver).toHaveBeenCalled();
      expect(mockResizeObserver.observe).toHaveBeenCalled();
    });

    it("sets up MutationObserver when observeMutations is true", () => {
      render(<ClickableWrapper {...defaultProps} observeMutations={true} />);
      expect(global.MutationObserver).toHaveBeenCalled();
      expect(mockMutationObserver.observe).toHaveBeenCalledWith(document.body, {
        attributeFilter: ["style", "class"],
        attributes: true,
        subtree: true,
      });
    });

    it("does not set up MutationObserver when observeMutations is false", () => {
      render(<ClickableWrapper {...defaultProps} observeMutations={false} />);
      // MutationObserver should not be created for mutation watching
      // (ResizeObserver for panel container is still created)
    });

    it("cleans up observers on unmount", () => {
      const { unmount } = render(<ClickableWrapper {...defaultProps} observeMutations={true} />);
      unmount();
      expect(mockResizeObserver.disconnect).toHaveBeenCalled();
      expect(mockMutationObserver.disconnect).toHaveBeenCalled();
    });
  });

  describe("Bounding Rect Handling", () => {
    it("handles small elements correctly", () => {
      // Mock a very small bounding rect
      Element.prototype.getBoundingClientRect = jest.fn(() => ({
        top: 100,
        left: 100,
        bottom: 101,
        right: 101,
        width: 1,
        height: 1,
        x: 100,
        y: 100,
        toJSON: jest.fn(),
      }));

      render(<ClickableWrapper {...defaultProps} />);
      
      // Should apply MIN_SIZE styling for small elements
      const clickableElement = document.querySelector('.fixed.box-border') as HTMLElement;
      expect(clickableElement).toHaveStyle({
        width: '2px', // MIN_SIZE
        height: '2px', // MIN_SIZE
        top: '98px', // top - MIN_SIZE
        left: '98px', // left - MIN_SIZE
      });
    });

    it("handles normal-sized elements correctly", () => {
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

      render(<ClickableWrapper {...defaultProps} />);
      
      const clickableElement = document.querySelector('.fixed.box-border') as HTMLElement;
      expect(clickableElement).toHaveStyle({
        width: '100px',
        height: '100px',
        top: '100px',
        left: '100px',
      });
    });

    it("handles elements with no bounding rect", () => {
      Element.prototype.getBoundingClientRect = jest.fn(() => ({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      }));

      render(<ClickableWrapper {...defaultProps} />);
      
      const clickableElement = document.querySelector('.fixed.box-border') as HTMLElement;
      expect(clickableElement).toHaveStyle({
        width: '2px', // MIN_SIZE
        height: '2px', // MIN_SIZE
      });
    });
  });

  describe("Layer Label Display", () => {
    it("displays layer type when name matches type", () => {
      const layerWithMatchingName = {
        ...mockLayer,
        name: "button component",
        type: "Button",
      };

      render(<ClickableWrapper {...defaultProps} layer={layerWithMatchingName} isSelected={true} />);
      
      const label = document.querySelector('.absolute.top-\\[-16px\\]');
      expect(label).toHaveTextContent("Button");
    });

    it("displays name and type when name doesn't match type", () => {
      const layerWithDifferentName = {
        ...mockLayer,
        name: "My Custom Button",
        type: "Button",
      };

      render(<ClickableWrapper {...defaultProps} layer={layerWithDifferentName} isSelected={true} />);
      
      const label = document.querySelector('.absolute.top-\\[-16px\\]');
      expect(label).toHaveTextContent("My Custom Button (Button)");
    });

    it("handles layer type with underscores", () => {
      const layerWithUnderscores = {
        ...mockLayer,
        name: "Page Component",
        type: "_page_",
      };

      render(<ClickableWrapper {...defaultProps} layer={layerWithUnderscores} isSelected={true} />);
      
      const label = document.querySelector('.absolute.top-\\[-16px\\]');
      expect(label).toHaveTextContent("Page Component (page)");
    });

    it("handles layer with no name", () => {
      const layerWithNoName = {
        ...mockLayer,
        name: undefined,
        type: "Button",
      };

      render(<ClickableWrapper {...defaultProps} layer={layerWithNoName} isSelected={true} />);
      
      const label = document.querySelector('.absolute.top-\\[-16px\\]');
      expect(label).toHaveTextContent("Button");
    });
  });

  describe("Scroll Parent Handling", () => {
    it("adds scroll listener when listenToScrollParent is true", () => {
      const mockScrollableParent = document.createElement('div');
      const addEventListenerSpy = jest.spyOn(mockScrollableParent, 'addEventListener');
      
      mockGetScrollParent.mockReturnValue(mockScrollableParent);

      render(<ClickableWrapper {...defaultProps} listenToScrollParent={true} />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it("does not add scroll listener when listenToScrollParent is false", () => {
      render(<ClickableWrapper {...defaultProps} listenToScrollParent={false} />);
      // Should not call getScrollParent or add listeners
    });

    it("removes scroll listener on unmount", () => {
      const mockScrollableParent = document.createElement('div');
      const removeEventListenerSpy = jest.spyOn(mockScrollableParent, 'removeEventListener');
      
      mockGetScrollParent.mockReturnValue(mockScrollableParent);

      const { unmount } = render(<ClickableWrapper {...defaultProps} listenToScrollParent={true} />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });

  describe("LayerMenu Integration", () => {
    it("passes correct props to LayerMenu", () => {
      render(<ClickableWrapper {...defaultProps} isSelected={true} />);
      
      const layerMenu = screen.getByTestId("layer-menu");
      expect(layerMenu).toBeInTheDocument();
      expect(screen.getByText("Layer Menu for layer-1")).toBeInTheDocument();
    });

    it("calls onDuplicateLayer when LayerMenu duplicate is clicked", () => {
      const mockOnDuplicate = jest.fn();
      render(<ClickableWrapper {...defaultProps} isSelected={true} onDuplicateLayer={mockOnDuplicate} />);
      
      const duplicateButton = screen.getByText("Duplicate");
      fireEvent.click(duplicateButton);
      
      expect(mockOnDuplicate).toHaveBeenCalled();
    });

    it("calls onDeleteLayer when LayerMenu delete is clicked", () => {
      const mockOnDelete = jest.fn();
      render(<ClickableWrapper {...defaultProps} isSelected={true} onDeleteLayer={mockOnDelete} />);
      
      const deleteButton = screen.getByText("Delete");
      fireEvent.click(deleteButton);
      
      expect(mockOnDelete).toHaveBeenCalled();
    });
  });

  describe("Memoization", () => {
    it("memoizes component correctly with same props", () => {
      const props = { ...defaultProps };
      const { rerender } = render(<ClickableWrapper {...props} />);
      
      // Rerender with same props
      rerender(<ClickableWrapper {...props} />);
      
      expect(screen.getByText("Child Element")).toBeInTheDocument();
    });

    it("re-renders when props change", () => {
      const props1 = { ...defaultProps };
      const props2 = { ...defaultProps, isSelected: true };
      
      const { rerender } = render(<ClickableWrapper {...props1} />);
      expect(screen.queryByTestId("layer-menu")).not.toBeInTheDocument();
      
      rerender(<ClickableWrapper {...props2} />);
      expect(screen.getByTestId("layer-menu")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing first element child", () => {
      // Mock empty wrapper
      const originalFirstElementChild = Object.getOwnPropertyDescriptor(Element.prototype, 'firstElementChild');
      Object.defineProperty(Element.prototype, 'firstElementChild', {
        get() { return null; },
        configurable: true,
      });

      render(<ClickableWrapper {...defaultProps} />);
      
      // Should not crash and should not render clickable overlay
      expect(screen.queryByText(/fixed box-border/)).not.toBeInTheDocument();

      // Restore original property
      if (originalFirstElementChild) {
        Object.defineProperty(Element.prototype, 'firstElementChild', originalFirstElementChild);
      }
    });

    it("handles missing panel container", () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      
      render(<ClickableWrapper {...defaultProps} />);
      
      // Should still render without panel container
      expect(screen.getByText("Child Element")).toBeInTheDocument();
    });
  });
});
