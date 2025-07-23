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
        "children": "Get up and running with UI Builder in minutes. This guide will walk you through installation and creating your first visual editor."
      },
      {
        "id": "quick-start-install",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Installation\n\nIf you are using shadcn/ui in your project, you can install the component directly from the registry:\n\n```bash\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n```\n\nOr you can start a new project with the UI Builder:\n\n```bash\nnpx shadcn@latest init https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n```\n\n**Note:** You need to use [style variables](https://ui.shadcn.com/docs/theming) to have page theming working correctly.\n\n### Fixing Dependencies\n\nAdd dev dependencies, since there currently seems to be an issue with shadcn/ui not installing them from the registry:\n\n```bash\nnpm install -D @types/lodash.template @tailwindcss/typography @types/react-syntax-highlighter tailwindcss-animate @types/object-hash\n```"
      },
      {
        "id": "quick-start-basic-usage",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Basic Example\n\nTo use the UI Builder, you **must** provide a component registry:\n\n```tsx\nimport z from \"zod\";\nimport UIBuilder from \"@/components/ui/ui-builder\";\nimport { Button } from \"@/components/ui/button\";\nimport { ComponentRegistry, ComponentLayer } from \"@/components/ui/ui-builder/types\";\nimport { commonFieldOverrides, classNameFieldOverrides, childrenAsTextareaFieldOverrides } from \"@/lib/ui-builder/registry/form-field-overrides\";\n\n// Define your component registry\nconst myComponentRegistry: ComponentRegistry = {\n    Button: {\n        component: Button,\n        schema: z.object({\n            className: z.string().optional(),\n            children: z.any().optional(),\n            variant: z\n                .enum([\n                    \"default\",\n                    \"destructive\",\n                    \"outline\",\n                    \"secondary\",\n                    \"ghost\",\n                    \"link\",\n                ])\n                .default(\"default\"),\n            size: z.enum([\"default\", \"sm\", \"lg\", \"icon\"]).default(\"default\"),\n        }),\n        from: \"@/components/ui/button\",\n        defaultChildren: [\n            {\n                id: \"button-text\",\n                type: \"span\",\n                name: \"span\",\n                props: {},\n                children: \"Hello World\",\n            } satisfies ComponentLayer,\n        ],\n        fieldOverrides: commonFieldOverrides()\n    },\n    span: {\n        schema: z.object({\n            className: z.string().optional(),\n            children: z.any().optional(),\n        }),\n        fieldOverrides: {\n            className:(layer)=> classNameFieldOverrides(layer),\n            children: (layer)=> childrenAsTextareaFieldOverrides(layer)\n        },\n        defaultChildren: \"Text\"\n    },\n};\n\nexport function App() {\n  return (\n    <UIBuilder\n      componentRegistry={myComponentRegistry}\n    />\n  );\n}\n```\n\n**Important:** Make sure to include definitions for all component types referenced in your `defaultChildren`. In this example, the Button's `defaultChildren` references a `span` component, so we include `span` in our registry."
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
                  "src": "http://localhost:3000/examples/basic",
                  "title": "Quick Start Example",
                  "className": "aspect-square md:aspect-video"
                },
                "children": []
              }
            ]
          }
        ]
      }
    ]
  } as const satisfies ComponentLayer; 