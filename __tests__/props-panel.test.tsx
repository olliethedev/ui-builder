/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropsPanel from "@/components/ui/ui-builder/internal/props-panel";
import {
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import type { RegistryEntry, ComponentLayer } from '@/components/ui/ui-builder/types';
import { textInputFieldOverrides, functionPropFieldOverrides, commonFieldOverrides } from '@/lib/ui-builder/registry/form-field-overrides';
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

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: any) => children,
  TooltipTrigger: ({ children }: any) => children,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => children,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
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
      fieldOverrides: {
        label: (layer: ComponentLayer) => textInputFieldOverrides(layer, true, 'label'),
      },
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

  const mockBindPropToVariable = jest.fn();
  const mockUnbindPropFromVariable = jest.fn();
  const mockIsBindingImmutable = jest.fn().mockReturnValue(false);

  const mockLayerState = {
    selectedLayerId: "layer-1",
    findLayerById: mockFindLayerById,
    removeLayer: mockRemoveLayer,
    duplicateLayer: mockDuplicateLayer,
    updateLayer: mockUpdateLayer,
    addComponentLayer: mockAddComponentLayer,
    bindPropToVariable: mockBindPropToVariable,
    unbindPropFromVariable: mockUnbindPropFromVariable,
    isBindingImmutable: mockIsBindingImmutable,
    variables: [],
    isLayerAPage: jest.fn().mockReturnValue(false),
  };

  const mockIncrementRevision = jest.fn();

  const mockEditorState = {
    registry: mockRegistry,
    getComponentDefinition: mockGetComponentDefinition,
    incrementRevision: mockIncrementRevision,
    revisionCounter: 0,
    allowPagesCreation: true,
    allowPagesDeletion: true,
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
    mockBindPropToVariable.mockClear();
    mockUnbindPropFromVariable.mockClear();
    mockIsBindingImmutable.mockReturnValue(false);
    mockIncrementRevision.mockClear();
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
      }, { timeout: 10000 });

      // Use fireEvent for more reliable input changes
      fireEvent.change(labelInput!, { target: { value: "Updated Label" } });

      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenLastCalledWith("layer-6", {
          label: "Updated Label",
          className: "merge-class",
        }, undefined);
      }, { timeout: 10000 });
    }, 15000);

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
        isLayerAPage: jest.fn().mockReturnValue(false),
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
        screen.getByTestId("button-Duplicate ,Component")
      ).toBeInTheDocument();
      expect(screen.getByTestId("button-Delete ,Component")).toBeInTheDocument();
    });

    it("should update layer properties on form change", () => {
      const labelInput = screen.getByDisplayValue("Click Me");
      
      fireEvent.change(labelInput, { target: { value: "New Label" } });
      
      // Allow for either 2 or 3 parameters (the third being undefined)
      expect(mockUpdateLayer).toHaveBeenCalledWith("layer-1", {
        label: "New Label",
        className: "button-class",
      }, undefined);
    });

    it("should hide delete button when allowPagesDeletion is false for page layers", () => {
      // Mock isLayerAPage to return true (this is a page layer)
      const pageLayerState = {
        ...mockLayerState,
        isLayerAPage: jest.fn().mockReturnValue(true),
      };
      
      // Mock editor state with allowPagesDeletion: false
      const restrictedEditorState = {
        ...mockEditorState,
        allowPagesDeletion: false,
      };

      (useLayerStore as any).getState = jest.fn(() => pageLayerState);
      
      // Fix the selector pattern implementation
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(pageLayerState);
        }
        return pageLayerState;
      });
      
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(restrictedEditorState);
        }
        return restrictedEditorState;
      });

      renderPropsPanel();

      // Duplicate button should still be visible (allowPagesCreation is still true)
      expect(screen.getByTestId("button-Duplicate ,Page")).toBeInTheDocument();
      // Delete button should be hidden
      expect(screen.queryByTestId("button-Delete ,Page")).not.toBeInTheDocument();
    });

    it("should hide duplicate button when allowPagesCreation is false for page layers", () => {
      // Mock isLayerAPage to return true (this is a page layer)
      const pageLayerState = {
        ...mockLayerState,
        isLayerAPage: jest.fn().mockReturnValue(true),
      };
      
      // Mock editor state with allowPagesCreation: false
      const restrictedEditorState = {
        ...mockEditorState,
        allowPagesCreation: false,
      };

      (useLayerStore as any).getState = jest.fn(() => pageLayerState);
      
      // Fix the selector pattern implementation
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(pageLayerState);
        }
        return pageLayerState;
      });
      
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(restrictedEditorState);
        }
        return restrictedEditorState;
      });

      renderPropsPanel();

      // Delete button should still be visible (allowPagesDeletion is still true)
      expect(screen.getByTestId("button-Delete ,Page")).toBeInTheDocument();
      // Duplicate button should be hidden
      expect(screen.queryByTestId("button-Duplicate ,Page")).not.toBeInTheDocument();
    });

    it("should hide both buttons when both permissions are false for page layers", () => {
      // Mock isLayerAPage to return true (this is a page layer)
      const pageLayerState = {
        ...mockLayerState,
        isLayerAPage: jest.fn().mockReturnValue(true),
      };
      
      // Mock editor state with both permissions false
      const restrictedEditorState = {
        ...mockEditorState,
        allowPagesCreation: false,
        allowPagesDeletion: false,
      };

      (useLayerStore as any).getState = jest.fn(() => pageLayerState);
      
      // Fix the selector pattern implementation
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(pageLayerState);
        }
        return pageLayerState;
      });
      
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(restrictedEditorState);
        }
        return restrictedEditorState;
      });

      renderPropsPanel();

      // Both buttons should be hidden
      expect(screen.queryByTestId("button-Duplicate ,Page")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-Delete ,Page")).not.toBeInTheDocument();
    });

    it("should show both buttons when permissions are false but layer is not a page", () => {
      // Clean up any previous renders
      cleanup();
      
      // Mock isLayerAPage to return false (this is not a page layer)
      const nonPageLayerState = {
        ...mockLayerState,
        isLayerAPage: jest.fn().mockReturnValue(false),
      };
      
      // Mock editor state with both permissions false
      const restrictedEditorState = {
        ...mockEditorState,
        allowPagesCreation: false,
        allowPagesDeletion: false,
      };

      (useLayerStore as any).getState = jest.fn(() => nonPageLayerState);
      
      // Fix the selector pattern implementation
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(nonPageLayerState);
        }
        return nonPageLayerState;
      });
      
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(restrictedEditorState);
        }
        return restrictedEditorState;
      });

      renderPropsPanel();

      // Both buttons should be visible for non-page layers regardless of page permissions
      expect(screen.getByTestId("button-Duplicate ,Component")).toBeInTheDocument();
      expect(screen.getByTestId("button-Delete ,Component")).toBeInTheDocument();
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
        isLayerAPage: jest.fn().mockReturnValue(false),
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
        isLayerAPage: jest.fn().mockReturnValue(false), // Add missing function
      };
      
      (useLayerStore as any).getState = jest.fn(() => unknownComponentState);
      
      mockedUseLayerStore.mockImplementation((selector) => selector(unknownComponentState));
      mockedUseEditorStore.mockImplementation((selector) => selector(mockEditorState));

      renderPropsPanel();

      // Because the component type is unknown, the entire panel should render null
      expect(screen.queryByText("Unknown Test Component Properties")).not.toBeInTheDocument();
      expect(screen.queryByText("Type: UnknownComponent")).not.toBeInTheDocument();
      expect(screen.queryByTestId("auto-form")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-Duplicate ,Component")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-Delete ,Component")).not.toBeInTheDocument();
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
        isLayerAPage: jest.fn().mockReturnValue(false),
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
      renderPropsPanel();

      // Wait for form to render and check that variable is resolved for display
      await waitFor(() => {
        // When a variable is bound, it shows the variable name and resolved value, not an input field
        expect(screen.getByText('userName')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('string')).toBeInTheDocument();
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
      renderPropsPanel();

      // Should handle missing variable gracefully by falling back to normal input
      await waitFor(() => {
        expect(screen.queryByText("Missing Variable Button Properties")).toBeInTheDocument();
        // Should render the form without crashing
        const classNameInput = screen.getByDisplayValue('button-class');
        expect(classNameInput).toBeInTheDocument();
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

    it('should show immutable indicator and hide unbind button for immutable bindings', () => {
      const testLayer: ComponentLayer = {
        id: 'test-layer',
        type: 'Button',
        name: 'Test Button',
        props: {
          label: { __variableRef: 'var1' },
          className: 'test-class'
        },
        children: [],
      };

      const layerStateWithImmutableBinding = {
        ...mockLayerState,
        variables: mockVariables,
        selectedLayerId: 'test-layer',
        findLayerById: jest.fn().mockReturnValue(testLayer),
        isBindingImmutable: jest.fn().mockImplementation((layerId: string, propName: string) => 
          layerId === 'test-layer' && propName === 'label'
        ),
        isLayerAPage: jest.fn().mockReturnValue(false),
      };

      (useLayerStore as any).getState = jest.fn(() => layerStateWithImmutableBinding);

      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(layerStateWithImmutableBinding);
        }
        return layerStateWithImmutableBinding;
      });

      render(<PropsPanel />);

      // The label field should show as bound to a variable
      expect(screen.getByText('userName')).toBeInTheDocument();
      
      // Should show the immutable indicator
      expect(screen.getByTestId('immutable-badge')).toBeInTheDocument();
      
      // Should not show the unbind button for immutable bindings
      const unbindButtons = screen.queryAllByRole('button');
      const unlinkButton = unbindButtons.find(button => 
        button.querySelector('svg[class*="lucide-unlink"]')
      );
      expect(unlinkButton).toBeUndefined();
    });

    it('should show unbind button for mutable bindings', () => {
      const testLayer: ComponentLayer = {
        id: 'test-layer',
        type: 'Button',
        name: 'Test Button',
        props: {
          label: { __variableRef: 'var1' },
          className: 'test-class'
        },
        children: [],
      };

      const layerStateWithMutableBinding = {
        ...mockLayerState,
        variables: mockVariables,
        selectedLayerId: 'test-layer',
        findLayerById: jest.fn().mockReturnValue(testLayer),
        isBindingImmutable: jest.fn().mockReturnValue(false), // All bindings are mutable
        isLayerAPage: jest.fn().mockReturnValue(false),
      };

      (useLayerStore as any).getState = jest.fn(() => layerStateWithMutableBinding);

      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(layerStateWithMutableBinding);
        }
        return layerStateWithMutableBinding;
      });

      render(<PropsPanel />);

      // The label field should show as bound to a variable
      expect(screen.getByText('userName')).toBeInTheDocument();
      
      // Should not show the immutable indicator
      expect(screen.queryByText('Immutable')).not.toBeInTheDocument();
      
      // Should show the unbind button for mutable bindings
      const unbindButtons = screen.queryAllByRole('button');
      const unlinkButton = unbindButtons.find(button => 
        button.querySelector('svg[class*="lucide-unlink"]')
      );
      expect(unlinkButton).toBeDefined();
      expect(unlinkButton).toBeInTheDocument();
    });
  });

  describe('Children Variable Binding UI', () => {
    const mockVariables = [
      { id: 'greeting-var', name: 'Greeting', type: 'string', defaultValue: 'Hello, World!' },
      { id: 'title-var', name: 'Page Title', type: 'string', defaultValue: 'Welcome' },
    ];

    // Registry with components that have children field with variable binding enabled
    const mockRegistryWithChildrenBinding: Record<string, RegistryEntry<any>> = {
      span: {
        schema: z.object({
          className: z.string().optional(),
          children: z.string().optional(),
        }),
        fieldOverrides: commonFieldOverrides(), // Has allowBinding=true by default
      },
    };

    it('should show binding UI when layer.children is a VariableReference', () => {
      const testLayer: ComponentLayer = {
        id: 'span-with-var-children',
        type: 'span',
        name: 'Greeting Text',
        props: {
          className: 'text-lg',
        },
        children: { __variableRef: 'greeting-var' }, // Variable reference in layer.children
      };

      const layerStateWithChildrenBinding = {
        ...mockLayerState,
        variables: mockVariables,
        selectedLayerId: 'span-with-var-children',
        findLayerById: jest.fn().mockReturnValue(testLayer),
        isChildrenBindingImmutable: jest.fn().mockReturnValue(false),
        isBindingImmutable: jest.fn().mockReturnValue(false),
        isLayerAPage: jest.fn().mockReturnValue(false),
        bindChildrenToVariable: jest.fn(),
        unbindChildrenFromVariable: jest.fn(),
      };

      const editorStateWithRegistry = {
        ...mockEditorState,
        registry: mockRegistryWithChildrenBinding,
      };

      (useLayerStore as any).getState = jest.fn(() => layerStateWithChildrenBinding);
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(layerStateWithChildrenBinding);
        }
        return layerStateWithChildrenBinding;
      });
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(editorStateWithRegistry);
        }
        return editorStateWithRegistry;
      });

      render(<PropsPanel />);

      // Should show the variable name in the binding UI
      expect(screen.getByText('Greeting')).toBeInTheDocument();
      
      // Should show the variable type
      expect(screen.getByText('string')).toBeInTheDocument();
      
      // Should show the resolved value
      expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    });

    it('should show unbind button for mutable children binding', () => {
      const testLayer: ComponentLayer = {
        id: 'span-mutable',
        type: 'span',
        name: 'Mutable Text',
        props: {},
        children: { __variableRef: 'greeting-var' },
      };

      const layerStateWithMutableChildrenBinding = {
        ...mockLayerState,
        variables: mockVariables,
        selectedLayerId: 'span-mutable',
        findLayerById: jest.fn().mockReturnValue(testLayer),
        isChildrenBindingImmutable: jest.fn().mockReturnValue(false),
        isBindingImmutable: jest.fn().mockReturnValue(false),
        isLayerAPage: jest.fn().mockReturnValue(false),
        bindChildrenToVariable: jest.fn(),
        unbindChildrenFromVariable: jest.fn(),
      };

      const editorStateWithRegistry = {
        ...mockEditorState,
        registry: mockRegistryWithChildrenBinding,
      };

      (useLayerStore as any).getState = jest.fn(() => layerStateWithMutableChildrenBinding);
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(layerStateWithMutableChildrenBinding);
        }
        return layerStateWithMutableChildrenBinding;
      });
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(editorStateWithRegistry);
        }
        return editorStateWithRegistry;
      });

      render(<PropsPanel />);

      // Should show the unbind button
      expect(screen.getByTestId('unbind-children-button')).toBeInTheDocument();
    });

    it('should show immutable badge for immutable children binding', () => {
      const testLayer: ComponentLayer = {
        id: 'span-immutable',
        type: 'span',
        name: 'Immutable Text',
        props: {},
        children: { __variableRef: 'greeting-var' },
      };

      const layerStateWithImmutableChildrenBinding = {
        ...mockLayerState,
        variables: mockVariables,
        selectedLayerId: 'span-immutable',
        findLayerById: jest.fn().mockReturnValue(testLayer),
        isChildrenBindingImmutable: jest.fn().mockReturnValue(true), // Immutable
        isBindingImmutable: jest.fn().mockReturnValue(false),
        isLayerAPage: jest.fn().mockReturnValue(false),
        bindChildrenToVariable: jest.fn(),
        unbindChildrenFromVariable: jest.fn(),
      };

      const editorStateWithRegistry = {
        ...mockEditorState,
        registry: mockRegistryWithChildrenBinding,
      };

      (useLayerStore as any).getState = jest.fn(() => layerStateWithImmutableChildrenBinding);
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(layerStateWithImmutableChildrenBinding);
        }
        return layerStateWithImmutableChildrenBinding;
      });
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(editorStateWithRegistry);
        }
        return editorStateWithRegistry;
      });

      render(<PropsPanel />);

      // Should show immutable badge
      expect(screen.getByTestId('immutable-children-badge')).toBeInTheDocument();
    });

    it('should show bind button when children is not bound to a variable', () => {
      const testLayer: ComponentLayer = {
        id: 'span-unbound',
        type: 'span',
        name: 'Unbound Text',
        props: {},
        children: 'Static text content',
      };

      const layerStateWithUnboundChildren = {
        ...mockLayerState,
        variables: mockVariables,
        selectedLayerId: 'span-unbound',
        findLayerById: jest.fn().mockReturnValue(testLayer),
        isChildrenBindingImmutable: jest.fn().mockReturnValue(false),
        isBindingImmutable: jest.fn().mockReturnValue(false),
        isLayerAPage: jest.fn().mockReturnValue(false),
        bindChildrenToVariable: jest.fn(),
        unbindChildrenFromVariable: jest.fn(),
      };

      const editorStateWithRegistry = {
        ...mockEditorState,
        registry: mockRegistryWithChildrenBinding,
      };

      (useLayerStore as any).getState = jest.fn(() => layerStateWithUnboundChildren);
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(layerStateWithUnboundChildren);
        }
        return layerStateWithUnboundChildren;
      });
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(editorStateWithRegistry);
        }
        return editorStateWithRegistry;
      });

      render(<PropsPanel />);

      // Should show the bind button for unbound children
      expect(screen.getByTestId('bind-children-button')).toBeInTheDocument();
    });
  });

  describe('Function Prop Variable Binding UI', () => {
    const mockFunctionVariables = [
      { id: 'click-handler-var', name: 'Click Handler', type: 'function', defaultValue: 'handleClick' },
      { id: 'submit-handler-var', name: 'Submit Handler', type: 'function', defaultValue: 'handleSubmit' },
    ];

    const mockFunctionRegistry = {
      handleClick: {
        name: 'Handle Click',
        schema: z.tuple([]),
        fn: () => {},
        description: 'Handles click events',
      },
      handleSubmit: {
        name: 'Handle Submit',
        schema: z.tuple([]),
        fn: () => {},
        description: 'Handles form submission',
      },
    };

    // Registry with Button that has onClick with function prop field override
    const mockRegistryWithFunctionProp: Record<string, RegistryEntry<any>> = {
      Button: {
        schema: z.object({
          className: z.string().optional(),
          onClick: z.any().optional(),
        }),
        from: "@/components/ui/button",
        component: ({ children, ...props }: any) => (
          <button {...props}>{children}</button>
        ),
        fieldOverrides: {
          onClick: () => functionPropFieldOverrides('onClick'),
        },
      },
    };

    it('should show binding UI when onClick is bound to a function variable', () => {
      const testLayer: ComponentLayer = {
        id: 'button-with-fn-var',
        type: 'Button',
        name: 'Interactive Button',
        props: {
          className: 'btn-primary',
          onClick: { __variableRef: 'click-handler-var' }, // Bound to function variable
        },
        children: [],
      };

      const layerStateWithFunctionBinding = {
        ...mockLayerState,
        variables: mockFunctionVariables,
        selectedLayerId: 'button-with-fn-var',
        findLayerById: jest.fn().mockReturnValue(testLayer),
        isBindingImmutable: jest.fn().mockReturnValue(false),
        isLayerAPage: jest.fn().mockReturnValue(false),
        bindPropToVariable: jest.fn(),
        unbindPropFromVariable: jest.fn(),
      };

      const editorStateWithFunctionRegistry = {
        ...mockEditorState,
        registry: mockRegistryWithFunctionProp,
        functionRegistry: mockFunctionRegistry,
      };

      (useLayerStore as any).getState = jest.fn(() => layerStateWithFunctionBinding);
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(layerStateWithFunctionBinding);
        }
        return layerStateWithFunctionBinding;
      });
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(editorStateWithFunctionRegistry);
        }
        return editorStateWithFunctionRegistry;
      });

      render(<PropsPanel />);

      // Should show the function variable name in the binding UI
      expect(screen.getByText('Click Handler')).toBeInTheDocument();
      
      // Should show the variable type as 'function'
      expect(screen.getByText('function')).toBeInTheDocument();
      
      // Should show the resolved function name
      expect(screen.getByText('Handle Click')).toBeInTheDocument();
    });

    it('should show unbind button for mutable function binding', () => {
      const testLayer: ComponentLayer = {
        id: 'button-mutable-fn',
        type: 'Button',
        name: 'Mutable Button',
        props: {
          onClick: { __variableRef: 'click-handler-var' },
        },
        children: [],
      };

      const layerStateWithMutableFunctionBinding = {
        ...mockLayerState,
        variables: mockFunctionVariables,
        selectedLayerId: 'button-mutable-fn',
        findLayerById: jest.fn().mockReturnValue(testLayer),
        isBindingImmutable: jest.fn().mockReturnValue(false),
        isLayerAPage: jest.fn().mockReturnValue(false),
        bindPropToVariable: jest.fn(),
        unbindPropFromVariable: jest.fn(),
      };

      const editorStateWithFunctionRegistry = {
        ...mockEditorState,
        registry: mockRegistryWithFunctionProp,
        functionRegistry: mockFunctionRegistry,
      };

      (useLayerStore as any).getState = jest.fn(() => layerStateWithMutableFunctionBinding);
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(layerStateWithMutableFunctionBinding);
        }
        return layerStateWithMutableFunctionBinding;
      });
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(editorStateWithFunctionRegistry);
        }
        return editorStateWithFunctionRegistry;
      });

      render(<PropsPanel />);

      // Should show the unbind button for mutable function binding
      expect(screen.getByTestId('unbind-variable-button')).toBeInTheDocument();
    });

    it('should show bind button when onClick is not bound to a variable', () => {
      const testLayer: ComponentLayer = {
        id: 'button-unbound',
        type: 'Button',
        name: 'Unbound Button',
        props: {
          className: 'btn-default',
          __function_onClick: 'handleClick', // Direct function binding, not variable
        },
        children: [],
      };

      const layerStateWithUnboundFunction = {
        ...mockLayerState,
        variables: mockFunctionVariables,
        selectedLayerId: 'button-unbound',
        findLayerById: jest.fn().mockReturnValue(testLayer),
        isBindingImmutable: jest.fn().mockReturnValue(false),
        isLayerAPage: jest.fn().mockReturnValue(false),
        bindPropToVariable: jest.fn(),
        unbindPropFromVariable: jest.fn(),
      };

      const editorStateWithFunctionRegistry = {
        ...mockEditorState,
        registry: mockRegistryWithFunctionProp,
        functionRegistry: mockFunctionRegistry,
      };

      (useLayerStore as any).getState = jest.fn(() => layerStateWithUnboundFunction);
      mockedUseLayerStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(layerStateWithUnboundFunction);
        }
        return layerStateWithUnboundFunction;
      });
      mockedUseEditorStore.mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector(editorStateWithFunctionRegistry);
        }
        return editorStateWithFunctionRegistry;
      });

      render(<PropsPanel />);

      // Should show the bind button for unbound function prop
      expect(screen.getByTestId('bind-variable-button')).toBeInTheDocument();
    });
  });
});
