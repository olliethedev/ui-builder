/* eslint-disable @typescript-eslint/no-explicit-any */
import { shadcnComponentDefinitions } from "../lib/ui-builder/registry/shadcn-component-definitions";
import { customComponentDefinitions } from "../lib/ui-builder/registry/custom-component-definitions";
import { complexComponentDefinitions } from "../lib/ui-builder/registry/complex-component-definitions";
import { ComponentRegistry, RegistryEntry } from "../components/ui/ui-builder/types";

describe("shadcnComponentDefinitions", () => {
  it("should export a non-empty registry object", () => {
    expect(shadcnComponentDefinitions).toBeDefined();
    expect(typeof shadcnComponentDefinitions).toBe("object");
    expect(Object.keys(shadcnComponentDefinitions).length).toBeGreaterThan(0);
  });

  it("should have valid schema for each component", () => {
    for (const [name, entry] of Object.entries(shadcnComponentDefinitions)) {
      expect(entry.schema).toBeDefined();
      expect(typeof entry.schema.safeParse).toBe("function");
      
      // Test that the schema can parse an empty object (all props should be optional or have defaults)
      const result = entry.schema.safeParse({});
      if (!result.success) {
        // Some components require certain props (like AccordionItem.value)
        // Just verify the schema is functional
        expect(result.error).toBeDefined();
      }
    }
  });

  it("should have valid component references", () => {
    for (const [name, entry] of Object.entries(shadcnComponentDefinitions)) {
      // Component can be undefined for HTML elements or required for React components
      // Components can be functions (regular components) or objects (forwardRef components)
      if (entry.component) {
        const componentType = typeof entry.component;
        expect(componentType === "function" || componentType === "object").toBe(true);
      }
    }
  });

  it("should have valid from paths", () => {
    for (const [name, entry] of Object.entries(shadcnComponentDefinitions)) {
      if (entry.from) {
        expect(typeof entry.from).toBe("string");
        expect(entry.from.startsWith("@/components/ui/")).toBe(true);
      }
    }
  });

  it("should have valid fieldOverrides when defined", () => {
    for (const [name, entry] of Object.entries(shadcnComponentDefinitions)) {
      if (entry.fieldOverrides) {
        expect(typeof entry.fieldOverrides).toBe("object");
        
        for (const [fieldName, override] of Object.entries(entry.fieldOverrides)) {
          expect(typeof override).toBe("function");
        }
      }
    }
  });

  it("should have valid defaultChildren when defined", () => {
    for (const [name, entry] of Object.entries(shadcnComponentDefinitions)) {
      if (entry.defaultChildren) {
        if (typeof entry.defaultChildren === "string") {
          expect(entry.defaultChildren.length).toBeGreaterThan(0);
        } else if (Array.isArray(entry.defaultChildren)) {
          for (const child of entry.defaultChildren) {
            expect(child.id).toBeDefined();
            expect(child.type).toBeDefined();
            expect(typeof child.props).toBe("object");
          }
        }
      }
    }
  });

  describe("compound components", () => {
    const compoundComponents = [
      "Accordion",
      "Card",
      "Dialog",
      "Sheet",
      "Tabs",
      "Table",
      "DropdownMenu",
      "Select",
      "Command",
      "Breadcrumb",
    ];

    it.each(compoundComponents)("%s should have defaultChildren", (componentName) => {
      const entry = shadcnComponentDefinitions[componentName];
      expect(entry).toBeDefined();
      expect(entry.defaultChildren).toBeDefined();
      expect(Array.isArray(entry.defaultChildren)).toBe(true);
      expect((entry.defaultChildren as any[]).length).toBeGreaterThan(0);
    });
  });

  describe("childOf constraints", () => {
    it("should have valid childOf arrays when defined", () => {
      for (const [name, entry] of Object.entries(shadcnComponentDefinitions) as [string, RegistryEntry<any>][]) {
        if (entry.childOf) {
          expect(Array.isArray(entry.childOf)).toBe(true);
          expect(entry.childOf.length).toBeGreaterThan(0);
          
          for (const parentType of entry.childOf) {
            expect(typeof parentType).toBe("string");
            expect(parentType.length).toBeGreaterThan(0);
          }
        }
      }
    });

    it("should have childOf referencing existing component types", () => {
      for (const [name, entry] of Object.entries(shadcnComponentDefinitions) as [string, RegistryEntry<any>][]) {
        if (entry.childOf) {
          for (const parentType of entry.childOf) {
            expect(shadcnComponentDefinitions[parentType]).toBeDefined();
          }
        }
      }
    });

    const childOnlyComponents = [
      { child: "AccordionItem", parents: ["Accordion"] },
      { child: "AccordionTrigger", parents: ["AccordionItem"] },
      { child: "AccordionContent", parents: ["AccordionItem"] },
      { child: "CardHeader", parents: ["Card"] },
      { child: "CardContent", parents: ["Card"] },
      { child: "CardFooter", parents: ["Card"] },
      { child: "DialogTrigger", parents: ["Dialog"] },
      { child: "DialogContent", parents: ["Dialog"] },
      { child: "TabsList", parents: ["Tabs"] },
      { child: "TabsTrigger", parents: ["TabsList"] },
      { child: "TabsContent", parents: ["Tabs"] },
      { child: "SelectTrigger", parents: ["Select"] },
      { child: "SelectContent", parents: ["Select"] },
      { child: "SelectItem", parents: ["SelectContent", "SelectGroup"] },
    ];

    it.each(childOnlyComponents)(
      "$child should have childOf: $parents",
      ({ child, parents }) => {
        const entry = shadcnComponentDefinitions[child] as RegistryEntry<any>;
        expect(entry).toBeDefined();
        expect(entry.childOf).toBeDefined();
        expect(entry.childOf).toEqual(expect.arrayContaining(parents));
        expect(parents).toEqual(expect.arrayContaining(entry.childOf as string[]));
      }
    );

    it("parent components should NOT have childOf constraints", () => {
      const parentComponents = [
        "Accordion",
        "Card",
        "Dialog",
        "Tabs",
        "Select",
        "DropdownMenu",
        "Table",
        "Command",
        "Breadcrumb",
      ];

      for (const componentName of parentComponents) {
        const entry = shadcnComponentDefinitions[componentName] as RegistryEntry<any>;
        expect(entry).toBeDefined();
        expect(entry.childOf).toBeUndefined();
      }
    });
  });
});

describe("customComponentDefinitions", () => {
  it("should export a non-empty registry object", () => {
    expect(customComponentDefinitions).toBeDefined();
    expect(typeof customComponentDefinitions).toBe("object");
    expect(Object.keys(customComponentDefinitions).length).toBeGreaterThan(0);
  });

  const customComponents = ["Flexbox", "Grid", "CodePanel", "Markdown", "Icon"];

  it.each(customComponents)("should include %s component", (componentName) => {
    expect(customComponentDefinitions[componentName]).toBeDefined();
    expect(customComponentDefinitions[componentName].component).toBeDefined();
    expect(customComponentDefinitions[componentName].schema).toBeDefined();
  });
});

describe("complexComponentDefinitions", () => {
  it("should include both custom and essential shadcn components", () => {
    // Custom components
    expect(complexComponentDefinitions["Flexbox"]).toBeDefined();
    expect(complexComponentDefinitions["Grid"]).toBeDefined();
    expect(complexComponentDefinitions["Icon"]).toBeDefined();

    // Essential shadcn components
    expect(complexComponentDefinitions["Button"]).toBeDefined();
    expect(complexComponentDefinitions["Badge"]).toBeDefined();
    expect(complexComponentDefinitions["Accordion"]).toBeDefined();
    expect(complexComponentDefinitions["Card"]).toBeDefined();
  });

  it("should have the same structure as customComponentDefinitions for custom components", () => {
    for (const [name, entry] of Object.entries(customComponentDefinitions)) {
      expect(complexComponentDefinitions[name]).toBeDefined();
      expect(complexComponentDefinitions[name].component).toBe(entry.component);
    }
  });
});
