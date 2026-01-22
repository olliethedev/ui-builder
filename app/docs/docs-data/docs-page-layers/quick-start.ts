import type { ComponentLayer } from "@/components/ui/ui-builder/types";

export const QUICK_START_LAYER = {
    "id": "quick-start",
    "type": "div",
    "name": "Quick Start",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "core"
    },
    "children": [
      {
        "type": "span",
        "children": "Quick Start",
        "id": "quick-start-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "quick-start-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "Get up and running with UI Builder in minutes. This guide covers installation, basic setup, and your first working editor."
      },
      {
        "id": "quick-start-prerequisites",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Prerequisites\n\nBefore installing UI Builder, ensure your project meets these requirements:\n\n- **Next.js 14+** (App Router recommended, Pages Router supported)\n- **React 18+** (React 19 supported with `.npmrc` workaround)\n- **TypeScript** (recommended but not required)\n- **Tailwind CSS** with [CSS variables](https://ui.shadcn.com/docs/theming) enabled for theming\n- **shadcn/ui initialized** (or use the `init` command below to set up both)\n\nIf you haven't set up shadcn/ui yet, the installation command below can initialize it for you."
      },
      {
        "id": "quick-start-install",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Installation\n\nIf you are using shadcn/ui in your project, install the component directly from the registry:\n\n```bash\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n```\n\nOr start a new Next.js project with UI Builder:\n\n```bash\nnpx shadcn@latest init https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json --base-color zinc\n```\n\n### Optional: Add All Shadcn Components\n\nInstall the full shadcn component library with 54 pre-configured components and 124 block templates:\n\n```bash\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/shadcn-components-registry.json\n```\n\nSee **Shadcn Registry** for details on using these components and blocks.\n\n**Note:** You need to use [style variables](https://ui.shadcn.com/docs/theming) to have page theming working correctly.\n\n### Handling Peer Dependencies\n\nIf you encounter peer dependency warnings during installation (common with React 19 projects), create a `.npmrc` file in your project root:\n\n```bash\necho \"legacy-peer-deps=true\" > .npmrc\n```\n\nThen re-run the installation command.\n\n### What Gets Installed\n\nAfter running the installation command, these files are added to your project:\n\n| Location | Contents |\n|----------|----------|\n| `components/ui/ui-builder/` | Main UIBuilder component, LayerRenderer, ServerLayerRenderer, and types |\n| `lib/ui-builder/` | Store (Zustand), registry definitions, utilities, and context providers |\n| `hooks/` | Custom hooks (use-store, use-debounce, use-keyboard-shortcuts, etc.) |\n| `components/ui/auto-form/` | Auto-generated forms for component props editing |\n\n**Auto-installed dependencies:**\n- `zustand` - State management\n- `sonner` - Toast notifications\n- `@dnd-kit/*` - Drag and drop functionality\n- `zod` - Schema validation\n- Various shadcn/ui components (button, card, tabs, etc.)"
      },
      {
        "id": "quick-start-basic-setup",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Basic Setup\n\nCreate a new page file and paste this complete example:\n\n```tsx\n// app/builder/page.tsx - Complete working example\n\"use client\";\n\nimport UIBuilder from \"@/components/ui/ui-builder\";\nimport { primitiveComponentDefinitions } from \"@/lib/ui-builder/registry/primitive-component-definitions\";\nimport { complexComponentDefinitions } from \"@/lib/ui-builder/registry/complex-component-definitions\";\n\nconst componentRegistry = {\n  ...primitiveComponentDefinitions, // div, span, img, etc.\n  ...complexComponentDefinitions,   // Button, Badge, Card, etc.\n};\n\nexport default function BuilderPage() {\n  return (\n    <main className=\"h-screen\">\n      <UIBuilder componentRegistry={componentRegistry} />\n    </main>\n  );\n}\n```\n\nThen visit `http://localhost:3000/builder` to see your editor.\n\n**What's included:**\n- `primitiveComponentDefinitions` - HTML elements: div, span, h1-h3, p, ul, ol, li, img, iframe, a\n- `complexComponentDefinitions` - React components: Button, Badge, Card, Icon, Flexbox, Grid, Markdown, Accordion, etc.\n\nThis gives you a full visual editor with pre-built shadcn/ui components."
      },
      {
        "id": "quick-start-example",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "quick-start-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "quick-start-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Try it now"
              }
            ]
          },
          {
            "id": "quick-start-demo",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "quick-start-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "/examples/basic",
                  "title": "Quick Start Example",
                  "className": "aspect-square md:aspect-video"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "quick-start-with-state",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Adding State Management\n\nFor real applications, you'll want to control the initial state and persist changes:\n\n```tsx\nimport UIBuilder from \"@/components/ui/ui-builder\";\nimport { ComponentLayer, Variable } from \"@/components/ui/ui-builder/types\";\n\n// Initial page structure\nconst initialLayers: ComponentLayer[] = [\n  {\n    id: \"welcome-page\",\n    type: \"div\",\n    name: \"Welcome Page\",\n    props: {\n      className: \"p-8 min-h-screen flex flex-col gap-6\",\n    },\n    children: [\n      {\n        id: \"title\",\n        type: \"h1\",\n        name: \"Page Title\",\n        props: { \n          className: \"text-4xl font-bold text-center\",\n        },\n        children: \"Welcome to UI Builder!\",\n      },\n      {\n        id: \"cta-button\",\n        type: \"Button\",\n        name: \"CTA Button\",\n        props: {\n          variant: \"default\",\n          className: \"mx-auto w-fit\",\n        },\n        children: [{\n          id: \"button-text\",\n          type: \"span\",\n          name: \"Button Text\",\n          props: {},\n          children: \"Get Started\",\n        }],\n      },\n    ],\n  },\n];\n\n// Variables for dynamic content\nconst initialVariables: Variable[] = [\n  {\n    id: \"welcome-msg\",\n    name: \"welcomeMessage\",\n    type: \"string\",\n    defaultValue: \"Welcome to UI Builder!\"\n  }\n];\n\nexport function AppWithState() {\n  const handleLayersChange = (updatedLayers: ComponentLayer[]) => {\n    // Save to database, localStorage, etc.\n    console.log(\"Layers updated:\", updatedLayers);\n  };\n\n  const handleVariablesChange = (updatedVariables: Variable[]) => {\n    // Save to database, localStorage, etc.\n    console.log(\"Variables updated:\", updatedVariables);\n  };\n\n  return (\n    <UIBuilder\n      componentRegistry={componentRegistry}\n      initialLayers={initialLayers}\n      onChange={handleLayersChange}\n      initialVariables={initialVariables}\n      onVariablesChange={handleVariablesChange}\n    />\n  );\n}\n```"
      },
      {
        "id": "quick-start-types",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## TypeScript Types\n\nAll types are exported from `@/components/ui/ui-builder/types`:\n\n```tsx\nimport type {\n  // Core types\n  ComponentLayer,      // Page/layer structure\n  ComponentRegistry,   // Component definitions map\n  RegistryEntry,       // Single component definition\n  \n  // Variables & Binding\n  Variable,            // Variable definition\n  VariableReference,   // { __variableRef: string }\n  VariableValueType,   // 'string' | 'number' | 'boolean' | 'function'\n  DefaultVariableBinding, // Auto-binding configuration\n  \n  // Functions & Blocks\n  FunctionRegistry,    // Event handler functions\n  FunctionDefinition,  // Single function definition\n  BlockRegistry,       // Block templates\n  BlockDefinition,     // Single block definition\n  \n  // Handlers\n  LayerChangeHandler,  // onChange callback type\n  VariableChangeHandler, // onVariablesChange callback type\n  \n  // Field overrides\n  FieldConfigFunction, // Custom form field configuration\n  AutoFormInputComponentProps, // Props for custom field components\n} from \"@/components/ui/ui-builder/types\";\n\n// Helper functions\nimport { \n  isVariableReference, // Check if value is a variable reference\n  createVariable,      // Type-safe variable creation\n} from \"@/components/ui/ui-builder/types\";\n```"
      },
      {
        "id": "quick-start-key-props",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## UIBuilder Props Reference\n\n### Required Props\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `componentRegistry` | `ComponentRegistry` | Maps component names to their definitions (see **Components Intro**) |\n\n### State & Persistence Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `initialLayers` | `ComponentLayer[]` | `[]` | Initial page structure (e.g., from database) |\n| `onChange` | `LayerChangeHandler` | - | Callback when pages change (for persistence) |\n| `initialVariables` | `Variable[]` | `[]` | Initial variables for dynamic content |\n| `onVariablesChange` | `VariableChangeHandler` | - | Callback when variables change |\n| `persistLayerStore` | `boolean` | `true` | Enable localStorage persistence |\n\n### Registry Props\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `blocks` | `BlockRegistry` | Block templates for the Blocks tab (see **Shadcn Registry**) |\n| `functionRegistry` | `FunctionRegistry` | Event handler functions that can be bound to component props (see **Function Registry**) |\n\n### Permission Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `allowVariableEditing` | `boolean` | `true` | Allow users to create/edit/delete variables |\n| `allowPagesCreation` | `boolean` | `true` | Allow users to create new pages |\n| `allowPagesDeletion` | `boolean` | `true` | Allow users to delete pages |\n\n### NavBar Customization Props\n\nThese props customize the default NavBar. If you provide a custom `navBar` in `panelConfig`, these are ignored.\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `navLeftChildren` | `ReactNode` | - | Content to render on the left side of the NavBar |\n| `navRightChildren` | `ReactNode` | - | Content to render on the right side of the NavBar |\n| `showExport` | `boolean` | `true` | Whether to show the Export button |\n\n### Advanced Props\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `panelConfig` | `PanelConfig` | Customize editor panels (see **Panel Configuration**) |\n\n**Note**: Only `componentRegistry` is required. All other props are optional with sensible defaults."
      },
      {
        "id": "quick-start-rendering",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Rendering Without the Editor\n\nTo display pages in production without the editor interface, use `LayerRenderer` (client) or `ServerLayerRenderer` (SSR/RSC):\n\n```tsx\nimport LayerRenderer from \"@/components/ui/ui-builder/layer-renderer\";\n\n// Basic rendering (client component)\nexport function MyPage({ page }) {\n  return (\n    <LayerRenderer \n      page={page}\n      componentRegistry={componentRegistry}\n    />\n  );\n}\n\n// With variables for dynamic content\nexport function DynamicPage({ page, userData }) {\n  const variableValues = {\n    \"welcome-msg\": `Welcome back, ${userData.name}!`\n  };\n  \n  return (\n    <LayerRenderer \n      page={page}\n      componentRegistry={componentRegistry}\n      variables={variables}\n      variableValues={variableValues}\n    />\n  );\n}\n```\n\n### Server-Side Rendering (SSR/RSC)\n\nFor React Server Components or SSG, use `ServerLayerRenderer`:\n\n```tsx\nimport { ServerLayerRenderer } from \"@/components/ui/ui-builder/server-layer-renderer\";\n\n// Server Component (no 'use client' needed)\nexport default async function MyPage() {\n  const page = await fetchPageFromDB();\n  return (\n    <ServerLayerRenderer \n      page={page}\n      componentRegistry={componentRegistry}\n    />\n  );\n}\n```\n\n🎯 **Try it**: Check out the **[Renderer Demo](/examples/renderer)**, **[Variables Demo](/examples/renderer/variables)**, and **[SSR Demo](/examples/ssr)** to see the renderers in action."
      },
      {
        "id": "quick-start-advanced-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "advanced-demo-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "outline",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "advanced-demo-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Full Featured Editor"
              }
            ]
          },
          {
            "id": "advanced-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "advanced-demo-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "/examples/editor",
                  "title": "Full Featured Editor Demo",
                  "className": "aspect-square md:aspect-video"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "quick-start-troubleshooting",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Troubleshooting\n\n### \"Module not found\" Errors\n\n**Problem:** Import errors like `Cannot find module '@/components/ui/ui-builder'`\n\n**Solutions:**\n1. Verify the shadcn CLI completed successfully (check for error messages)\n2. Ensure `components.json` exists in your project root\n3. Check that `@/` alias is configured in `tsconfig.json`\n4. Try running the installation command again\n\n### Styling Issues\n\n**Problem:** Components look unstyled or broken\n\n**Solutions:**\n1. Ensure Tailwind CSS is configured with [CSS variables](https://ui.shadcn.com/docs/theming)\n2. Check that `globals.css` includes the shadcn theme variables\n3. Verify `tailwind.config.js` includes the UI Builder paths:\n\n```js\ncontent: [\n  './components/**/*.{js,ts,jsx,tsx}',\n  './lib/**/*.{js,ts,jsx,tsx}',\n]\n```\n\n### Component Not Rendering\n\n**Problem:** Added component doesn't appear or shows error\n\n**Solutions:**\n1. Verify the component type exists in your `componentRegistry`\n2. Check browser console for specific error messages\n3. Ensure all parent component types referenced in `defaultChildren` are in the registry\n\n### TypeScript Errors\n\n**Problem:** Type errors when using UI Builder components\n\n**Solutions:**\n1. Import types from `@/components/ui/ui-builder/types`\n2. Use `ComponentRegistry` type for your registry object\n3. Use `ComponentLayer[]` for initial layers\n\n### React 19 Peer Dependency Warnings\n\n**Problem:** npm warns about peer dependency conflicts\n\n**Solution:** Create `.npmrc` with `legacy-peer-deps=true` (see Installation section)"
      },
      {
        "id": "quick-start-next-steps",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Next Steps\n\nNow that you have UI Builder running, explore these key areas:\n\n### Essential Concepts\n- **Components Intro** - Understand the component registry system\n- **Shadcn Registry** - Use 54 pre-configured shadcn components and 124 block templates\n- **Variables** - Add dynamic content with typed variables\n- **Rendering Pages** - Use LayerRenderer in your production app\n\n### Customization\n- **Custom Components** - Add your own React components to the registry\n- **Panel Configuration** - Customize the editor interface for your users\n\n### Advanced Use Cases\n- **Variable Binding** - Auto-bind components to system data\n- **Immutable Pages** - Create locked templates for consistency"
      }
    ]
  } as const satisfies ComponentLayer; 