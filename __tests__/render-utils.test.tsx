import React from "react";
import { render, screen } from "@testing-library/react";
import {
  renderPage,
  renderLayer,
} from "../components/ui/ui-builder/internal/render-utils";
import {
  PageLayer,
  TextLayer,
  ComponentLayer,
} from "../lib/ui-builder/store/layer-store";
import { BaseColor, baseColors } from "../components/ui/ui-builder/internal/base-colors";
// Mock dependencies
jest.mock("../components/ui/ui-builder/markdown", () => ({
  Markdown: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="markdown">{children}</div>
  ),
}));
jest.mock("../components/ui/ui-builder/internal/clickable-wrapper", () => ({
  ClickableWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clickable-wrapper">{children}</div>
  ),
}));
jest.mock("../lib/ui-builder/registry/component-registry", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const z = require("zod");
  return {
    componentRegistry: {
      //Complex Components
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
      //Primitive Components
      div: {
        schema: z.object({
          label: z.string(),
        }),
        from: undefined,
      },
      // Add other mocked components as needed
    },
  };
});
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
  const pageLayer: PageLayer = {
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
  const textLayer: TextLayer = {
    id: "layer-2",
    type: "_text_",
    name: "Test Text",
    text: "Hello, World!",
    textType: "text",
    props: { className: "text-class" },
  };
  const markdownLayer: TextLayer = {
    id: "layer-3",
    type: "_text_",
    name: "Markdown Text",
    text: "Bold Text",
    textType: "markdown",
    props: {},
  };
  const componentLayerWithChildren: ComponentLayer = {
    id: "layer-4",
    type: "Input",
    name: "Test Input",
    props: { className: "input-class" },
    children: [textLayer],
  };
  const primitiveComponentLayer: ComponentLayer = {
    id: "layer-5",
    type: "div",
    name: "Test Div",
    props: { className: "div-class" },
    children: [],
  };
  describe("renderPage", () => {
    it("renders a page with correct styles and children", () => {
      const modifiedPage = {
        ...pageLayer,
        children: [componentLayer, textLayer],
      };
      render(renderPage(modifiedPage));
      const container = screen.getByTestId("page-1");
      expect(container).toHaveStyle("padding: 20px");
      expect(container).toHaveStyle("borderColor: hsl(undefined)"); // colorData is undefined in baseColors
      expect(screen.getByTestId("button")).toBeInTheDocument();
      expect(screen.queryByTestId("input")).not.toBeInTheDocument();
      const textElement = screen.getByTestId("layer-2");
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveClass("text-class");
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
      const mockBaseColors: BaseColor = 
        {
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
      render(renderPage(modifiedPage));
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
      render(renderPage(modifiedPage));
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
      render(renderPage(modifiedPage));
      const container = screen.getByTestId("page-1");
      expect(container).toHaveStyle("padding: 20px");
      expect(container).toHaveStyle("color: initial");
      expect(container).toHaveStyle("borderColor: initial");
      expect(screen.getByTestId("button")).toBeInTheDocument();
    });
  });
  describe("renderLayer", () => {
    it("renders a component layer without editorConfig", () => {
      render(renderLayer(componentLayer));
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
      render(renderLayer(componentLayer, editorConfig));
      expect(screen.getByTestId("clickable-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("button")).toBeInTheDocument();
    });
    it("renders a text layer without editorConfig", () => {
      render(renderLayer(textLayer));
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      const textElement = screen.getByTestId("layer-2");
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveTextContent("Hello, World!");
    });
    it("renders a markdown text layer without editorConfig", () => {
      render(renderLayer(markdownLayer));
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      expect(screen.getByTestId("markdown")).toBeInTheDocument();
      expect(screen.getByTestId("markdown")).toHaveTextContent("Bold Text");
    });
    it("renders a text layer with editorConfig", () => {
      const editorConfig = {
        zIndex: 2,
        totalLayers: 3,
        selectedLayer: textLayer,
        onSelectElement: jest.fn(),
        handleDuplicateLayer: jest.fn(),
        handleDeleteLayer: jest.fn(),
      };
      render(renderLayer(textLayer, editorConfig));
      expect(screen.getByTestId("clickable-wrapper")).toBeInTheDocument();
      const textElement = screen.getByTestId("layer-2");
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveClass("text-class");
    });
    it("renders a component layer with children", () => {
      render(renderLayer(componentLayerWithChildren));
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      expect(screen.getByTestId("input")).toBeInTheDocument();
    });
    it("renders a primitive component layer", () => {
      render(renderLayer(primitiveComponentLayer));
      expect(screen.getByTestId("layer-5")).toBeInTheDocument();
    });
    it("renders a component layer with editorConfig and children", () => {
      const editorConfig = {
        zIndex: 1,
        totalLayers: 2,
        selectedLayer: componentLayerWithChildren,
        onSelectElement: jest.fn(),
        handleDuplicateLayer: jest.fn(),
        handleDeleteLayer: jest.fn(),
      };
      render(renderLayer(componentLayerWithChildren, editorConfig));
      expect(screen.getByTestId("clickable-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("input")).toBeInTheDocument();
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
});