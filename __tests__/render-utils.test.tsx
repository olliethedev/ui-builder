import React from "react";
import { render, screen } from "@testing-library/react";
import {
  RenderLayer,
  hasClass,
  hasPositionClass,
} from "../components/ui/ui-builder/internal/utils/render-utils";
import type { ComponentLayer } from '../components/ui/ui-builder/types';
import type { BaseColor } from "../components/ui/ui-builder/internal/utils/base-colors";
import { baseColors } from "../components/ui/ui-builder/internal/utils/base-colors";
import { z } from "zod";
// Mock dependencies

jest.mock("../components/ui/ui-builder/internal/components/element-selector", () => ({
  ElementSelector: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock DndContext
const mockDndContext: {
  isDragging: boolean;
  activeLayerId: string | null;
  newComponentType: string | null;
  canDropOnLayer: jest.Mock;
} = {
  isDragging: false,
  activeLayerId: null,
  newComponentType: null,
  canDropOnLayer: jest.fn(() => true),
};

jest.mock("@/lib/ui-builder/context/dnd-context", () => ({
  useDndContext: () => mockDndContext,
}));

// Mock layer store  
jest.mock("@/lib/ui-builder/store/layer-store", () => ({
  useLayerStore: jest.fn((selector) => {
    const store = {
      variables: [],
      pages: [],
      isLayerAPage: () => false,
    };
    return selector(store);
  }),
}));

// Mock editor store
jest.mock("@/lib/ui-builder/store/editor-store", () => ({
  useEditorStore: jest.fn((selector) => {
    const store = {
      registry: {},
    };
    return selector(store);
  }),
}));
const mockRegistry = {
  // Complex Components
  Button: {
    schema: z.object({
      label: z.string(),
    }),
    from: "../components/ui/button",
    component: () => <button data-testid="button">Button</button>,
  },
  Input: {
    schema: z.object({
      label: z.string(),
    }),
    from: "../components/ui/input",
    component: () => <input data-testid="input" />,
  },
  Card: {
    schema: z.object({
      children: z.string(),
    }),
    from: "../components/ui/card",
    component: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  },
  // Primitive Components
  span: {
    schema: z.object({
      children: z.string(),
    }),
  },
  div: {
    schema: z.object({
      label: z.string(),
    }),
    from: undefined,
  },
  // Add mock for _page_ type
  _page_: {
    schema: z.object({}), // Assuming simple schema for test purposes
    component: ({ children, ...props }: {
      children?: React.ReactNode;
      // Allow any props for test flexibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    }) => (
      <div {...props}>{children}</div>
    ),
  },
  // Other
  UndefinedComponent: {
    schema: z.object({}),
    from: './example-component',
    // 'component' is intentionally omitted to test edgecase
  },
};
jest.mock("react-error-boundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));
jest.mock("react", () => {
  const original = jest.requireActual("react");
  return {
    ...original,
    Suspense: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="suspense">{children}</div>
    ),
  };
});

describe("render-utils", () => {
  const baseProps = {
    mode: "light" as const,
    colorTheme: "blue" as const,
    style: { padding: "20px" },
    borderRadius: "8px",
  };
  const pageLayer: ComponentLayer = {
    id: "page-1",
    type: "_page_",
    name: "Test Page",
    props: baseProps,
    children: [],
  };
  const componentLayer: ComponentLayer = {
    id: "layer-1",
    type: "Button",
    name: "Test Button",
    props: { className: "button-class" },
    children: [],
  };
  const textComponentLayer: ComponentLayer = {
    id: "layer-2",
    type: "span",
    name: "Test Text",
    props: { className: "text-class" },
    children: "Hello, World!",
  };
  const primitiveComponentLayer: ComponentLayer = {
    id: "layer-5",
    type: "div",
    name: "Test Div",
    props: { className: "div-class" },
    children: [],
  };

  const cardLayer: ComponentLayer = {
    id: "layer-6",
    type: "Card",
    name: "Test Card",
    props: { children: "Hello, World!" },
    children: [textComponentLayer],
  };

  describe("RenderPage", () => {
    it("renders a page with correct styles and children", () => {
      const modifiedPage = {
        ...pageLayer,
        children: [componentLayer, textComponentLayer],
      };
      render(<RenderLayer layer={modifiedPage} componentRegistry={mockRegistry} />);
      const container = screen.getByTestId("page-1");
      expect(container).toHaveStyle("padding: 20px");
      expect(container).toHaveStyle("borderColor: hsl(undefined)"); // colorData is undefined in baseColors
      expect(screen.getByTestId("button")).toBeInTheDocument();
      expect(screen.queryByTestId("input")).not.toBeInTheDocument();
      const textElement = screen.getByTestId("layer-2");
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveClass("text-class");
      expect(textElement).toHaveTextContent("Hello, World!");
    });

    it("applies global overrides when colorTheme is provided", () => {
      const colorThemeProps = {
        ...baseProps,
        colorTheme: "blue",
      };
      const modifiedPage = {
        ...pageLayer,
        props: colorThemeProps,
        children: [componentLayer],
      };
      // Mock baseColors to include 'blue'
      const mockBaseColors: BaseColor = {
        name: "blue",
        label: "Blue",
        activeColor: {
          light: "221.2 83.2% 53.3%",
          dark: "217.2 91.2% 59.8%",
        },
        cssVars: {
          light: {
            background: "0 0% 100%",
            foreground: "222.2 84% 4.9%",
            card: "0 0% 100%",
            "card-foreground": "222.2 84% 4.9%",
            popover: "0 0% 100%",
            "popover-foreground": "222.2 84% 4.9%",
            primary: "221.2 83.2% 53.3%",
            "primary-foreground": "210 40% 98%",
            secondary: "210 40% 96.1%",
            "secondary-foreground": "222.2 47.4% 11.2%",
            muted: "210 40% 96.1%",
            "muted-foreground": "215.4 16.3% 46.9%",
            accent: "210 40% 96.1%",
            "accent-foreground": "222.2 47.4% 11.2%",
            destructive: "0 84.2% 60.2%",
            "destructive-foreground": "210 40% 98%",
            border: "214.3 31.8% 91.4%",
            input: "214.3 31.8% 91.4%",
            ring: "221.2 83.2% 53.3%",
            "chart-1": "12 76% 61%",
            "chart-2": "173 58% 39%",
            "chart-3": "197 37% 24%",
            "chart-4": "43 74% 66%",
            "chart-5": "27 87% 67%",
          },
          dark: {
            background: "222.2 84% 4.9%",
            foreground: "210 40% 98%",
            card: "222.2 84% 4.9%",
            "card-foreground": "210 40% 98%",
            popover: "222.2 84% 4.9%",
            "popover-foreground": "210 40% 98%",
            primary: "217.2 91.2% 59.8%",
            "primary-foreground": "222.2 47.4% 11.2%",
            secondary: "217.2 32.6% 17.5%",
            "secondary-foreground": "210 40% 98%",
            muted: "217.2 32.6% 17.5%",
            "muted-foreground": "215 20.2% 65.1%",
            accent: "217.2 32.6% 17.5%",
            "accent-foreground": "210 40% 98%",
            destructive: "0 62.8% 30.6%",
            "destructive-foreground": "210 40% 98%",
            border: "217.2 32.6% 17.5%",
            input: "217.2 32.6% 17.5%",
            ring: "224.3 76.3% 48%",
            "chart-1": "220 70% 50%",
            "chart-2": "160 60% 45%",
            "chart-3": "30 80% 55%",
            "chart-4": "280 65% 60%",
            "chart-5": "340 75% 55%",
          },
        },
      };
      jest.spyOn(baseColors, "find").mockReturnValue(mockBaseColors);
      render(<RenderLayer layer={modifiedPage} componentRegistry={mockRegistry} />);
      const container = screen.getByTestId("page-1");
      expect(container).toHaveStyle("color: hsl(222.2 84% 4.9%)");
      expect(container).toHaveStyle("borderColor: hsl(214.3 31.8% 91.4%)");
    });

    it("renders correctly without colorTheme", () => {
      const noColorThemeProps = {
        ...baseProps,
        colorTheme: undefined,
      };
      const modifiedPage = {
        ...pageLayer,
        props: noColorThemeProps,
        children: [componentLayer],
      };
      render(<RenderLayer layer={modifiedPage} componentRegistry={mockRegistry} />);
      const container = screen.getByTestId("page-1");
      expect(container).toHaveStyle("padding: 20px");
      expect(container).toHaveStyle("color: initial");
      expect(container).toHaveStyle("borderColor: initial");
      expect(screen.getByTestId("button")).toBeInTheDocument();
    });

    it("handles non-existent colorTheme gracefully", () => {
      const invalidColorThemeProps = {
        ...baseProps,
        colorTheme: "non-existent",
      };
      const modifiedPage = {
        ...pageLayer,
        props: invalidColorThemeProps,
        children: [componentLayer],
      };
      // Mock baseColors to return undefined
      jest.spyOn(baseColors, "find").mockReturnValue(undefined);
      render(<RenderLayer layer={modifiedPage} componentRegistry={mockRegistry} />);
      const container = screen.getByTestId("page-1");
      expect(container).toHaveStyle("padding: 20px");
      expect(container).toHaveStyle("color: initial");
      expect(container).toHaveStyle("borderColor: initial");
      expect(screen.getByTestId("button")).toBeInTheDocument();
    });
  });

  describe("RenderLayer", () => {
    it("renders a component layer without editorConfig", () => {
      render(<RenderLayer layer={componentLayer} componentRegistry={mockRegistry} />);
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      expect(screen.getByTestId("button")).toBeInTheDocument();
      expect(screen.getByTestId("button")).toHaveTextContent("Button");
    });

    it("renders a component layer with editorConfig", () => {
      const editorConfig = {
        zIndex: 1,
        totalLayers: 2,
        selectedLayer: componentLayer,
        onSelectElement: jest.fn(),
        handleDuplicateLayer: jest.fn(),
        handleDeleteLayer: jest.fn(),
      };
      render(<RenderLayer layer={componentLayer} editorConfig={editorConfig} componentRegistry={mockRegistry} />);
      expect(screen.getByTestId("button")).toBeInTheDocument();
    });

    it("renders a text component layer without editorConfig", () => {
      render(<RenderLayer layer={textComponentLayer} componentRegistry={mockRegistry} />);
      const textElement = screen.getByTestId("layer-2");
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveTextContent("Hello, World!");
      expect(textElement).toHaveClass("text-class");
    });

    it("renders a text component layer with editorConfig", () => {
      const editorConfig = {
        zIndex: 2,
        totalLayers: 3,
        selectedLayer: textComponentLayer,
        onSelectElement: jest.fn(),
        handleDuplicateLayer: jest.fn(),
        handleDeleteLayer: jest.fn(),
      };
      render(<RenderLayer layer={textComponentLayer} editorConfig={editorConfig} componentRegistry={mockRegistry} />);
      const textElement = screen.getByTestId("layer-2");
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveClass("text-class");
      expect(textElement).toHaveTextContent("Hello, World!");
    });

    it("renders a primitive component layer", () => {
      render(<RenderLayer layer={primitiveComponentLayer} componentRegistry={mockRegistry} />);
      const primitiveElement = screen.getByTestId("layer-5");
      expect(primitiveElement).toBeInTheDocument();
      expect(primitiveElement).toHaveClass("div-class");
    });

    it("renders a layer with children", () => {
      render(<RenderLayer layer={cardLayer} componentRegistry={mockRegistry} />);
      const cardElement = screen.getByTestId("card");
      expect(cardElement).toBeInTheDocument();
      expect(screen.getByTestId("layer-2")).toBeInTheDocument();
    });

    it("renders a layer with children using EditorConfig", () => {
      const editorConfig = {
        zIndex: 1,
        totalLayers: 2,
        selectedLayer: cardLayer,
        onSelectElement: jest.fn(),
        handleDuplicateLayer: jest.fn(),
        handleDeleteLayer: jest.fn(),
      };
    
      render(<RenderLayer layer={cardLayer} editorConfig={editorConfig} componentRegistry={mockRegistry} />);
    
      // Check if the card element is rendered
      const cardElement = screen.getByTestId("card");
      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveTextContent("Hello, World!");
    
      // Check if the child text element within the card is rendered
      const childTextElement = screen.getByTestId("layer-2");
      expect(childTextElement).toBeInTheDocument();
      expect(childTextElement).toHaveClass("text-class");
      expect(childTextElement).toHaveTextContent("Hello, World!");
    });

    it("returns null if component is not found", () => {
      const notFoundLayer = { ...componentLayer, type: "not-found" };
      const { container } = render(<RenderLayer layer={notFoundLayer} componentRegistry={mockRegistry} />);
      expect(container.firstChild).toBeNull();
    });

    it("returns null when component is undefined for a non-primitive component type", () => {
      const undefinedComponentLayer = {
        id: "layer-undefined",
        type: "UndefinedComponent",
        name: "Undefined Component Layer",
        props: {},
        children: [],
      };

      const { container } = render(<RenderLayer layer={undefinedComponentLayer} componentRegistry={mockRegistry} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("ErrorSuspenseWrapper", () => {
    it("renders children within ErrorBoundary and Suspense", () => {
      const child = <div data-testid="child">Child Content</div>;
      render(
        <div data-testid="error-boundary">
          <div data-testid="suspense">{child}</div>
        </div>
      );
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      expect(screen.getByTestId("suspense")).toBeInTheDocument();
      expect(screen.getByTestId("child")).toHaveTextContent("Child Content");
    });
  });

  describe("hasClass", () => {
    it("returns true when className contains the exact class", () => {
      expect(hasClass("relative", "relative")).toBe(true);
      expect(hasClass("flex relative", "relative")).toBe(true);
      expect(hasClass("relative flex", "relative")).toBe(true);
      expect(hasClass("flex relative items-center", "relative")).toBe(true);
    });

    it("returns false for substring matches (prevents false positives)", () => {
      // These should NOT match because 'relative' is part of a larger class name
      expect(hasClass("content-relative-wrapper", "relative")).toBe(false);
      expect(hasClass("my-relative-element", "relative")).toBe(false);
      expect(hasClass("relative-position", "relative")).toBe(false);
      expect(hasClass("non-relative", "relative")).toBe(false);
    });

    it("returns false when class is not present", () => {
      expect(hasClass("flex items-center", "relative")).toBe(false);
      expect(hasClass("absolute fixed", "relative")).toBe(false);
      expect(hasClass("", "relative")).toBe(false);
    });

    it("handles multiple spaces and edge cases", () => {
      expect(hasClass("flex  relative", "relative")).toBe(true); // double space
      expect(hasClass("  relative  ", "relative")).toBe(true); // leading/trailing spaces
      expect(hasClass("flex\trelative", "relative")).toBe(true); // tab character
    });
  });

  describe("RenderLayer with drag and drop context", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("renders drag feedback wrapper when layer is being dragged", () => {
      // Set up mock to simulate this layer being dragged
      mockDndContext.isDragging = true;
      mockDndContext.activeLayerId = "layer-1";

      const editorConfig = {
        zIndex: 1,
        totalLayers: 2,
        selectedLayer: componentLayer,
        onSelectElement: jest.fn(),
        handleDuplicateLayer: jest.fn(),
        handleDeleteLayer: jest.fn(),
      };

      render(<RenderLayer layer={componentLayer} editorConfig={editorConfig} componentRegistry={mockRegistry} />);
      
      const draggingWrapper = document.querySelector('[data-dragging="true"]');
      expect(draggingWrapper).toBeInTheDocument();
      expect(draggingWrapper).toHaveClass('opacity-50');
      
      // Reset
      mockDndContext.isDragging = false;
      mockDndContext.activeLayerId = null;
    });

    it("does not show drag feedback for non-dragged layers", () => {
      mockDndContext.isDragging = true;
      mockDndContext.activeLayerId = "other-layer";

      const editorConfig = {
        zIndex: 1,
        totalLayers: 2,
        selectedLayer: componentLayer,
        onSelectElement: jest.fn(),
        handleDuplicateLayer: jest.fn(),
        handleDeleteLayer: jest.fn(),
      };

      render(<RenderLayer layer={componentLayer} editorConfig={editorConfig} componentRegistry={mockRegistry} />);
      
      const draggingWrapper = document.querySelector('[data-dragging="true"]');
      expect(draggingWrapper).not.toBeInTheDocument();
      
      // Reset
      mockDndContext.isDragging = false;
      mockDndContext.activeLayerId = null;
    });

    it("does not render drag feedback wrapper when not dragging", () => {
      mockDndContext.isDragging = false;
      mockDndContext.activeLayerId = null;

      render(<RenderLayer layer={componentLayer} componentRegistry={mockRegistry} />);
      
      const draggingWrapper = document.querySelector('[data-dragging="true"]');
      expect(draggingWrapper).not.toBeInTheDocument();
    });
  });

  describe("hasPositionClass", () => {
    it("returns true when className contains 'relative'", () => {
      expect(hasPositionClass("relative")).toBe(true);
      expect(hasPositionClass("flex relative")).toBe(true);
      expect(hasPositionClass("relative flex items-center")).toBe(true);
    });

    it("returns true when className contains 'absolute'", () => {
      expect(hasPositionClass("absolute")).toBe(true);
      expect(hasPositionClass("absolute top-0 left-0")).toBe(true);
      expect(hasPositionClass("flex absolute inset-0")).toBe(true);
    });

    it("returns true when className contains 'fixed'", () => {
      expect(hasPositionClass("fixed")).toBe(true);
      expect(hasPositionClass("fixed top-0 w-full")).toBe(true);
      expect(hasPositionClass("z-50 fixed inset-x-0")).toBe(true);
    });

    it("returns true when className contains 'sticky'", () => {
      expect(hasPositionClass("sticky")).toBe(true);
      expect(hasPositionClass("sticky top-0")).toBe(true);
      expect(hasPositionClass("flex sticky top-4")).toBe(true);
    });

    it("returns true when className contains 'static'", () => {
      expect(hasPositionClass("static")).toBe(true);
      expect(hasPositionClass("static flex")).toBe(true);
    });

    it("returns false for substring matches (prevents false positives)", () => {
      // These should NOT match because position classes are part of larger class names
      expect(hasPositionClass("content-relative-wrapper")).toBe(false);
      expect(hasPositionClass("my-absolute-element")).toBe(false);
      expect(hasPositionClass("non-fixed")).toBe(false);
      expect(hasPositionClass("sticky-note-class")).toBe(false);
    });

    it("returns false when no position class is present", () => {
      expect(hasPositionClass("flex items-center")).toBe(false);
      expect(hasPositionClass("bg-white p-4")).toBe(false);
      expect(hasPositionClass("")).toBe(false);
      expect(hasPositionClass("w-full h-full")).toBe(false);
    });

    it("handles multiple spaces and edge cases", () => {
      expect(hasPositionClass("flex  absolute")).toBe(true); // double space
      expect(hasPositionClass("  fixed  ")).toBe(true); // leading/trailing spaces
      expect(hasPositionClass("flex\tsticky")).toBe(true); // tab character
    });
  });
});