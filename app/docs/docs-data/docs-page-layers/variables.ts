import type { ComponentLayer } from "@/components/ui/ui-builder/types";

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
        "children": "**Variables are the key to creating dynamic, data-driven interfaces with UI Builder.** Instead of hardcoding static values into your components, variables allow you to bind component properties to dynamic data that can change at runtime.\n\nThis transforms static designs into powerful applications with:\n- **Personalized content** that adapts to user data\n- **Reusable templates** that work across different contexts  \n- **Multi-tenant applications** with customized branding per client\n- **A/B testing** and feature flags through boolean variables"
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
                  "src": "/examples/renderer/variables",
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
        "children": "## Variable Types\n\nUI Builder supports four typed variables:\n\n| Type | Use Case | Default Value |\n|------|----------|---------------|\n| `string` | Text content, names, URLs, colors | Any string |\n| `number` | Counts, ages, prices, quantities | Any number |\n| `boolean` | Feature flags, visibility toggles, active states | `true` or `false` |\n| `function` | Event handlers (onClick, onSubmit, onChange) | Function registry key |\n\n```tsx\ninterface Variable {\n  id: string;           // Unique identifier\n  name: string;         // Display name (becomes property name in generated code)\n  type: 'string' | 'number' | 'boolean' | 'function';\n  defaultValue: string | number | boolean; // Must match the type\n}\n\n// Examples:\nconst stringVar: Variable = {\n  id: 'page-title',\n  name: 'pageTitle',\n  type: 'string',\n  defaultValue: 'Welcome to UI Builder'\n};\n\nconst numberVar: Variable = {\n  id: 'user-age',\n  name: 'userAge', \n  type: 'number',\n  defaultValue: 25\n};\n\nconst booleanVar: Variable = {\n  id: 'is-loading',\n  name: 'isLoading',\n  type: 'boolean',\n  defaultValue: false\n};\n\n// Function variables reference a key in your FunctionRegistry\nconst functionVar: Variable = {\n  id: 'submit-handler',\n  name: 'handleSubmit',\n  type: 'function',\n  defaultValue: 'handleFormSubmit' // Key in functionRegistry\n};\n```\n\n### Function Variables\n\n**Function variables** enable binding event handlers like `onClick`, `onSubmit`, and `onChange` to pre-defined functions. Unlike data variables, function variables reference a key in your `FunctionRegistry`.\n\nTo use function variables:\n1. **Provide a `functionRegistry`** to UIBuilder with your available functions\n2. **Create a function variable** in the Data panel (the \"Function\" type only appears when a registry is provided)\n3. **Bind it to event props** like `onClick` on buttons or `onSubmit` on forms\n\n> **See [Function Registry](/docs/function-registry)** for complete documentation on creating functions, binding them to components, and handling form submissions, toasts, and analytics.\n\n💡 **See it in action**: The demo above shows string, number, and boolean types with real-time variable binding.\n\n## Creating Variables\n\n### Via Initial Variables Prop\n\nSet up variables when initializing the UIBuilder:\n\n```tsx\nimport UIBuilder from '@/components/ui/ui-builder';\nimport { Variable } from '@/components/ui/ui-builder/types';\n\nconst initialVariables: Variable[] = [\n  {\n    id: 'welcome-msg',\n    name: 'welcomeMessage',\n    type: 'string',\n    defaultValue: 'Welcome to our site!'\n  },\n  {\n    id: 'user-count',\n    name: 'userCount',\n    type: 'number', \n    defaultValue: 0\n  },\n  {\n    id: 'show-banner',\n    name: 'showBanner',\n    type: 'boolean',\n    defaultValue: true\n  }\n];\n\nfunction App() {\n  return (\n    <UIBuilder\n      componentRegistry={myComponentRegistry}\n      initialVariables={initialVariables}\n      onVariablesChange={(variables) => {\n        // Persist variable definitions to your backend\n        console.log('Variables updated:', variables);\n      }}\n    />\n  );\n}\n```\n\n### Via the Data Panel\n\nUsers can create variables directly in the editor:\n\n1. **Navigate to the \"Data\" tab** in the left panel\n2. **Click \"Add Variable\"** to create a new variable\n3. **Choose variable type** (string, number, boolean)\n4. **Set name and default value**\n5. **Variable is immediately available** for binding in the props panel\n\n## Using Variables\n\nVariables can be bound to component properties in two ways:\n\n### Manual Binding\nUsers can bind variables to component properties in the props panel by clicking the link icon next to any field.\n\n### Automatic Binding  \nComponents can be configured to automatically bind to specific variables when added:\n\n```tsx\nconst componentRegistry = {\n  UserProfile: {\n    component: UserProfile,\n    schema: z.object({\n      userId: z.string(),\n      displayName: z.string(),\n    }),\n    from: '@/components/ui/user-profile',\n    // Automatically bind user data when component is added\n    defaultVariableBindings: [\n      { \n        propName: 'userId', \n        variableId: 'current-user-id', \n        immutable: true // Cannot be unbound in UI\n      },\n      { \n        propName: 'displayName', \n        variableId: 'current-user-name', \n        immutable: false // Can be changed by users\n      }\n    ]\n  }\n};\n```\n\n**Immutable bindings** prevent users from unbinding critical variables for system data, branding consistency, and template integrity.\n\n> 💡 **Learn more**: See [Variable Binding](/docs/variable-binding) for detailed binding mechanics and [Data Binding](/docs/data-binding) for connecting to external data sources.\n\n## Variable Management\n\n### Controlling Variable Editing\n\nControl whether users can edit variables in the UI:\n\n```tsx\n<UIBuilder\n  allowVariableEditing={false} // Hides add/edit/delete buttons\n  initialVariables={systemVariables}\n  componentRegistry={myComponentRegistry}\n/>\n```\n\nWhen `allowVariableEditing` is `false`:\n- Variables panel becomes read-only\n- \"Add Variable\" button is hidden\n- Edit/delete buttons on individual variables are hidden\n- Variable values can still be overridden at runtime during rendering\n\n### Variable Change Handling\n\nRespond to variable definition changes in the editor:\n\n```tsx\nfunction App() {\n  const handleVariablesChange = (variables: Variable[]) => {\n    // Persist variable definitions to backend\n    fetch('/api/variables', {\n      method: 'POST',\n      body: JSON.stringify(variables)\n    });\n  };\n\n  return (\n    <UIBuilder\n      componentRegistry={myComponentRegistry}\n      onVariablesChange={handleVariablesChange}\n    />\n  );\n}\n```\n\n## Common Use Cases\n\n### Personalization\n\n```tsx\n// Variables for user-specific content\nconst userVariables: Variable[] = [\n  { id: 'user-name', name: 'userName', type: 'string', defaultValue: 'User' },\n  { id: 'user-avatar', name: 'userAvatar', type: 'string', defaultValue: '/default-avatar.png' },\n  { id: 'is-premium', name: 'isPremiumUser', type: 'boolean', defaultValue: false }\n];\n```\n\n### Feature Flags\n\n```tsx\n// Variables for conditional features\nconst featureFlags: Variable[] = [\n  { id: 'show-beta-feature', name: 'showBetaFeature', type: 'boolean', defaultValue: false },\n  { id: 'enable-dark-mode', name: 'enableDarkMode', type: 'boolean', defaultValue: true }\n];\n```\n\n### Multi-tenant Branding\n\n```tsx\n// Variables for client-specific branding\nconst brandingVariables: Variable[] = [\n  { id: 'company-name', name: 'companyName', type: 'string', defaultValue: 'Acme Corp' },\n  { id: 'primary-color', name: 'primaryColor', type: 'string', defaultValue: '#3b82f6' },\n  { id: 'logo-url', name: 'logoUrl', type: 'string', defaultValue: '/default-logo.png' }\n];\n```\n\n## Best Practices\n\n- **Use descriptive names** for variables (e.g., `userName` not `u`)\n- **Choose appropriate types** for your data (string for text, number for counts, boolean for flags)\n- **Set meaningful default values** for better preview experience in the editor\n- **Use immutable bindings** for system-critical data that shouldn't be unbound\n- **Group related variables** with consistent naming patterns\n- **Keep variable names simple** - they become property names in generated code\n- **Separate variable definitions from values** - define structure in the editor, inject data at runtime\n\n## Variable Workflow Summary\n\n1. **Define Variables**: Create variable definitions in the editor or via `initialVariables`\n2. **Bind to Components**: Link component properties to variables in the props panel\n3. **Save Structure**: Store the page structure and variable definitions (via `onChange` and `onVariablesChange`)\n4. **Render with Data**: Use `LayerRenderer` with `variableValues` to inject real data at runtime\n\nThis workflow enables the separation of content structure from actual data, making your UI Builder pages truly dynamic and reusable.\n\n> 📚 **Next Steps**: Learn about [Variable Binding](/docs/variable-binding) for detailed binding mechanics, [Data Binding](/docs/data-binding) for external data integration, and [Rendering Pages](/docs/rendering-pages) for runtime usage."
      }
    ]
  } as const satisfies ComponentLayer; 