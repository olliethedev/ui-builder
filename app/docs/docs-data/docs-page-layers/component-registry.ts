import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const COMPONENT_REGISTRY_LAYER = {
    "id": "component-registry",
    "type": "div",
    "name": "Components Intro",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "component-system"
    },
    "children": [
      {
        "type": "span",
        "children": "Components Introduction",
        "id": "component-registry-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "component-registry-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "The component registry is the heart of UI Builder. It defines which React components are available in the visual editor and how they should be configured. Understanding the registry is essential for using UI Builder effectively with your own components."
      },
      {
        "id": "component-registry-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## What is the Component Registry?\n\nThe component registry is a TypeScript object that maps component type names to their definitions. It tells UI Builder:\n\n- **How to render** the component in the editor\n- **What properties** it accepts and their types  \n- **How to generate forms** for editing those properties\n- **Import paths** for code generation\n\n```tsx\nimport { ComponentRegistry } from '@/components/ui/ui-builder/types';\n\nconst myComponentRegistry: ComponentRegistry = {\n  // Complex component with React component\n  'Button': {\n    component: Button,               // React component\n    schema: z.object({...}),         // Zod schema for props\n    from: '@/components/ui/button'   // Import path\n  },\n  // Primitive component (no React component needed)\n  'span': {\n    schema: z.object({...})          // Just the schema\n  }\n};\n```\n\n## Registry Structure\n\nEach registry entry can have these properties:\n\n### Required Properties\n- **`schema`**: Zod schema defining the component's props and their types\n- **`component`**: The React component (required for complex components)\n- **`from`**: Import path for code generation (required for complex components)\n\n### Optional Properties\n- **`isFromDefaultExport`**: Boolean, use default export in generated code\n- **`fieldOverrides`**: Object mapping prop names to custom form fields\n- **`defaultChildren`**: Array of ComponentLayer objects or string\n- **`defaultVariableBindings`**: Array of automatic variable bindings\n- **`childOf`**: Array of parent component type names this component can be a child of\n\n## Two Types of Components\n\n### Primitive Components\nHTML elements that don't need a React component:\n\n```tsx\nspan: {\n  schema: z.object({\n    className: z.string().optional(),\n    children: z.any().optional(),\n  })\n  // No 'component' or 'from' needed\n}\n```\n\n### Complex Components\nCustom React components that need to be imported:\n\n```tsx\nButton: {\n  component: Button,\n  schema: z.object({\n    className: z.string().optional(),\n    children: z.any().optional(),\n    variant: z.enum(['default', 'destructive']).default('default'),\n  }),\n  from: '@/components/ui/button'\n}\n```\n\n## Pre-built Component Definitions\n\nUI Builder includes example component definitions for testing and getting started:\n\n```tsx\nimport { primitiveComponentDefinitions } from '@/lib/ui-builder/registry/primitive-component-definitions';\nimport { complexComponentDefinitions } from '@/lib/ui-builder/registry/complex-component-definitions';\n\nconst componentRegistry: ComponentRegistry = {\n  ...primitiveComponentDefinitions, // div, span, h1, h2, h3, p, ul, ol, li, img, iframe, a\n  ...complexComponentDefinitions,   // Button, Badge, Card, Icon, Flexbox, Grid, Markdown, etc.\n};\n```\n\n**Available Pre-built Components:**\n\n**Primitive Components:**\n- **Layout**: `div`, `span` \n- **Typography**: `h1`, `h2`, `h3`, `p`\n- **Lists**: `ul`, `ol`, `li`\n- **Media**: `img`, `iframe`\n- **Navigation**: `a` (links)\n\n**Complex Components:**\n- **Layout**: `Flexbox`, `Grid` \n- **Content**: `Markdown`, `CodePanel`\n- **UI Elements**: `Button`, `Badge`\n- **Advanced**: `Card`, `Icon`, `Accordion`\n\n## Simple Registry Example\n\nHere's a minimal registry with one custom component:\n\n```tsx\nimport { z } from 'zod';\nimport { Alert } from '@/components/ui/alert';\nimport { primitiveComponentDefinitions } from '@/lib/ui-builder/registry/primitive-component-definitions';\nimport { commonFieldOverrides } from '@/lib/ui-builder/registry/form-field-overrides';\n\nconst myComponentRegistry: ComponentRegistry = {\n  // Include primitive components for basic HTML elements\n  ...primitiveComponentDefinitions,\n  \n  // Add your custom component\n  Alert: {\n    component: Alert,\n    schema: z.object({\n      className: z.string().optional(),\n      children: z.any().optional(),\n      variant: z.enum(['default', 'destructive']).default('default'),\n    }),\n    from: '@/components/ui/alert',\n    fieldOverrides: commonFieldOverrides()\n  }\n};\n```\n\n## Component Dependencies\n\n**Important**: Make sure all component types referenced in your `defaultChildren` are included in your registry:\n\n```tsx\nconst componentRegistry: ComponentRegistry = {\n  ...primitiveComponentDefinitions, // ← Includes 'span' needed below\n  Button: {\n    component: Button,\n    schema: z.object({...}),\n    from: '@/components/ui/button',\n    // This Button references 'span' in defaultChildren\n    defaultChildren: [{ \n      id: 'btn-text',\n      type: 'span', // ← Must be in registry\n      name: 'Button Text',\n      props: {},\n      children: 'Click me'\n    }]\n  }\n};\n```\n\n## Parent-Child Constraints with childOf\n\nSome components only make sense as children of specific parent components. For example, `AccordionItem` should only be a child of `Accordion`. The `childOf` property enforces these relationships:\n\n```tsx\nAccordionItem: {\n  component: AccordionItem,\n  schema: z.object({ ... }),\n  from: '@/components/ui/accordion',\n  childOf: ['Accordion']  // Can only be added inside Accordion\n}\n```\n\n### How childOf Works\n\n1. **Add Component Popover**: When adding components, the popover filters out components whose `childOf` doesn't include the current parent type\n2. **Drag and Drop**: Dropping a component is blocked if its `childOf` constraint isn't satisfied by the target parent\n3. **Multiple Parents**: Some components can be children of multiple parent types:\n\n```tsx\nSelectItem: {\n  component: SelectItem,\n  schema: z.object({ ... }),\n  from: '@/components/ui/select',\n  childOf: ['SelectContent', 'SelectGroup']  // Valid in either parent\n}\n```\n\n### Common childOf Patterns\n\n| Component | childOf |\n|-----------|--------|\n| AccordionItem | ['Accordion'] |\n| AccordionTrigger | ['AccordionItem'] |\n| CardHeader, CardContent, CardFooter | ['Card'] |\n| TabsList, TabsContent | ['Tabs'] |\n| TabsTrigger | ['TabsList'] |\n| SelectTrigger, SelectContent | ['Select'] |\n| SelectItem | ['SelectContent', 'SelectGroup'] |\n| DialogTrigger, DialogContent | ['Dialog'] |\n\n### When to Use childOf\n\nUse `childOf` when:\n- A component is semantically part of a compound component (Accordion, Tabs, etc.)\n- A component depends on parent context/state to function properly\n- Placing the component elsewhere would cause errors or unexpected behavior\n\n## Schema Design Principles\n\nThe Zod schema is crucial as it drives the auto-generated form in the properties panel:\n\n```tsx\nschema: z.object({\n  // Use .default() values for better UX\n  title: z.string().default('Default Title'),\n  \n  // Use coerce for type conversion from strings\n  count: z.coerce.number().default(1),\n  \n  // Boolean props become toggle switches\n  disabled: z.boolean().optional(),\n  \n  // Enums become select dropdowns\n  variant: z.enum(['default', 'destructive']).default('default'),\n  \n  // Special props need field overrides\n  className: z.string().optional(),\n  children: z.any().optional(),\n})\n```\n\n## Building Your Own Registry\n\n**For production applications**, you should create your own component registry with your specific components:\n\n```tsx\n// Your production registry\nconst productionRegistry: ComponentRegistry = {\n  // Add only the components you need\n  MyButton: { /* your button definition */ },\n  MyCard: { /* your card definition */ },\n  MyModal: { /* your modal definition */ },\n  // Include primitives for basic HTML\n  ...primitiveComponentDefinitions,\n};\n```\n\n**The pre-built registries are examples** to help you understand the system and test quickly, but you should replace them with your own component definitions that match your design system."
      },
      {
        "id": "component-registry-example",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "component-registry-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "component-registry-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Live Component Registry"
              }
            ]
          },
          {
            "id": "component-registry-demo",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "component-registry-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "/examples/editor",
                  "title": "UI Builder Component Registry Demo",
                  "className": "w-full aspect-video"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "next-steps-registry",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Next Steps\n\nNow that you understand the component registry:\n\n- **Shadcn Registry** - Use all 54 shadcn/ui components and 124 block templates pre-configured\n- **Custom Components** - Learn how to add complex custom components with advanced features\n- **Advanced Component Config** - Explore field overrides, default children, and variable bindings\n- **Variables** - Create dynamic content with variable binding\n\nRemember: The registry is just a configuration object. The real power comes from how you design your components and their schemas to create the best editing experience for your users."
      }
    ]
  } as const satisfies ComponentLayer; 