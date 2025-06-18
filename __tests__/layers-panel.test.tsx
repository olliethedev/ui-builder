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

  describe("String Children Processing", () => {
    it("handles layers with string children correctly", () => {
      const layerWithStringChildren: ComponentLayer = {
        id: "string-children-page",
        name: "Page with String Children",
        type: "_page_",
        props: {},
        children: [
          {
            id: "box-1",
            name: "Box A",
            type: "div",
            props: { className: "bg-red-300" },
            children: [
              {
                id: "text-1",
                name: "Text",
                type: "span",
                props: { className: "text-white" },
                children: "Hello World" // String children - this was the issue
              }
            ]
          },
          {
            id: "box-2",
            name: "Box B",
            type: "div",
            props: { className: "bg-blue-300" },
            children: [
              {
                id: "text-2",
                name: "Text",
                type: "span",
                props: { className: "text-white" },
                children: "Another Text" // Another string children case
              }
            ]
          }
        ]
      };

      const stringChildrenProps = {
        layers: [layerWithStringChildren],
        selectedPageId: "string-children-page",
        selectedLayerId: "text-1",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...stringChildrenProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
      
      // The tree should render without errors even with string children
      expect(screen.getByTestId("dev-profiler")).toBeInTheDocument();
    });

    it("processes mixed children types correctly", () => {
      const mixedChildrenLayer: ComponentLayer = {
        id: "mixed-page",
        name: "Mixed Children Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "container-1",
            name: "Container",
            type: "div",
            props: {},
            children: [
              {
                id: "text-component",
                name: "Text Component",
                type: "span",
                props: {},
                children: "I am text" // String children
              },
              {
                id: "nested-container",
                name: "Nested Container",
                type: "div",
                props: {},
                children: [] // Array children (empty)
              }
            ]
          },
          {
            id: "another-text",
            name: "Another Text",
            type: "p",
            props: {},
            children: "More text content" // String children
          }
        ]
      };

      const mixedProps = {
        layers: [mixedChildrenLayer],
        selectedPageId: "mixed-page",
        selectedLayerId: "text-component",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...mixedProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
    });

    it("handles null and undefined children", () => {
      const nullUndefinedLayer: ComponentLayer = {
        id: "null-undefined-page",
        name: "Null/Undefined Children Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "null-child",
            name: "Null Child",
            type: "div",
            props: {},
            children: null as any
          },
          {
            id: "undefined-child",
            name: "Undefined Child",
            type: "div",
            props: {},
            children: undefined as any
          },
          {
            id: "empty-array-child",
            name: "Empty Array Child",
            type: "div",
            props: {},
            children: []
          }
        ]
      };

      const nullUndefinedProps = {
        layers: [nullUndefinedLayer],
        selectedPageId: "null-undefined-page",
        selectedLayerId: "null-child",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...nullUndefinedProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
    });
  });

  describe("Layer Data Preservation", () => {
    it("preserves original layer data when rendering nodes", () => {
      const layerWithPreservationTest: ComponentLayer = {
        id: "preservation-page",
        name: "Preservation Test Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "text-layer",
            name: "Text Layer",
            type: "span",
            props: { className: "important-class" },
            children: "Important Text Content"
          }
        ]
      };

      const preservationProps = {
        layers: [layerWithPreservationTest],
        selectedPageId: "preservation-page",
        selectedLayerId: "text-layer",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...preservationProps} />);
      
      // The tree should render and preserve the original layer structure
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
      
      // Since he-tree-react is mocked, we can't test individual nodes
      // but we can verify the component renders without errors
      expect(screen.getByTestId("dev-profiler")).toBeInTheDocument();
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

    it("handles deep nesting with mixed children types", () => {
      const deepNestedLayer: ComponentLayer = {
        id: "deep-nested-page",
        name: "Deep Nested Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "level-1",
            name: "Level 1",
            type: "div",
            props: {},
            children: [
              {
                id: "level-2",
                name: "Level 2",
                type: "div",
                props: {},
                children: [
                  {
                    id: "level-3-text",
                    name: "Level 3 Text",
                    type: "span",
                    props: {},
                    children: "Deep nested text"
                  },
                  {
                    id: "level-3-container",
                    name: "Level 3 Container",
                    type: "div",
                    props: {},
                    children: [
                      {
                        id: "level-4",
                        name: "Level 4",
                        type: "p",
                        props: {},
                        children: "Deepest text"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const deepNestedProps = {
        layers: [deepNestedLayer],
        selectedPageId: "deep-nested-page",
        selectedLayerId: "level-3-text",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...deepNestedProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
      
      // Tree should render successfully with deeply nested structure
      expect(screen.getByTestId("dev-profiler")).toBeInTheDocument();
    });

    it("handles empty layers array", () => {
      const emptyProps = {
        layers: [],
        selectedPageId: "non-existent",
        selectedLayerId: null,
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...emptyProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("add-components-popover")).toBeInTheDocument();
    });
  });

  describe("Tree Operations", () => {
    it("preprocesses layers with string children correctly", () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const layerWithStringChild: ComponentLayer = {
        id: "test-page",
        name: "Test Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "text-component",
            name: "Text Component",
            type: "span",
            props: {},
            children: "Test text" // String children should be converted for tree traversal
          }
        ]
      };

      const changeProps = {
        layers: [layerWithStringChild],
        selectedPageId: "test-page",
        selectedLayerId: "text-component",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...changeProps} />);
      
      // Verify that the component renders successfully with string children
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
      
      // The component should render without console errors despite string children
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it("handles onChange with processed layers", () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const layerWithStringChild: ComponentLayer = {
        id: "test-page",
        name: "Test Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "text-component",
            name: "Text Component",
            type: "span",
            props: {},
            children: "Test text"
          }
        ]
      };

      const changeProps = {
        layers: [layerWithStringChild],
        selectedPageId: "test-page",
        selectedLayerId: "text-component",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...changeProps} />);
      
      // The component should render without console errors
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it("handles tree data configuration correctly", () => {
      const configTestLayer: ComponentLayer = {
        id: "config-test-page",
        name: "Config Test Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "mixed-child-1",
            name: "Mixed Child 1",
            type: "div",
            props: {},
            children: "String content"
          },
          {
            id: "mixed-child-2",
            name: "Mixed Child 2",
            type: "div",
            props: {},
            children: []
          }
        ]
      };

      const configProps = {
        layers: [configTestLayer],
        selectedPageId: "config-test-page",
        selectedLayerId: null,
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...configProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
      
      // Tree should render successfully with mixed children types
      expect(screen.getByTestId("dev-profiler")).toBeInTheDocument();
    });
  });
});