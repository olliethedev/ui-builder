/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import LayersPanel, { LayersTree } from "@/components/ui/ui-builder/internal/layers-panel";
import { useLayerStore} from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer, RegistryEntry } from '@/components/ui/ui-builder/types';
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { z } from "zod";

// Mock dependencies
jest.mock("../lib/ui-builder/store/layer-store", () => ({
  useLayerStore: jest.fn(),
  findAllParentLayersRecursive: jest.fn(),
}));

jest.mock("../lib/ui-builder/store/layer-utils", () => ({
  hasLayerChildren: jest.fn(),
  findAllParentLayersRecursive: jest.fn(),
}));

jest.mock("../lib/ui-builder/store/editor-store", () => ({
  useEditorStore: jest.fn(),
}));

jest.mock(
  "../components/ui/ui-builder/internal/components/add-component-popover.tsx",
  () => ({
    AddComponentsPopover: ({ children }: any) => (
      <div data-testid="add-components-popover">{children}</div>
    ),
  })
);

// Mock TreeRowNode and TreeRowPlaceholder to allow testing render callbacks
jest.mock("../components/ui/ui-builder/internal/components/tree-row-node.tsx", () => ({
  TreeRowNode: ({ node, onToggle, id, open }: any) => (
    <div 
      data-testid={`tree-row-node-${node.id}`}
      onClick={() => onToggle && onToggle(id, !open)}
    >
      {node.name}
    </div>
  ),
  TreeRowPlaceholder: ({ nodeAttributes }: any) => (
    <div 
      data-testid="tree-row-placeholder"
      data-key={nodeAttributes?.key}
    />
  ),
}));

// Mock he-tree-react with more detailed implementation
const mockScrollToNode = jest.fn();
const mockRenderTree = jest.fn();
let mockTreeConfig: any = null;

jest.mock("he-tree-react", () => ({
  useHeTree: jest.fn((config: any) => {
    mockTreeConfig = config;
    return {
      renderTree: () => {
        // Store config for tests to access
        if (config) {
          mockTreeConfig = {
            ...config,
            onChange: config.onChange,
            onDragOpen: config.onDragOpen,
            canDrop: config.canDrop,
            renderNodeBox: config.renderNodeBox,
          };
        }
        
        // Simulate calling renderNodeBox with different scenarios
        if (config.renderNodeBox && config.data && Array.isArray(config.data)) {
          const layers = config.data;
          try {
            return (
              <div data-testid="rendered-tree">
                {layers.map((layer: any, index: number) => {
                  if (!layer || !layer.id) return null;
                  
                  // Test normal node rendering
                  const normalResult = config.renderNodeBox({
                    stat: { node: layer, id: layer.id, open: true, level: 0, draggable: true },
                    attrs: { key: `node-${layer.id}` },
                    isPlaceholder: false
                  });
                  
                  // Test placeholder rendering
                  const placeholderResult = config.renderNodeBox({
                    stat: { node: layer, id: layer.id, open: true, level: 0, draggable: true },
                    attrs: { key: `placeholder-${index}` },
                    isPlaceholder: true
                  });
                  
                  return (
                    <div key={layer.id}>
                      {normalResult}
                      {placeholderResult}
                    </div>
                  );
                })}
              </div>
            );
          } catch (error) {
            return <div data-testid="rendered-tree">Tree Render Error</div>;
          }
        }
        return <div data-testid="rendered-tree">Tree Content</div>;
      },
      scrollToNode: mockScrollToNode,
    };
  }),
}));

// Mock dev profiler
jest.mock("../components/ui/ui-builder/internal/components/dev-profiler", () => ({
  DevProfiler: ({ children }: any) => <div data-testid="dev-profiler">{children}</div>,
}));

// Mock divider control
jest.mock("../components/ui/ui-builder/internal/components/divider-control", () => ({
  DividerControl: () => <div data-testid="divider-control">Divider</div>,
}));

// Mock isDeepEqual
jest.mock("fast-deep-equal", () => jest.fn());

describe("LayersPanel", () => {
  const mockedUseLayerStore = useLayerStore as unknown as jest.Mock;
  const mockedUseEditorStore = useEditorStore as unknown as jest.Mock;
  const { hasLayerChildren, findAllParentLayersRecursive } = require("../lib/ui-builder/store/layer-utils");
  const isDeepEqual = require("fast-deep-equal");

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
        children: [
          {
            id: "layer-3",
            name: "Nested Child",
            type: "NestedComponent",
            props: {},
            children: "Text content",
          }
        ],
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
    jest.clearAllMocks();
    
    mockedUseLayerStore.mockReturnValue(mockLayerState);
    mockedUseEditorStore.mockReturnValue(mockEditorState);
    
    // Mock utility functions
    hasLayerChildren.mockImplementation((layer: ComponentLayer) => {
      if (!layer || !layer.children) return false;
      return Array.isArray(layer.children) && typeof layer.children !== 'string';
    });
    
    findAllParentLayersRecursive.mockImplementation((layers: ComponentLayer[], layerId: string) => {
      const parents: ComponentLayer[] = [];
      const findParents = (layerList: ComponentLayer[], targetId: string): boolean => {
        for (const layer of layerList) {
          if (layer.id === targetId) return true;
          if (hasLayerChildren(layer) && Array.isArray(layer.children)) {
            if (findParents(layer.children, targetId)) {
              parents.unshift(layer);
              return true;
            }
          }
        }
        return false;
      };
      findParents(layers, layerId);
      return parents;
    });
    
    isDeepEqual.mockImplementation((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b));
    
    mockGetComponentDefinition.mockImplementation((type: string) => mockEditorRegistry[type]);
    
    mockFindLayerById.mockImplementation((id: string) => {
      if (id === mockPageLayer.id) return mockPageLayer;
      
      const findInChildren = (children: ComponentLayer[]): ComponentLayer | null => {
        for (const child of children) {
          if (child.id === id) return child;
          if (hasLayerChildren(child) && Array.isArray(child.children)) {
            const found = findInChildren(child.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      if (hasLayerChildren(mockPageLayer) && Array.isArray(mockPageLayer.children)) {
        return findInChildren(mockPageLayer.children);
      }
      return null;
    });
    
    mockFindLayersForPageId.mockReturnValue(mockPageLayer.children);
  });

  const renderLayersPanel = () => {
    return render(<LayersPanel className="test-class" />);
  };

  describe("LayersPanel Main Component", () => {
    it("renders LayersTree with correct layers", () => {
      renderLayersPanel();

      expect(screen.getByTestId("dev-profiler")).toBeInTheDocument();
      expect(screen.getAllByTestId("divider-control")).toHaveLength(2);
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
    });

    it("returns null when no page layer is found", () => {
      mockFindLayerById.mockReturnValue(null);
      const { container } = render(<LayersPanel />);
      expect(container).toBeEmptyDOMElement();
    });

    it("renders with proper structure when page has children", () => {
      renderLayersPanel();
      
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
      
      // Test the handleChange callback
      const validNewLayers = [{
        id: "page-1",
        name: "Updated Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "layer-1",
            name: "Updated Header",
            type: "HeaderComponent",
            props: {},
            children: [],
          }
        ],
      }];
      
      act(() => {
        mockTreeConfig.onChange(validNewLayers);
      });
      
      expect(mockUpdateLayer).toHaveBeenCalledWith("page-1", {}, { children: validNewLayers[0].children });
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it("handles onChange with invalid layer structure - wrong ID", () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<LayersTree {...defaultTreeProps} />);
      
      const invalidLayers = [{
        id: "wrong-page-id",
        name: "Wrong Page",
        type: "_page_",
        props: {},
        children: [],
      }];
      
      act(() => {
        mockTreeConfig.onChange(invalidLayers);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        "LayersTree onChange: Invalid layer structure - ID mismatch",
        { updatedPageLayer: invalidLayers[0], selectedPageId: "page-1" }
      );
      expect(mockUpdateLayer).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it("handles onChange with invalid layer structure - not an array", () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<LayersTree {...defaultTreeProps} />);
      
      act(() => {
        mockTreeConfig.onChange("invalid data");
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        "LayersTree onChange: Invalid newLayers structure received",
        "invalid data"
      );
      expect(mockUpdateLayer).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it("handles onChange with empty array", () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<LayersTree {...defaultTreeProps} />);
      
      act(() => {
        mockTreeConfig.onChange([]);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        "LayersTree onChange: Invalid newLayers structure received",
        []
      );
      expect(mockUpdateLayer).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it("does not update when children are the same", () => {
      isDeepEqual.mockReturnValue(true);
      
      render(<LayersTree {...defaultTreeProps} />);
      
      const sameData = [{
        id: "page-1",
        name: "Page",
        type: "_page_",
        props: {},
        children: mockPageLayer.children,
      }];
      
      act(() => {
        mockTreeConfig.onChange(sameData);
      });
      
      expect(mockUpdateLayer).not.toHaveBeenCalled();
    });

    it("handles layers without children in onChange", () => {
      // For this test, we need to simulate a layer where hasLayerChildren returns false
      // for the updated layer but true for the current layer (to create a change)
      const originalHasLayerChildren = hasLayerChildren.getMockImplementation();
      
      render(<LayersTree {...defaultTreeProps} />);
      
      // Mock hasLayerChildren to return false only for the updated layer
      hasLayerChildren.mockImplementation((layer: ComponentLayer) => {
        if (layer.children === "string content") {
          return false; // The updated layer has string content, so no children
        }
        return originalHasLayerChildren ? originalHasLayerChildren(layer) : Array.isArray(layer.children);
      });
      
      const layerWithoutChildren = [{
        id: "page-1",
        name: "Page",
        type: "_page_",
        props: {},
        children: "string content",
      }];
      
      act(() => {
        mockTreeConfig.onChange(layerWithoutChildren);
      });
      
      expect(mockUpdateLayer).toHaveBeenCalledWith("page-1", {}, { children: [] });
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

  describe("Drag and Drop Functionality", () => {
    const defaultTreeProps = {
      layers: [mockPageLayer],
      selectedPageId: "page-1",
      selectedLayerId: "layer-1",
      updateLayer: mockUpdateLayer,
      selectLayer: mockSelectLayer,
      removeLayer: mockRemoveLayer,
      duplicateLayer: mockDuplicateLayer,
    };

    it("handles handleDragOpen correctly for layers with children", () => {
      render(<LayersTree {...defaultTreeProps} />);
      
      const mockStat = {
        node: mockPageLayer.children[1], // Footer component with children
        id: "layer-2"
      };
      
      act(() => {
        mockTreeConfig.onDragOpen(mockStat);
      });
      
      // Should have opened the node (added to openIds)
      expect(hasLayerChildren).toHaveBeenCalledWith(mockStat.node);
    });

    it("handles handleDragOpen correctly for layers without children", () => {
      render(<LayersTree {...defaultTreeProps} />);
      
      const mockStat = {
        node: mockPageLayer.children[0], // Header component without children
        id: "layer-1"
      };
      
      act(() => {
        mockTreeConfig.onDragOpen(mockStat);
      });
      
      expect(hasLayerChildren).toHaveBeenCalledWith(mockStat.node);
    });

    it("canNodeDrop returns correct values", () => {
      render(<LayersTree {...defaultTreeProps} />);
      
      // Test with layer that has children (Footer component has children)
      const droppableLayer = { node: mockPageLayer.children[1] };
      const canDrop1 = mockTreeConfig.canDrop(droppableLayer);
      expect(canDrop1).toBe(true);
      
      // Test with layer that doesn't have children (Header component has empty children array)
      const nonDroppableLayer = { node: mockPageLayer.children[0] };
      const canDrop2 = mockTreeConfig.canDrop(nonDroppableLayer);
      expect(canDrop2).toBe(true); // Empty array is still considered as having children capability
    });
  });

  describe("Node Rendering", () => {
    const defaultTreeProps = {
      layers: [mockPageLayer],
      selectedPageId: "page-1",
      selectedLayerId: "layer-1",
      updateLayer: mockUpdateLayer,
      selectLayer: mockSelectLayer,
      removeLayer: mockRemoveLayer,
      duplicateLayer: mockDuplicateLayer,
    };

    it("renders normal nodes correctly", () => {
      render(<LayersTree {...defaultTreeProps} />);
      
      expect(screen.getByTestId("tree-row-node-page-1")).toBeInTheDocument();
      expect(screen.getByText("Home Page")).toBeInTheDocument();
    });

    it("renders placeholder nodes correctly", () => {
      render(<LayersTree {...defaultTreeProps} />);
      
      expect(screen.getByTestId("tree-row-placeholder")).toBeInTheDocument();
    });

    it("finds original layer data for nodes", () => {
      const layerWithStringChildren: ComponentLayer = {
        id: "string-page",
        name: "String Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "text-layer",
            name: "Text Layer",
            type: "span",
            props: {},
            children: "Hello World"
          }
        ]
      };

      const stringProps = {
        ...defaultTreeProps,
        layers: [layerWithStringChildren],
        selectedPageId: "string-page"
      };

      render(<LayersTree {...stringProps} />);
      
      expect(screen.getByTestId("tree-row-node-string-page")).toBeInTheDocument();
    });
  });

  describe("Layer Processing", () => {
    const defaultTreeProps = {
      layers: [mockPageLayer],
      selectedPageId: "page-1",
      selectedLayerId: "layer-1",
      updateLayer: mockUpdateLayer,
      selectLayer: mockSelectLayer,
      removeLayer: mockRemoveLayer,
      duplicateLayer: mockDuplicateLayer,
    };

    it("processes layers with string children", () => {
      const layerWithStringChildren: ComponentLayer = {
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

      const stringProps = {
        ...defaultTreeProps,
        layers: [layerWithStringChildren]
      };

      render(<LayersTree {...stringProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
    });

    it("processes layers with null children", () => {
      const layerWithNullChildren: ComponentLayer = {
        id: "null-page",
        name: "Null Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "null-child",
            name: "Null Child",
            type: "div",
            props: {},
            children: null as any
          }
        ]
      };

      const nullProps = {
        ...defaultTreeProps,
        layers: [layerWithNullChildren]
      };

      render(<LayersTree {...nullProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
    });

    it("processes layers with undefined children", () => {
      const layerWithUndefinedChildren: ComponentLayer = {
        id: "undefined-page",
        name: "Undefined Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "undefined-child",
            name: "Undefined Child",
            type: "div",
            props: {},
            children: undefined as any
          }
        ]
      };

      const undefinedProps = {
        ...defaultTreeProps,
        layers: [layerWithUndefinedChildren]
      };

      render(<LayersTree {...undefinedProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
    });
  });

  describe("Layout Effects and State Management", () => {
    const defaultTreeProps = {
      layers: [mockPageLayer],
      selectedPageId: "page-1",
      selectedLayerId: "layer-1",
      updateLayer: mockUpdateLayer,
      selectLayer: mockSelectLayer,
      removeLayer: mockRemoveLayer,
      duplicateLayer: mockDuplicateLayer,
    };

    it("handles layout effect for opening parent layers when selectedLayerId changes", () => {
      findAllParentLayersRecursive.mockReturnValue([
        { id: "parent-1", name: "Parent 1" },
        { id: "parent-2", name: "Parent 2" }
      ]);

      const { rerender } = render(<LayersTree {...defaultTreeProps} />);
      
      // Change selectedLayerId
      rerender(<LayersTree {...defaultTreeProps} selectedLayerId="layer-2" />);
      
      expect(findAllParentLayersRecursive).toHaveBeenCalledWith([mockPageLayer], "layer-2");
    });

    it("handles layout effect for scrolling to selected layer", () => {
      const { rerender } = render(<LayersTree {...defaultTreeProps} />);
      
      // Change selectedLayerId
      rerender(<LayersTree {...defaultTreeProps} selectedLayerId="layer-2" />);
      
      expect(mockScrollToNode).toHaveBeenCalledWith("layer-2");
    });

    it("does not scroll when selectedLayerId hasn't changed", () => {
      render(<LayersTree {...defaultTreeProps} />);
      
      expect(mockScrollToNode).not.toHaveBeenCalled();
    });

    it("handles null selectedLayerId in layout effects", () => {
      const nullProps = {
        ...defaultTreeProps,
        selectedLayerId: null
      };

      render(<LayersTree {...nullProps} />);
      
      expect(findAllParentLayersRecursive).not.toHaveBeenCalled();
      expect(mockScrollToNode).not.toHaveBeenCalled();
    });
  });

  describe("Node Toggle Functionality", () => {
    const defaultTreeProps = {
      layers: [mockPageLayer],
      selectedPageId: "page-1",
      selectedLayerId: "layer-1",
      updateLayer: mockUpdateLayer,
      selectLayer: mockSelectLayer,
      removeLayer: mockRemoveLayer,
      duplicateLayer: mockDuplicateLayer,
    };

    it("handles node toggle open", () => {
      render(<LayersTree {...defaultTreeProps} />);
      
      // Simulate clicking on a tree row node to toggle it
      const treeNode = screen.getByTestId("tree-row-node-page-1");
      fireEvent.click(treeNode);
      
      expect(treeNode).toBeInTheDocument();
    });

    it("handles node toggle close", () => {
      render(<LayersTree {...defaultTreeProps} />);
      
      // First open the node, then close it
      const treeNode = screen.getByTestId("tree-row-node-page-1");
      fireEvent.click(treeNode); // Open
      fireEvent.click(treeNode); // Close
      
      expect(treeNode).toBeInTheDocument();
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

    it("should not re-render when layers are deeply equal", () => {
      isDeepEqual.mockReturnValue(true);
      
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
        layers: [{ ...mockPageLayer }] // Different object, same content
      };

      const { rerender } = render(<LayersTree {...props1} />);
      rerender(<LayersTree {...props2} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles complex nested structures", () => {
      const complexLayer: ComponentLayer = {
        id: "complex-page",
        name: "Complex Page",
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
                id: "level-2-text",
                name: "Level 2 Text",
                type: "span",
                props: {},
                children: "Deep text"
              },
              {
                id: "level-2-container",
                name: "Level 2 Container",
                type: "div",
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
        selectedLayerId: "level-2-text",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...complexProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
    });

    it("handles layer structure with mixed child types", () => {
      const mixedLayer: ComponentLayer = {
        id: "mixed-page",
        name: "Mixed Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "text-child",
            name: "Text Child",
            type: "span",
            props: {},
            children: "Text content"
          },
          {
            id: "array-child",
            name: "Array Child",
            type: "div",
            props: {},
            children: []
          },
          {
            id: "null-child",
            name: "Null Child",
            type: "div",
            props: {},
            children: null as any
          }
        ]
      };

      const mixedProps = {
        layers: [mixedLayer],
        selectedPageId: "mixed-page",
        selectedLayerId: "text-child",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...mixedProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
    });

    it("handles invalid layer ID in handleChange", () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const props = {
        layers: [mockPageLayer],
        selectedPageId: "page-1",
        selectedLayerId: "layer-1",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...props} />);
      
      const invalidLayer = [{
        id: null as any,
        name: "Invalid Layer",
        type: "_page_",
        props: {},
        children: [],
      }];
      
      act(() => {
        mockTreeConfig.onChange(invalidLayer);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        "LayersTree onChange: Invalid layer structure - ID mismatch",
        { updatedPageLayer: invalidLayer[0], selectedPageId: "page-1" }
      );
      
      consoleSpy.mockRestore();
    });

    it("handles missing layer in handleChange", () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const props = {
        layers: [mockPageLayer],
        selectedPageId: "page-1",
        selectedLayerId: "layer-1",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...props} />);
      
      act(() => {
        mockTreeConfig.onChange([null]);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        "LayersTree onChange: Invalid layer structure - ID mismatch",
        { updatedPageLayer: null, selectedPageId: "page-1" }
      );
      
      consoleSpy.mockRestore();
    });

    it("handles layers with mixed children array processing", () => {
      const mixedChildrenLayer: ComponentLayer = {
        id: "mixed-children-page",
        name: "Mixed Children Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "text-child",
            name: "Text Child",
            type: "span",
            props: {},
            children: "Hello World"
          },
          {
            id: "nested-child",
            name: "Nested Child",
            type: "div",
            props: {},
            children: [
              {
                id: "deeply-nested",
                name: "Deeply Nested",
                type: "p",
                props: {},
                children: "More text"
              }
            ]
          }
        ]
      };

      const mixedProps = {
        layers: [mixedChildrenLayer],
        selectedPageId: "mixed-children-page",
        selectedLayerId: "text-child",
        updateLayer: mockUpdateLayer,
        selectLayer: mockSelectLayer,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
      };

      render(<LayersTree {...mixedProps} />);
      
      expect(screen.getByTestId("layers-tree")).toBeInTheDocument();
      expect(screen.getByTestId("rendered-tree")).toBeInTheDocument();
    });
  });
}); 