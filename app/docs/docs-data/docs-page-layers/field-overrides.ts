import type { ComponentLayer } from "@/components/ui/ui-builder/types";

export const FIELD_OVERRIDES_LAYER = {
    "id": "field-overrides",
    "type": "div",
    "name": "Advanced Configuration",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "component-system"
    },
    "children": [
      {
        "type": "span",
        "children": "Advanced Component Configuration",
        "id": "field-overrides-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "field-overrides-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "Take your component integration to the next level with field overrides, default children, and automatic variable bindings. These advanced techniques create polished, user-friendly editing experiences."
      },
      {
        "id": "field-overrides-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Field Overrides\n\nField overrides replace auto-generated form fields with specialized input controls. Instead of basic text inputs, users get rich editors, color pickers, icon selectors, and more.\n\n### Available Built-in Field Overrides\n\n#### `classNameFieldOverrides(layer)`\nAdvanced Tailwind CSS class editor with:\n- Auto-complete for Tailwind classes\n- Responsive breakpoint controls (sm:, md:, lg:, xl:)\n- Visual class grouping and validation\n- Theme-aware suggestions\n\n```tsx\nfieldOverrides: {\n  className: (layer) => classNameFieldOverrides(layer)\n}\n```\n\n#### `childrenFieldOverrides(layer)`\nSearchable component selector for child components:\n- Dropdown with available component types\n- Search and filter capabilities\n- Respects component hierarchy\n\n```tsx\nfieldOverrides: {\n  children: (layer) => childrenFieldOverrides(layer)\n}\n```\n\n#### `childrenAsTextareaFieldOverrides(layer)`\nMulti-line text editor for simple text content:\n- Perfect for span, p, and heading elements\n- Multi-line editing support\n\n```tsx\nfieldOverrides: {\n  children: (layer) => childrenAsTextareaFieldOverrides(layer)\n}\n```\n\n#### `childrenAsTipTapFieldOverrides(layer)`\nRich text editor using TipTap:\n- WYSIWYG markdown editing\n- Formatting toolbar with bold, italic, links\n- Ideal for Markdown components\n\n```tsx\nfieldOverrides: {\n  children: (layer) => childrenAsTipTapFieldOverrides(layer)\n}\n```\n\n#### `iconNameFieldOverrides(layer)`\nVisual icon picker:\n- Grid of available icons\n- Search functionality\n- Live preview\n\n```tsx\nfieldOverrides: {\n  iconName: (layer) => iconNameFieldOverrides(layer)\n}\n```\n\n#### `textInputFieldOverrides(layer, allowVariableBinding, propName)`\nEnhanced text input with optional variable binding support:\n- Variable binding UI when `allowVariableBinding` is true\n- Automatic binding/unbinding controls\n- Immutable binding badges\n\n```tsx\nfieldOverrides: {\n  title: (layer) => textInputFieldOverrides(layer, true, 'title')\n}\n```\n\n#### `commonFieldOverrides()`\nConvenience function that applies standard overrides for `className` and `children`:\n\n```tsx\nfieldOverrides: commonFieldOverrides()\n// Equivalent to:\n// {\n//   className: (layer) => classNameFieldOverrides(layer),\n//   children: (layer) => childrenFieldOverrides(layer)\n// }\n```\n\n### Creating Custom Field Overrides\n\nCreate specialized input controls for unique data types:\n\n```tsx\nimport { AutoFormInputComponentProps } from '@/components/ui/ui-builder/types';\nimport { FormItem, FormLabel, FormControl } from '@/components/ui/form';\n\nconst colorPickerFieldOverride = (layer) => ({\n  fieldType: ({ label, field }: AutoFormInputComponentProps) => (\n    <FormItem>\n      <FormLabel>{label}</FormLabel>\n      <FormControl>\n        <div className=\"flex gap-2 items-center\">\n          <input\n            type=\"color\"\n            value={field.value || '#000000'}\n            onChange={(e) => field.onChange(e.target.value)}\n            className=\"w-12 h-8 rounded border cursor-pointer\"\n          />\n          <input\n            type=\"text\"\n            value={field.value || ''}\n            onChange={(e) => field.onChange(e.target.value)}\n            placeholder=\"#000000\"\n            className=\"flex-1 px-3 py-2 border rounded-md\"\n          />\n        </div>\n      </FormControl>\n    </FormItem>\n  )\n});\n\n// Use in component definition:\nfieldOverrides: {\n  brandColor: colorPickerFieldOverride,\n  className: (layer) => classNameFieldOverrides(layer)\n}\n```\n\n### Conditional Field Overrides\n\nHide or show fields based on other prop values:\n\n```tsx\nconst conditionalFieldOverride = (layer) => ({\n  isHidden: (currentValues) => currentValues.mode === 'simple',\n  fieldType: ({ label, field }) => (\n    <FormItem>\n      <FormLabel>{label}</FormLabel>\n      <FormControl>\n        <AdvancedEditor value={field.value} onChange={field.onChange} />\n      </FormControl>\n    </FormItem>\n  )\n});\n```\n\n## Default Children\n\nProvide sensible default child components when users add your component to the canvas.\n\n### Simple Text Defaults\n\nFor basic text components:\n\n```tsx\nspan: {\n  schema: z.object({\n    className: z.string().optional(),\n    children: z.string().optional(),\n  }),\n  fieldOverrides: {\n    className: (layer) => classNameFieldOverrides(layer),\n    children: (layer) => childrenAsTextareaFieldOverrides(layer)\n  },\n  defaultChildren: \"Default text content\"\n}\n```\n\n### Component Layer Defaults\n\nFor complex nested structures:\n\n```tsx\nButton: {\n  component: Button,\n  schema: z.object({\n    className: z.string().optional(),\n    children: z.any().optional(),\n    variant: z.enum(['default', 'destructive']).default('default'),\n  }),\n  from: '@/components/ui/button',\n  defaultChildren: [\n    {\n      id: \"button-text\",\n      type: \"span\",\n      name: \"Button Text\",\n      props: {},\n      children: \"Click me\",\n    }\n  ],\n  fieldOverrides: commonFieldOverrides()\n}\n```\n\n**Important**: All component types referenced in `defaultChildren` must exist in your registry.\n\n### Rich Default Structures\n\nCreate sophisticated default layouts:\n\n```tsx\nCard: {\n  component: Card,\n  schema: z.object({\n    className: z.string().optional(),\n    children: z.any().optional(),\n  }),\n  from: '@/components/ui/card',\n  defaultChildren: [\n    {\n      id: \"card-header\",\n      type: \"div\",\n      name: \"Header\",\n      props: { className: \"p-6 pb-0\" },\n      children: [\n        {\n          id: \"card-title\",\n          type: \"span\",\n          name: \"Title\",\n          props: { className: \"text-2xl font-semibold\" },\n          children: \"Card Title\"\n        }\n      ]\n    },\n    {\n      id: \"card-content\",\n      type: \"div\",\n      name: \"Content\",\n      props: { className: \"p-6\" },\n      children: \"Card content goes here.\"\n    }\n  ],\n  fieldOverrides: commonFieldOverrides()\n}\n```\n\n## Default Variable Bindings\n\nAutomatically bind component properties to variables when components are added to the canvas. Perfect for system data, branding, and user information.\n\n### Basic Variable Bindings\n\n```tsx\nUserProfile: {\n  component: UserProfile,\n  schema: z.object({\n    userId: z.string().default(''),\n    displayName: z.string().default('Anonymous'),\n    email: z.string().optional(),\n  }),\n  from: '@/components/ui/user-profile',\n  defaultVariableBindings: [\n    {\n      propName: 'userId',\n      variableId: 'current_user_id',\n      immutable: true // System data - cannot be unbound\n    },\n    {\n      propName: 'displayName',\n      variableId: 'current_user_name', \n      immutable: false // Can be customized\n    }\n  ],\n  fieldOverrides: {\n    userId: (layer) => textInputFieldOverrides(layer, true, 'userId'),\n    displayName: (layer) => textInputFieldOverrides(layer, true, 'displayName'),\n    email: (layer) => textInputFieldOverrides(layer, true, 'email'),\n  }\n}\n```\n\n### Immutable Bindings for Critical Data\n\nUse `immutable: true` to prevent users from unbinding critical data:\n\n```tsx\nBrandedButton: {\n  component: BrandedButton,\n  schema: z.object({\n    text: z.string().default('Click me'),\n    brandColor: z.string().default('#000000'),\n    companyName: z.string().default('Company'),\n  }),\n  from: '@/components/ui/branded-button',\n  defaultVariableBindings: [\n    {\n      propName: 'brandColor',\n      variableId: 'primary_brand_color',\n      immutable: true // Prevents breaking brand guidelines\n    },\n    {\n      propName: 'companyName',\n      variableId: 'company_name',\n      immutable: true // Consistent branding\n    }\n    // 'text' is not bound, allowing content customization\n  ],\n  fieldOverrides: {\n    text: (layer) => textInputFieldOverrides(layer, true, 'text'),\n    brandColor: (layer) => textInputFieldOverrides(layer, true, 'brandColor'),\n    companyName: (layer) => textInputFieldOverrides(layer, true, 'companyName'),\n  }\n}\n```\n\n**When to Use Immutable Bindings:**\n- **System data**: User IDs, tenant IDs, system versions\n- **Brand consistency**: Colors, logos, company names\n- **Security**: Roles, permissions, access levels\n- **Template integrity**: Critical variables in white-label scenarios\n\n### Variable Binding UI\n\nWhen using `textInputFieldOverrides` with variable binding enabled, users see:\n- **🔗 Bind Variable** button for unbound properties\n- **Variable name, type, and default value** for bound properties\n- **🔒 Immutable badge** for protected bindings\n- **Unbind button** for mutable bindings only\n\n## Live Example\n\nSee these advanced configuration techniques in action:"
      },
      {
        "id": "immutable-bindings-example",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "example-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "example-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Live Demo: Immutable Bindings"
              }
            ]
          },
          {
            "id": "example-demo",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "example-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "/examples/editor/immutable-bindings",
                  "title": "UI Builder Immutable Bindings Demo",
                  "className": "w-full aspect-video"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "advanced-patterns-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Best Practices\n\n### Field Overrides\n- **Always override `className`** with `classNameFieldOverrides()` for consistent Tailwind editing\n- **Choose appropriate children overrides** based on content type:\n  - `childrenAsTextareaFieldOverrides()` for simple text (span, p, headings)\n  - `childrenFieldOverrides()` for nested components (div, containers)\n  - `childrenAsTipTapFieldOverrides()` for rich text (Markdown components)\n- **Create domain-specific overrides** for complex data types (colors, dates, files)\n- **Use conditional overrides** to hide advanced options in simple mode\n\n### Default Children\n- **Provide meaningful defaults** that demonstrate proper component usage\n- **Keep structures shallow initially** to avoid overwhelming new users\n- **Use descriptive names** for child layers to help with navigation\n- **Include all dependencies** - ensure referenced component types are in your registry\n- **Use unique IDs** to prevent conflicts when components are duplicated\n\n### Variable Bindings\n- **Use immutable bindings** for:\n  - System data (user IDs, system versions)\n  - Brand elements (colors, logos, company names)\n  - Security-sensitive data (roles, permissions)\n  - Template integrity variables\n- **Leave content variables mutable** so editors can customize text and messaging\n- **Combine with field overrides** using `textInputFieldOverrides()` for the best UX\n- **Test binding scenarios** to ensure the editing experience is smooth\n\n### Performance Tips\n- **Use `commonFieldOverrides()`** when you need standard className/children handling\n- **Memoize expensive overrides** if they perform complex calculations\n- **Keep default children reasonable** to avoid slow initial renders\n- **Cache field override functions** to prevent unnecessary re-renders\n\n## Integration with Other Features\n\nThese advanced configuration techniques work seamlessly with:\n- **Variables Panel** - Manage variables that power your bindings\n- **Props Panel** - Enhanced forms with your custom field overrides\n- **Code Generation** - Exported code respects your component definitions\n- **LayerRenderer** - Variable values are resolved at render time\n\n## What's Next?\n\nWith advanced configuration mastered, explore:\n- **Variables** - Create dynamic, data-driven interfaces\n- **Panel Configuration** - Customize the editor panels themselves\n- **Persistence** - Save and load your enhanced component configurations\n\nThese advanced techniques transform UI Builder from a simple visual editor into a powerful, domain-specific design tool tailored to your exact needs."
      }
    ]
  } as const satisfies ComponentLayer; 