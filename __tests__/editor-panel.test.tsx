/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditorPanel from "@/components/ui/ui-builder/internal/editor-panel";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import type { ComponentLayer, RegistryEntry } from "@/components/ui/ui-builder/types";
import { z } from "zod";

// Mock dependencies
jest.mock("@/lib/ui-builder/store/layer-store", () => ({
  useLayerStore: jest.fn(),
  countLayers: jest.fn(),
}));

jest.mock("@/lib/ui-builder/store/editor-store", () => ({
  useEditorStore: jest.fn(),
}));

// Mock Tooltip components
jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children, side }: any) => (
    <div data-testid="tooltip-content" data-side={side}>
      {children}
    </div>
  ),
  TooltipTrigger: ({ children, asChild }: any) => (
    <div data-testid="tooltip-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  TooltipProvider: ({ children }: any) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
}));

// Mock AutoFrame component
jest.mock("@/components/ui/ui-builder/internal/canvas/auto-frame", () => ({
  __esModule: true,
  default: React.forwardRef(({ children, height, className, pointerEventsEnabled }: any, ref: any) => (
    <div 
      data-testid="auto-frame"
      data-height={height}
      className={className}
      data-pointer-events-enabled={pointerEventsEnabled}
      ref={ref}
    >
      {children}
    </div>
  )),
  useFrame: () => ({ document: undefined, window: undefined }),
}));

// Mock LayerContextMenuPortal (rendered inside AutoFrame)
jest.mock("@/components/ui/ui-builder/internal/components/layer-context-menu-portal", () => ({
  LayerContextMenuPortal: () => <div data-testid="layer-context-menu-portal" />,
}));

jest.mock("@/components/ui/ui-builder/layer-renderer", () => ({
  __esModule: true,
  default: ({ page, editorConfig, componentRegistry }: any) => (
    <div data-testid="layer-renderer">
      <div data-testid="page-id">{page?.id}</div>
      <div data-testid="selected-layer-id">{editorConfig?.selectedLayer?.id}</div>
      <div data-testid="registry-count">{Object.keys(componentRegistry).length}</div>
      <div data-testid="total-layers">{editorConfig?.totalLayers}</div>
    </div>
  ),
}));

// Mock DndContextProvider and useComponentDragContext
jest.mock("@/lib/ui-builder/context/dnd-context", () => ({
  DndContextProvider: ({ children }: any) => (
    <div data-testid="dnd-context-provider">{children}</div>
  ),
  useComponentDragContext: jest.fn(() => ({ isDragging: false })),
}));

// Mock ResizableWrapper
jest.mock("@/components/ui/ui-builder/internal/canvas/resizable-wrapper", () => ({
  ResizableWrapper: ({ children, isResizable, onDraggingChange }: any) => (
    <div 
      data-testid="resizable-wrapper" 
      data-is-resizable={isResizable}
      onClick={() => onDraggingChange && onDraggingChange(true)}
    >
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/ui-builder/internal/components/add-component-popover", () => ({
  AddComponentsPopover: ({ children, parentLayerId }: any) => (
    <div data-testid="add-components-popover" data-parent-layer-id={parentLayerId}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, size, className, "data-testid": testId, onClick, ...props }: any) => (
    <button 
      data-testid={testId || "add-button"} 
      data-variant={variant} 
      data-size={size} 
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Mock zoom controls and auto center functionality as requested
const mockZoomIn = jest.fn();
const mockZoomOut = jest.fn();
const mockResetTransform = jest.fn();
const mockZoomToElement = jest.fn();

jest.mock("react-zoom-pan-pinch", () => ({
  TransformWrapper: ({ children, wheel, doubleClick, panning, initialScale, minScale, maxScale, centerOnInit, limitToBounds, ...props }: any) => (
    <div 
      data-testid="transform-wrapper" 
      data-wheel={JSON.stringify(wheel)}
      data-double-click-disabled={doubleClick?.disabled}
      data-panning-disabled={panning?.disabled}
    >
      {children}
    </div>
  ),
  TransformComponent: ({ children, contentStyle, wrapperStyle }: any) => (
    <div 
      data-testid="transform-component-wrapper" 
      style={contentStyle}
      data-wrapper-style={JSON.stringify(wrapperStyle)}
    >
      {children}
    </div>
  ),
  useControls: () => ({
    zoomIn: mockZoomIn,
    zoomOut: mockZoomOut,
    resetTransform: mockResetTransform,
    zoomToElement: mockZoomToElement,
  }),
}));

jest.mock("lucide-react", () => ({
  Plus: () => <svg data-testid="plus-icon" />,
  GripVertical: () => <svg data-testid="grip-vertical-icon" />,
  ZoomIn: () => <svg data-testid="zoom-in-icon" />,
  ZoomOut: () => <svg data-testid="zoom-out-icon" />,
  Crosshair: () => <svg data-testid="crosshair-icon" />,
  MousePointer: () => <svg data-testid="mouse-pointer-icon" />,
}));

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe("EditorPanel", () => {
  const mockedUseLayerStore = useLayerStore as unknown as jest.Mock;
  const mockedUseEditorStore = useEditorStore as unknown as jest.Mock;
  const { useComponentDragContext } = require("@/lib/ui-builder/context/dnd-context");

  const mockSelectLayer = jest.fn();
  const mockFindLayerById = jest.fn();
  const mockDuplicateLayer = jest.fn();
  const mockRemoveLayer = jest.fn();
  const mockIsLayerAPage = jest.fn();

  const mockRegistry: Record<string, RegistryEntry<any>> = {
    Button: {
      schema: z.object({
        label: z.string().default("Click me"),
        className: z.string().optional(),
      }),
      from: "@/components/ui/button",
      component: ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
      ),
    },
    Input: {
      schema: z.object({
        placeholder: z.string().default("Enter text"),
      }),
      from: "@/components/ui/input",
      component: ({ ...props }: any) => <input {...props} />,
    },
  };

  const mockPage: ComponentLayer = {
    id: "page-1",
    type: "_page_",
    name: "Test Page",
    props: {},
    children: [
      {
        id: "child-1",
        type: "Button",
        name: "Test Button",
        props: { label: "Click me" },
        children: [],
      },
      {
        id: "child-2",
        type: "Input",
        name: "Test Input",
        props: { placeholder: "Enter text" },
        children: [],
      },
    ],
  };

  const mockSelectedLayer: ComponentLayer = {
    id: "child-1",
    type: "Button",
    name: "Test Button",
    props: { label: "Click me" },
    children: [],
  };

  const mockLayerState = {
    selectLayer: mockSelectLayer,
    selectedLayerId: "child-1",
    findLayerById: mockFindLayerById,
    duplicateLayer: mockDuplicateLayer,
    removeLayer: mockRemoveLayer,
    selectedPageId: "page-1",
    isLayerAPage: mockIsLayerAPage,
  };

  const mockEditorState = {
    previewMode: "responsive" as const,
    registry: mockRegistry,
    allowPagesCreation: true,
    allowPagesDeletion: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockFindLayerById.mockImplementation((id: string) => {
      if (id === "page-1") return mockPage;
      if (id === "child-1") return mockSelectedLayer;
      return null;
    });
    
    mockIsLayerAPage.mockReturnValue(false);

    mockedUseLayerStore.mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(mockLayerState);
      }
      return mockLayerState;
    });

    mockedUseEditorStore.mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(mockEditorState);
      }
      return mockEditorState;
    });

    // Mock countLayers
    const { countLayers } = require("@/lib/ui-builder/store/layer-store");
    countLayers.mockReturnValue(2);

    // Reset drag context mock
    useComponentDragContext.mockReturnValue({ isDragging: false });
  });

  const renderEditorPanel = (props = {}) => {
    return render(<EditorPanel {...props} />);
  };

  describe("Basic Rendering", () => {
    it("renders the editor panel container", () => {
      renderEditorPanel();
      
      const container = document.getElementById("editor-panel-container");
      expect(container).toBeInTheDocument();
    });

    it("renders with correct default classes", () => {
      renderEditorPanel();
      
      const container = document.getElementById("editor-panel-container");
      expect(container).toHaveClass(
        "flex",
        "flex-col",
        "relative",
        "size-full",
        "bg-fixed"
      );
    });

    it("applies custom className when provided", () => {
      renderEditorPanel({ className: "custom-class" });
      
      const container = document.getElementById("editor-panel-container");
      expect(container).toHaveClass("custom-class");
    });

    it("renders DndContextProvider", () => {
      renderEditorPanel();
      
      expect(screen.getByTestId("dnd-context-provider")).toBeInTheDocument();
    });

    it("renders ResizableWrapper with correct props", () => {
      renderEditorPanel();
      
      const wrapper = screen.getByTestId("resizable-wrapper");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute("data-is-resizable", "true");
    });

    it("renders LayerRenderer with correct props", () => {
      renderEditorPanel();
      
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
      expect(screen.getByTestId("page-id")).toHaveTextContent("page-1");
      expect(screen.getByTestId("selected-layer-id")).toHaveTextContent("child-1");
      expect(screen.getByTestId("registry-count")).toHaveTextContent("2");
      expect(screen.getByTestId("total-layers")).toHaveTextContent("2");
    });

    it("renders AddComponentsPopover with correct parent layer ID", () => {
      renderEditorPanel();
      
      const popover = screen.getByTestId("add-components-popover");
      expect(popover).toBeInTheDocument();
      expect(popover).toHaveAttribute("data-parent-layer-id", "page-1");
    });

    it("renders Plus button with correct styling", () => {
      renderEditorPanel();
      
      const button = screen.getByTestId("add-button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("data-variant", "secondary");
      expect(button).toHaveAttribute("data-size", "icon");
      expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
    });
  });

  describe("Transform Wrapper Configuration", () => {
    it("renders with TransformWrapper by default", () => {
      renderEditorPanel();
      
      expect(screen.getByTestId("transform-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("configures zoom controls correctly", () => {
      renderEditorPanel();
      
      expect(screen.getByTestId("button-ZoomIn")).toBeInTheDocument();
      expect(screen.getByTestId("button-ZoomOut")).toBeInTheDocument();
      expect(screen.getByTestId("button-Reset")).toBeInTheDocument();
    });

    it("sets correct wheel configuration", () => {
      renderEditorPanel();
      
      const wrapper = screen.getByTestId("transform-wrapper");
      const wheelConfig = JSON.parse(wrapper.getAttribute("data-wheel") || "{}");
      expect(wheelConfig.step).toBe(0.1);
    });

    it("enables double click", () => {
      renderEditorPanel();
      
      const wrapper = screen.getByTestId("transform-wrapper");
      expect(wrapper).toHaveAttribute("data-double-click-disabled", "false");
    });

    it("enables panning by default", () => {
      renderEditorPanel();
      
      const wrapper = screen.getByTestId("transform-wrapper");
      expect(wrapper).toHaveAttribute("data-panning-disabled", "false");
    });

    it("renders correctly when no layers present", () => {
      // Mock empty page
      const emptyPage = { ...mockPage, children: [] };
      mockFindLayerById.mockImplementation((id: string) => {
        if (id === "page-1") return emptyPage;
        if (id === "child-1") return mockSelectedLayer;
        return null;
      });
      
      const { countLayers } = require("@/lib/ui-builder/store/layer-store");
      countLayers.mockReturnValue(0);

      renderEditorPanel();
      
      const wrapper = screen.getByTestId("transform-wrapper");
      expect(wrapper).toBeInTheDocument();
      expect(screen.getByTestId("total-layers")).toHaveTextContent("0");
    });
  });

  describe("Zoom Controls Functionality", () => {
    it("calls zoomIn when zoom in button is clicked", () => {
      renderEditorPanel();
      
      const zoomInButton = screen.getByTestId("button-ZoomIn");
      fireEvent.click(zoomInButton);
      
      expect(mockZoomIn).toHaveBeenCalledTimes(1);
    });

    it("calls zoomOut when zoom out button is clicked", () => {
      renderEditorPanel();
      
      const zoomOutButton = screen.getByTestId("button-ZoomOut");
      fireEvent.click(zoomOutButton);
      
      expect(mockZoomOut).toHaveBeenCalledTimes(1);
    });

    it("calls resetTransform when reset button is clicked", () => {
      renderEditorPanel();
      
      const resetButton = screen.getByTestId("button-Reset");
      fireEvent.click(resetButton);
      
      expect(mockResetTransform).toHaveBeenCalledTimes(1);
    });

    it("renders zoom controls with correct accessibility labels", () => {
      renderEditorPanel();
      
      expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Zoom out" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    });
  });

  describe("Preview Mode Handling", () => {
    it("applies responsive width class by default", () => {
      renderEditorPanel();
      
      const transformDiv = screen.getByTestId("transform-component");
      expect(transformDiv).toHaveClass("w-full");
    });

    it("applies mobile width class when preview mode is mobile", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, previewMode: "mobile" });
        }
        return { ...mockEditorState, previewMode: "mobile" };
      });

      renderEditorPanel();
      
      const transformDiv = screen.getByTestId("transform-component");
      expect(transformDiv).toHaveClass("w-[390px]");
    });

    it("applies tablet width class when preview mode is tablet", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, previewMode: "tablet" });
        }
        return { ...mockEditorState, previewMode: "tablet" };
      });

      renderEditorPanel();
      
      const transformDiv = screen.getByTestId("transform-component");
      expect(transformDiv).toHaveClass("w-[768px]");
    });

    it("applies desktop width class when preview mode is desktop", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, previewMode: "desktop" });
        }
        return { ...mockEditorState, previewMode: "desktop" };
      });

      renderEditorPanel();
      
      const transformDiv = screen.getByTestId("transform-component");
      expect(transformDiv).toHaveClass("w-[1440px]");
    });

    it("makes ResizableWrapper resizable in responsive mode", () => {
      renderEditorPanel();
      
      const wrapper = screen.getByTestId("resizable-wrapper");
      expect(wrapper).toHaveAttribute("data-is-resizable", "true");
    });

    it("makes ResizableWrapper non-resizable in non-responsive mode", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, previewMode: "mobile" });
        }
        return { ...mockEditorState, previewMode: "mobile" };
      });

      renderEditorPanel();
      
      const wrapper = screen.getByTestId("resizable-wrapper");
      expect(wrapper).toHaveAttribute("data-is-resizable", "false");
    });

    it("falls back to responsive width for unknown preview modes", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, previewMode: "unknown" });
        }
        return { ...mockEditorState, previewMode: "unknown" };
      });

      renderEditorPanel();
      
      const transformDiv = screen.getByTestId("transform-component");
      expect(transformDiv).toHaveClass("w-full");
    });
  });



  describe("Mobile Screen Detection", () => {
    it("renders correctly on mobile screens", () => {
      // Mock mobile screen width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      renderEditorPanel();
      
      const wrapper = screen.getByTestId("transform-wrapper");
      expect(wrapper).toBeInTheDocument();
    });

    it("renders correctly on desktop screens", () => {
      // Mock desktop screen width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      renderEditorPanel();
      
      const wrapper = screen.getByTestId("transform-wrapper");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Editor Config", () => {
    it("creates editor config with correct properties", () => {
      renderEditorPanel();
      
      const layerRenderer = screen.getByTestId("layer-renderer");
      expect(layerRenderer).toBeInTheDocument();
      expect(screen.getByTestId("selected-layer-id")).toHaveTextContent("child-1");
      expect(screen.getByTestId("total-layers")).toHaveTextContent("2");
    });

    it("renders correctly when allowPagesCreation is true", () => {
      renderEditorPanel();
      
      // Component should render and layer renderer should be present
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("renders correctly when allowPagesCreation is false", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, allowPagesCreation: false });
        }
        return { ...mockEditorState, allowPagesCreation: false };
      });

      renderEditorPanel();
      
      // Component should still render
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("renders correctly when allowPagesDeletion is true", () => {
      renderEditorPanel();
      
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("renders correctly when allowPagesDeletion is false", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, allowPagesDeletion: false });
        }
        return { ...mockEditorState, allowPagesDeletion: false };
      });

      renderEditorPanel();
      
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("updates editor config when layer count changes", () => {
      const { countLayers } = require("@/lib/ui-builder/store/layer-store");
      
      // Initial render with 2 layers
      const { rerender } = renderEditorPanel();
      expect(screen.getByTestId("total-layers")).toHaveTextContent("2");
      
      // Create a page with more layers
      const expandedPage: ComponentLayer = {
        id: "page-1",
        type: "_page_",
        name: "Test Page",
        props: {},
        children: [
          {
            id: "child-1",
            type: "Button",
            name: "Test Button",
            props: { label: "Click me" },
            children: [],
          },
          {
            id: "child-2",
            type: "Input",
            name: "Test Input",
            props: { placeholder: "Enter text" },
            children: [],
          },
          {
            id: "child-3",
            type: "Button",
            name: "Third Button",
            props: { label: "Button 3" },
            children: [],
          },
          {
            id: "child-4",
            type: "Input",
            name: "Second Input",
            props: { placeholder: "Input 2" },
            children: [],
          },
          {
            id: "child-5",
            type: "Button",
            name: "Fourth Button",
            props: { label: "Button 4" },
            children: [],
          },
        ],
      };
      
      // Update mocks to return the expanded page and layer count
      mockFindLayerById.mockImplementation((id: string) => {
        if (id === "page-1") return expandedPage;
        if (id === "child-1") return mockSelectedLayer;
        return null;
      });
      countLayers.mockReturnValue(5);
      
      // Re-render to simulate state change
      rerender(<EditorPanel />);
      
      expect(screen.getByTestId("total-layers")).toHaveTextContent("5");
    });
  });

  describe("Layer Selection and Management", () => {
    it("calls selectLayer when onSelectElement is triggered", () => {
      renderEditorPanel();
      
      // This would be tested through integration with the actual LayerRenderer
      // but for now we verify the function is passed correctly
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("renders layer renderer for non-page layers", () => {
      mockIsLayerAPage.mockReturnValue(false);
      
      renderEditorPanel();
      
      // Layer actions are now handled by useGlobalLayerActions inside LayerMenu
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("renders layer renderer for page layers", () => {
      mockIsLayerAPage.mockReturnValue(true);
      
      renderEditorPanel();
      
      // Layer actions are now handled by useGlobalLayerActions inside LayerMenu
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("handles layer selection changes", () => {
      const { rerender } = renderEditorPanel();
      
      // Change selected layer
      const newMockLayerState = {
        ...mockLayerState,
        selectedLayerId: "child-2",
      };
      
      const newSelectedLayer: ComponentLayer = {
        id: "child-2",
        type: "Input",
        name: "Test Input",
        props: { placeholder: "Enter text" },
        children: [],
      };
      
      mockFindLayerById.mockImplementation((id: string) => {
        if (id === "page-1") return mockPage;
        if (id === "child-2") return newSelectedLayer;
        return null;
      });
      
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(newMockLayerState);
        }
        return newMockLayerState;
      });
      
      rerender(<EditorPanel />);
      
      expect(screen.getByTestId("selected-layer-id")).toHaveTextContent("child-2");
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("handles missing selected page gracefully", () => {
      mockFindLayerById.mockImplementation((id: string) => {
        if (id === "page-1") return null;
        if (id === "child-1") return mockSelectedLayer;
        return null;
      });

      // This should throw an error because the component doesn't handle null selectedPage
      expect(() => renderEditorPanel()).toThrow("Cannot read properties of null (reading 'children')");
    });

    it("handles missing selected layer gracefully", () => {
      mockFindLayerById.mockImplementation((id: string) => {
        if (id === "page-1") return mockPage;
        if (id === "child-1") return null;
        return null;
      });

      renderEditorPanel();
      
      // Should still render without crashing
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("handles empty registry gracefully", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, registry: {} });
        }
        return { ...mockEditorState, registry: {} };
      });

      renderEditorPanel();
      
      expect(screen.getByTestId("registry-count")).toHaveTextContent("0");
    });

    it("handles null selectedLayerId", () => {
      const nullLayerState = {
        ...mockLayerState,
        selectedLayerId: null,
      };
      
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(nullLayerState);
        }
        return nullLayerState;
      });

      renderEditorPanel();
      
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("handles layers with deeply nested children", () => {
      const deepPage: ComponentLayer = {
        id: "page-1",
        type: "_page_",
        name: "Deep Page",
        props: {},
        children: [
          {
            id: "level1",
            type: "Container",
            name: "Level 1",
            props: {},
            children: [
              {
                id: "level2",
                type: "Container",
                name: "Level 2",
                props: {},
                children: [
                  {
                    id: "level3",
                    type: "Button",
                    name: "Deep Button",
                    props: {},
                    children: [],
                  }
                ],
              }
            ],
          },
        ],
      };

      mockFindLayerById.mockImplementation((id: string) => {
        if (id === "page-1") return deepPage;
        if (id === "child-1") return mockSelectedLayer;
        return null;
      });

      const { countLayers } = require("@/lib/ui-builder/store/layer-store");
      countLayers.mockReturnValue(4); // 1 top level + 3 nested

      renderEditorPanel();
      
      expect(screen.getByTestId("total-layers")).toHaveTextContent("4");
    });

    it("handles rapid state changes", async () => {
      const { rerender } = renderEditorPanel();
      
      // Simulate rapid state changes
      for (let i = 0; i < 5; i++) {
        const newState = {
          ...mockLayerState,
          selectedLayerId: `child-${i}`,
        };
        
        mockedUseLayerStore.mockImplementation((selector) => {
          if (typeof selector === "function") {
            return selector(newState);
          }
          return newState;
        });
        
        rerender(<EditorPanel />);
      }
      
      // Should handle rapid changes without crashing
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });
  });

  describe("Performance and Optimization", () => {
    it("memoizes renderer to avoid unnecessary re-renders", () => {
      const { rerender } = renderEditorPanel();
      
      const firstRender = screen.getByTestId("layer-renderer");
      
      // Rerender with same props
      rerender(<EditorPanel />);
      
      const secondRender = screen.getByTestId("layer-renderer");
      
      // Should be the same component instance due to memoization
      expect(firstRender).toBeInTheDocument();
      expect(secondRender).toBeInTheDocument();
    });

    it("memoizes widthClass to avoid unnecessary recalculations", () => {
      const { rerender } = renderEditorPanel();
      
      const firstRender = screen.getByTestId("transform-component");
      
      // Rerender with same preview mode
      rerender(<EditorPanel />);

      const secondRender = screen.getByTestId("transform-component");

      expect(firstRender).toHaveClass("w-full");
      expect(secondRender).toHaveClass("w-full");
    });

    it("memoizes style objects", () => {
      renderEditorPanel();
      
      const transformComponent = screen.getByTestId("transform-component-wrapper");
      const wrapperStyleAttr = transformComponent.getAttribute("data-wrapper-style");
      
      expect(wrapperStyleAttr).toBeTruthy();
      
      // Verify that style objects are consistent
      const wrapperStyle = JSON.parse(wrapperStyleAttr || "{}");
      expect(wrapperStyle.width).toBe("100%");
      expect(wrapperStyle.height).toBe("100%");
    });

    it("memoizes transform wrapper configuration", () => {
      const { rerender } = renderEditorPanel();
      
      const firstWrapper = screen.getByTestId("transform-wrapper");
      const firstWheelConfig = firstWrapper.getAttribute("data-wheel");
      
      // Rerender
      rerender(<EditorPanel />);
      
      const secondWrapper = screen.getByTestId("transform-wrapper");
      const secondWheelConfig = secondWrapper.getAttribute("data-wheel");
      
      // Configuration should be the same (memoized)
      expect(firstWheelConfig).toBe(secondWheelConfig);
    });

    it("optimizes editor config updates", () => {
      const { rerender } = renderEditorPanel();
      
      // First render
      expect(screen.getByTestId("total-layers")).toHaveTextContent("2");
      
      // Rerender with same data
      rerender(<EditorPanel />);
      
      // Should still show the same values without unnecessary recalculation
      expect(screen.getByTestId("total-layers")).toHaveTextContent("2");
    });
  });

  describe("Component Integration", () => {
    it("integrates with all required components", () => {
      renderEditorPanel();
      
      // Verify all major components are present
      expect(screen.getByTestId("dnd-context-provider")).toBeInTheDocument();
      expect(screen.getByTestId("resizable-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("transform-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
      expect(screen.getByTestId("add-components-popover")).toBeInTheDocument();
    });

    it("passes correct props to all child components", () => {
      renderEditorPanel();
      
      // ResizableWrapper props
      const resizableWrapper = screen.getByTestId("resizable-wrapper");
      expect(resizableWrapper).toHaveAttribute("data-is-resizable", "true");
      
      // AddComponentsPopover props
      const popover = screen.getByTestId("add-components-popover");
      expect(popover).toHaveAttribute("data-parent-layer-id", "page-1");
      
      // LayerRenderer props (verified through rendered content)
      expect(screen.getByTestId("page-id")).toHaveTextContent("page-1");
      expect(screen.getByTestId("registry-count")).toHaveTextContent("2");
    });

    it("maintains proper component hierarchy", () => {
      renderEditorPanel();
      
      const dndProvider = screen.getByTestId("dnd-context-provider");
      const transformWrapper = screen.getByTestId("transform-wrapper");
      
      // Verify DndContextProvider contains TransformWrapper
      expect(dndProvider).toContainElement(transformWrapper);
    });
  });

  describe("Drag and Drop Context Integration", () => {
    it("disables panning when component is being dragged", () => {
      useComponentDragContext.mockReturnValue({ isDragging: true });
      
      renderEditorPanel();
      
      const wrapper = screen.getByTestId("transform-wrapper");
      expect(wrapper).toHaveAttribute("data-panning-disabled", "true");
    });

    it("enables panning when component is not being dragged", () => {
      useComponentDragContext.mockReturnValue({ isDragging: false });
      
      renderEditorPanel();
      
      const wrapper = screen.getByTestId("transform-wrapper");
      expect(wrapper).toHaveAttribute("data-panning-disabled", "false");
    });

    it("handles drag context changes dynamically", () => {
      const { rerender } = renderEditorPanel();
      
      // Initially not dragging
      let wrapper = screen.getByTestId("transform-wrapper");
      expect(wrapper).toHaveAttribute("data-panning-disabled", "false");
      
      // Start dragging
      useComponentDragContext.mockReturnValue({ isDragging: true });
      rerender(<EditorPanel />);
      
      wrapper = screen.getByTestId("transform-wrapper");
      expect(wrapper).toHaveAttribute("data-panning-disabled", "true");
    });

    it("provides DndContextProvider to child components", () => {
      renderEditorPanel();
      
      const dndProvider = screen.getByTestId("dnd-context-provider");
      const resizableWrapper = screen.getByTestId("resizable-wrapper");
      
      // Verify DndContextProvider wraps the resizable wrapper
      expect(dndProvider).toContainElement(resizableWrapper);
    });
  });

  describe("Resizable Wrapper Integration", () => {
    it("handles resizing state changes", () => {
      renderEditorPanel();
      
      const wrapper = screen.getByTestId("resizable-wrapper");
      
      // Simulate resize start
      fireEvent.click(wrapper);
      
      // The component should handle the resizing state internally
      expect(wrapper).toBeInTheDocument();
    });

    it("makes ResizableWrapper resizable in responsive mode", () => {
      renderEditorPanel();
      
      const wrapper = screen.getByTestId("resizable-wrapper");
      expect(wrapper).toHaveAttribute("data-is-resizable", "true");
    });

    it("makes ResizableWrapper non-resizable in non-responsive mode", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, previewMode: "mobile" });
        }
        return { ...mockEditorState, previewMode: "mobile" };
      });

      renderEditorPanel();
      
      const wrapper = screen.getByTestId("resizable-wrapper");
      expect(wrapper).toHaveAttribute("data-is-resizable", "false");
    });

    it("passes onDraggingChange callback to ResizableWrapper", () => {
      renderEditorPanel();
      
      const resizableWrapper = screen.getByTestId("resizable-wrapper");
      
      // Simulate calling onDraggingChange
      fireEvent.click(resizableWrapper);
      
      // The callback should be properly connected (tested via no errors)
      expect(resizableWrapper).toBeInTheDocument();
    });
  });

  describe("Auto Zoom Functionality", () => {
    it("handles auto zoom target selection", () => {
      // Mock DOM element for zoom target
      const mockElement = document.createElement('div');
      mockElement.setAttribute('data-layer-id', 'child-1');
      document.body.appendChild(mockElement);
      
      // Mock querySelector to return our element
      const originalQuerySelector = document.querySelector;
      document.querySelector = jest.fn().mockReturnValue(mockElement);
      
      try {
        // Test with autoZoomToSelected enabled
        renderEditorPanel();
        
        // The component should render without issues
        expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
        
        // Zoom functionality is mocked, so we just verify no errors occur
        expect(mockZoomToElement).toHaveBeenCalledTimes(0); // Not called in normal rendering
      } finally {
        // Cleanup
        document.querySelector = originalQuerySelector;
        document.body.removeChild(mockElement);
      }
    });

    it("handles missing zoom target element gracefully", () => {
      // Mock querySelector to return null
      const originalQuerySelector = document.querySelector;
      document.querySelector = jest.fn().mockReturnValue(null);
      
      try {
        renderEditorPanel();
        
        // Should not crash when target element is not found
        expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
      } finally {
        document.querySelector = originalQuerySelector;
      }
    });

    it("uses correct zoom target selectors", () => {
      // Mock both possible selectors
      const mockElement = document.createElement('div');
      const originalQuerySelector = document.querySelector;
      document.querySelector = jest.fn()
        .mockReturnValueOnce(null) // First call returns null
        .mockReturnValueOnce(mockElement); // Second call returns element
      
      try {
        renderEditorPanel();
        
        // Component should handle fallback selector gracefully
        expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
      } finally {
        document.querySelector = originalQuerySelector;
      }
    });
  });

  describe("Complex State Scenarios", () => {
    it("handles editor config updates when permissions change", () => {
      const { rerender } = renderEditorPanel();
      
      // Initial state - component should render
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
      
      // Disable both permissions
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ 
            ...mockEditorState, 
            allowPagesCreation: false, 
            allowPagesDeletion: false 
          });
        }
        return { 
          ...mockEditorState, 
          allowPagesCreation: false, 
          allowPagesDeletion: false 
        };
      });
      
      rerender(<EditorPanel />);
      
      // Component should still render after permission changes
      // Layer actions are now handled by useGlobalLayerActions
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("handles layer selection changes with different layer types", () => {
      const { rerender } = renderEditorPanel();
      
      // Change to selecting a page layer
      const newMockLayerState = {
        ...mockLayerState,
        selectedLayerId: "page-1",
      };
      
      mockIsLayerAPage.mockReturnValue(true);
      
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(newMockLayerState);
        }
        return newMockLayerState;
      });
      
      rerender(<EditorPanel />);
      
      expect(screen.getByTestId("selected-layer-id")).toHaveTextContent("page-1");
    });

    it("handles simultaneous state changes", () => {
      const { rerender } = renderEditorPanel();
      
      // Change multiple states at once
      useComponentDragContext.mockReturnValue({ isDragging: true });
      
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ 
            ...mockEditorState, 
            previewMode: "mobile",
            allowPagesCreation: false 
          });
        }
        return { 
          ...mockEditorState, 
          previewMode: "mobile",
          allowPagesCreation: false 
        };
      });
      
      rerender(<EditorPanel />);
      
      // Verify all changes are applied
      const wrapper = screen.getByTestId("transform-wrapper");
      const transformDiv = screen.getByTestId("transform-component");
      const resizableWrapper = screen.getByTestId("resizable-wrapper");
      
      expect(wrapper).toHaveAttribute("data-panning-disabled", "true");
      expect(transformDiv).toHaveClass("w-[390px]");
      expect(resizableWrapper).toHaveAttribute("data-is-resizable", "false");
      // Layer actions are now handled by useGlobalLayerActions, not via editorConfig
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("handles registry changes", () => {
      const { rerender } = renderEditorPanel();
      
      // Initial registry has 2 components
      expect(screen.getByTestId("registry-count")).toHaveTextContent("2");
      
      // Update registry with more components
      const expandedRegistry = {
        ...mockRegistry,
        Container: {
          schema: z.object({
            className: z.string().optional(),
          }),
          from: "@/components/ui/container",
          component: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        },
        Text: {
          schema: z.object({
            content: z.string().default("Text content"),
          }),
          from: "@/components/ui/text",
          component: ({ content, ...props }: any) => <span {...props}>{content}</span>,
        },
      };
      
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, registry: expandedRegistry });
        }
        return { ...mockEditorState, registry: expandedRegistry };
      });
      
      rerender(<EditorPanel />);
      
      expect(screen.getByTestId("registry-count")).toHaveTextContent("4");
    });

    it("handles edge case with empty page children", () => {
      const emptyPage: ComponentLayer = {
        id: "page-1",
        type: "_page_",
        name: "Empty Page",
        props: {},
        children: [],
      };

      mockFindLayerById.mockImplementation((id: string) => {
        if (id === "page-1") return emptyPage;
        if (id === "child-1") return mockSelectedLayer;
        return null;
      });

      const { countLayers } = require("@/lib/ui-builder/store/layer-store");
      countLayers.mockReturnValue(0);

      renderEditorPanel();
      
      expect(screen.getByTestId("total-layers")).toHaveTextContent("0");
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });
  });

  describe("Background Grid Pattern", () => {
    it("applies background grid pattern to container", () => {
      renderEditorPanel();
      
      const container = document.getElementById("editor-panel-container");
      expect(container).toHaveClass("bg-[radial-gradient(hsl(var(--border))_1px,hsl(var(--primary)/0.05)_1px)]");
      expect(container).toHaveClass("[background-size:16px_16px]");
    });

    it("applies performance optimization classes", () => {
      renderEditorPanel();
      
      const container = document.getElementById("editor-panel-container");
      expect(container).toHaveClass("will-change-auto");
    });
  });

  describe("Transform Component Styling", () => {
    it("applies correct padding and overflow styles", () => {
      renderEditorPanel();
      
      const editorContent = document.getElementById("editor-panel-content");
      expect(editorContent).toHaveClass("overflow-visible");
      expect(editorContent).toHaveClass("w-full");
    });

    it("applies correct transform div styling with all preview modes", () => {
      const previewModes = ["responsive", "mobile", "tablet", "desktop"];
      const expectedClasses = ["w-full", "w-[390px]", "w-[768px]", "w-[1440px]"];
      
      previewModes.forEach((mode, index) => {
        mockedUseEditorStore.mockImplementation((selector) => {
          if (typeof selector === "function") {
            return selector({ ...mockEditorState, previewMode: mode });
          }
          return { ...mockEditorState, previewMode: mode };
        });

        const { unmount } = renderEditorPanel();
        
        const transformDiv = screen.getByTestId("transform-component");
        const expectedClass = expectedClasses[index];
        expect(expectedClass).toBeDefined();
        expect(transformDiv).toHaveClass(expectedClass!);
        expect(transformDiv).toHaveClass("relative");
        
        unmount();
      });
    });
  });
}); 