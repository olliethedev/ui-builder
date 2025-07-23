import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const VARIABLE_BINDING_LAYER = {
    "id": "variable-binding",
    "type": "div",
    "name": "Variable Binding",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "data-variables"
    },
    "children": [
      {
        "type": "span",
        "children": "Variable Binding",
        "id": "variable-binding-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "variable-binding-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "Learn how to connect variables to component properties through the UI and programmatically. This page focuses on the binding mechanics—see **Variables** for fundamentals and **Data Binding** for external data integration."
      },
      {
        "id": "variable-binding-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "variable-binding-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "variable-binding-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Live Variable Binding Example"
              }
            ]
          },
          {
            "id": "variable-binding-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "variable-binding-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "/examples/renderer/variables",
                  "title": "Variable Binding Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "variable-binding-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## How Variable Binding Works\n\nVariable binding replaces static property values with dynamic references. When bound, a component property stores a variable reference object:\n\n```tsx\n// Before binding - static value\nconst button = {\n  props: {\n    children: 'Click me',\n    disabled: false\n  }\n};\n\n// After binding - variable references  \nconst button = {\n  props: {\n    children: { __variableRef: 'button-text-var' },\n    disabled: { __variableRef: 'is-loading-var' }\n  }\n};\n```\n\n💡 **See it in action**: The demo above shows variable bindings with real-time value resolution from the [working example](/examples/renderer/variables).\n\n## Binding Variables Through the UI\n\n### Step-by-Step Binding Process\n\n1. **Select a component** in the editor canvas\n2. **Open the Properties panel** (right sidebar)  \n3. **Find the property** you want to bind\n4. **Click the link icon** (🔗) next to the property field\n5. **Choose a variable** from the dropdown menu\n6. **The property is now bound** and shows the variable info\n\n### Visual Indicators in the Props Panel\n\nBound properties are visually distinct:\n\n- **Link icon** (🔗) indicates the property supports binding\n- **Variable card** displays when a property is bound\n- **Variable name and type** are shown (e.g., `userName` • `string`)\n- **Current value** shows the variable's resolved value\n- **Unlink button** (🔗⛌) allows unbinding (if not immutable)\n- **Lock icon** (🔒) indicates immutable bindings that cannot be changed\n\n### Unbinding Variables\n\nTo remove a variable binding:\n\n1. **Select the component** with bound properties\n2. **Find the bound property** in the props panel\n3. **Click the unlink icon** next to the variable card\n4. **Property reverts** to its schema default value\n\n**Note**: Immutable bindings (🔒) cannot be unbound through the UI.\n\n## Working Example: Variable Bindings in Action\n\nHere's the actual structure from our live demo showing real variable bindings:\n\n```tsx\n// Page structure with variable bindings\nconst page: ComponentLayer = {\n  id: \"variables-demo-page\",\n  type: \"div\",\n  props: {\n    className: \"max-w-4xl mx-auto p-8 space-y-8\"\n  },\n  children: [\n    {\n      id: \"page-title\",\n      type: \"h1\", \n      props: {\n        className: \"text-4xl font-bold text-gray-900\",\n        children: { __variableRef: \"pageTitle\" } // ← Variable binding\n      }\n    },\n    {\n      id: \"user-name\",\n      type: \"span\",\n      props: {\n        className: \"text-gray-900\",\n        children: { __variableRef: \"userName\" } // ← Another binding\n      }\n    },\n    {\n      id: \"primary-button\",\n      type: \"Button\",\n      props: {\n        variant: \"default\",\n        children: { __variableRef: \"buttonText\" }, // ← Button text binding\n        disabled: { __variableRef: \"isLoading\" }   // ← Boolean binding\n      }\n    }\n  ]\n};\n\n// Variables that match the bindings\nconst variables: Variable[] = [\n  {\n    id: \"pageTitle\",\n    name: \"Page Title\",\n    type: \"string\",\n    defaultValue: \"UI Builder Variables Demo\"\n  },\n  {\n    id: \"userName\",\n    name: \"User Name\", \n    type: \"string\",\n    defaultValue: \"John Doe\"\n  },\n  {\n    id: \"buttonText\",\n    name: \"Primary Button Text\",\n    type: \"string\", \n    defaultValue: \"Click Me!\"\n  },\n  {\n    id: \"isLoading\",\n    name: \"Loading State\",\n    type: \"boolean\",\n    defaultValue: false\n  }\n];\n```\n\n## Automatic Variable Binding\n\n### Default Variable Bindings\n\nComponents can automatically bind to variables when added to the canvas:\n\n```tsx\nconst componentRegistry = {\n  UserProfile: {\n    component: UserProfile,\n    schema: z.object({\n      userId: z.string().default(\"user_123\"),\n      displayName: z.string().default(\"John Doe\"),\n      email: z.string().email().default(\"john@example.com\")\n    }),\n    from: \"@/components/ui/user-profile\",\n    defaultVariableBindings: [\n      {\n        propName: \"userId\",\n        variableId: \"current_user_id\",\n        immutable: true // Cannot be unbound\n      },\n      {\n        propName: \"displayName\", \n        variableId: \"current_user_name\",\n        immutable: false // Can be changed\n      }\n    ]\n  }\n};\n```\n\n### Immutable Bindings\n\nImmutable bindings prevent accidental unbinding of critical data:\n\n- **System data**: User IDs, tenant IDs, session info\n- **Security**: Permissions, access levels, authentication state\n- **Branding**: Company logos, colors, brand consistency\n- **Template integrity**: Essential bindings in white-label scenarios\n\n```tsx\n// Example: Brand-consistent component with locked bindings\nconst BrandedButton = {\n  component: Button,\n  schema: z.object({\n    text: z.string().default(\"Click Me\"),\n    brandColor: z.string().default(\"#3b82f6\"),\n    companyName: z.string().default(\"Acme Corp\")\n  }),\n  defaultVariableBindings: [\n    {\n      propName: \"brandColor\",\n      variableId: \"company_brand_color\",\n      immutable: true // 🔒 Locked to maintain brand consistency\n    },\n    {\n      propName: \"companyName\",\n      variableId: \"company_name\", \n      immutable: true // 🔒 Company identity protected\n    }\n    // text prop left unbound for content flexibility\n  ]\n};\n```\n\n## Variable Resolution\n\nAt runtime, variable references are resolved to actual values:\n\n```tsx\n// Variable reference in component props\nconst buttonProps = {\n  children: { __variableRef: 'welcome-message' },\n  disabled: { __variableRef: 'is-loading' }\n};\n\n// Variables definition\nconst variables = [\n  {\n    id: 'welcome-message',\n    name: 'welcomeMessage',\n    type: 'string',\n    defaultValue: 'Welcome!'\n  },\n  {\n    id: 'is-loading',\n    name: 'isLoading', \n    type: 'boolean',\n    defaultValue: false\n  }\n];\n\n// Runtime values override defaults\nconst variableValues = {\n  'welcome-message': 'Hello, Jane!',\n  'is-loading': true\n};\n\n// Resolution process:\n// 1. Find variable by ID → 'welcome-message'\n// 2. Use runtime value if provided → 'Hello, Jane!'\n// 3. Fall back to default if no runtime value → 'Welcome!'\n// 4. Final resolved props: { children: 'Hello, Jane!', disabled: true }\n```\n\n> 📚 **See More**: Learn about [Data Binding](/docs/data-binding) for external data integration and [Rendering Pages](/docs/rendering-pages) for LayerRenderer usage.\n\n## Managing Bindings Programmatically\n\n### Using Layer Store Methods\n\n```tsx\nimport { useLayerStore } from '@/lib/ui-builder/store/layer-store';\n\nfunction CustomBindingControl() {\n  const bindPropToVariable = useLayerStore((state) => state.bindPropToVariable);\n  const unbindPropFromVariable = useLayerStore((state) => state.unbindPropFromVariable);\n  const isBindingImmutable = useLayerStore((state) => state.isBindingImmutable);\n\n  const handleBind = () => {\n    // Bind a component's 'title' prop to a variable\n    bindPropToVariable('button-123', 'title', 'page-title-var');\n  };\n\n  const handleUnbind = () => {\n    // Check if binding is immutable first\n    if (!isBindingImmutable('button-123', 'title')) {\n      unbindPropFromVariable('button-123', 'title');\n    }\n  };\n\n  return (\n    <div>\n      <button onClick={handleBind}>Bind Title</button>\n      <button onClick={handleUnbind}>Unbind Title</button>\n    </div>\n  );\n}\n```\n\n### Variable Reference Detection\n\n```tsx\nimport { isVariableReference } from '@/lib/ui-builder/utils/variable-resolver';\n\n// Check if a prop value is a variable reference\nconst propValue = layer.props.children;\n\nif (isVariableReference(propValue)) {\n  console.log('Bound to variable:', propValue.__variableRef);\n} else {\n  console.log('Static value:', propValue);\n}\n```\n\n## Binding Best Practices\n\n### Design Patterns\n\n- **Use meaningful variable names** that clearly indicate their purpose\n- **Set appropriate default values** for better editor preview experience  \n- **Use immutable bindings** for system-critical or brand-related data\n- **Group related variables** with consistent naming patterns\n- **Bind the same variable** to multiple components for consistency\n\n### UI/UX Considerations\n\n- **Visual indicators** help users understand which properties are bound\n- **Immutable bindings** should be clearly marked to avoid user confusion\n- **Unbinding** should revert to sensible default values from the schema\n- **Variable cards** provide clear information about bound variables\n\n### Performance Tips\n\n- **Variable resolution is optimized** through memoization in the rendering process\n- **Only bound properties** are processed during variable resolution\n- **Static values** pass through without processing overhead\n- **Variable updates** trigger efficient re-renders only for affected components\n\n## Troubleshooting Binding Issues\n\n### Variable Not Found\n- **Check variable ID** matches exactly in both definition and reference\n- **Verify variable exists** in the variables array\n- **Ensure variable scope** includes the needed variable in your context\n\n### Binding Not Working\n- **Confirm variable reference format** uses `{ __variableRef: 'variable-id' }`\n- **Check variable type compatibility** with component prop expectations\n- **Verify component schema** allows the property to be bound\n\n### Immutable Binding Issues\n- **Check defaultVariableBindings** configuration in component registry\n- **Verify immutable flag** is set correctly for auto-bound properties\n- **Use layer store methods** to check binding immutability programmatically\n\n```tsx\n// Debug variable bindings in browser dev tools\nconst layer = useLayerStore.getState().findLayerById('my-component');\nconsole.log('Layer props:', layer?.props);\n\n// Verify variable resolution\nimport { resolveVariableReferences } from '@/lib/ui-builder/utils/variable-resolver';\n\nconst resolved = resolveVariableReferences(\n  layer.props,\n  variables,\n  variableValues\n);\nconsole.log('Resolved props:', resolved);\n```\n\n> 🔄 **Next Steps**: Now that you understand variable binding mechanics, explore [Data Binding](/docs/data-binding) to connect external data sources and [Variables](/docs/variables) for variable management fundamentals."
      }
    ]
  } as const satisfies ComponentLayer; 