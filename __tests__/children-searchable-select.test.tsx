import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChildrenSearchableSelect } from "@/components/ui/ui-builder/internal/form-fields/children-searchable-select";
import { ComponentLayer } from "@/components/ui/ui-builder/types";

// Mock the layer store
const mockSelectLayer = jest.fn();
const mockRemoveLayer = jest.fn();
const mockFindLayerById = jest.fn();

jest.mock("@/lib/ui-builder/store/layer-store", () => ({
  useLayerStore: () => ({
    selectLayer: mockSelectLayer,
    removeLayer: mockRemoveLayer,
    selectedLayerId: "selected-layer-id",
    findLayerById: mockFindLayerById,
  }),
}));

// Mock the AddComponentsPopover
jest.mock("@/components/ui/ui-builder/internal/components/add-component-popover", () => ({
  AddComponentsPopover: ({ children, onChange, parentLayerId }: any) => (
    <div data-testid="add-components-popover" data-parent-layer-id={parentLayerId}>
      <button 
        onClick={() => onChange({ layerType: "Button", parentLayerId })}
        data-testid="mock-add-component"
      >
        Mock Add Component
      </button>
      {children}
    </div>
  ),
}));

// Mock the layer utils
jest.mock("@/lib/ui-builder/store/layer-utils", () => ({
  hasLayerChildren: jest.fn(),
}));

import { hasLayerChildren } from "@/lib/ui-builder/store/layer-utils";
const mockHasLayerChildren = hasLayerChildren as jest.MockedFunction<typeof hasLayerChildren>;

describe("ChildrenSearchableSelect", () => {
  const mockOnChange = jest.fn();

  const mockLayer: ComponentLayer = {
    id: "parent-layer",
    type: "div",
    name: "Parent Layer",
    props: {},
    children: [
      {
        id: "child-1",
        type: "button",
        name: "Child Button",
        props: {},
        children: [],
      },
      {
        id: "child-2",
        type: "span",
        name: "Child Span",
        props: {},
        children: [],
      },
    ],
  };

  const mockSelectedLayer: ComponentLayer = {
    id: "selected-layer-id",
    type: "div",
    name: "Selected Layer",
    props: {},
    children: [
      {
        id: "selected-child-1",
        type: "input",
        name: "Selected Input",
        props: {},
        children: [],
      },
      {
        id: "selected-child-2",
        type: "label",
        name: "", // Test empty name
        props: {},
        children: [],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindLayerById.mockReturnValue(mockSelectedLayer);
    mockHasLayerChildren.mockImplementation((layer: ComponentLayer) => {
      return Array.isArray(layer.children) && typeof layer.children !== 'string';
    });
  });

  it("renders add component button", () => {
    render(
      <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Add Component")).toBeInTheDocument();
  });

  it("renders AddComponentsPopover with correct parentLayerId", () => {
    render(
      <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
    );

    const popover = screen.getByTestId("add-components-popover");
    expect(popover).toHaveAttribute("data-parent-layer-id", "parent-layer");
  });

  it("calls onChange when adding a component through popover", async () => {
    const user = userEvent.setup();
    render(
      <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
    );

    const addButton = screen.getByTestId("mock-add-component");
    await user.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      layerType: "Button",
      parentLayerId: "parent-layer",
    });
  }, 10000);

  it("renders child layer badges when layer has children", () => {
    render(
      <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
    );

    expect(screen.getByText("Selected Input")).toBeInTheDocument();
    expect(screen.getByText("label")).toBeInTheDocument(); // Empty name falls back to type
  });

  it("does not render child badges when layer has no children", () => {
    const layerWithStringChildren = { ...mockLayer, children: "text content" };
    mockFindLayerById.mockReturnValue({ ...mockSelectedLayer, children: "text content" });
    
    render(
      <ChildrenSearchableSelect layer={layerWithStringChildren} onChange={mockOnChange} />
    );

    expect(screen.queryByText("Selected Input")).not.toBeInTheDocument();
  });

  it("does not render child badges when no selected layer", () => {
    mockFindLayerById.mockReturnValue(null);
    
    render(
      <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
    );

    expect(screen.queryByText("Selected Input")).not.toBeInTheDocument();
  });

  it("does not render child badges when selected layer has no children", () => {
    const layerWithoutChildren = { ...mockSelectedLayer, children: [] };
    mockFindLayerById.mockReturnValue(layerWithoutChildren);
    
    render(
      <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
    );

    expect(screen.queryByText("Selected Input")).not.toBeInTheDocument();
  });

  it("calls selectLayer when child badge is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
    );

    const childButton = screen.getByText("Selected Input");
    await user.click(childButton);

    expect(mockSelectLayer).toHaveBeenCalledWith("selected-child-1");
  });

  it("calls removeLayer when remove button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
    );

    // Find all remove buttons (X icons)
    const removeButtons = screen.getAllByRole("button");
    const removeButton = removeButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('class')?.includes('size-6')
    );
    
    expect(removeButton).toBeInTheDocument();
    await user.click(removeButton!);

    expect(mockRemoveLayer).toHaveBeenCalledWith("selected-child-1");
  });

  describe("nameForLayer", () => {
    it("uses layer name when available", () => {
      render(
        <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
      );

      expect(screen.getByText("Selected Input")).toBeInTheDocument();
    });

    it("falls back to type when name is empty", () => {
      render(
        <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
      );

      expect(screen.getByText("label")).toBeInTheDocument(); // Second child has empty name
    });

    it("replaces underscores in type names", () => {
      const layerWithUnderscores: ComponentLayer = {
        id: "underscore-layer",
        type: "custom_button_type",
        name: "",
        props: {},
        children: [],
      };

      const selectedLayerWithUnderscores = {
        ...mockSelectedLayer,
        children: [layerWithUnderscores],
      };

      mockFindLayerById.mockReturnValue(selectedLayerWithUnderscores);
      
      render(
        <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
      );

      expect(screen.getByText("custombuttontype")).toBeInTheDocument();
    });
  });

  it("renders correct button styling for child badges", () => {
    render(
      <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
    );

    const nameButton = screen.getByText("Selected Input");
    expect(nameButton).toHaveClass("p-0", "h-5");

    const removeButtons = screen.getAllByRole("button");
    const removeButton = removeButtons.find(button => 
      button.getAttribute('class')?.includes('size-6')
    );
    expect(removeButton).toHaveClass("p-0", "size-6", "rounded-full");
  });

  it("has correct accessibility attributes", () => {
    render(
      <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
    );

    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveAttribute("role", "combobox");
    expect(combobox).toHaveClass("w-full", "justify-between");
  });

  it("renders chevron icon in add component button", () => {
    render(
      <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
    );

    const button = screen.getByRole("combobox");
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it("handles empty children array", () => {
    const emptySelectedLayer = { ...mockSelectedLayer, children: [] };
    mockFindLayerById.mockReturnValue(emptySelectedLayer);
    
    render(
      <ChildrenSearchableSelect layer={mockLayer} onChange={mockOnChange} />
    );

    // Should still render the add component button
    expect(screen.getByText("Add Component")).toBeInTheDocument();
    // But no child badges
    expect(screen.queryByText("Selected Input")).not.toBeInTheDocument();
  });
});