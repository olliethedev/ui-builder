import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const PAGES_PANEL_LAYER = {
    "id": "pages-panel",
    "type": "div",
    "name": "Pages Panel",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "editor-features"
    },
    "children": [
      {
        "type": "span",
        "children": "Pages Panel",
        "id": "pages-panel-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "pages-panel-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "The pages panel allows users to manage multiple pages within a single project. Create, organize, and navigate between different layouts and views using the layer store's page management system."
      },
      {
        "id": "pages-panel-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "pages-panel-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "pages-panel-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Multi-Page Editor"
              }
            ]
          },
          {
            "id": "pages-panel-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "pages-panel-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "http://localhost:3000/examples/editor/immutable-pages",
                  "title": "Pages Panel Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "pages-panel-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Page Management\n\n### How Pages Work\n\nIn UI Builder, pages are essentially top-level component layers. Each page is a root component (like `div`, `main`, or any container) that serves as the foundation for a complete layout:\n\n```tsx\n// Example page structure\nconst initialLayers = [\n  {\n    id: \"homepage\",\n    type: \"div\", // Any component can be a page\n    name: \"Home Page\",\n    props: {\n      className: \"min-h-screen bg-background\"\n    },\n    children: [\n      // Page content components\n    ]\n  },\n  {\n    id: \"about-page\", \n    type: \"main\",\n    name: \"About Us\",\n    props: {\n      className: \"container mx-auto py-8\"\n    },\n    children: [\n      // About page content\n    ]\n  }\n];\n\n<UIBuilder\n  initialLayers={initialLayers}\n  componentRegistry={componentRegistry}\n/>\n```\n\n### Page Creation and Management\n\nControl page creation through UIBuilder props:\n\n```tsx\n<UIBuilder\n  componentRegistry={componentRegistry}\n  allowPagesCreation={true}  // Allow creating new pages\n  allowPagesDeletion={true}  // Allow deleting pages\n  persistLayerStore={true}   // Persist pages in localStorage\n  onChange={(pages) => {\n    // Save pages to your backend\n    savePagesToDatabase(pages);\n  }}\n/>\n```\n\n### Page Operations\n\nThe layer store provides methods for page management:\n\n```tsx\n// Access page management functions\nconst {\n  pages,           // Array of all pages\n  selectedPageId,  // Currently selected page ID\n  addPage,         // Create a new page\n  removePage,      // Delete a page\n  duplicatePage,   // Clone an existing page\n  updatePage       // Update page properties\n} = useLayerStore();\n\n// Example: Adding a new page programmatically\nconst createNewPage = () => {\n  const newPage = {\n    id: generateId(),\n    type: \"div\",\n    name: \"New Page\",\n    props: {\n      className: \"min-h-screen p-4\"\n    },\n    children: []\n  };\n  \n  addPage(newPage);\n};\n```\n\n### Page Navigation\n\nUsers can navigate between pages through:\n\n- **Page List** - Click on any page to switch to it\n- **Page Tabs** - Quick switching between open pages\n- **Page Context Menu** - Right-click for page options\n- **Keyboard Shortcuts** - Fast navigation with hotkeys\n\n### Page Properties\n\nEach page supports the same properties as any component:\n\n```tsx\n// Page with custom properties\nconst customPage = {\n  id: \"landing-page\",\n  type: \"main\", // Use semantic HTML elements\n  name: \"Landing Page\",\n  props: {\n    className: \"bg-gradient-to-b from-blue-50 to-white min-h-screen\",\n    \"data-page-type\": \"landing\", // Custom attributes\n    role: \"main\" // Accessibility\n  },\n  children: [\n    // Page content structure\n  ]\n};\n```\n\n## Multi-Page Project Structure\n\n### Shared Components Across Pages\n\nCreate reusable components that can be used across multiple pages:\n\n```tsx\nconst componentRegistry = {\n  ...primitiveComponentDefinitions,\n  // Shared header component\n  SiteHeader: {\n    component: SiteHeader,\n    schema: z.object({\n      title: z.string().default(\"My Site\"),\n      showNavigation: z.boolean().default(true)\n    }),\n    from: \"@/components/site-header\"\n  },\n  // Shared footer component\n  SiteFooter: {\n    component: SiteFooter,\n    schema: z.object({\n      year: z.number().default(new Date().getFullYear())\n    }),\n    from: \"@/components/site-footer\"\n  }\n};\n```\n\n### Global Variables\n\nUse variables to share data across all pages:\n\n```tsx\nconst globalVariables = [\n  {\n    id: \"site-title\",\n    name: \"siteTitle\",\n    type: \"string\",\n    defaultValue: \"My Website\"\n  },\n  {\n    id: \"brand-color\",\n    name: \"brandColor\", \n    type: \"string\",\n    defaultValue: \"#3b82f6\"\n  }\n];\n\n<UIBuilder\n  initialVariables={globalVariables}\n  // Variables are automatically available on all pages\n/>\n```\n\n### Page Templates\n\nCreate template pages that can be duplicated:\n\n```tsx\n// Template page with common structure\nconst pageTemplate = {\n  id: \"page-template\",\n  type: \"div\",\n  name: \"Page Template\",\n  props: {\n    className: \"min-h-screen flex flex-col\"\n  },\n  children: [\n    {\n      id: \"header-section\",\n      type: \"SiteHeader\",\n      name: \"Header\",\n      props: { title: { __variableRef: \"site-title\" } },\n      children: []\n    },\n    {\n      id: \"main-content\",\n      type: \"main\",\n      name: \"Main Content\",\n      props: {\n        className: \"flex-1 container mx-auto py-8\"\n      },\n      children: [\n        // Template content\n      ]\n    },\n    {\n      id: \"footer-section\",\n      type: \"SiteFooter\",\n      name: \"Footer\", \n      props: {},\n      children: []\n    }\n  ]\n};\n```\n\n## Page Configuration Panel\n\nThe page configuration panel provides:\n\n- **Page Properties** - Edit page name and metadata\n- **Page Settings** - Configure page-specific options\n- **Duplicate Page** - Clone the current page\n- **Delete Page** - Remove the page (if multiple pages exist)\n\n## Responsive Pages\n\nPages automatically support responsive design:\n\n```tsx\n// Responsive page layout\nconst responsivePage = {\n  id: \"responsive-page\",\n  type: \"div\",\n  name: \"Responsive Layout\",\n  props: {\n    className: \"min-h-screen p-4 md:p-8 lg:p-12\"\n  },\n  children: [\n    {\n      id: \"content-grid\",\n      type: \"div\",\n      name: \"Content Grid\",\n      props: {\n        className: \"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\"\n      },\n      children: [\n        // Responsive grid content\n      ]\n    }\n  ]\n};\n```\n\n## Benefits of Multi-Page Support\n\n- **Organized Content** - Separate different sections into dedicated pages\n- **Modular Design** - Build reusable components that work across pages\n- **Efficient Workflow** - Edit multiple pages in the same session\n- **Consistent Branding** - Share variables and components across pages\n- **Easy Navigation** - Switch between pages without losing work"
      }
    ]
  } as const satisfies ComponentLayer; 