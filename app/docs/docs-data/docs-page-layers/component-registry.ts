import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const COMPONENT_REGISTRY_LAYER = {
    "id": "component-registry",
    "type": "div",
    "name": "Getting Started with Components",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "component-system"
    },
    "children": [
      {
        "type": "span",
        "children": "Getting Started with Components",
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
        "children": "The component registry is the heart of UI Builder. It defines which React components are available in the visual editor and how they should be configured. You provide a `ComponentRegistry` object to the `UIBuilder` component via the `componentRegistry` prop."
      },
      {
        "id": "component-registry-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## What is the Component Registry?\n\nThe component registry is a JavaScript object that maps component type names to their definitions. Each definition tells UI Builder:\n\n- How to render the component\n- What properties it accepts  \n- How to generate forms for editing those properties\n- What import path to use when generating code\n\n```tsx\nimport { ComponentRegistry } from '@/components/ui/ui-builder/types';\n\nconst myComponentRegistry: ComponentRegistry = {\n  // Component type name → Component definition\n  'Button': { /* Button definition */ },\n  'span': { /* span definition */ },\n  // ... more components\n};\n```\n\n## Using Pre-built Component Definitions\n\nUI Builder includes comprehensive component definitions for common HTML elements and shadcn/ui components:\n\n```tsx\nimport { primitiveComponentDefinitions } from '@/lib/ui-builder/registry/primitive-component-definitions';\nimport { complexComponentDefinitions } from '@/lib/ui-builder/registry/complex-component-definitions';\nimport UIBuilder from '@/components/ui/ui-builder';\n\n// Start with pre-built components\nconst componentRegistry: ComponentRegistry = {\n  ...primitiveComponentDefinitions, // div, span, img, a, iframe\n  ...complexComponentDefinitions,   // Button, Badge, Card, Icon, etc.\n};\n\nfunction MyApp() {\n  return (\n    <UIBuilder componentRegistry={componentRegistry} />\n  );\n}\n```\n\n### Available Pre-built Components\n\n**Primitive Components** (no React component needed):\n- **Layout**: `div`, `span` \n- **Media**: `img`, `iframe`\n- **Navigation**: `a` (links)\n\n**Complex Components** (with React components):\n- **Layout**: `Flexbox`, `Grid` \n- **Content**: `Markdown`, `CodePanel`\n- **UI Elements**: `Button`, `Badge`\n- **Advanced**: `Card`, `Icon`, `Accordion`\n\n## Adding a Simple Custom Component\n\nHere's how to add your own component to the registry:\n\n```tsx\nimport { z } from 'zod';\nimport { Alert } from '@/components/ui/alert';\nimport { commonFieldOverrides } from '@/lib/ui-builder/registry/form-field-overrides';\n\nconst myComponentRegistry: ComponentRegistry = {\n  // Include pre-built components\n  ...primitiveComponentDefinitions,\n  ...complexComponentDefinitions,\n  \n  // Add your custom component\n  Alert: {\n    component: Alert,\n    schema: z.object({\n      className: z.string().optional(),\n      children: z.any().optional(),\n      variant: z.enum(['default', 'destructive']).default('default'),\n    }),\n    from: '@/components/ui/alert',\n    fieldOverrides: commonFieldOverrides()\n  }\n};\n```\n\n## Basic Component Definition Structure\n\nEvery component definition has these key properties:\n\n### Required Properties\n- **`schema`**: Zod schema defining the component's props and their types\n- **`component`**: The React component (for complex components)\n- **`from`**: Import path for code generation (for complex components)\n\n### Optional Properties\n- **`fieldOverrides`**: Customize how props are edited in the properties panel\n- **`defaultChildren`**: Default child components when added to canvas\n- **`defaultVariableBindings`**: Auto-bind properties to variables\n- **`isFromDefaultExport`**: Use default export when generating code\n\n## Component Dependencies\n\n**Important**: Make sure all component types referenced in your `defaultChildren` are included in your registry:\n\n```tsx\nconst componentRegistry: ComponentRegistry = {\n  ...primitiveComponentDefinitions, // ← Includes 'span' needed below\n  Button: {\n    // This Button references 'span' in defaultChildren\n    defaultChildren: [{ type: 'span', children: 'Click me' }]\n  }\n};\n```\n\n## Next Steps\n\nNow that you understand the component registry basics:\n\n- **Creating Custom Components**: Learn how to add complex custom components with advanced features\n- **Advanced Component Configuration**: Explore field overrides, default children, and variable bindings"
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
                  "className": "w-full aspect-video",
                  "frameBorder": 0
                },
                "children": []
              }
            ]
          }
        ]
      }
    ]
  } as const satisfies ComponentLayer; 