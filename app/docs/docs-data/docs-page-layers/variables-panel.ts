import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const VARIABLES_PANEL_LAYER = {
    "id": "variables-panel",
    "type": "div",
    "name": "Variables Panel",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "editor-features"
    },
    "children": [
      {
        "type": "span",
        "children": "Variables Panel",
        "id": "variables-panel-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "variables-panel-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "The variables panel provides a visual interface for creating and managing dynamic data in your layouts. Define variables that can be bound to component properties for data-driven, personalized interfaces."
      },
      {
        "id": "variables-panel-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "variables-panel-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "variables-panel-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Live Example"
              }
            ]
          },
          {
            "id": "variables-panel-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "variables-panel-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "http://localhost:3000/examples/renderer/variables",
                  "title": "Variables Panel Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "variables-panel-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Variable Types\n\nUI Builder supports three core variable types:\n\n```tsx\n// String variable for text content\n{\n  id: 'user-name',\n  name: 'userName',\n  type: 'string',\n  defaultValue: 'John Doe'\n}\n\n// Number variable for counts, prices, etc.\n{\n  id: 'product-count',\n  name: 'productCount', \n  type: 'number',\n  defaultValue: 42\n}\n\n// Boolean variable for toggles, features flags\n{\n  id: 'show-header',\n  name: 'showHeader',\n  type: 'boolean',\n  defaultValue: true\n}\n```\n\n## Creating Variables\n\n### Through UI Builder Props\n\n```tsx\nconst initialVariables = [\n  {\n    id: 'welcome-msg',\n    name: 'welcomeMessage',\n    type: 'string',\n    defaultValue: 'Welcome to our site!'\n  },\n  {\n    id: 'user-age',\n    name: 'userAge',\n    type: 'number', \n    defaultValue: 25\n  },\n  {\n    id: 'is-premium',\n    name: 'isPremiumUser',\n    type: 'boolean',\n    defaultValue: false\n  }\n];\n\n<UIBuilder\n  initialVariables={initialVariables}\n  onVariablesChange={(variables) => {\n    // Save variables to your backend\n    saveVariables(variables);\n  }}\n  allowVariableEditing={true} // Allow users to edit variables\n/>\n```\n\n### Through the Variables Panel\n\nUsers can create variables directly in the editor:\n\n1. **Click \"Add Variable\"** in the variables panel\n2. **Choose variable type** (string, number, boolean)\n3. **Set name and default value**\n4. **Variable is immediately available** for binding\n\n## Variable Binding\n\n### Binding to Component Properties\n\nBind variables to any component property in the props panel:\n\n```tsx\n// Component with variable binding\nconst buttonComponent = {\n  id: 'welcome-button',\n  type: 'Button',\n  props: {\n    children: { __variableRef: 'welcome-msg' }, // Bound to variable\n    disabled: { __variableRef: 'is-premium' },  // Boolean binding\n    className: 'px-4 py-2'                     // Static value\n  }\n};\n```\n\n### Variable Reference Format\n\nVariable bindings use a special reference format:\n\n```tsx\n// Variable reference object\n{ __variableRef: 'variable-id' }\n\n// Examples\nprops: {\n  title: { __variableRef: 'page-title' },    // String variable\n  count: { __variableRef: 'item-count' },    // Number variable\n  visible: { __variableRef: 'show-banner' }  // Boolean variable\n}\n```\n\n## Default Variable Bindings\n\nComponents can automatically bind to variables when added:\n\n```tsx\nconst UserProfile = {\n  component: UserProfile,\n  schema: z.object({\n    name: z.string().default(''),\n    email: z.string().default(''),\n    avatar: z.string().optional()\n  }),\n  from: '@/components/user-profile',\n  // Automatically bind these props to variables\n  defaultVariableBindings: [\n    { \n      propName: 'name', \n      variableId: 'current-user-name',\n      immutable: false // Can be unbound by user\n    },\n    { \n      propName: 'email', \n      variableId: 'current-user-email',\n      immutable: true // Cannot be unbound\n    }\n  ]\n};\n```\n\n## Variable Resolution\n\n### Runtime Values\n\nWhen rendering with `LayerRenderer`, override variable values:\n\n```tsx\n// Variables defined in editor\nconst editorVariables = [\n  { id: 'user-name', name: 'userName', type: 'string', defaultValue: 'Guest' },\n  { id: 'user-age', name: 'userAge', type: 'number', defaultValue: 0 }\n];\n\n// Runtime variable values\nconst runtimeValues = {\n  'user-name': 'Alice Johnson',  // Override with real user data\n  'user-age': 28\n};\n\n<LayerRenderer\n  page={pageData}\n  componentRegistry={componentRegistry}\n  variables={editorVariables}\n  variableValues={runtimeValues} // Dynamic data injection\n/>\n```\n\n### Variable Resolution Process\n\n1. **Editor displays** default values during editing\n2. **Renderer uses** runtime values when provided\n3. **Falls back** to default values if runtime value missing\n4. **Type safety** ensures values match variable types\n\n## Use Cases\n\n### Personalized Content\n\n```tsx\n// User-specific variables\nconst userVariables = [\n  { id: 'user-first-name', name: 'firstName', type: 'string', defaultValue: 'User' },\n  { id: 'user-last-name', name: 'lastName', type: 'string', defaultValue: '' },\n  { id: 'user-points', name: 'loyaltyPoints', type: 'number', defaultValue: 0 }\n];\n\n// Components bound to user data\nconst welcomeSection = {\n  type: 'div',\n  props: { className: 'welcome-section' },\n  children: [\n    {\n      type: 'span',\n      props: {\n        children: { __variableRef: 'user-first-name' }\n      }\n    }\n  ]\n};\n```\n\n### Feature Flags\n\n```tsx\n// Boolean variables for feature toggles\nconst featureFlags = [\n  { id: 'show-beta-features', name: 'showBetaFeatures', type: 'boolean', defaultValue: false },\n  { id: 'enable-notifications', name: 'enableNotifications', type: 'boolean', defaultValue: true }\n];\n\n// Conditionally show components\nconst betaFeature = {\n  type: 'div',\n  props: {\n    className: 'beta-feature',\n    style: { \n      display: { __variableRef: 'show-beta-features' } ? 'block' : 'none'\n    }\n  }\n};\n```\n\n### Multi-Tenant Branding\n\n```tsx\n// Brand-specific variables\nconst brandVariables = [\n  { id: 'company-name', name: 'companyName', type: 'string', defaultValue: 'Your Company' },\n  { id: 'brand-color', name: 'primaryColor', type: 'string', defaultValue: '#3b82f6' },\n  { id: 'logo-url', name: 'logoUrl', type: 'string', defaultValue: '/default-logo.png' }\n];\n\n// Components using brand variables\nconst header = {\n  type: 'header',\n  children: [\n    {\n      type: 'img',\n      props: {\n        src: { __variableRef: 'logo-url' },\n        alt: { __variableRef: 'company-name' }\n      }\n    }\n  ]\n};\n```\n\n## Variable Management\n\n### Panel Controls\n\n- **Add Variable** - Create new variables\n- **Edit Variable** - Modify name, type, or default value\n- **Delete Variable** - Remove unused variables\n- **Search Variables** - Find variables by name\n\n### Variable Validation\n\n- **Unique names** - Prevent duplicate variable names\n- **Type checking** - Ensure values match declared types\n- **Usage tracking** - Show which components use each variable\n- **Orphan detection** - Identify unused variables\n\n### Variable Panel Configuration\n\n```tsx\n<UIBuilder\n  allowVariableEditing={true}    // Enable/disable variable editing\n  initialVariables={variables}   // Pre-populate variables\n  onVariablesChange={(vars) => { // Handle variable changes\n    console.log('Variables updated:', vars);\n  }}\n/>\n```\n\n## Best Practices\n\n### Naming Conventions\n- **Use camelCase** for variable names (`userName`, not `user_name`)\n- **Be descriptive** (`currentUserEmail` vs `email`)\n- **Group related variables** (`user*`, `brand*`, `feature*`)\n\n### Type Selection\n- **Use strings** for text, URLs, IDs, and enum-like values\n- **Use numbers** for counts, measurements, and calculations  \n- **Use booleans** for flags, toggles, and conditional display\n\n### Organization\n- **Start with core variables** that many components will use\n- **Group by purpose** (user data, branding, features)\n- **Document variable purpose** in your codebase\n- **Plan for runtime data** structure when designing variables\n\n### Performance\n- **Avoid excessive variables** that aren't actually needed\n- **Use immutable bindings** for system-level data\n- **Cache runtime values** when possible to reduce re-renders"
      }
    ]
  } as const satisfies ComponentLayer; 