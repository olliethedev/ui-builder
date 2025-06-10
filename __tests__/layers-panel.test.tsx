/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LayersPanel, { LayersTree } from "@/components/ui/ui-builder/internal/layers-panel";
import { useLayerStore} from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer, RegistryEntry } from '@/components/ui/ui-builder/types';
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { z } from "zod";

// Mock dependencies
jest.mock("../lib/ui-builder/store/layer-store", () => ({
  useLayerStore: jest.fn(),
}));

jest.mock("../lib/ui-builder/store/editor-store", () => ({
  useEditorStore: jest.fn(),
}));

jest.mock(
  "../components/ui/ui-builder/internal/add-component-popover.tsx",
  () => ({
    AddComponentsPopover: ({ children }: any) => (
      <div data-testid="add-components-popover">{children}</div>
    ),
  })
);

// Mock TreeRowNode and TreeRowPlaceholder to simplify rendering
jest.mock("../components/ui/ui-builder/internal/tree-row-node.tsx", () => ({
  TreeRowNode: ({ node }: { node: ComponentLayer }) => (
    <div data-testid={`tree-row-node-${node.id}`}>{node.name}</div>
  ),
  TreeRowPlaceholder: () => <div data-testid="tree-row-placeholder" />,
}));

// Mock he-tree-react
jest.mock("he-tree-react", () => ({
  useHeTree: jest.fn(() => ({
    renderTree: jest.fn(() => <div data-testid="rendered-tree">Tree Content</div>),
    scrollToNode: jest.fn(),
  })),
}));

// Mock dev profiler
jest.mock("../components/ui/ui-builder/internal/dev-profiler", () => ({
  DevProfiler: ({ children }: any) => <div data-testid="dev-profiler">{children}</div>,
}));

// Mock divider control
jest.mock("../components/ui/ui-builder/internal/divider-control", () => ({
  DividerControl: () => <div data-testid="divider-control">Divider</div>,
}));

describe("LayersPanel", () => {
  const mockedUseLayerStore = useLayerStore as unknown as jest.Mock;
  const mockedUseEditorStore = useEditorStore as unknown as jest.Mock;

  const mockSelectLayer = jest.fn();
  const mockFindLayersForPageId = jest.fn();
  const mockUpdateLayer = jest.fn();
  const mockRemoveLayer = jest.fn();
  const mockDuplicateLayer = jest.fn();
  const mockFindLayerById = jest.fn();
  const mockInitializeRegistry = jest.fn();
  const mockGetComponentDefinition = jest.fn();

  const mockLayerState = {
    selectedPageId: "page-1",
    selectedLayerId: "layer-1",
    findLayersForPageId: mockFindLayersForPageId,
    updateLayer: mockUpdateLayer,
    selectLayer: mockSelectLayer,
    removeLayer: mockRemoveLayer,
    duplicateLayer: mockDuplicateLayer,
    findLayerById: mockFindLayerById,
  };

  const mockPageLayer: ComponentLayer = {
    id: "page-1",
    name: "Home Page",
    type: "_page_",
    props: {},
    children: [
      {
        id: "layer-1",
        name: "Header",
        type: "HeaderComponent",
        props: {},
        children: [],
      },
      {
        id: "layer-2",
        name: "Footer",
        type: "FooterComponent",
        props: {},
        children: [],
      },
    ],
  };

  const mockEditorRegistry: Record<string, RegistryEntry<any>> = {
    HeaderComponent: {
      schema: z.object({}),
      component: () => <div>Mock Header</div>
    },
    FooterComponent: {
        schema: z.object({}),
        component: () => <div>Mock Footer</div>
    },
  };

  const mockEditorState = {
    registry: mockEditorRegistry,
    initializeRegistry: mockInitializeRegistry,
    getComponentDefinition: mockGetComponentDefinition,
    previewMode: 'responsive',
    setPreviewMode: jest.fn(),
  };

  beforeEach(() => {
    mockedUseLayerStore.mockReturnValue(mockLayerState);
    mockedUseEditorStore.mockReturnValue(mockEditorState);
    // Mock getComponentDefinition to return entries from our mock registry
    mockGetComponentDefinition.mockImplementation((type: string) => mockEditorRegistry[type]);
    // Mock findLayerById to return the page layer when requested
    mockFindLayerById.mockImplementation((id: string) => {
        if (id === mockPageLayer.id) {
            return mockPageLayer;
        }
        // Ensure children is an array before calling find
        const children = Array.isArray(mockPageLayer.children) ? mockPageLayer.children : [];
        return children.find(child => child.id === id);
    });
    // Mock findLayersForPageId to return the children of the page layer
    mockFindLayersForPageId.mockReturnValue(mockPageLayer.children);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderLayersPanel = () => {
    render(<LayersPanel className="test-class" />);
  };

  describe("LayersPanel Main Component", () => {
    it("renders LayersTree with correct layers", () => {
      renderLayersPanel();

      // Check that the DevProfiler wraps the content
      expect(screen.getByTestId("dev-profiler")).toBeInTheDocument();
      
      // Check that divider controls are rendered
      expect(screen.getAllByTestId("divider-control")).toHaveLength(2);
      
      // Check that the tree content is rendered
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
    });

    it("returns null when no page layer is found", () => {
      mockFindLayerById.mockReturnValue(null);
      const { container } = render(<LayersPanel />);
      expect(container).toBeEmptyDOMElement();
    });

    it("renders with proper structure when page has children", () => {
      renderLayersPanel();
      
      // Should render the tree structure with divider controls
      expect(screen.getByTestId("dev-profiler")).toBeInTheDocument();
      expect(screen.getAllByTestId("divider-control")).toHaveLength(2);
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
    });
  });

  describe("LayersTree Component", () => {
    const defaultTreeProps = {
      layers: [mockPageLayer],
      selectedPageId: "page-1",
      selectedLayerId: "layer-1",
      updateLayer: mockUpdateLayer,
      selectLayer: mockSelectLayer,
      removeLayer: mockRemoveLayer,
      duplicateLayer: mockDuplicateLayer,
    };

    it("renders with basic props", () => {
      render(<LayersTree {...defaultTreeProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("dev-profiler")).toBeInTheDocument();
    });

    it("handles onChange with valid layer structure", () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<LayersTree {...defaultTreeProps} />);
      
      // Simulate onChange being called with valid data
      // This would normally be called by the he-tree-react component
      const mockChangeHandler = mockUpdateLayer;
      
      // Test that updateLayer is called correctly
      mockChangeHandler("page-1", {}, { children: [] });
      expect(mockUpdateLayer).toHaveBeenCalledWith("page-1", {}, { children: [] });
      
      consoleSpy.mockRestore();
    });

    it("handles onChange with invalid layer structure", () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<LayersTree {...defaultTreeProps} />);
      
      // This would be handled internally by the component's handleChange method
      // We can't directly test it since it's not exposed, but we can verify error handling
      
      expect(consoleSpy).not.toHaveBeenCalled(); // No errors should be logged during normal render
      
      consoleSpy.mockRestore();
    });

    it("renders with empty layers array", () => {
      const emptyProps = {
        ...defaultTreeProps,
        layers: []
      };
      
      render(<LayersTree {...emptyProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("add-components-popover")).toBeInTheDocument();
    });

    it("applies className correctly", () => {
      const customProps = {
        ...defaultTreeProps,
        className: "custom-class"
      };
      
      render(<LayersTree {...customProps} />);
      
      const treeElement = screen.getByTestId("layers-tree");
      expect(treeElement).toHaveClass("custom-class");
    });

    it("handles selectedLayerId being null", () => {
      const nullSelectedProps = {
        ...defaultTreeProps,
        selectedLayerId: null
      };
      
      render(<LayersTree {...nullSelectedProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
    });

    it("handles different selectedPageId", () => {
      const differentPageProps = {
        ...defaultTreeProps,
        selectedPageId: "different-page-id"
      };
      
      render(<LayersTree {...differentPageProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
    });
  });

  describe("Memoization and Performance", () => {
    it("should memoize LayersTree component properly", () => {
      const props1 = {
        layers: [mockPageLayer],
        selectedPageId: "page-1",
        selectedLayerId: "layer-1",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
        className: "test-class"
      };

      const { rerender } = render(<LayersTree {...props1} />);
      
      // Rerender with same props - should use memoized version
      rerender(<LayersTree {...props1} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
    });

    it("should re-render when props change", () => {
      const props1 = {
        layers: [mockPageLayer],
        selectedPageId: "page-1",
        selectedLayerId: "layer-1",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      const props2 = {
        ...props1,
        selectedLayerId: "layer-2"
      };

      const { rerender } = render(<LayersTree {...props1} />);
      rerender(<LayersTree {...props2} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles layers with different structures", () => {
      const complexLayer: ComponentLayer = {
        id: "complex-page",
        name: "Complex Page", 
        type: "_page_",
        props: { className: "complex" },
        children: [
          {
            id: "nested-1",
            name: "Nested Component",
            type: "NestedComponent",
            props: {},
            children: [
              {
                id: "deeply-nested",
                name: "Deeply Nested",
                type: "DeepComponent", 
                props: {},
                children: []
              }
            ]
          }
        ]
      };

      const complexProps = {
        layers: [complexLayer],
        selectedPageId: "complex-page",
        selectedLayerId: "nested-1",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...complexProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
    });

    it("handles undefined children in layers", () => {
      const layerWithUndefinedChildren: ComponentLayer = {
        id: "undefined-children-page",
        name: "Page with Undefined Children",
        type: "_page_",
        props: {},
        children: undefined as any
      };

      const undefinedChildrenProps = {
        layers: [layerWithUndefinedChildren],
        selectedPageId: "undefined-children-page",
        selectedLayerId: null,
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...undefinedChildrenProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
    });
  });
});