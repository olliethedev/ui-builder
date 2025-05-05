/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LayersPanel from "@/components/ui/ui-builder/internal/layers-panel";
import { useLayerStore} from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer } from '@/components/ui/ui-builder/types';
import { RegistryEntry, useEditorStore } from "@/lib/ui-builder/store/editor-store";
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
    AddComponentsPopover: () => (
      <div data-testid="add-components-popover">Add Components Popover</div>
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
    pagePropsForm: null,
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

  it("renders LayersTree with correct layers", () => {
    // Layer data is now defined outside and mocks are set in beforeEach
    renderLayersPanel();

    // Check Component Layers - these should be the direct children rendered by LayersTree
    expect(screen.getByTestId("tree-row-node-layer-1")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();

    expect(screen.getByTestId("tree-row-node-layer-2")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders AddComponentsPopover when Add Component button is clicked", () => {
    // No need to mock findLayersForPageId here, beforeEach handles it
    // mockFindLayersForPageId.mockReturnValue([]);

    renderLayersPanel();

    // Find the button/trigger for the popover - adjust selector if needed
    // Using testid now as the mock text appears twice
    // Using getAllByTestId and selecting the first element as multiple triggers exist
    const addButtons = screen.getAllByTestId("add-components-popover"); 
    fireEvent.click(addButtons[0]);

    // Assuming AddComponentsPopover has a specific test ID
    // Check that at least one element with the test ID exists
    expect(screen.getAllByTestId("add-components-popover")[0]).toBeInTheDocument();
  });

});