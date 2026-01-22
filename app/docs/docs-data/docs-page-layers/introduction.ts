import type { ComponentLayer } from "@/components/ui/ui-builder/types";

export const INTRODUCTION_LAYER = {
    "id": "introduction",
    "type": "div",
    "name": "Introduction",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "core"
    },
    "children": [
      {
        "type": "span",
        "children": "Introduction",
        "id": "1MnLSMe",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "better-stack-callout",
        "type": "div",
        "name": "Better Stack Callout",
        "props": {
          "className": "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-primary rounded-r-lg p-4 my-4"
        },
        "children": [
          {
            "id": "better-stack-callout-text",
            "type": "Markdown",
            "name": "Markdown",
            "props": {},
            "children": "**UI Builder is now part of [Better Stack](https://better-stack.ai/)** — ship full-stack features faster with production-ready plugins that generate database schemas, API routes, and pages for Next.js, TanStack Start, and React Router. Stop rebuilding. Start shipping."
          }
        ]
      },
      {
        "id": "JKiqXGV",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "**UI Builder solves the fundamental problem of UI creation tools: they ignore your existing React component library and force you to rebuild from scratch.**\n\nUI Builder is a shadcn/ui package that adds a Figma‑style editor to your own product, letting non‑developers compose pages, emails, dashboards, and white‑label views with the exact React components you already ship.\n\nLayouts are saved as plain JSON for easy versioning and can be rendered instantly with dynamic data, allowing:\n\n- your marketing team to update a landing page without waiting on engineering\n- a customer to tweak a branded portal with their own content and branding  \n- a product manager to modify email templates but parts of the content is dynamic for each user\n- add a visual \"head\" to your headless CMS, connecting your content API with your component library"
      },
      {
        "id": "quick-setup-snippet",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Quick Setup\n\n```bash\n# Install UI Builder\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n```\n\n```tsx\n// app/builder/page.tsx\n\"use client\";\n\nimport UIBuilder from \"@/components/ui/ui-builder\";\nimport { primitiveComponentDefinitions } from \"@/lib/ui-builder/registry/primitive-component-definitions\";\nimport { complexComponentDefinitions } from \"@/lib/ui-builder/registry/complex-component-definitions\";\n\nexport default function BuilderPage() {\n  return (\n    <main className=\"h-screen\">\n      <UIBuilder\n        componentRegistry={{\n          ...primitiveComponentDefinitions,\n          ...complexComponentDefinitions,\n        }}\n      />\n    </main>\n  );\n}\n```\n\nThat's it! Visit `http://localhost:3000/builder` to see your editor. See **Quick Start** for complete setup details."
      },
      {
        "id": "eR9CoTQ",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "1FmQvr5",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "itgw5T6",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Live Demo"
              }
            ]
          },
          {
            "id": "3EYD3Jj",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "h8a96fY",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "/examples/basic",
                  "title": "UI Builder Basic Example",
                  "className": "aspect-square md:aspect-video"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "cUFUpBr",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## How UI Builder Works\n\nUI Builder empowers you to visually construct and modify user interfaces by leveraging your own React components. Here's how it works:\n\n**🧩 Component-Driven Foundation**\\\nOperates on your existing React components. You provide a `componentRegistry` detailing which components are available in the editor.\n\n**🎨 Layer-Based Canvas**\\\nThe UI is constructed as a tree of \"layers.\" Each layer represents a component instance that users can visually add, remove, reorder, and nest on an interactive canvas.\n\n**📦 Pre-built Blocks**\\\nJump-start your designs with 124 shadcn block templates—login forms, dashboards, sidebars, and more. Insert complete UI structures with one click, then customize as needed.\n\n**⚙️ Dynamic Props Editing**\\\nEach component uses a Zod schema to automatically generate a properties panel, allowing users to configure component instances in real-time.\n\n**🔗 Variable-Driven Dynamic Content**\\\nVariables transform static designs into dynamic, data-driven interfaces. Bind component properties to typed variables for personalization, theming, and reusable templates.\n\n**⚡ Function Registry for Event Binding**\\\nBind event handlers like `onClick`, `onSubmit`, and `onChange` to pre-defined functions. Enable interactive components, form submissions with server actions, toast notifications, and analytics tracking—all configurable from the visual editor.\n\n**📦 Flexible State Management**\\\nBy default, the editor's state persists in local storage. For production apps, provide `initialLayers` and use the `onChange` callback to persist state to your backend.\n\n**⚡ React Code Generation**\\\nExport visually designed pages as clean, readable React code that correctly references your components.\n\n**🖥️ Server-Side Rendering**\\\nUse `ServerLayerRenderer` to render pages on the server with React Server Components—no client JavaScript required for initial render. Perfect for SEO and static generation.\n\n**🚀 Runtime Variable Resolution**\\\nWhen rendering pages with `LayerRenderer`, provide `variableValues` to override defaults with real data from APIs, databases, or user input."
      },
      {
        "id": "understanding-variables",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Understanding Variables\n\n**Variables are the key to creating dynamic, data-driven interfaces.** Instead of hardcoding static values, variables allow you to bind component properties to dynamic data that changes at runtime.\n\n**Variable Types:**\n- **String**: For text content, names, descriptions, etc.\n- **Number**: For counts, ages, prices, quantities, etc.\n- **Boolean**: For feature flags, visibility toggles, active states, etc.\n- **Function**: For event handlers like onClick, onSubmit, etc. (requires a function registry)\n\n**Powerful Use Cases:**\n- **Personalized content** that adapts to user data\n- **Reusable templates** that work across different contexts\n- **Multi‑tenant applications** with customized branding per client\n- **A/B testing** and feature flags through boolean variables\n- **Interactive components** with bound event handlers for forms, buttons, and more\n- **Content management** where non‑technical users can update dynamic content"
      },
      {
        "id": "key-benefits",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Key Benefits\n\n**🎯 One‑step Installation**\\\nGet up and running with a single `npx shadcn@latest add …` command.\n\n**🎨 Figma‑style Editing**\\\nIntuitive drag‑and‑drop canvas, properties panel, and live preview.\n\n**📦 124 Pre-built Blocks**\\\nStart fast with shadcn block templates—login forms, dashboards, sidebars, charts, and more.\n\n**⚡ Full React Code Export**\\\nGenerate clean, type‑safe React code that matches your project structure.\n\n**🔗 Runtime Variable Binding**\\\nCreate dynamic templates with string, number, and boolean variables—perfect for personalization, A/B testing, or multi‑tenant branding.\n\n**⚡ Function Binding for Events**\\\nBind event handlers to pre-defined functions for interactive components, form submissions, toast notifications, and analytics tracking.\n\n**🖥️ Server-Side Rendering**\\\nRender pages on the server with `ServerLayerRenderer` for optimal performance, SEO, and React Server Components support.\n\n**🧩 Bring Your Own Components**\\\nUse your existing React component library—no need to rebuild from scratch.\n\n**💾 Flexible Persistence**\\\nControl how and when editor state is saved, with built‑in local storage support or custom database integration."
      },
      {
        "id": "live-examples",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Live Examples\n\nExplore different UI Builder features with these interactive examples:\n\n### Editor Examples\n\n**🎨 [Basic Editor](/examples/basic)** - Simple drag‑and‑drop interface with basic components\n\n**🔧 [Full Featured Editor](/examples/editor)** - Complete editor with all panels and advanced features\n\n**⚙️ [Panel Configuration](/examples/editor/panel-config)** - Customize which panels appear and their layout\n\n**👁️ [Read-Only Mode](/examples/editor/read-only-mode)** - Editor with editing disabled for preview purposes\n\n**🔒 [Immutable Bindings](/examples/editor/immutable-bindings)** - Protect variable bindings from being changed\n\n**📑 [Immutable Pages](/examples/editor/immutable-pages)** - Fixed page structure that can't be added/removed\n\n### Renderer Examples\n\n**📄 [Static Renderer](/examples/renderer)** - See how pages render without the editor interface\n\n**🔗 [Variables in Action](/examples/renderer/variables)** - Dynamic content with runtime variable binding\n\n**🖥️ [SSR Rendering](/examples/ssr)** - Server-side rendering with React Server Components"
      },
      {
        "id": "next-steps",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Next Steps\n\nReady to get started?\n\n1. **Quick Start** - Install and set up your first UI Builder\n2. **Components Intro** - Learn about the component registry system\n3. **Shadcn Registry** - Use 54 pre-configured components and 124 block templates\n4. **Variables** - Create dynamic, data-driven interfaces\n5. **Function Registry** - Bind event handlers for interactive components\n6. **Custom Components** - Add your own React components to the editor"
      }
    ]
  } as const satisfies ComponentLayer;