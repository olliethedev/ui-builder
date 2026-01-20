/* eslint-disable @typescript-eslint/no-explicit-any */

import { pageLayerToCode, generateLayerCode, generatePropsString } from "../components/ui/ui-builder/internal/utils/templates";
import type { ComponentLayer } from '@/components/ui/ui-builder/types';
import type { Variable } from '@/components/ui/ui-builder/types';
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

const mockVariablesWithFunctions: Variable[] = [
  ...mockVariables,
  {
    id: 'fn1',
    name: 'handleClick',
    type: 'function',
    defaultValue: 'mockClickHandler'
  },
  {
    id: 'fn2',
    name: 'handleSubmit',
    type: 'function',
    defaultValue: 'mockSubmitHandler'
  }
];

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

  describe("function variable code generation", () => {
    it("should generate functions.xxx for function-type variable references", () => {
      const props = { 
        className: "button-class", 
        onClick: { __variableRef: 'fn1' }
      };
      const expected = ` className="button-class" onClick={functions.handleClick}`;
      expect(generatePropsString(props, mockVariablesWithFunctions)).toBe(expected);
    });

    it("should generate correct interface with both variables and functions", () => {
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
              onClick: { __variableRef: 'fn1' },
              label: { __variableRef: 'var1' }
            },
            children: [],
          },
        ],
      };
      
      const result = pageLayerToCode(page, componentRegistry, mockVariablesWithFunctions);
      
      // Check that the interface includes both variables and functions
      expect(result).toContain('variables: {');
      expect(result).toContain('functions: {');
      expect(result).toContain('userName: string;');
      expect(result).toContain('handleClick: (...args: unknown[]) => unknown;');
      
      // Check that the props are generated correctly
      expect(result).toContain('onClick={functions.handleClick}');
      expect(result).toContain('label={variables.userName}');
    });

    it("should generate code with only functions when no regular variables are used", () => {
      const functionsOnlyVariables: Variable[] = [
        { id: 'fn1', name: 'handleClick', type: 'function', defaultValue: 'handler' }
      ];
      
      const page: ComponentLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "button1",
            type: "Button",
            props: { 
              onClick: { __variableRef: 'fn1' }
            },
            children: [],
          },
        ],
      };
      
      const result = pageLayerToCode(page, componentRegistry, functionsOnlyVariables);
      
      // Should have functions interface but not variables
      expect(result).toContain('functions: {');
      expect(result).toContain('{ functions }: PageProps');
      expect(result).toContain('onClick={functions.handleClick}');
    });

    it("should mix function and regular variables correctly in layer code", () => {
      const layer: ComponentLayer = {
        id: "button1",
        type: "Button",
        props: { 
          className: "button-class",
          onClick: { __variableRef: 'fn1' },
          label: { __variableRef: 'var1' }
        },
        children: [],
      };
      
      const result = generateLayerCode(layer, 0, mockVariablesWithFunctions);
      
      expect(result).toContain('onClick={functions.handleClick}');
      expect(result).toContain('label={variables.userName}');
    });
  });

  describe("__function_* metadata code generation", () => {
    it("should filter out __function_* metadata props and generate proper function references", () => {
      const props = { 
        className: "button-class", 
        __function_onClick: 'showSuccessToast'
      };
      const result = generatePropsString(props, []);
      
      // Should not contain __function_onClick as a prop
      expect(result).not.toContain('__function_onClick');
      // Should contain proper function reference
      expect(result).toContain('onClick={functions.showSuccessToast}');
      expect(result).toContain('className="button-class"');
    });

    it("should handle multiple __function_* metadata props", () => {
      const props = { 
        __function_onClick: 'handleClick',
        __function_onSubmit: 'handleSubmit',
        className: "form-class"
      };
      const result = generatePropsString(props, []);
      
      expect(result).not.toContain('__function_onClick');
      expect(result).not.toContain('__function_onSubmit');
      expect(result).toContain('onClick={functions.handleClick}');
      expect(result).toContain('onSubmit={functions.handleSubmit}');
      expect(result).toContain('className="form-class"');
    });

    it("should generate proper interface with __function_* metadata", () => {
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
              __function_onClick: 'showSuccessToast'
            },
            children: [],
          },
          {
            id: "button2",
            type: "Button",
            props: { 
              className: "button-class",
              __function_onClick: 'showErrorToast'
            },
            children: [],
          },
        ],
      };
      
      const result = pageLayerToCode(page, componentRegistry, []);
      
      // Should have functions interface
      expect(result).toContain('functions: {');
      expect(result).toContain('showSuccessToast: (...args: unknown[]) => unknown;');
      expect(result).toContain('showErrorToast: (...args: unknown[]) => unknown;');
      // Should have proper destructuring
      expect(result).toContain('{ functions }: PageProps');
      // Should have proper onClick props
      expect(result).toContain('onClick={functions.showSuccessToast}');
      expect(result).toContain('onClick={functions.showErrorToast}');
      // Should NOT have __function_* props
      expect(result).not.toContain('__function_onClick');
    });

    it("should combine __function_* metadata with variable functions", () => {
      const page: ComponentLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "button1",
            type: "Button",
            props: { 
              onClick: { __variableRef: 'fn1' }, // function variable
              label: { __variableRef: 'var1' } // regular variable
            },
            children: [],
          },
          {
            id: "button2",
            type: "Button",
            props: { 
              __function_onClick: 'showToast' // __function_* metadata
            },
            children: [],
          },
        ],
      };
      
      const result = pageLayerToCode(page, componentRegistry, mockVariablesWithFunctions);
      
      // Should have both variables and functions interfaces
      expect(result).toContain('variables: {');
      expect(result).toContain('functions: {');
      // Should have function variable in interface
      expect(result).toContain('handleClick: (...args: unknown[]) => unknown;');
      // Should have __function_* metadata function in interface
      expect(result).toContain('showToast: (...args: unknown[]) => unknown;');
      // Should have proper destructuring
      expect(result).toContain('{ variables, functions }: PageProps');
    });

    it("should handle __function_* in nested layers", () => {
      const page: ComponentLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "container1",
            type: "Container",
            props: {},
            children: [
              {
                id: "button1",
                type: "Button",
                props: { 
                  __function_onClick: 'nestedHandler'
                },
                children: [],
              },
            ],
          },
        ],
      };
      
      const result = pageLayerToCode(page, componentRegistry, []);
      
      expect(result).toContain('functions: {');
      expect(result).toContain('nestedHandler: (...args: unknown[]) => unknown;');
      expect(result).toContain('onClick={functions.nestedHandler}');
    });

    it("should generate proper types from function registry Zod schemas", () => {
      const mockFunctionRegistry = {
        showToast: {
          name: "Show Toast",
          schema: z.tuple([]), // No args
          fn: () => {},
          description: "Shows a toast"
        },
        handleFormSubmit: {
          name: "Submit Form",
          schema: z.tuple([z.string()]), // One string arg
          fn: (_arg: string) => {},
          description: "Submits form"
        },
        processData: {
          name: "Process Data",
          schema: z.tuple([z.string(), z.number()]), // Two args
          fn: (_s: string, _n: number) => {},
          description: "Processes data"
        }
      };

      const page: ComponentLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "button1",
            type: "Button",
            props: { 
              __function_onClick: 'showToast'
            },
            children: [],
          },
          {
            id: "form1",
            type: "Button",
            props: { 
              __function_onSubmit: 'handleFormSubmit'
            },
            children: [],
          },
          {
            id: "processor1",
            type: "Button",
            props: { 
              __function_onClick: 'processData'
            },
            children: [],
          },
        ],
      };
      
      const result = pageLayerToCode(page, componentRegistry, [], mockFunctionRegistry);
      
      // No-arg function should generate () => void
      expect(result).toContain('showToast: () => void;');
      // One-arg function should generate (arg0: string) => void
      expect(result).toContain('handleFormSubmit: (arg0: string) => void;');
      // Two-arg function should generate (arg0: string, arg1: number) => void
      expect(result).toContain('processData: (arg0: string, arg1: number) => void;');
    });

    it("should use explicit typeSignature when provided", () => {
      const mockFunctionRegistry = {
        handleFormSubmit: {
          name: "Submit Form",
          schema: z.tuple([z.custom()]), // Custom type can't be inferred
          fn: () => {},
          description: "Submits form",
          typeSignature: "(e: React.FormEvent<HTMLFormElement>) => Promise<void>"
        },
        showToast: {
          name: "Show Toast",
          schema: z.tuple([]),
          fn: () => {},
          // No typeSignature - should infer from schema
        }
      };

      const page: ComponentLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "button1",
            type: "Button",
            props: { 
              __function_onClick: 'showToast'
            },
            children: [],
          },
          {
            id: "form1",
            type: "Button",
            props: { 
              __function_onSubmit: 'handleFormSubmit'
            },
            children: [],
          },
        ],
      };
      
      const result = pageLayerToCode(page, componentRegistry, [], mockFunctionRegistry);
      
      // showToast should infer from schema: () => void
      expect(result).toContain('showToast: () => void;');
      // handleFormSubmit should use explicit typeSignature
      expect(result).toContain('handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;');
    });

    it("should generate optional parameter types from z.optional() schemas", () => {
      const mockFunctionRegistry = {
        logMessage: {
          name: "Log Message",
          schema: z.tuple([z.string().optional()]),
          fn: () => {},
          description: "Logs a message to console",
        },
        processWithOptionals: {
          name: "Process Data",
          schema: z.tuple([z.string(), z.number().optional()]),
          fn: () => {},
          description: "Processes data with optional count",
        }
      };

      const page: ComponentLayer = {
        id: "page1",
        type: "_page_",
        props: {},
        children: [
          {
            id: "button1",
            type: "Button",
            props: { 
              __function_onClick: 'logMessage'
            },
            children: [],
          },
          {
            id: "button2",
            type: "Button",
            props: { 
              __function_onClick: 'processWithOptionals'
            },
            children: [],
          },
        ],
      };
      
      const result = pageLayerToCode(page, componentRegistry, [], mockFunctionRegistry);
      
      // Single optional arg should generate (arg0?: string) => void
      expect(result).toContain('logMessage: (arg0?: string) => void;');
      // Mixed required and optional should generate (arg0: string, arg1?: number) => void
      expect(result).toContain('processWithOptionals: (arg0: string, arg1?: number) => void;');
    });
  });
});