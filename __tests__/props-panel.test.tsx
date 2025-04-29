/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropsPanel from "@/components/ui/ui-builder/internal/props-panel";
import {
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer } from "@/lib/ui-builder/store/layer-store";
import { z } from "zod";
import { RegistryEntry, useEditorStore } from "@/lib/ui-builder/store/editor-store";

// Mock dependencies
jest.mock("../lib/ui-builder/store/layer-store", () => ({
  useLayerStore: jest.fn(),
}));

// Add mock for editor store
jest.mock("../lib/ui-builder/store/editor-store", () => ({
  useEditorStore: jest.fn(),
}));

// jest.mock("@/components/ui/auto-form", () => ({
//   __esModule: true,
//   default: ({ children, ...props }: any) => (
//     <form data-testid="auto-form" {...props}>
//       {children}
//     </form>
//   ),
// }));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid={`button-${children}`} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children }: any) => <label data-testid="label">{children}</label>,
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ ...props }: any) => <input data-testid="input" {...props} />,
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({ ...props }: any) => (
    <textarea data-testid="textarea" {...props} />
  ),
}));

describe("PropsPanel", () => {
  const mockedUseLayerStore = useLayerStore as unknown as jest.Mock;
  const mockedUseEditorStore = useEditorStore as unknown as jest.Mock;

  const mockRemoveLayer = jest.fn();
  const mockDuplicateLayer = jest.fn();
  const mockUpdateLayer = jest.fn();
  const mockFindLayerById = jest.fn();
  const mockAddComponentLayer = jest.fn();
  const mockGetComponentDefinition = jest.fn();

  const mockRegistry: Record<string, RegistryEntry<any>> = {
    Button: {
      schema: z.object({
        label: z.string().default("ollie"),
        className: z.string().optional(),
      }),
      from: "@/components/ui/button",
      component: ({ children, ...props }: any) => (
        <button data-testid={`button-${children}`} {...props}>
          {children}
        </button>
      ),
    },
    Input: {
      schema: z.object({
        placeholder: z.string().default("input"),
      }),
      from: "@/components/ui/input",
      component: ({ ...props }: any) => (
        <input data-testid="input" {...props} />
      ),
    },
    Textarea: {
      schema: z.object({
        placeholder: z.string().default("textarea"),
      }),
      from: "@/components/ui/textarea",
      component: ({ ...props }: any) => (
        <textarea data-testid="textarea" {...props} />
      ),
    },
    Badge: {
      schema: z.object({
        label: z.string().default("New Badge"),
      }),
      from: "@/components/ui/badge",
      component: ({ children, ...props }: any) => (
        <span data-testid="badge" {...props}>
          {children}
        </span>
      ),
    },
  };

  const mockLayerState = {
    selectedLayerId: "layer-1",
    findLayerById: mockFindLayerById,
    removeLayer: mockRemoveLayer,
    duplicateLayer: mockDuplicateLayer,
    updateLayer: mockUpdateLayer,
    addComponentLayer: mockAddComponentLayer,
  };

  const mockEditorState = {
    registry: mockRegistry,
    getComponentDefinition: mockGetComponentDefinition,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseLayerStore.mockImplementation((selector) => selector(mockLayerState));
    mockedUseEditorStore.mockImplementation((selector) => selector(mockEditorState));
    mockGetComponentDefinition.mockImplementation((type: string) => mockRegistry[type]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPropsPanel = () => {
    const { container } = render(<PropsPanel className="test-class" />);
    return { container };
  };

  describe("PropsPanelForm", () => {
    it("should not call updateLayer on initial render", () => {
      const componentLayer: ComponentLayer = {
        id: "layer-5",
        type: "Badge",
        name: "Test Badge",
        props: { label: "New Badge" },
        children: [],
      };

      mockFindLayerById.mockReturnValue(componentLayer);
      renderPropsPanel();

      expect(mockUpdateLayer).not.toHaveBeenCalled();
    });

    it("should merge changed fields correctly", async () => {
      const componentLayer: ComponentLayer = {
        id: "layer-6",
        type: "Button",
        name: "Merge Button",
        props: { className: "merge-class", label: "Original Label" },
        children: [],
      };

      mockFindLayerById.mockReturnValue(componentLayer);
      const { container } = renderPropsPanel();
      
      let labelInput: HTMLElement | null = null;
      await waitFor(() => {
        labelInput = container.querySelector('input[name="label"]');
        expect(labelInput).toBeInTheDocument();
      });

      await userEvent.clear(labelInput!);
      await userEvent.type(labelInput!, "Updated Label", { delay: 0 });

      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenLastCalledWith("layer-6", {
          label: "Updated Label",
          className: "merge-class",
        }, undefined);
      });
    });

    it('should call removeLayer when Delete Component button is clicked', () => {
      const selectedLayer = { id: 'layer1', type: 'Button', props: {} };
      mockFindLayerById.mockReturnValue(selectedLayer);
  
      render(<PropsPanel />);
  
      const deleteButton = screen.getByText('Delete Component');
      fireEvent.click(deleteButton);
  
      expect(mockRemoveLayer).toHaveBeenCalledWith('layer1');
    });
  
    it('should call duplicateLayer when Duplicate Component button is clicked', async () => {
      const selectedLayer = { id: 'layer1', type: 'Button', props: {} };
      mockFindLayerById.mockReturnValue(selectedLayer);
  
      render(<PropsPanel />);
  
      const duplicateButton = screen.getByText('Duplicate Component');
      fireEvent.click(duplicateButton);
  
      expect(mockDuplicateLayer).toHaveBeenCalledWith('layer1');
    });

    it("should render the form", async () => {
      const { container } = render(<PropsPanel />);
      await waitFor(() => {
        expect(container.querySelector('form')).toBeInTheDocument();
        expect(container.querySelector('input[name="label"]')).toBeInTheDocument();
      });
    });

    it("should display the duplicate and delete buttons", async () => {
      const { container } = renderPropsPanel();
      let labelInput: HTMLElement | null = null;
      await waitFor(() => {
        labelInput = container.querySelector('input[name="label"]');
        expect(labelInput).toBeInTheDocument();
      });

      userEvent.clear(labelInput!);
      userEvent.type(labelInput!, "New Label", { delay: 0 });

      renderPropsPanel();

      expect(screen.queryByTestId("auto-form")).not.toBeInTheDocument();
    });

    it("should handle rapid consecutive updates correctly", async () => {
      const componentLayer: ComponentLayer = {
        id: "layer-4",
        type: "Button",
        name: "Fast Button",
        props: { className: "fast-button-class", label: "Click Quickly" },
        children: [],
      };

      mockFindLayerById.mockReturnValue(componentLayer);
      const { container } = renderPropsPanel();

      let labelInput: HTMLElement | null = null;
      await waitFor(() => {
        labelInput = container.querySelector('input[name="label"]');
        expect(labelInput).toBeInTheDocument();
      });

      await userEvent.clear(labelInput!);
      await userEvent.type(labelInput!, "Type Fast", { delay: 0 });
      await userEvent.clear(labelInput!);
      await userEvent.type(labelInput!, "Type Faster", { delay: 0 });
      await userEvent.clear(labelInput!);
      await userEvent.type(labelInput!, "Type Fastest", { delay: 0 });

      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenLastCalledWith("layer-4", {
          label: "Type Fastest",
          className: "fast-button-class",
        }, undefined);
      });
    });
  });

  describe("when no layer is selected", () => {
    beforeEach(() => {
      mockedUseLayerStore.mockImplementation((selector) => selector({
        selectedLayerId: null,
        findLayerById: jest.fn().mockReturnValue(null),
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
        updateLayer: mockUpdateLayer,
      }));
      mockedUseEditorStore.mockImplementation((selector) => selector(mockEditorState));
      renderPropsPanel();
    });

    it("should display 'No component selected' message", () => {
      expect(screen.getByText("Component Properties")).toBeInTheDocument();
      expect(screen.getByText("No component selected")).toBeInTheDocument();
    });

    it("should not render PropsPanelForm", () => {
      expect(screen.queryByTestId("auto-form")).not.toBeInTheDocument();
    });
  });

  describe("when a component layer is selected", () => {
    const componentLayer: ComponentLayer = {
      id: "layer-1",
      type: "Button",
      name: "Test Button",
      props: { className: "button-class", label: "Click Me" },
      children: [],
    };

    beforeEach(() => {
      mockFindLayerById.mockReturnValue(componentLayer);
      renderPropsPanel();
    });

    it("should display the component name and type", () => {
      expect(screen.getByText("Test Button Properties")).toBeInTheDocument();
      expect(screen.getByText("Type: Button")).toBeInTheDocument();
    });

    it("should render the form", async () => {
      const { container } = render(<PropsPanel />);
      await waitFor(() => {
        expect(container.querySelector('form')).toBeInTheDocument();
        expect(container.querySelector('input[name="label"]')).toBeInTheDocument();
      });
    });

    it("should display the duplicate and delete buttons", () => {
      expect(
        screen.getByTestId("button-Duplicate Component")
      ).toBeInTheDocument();
      expect(screen.getByTestId("button-Delete Component")).toBeInTheDocument();
    });

    it("should update layer properties on form change", async () => {
      const { container } = renderPropsPanel();
      let labelInput: HTMLElement | null = null;
      await waitFor(() => {
        labelInput = container.querySelector('input[name="label"]');
        expect(labelInput).toBeInTheDocument();
      });

      userEvent.clear(labelInput!);
      userEvent.type(labelInput!, "New Label", { delay: 0 });

      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenLastCalledWith(
          "layer-1",
          {
            label: "New Label",
            className: "button-class",
          },
          undefined
        );
      });
    });
  });

  describe("edge cases", () => {
    it("should handle undefined selectedLayer gracefully", () => {
      mockFindLayerById.mockReturnValue(undefined);
      mockedUseLayerStore.mockImplementation((selector) => selector({
        selectedLayerId: "non-existent-layer",
        findLayerById: mockFindLayerById,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
        updateLayer: mockUpdateLayer,
      }));
      mockedUseEditorStore.mockImplementation((selector) => selector(mockEditorState));
      renderPropsPanel();

      expect(screen.getByText("Component Properties")).toBeInTheDocument();
      expect(screen.getByText("No component selected")).toBeInTheDocument();
      expect(screen.queryByTestId("auto-form")).not.toBeInTheDocument();
    });

    it("should handle unknown component types gracefully", () => {
      const unknownComponentLayer: ComponentLayer = {
        id: "layer-unknown",
        type: "UnknownComponent",
        name: "Unknown Test Component",
        props: {},
        children: [],
      };

      // Mock findLayerById to return the unknown component layer
      mockFindLayerById.mockReturnValue(unknownComponentLayer);
      
      // Ensure getComponentDefinition returns undefined for the unknown type
      mockGetComponentDefinition.mockImplementation((type: string) => {
        if (type === "UnknownComponent") {
          return undefined;
        }
        return mockRegistry[type];
      });
      
      // Reset layer store mock to use the updated findLayerById
      mockedUseLayerStore.mockImplementation((selector) => selector({
        selectedLayerId: "layer-unknown",
        findLayerById: mockFindLayerById,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
        updateLayer: mockUpdateLayer,
      }));
      mockedUseEditorStore.mockImplementation((selector) => selector(mockEditorState));

      renderPropsPanel();

      // Because the component type is unknown, the entire panel should render null
      expect(screen.queryByText("Unknown Test Component Properties")).not.toBeInTheDocument();
      expect(screen.queryByText("Type: UnknownComponent")).not.toBeInTheDocument();
      expect(screen.queryByTestId("auto-form")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-Duplicate Component")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-Delete Component")).not.toBeInTheDocument();
    });

    it("should handle rapid consecutive updates correctly", async () => {
      const componentLayer: ComponentLayer = {
        id: "layer-4",
        type: "Button",
        name: "Fast Button",
        props: { className: "fast-button-class", label: "Click Quickly" },
        children: [],
      };

      mockFindLayerById.mockReturnValue(componentLayer);
      const { container } = renderPropsPanel();

      let labelInput: HTMLElement | null = null;
      await waitFor(() => {
        labelInput = container.querySelector('input[name="label"]');
        expect(labelInput).toBeInTheDocument();
      });

      await userEvent.clear(labelInput!);
      await userEvent.type(labelInput!, "Type Fast", { delay: 0 });
      await userEvent.clear(labelInput!);
      await userEvent.type(labelInput!, "Type Faster", { delay: 0 });
      await userEvent.clear(labelInput!);
      await userEvent.type(labelInput!, "Type Fastest", { delay: 0 });

      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenLastCalledWith("layer-4", {
          label: "Type Fastest",
          className: "fast-button-class",
        }, undefined);
      });
    });
  });
});
