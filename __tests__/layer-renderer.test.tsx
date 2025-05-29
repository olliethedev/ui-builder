/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { ComponentLayer } from "@/components/ui/ui-builder/types";
import { Variable } from '@/components/ui/ui-builder/types';
import { z } from "zod";

const mockComponentRegistry = {
  div: {
    component: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
    }),
    from: "div",
  },
  span: {
    component: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
    }),
    from: "span",
  },
};

const mockPage: ComponentLayer = {
  id: "page1",
  type: "div",
  name: "Test Page",
  props: {
    className: "p-4",
  },
  children: [
    {
      id: "span1",
      type: "span",
      name: "Test Span",
      props: {
        children: { __variableRef: "var1" }, // Variable reference
      },
      children: [],
    },
  ],
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
];

describe("LayerRenderer", () => {
  it("renders without variables", () => {
    const simplePage: ComponentLayer = {
      id: "page1",
      type: "div",
      name: "Simple Page",
      props: { className: "p-4" },
      children: "Simple content",
    };

    render(
      <LayerRenderer
        page={simplePage}
        componentRegistry={mockComponentRegistry}
      />
    );

    expect(screen.getByText("Simple content")).toBeInTheDocument();
  });

  it("renders with variables and resolves variable references", () => {
    render(
      <LayerRenderer
        page={mockPage}
        componentRegistry={mockComponentRegistry}
        variables={mockVariables}
      />
    );

    // The variable reference should be resolved to the default value
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders with variables and variable values override", () => {
    const variableValues = {
      var1: "Custom Text",
    };

    render(
      <LayerRenderer
        page={mockPage}
        componentRegistry={mockComponentRegistry}
        variables={mockVariables}
        variableValues={variableValues}
      />
    );

    // The variable reference should be resolved to the override value
    expect(screen.getByText("Custom Text")).toBeInTheDocument();
  });

  it("handles missing variables gracefully", () => {
    const pageWithMissingVar: ComponentLayer = {
      id: "page1",
      type: "div",
      name: "Test Page",
      props: { className: "p-4" },
      children: [
        {
          id: "span1",
          type: "span",
          name: "Test Span",
          props: {
            children: { __variableRef: "nonexistent" }, // Missing variable
          },
          children: [],
        },
      ],
    };

    render(
      <LayerRenderer
        page={pageWithMissingVar}
        componentRegistry={mockComponentRegistry}
        variables={mockVariables}
      />
    );

    // Should render without crashing, even with missing variable
    expect(screen.getByTestId("page1")).toBeInTheDocument();
  });
}); 