/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropsPanel from "@/components/ui/ui-builder/internal/props-panel";
import {
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { RegistryEntry, ComponentLayer } from '@/components/ui/ui-builder/types';
import { z } from "zod";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";

// Mock dependencies
jest.mock("@/lib/ui-builder/store/layer-store", () => ({
  useLayerStore: jest.fn(),
}));

// Add mock for editor store
jest.mock("@/lib/ui-builder/store/editor-store", () => ({
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
    variables: [],
  };

  const mockEditorState = {
    registry: mockRegistry,
    getComponentDefinition: mockGetComponentDefinition,
    revisionCounter: 0,
  };

  beforeAll(() => {
    (useLayerStore as any).getState = jest.fn(() => mockLayerState);
    
    mockedUseLayerStore.mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(mockLayerState);
      }
      if (selector === undefined) {
        return mockLayerState;
      }
      throw new Error("useLayerStore called with invalid argument");
    });
    mockedUseEditorStore.mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(mockEditorState);
      }
      if (selector === undefined) {
        return mockEditorState;
      }
      throw new Error("useEditorStore called with invalid argument");
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useLayerStore as any).getState = jest.fn(() => mockLayerState);
    
    mockedUseLayerStore.mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(mockLayerState);
      }
      if (selector === undefined) {
        return mockLayerState;
      }
      throw new Error("useLayerStore called with invalid argument");
    });
    mockedUseEditorStore.mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(mockEditorState);
      }
      if (selector === undefined) {
        return mockEditorState;
      }
      throw new Error("useEditorStore called with invalid argument");
    });
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
      const noLayerState = {
        selectedLayerId: null,
        findLayerById: jest.fn().mockReturnValue(null),
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
        updateLayer: mockUpdateLayer,
        variables: [],
      };
      
      (useLayerStore as any).getState = jest.fn(() => noLayerState);
      
      mockedUseLayerStore.mockImplementation((selector) => selector(noLayerState));
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
      const undefinedLayerState = {
        selectedLayerId: "non-existent-layer",
        findLayerById: mockFindLayerById,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
        updateLayer: mockUpdateLayer,
        variables: [],
      };
      
      (useLayerStore as any).getState = jest.fn(() => undefinedLayerState);
      
      mockedUseLayerStore.mockImplementation((selector) => selector(undefinedLayerState));
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
      const unknownComponentState = {
        selectedLayerId: "layer-unknown",
        findLayerById: mockFindLayerById,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
        updateLayer: mockUpdateLayer,
        variables: [], // Add variables for consistency
      };
      
      (useLayerStore as any).getState = jest.fn(() => unknownComponentState);
      
      mockedUseLayerStore.mockImplementation((selector) => selector(unknownComponentState));
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

  describe("Variable Functionality", () => {
    const mockVariables = [
      { id: 'var1', name: 'userName', type: 'string', defaultValue: 'John Doe' },
      { id: 'var2', name: 'userAge', type: 'number', defaultValue: 25 },
      { id: 'var3', name: 'isActive', type: 'boolean', defaultValue: true },
    ];

    beforeEach(() => {
      // Update the layer state to include variables
      const layerStateWithVariables = {
        ...mockLayerState,
        variables: mockVariables,
      };
      
      (useLayerStore as any).getState = jest.fn(() => layerStateWithVariables);
      
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(layerStateWithVariables);
        }
        if (selector === undefined) {
          return layerStateWithVariables;
        }
        throw new Error("useLayerStore called with invalid argument");
      });
    });

    it("should preserve variable references when updating other props", async () => {
      const componentLayer: ComponentLayer = {
        id: "layer-with-vars",
        type: "Button",
        name: "Variable Button",
        props: { 
          label: { __variableRef: 'var1' }, // Variable reference
          className: "button-class" // Regular prop
        },
        children: [],
      };

      mockFindLayerById.mockReturnValue(componentLayer);
      const { container } = renderPropsPanel();

      // Wait for form to render
      let classNameInput: HTMLElement | null = null;
      await waitFor(() => {
        classNameInput = container.querySelector('input[name="className"]');
        expect(classNameInput).toBeInTheDocument();
      });

      // Update the className (non-variable prop)
      await userEvent.clear(classNameInput!);
      await userEvent.type(classNameInput!, "updated-class", { delay: 0 });

      await waitFor(() => {
        // Should preserve the variable reference for label
        expect(mockUpdateLayer).toHaveBeenLastCalledWith("layer-with-vars", {
          label: { __variableRef: 'var1' }, // Variable reference preserved
          className: "updated-class", // Regular prop updated
        }, undefined);
      });
    });

    it("should resolve variable references for display in form", async () => {
      const componentLayer: ComponentLayer = {
        id: "layer-with-vars",
        type: "Button",
        name: "Variable Button",
        props: { 
          label: { __variableRef: 'var1' }, // Should resolve to 'John Doe'
          className: "button-class"
        },
        children: [],
      };

      mockFindLayerById.mockReturnValue(componentLayer);
      const { container } = renderPropsPanel();

      // Wait for form to render and check that variable is resolved for display
      await waitFor(() => {
        const labelInput = container.querySelector('input[name="label"]') as HTMLInputElement;
        expect(labelInput).toBeInTheDocument();
        // The form should display the resolved value, not the variable reference
        expect(labelInput.value).toBe('John Doe');
      });
    });

    it("should handle missing variable references gracefully", async () => {
      const componentLayer: ComponentLayer = {
        id: "layer-with-missing-var",
        type: "Button",
        name: "Missing Variable Button",
        props: { 
          label: { __variableRef: 'nonexistent' }, // Missing variable
          className: "button-class"
        },
        children: [],
      };

      mockFindLayerById.mockReturnValue(componentLayer);
      const { container } = renderPropsPanel();

      // Should handle missing variable gracefully
      await waitFor(() => {
        const labelInput = container.querySelector('input[name="label"]') as HTMLInputElement;
        expect(labelInput).toBeInTheDocument();
        // Should show empty or undefined value for missing variable
        expect(labelInput.value).toBe('');
      });
    });

    it("should handle nested variable references", async () => {
      const componentLayer: ComponentLayer = {
        id: "layer-with-nested-vars",
        type: "Button",
        name: "Nested Variable Button",
        props: { 
          config: {
            user: {
              name: { __variableRef: 'var1' },
              age: { __variableRef: 'var2' }
            },
            active: { __variableRef: 'var3' }
          },
          className: "button-class"
        },
        children: [],
      };

      mockFindLayerById.mockReturnValue(componentLayer);
      renderPropsPanel();

      // The component should handle nested variable resolution without errors
      await waitFor(() => {
        expect(screen.queryByText("Nested Variable Button Properties")).toBeInTheDocument();
      });
    });

    it("should not override variable references when form values change", async () => {
      const componentLayer: ComponentLayer = {
        id: "layer-protected-vars",
        type: "Button", 
        name: "Protected Variable Button",
        props: { 
          label: { __variableRef: 'var1' }, // This should be protected
          className: "original-class"
        },
        children: [],
      };

      mockFindLayerById.mockReturnValue(componentLayer);
      const { container } = renderPropsPanel();

      // Try to update className
      let classNameInput: HTMLElement | null = null;
      await waitFor(() => {
        classNameInput = container.querySelector('input[name="className"]');
        expect(classNameInput).toBeInTheDocument();
      });

      await userEvent.clear(classNameInput!);
      await userEvent.type(classNameInput!, "new-class", { delay: 0 });

      await waitFor(() => {
        // Variable reference should be preserved, only className should change
        expect(mockUpdateLayer).toHaveBeenLastCalledWith("layer-protected-vars", {
          label: { __variableRef: 'var1' }, // Still a variable reference
          className: "new-class", // Updated value
        }, undefined);
      });
    });

    it("should handle different variable types correctly", async () => {
      const componentLayer: ComponentLayer = {
        id: "layer-multi-type-vars",
        type: "Button",
        name: "Multi Type Variables",
        props: { 
          label: { __variableRef: 'var1' }, // string
          count: { __variableRef: 'var2' }, // number  
          enabled: { __variableRef: 'var3' }, // boolean
          className: "static-class"
        },
        children: [],
      };

      mockFindLayerById.mockReturnValue(componentLayer);
      renderPropsPanel();

      // Should render without errors and preserve all variable types
      await waitFor(() => {
        expect(screen.queryByText("Multi Type Variables Properties")).toBeInTheDocument();
      });
    });
  });
});
