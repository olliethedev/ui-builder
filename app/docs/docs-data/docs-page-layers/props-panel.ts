import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const PROPS_PANEL_LAYER = {
    "id": "props-panel",
    "type": "div",
    "name": "Props Panel",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "editor-features"
    },
    "children": [
      {
        "type": "span",
        "children": "Props Panel",
        "id": "props-panel-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "props-panel-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "The props panel provides an intuitive interface for editing component properties. It automatically generates appropriate controls based on component Zod schemas using AutoForm, with support for custom field overrides."
      },
      {
        "id": "props-panel-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "props-panel-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "props-panel-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Auto-Generated Forms"
              }
            ]
          },
          {
            "id": "props-panel-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "props-panel-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "http://localhost:3000/examples/editor",
                  "title": "Props Panel Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "props-panel-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Auto-Generated Controls\n\nThe props panel automatically creates appropriate input controls based on component Zod schemas:\n\n```tsx\nimport { z } from 'zod';\nimport { Button } from '@/components/ui/button';\n\n// Component registration with Zod schema\nconst componentRegistry = {\n  Button: {\n    component: Button,\n    schema: z.object({\n      variant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']).default('default'),\n      size: z.enum(['default', 'sm', 'lg', 'icon']).default('default'),\n      disabled: z.boolean().optional(),\n      className: z.string().optional(),\n      children: z.any().optional(),\n    }),\n    from: '@/components/ui/button',\n    defaultChildren: 'Click me'\n  }\n};\n```\n\n## Supported Field Types\n\nAutoForm automatically generates controls for these Zod types:\n\n### Basic Types\n- **`z.string()`** - Text input\n- **`z.number()`** - Number input with step controls\n- **`z.boolean()`** - Checkbox toggle\n- **`z.date()`** - Date picker\n- **`z.enum()`** - Select dropdown\n\n### Advanced Types\n- **`z.array()`** - Array input with add/remove buttons\n- **`z.object()`** - Nested object editor\n- **`z.union()`** - Multiple type selector\n- **`z.optional()`** - Optional field with toggle\n\n### Examples\n\n```tsx\nconst advancedSchema = z.object({\n  // Text with validation\n  title: z.string().min(1, 'Title is required').max(100, 'Too long'),\n  \n  // Number with constraints\n  count: z.coerce.number().min(0).max(100).default(1),\n  \n  // Enum for dropdowns\n  size: z.enum(['sm', 'md', 'lg']).default('md'),\n  \n  // Optional boolean\n  enabled: z.boolean().optional(),\n  \n  // Date input\n  publishDate: z.coerce.date().optional(),\n  \n  // Array of objects\n  items: z.array(z.object({\n    name: z.string(),\n    value: z.string()\n  })).default([]),\n  \n  // Nested object\n  config: z.object({\n    theme: z.enum(['light', 'dark']),\n    autoSave: z.boolean().default(true)\n  }).optional()\n});\n```\n\n## Field Overrides\n\nCustomize the auto-generated form fields using `fieldOverrides`:\n\n```tsx\nimport { classNameFieldOverrides, childrenAsTextareaFieldOverrides } from '@/lib/ui-builder/registry/form-field-overrides';\n\nconst MyComponent = {\n  component: MyComponent,\n  schema: z.object({\n    className: z.string().optional(),\n    children: z.any().optional(),\n    color: z.string().default('#000000'),\n    description: z.string().optional(),\n  }),\n  from: '@/components/my-component',\n  fieldOverrides: {\n    // Use built-in className editor with Tailwind suggestions\n    className: (layer) => classNameFieldOverrides(layer),\n    \n    // Use textarea for children instead of default input\n    children: (layer) => childrenAsTextareaFieldOverrides(layer),\n    \n    // Custom color picker\n    color: {\n      fieldType: 'input',\n      inputProps: {\n        type: 'color',\n        className: 'w-full h-10'\n      }\n    },\n    \n    // Custom textarea with placeholder\n    description: {\n      fieldType: 'textarea',\n      inputProps: {\n        placeholder: 'Enter description...',\n        rows: 3\n      }\n    }\n  }\n};\n```\n\n### Built-in Field Overrides\n\nUI Builder provides several pre-built field overrides:\n\n```tsx\nimport { \n  commonFieldOverrides,\n  classNameFieldOverrides, \n  childrenAsTextareaFieldOverrides,\n  childrenFieldOverrides\n} from '@/lib/ui-builder/registry/form-field-overrides';\n\n// Apply common overrides (className + children)\nfieldOverrides: commonFieldOverrides()\n\n// Or individual overrides\nfieldOverrides: {\n  className: (layer) => classNameFieldOverrides(layer),\n  children: (layer) => childrenFieldOverrides(layer)\n}\n```\n\n## Variable Binding\n\nThe props panel supports variable binding for dynamic content:\n\n```tsx\n// Component with variable-bound property\nconst buttonWithVariable = {\n  id: 'dynamic-button',\n  type: 'Button',\n  props: {\n    children: { __variableRef: 'button-text-var' }, // Bound to variable\n    variant: 'primary' // Static value\n  }\n};\n\n// Variable definition\nconst variables = [\n  {\n    id: 'button-text-var',\n    name: 'buttonText',\n    type: 'string',\n    defaultValue: 'Click me!'\n  }\n];\n```\n\nVariable-bound fields show:\n- **Variable icon** indicating the binding\n- **Variable name** instead of the raw value\n- **Quick unbind** option to convert back to static value\n\n## Panel Features\n\n### Component Actions\n- **Duplicate Component** - Clone the selected component\n- **Delete Component** - Remove the component from the page\n- **Component Type** - Shows the current component type\n\n### Form Validation\n- **Real-time validation** using Zod schema constraints\n- **Error messages** displayed inline with fields\n- **Required field indicators** for mandatory properties\n\n### Responsive Design\n- **Mobile-friendly** interface with collapsible sections\n- **Touch-optimized** controls for mobile editing\n- **Adaptive layout** based on screen size\n\n## Working with Complex Components\n\n### Nested Objects\n```tsx\nconst complexSchema = z.object({\n  layout: z.object({\n    direction: z.enum(['row', 'column']),\n    gap: z.number().default(4),\n    align: z.enum(['start', 'center', 'end'])\n  }),\n  styling: z.object({\n    background: z.string().optional(),\n    border: z.boolean().default(false),\n    rounded: z.boolean().default(true)\n  })\n});\n```\n\n### Array Fields\n```tsx\nconst listSchema = z.object({\n  items: z.array(z.object({\n    label: z.string(),\n    value: z.string(),\n    enabled: z.boolean().default(true)\n  })).default([])\n});\n```\n\n## Integration with Layer Store\n\nThe props panel integrates directly with the layer store:\n\n```tsx\n// Access props panel state\nconst selectedLayerId = useLayerStore(state => state.selectedLayerId);\nconst findLayerById = useLayerStore(state => state.findLayerById);\nconst updateLayer = useLayerStore(state => state.updateLayer);\n\n// Props panel automatically updates when:\n// - A component is selected\n// - Component properties change\n// - Variables are updated\n```\n\n## Best Practices\n\n### Schema Design\n- **Use descriptive property names** that map to actual component props\n- **Provide sensible defaults** using `.default()`\n- **Add validation** with `.min()`, `.max()`, and custom refinements\n- **Use enums** for predefined options\n\n### Field Overrides\n- **Use built-in overrides** for common props like `className` and `children`\n- **Provide helpful placeholders** and labels\n- **Consider user experience** when choosing input types\n- **Test with real content** to ensure fields work as expected\n\n### Performance\n- **Memoize field overrides** to prevent unnecessary re-renders\n- **Use specific field types** rather than generic inputs\n- **Debounce rapid changes** for better performance"
      }
    ]
  } as const satisfies ComponentLayer; 