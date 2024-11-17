/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LayersPanel from "@/components/ui/ui-builder/internal/layers-panel";
import { Layer, useLayerStore} from "@/lib/ui-builder/store/layer-store";

// Mock dependencies
jest.mock("../lib/ui-builder/store/layer-store", () => ({
  useLayerStore: jest.fn(),
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
  TreeRowNode: ({ node }: { node: Layer }) => (
    <div data-testid={`tree-row-node-${node.id}`}>{node.name}</div>
  ),
  TreeRowPlaceholder: () => <div data-testid="tree-row-placeholder" />,
}));

describe("LayersPanel", () => {
  const mockedUseLayerStore = useLayerStore as unknown as jest.Mock;

  const mockSelectLayer = jest.fn();
  const mockFindLayersForPageId = jest.fn();
  const mockUpdateLayer = jest.fn();
  const mockRemoveLayer = jest.fn();
  const mockDuplicateLayer = jest.fn();

  const mockState = {
    selectedPageId: "page-1",
    selectedLayerId: "layer-1",
    findLayersForPageId: mockFindLayersForPageId,
    updateLayer: mockUpdateLayer,
    selectLayer: mockSelectLayer,
    removeLayer: mockRemoveLayer,
    duplicateLayer: mockDuplicateLayer,
  };

  beforeEach(() => {
    mockedUseLayerStore.mockReturnValue(mockState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderLayersPanel = () => {
    render(<LayersPanel className="test-class" />);
  };

  it("renders LayersTree with correct layers", () => {
    const layers: Layer[] = [
      {
        id: "page-1",
        name: "Home Page",
        type: "_page_",
        props: {},
        children: [
          {
            id: "layer-1",
            name: "Header",
            type: "HeaderComponent", // Assuming "HeaderComponent" is a key in componentRegistry
            props: { /* component-specific props */ },
            children: [],
          },
          {
            id: "layer-2",
            name: "Footer",
            type: "FooterComponent", // Assuming "FooterComponent" is a key in componentRegistry
            props: { /* component-specific props */ },
            children: [],
          },
        ],
      },
    ] satisfies Layer[];

    mockFindLayersForPageId.mockReturnValue(layers);

    renderLayersPanel();

    // Check Page Layer
    expect(screen.getByTestId("tree-row-node-page-1")).toBeInTheDocument();
    expect(screen.getByText("Home Page")).toBeInTheDocument();

    // Check Component Layers
    expect(screen.getByTestId("tree-row-node-layer-1")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();

    expect(screen.getByTestId("tree-row-node-layer-2")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders AddComponentsPopover when Add Component button is clicked", () => {
    mockFindLayersForPageId.mockReturnValue([]);

    renderLayersPanel();

    const addButton = screen.getByText("Add Components Popover");
    fireEvent.click(addButton);

    // Assuming AddComponentsPopover has a specific test ID
    expect(screen.getByTestId("add-components-popover")).toBeInTheDocument();
  });


});