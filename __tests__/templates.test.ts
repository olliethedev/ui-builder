/* eslint-disable @typescript-eslint/no-explicit-any */

import { pageLayerToCode, generateLayerCode, generatePropsString } from "../components/ui/ui-builder/internal/templates";
import { PageLayer, ComponentLayer } from "../lib/ui-builder/store/layer-store";
import template from "lodash/template";
import { normalizeSchema } from "./test-utils";

// Mock the componentRegistry with Zod schemas
jest.mock("../lib/ui-builder/registry/component-registry", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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
      Header: {
        schema: z.object({
          title: z.string(),
        }),
        from: "../components/ui/Header",
      },
      Footer: {
        schema: z.object({
          year: z.number(),
        }),
        from: "../components/ui/Footer",
      },
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

    it("should handle boolean and null values correctly", () => {
      const props = {
        isActive: false,
        data: null,
      };
      expect(generatePropsString(props)).toBe(' isActive={false} data={null}');
    });

    it("should handle nested objects and arrays", () => {
      const props = {
        config: {
          theme: "dark",
          layout: {
            header: true,
            footer: false
          }
        },
        items: [1, 2, 3],
      };
      expect(normalizeSchema(generatePropsString(props))).toBe(normalizeSchema(' config={{\"theme\":\"dark\",\"layout\":{\"header\":true,\"footer\":false}}} items={[1,2,3]}'));
    });
  });

  describe("generateLayerCode", () => {

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
            type: "span",
            props: { className: "text-inside" },
            children: "Click me",
          },
        ],
      };
      const expected = `  <Container id="container1">
        <Button className="button-class" />
        <span className="text-inside"> {"Click me"} </span>
      </Container>`;
      expect(normalizeSchema(generateLayerCode(layer, 1))).toBe(normalizeSchema(expected));
    });

    it("should handle layers with complex children structures", () => {
      const layer: ComponentLayer = {
        id: "layout1",
        type: "Layout",
        props: { layoutType: "grid" },
        children: [
          {
            id: "header1",
            type: "Header",
            props: { title: "Welcome" },
            children: [],
          },
          {
            id: "content1",
            type: "Content",
            props: {},
            children: [
              {
                id: "button1",
                type: "Button",
                props: { className: "button-class" },
                children: [],
              },
            ],
          },
        ],
      };
      const expected = `  <Layout layoutType="grid">
        <Header title="Welcome" />
        <Content>
          <Button className="button-class" />
        </Content>
      </Layout>`;
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
            type: "span",
            props: { id: "md1" },
            children: "# Hello",
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
      const expectedImports = `import { Button } from "../components/ui/Button";`;
      const expectedChildren = `    <span id="md1"> {"# Hello"} </span>
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
                type: "span",
                props: { className: "text-inside" },
                children: "Click me",
              },
            ],
          },
          {
            id: "markdown1",
            type: "span",
            props: { id: "md2" },
            children: "## Subtitle",
          },
        ],
      };
      const expectedImports = `import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";`;
      const expectedChildren = `    <Container id="container1">
      <Button className="button-class" />
      <span className="text-inside"> {"Click me"} </span>
    </Container>
    <span id="md2"> {"## Subtitle"} </span>`;
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

    it("should generate code with no additional imports when not required", () => {
      const page: PageLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "text1",
            type: "span",
            props: { className: "simple-text" },
            children: "Just text",
          },
        ],
      };
      const expectedChildren = `    <span className="simple-text"> {"Just text"} </span>`;
      const expected = `
import React from "react";

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

    it("should handle pages with no props and multiple children", () => {
      const page: PageLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "header1",
            type: "Header",
            props: { title: "Home" },
            children: [],
          },
          {
            id: "footer1",
            type: "Footer",
            props: { year: 2023 },
            children: [],
          },
        ],
      };
      const expectedImports = `import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";`;
      const expectedChildren = `    <Header title="Home" />
    <Footer year={2023} />`;
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