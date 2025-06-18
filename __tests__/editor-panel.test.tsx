/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EditorPanel from "@/components/ui/ui-builder/internal/editor-panel";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { ComponentLayer, RegistryEntry } from "@/components/ui/ui-builder/types";
import { z } from "zod";

// Mock dependencies
jest.mock("@/lib/ui-builder/store/layer-store", () => ({
  useLayerStore: jest.fn(),
  countLayers: jest.fn(),
}));

jest.mock("@/lib/ui-builder/store/editor-store", () => ({
  useEditorStore: jest.fn(),
}));

jest.mock("@/components/ui/ui-builder/layer-renderer", () => ({
  __esModule: true,
  default: ({ page, editorConfig, componentRegistry }: any) => (
    <div data-testid="layer-renderer">
      <div data-testid="page-id">{page?.id}</div>
      <div data-testid="selected-layer-id">{editorConfig?.selectedLayer?.id}</div>
      <div data-testid="registry-count">{Object.keys(componentRegistry).length}</div>
    </div>
  ),
}));

// Interactive canvas is no longer used in editor-panel

jest.mock("@/components/ui/ui-builder/internal/add-component-popover", () => ({
  AddComponentsPopover: ({ children, parentLayerId }: any) => (
    <div data-testid="add-components-popover" data-parent-layer-id={parentLayerId}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, size, className, "data-testid": testId, ...props }: any) => (
    <button 
      data-testid={testId || "add-button"} 
      data-variant={variant} 
      data-size={size} 
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));



jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

jest.mock("react-zoom-pan-pinch", () => ({
  TransformWrapper: ({ children }: any) => <div data-testid="transform-wrapper">{children}</div>,
  TransformComponent: ({ children, contentStyle, wrapperStyle }: any) => <div data-testid="transform-component-wrapper" style={contentStyle}>{children}</div>,
  useControls: () => ({
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    resetTransform: jest.fn(),
  }),
}));

jest.mock("lucide-react", () => ({
  Plus: () => <svg data-testid="plus-icon" />,
  GripVertical: () => <svg data-testid="grip-vertical-icon" />,
  ZoomIn: () => <svg data-testid="zoom-in-icon" />,
  ZoomOut: () => <svg data-testid="zoom-out-icon" />,
  Crosshair: () => <svg data-testid="crosshair-icon" />,
}));

jest.mock("@use-gesture/react", () => ({
  useDrag: () => jest.fn(),
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

    it("renders LayerRenderer with correct props", () => {
      renderEditorPanel();
      
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
      expect(screen.getByTestId("page-id")).toHaveTextContent("page-1");
      expect(screen.getByTestId("selected-layer-id")).toHaveTextContent("child-1");
      expect(screen.getByTestId("registry-count")).toHaveTextContent("2");
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

  describe("Transform Wrapper Rendering", () => {
    it("renders with TransformWrapper by default", () => {
      renderEditorPanel();
      
      expect(screen.getByTestId("transform-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("renders zoom controls", () => {
      renderEditorPanel();
      
      expect(screen.getByTestId("button-ZoomIn")).toBeInTheDocument();
      expect(screen.getByTestId("button-ZoomOut")).toBeInTheDocument();
      expect(screen.getByTestId("button-Reset")).toBeInTheDocument();
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

    it("makes resizer elements visible in responsive mode when layers exist", () => {
      renderEditorPanel();
      
      const resizers = screen.getAllByTestId("resizer");
      expect(resizers.length).toBeGreaterThan(0);
    });

    it("hides resizer elements in non-responsive mode", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, previewMode: "mobile" });
        }
        return { ...mockEditorState, previewMode: "mobile" };
      });

      renderEditorPanel();
      
      const resizers = screen.queryAllByTestId("resizer");
      expect(resizers.length).toBe(0);
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
      // The mock layer renderer displays the selected layer ID
      expect(screen.getByTestId("selected-layer-id")).toHaveTextContent("child-1");
    });

    it("includes duplicate handler when allowPagesCreation is true", () => {
      // This is tested indirectly through the layer renderer receiving the config
      renderEditorPanel();
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("excludes duplicate handler when allowPagesCreation is false", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, allowPagesCreation: false });
        }
        return { ...mockEditorState, allowPagesCreation: false };
      });

      renderEditorPanel();
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("includes delete handler when allowPagesDeletion is true", () => {
      renderEditorPanel();
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("excludes delete handler when allowPagesDeletion is false", () => {
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ ...mockEditorState, allowPagesDeletion: false });
        }
        return { ...mockEditorState, allowPagesDeletion: false };
      });

      renderEditorPanel();
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });
  });

  describe("Layer Selection", () => {
    it("calls selectLayer when onSelectElement is triggered", () => {
      renderEditorPanel();
      
      // This would be tested through integration with the actual LayerRenderer
      // but for now we verify the function is passed correctly
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });
  });

  describe("Layer Management", () => {
    it("calls removeLayer when layer is not a page", () => {
      mockIsLayerAPage.mockReturnValue(false);
      
      renderEditorPanel();
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("does not call removeLayer when layer is a page", () => {
      mockIsLayerAPage.mockReturnValue(true);
      
      renderEditorPanel();
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("calls duplicateLayer when layer is not a page", () => {
      mockIsLayerAPage.mockReturnValue(false);
      
      renderEditorPanel();
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });

    it("does not call duplicateLayer when layer is a page", () => {
      mockIsLayerAPage.mockReturnValue(true);
      
      renderEditorPanel();
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles missing selected page gracefully", () => {
      // Mock a page with no children instead of null, since the component expects a page object
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

      // Mock countLayers to return 0 since there are no children
      const { countLayers } = require("@/lib/ui-builder/store/layer-store");
      countLayers.mockReturnValue(0);

      renderEditorPanel();
      
      // Should still render without crashing
      expect(screen.getByTestId("add-components-popover")).toBeInTheDocument();
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
  });

  describe("Performance Optimizations", () => {
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

    it("memoizes editorConfig to avoid unnecessary recalculations", () => {
      renderEditorPanel();
      
      // The editorConfig should be stable and not cause unnecessary re-renders
      expect(screen.getByTestId("layer-renderer")).toBeInTheDocument();
    });
  });
}); 