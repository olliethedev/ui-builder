
import { pageLayerToCode, generateLayerCode, generatePropsString } from "../components/ui/ui-builder/internal/templates";
import { PageLayer, TextLayer, ComponentLayer } from "../lib/ui-builder/store/layer-store";
import template from "lodash/template";
import { normalizeSchema } from "./test-utils";

// Mock the componentRegistry with Zod schemas
jest.mock("../lib/ui-builder/store/component-registry", () => {
    const { z } = require('zod'); 
  return {
    componentRegistry: {
      Button: {
        schema: z.object({
          id: z.string().optional(),
          className: z.string().optional(),
          onClick: z.function().optional(),
          // Add other props as needed
        }),
        from: "../components/ui/Button",
        component: () => null, // Mock component
      },
      Container: {
        schema: z.object({
          id: z.string().optional(),
          className: z.string().optional(),
          // Add other props as needed
        }),
        from: "../components/ui/Container",
        component: () => null, // Mock component
      },
      // Add other components with their respective schemas
    },
  };
});

// Mock lodash/template
jest.mock("lodash/template", () => {
  return jest.fn().mockImplementation((str: string) => (data: any) => {
    return str
      .replace("<%= imports %>", data.imports)
      .replace("<%= pageProps %>", data.pageProps)
      .replace("<%= children %>", data.children);
  });
});

describe("templates.ts", () => {
  describe("generatePropsString", () => {
    it("should return an empty string when no props are provided", () => {
      const props = {};
      expect(generatePropsString(props)).toBe("");
    });

    it("should generate props string correctly for various prop types", () => {
      const props = {
        id: "main",
        disabled: true,
        count: 5,
        style: { color: "red" },
        undefinedProp: undefined,
      };
      expect(generatePropsString(props)).toBe(
        ' id="main" disabled={true} count={5} style={{\"color\":\"red\"}}'
      );
    });

    it("should exclude props with undefined values", () => {
      const props = {
        visible: true,
        hidden: undefined,
      };
      expect(generatePropsString(props)).toBe(' visible={true}');
    });
  });

  describe("generateLayerCode", () => {
    it("should generate code for a text layer with span", () => {
      const layer: TextLayer = {
        id: "text1",
        type: "_text_",
        props: { id: "text1", className: "text-class" },
        text: "Hello World",
        textType: "text",
      };
      const expected = `  <span id="text1" className="text-class">{"Hello World"}</span>`;
      expect(generateLayerCode(layer, 1)).toBe(expected);
    });

    it("should generate code for a text layer with Markdown", () => {
      const layer: TextLayer = {
        id: "markdown1",
        type: "_text_",
        props: { id: "markdown1" },
        text: "# Title",
        textType: "markdown",
      };
      const expected = `  <Markdown id="markdown1">{"# Title"}</Markdown>`;
      expect(generateLayerCode(layer, 1)).toBe(expected);
    });

    it("should generate self-closing tag for layers without children", () => {
      const layer: ComponentLayer = {
        id: "button1",
        type: "Button",
        props: { 
            className: "button-class"
        },
        children: [],
      };
      const expected = `  <Button className="button-class" />`;
      expect(generateLayerCode(layer, 1)).toBe(expected);
    });

    it("should generate nested layers correctly", () => {
      const layer: ComponentLayer = {
        id: "container1",
        type: "Container",
        props: { id: "container1" },
        children: [
          {
            id: "button1",
            type: "Button",
            props: { 
                className: "button-class"
             },
            children: [],
          },
          {
            id: "text1",
            type: "_text_",
            props: { className: "text-inside" },
            text: "Click me",
            textType: "text",
          },
        ],
      };
      const expected = `  <Container id="container1">
        <Button className="button-class" />
        <span className="text-inside">{"Click me"}</span>
      </Container>`;
      expect(normalizeSchema(generateLayerCode(layer, 1))).toBe(normalizeSchema(expected));
    });
  });

  describe("pageLayerToCode", () => {
    const mockTemplate = `
import React from "react";
<%= imports %>

const Page = () => {
  return (
    <div<%= pageProps %>>
<%= children %>
  </div>
  );
};

export default Page;
`;

    beforeEach(() => {
      (template as jest.Mock).mockImplementation(() => (data: any) => {
        return mockTemplate
          .replace("<%= imports %>", data.imports)
          .replace("<%= pageProps %>", data.pageProps)
          .replace("<%= children %>", data.children);
      });
    });

    it("should generate correct code for an empty page layer", () => {
      const page: PageLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [],
      };
      const expected = `
import React from "react";

const Page = () => {
  return (
    <div>
  </div>
  );
};

export default Page;
`;
      expect(normalizeSchema(pageLayerToCode(page))).toBe(normalizeSchema(expected));
    });

    it("should include imports for markdown and components", () => {
      const page: PageLayer = {
        id: "page1",
        type: "_page_",
        props: { id: "page1" },
        children: [
          {
            id: "markdown1",
            type: "_text_",
            props: { id: "md1" },
            text: "# Hello",
            textType: "markdown",
          },
          {
            id: "button1",
            type: "Button",
            props: { 
                className: "button-class"
             },
            children: [],
          },
        ],
      };
      const expectedImports = `import { Markdown } from "@/components/ui/ui-builder/markdown";
import { Button } from "../components/ui/Button";`;
      const expectedChildren = `    <Markdown id="md1">{"# Hello"}</Markdown>
    <Button className="button-class" />`;
      const expected = `
import React from "react";
${expectedImports}

const Page = () => {
  return (
    <div id="page1">
${expectedChildren}
  </div>
  );
};

export default Page;
`;
      expect(normalizeSchema(pageLayerToCode(page))).toBe(normalizeSchema(expected));
    });

    it("should handle nested layers and generate all necessary imports", () => {
      const page: PageLayer = {
        id: "page1",
        type: "_page_",
        props: { className: "main-page" },
        children: [
          {
            id: "container1",
            type: "Container",
            props: { id: "container1" },
            children: [
              {
                id: "button1",
                type: "Button",
                    props: { 
                        className: "button-class"
                    },
                children: [],
              },
              {
                id: "text1",
                type: "_text_",
                props: { className: "text-inside" },
                text: "Click me",
                textType: "text",
              },
            ],
          },
          {
            id: "markdown1",
            type: "_text_",
            props: { id: "md2" },
            text: "## Subtitle",
            textType: "markdown",
          },
        ],
      };
      const expectedImports = `import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Markdown } from "@/components/ui/ui-builder/markdown";`;

      const expectedChildren = `    <Container id="container1">
      <Button className="button-class" />
      <span className="text-inside">{"Click me"}</span>
    </Container>
    <Markdown id="md2">{"## Subtitle"}</Markdown>`;
      const expected = `
import React from "react";
${expectedImports}

const Page = () => {
  return (
    <div className="main-page">
${expectedChildren}
  </div>
  );
};

export default Page;
`;
      expect(normalizeSchema(pageLayerToCode(page))).toBe(normalizeSchema(expected));
    });

    it("should handle layers without children correctly", () => {
      const page: PageLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "button1",
            type: "Button",
            props: { 
                className: "button-class"
             },
            children: [],
          },
        ],
      };
      const expectedImports = `import { Button } from "../components/ui/Button";`;
      const expectedChildren = `    <Button className="button-class" />`;
      const expected = `
import React from "react";
${expectedImports}

const Page = () => {
  return (
    <div>
${expectedChildren}
  </div>
  );
};

export default Page;
`;
      expect(normalizeSchema(pageLayerToCode(page))).toBe(normalizeSchema(expected));
    });
  });
});