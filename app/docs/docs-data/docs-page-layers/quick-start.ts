import { ComponentLayer } from "@/components/ui/ui-builder/types";

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
        "id": "quick-start-compatibility",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "⚠️ **Server Components**: Not supported. RSC can't be re-rendered client-side for live preview. A separate RSC renderer for final page rendering is possible."
      },
      {
        "id": "quick-start-install",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Installation\n\nIf you are using shadcn/ui in your project, install the component directly from the registry:\n\n```bash\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n```\n\nOr start a new Next.js project with UI Builder:\n\n```bash\nnpx shadcn@latest init https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json --base-color zinc\n```\n\n### Optional: Add All Shadcn Components\n\nInstall the full shadcn component library with 54 pre-configured components and 124 block templates:\n\n```bash\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/shadcn-components-registry.json\n```\n\nSee **Shadcn Registry** for details on using these components and blocks.\n\n**Note:** You need to use [style variables](https://ui.shadcn.com/docs/theming) to have page theming working correctly.\n\n### Handling Peer Dependencies\n\nIf you encounter peer dependency warnings during installation (common with React 19 projects), create a `.npmrc` file in your project root:\n\n```bash\necho \"legacy-peer-deps=true\" > .npmrc\n```\n\nThen re-run the installation command."
      },
      {
        "id": "quick-start-basic-setup",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Basic Setup\n\nThe minimal setup requires just a component registry:\n\n```tsx\nimport UIBuilder from \"@/components/ui/ui-builder\";\nimport { primitiveComponentDefinitions } from \"@/lib/ui-builder/registry/primitive-component-definitions\";\nimport { complexComponentDefinitions } from \"@/lib/ui-builder/registry/complex-component-definitions\";\n\nconst componentRegistry = {\n  ...primitiveComponentDefinitions, // div, span, img, etc.\n  ...complexComponentDefinitions,   // Button, Badge, Card, etc.\n};\n\nexport function App() {\n  return (\n    <UIBuilder componentRegistry={componentRegistry} />\n  );\n}\n```\n\nThis gives you a full visual editor with pre-built shadcn/ui components."
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
        "id": "quick-start-key-props",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## UIBuilder Props Reference\n\n### Required Props\n- **`componentRegistry`** - Maps component names to their definitions (see **Components Intro**)\n\n### Optional Props\n- **`initialLayers`** - Set initial page structure (e.g., from database)\n- **`onChange`** - Callback when pages change (for persistence)\n- **`initialVariables`** - Set initial variables for dynamic content  \n- **`onVariablesChange`** - Callback when variables change\n- **`blocks`** - Block registry for the Blocks tab in add component popover (see **Shadcn Registry**)\n- **`panelConfig`** - Customize editor panels (see **Panel Configuration**)\n- **`persistLayerStore`** - Enable localStorage persistence (default: `true`)\n- **`allowVariableEditing`** - Allow users to edit variables (default: `true`) \n- **`allowPagesCreation`** - Allow users to create pages (default: `true`)\n- **`allowPagesDeletion`** - Allow users to delete pages (default: `true`)\n\n### NavBar Customization Props\nThese props provide simple customization of the default NavBar without replacing it entirely:\n\n- **`navLeftChildren`** - Content to render on the left side of the NavBar\n- **`navRightChildren`** - Content to render on the right side of the NavBar\n- **`showExport`** - Whether to show the Export button (default: `true`)\n\n**Note**: These props are only available when using the default NavBar. If you provide a custom `navBar` in `panelConfig`, these props are not available.\n\n**Note**: Only `componentRegistry` is required. All other props are optional and have sensible defaults."
      },
      {
        "id": "quick-start-rendering",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Rendering Without the Editor\n\nTo display pages in production without the editor interface, use `LayerRenderer`:\n\n```tsx\nimport LayerRenderer from \"@/components/ui/ui-builder/layer-renderer\";\n\n// Basic rendering\nexport function MyPage({ page }) {\n  return (\n    <LayerRenderer \n      page={page}\n      componentRegistry={componentRegistry}\n    />\n  );\n}\n\n// With variables for dynamic content\nexport function DynamicPage({ page, userData }) {\n  const variableValues = {\n    \"welcome-msg\": `Welcome back, ${userData.name}!`\n  };\n  \n  return (\n    <LayerRenderer \n      page={page}\n      componentRegistry={componentRegistry}\n      variables={variables}\n      variableValues={variableValues}\n    />\n  );\n}\n```\n\n🎯 **Try it**: Check out the **[Renderer Demo](/examples/renderer)** and **[Variables Demo](/examples/renderer/variables)** to see LayerRenderer in action."
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
        "id": "quick-start-next-steps",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Next Steps\n\nNow that you have UI Builder running, explore these key areas:\n\n### Essential Concepts\n- **Components Intro** - Understand the component registry system\n- **Shadcn Registry** - Use 54 pre-configured shadcn components and 124 block templates\n- **Variables** - Add dynamic content with typed variables\n- **Rendering Pages** - Use LayerRenderer in your production app\n\n### Customization\n- **Custom Components** - Add your own React components to the registry\n- **Panel Configuration** - Customize the editor interface for your users\n\n### Advanced Use Cases\n- **Variable Binding** - Auto-bind components to system data\n- **Immutable Pages** - Create locked templates for consistency"
      }
    ]
  } as const satisfies ComponentLayer; 