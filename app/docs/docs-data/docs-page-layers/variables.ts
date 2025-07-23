import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const VARIABLES_LAYER = {
    "id": "variables",
    "type": "div",
    "name": "Variables",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "data-variables"
    },
    "children": [
      {
        "type": "span",
        "children": "Variables",
        "id": "variables-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "variables-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "Variables are typed data containers that enable dynamic, data-driven interfaces in UI Builder. They allow you to bind component properties to values that can change at runtime, enabling personalization, theming, and reusable templates."
      },
      {
        "id": "variables-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "variables-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "variables-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Live Variables Example"
              }
            ]
          },
          {
            "id": "variables-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "variables-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "http://localhost:3000/examples/renderer/variables",
                  "title": "Variables Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "variables-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Variable Types\n\nUI Builder supports three primitive variable types:\n\n```tsx\n// String variable for text content\nconst userNameVar: Variable = {\n  id: 'user-name-var',\n  name: 'userName',\n  type: 'string',\n  defaultValue: 'John Doe'\n};\n\n// Number variable for counts, prices, quantities\nconst itemCountVar: Variable = {\n  id: 'item-count-var',\n  name: 'itemCount', \n  type: 'number',\n  defaultValue: 42\n};\n\n// Boolean variable for feature flags, toggles\nconst showBannerVar: Variable = {\n  id: 'show-banner-var',\n  name: 'showBanner',\n  type: 'boolean',\n  defaultValue: true\n};\n```\n\n## Creating Variables\n\n### Through UIBuilder Props\n\nDefine initial variables when initializing the editor:\n\n```tsx\nimport UIBuilder from '@/components/ui/ui-builder';\nimport { Variable } from '@/components/ui/ui-builder/types';\n\nconst initialVariables: Variable[] = [\n  {\n    id: 'welcome-msg',\n    name: 'welcomeMessage',\n    type: 'string',\n    defaultValue: 'Welcome to our site!'\n  },\n  {\n    id: 'user-age',\n    name: 'userAge',\n    type: 'number', \n    defaultValue: 25\n  },\n  {\n    id: 'is-premium',\n    name: 'isPremiumUser',\n    type: 'boolean',\n    defaultValue: false\n  }\n];\n\nfunction App() {\n  return (\n    <UIBuilder\n      initialVariables={initialVariables}\n      onVariablesChange={(variables) => {\n        // Save variables to your backend\n        console.log('Variables updated:', variables);\n      }}\n      allowVariableEditing={true} // Allow users to edit variables\n      componentRegistry={myComponentRegistry}\n    />\n  );\n}\n```\n\n### Through the Variables Panel\n\nUsers can create and manage variables directly in the editor:\n\n1. **Navigate to the \"Data\" tab** in the left panel\n2. **Click \"Add Variable\"** to create a new variable\n3. **Choose variable type** (string, number, boolean)\n4. **Set name and default value**\n5. **Variable is immediately available** for binding in the props panel\n\n## Variable Binding\n\n### Binding Through Props Panel\n\nVariables are bound to component properties through the UI:\n\n1. **Select a component** in the editor\n2. **Open the props panel** (right panel)\n3. **Click the link icon** next to any property field\n4. **Choose a variable** from the dropdown menu\n5. **The property is now bound** to the variable\n\n### Binding Structure\n\nWhen bound, component props store a variable reference:\n\n```tsx\n// Internal structure when a prop is bound to a variable\nconst buttonLayer: ComponentLayer = {\n  id: 'my-button',\n  type: 'Button',\n  props: {\n    children: { __variableRef: 'welcome-msg' }, // Bound to variable\n    disabled: { __variableRef: 'is-loading' },   // Bound to variable\n    variant: 'default' // Static value\n  },\n  children: []\n};\n```\n\n### Immutable Bindings\n\nUse `defaultVariableBindings` to automatically bind variables when components are added:\n\n```tsx\nconst componentRegistry = {\n  UserProfile: {\n    component: UserProfile,\n    schema: z.object({\n      userId: z.string(),\n      displayName: z.string(),\n    }),\n    from: '@/components/ui/user-profile',\n    // Automatically bind user data when component is added\n    defaultVariableBindings: [\n      { \n        propName: 'userId', \n        variableId: 'current-user-id', \n        immutable: true // Cannot be unbound in UI\n      },\n      { \n        propName: 'displayName', \n        variableId: 'current-user-name', \n        immutable: false // Can be changed by users\n      }\n    ]\n  }\n};\n```\n\n## Runtime Variable Resolution\n\n### In LayerRenderer\n\nVariables are resolved when rendering pages:\n\n```tsx\nimport LayerRenderer from '@/components/ui/ui-builder/layer-renderer';\nimport { Variable } from '@/components/ui/ui-builder/types';\n\n// Define variables\nconst variables: Variable[] = [\n  {\n    id: 'user-name',\n    name: 'userName',\n    type: 'string',\n    defaultValue: 'Anonymous'\n  },\n  {\n    id: 'user-age',\n    name: 'userAge',\n    type: 'number',\n    defaultValue: 0\n  }\n];\n\n// Override variable values at runtime\nconst variableValues = {\n  'user-name': 'Jane Smith',\n  'user-age': 30\n};\n\nfunction MyPage() {\n  return (\n    <LayerRenderer \n      page={pageData}\n      componentRegistry={myComponentRegistry}\n      variables={variables}\n      variableValues={variableValues} // Override defaults\n    />\n  );\n}\n```\n\n### Variable Resolution Process\n\n1. **Component props are scanned** for variable references\n2. **Variable references are resolved** using provided `variableValues` or defaults\n3. **Resolved values are passed** to React components\n4. **Components render** with dynamic data\n\n## Managing Variables\n\n### Read-Only Variables\n\nControl whether users can edit variables in the UI:\n\n```tsx\n<UIBuilder\n  allowVariableEditing={false} // Hide add/edit/delete buttons\n  initialVariables={systemVariables}\n  componentRegistry={myComponentRegistry}\n/>\n```\n\n### Variable Change Handling\n\nRespond to variable changes in the editor:\n\n```tsx\nfunction App() {\n  const handleVariablesChange = (variables: Variable[]) => {\n    // Persist to backend\n    fetch('/api/variables', {\n      method: 'POST',\n      body: JSON.stringify(variables)\n    });\n  };\n\n  return (\n    <UIBuilder\n      onVariablesChange={handleVariablesChange}\n      componentRegistry={myComponentRegistry}\n    />\n  );\n}\n```\n\n## Code Generation\n\nVariables are included in generated React code:\n\n```tsx\n// Generated component with variables\ninterface PageProps {\n  variables: {\n    userName: string;\n    userAge: number;\n    showWelcome: boolean;\n  };\n}\n\nconst Page = ({ variables }: PageProps) => {\n  return (\n    <div className=\"p-4\">\n      <Button disabled={variables.showWelcome}>\n        {variables.userName}\n      </Button>\n      <span>Age: {variables.userAge}</span>\n    </div>\n  );\n};\n```\n\n## Use Cases\n\n### Personalization\n\n```tsx\n// Variables for user-specific content\nconst userVariables = [\n  { id: 'user-name', name: 'userName', type: 'string', defaultValue: 'User' },\n  { id: 'user-avatar', name: 'userAvatar', type: 'string', defaultValue: '/default-avatar.png' },\n  { id: 'is-premium', name: 'isPremiumUser', type: 'boolean', defaultValue: false }\n];\n```\n\n### Feature Flags\n\n```tsx\n// Variables for conditional features\nconst featureFlags = [\n  { id: 'show-beta-feature', name: 'showBetaFeature', type: 'boolean', defaultValue: false },\n  { id: 'enable-dark-mode', name: 'enableDarkMode', type: 'boolean', defaultValue: true }\n];\n```\n\n### Multi-tenant Branding\n\n```tsx\n// Variables for client-specific branding\nconst brandingVariables = [\n  { id: 'company-name', name: 'companyName', type: 'string', defaultValue: 'Acme Corp' },\n  { id: 'primary-color', name: 'primaryColor', type: 'string', defaultValue: '#3b82f6' },\n  { id: 'logo-url', name: 'logoUrl', type: 'string', defaultValue: '/default-logo.png' }\n];\n```\n\n### Dynamic Content\n\n```tsx\n// Variables for content management\nconst contentVariables = [\n  { id: 'page-title', name: 'pageTitle', type: 'string', defaultValue: 'Welcome' },\n  { id: 'product-count', name: 'productCount', type: 'number', defaultValue: 0 },\n  { id: 'show-special-offer', name: 'showSpecialOffer', type: 'boolean', defaultValue: false }\n];\n```\n\n## Best Practices\n\n- **Use descriptive names** for variables (e.g., `userName` not `u`)\n- **Choose appropriate types** for your data\n- **Set meaningful default values** for better preview experience\n- **Use immutable bindings** for system-critical data\n- **Group related variables** with consistent naming patterns\n- **Document variable purposes** in your component registry"
      }
    ]
  } as const satisfies ComponentLayer; 