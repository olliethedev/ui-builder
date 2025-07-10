/* eslint-disable @typescript-eslint/no-explicit-any */

import { pageLayerToCode, generateLayerCode, generatePropsString } from "../components/ui/ui-builder/internal/utils/templates";
import { ComponentLayer } from '@/components/ui/ui-builder/types';
import { Variable } from '@/components/ui/ui-builder/types';
import template from "lodash/template";
import { normalizeSchema } from "./test-utils";
import { z } from "zod";

const componentRegistry = {
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
  DefaultExportComponent: {
    schema: z.object({
      text: z.string(),
    }),
    from: "../components/ui/DefaultExportComponent",
    isFromDefaultExport: true, // Indicate this component uses a default export
  },
};

const mockVariables: Variable[] = [
  {
    id: 'var1',
    name: 'userName',
    type: 'string',
    defaultValue: 'John Doe'
  },
  {
    id: 'var2',
    name: 'userAge',
    type: 'number',
    defaultValue: 25
  },
  {
    id: 'var3',
    name: 'isActive',
    type: 'boolean',
    defaultValue: true
  }
];

// Mock lodash/template
jest.mock("lodash/template", () => {
  return jest.fn().mockImplementation((str: string) => (data: any) => {
    return str
      .replace("<%= imports %>", data.imports)
      .replace("<%= variablePropsInterface %>", data.variablePropsInterface || "")
      .replace("<%= variablePropsParam %>", data.variablePropsParam || "()")
      .replace("<%= pageProps %>", data.pageProps)
      .replace("<%= children %>", data.children);
  });
});

describe("templates.ts", () => {

  describe("generatePropsString", () => {
    it("should generate correct props string for string values", () => {
      const props = { className: "button-class", id: "button-id" };
      const expected = ` className="button-class" id="button-id"`;
      expect(generatePropsString(props)).toBe(expected);
    });

    it("should generate correct props string for number values", () => {
      const props = { width: 100, height: 50 };
      const expected = ` width={100} height={50}`;
      expect(generatePropsString(props)).toBe(expected);
    });

    it("should generate correct props string for object values", () => {
      const props = { style: { color: "red", fontSize: 16 } };
      const expected = ` style={{"color":"red","fontSize":16}}`;
      expect(generatePropsString(props)).toBe(expected);
    });

    it("should filter out undefined values", () => {
      const props = { className: "button-class", id: undefined, width: 100 };
      const expected = ` className="button-class" width={100}`;
      expect(generatePropsString(props)).toBe(expected);
    });

    it("should return empty string for empty props", () => {
      const props = {};
      const expected = "";
      expect(generatePropsString(props)).toBe(expected);
    });

    it("should handle variable references correctly", () => {
      const props = { 
        className: "button-class", 
        label: { __variableRef: 'var1' },
        count: { __variableRef: 'var2' }
      };
      const expected = ` className="button-class" label={variables.userName} count={variables.userAge}`;
      expect(generatePropsString(props, mockVariables)).toBe(expected);
    });

    it("should handle missing variable references", () => {
      const props = { 
        className: "button-class", 
        label: { __variableRef: 'nonexistent' }
      };
      const expected = ` className="button-class" label={undefined}`;
      expect(generatePropsString(props, mockVariables)).toBe(expected);
    });
  });

  describe("generateLayerCode", () => {
    it("should generate correct code for a simple layer without children", () => {
      const layer: ComponentLayer = {
        id: "button1",
        type: "Button",
        props: { className: "button-class" },
        children: [],
      };
      const expected = `<Button className="button-class" />`;
      expect(generateLayerCode(layer)).toBe(expected);
    });

    it("should generate correct code for a layer with string children", () => {
      const layer: ComponentLayer = {
        id: "span1",
        type: "span",
        props: { className: "text-class" },
        children: "Hello World",
      };
      const expected = `<span className="text-class">\n  {"Hello World"}\n</span>`;
      expect(generateLayerCode(layer)).toBe(expected);
    });

    it("should generate correct code for a layer with component children", () => {
      const layer: ComponentLayer = {
        id: "container1",
        type: "Container",
        props: { className: "container-class" },
        children: [
          {
            id: "button1",
            type: "Button",
            props: { className: "button-class" },
            children: [],
          },
        ],
      };
      const expected = `<Container className="container-class">\n  <Button className="button-class" />\n</Container>`;
      expect(generateLayerCode(layer)).toBe(expected);
    });

    it("should handle proper indentation for nested layers", () => {
      const layer: ComponentLayer = {
        id: "container1",
        type: "Container",
        props: { className: "container-class" },
        children: [
          {
            id: "nested-container",
            type: "Container",
            props: { className: "nested-container-class" },
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
      const expected = `<Container className="container-class">\n  <Container className="nested-container-class">\n    <Button className="button-class" />\n  </Container>\n</Container>`;
      expect(generateLayerCode(layer)).toBe(expected);
    });

    it("should generate correct code with variable references", () => {
      const layer: ComponentLayer = {
        id: "button1",
        type: "Button",
        props: { 
          className: "button-class",
          label: { __variableRef: 'var1' }
        },
        children: [],
      };
      const expected = `<Button className="button-class" label={variables.userName} />`;
      expect(generateLayerCode(layer, 0, mockVariables)).toBe(expected);
    });
  });

  describe("pageLayerToCode", () => {
    const mockTemplate = `
import React from "react";
<%= imports %>

<%= variablePropsInterface %>const Page = (<%= variablePropsParam %>) => {
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
          .replace("<%= variablePropsInterface %>", data.variablePropsInterface || "")
          .replace("<%= variablePropsParam %>", data.variablePropsParam || "()")
          .replace("<%= pageProps %>", data.pageProps)
          .replace("<%= children %>", data.children);
      });
    });

    it("should generate correct code for an empty page layer", () => {
      const page: ComponentLayer = {
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
      expect(normalizeSchema(pageLayerToCode(page, componentRegistry))).toBe(normalizeSchema(expected));
    });

    it("should generate correct code for a page layer with components", () => {
      const page: ComponentLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "header1",
            type: "Header",
            props: { title: "Welcome" },
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
      const expectedImports = `import { Header } from "../components/ui/Header";\nimport { Footer } from "../components/ui/Footer";`;
      const expectedChildren = `    <Header title="Welcome" />\n    <Footer year={2023} />`;
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
      expect(normalizeSchema(pageLayerToCode(page, componentRegistry))).toBe(normalizeSchema(expected));
    });

    it("should generate correct code with page props", () => {
      const page: ComponentLayer = {
        id: "page1",
        type: "_page_",
        props: { className: "page-class", id: "main-page" },
        children: [
          {
            id: "button1",
            type: "Button",
            props: { className: "button-class" },
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
    <div className="page-class" id="main-page">
${expectedChildren}
  </div>
    );
};

export default Page;
      `;
      expect(normalizeSchema(pageLayerToCode(page, componentRegistry))).toBe(normalizeSchema(expected));
    });

    it("should handle default export components correctly", () => {
      const page: ComponentLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "defaultComponent1",
            type: "DefaultExportComponent",
            props: { text: "Hello" },
            children: [],
          },
        ],
      };
      const expectedImports = `import DefaultExportComponent from "../components/ui/DefaultExportComponent";`;
      const expectedChildren = `    <DefaultExportComponent text="Hello" />`;
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
      expect(normalizeSchema(pageLayerToCode(page, componentRegistry))).toBe(normalizeSchema(expected));
    });

    it("should handle layers without children correctly", () => {
      const page: ComponentLayer = {
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
      expect(normalizeSchema(pageLayerToCode(page, componentRegistry))).toBe(normalizeSchema(expected));
    });

    it("should generate code with no additional imports when not required", () => {
      const page: ComponentLayer = {
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
      expect(normalizeSchema(pageLayerToCode(page, componentRegistry))).toBe(normalizeSchema(expected));
    });

    it("should generate correct code with variables", () => {
      const page: ComponentLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "button1",
            type: "Button",
            props: { 
              className: "button-class",
              label: { __variableRef: 'var1' }
            },
            children: [],
          },
        ],
      };
      const expectedImports = `import { Button } from "../components/ui/Button";`;
      const expectedChildren = `    <Button className="button-class" label={variables.userName} />`;
      const expectedInterface = `interface PageProps {
  variables: {
    userName: string;
    userAge: number;
    isActive: boolean;
  };
}

`;
      const expected = `
import React from "react";
${expectedImports}

${expectedInterface}const Page = ({ variables }: PageProps) => {
  return (
    <div>
${expectedChildren}
  </div>
    );
};

export default Page;
      `;
      expect(normalizeSchema(pageLayerToCode(page, componentRegistry, mockVariables))).toBe(normalizeSchema(expected));
    });

    it("should generate correct code without variables interface when no variables", () => {
      const page: ComponentLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "button1",
            type: "Button",
            props: { className: "button-class" },
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
      expect(normalizeSchema(pageLayerToCode(page, componentRegistry, []))).toBe(normalizeSchema(expected));
    });
  });
});