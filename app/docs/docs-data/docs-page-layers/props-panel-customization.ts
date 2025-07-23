import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const PROPS_PANEL_CUSTOMIZATION_LAYER = {
    "id": "props-panel-customization",
    "type": "div",
    "name": "Props Panel Customization",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "editor-features"
    },
    "children": [
      {
        "type": "span",
        "children": "Props Panel Customization",
        "id": "props-panel-customization-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "props-panel-customization-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "Customize the properties panel to create intuitive, context-aware editing experiences. Design custom field types through AutoForm field overrides and create specialized property editors for your components."
      },
      {
        "id": "props-panel-customization-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "props-panel-customization-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "props-panel-customization-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Custom Property Forms"
              }
            ]
          },
          {
            "id": "props-panel-customization-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "props-panel-customization-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "http://localhost:3000/examples/editor",
                  "title": "Props Panel Customization Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "props-panel-customization-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Field Overrides System\n\nUI Builder uses AutoForm to generate property forms from Zod schemas. You can customize individual fields using the `fieldOverrides` property in your component registry:\n\n```tsx\nimport { z } from 'zod';\nimport { classNameFieldOverrides, childrenAsTextareaFieldOverrides } from '@/lib/ui-builder/registry/form-field-overrides';\n\nconst MyCard = {\n  component: Card,\n  schema: z.object({\n    title: z.string().default('Card Title'),\n    description: z.string().optional(),\n    imageUrl: z.string().optional(),\n    className: z.string().optional(),\n    children: z.any().optional(),\n  }),\n  from: '@/components/ui/card',\n  fieldOverrides: {\n    // Use built-in className editor with Tailwind autocomplete\n    className: (layer) => classNameFieldOverrides(layer),\n    \n    // Use textarea for description\n    description: {\n      fieldType: 'textarea',\n      inputProps: {\n        placeholder: 'Enter card description...',\n        rows: 3\n      }\n    },\n    \n    // Custom image picker\n    imageUrl: {\n      fieldType: 'input',\n      inputProps: {\n        type: 'url',\n        placeholder: 'https://example.com/image.jpg'\n      },\n      description: 'URL of the image to display'\n    },\n    \n    // Use textarea for children content\n    children: (layer) => childrenAsTextareaFieldOverrides(layer)\n  }\n};\n```\n\n## Built-in Field Overrides\n\nUI Builder provides several pre-built field overrides for common use cases:\n\n### Common Field Overrides\n\n```tsx\nimport { \n  commonFieldOverrides,\n  classNameFieldOverrides,\n  childrenFieldOverrides,\n  childrenAsTextareaFieldOverrides \n} from '@/lib/ui-builder/registry/form-field-overrides';\n\n// Apply both className and children overrides\nfieldOverrides: commonFieldOverrides()\n\n// Or use individual overrides\nfieldOverrides: {\n  className: (layer) => classNameFieldOverrides(layer),\n  children: (layer) => childrenFieldOverrides(layer)\n}\n```\n\n### className Field Override\n\nProvides intelligent Tailwind CSS class suggestions:\n\n```tsx\nfieldOverrides: {\n  className: (layer) => classNameFieldOverrides(layer)\n}\n\n// Features:\n// - Autocomplete suggestions\n// - Tailwind class validation\n// - Responsive class support\n// - Common pattern suggestions\n```\n\n### children Field Override\n\nSmart handling for component children:\n\n```tsx\nfieldOverrides: {\n  // Standard children editor\n  children: (layer) => childrenFieldOverrides(layer),\n  \n  // Or force textarea for text content\n  children: (layer) => childrenAsTextareaFieldOverrides(layer)\n}\n\n// Features:\n// - String content as textarea\n// - Component children as visual editor\n// - Variable binding support\n```\n\n## AutoForm Field Configuration\n\nCustomize how AutoForm renders your fields:\n\n### Basic Field Types\n\n```tsx\nfieldOverrides: {\n  // Text input with placeholder\n  title: {\n    inputProps: {\n      placeholder: 'Enter title...',\n      maxLength: 100\n    }\n  },\n  \n  // Number input with constraints\n  count: {\n    inputProps: {\n      min: 0,\n      max: 999,\n      step: 1\n    }\n  },\n  \n  // Textarea with custom rows\n  description: {\n    fieldType: 'textarea',\n    inputProps: {\n      rows: 4,\n      placeholder: 'Describe your component...'\n    }\n  },\n  \n  // Color input\n  backgroundColor: {\n    fieldType: 'input',\n    inputProps: {\n      type: 'color'\n    }\n  },\n  \n  // URL input with validation\n  link: {\n    fieldType: 'input',\n    inputProps: {\n      type: 'url',\n      placeholder: 'https://example.com'\n    }\n  }\n}\n```\n\n### Advanced Field Configuration\n\n```tsx\nfieldOverrides: {\n  // Custom field with description and label\n  apiEndpoint: {\n    inputProps: {\n      placeholder: '/api/data',\n      pattern: '^/api/.*'\n    },\n    description: 'Relative API endpoint path',\n    label: 'API Endpoint'\n  },\n  \n  // Hidden field (for internal use)\n  internalId: {\n    isHidden: true\n  },\n  \n  // Field with custom validation message\n  email: {\n    inputProps: {\n      type: 'email',\n      placeholder: 'user@example.com'\n    },\n    description: 'Valid email address required'\n  }\n}\n```\n\n## Custom Field Components\n\nCreate completely custom field editors:\n\n```tsx\n// Custom spacing control component\nconst SpacingControl = ({ value, onChange }) => {\n  const [spacing, setSpacing] = useState(value || { top: 0, right: 0, bottom: 0, left: 0 });\n  \n  const updateSpacing = (side, newValue) => {\n    const updated = { ...spacing, [side]: newValue };\n    setSpacing(updated);\n    onChange(updated);\n  };\n  \n  return (\n    <div className=\"grid grid-cols-3 gap-2 p-2 border rounded\">\n      <div></div>\n      <input \n        type=\"number\" \n        value={spacing.top}\n        onChange={(e) => updateSpacing('top', parseInt(e.target.value))}\n        className=\"text-center p-1 border rounded\"\n        placeholder=\"T\"\n      />\n      <div></div>\n      <input \n        type=\"number\" \n        value={spacing.left}\n        onChange={(e) => updateSpacing('left', parseInt(e.target.value))}\n        className=\"text-center p-1 border rounded\"\n        placeholder=\"L\"\n      />\n      <div className=\"border-2 border-dashed rounded min-h-8\"></div>\n      <input \n        type=\"number\" \n        value={spacing.right}\n        onChange={(e) => updateSpacing('right', parseInt(e.target.value))}\n        className=\"text-center p-1 border rounded\"\n        placeholder=\"R\"\n      />\n      <div></div>\n      <input \n        type=\"number\" \n        value={spacing.bottom}\n        onChange={(e) => updateSpacing('bottom', parseInt(e.target.value))}\n        className=\"text-center p-1 border rounded\"\n        placeholder=\"B\"\n      />\n    </div>\n  );\n};\n\n// Use custom component in field override\nfieldOverrides: {\n  spacing: {\n    renderParent: ({ children, ...props }) => (\n      <SpacingControl {...props} />\n    )\n  }\n}\n```\n\n## Component-Specific Customizations\n\nTailor field overrides to specific component types:\n\n### Button Component\n\n```tsx\nconst ButtonComponent = {\n  component: Button,\n  schema: z.object({\n    variant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']).default('default'),\n    size: z.enum(['default', 'sm', 'lg', 'icon']).default('default'),\n    disabled: z.boolean().optional(),\n    children: z.any().optional(),\n    onClick: z.string().optional(),\n    className: z.string().optional()\n  }),\n  from: '@/components/ui/button',\n  fieldOverrides: {\n    // Use common overrides for basic props\n    ...commonFieldOverrides(),\n    \n    // Custom click handler editor\n    onClick: {\n      inputProps: {\n        placeholder: 'console.log(\"Button clicked\")',\n        family: 'monospace'\n      },\n      description: 'JavaScript code to execute on click',\n      label: 'Click Handler'\n    },\n    \n    // Enhanced variant selector with descriptions\n    variant: {\n      description: 'Visual style of the button'\n    }\n  }\n};\n```\n\n### Image Component\n\n```tsx\nconst ImageComponent = {\n  component: 'img',\n  schema: z.object({\n    src: z.string().url(),\n    alt: z.string(),\n    width: z.coerce.number().optional(),\n    height: z.coerce.number().optional(),\n    className: z.string().optional()\n  }),\n  fieldOverrides: {\n    className: (layer) => classNameFieldOverrides(layer),\n    \n    // Image URL with preview\n    src: {\n      inputProps: {\n        type: 'url',\n        placeholder: 'https://example.com/image.jpg'\n      },\n      description: 'URL of the image to display',\n      // Note: Custom preview would require a custom render component\n    },\n    \n    // Alt text with guidance\n    alt: {\n      inputProps: {\n        placeholder: 'Describe the image for accessibility'\n      },\n      description: 'Alternative text for screen readers'\n    },\n    \n    // Dimensions with constraints\n    width: {\n      inputProps: {\n        min: 1,\n        max: 2000,\n        step: 1\n      }\n    },\n    \n    height: {\n      inputProps: {\n        min: 1,\n        max: 2000,\n        step: 1\n      }\n    }\n  }\n};\n```\n\n## Variable Binding Integration\n\nField overrides work seamlessly with variable binding:\n\n```tsx\n// Component with variable-bindable properties\nconst UserCard = {\n  component: UserCard,\n  schema: z.object({\n    name: z.string().default(''),\n    email: z.string().email().optional(),\n    avatar: z.string().url().optional(),\n    role: z.enum(['admin', 'user', 'guest']).default('user')\n  }),\n  from: '@/components/user-card',\n  fieldOverrides: {\n    name: {\n      inputProps: {\n        placeholder: 'User full name'\n      },\n      description: 'Can be bound to user data variable'\n    },\n    \n    email: {\n      inputProps: {\n        type: 'email',\n        placeholder: 'user@example.com'\n      },\n      description: 'Bind to user email variable for dynamic content'\n    },\n    \n    avatar: {\n      inputProps: {\n        type: 'url',\n        placeholder: 'https://example.com/avatar.jpg'\n      },\n      description: 'Profile picture URL - can be bound to user avatar variable'\n    }\n  }\n};\n\n// Variables for binding\nconst userVariables = [\n  { id: 'user-name', name: 'currentUserName', type: 'string', defaultValue: 'John Doe' },\n  { id: 'user-email', name: 'currentUserEmail', type: 'string', defaultValue: 'john@example.com' },\n  { id: 'user-avatar', name: 'currentUserAvatar', type: 'string', defaultValue: '/default-avatar.png' }\n];\n```\n\n## Best Practices\n\n### Field Override Design\n- **Use built-in overrides** for common properties like `className` and `children`\n- **Provide helpful placeholders** and descriptions\n- **Match field types** to the expected data (url, email, number, etc.)\n- **Include validation hints** in descriptions\n\n### User Experience\n- **Group related fields** logically\n- **Use appropriate input types** for better mobile experience\n- **Provide clear labels** and descriptions\n- **Test with real content** to ensure usability\n\n### Performance\n- **Memoize field override functions** to prevent unnecessary re-renders\n- **Use simple field overrides** when possible instead of custom components\n- **Debounce rapid input changes** for expensive operations\n\n### Accessibility\n- **Provide proper labels** for all form fields\n- **Include helpful descriptions** for complex fields\n- **Ensure keyboard navigation** works correctly\n- **Use semantic form elements** where appropriate"
      }
    ]
  } as const satisfies ComponentLayer; 