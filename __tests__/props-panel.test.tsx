/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropsPanel from "@/components/ui/ui-builder/internal/props-panel";
import {
  useLayerStore,
  isTextLayer,
  Layer,
} from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer, TextLayer } from "@/lib/ui-builder/store/layer-store";

// Mock dependencies
jest.mock("@/lib/ui-builder/store/layer-store", () => ({
  useLayerStore: jest.fn(),
  isTextLayer: jest.fn(),
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

jest.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: any) => value,
}));

// Mock component-registry with necessary components
jest.mock("@/lib/ui-builder/registry/component-registry", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { z } = require("zod"); // Ensure zod is available

  return {
    componentRegistry: {
      Button: {
        schema: z.object({
          label: z.string().default("ollie"),
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
      // Add other necessary components here
      Accordion: {
        schema: z.object({
          // define necessary schema fields
        }),
        from: "@/components/ui/accordion",
        component: ({ children, ...props }: any) => (
          <div data-testid="accordion" {...props}>
            {children}
          </div>
        ),
      },
      Badge: {
        schema: z.object({
          // define necessary schema fields
        }),
        from: "@/components/ui/badge",
        component: ({ children, ...props }: any) => (
          <span data-testid="badge" {...props}>
            {children}
          </span>
        ),
      },
      // Continue adding other components as needed
    },
    generateFieldOverrides: jest.fn().mockReturnValue({}),
  };
});

describe("PropsPanel", () => {
  const mockedUseLayerStore = useLayerStore as unknown as jest.Mock;

  const mockRemoveLayer = jest.fn();
  const mockDuplicateLayer = jest.fn();
  const mockUpdateLayer = jest.fn();
  const mockFindLayerById = jest.fn();

  beforeEach(() => {
    mockedUseLayerStore.mockReturnValue({
      selectedLayerId: "layer-1",
      findLayerById: mockFindLayerById,
      removeLayer: mockRemoveLayer,
      duplicateLayer: mockDuplicateLayer,
      updateLayer: mockUpdateLayer,
    });
    // Mock isTextLayer to correctly identify text layers
    (isTextLayer as unknown as jest.Mock).mockImplementation((layer: Layer) => {
      return (layer as TextLayer).type === "_text_";
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPropsPanel = () => {
    render(<PropsPanel className="test-class" />);
  };

  describe("when no layer is selected", () => {
    beforeEach(() => {
      mockedUseLayerStore.mockReturnValue({
        selectedLayerId: null,
        findLayerById: jest.fn().mockReturnValue(null),
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
        updateLayer: mockUpdateLayer,
      });
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

    it("should render the form", () => {
      const { container } = render(<PropsPanel />);
      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("should display the duplicate and delete buttons", () => {
      expect(
        screen.getByTestId("button-Duplicate Component")
      ).toBeInTheDocument();
      expect(screen.getByTestId("button-Delete Component")).toBeInTheDocument();
    });

    it("should update layer properties on form change", async () => {
      // Simulate changing the 'label' field

      // Find the input field for 'label'
      const labelInput = screen.getByTestId("input");
      expect(labelInput).toBeInTheDocument();

      // Change the value
      userEvent.clear(labelInput);
      userEvent.type(labelInput, "New Label", { delay: 0 });

      // Since useDebounce is mocked to return immediately, updateLayer should be called
      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenLastCalledWith(
          "layer-1",
          {
            className: "button-class",
            label: "New Label",
          },
          undefined
        );
      });
    });
  });

  describe("when a text layer is selected", () => {
    const textLayer: TextLayer = {
      id: "layer-2",
      type: "_text_",
      name: "Test Text",
      text: "Hello, World!",
      textType: "text",
      props: { className: "text-class" },
    };

    beforeEach(() => {
      mockFindLayerById.mockReturnValue(textLayer);
      mockedUseLayerStore.mockReturnValue({
        selectedLayerId: "layer-2",
        findLayerById: mockFindLayerById,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
        updateLayer: mockUpdateLayer,
      });
      renderPropsPanel();
    });

    it("should display the text layer name and type", () => {
      expect(screen.getByText("Test Text Properties")).toBeInTheDocument();
      expect(screen.getByText("Type: text")).toBeInTheDocument();
    });

    it("should render the form", () => {
      const { container } = render(<PropsPanel />);
      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("should display the duplicate and delete buttons", () => {
      expect(
        screen.getByTestId("button-Duplicate Component")
      ).toBeInTheDocument();
      expect(screen.getByTestId("button-Delete Component")).toBeInTheDocument();
    });


    it("should update layer properties on form change", async () => {
      // Simulate changing the 'text' field

      // Find the textarea for 'text'
      const textInput = screen.getByTestId("textarea");
      expect(textInput).toBeInTheDocument();

      // Change the value
      userEvent.clear(textInput);
      userEvent.type(textInput, "New Text Content");

      // Since useDebounce is mocked to return immediately, updateLayer should be called
      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenLastCalledWith(
          "layer-2",
          { className: "text-class" },
          expect.objectContaining({
            id: "layer-2",
            name: "Test Text",
            text: "New Text Content",
            textType: "text",
            type: "_text_"
          })
        );
      });
    });
  });

  describe("edge cases", () => {
    it("should handle undefined selectedLayer gracefully", () => {
      mockFindLayerById.mockReturnValue(undefined);
      mockedUseLayerStore.mockReturnValue({
        selectedLayerId: "non-existent-layer",
        findLayerById: mockFindLayerById,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
        updateLayer: mockUpdateLayer,
      });
      renderPropsPanel();

      expect(screen.getByText("Component Properties")).toBeInTheDocument();
      expect(screen.getByText("No component selected")).toBeInTheDocument();
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
      renderPropsPanel();

      // Await the label input to appear in the DOM
      const labelInput = await screen.findByTestId("input");
      expect(labelInput).toBeInTheDocument();

      // Simulate rapid changes
      await userEvent.clear(labelInput);
      await userEvent.type(labelInput, "Click Fast");

      await userEvent.clear(labelInput);
      await userEvent.type(labelInput, "Click Faster");

      await userEvent.clear(labelInput);
      await userEvent.type(labelInput, "Click Fastest");

      // Await the debounced updates
      await waitFor(() => {
        expect(mockUpdateLayer).toHaveBeenCalledWith("layer-4", {
          className: "fast-button-class",
          label: "Click Fast",
        }, undefined);
        expect(mockUpdateLayer).toHaveBeenCalledWith("layer-4", {
          className: "fast-button-class",
          label: "Click Faster",
        }, undefined);
        expect(mockUpdateLayer).toHaveBeenCalledWith("layer-4", {
          className: "fast-button-class",
          label: "Click Fastest",
        }, undefined);
      });
    });
  });
});
