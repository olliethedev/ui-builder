import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const CANVAS_EDITOR_LAYER = {
    "id": "canvas-editor",
    "type": "div",
    "name": "Canvas Editor",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "editor-features"
    },
    "children": [
      {
        "type": "span",
        "children": "Canvas Editor",
        "id": "canvas-editor-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "canvas-editor-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "The canvas editor is the main workspace where users visually compose their layouts. It provides intuitive drag-and-drop functionality with live preview capabilities powered by React DnD."
      },
      {
        "id": "canvas-editor-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "canvas-editor-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "canvas-editor-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Interactive Demo"
              }
            ]
          },
          {
            "id": "canvas-editor-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "canvas-editor-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "http://localhost:3000/examples/editor",
                  "title": "Canvas Editor Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "canvas-editor-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Key Features\n\n### Visual Editing\n- **Drag & Drop** - Intuitive component placement from the component library\n- **Direct Selection** - Click components on the canvas to select and edit\n- **Visual Feedback** - Hover states and selection indicators\n- **Live Preview** - See changes instantly as you edit properties\n\n### Layout Management\n- **Nested Components** - Build complex layouts with nested structures\n- **Auto-Frame Wrapper** - Intelligent container resizing for responsive layouts\n- **Drop Zones** - Visual indicators showing where components can be placed\n- **Layer Hierarchy** - Maintain proper component nesting and relationships\n\n### Interaction\n- **Multi-Component Support** - Work with multiple components simultaneously\n- **Undo/Redo** - Full history management via Zustand temporal\n- **Keyboard Shortcuts** - Power user productivity features\n- **Contextual Menus** - Right-click for component-specific actions\n\n## Component Library Integration\n\nThe canvas integrates with your `componentRegistry` to provide available components:\n\n```tsx\nimport { primitiveComponentDefinitions } from \"@/lib/ui-builder/registry/primitive-component-definitions\";\nimport { complexComponentDefinitions } from \"@/lib/ui-builder/registry/complex-component-definitions\";\n\nconst componentRegistry = {\n  ...primitiveComponentDefinitions, // Basic HTML elements\n  ...complexComponentDefinitions,   // shadcn/ui components\n  // Your custom components\n  MyCustomCard: {\n    component: MyCustomCard,\n    schema: z.object({\n      title: z.string().default(\"Card Title\"),\n      description: z.string().optional(),\n    }),\n    from: \"@/components/my-custom-card\",\n    defaultChildren: \"Card content\"\n  }\n};\n\n<UIBuilder componentRegistry={componentRegistry} />\n```\n\n## Responsive Design\n\nThe canvas supports responsive editing through the appearance panel:\n\n- **Mobile-First** approach with breakpoint controls\n- **Auto-Frame** wrapper ensures components resize properly\n- **Tailwind CSS** classes for responsive styling\n- **Live Preview** of different screen sizes\n\n## State Management\n\nThe canvas uses Zustand stores for state management:\n\n```tsx\n// Access current canvas state\nconst selectedLayerId = useLayerStore(state => state.selectedLayerId);\nconst pages = useLayerStore(state => state.pages);\nconst variables = useLayerStore(state => state.variables);\n\n// Editor state\nconst showLeftPanel = useEditorStore(state => state.showLeftPanel);\nconst componentRegistry = useEditorStore(state => state.registry);\n```\n\n## Variable Binding on Canvas\n\nComponents can display bound variable values directly on the canvas:\n\n```tsx\n// Variable binding example\nconst welcomeMessage = {\n  id: \"welcome-var\",\n  name: \"welcomeMessage\", \n  type: \"string\",\n  defaultValue: \"Hello, World!\"\n};\n\n// Component with variable binding\nconst buttonComponent = {\n  id: \"welcome-btn\",\n  type: \"Button\",\n  props: {\n    children: { __variableRef: \"welcome-var\" } // Bound to variable\n  }\n};\n```\n\nThe canvas will render the actual variable value, updating in real-time as variables change.\n\n## Accessibility\n\n- **Keyboard Navigation** - Full keyboard support for component selection\n- **Screen Reader Support** - Proper ARIA labels and roles\n- **Focus Management** - Logical tab order and focus indicators\n- **High Contrast** - Works with system theme preferences"
      }
    ]
  } as const satisfies ComponentLayer; 