import { ComponentLayer } from "@/components/ui/ui-builder/types";

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
        "id": "JKiqXGV",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "Welcome to **UI Builder**, the drop‑in visual editor for your React app. With UI Builder, you can empower non‑developers to compose pages, emails, dashboards, and white‑label views using the exact React components you already ship—no rebuilding from scratch required."
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
                "children": "Example"
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
                  "src": "http://localhost:3000/examples/basic",
                  "title": "",
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
        "children": "### Why UI Builder?\n\n- **Leverage your existing components** — no extra code or maintenance overhead.\n\n- **Enable true no‑code workflows** — marketing teams, product managers, or clients can edit layouts and content without engineering support.\n\n- **Human‑readable JSON layouts** — version and review designs just like code.\n\n- **Dynamic, data‑driven interfaces** — bind component props to variables for personalized experiences.\n\n### Key Benefits\n\n1. **One‑step installation**\\\n   Get up and running with a single `npx shadcn@latest add …` command.\n\n2. **Figma‑style editing**\\\n   Intuitive drag‑and‑drop canvas, properties panel, and live preview.\n\n3. **Full React code export**\\\n   Generate clean, type‑safe React code that matches your project structure.\n\n4. **Runtime variable binding**\\\n   Create dynamic templates with string, number, and boolean variables—perfect for personalization, A/B testing, or multi‑tenant branding."
      }
    ]
  } as const satisfies ComponentLayer;