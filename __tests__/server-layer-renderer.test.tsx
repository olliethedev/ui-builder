/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import ServerLayerRenderer from "../components/ui/ui-builder/server-layer-renderer";
import LayerRenderer from "../components/ui/ui-builder/layer-renderer";
import type { ComponentLayer, Variable, ComponentRegistry } from "../components/ui/ui-builder/types";
import { z } from "zod";

// Simple mock component registry for testing
const mockComponentRegistry: ComponentRegistry = {
  div: {
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
    }),
  },
  span: {
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
    }),
  },
  p: {
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
    }),
  },
  // Custom component with explicit component function
  CustomButton: {
    component: ({ children, variant, ...props }: { children?: React.ReactNode; variant?: string; [key: string]: unknown }) => (
      <button data-variant={variant} {...props}>{children}</button>
    ),
    schema: z.object({
      variant: z.string().optional(),
      children: z.any().optional(),
    }),
    from: "@/components/ui/button",
  },
};

const mockVariables: Variable[] = [
  {
    id: "var1",
    name: "testText",
    type: "string",
    defaultValue: "Hello World",
  },
  {
    id: "var2",
    name: "testNumber",
    type: "number",
    defaultValue: 42,
  },
  {
    id: "var3",
    name: "isEnabled",
    type: "boolean",
    defaultValue: true,
  },
];

describe("ServerLayerRenderer", () => {
  describe("Basic Rendering", () => {
    it("renders a simple page without variables", () => {
      const simplePage: ComponentLayer = {
        id: "page1",
        type: "div",
        name: "Simple Page",
        props: { className: "p-4" },
        children: "Simple content",
      };

      render(
        <ServerLayerRenderer
          page={simplePage}
          componentRegistry={mockComponentRegistry}
        />
      );

      expect(screen.getByText("Simple content")).toBeInTheDocument();
      expect(screen.getByTestId("page1")).toHaveClass("p-4");
    });

    it("renders nested components correctly", () => {
      const nestedPage: ComponentLayer = {
        id: "page1",
        type: "div",
        name: "Nested Page",
        props: { className: "container" },
        children: [
          {
            id: "child1",
            type: "div",
            name: "Child 1",
            props: { className: "child-class" },
            children: "Child 1 content",
          },
          {
            id: "child2",
            type: "span",
            name: "Child 2",
            props: {},
            children: "Child 2 content",
          },
        ],
      };

      render(
        <ServerLayerRenderer
          page={nestedPage}
          componentRegistry={mockComponentRegistry}
        />
      );

      expect(screen.getByTestId("page1")).toBeInTheDocument();
      expect(screen.getByTestId("child1")).toHaveClass("child-class");
      expect(screen.getByText("Child 1 content")).toBeInTheDocument();
      expect(screen.getByText("Child 2 content")).toBeInTheDocument();
    });

    it("renders deeply nested components", () => {
      const deeplyNestedPage: ComponentLayer = {
        id: "level1",
        type: "div",
        name: "Level 1",
        props: {},
        children: [
          {
            id: "level2",
            type: "div",
            name: "Level 2",
            props: {},
            children: [
              {
                id: "level3",
                type: "div",
                name: "Level 3",
                props: {},
                children: [
                  {
                    id: "level4",
                    type: "span",
                    name: "Level 4",
                    props: {},
                    children: "Deep content",
                  },
                ],
              },
            ],
          },
        ],
      };

      render(
        <ServerLayerRenderer
          page={deeplyNestedPage}
          componentRegistry={mockComponentRegistry}
        />
      );

      expect(screen.getByTestId("level1")).toBeInTheDocument();
      expect(screen.getByTestId("level2")).toBeInTheDocument();
      expect(screen.getByTestId("level3")).toBeInTheDocument();
      expect(screen.getByTestId("level4")).toBeInTheDocument();
      expect(screen.getByText("Deep content")).toBeInTheDocument();
    });

    it("applies className to root container", () => {
      const page: ComponentLayer = {
        id: "page1",
        type: "div",
        name: "Page",
        props: {},
        children: "Content",
      };

      const { container } = render(
        <ServerLayerRenderer
          page={page}
          componentRegistry={mockComponentRegistry}
          className="custom-root-class"
        />
      );

      expect(container.firstChild).toHaveClass("custom-root-class");
    });
  });

  describe("Variable Resolution", () => {
    it("resolves variable references with default values", () => {
      const pageWithVars: ComponentLayer = {
        id: "page1",
        type: "div",
        name: "Page",
        props: {},
        children: [
          {
            id: "span1",
            type: "span",
            name: "Text",
            props: {
              children: { __variableRef: "var1" },
            },
            children: [],
          },
        ],
      };

      render(
        <ServerLayerRenderer
          page={pageWithVars}
          componentRegistry={mockComponentRegistry}
          variables={mockVariables}
        />
      );

      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("resolves variable references with override values", () => {
      const pageWithVars: ComponentLayer = {
        id: "page1",
        type: "div",
        name: "Page",
        props: {},
        children: [
          {
            id: "span1",
            type: "span",
            name: "Text",
            props: {
              children: { __variableRef: "var1" },
            },
            children: [],
          },
        ],
      };

      render(
        <ServerLayerRenderer
          page={pageWithVars}
          componentRegistry={mockComponentRegistry}
          variables={mockVariables}
          variableValues={{ var1: "Custom Override" }}
        />
      );

      expect(screen.getByText("Custom Override")).toBeInTheDocument();
    });

    it("resolves layer.children as variable reference", () => {
      const pageWithChildrenVarRef: ComponentLayer = {
        id: "page1",
        type: "div",
        name: "Page",
        props: {},
        children: [
          {
            id: "span1",
            type: "span",
            name: "Text",
            props: {},
            children: { __variableRef: "var1" },
          },
        ],
      };

      render(
        <ServerLayerRenderer
          page={pageWithChildrenVarRef}
          componentRegistry={mockComponentRegistry}
          variables={mockVariables}
        />
      );

      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("handles number variable in children", () => {
      const pageWithNumberVar: ComponentLayer = {
        id: "page1",
        type: "div",
        name: "Page",
        props: {},
        children: [
          {
            id: "span1",
            type: "span",
            name: "Number Display",
            props: {},
            children: { __variableRef: "var2" },
          },
        ],
      };

      render(
        <ServerLayerRenderer
          page={pageWithNumberVar}
          componentRegistry={mockComponentRegistry}
          variables={mockVariables}
        />
      );

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("handles missing variable gracefully", () => {
      const pageWithMissingVar: ComponentLayer = {
        id: "page1",
        type: "div",
        name: "Page",
        props: {},
        children: [
          {
            id: "span1",
            type: "span",
            name: "Text",
            props: {},
            children: { __variableRef: "nonexistent" },
          },
        ],
      };

      render(
        <ServerLayerRenderer
          page={pageWithMissingVar}
          componentRegistry={mockComponentRegistry}
          variables={mockVariables}
        />
      );

      // Should render without crashing, span should be empty
      expect(screen.getByTestId("span1")).toBeInTheDocument();
      expect(screen.getByTestId("span1")).toHaveTextContent("");
    });
  });

  describe("Custom Components", () => {
    it("renders custom components correctly", () => {
      const pageWithCustom: ComponentLayer = {
        id: "page1",
        type: "div",
        name: "Page",
        props: {},
        children: [
          {
            id: "btn1",
            type: "CustomButton",
            name: "Button",
            props: {
              variant: "primary",
            },
            children: "Click me",
          },
        ],
      };

      render(
        <ServerLayerRenderer
          page={pageWithCustom}
          componentRegistry={mockComponentRegistry}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Click me");
      expect(button).toHaveAttribute("data-variant", "primary");
    });
  });

  describe("Error Handling", () => {
    it("handles missing component in registry gracefully", () => {
      const pageWithUnknown: ComponentLayer = {
        id: "page1",
        type: "div",
        name: "Page",
        props: {},
        children: [
          {
            id: "unknown1",
            type: "UnknownComponent",
            name: "Unknown",
            props: {},
            children: [],
          },
        ],
      };

      // Should not throw
      render(
        <ServerLayerRenderer
          page={pageWithUnknown}
          componentRegistry={mockComponentRegistry}
        />
      );

      // Page should still render
      expect(screen.getByTestId("page1")).toBeInTheDocument();
      // Unknown component should not render
      expect(screen.queryByTestId("unknown1")).not.toBeInTheDocument();
    });

    it("handles empty children array", () => {
      const pageWithEmptyChildren: ComponentLayer = {
        id: "page1",
        type: "div",
        name: "Page",
        props: { className: "empty-container" },
        children: [],
      };

      render(
        <ServerLayerRenderer
          page={pageWithEmptyChildren}
          componentRegistry={mockComponentRegistry}
        />
      );

      expect(screen.getByTestId("page1")).toBeInTheDocument();
      expect(screen.getByTestId("page1")).toHaveClass("empty-container");
    });
  });
});

describe("LayerRenderer vs ServerLayerRenderer Comparison", () => {
  // These tests verify that both renderers produce equivalent output
  // for the same input (without editor functionality)

  const comparisonRegistry: ComponentRegistry = {
    div: {
      component: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
        <div {...props}>{children}</div>
      ),
      schema: z.object({
        className: z.string().optional(),
        children: z.any().optional(),
      }),
      from: "div",
    },
    span: {
      component: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
        <span {...props}>{children}</span>
      ),
      schema: z.object({
        className: z.string().optional(),
        children: z.any().optional(),
      }),
      from: "span",
    },
  };

  it("both renderers produce same text content for simple page", () => {
    const simplePage: ComponentLayer = {
      id: "page1",
      type: "div",
      name: "Simple Page",
      props: { className: "p-4" },
      children: "Simple content",
    };

    const { container: serverContainer } = render(
      <ServerLayerRenderer
        page={simplePage}
        componentRegistry={comparisonRegistry}
      />
    );
    const serverText = serverContainer.textContent;

    const { container: clientContainer } = render(
      <LayerRenderer
        page={simplePage}
        componentRegistry={comparisonRegistry}
      />
    );
    const clientText = clientContainer.textContent;

    expect(serverText).toBe(clientText);
  });

  it("both renderers produce same content for nested structure", () => {
    const nestedPage: ComponentLayer = {
      id: "page1",
      type: "div",
      name: "Nested Page",
      props: {},
      children: [
        {
          id: "child1",
          type: "div",
          name: "Child 1",
          props: {},
          children: "Content A",
        },
        {
          id: "child2",
          type: "span",
          name: "Child 2",
          props: {},
          children: "Content B",
        },
      ],
    };

    const { container: serverContainer } = render(
      <ServerLayerRenderer
        page={nestedPage}
        componentRegistry={comparisonRegistry}
      />
    );

    const { container: clientContainer } = render(
      <LayerRenderer
        page={nestedPage}
        componentRegistry={comparisonRegistry}
      />
    );

    // Both should have same testid elements
    expect(serverContainer.querySelector('[data-testid="page1"]')).toBeInTheDocument();
    expect(clientContainer.querySelector('[data-testid="page1"]')).toBeInTheDocument();
    expect(serverContainer.querySelector('[data-testid="child1"]')).toBeInTheDocument();
    expect(clientContainer.querySelector('[data-testid="child1"]')).toBeInTheDocument();
    expect(serverContainer.querySelector('[data-testid="child2"]')).toBeInTheDocument();
    expect(clientContainer.querySelector('[data-testid="child2"]')).toBeInTheDocument();

    // Both should have same text content
    expect(serverContainer.textContent).toContain("Content A");
    expect(serverContainer.textContent).toContain("Content B");
    expect(clientContainer.textContent).toContain("Content A");
    expect(clientContainer.textContent).toContain("Content B");
  });

  it("both renderers resolve variables the same way", () => {
    const variables: Variable[] = [
      {
        id: "greeting",
        name: "Greeting",
        type: "string",
        defaultValue: "Hello",
      },
    ];

    const variableValues = {
      greeting: "Welcome!",
    };

    const pageWithVars: ComponentLayer = {
      id: "page1",
      type: "div",
      name: "Page",
      props: {},
      children: [
        {
          id: "span1",
          type: "span",
          name: "Greeting",
          props: {
            children: { __variableRef: "greeting" },
          },
          children: [],
        },
      ],
    };

    const { container: serverContainer } = render(
      <ServerLayerRenderer
        page={pageWithVars}
        componentRegistry={comparisonRegistry}
        variables={variables}
        variableValues={variableValues}
      />
    );

    const { container: clientContainer } = render(
      <LayerRenderer
        page={pageWithVars}
        componentRegistry={comparisonRegistry}
        variables={variables}
        variableValues={variableValues}
      />
    );

    // Both should show the resolved variable value
    expect(serverContainer.textContent).toContain("Welcome!");
    expect(clientContainer.textContent).toContain("Welcome!");
  });

  it("both renderers handle children variable references the same way", () => {
    const variables: Variable[] = [
      {
        id: "message",
        name: "Message",
        type: "string",
        defaultValue: "Default message",
      },
    ];

    const pageWithChildrenVar: ComponentLayer = {
      id: "page1",
      type: "div",
      name: "Page",
      props: {},
      children: [
        {
          id: "span1",
          type: "span",
          name: "Message",
          props: {},
          children: { __variableRef: "message" },
        },
      ],
    };

    const { container: serverContainer } = render(
      <ServerLayerRenderer
        page={pageWithChildrenVar}
        componentRegistry={comparisonRegistry}
        variables={variables}
      />
    );

    const { container: clientContainer } = render(
      <LayerRenderer
        page={pageWithChildrenVar}
        componentRegistry={comparisonRegistry}
        variables={variables}
      />
    );

    // Both should show the default variable value
    expect(serverContainer.textContent).toContain("Default message");
    expect(clientContainer.textContent).toContain("Default message");
  });
});
