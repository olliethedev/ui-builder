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
        "children": "**UI Builder solves the fundamental problem of UI creation tools: they ignore your existing React component library and force you to rebuild from scratch.**\n\nUI Builder is a shadcn/ui package that adds a Figma‑style editor to your own product, letting non‑developers compose pages, emails, dashboards, and white‑label views with the exact React components you already ship.\n\nLayouts are saved as plain JSON for easy versioning and can be rendered instantly with dynamic data, allowing:\n\n- your marketing team to update a landing page without waiting on engineering\n- a customer to tweak a branded portal with their own content and branding  \n- a product manager to modify email templates but parts of the content is dynamic for each user\n- add a visual \"head\" to your headless CMS, connecting your content API with your component library"
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
        "children": "### How it unlocks novel product features:\n\n- **Give users no‑code superpowers** — add a full visual builder to your SaaS with one install\n- **Design with components you already ship** — nothing new to build or maintain\n- **Store layouts as human‑readable JSON** — render inside your product to ship changes immediately\n- **Create dynamic, data-driven interfaces** — bind component properties to variables for personalized content\n\n### Key Benefits\n\n1. **One‑step installation**\\\n   Get up and running with a single `npx shadcn@latest add …` command.\n\n2. **Figma‑style editing**\\\n   Intuitive drag‑and‑drop canvas, properties panel, and live preview.\n\n3. **Full React code export**\\\n   Generate clean, type‑safe React code that matches your project structure.\n\n4. **Runtime variable binding**\\\n   Create dynamic templates with string, number, and boolean variables—perfect for personalization, A/B testing, or multi‑tenant branding.\n\n### Compatibility Notes\n\n**Tailwind 4 + React 19**: Migration coming soon. Currently blocked by 3rd party component compatibility. If using latest shadcn/ui CLI fails, try: `npx shadcn@2.1.8 add ...`\n\n**Server Components**: Not supported. RSC can't be re-rendered client-side for live preview. A separate RSC renderer for final page rendering is possible."
      }
    ]
  } as const satisfies ComponentLayer;