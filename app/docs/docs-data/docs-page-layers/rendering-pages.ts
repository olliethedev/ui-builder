import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const RENDERING_PAGES_LAYER = {
    "id": "rendering-pages",
    "type": "div",
    "name": "Rendering Pages",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "rendering"
    },
    "children": [
      {
        "type": "span",
        "children": "Rendering Pages",
        "id": "rendering-pages-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "rendering-pages-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "Render UI Builder pages in production using `LayerRenderer` or `ServerLayerRenderer`. Display your designed pages without the editor interface, with full support for dynamic content through variables.\n\n**Choose the right renderer:**\n- `LayerRenderer` - Client-side rendering with React hooks (use in client components)\n- `ServerLayerRenderer` - SSR/SSG/RSC compatible (use in server components, no 'use client' needed)"
      },
      {
        "id": "rendering-pages-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "rendering-pages-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "rendering-pages-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Basic Rendering Demo"
              }
            ]
          },
          {
            "id": "rendering-pages-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "rendering-pages-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "/examples/renderer",
                  "title": "Page Rendering Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "rendering-pages-variables-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "rendering-pages-variables-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "outline",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "rendering-pages-variables-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Variables Demo"
              }
            ]
          },
          {
            "id": "rendering-pages-variables-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "rendering-pages-variables-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "/examples/renderer/variables",
                  "title": "Variables Rendering Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "rendering-pages-ssr-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "rendering-pages-ssr-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "secondary",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "rendering-pages-ssr-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "SSR Demo (Server Component)"
              }
            ]
          },
          {
            "id": "rendering-pages-ssr-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "rendering-pages-ssr-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "/examples/ssr",
                  "title": "SSR Rendering Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "rendering-pages-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Basic Usage\n\nUse the `LayerRenderer` component to display UI Builder pages without the editor interface:\n\n```tsx\nimport LayerRenderer from '@/components/ui/ui-builder/layer-renderer';\nimport { ComponentLayer, ComponentRegistry } from '@/components/ui/ui-builder/types';\n\n// Your component registry (same as used in UIBuilder)\nconst myComponentRegistry: ComponentRegistry = {\n  // Your component definitions...\n};\n\n// Page data from UIBuilder or database\nconst page: ComponentLayer = {\n  id: \"welcome-page\",\n  type: \"div\",\n  name: \"Welcome Page\",\n  props: {\n    className: \"p-6 max-w-4xl mx-auto\"\n  },\n  children: [\n    {\n      id: \"title\",\n      type: \"h1\",\n      name: \"Title\",\n      props: {\n        className: \"text-3xl font-bold mb-4\"\n      },\n      children: \"Welcome to My App\"\n    },\n    {\n      id: \"description\",\n      type: \"p\",\n      name: \"Description\",\n      props: {\n        className: \"text-gray-600\"\n      },\n      children: \"This page was built with UI Builder.\"\n    }\n  ]\n};\n\nfunction MyRenderedPage() {\n  return (\n    <LayerRenderer \n      page={page} \n      componentRegistry={myComponentRegistry}\n    />\n  );\n}\n```\n\n## Rendering with Variables\n\nMake your pages dynamic by binding component properties to variables:\n\n```tsx\nimport LayerRenderer from '@/components/ui/ui-builder/layer-renderer';\nimport { Variable } from '@/components/ui/ui-builder/types';\n\n// Define your variables\nconst variables: Variable[] = [\n  {\n    id: \"userName\",\n    name: \"User Name\",\n    type: \"string\",\n    defaultValue: \"Guest\"\n  },\n  {\n    id: \"userAge\",\n    name: \"User Age\",\n    type: \"number\",\n    defaultValue: 25\n  },\n  {\n    id: \"showWelcomeMessage\",\n    name: \"Show Welcome Message\",\n    type: \"boolean\",\n    defaultValue: true\n  }\n];\n\n// Page with variable bindings (created in UIBuilder)\nconst pageWithVariables: ComponentLayer = {\n  id: \"user-profile\",\n  type: \"div\",\n  props: {\n    className: \"p-6 bg-white rounded-lg shadow\"\n  },\n  children: [\n    {\n      id: \"welcome-message\",\n      type: \"h2\",\n      props: {\n        className: \"text-2xl font-bold mb-2\",\n        children: { __variableRef: \"userName\" } // Bound to userName variable\n      },\n      children: []\n    },\n    {\n      id: \"age-display\",\n      type: \"p\",\n      props: {\n        className: \"text-gray-600\",\n        children: { __variableRef: \"userAge\" } // Bound to userAge variable\n      },\n      children: []\n    }\n  ]\n};\n\n// Provide runtime values for variables\nconst variableValues = {\n  userName: \"Jane Smith\",\n  userAge: 28,\n  showWelcomeMessage: true\n};\n\nfunction DynamicUserProfile() {\n  return (\n    <LayerRenderer \n      page={pageWithVariables}\n      componentRegistry={myComponentRegistry}\n      variables={variables}\n      variableValues={variableValues}\n    />\n  );\n}\n```\n\n## Production Integration\n\nIntegrate with your data sources to create personalized experiences:\n\n```tsx\nfunction CustomerPage({ customerId }: { customerId: string }) {\n  const [pageData, setPageData] = useState<ComponentLayer | null>(null);\n  const [customerData, setCustomerData] = useState({});\n  \n  useEffect(() => {\n    async function loadData() {\n      // Load page structure from your CMS/database\n      const pageResponse = await fetch('/api/pages/customer-dashboard');\n      const page = await pageResponse.json();\n      \n      // Load customer-specific data\n      const customerResponse = await fetch(`/api/customers/${customerId}`);\n      const customer = await customerResponse.json();\n      \n      setPageData(page);\n      setCustomerData(customer);\n    }\n    \n    loadData();\n  }, [customerId]);\n  \n  if (!pageData) return <div>Loading...</div>;\n  \n  return (\n    <LayerRenderer \n      page={pageData}\n      componentRegistry={myComponentRegistry}\n      variables={variables}\n      variableValues={{\n        customerName: customerData.name,\n        companyLogo: customerData.logoUrl,\n        brandColor: customerData.primaryColor,\n        // Inject real customer data into the template\n      }}\n    />\n  );\n}\n```\n\n## Performance Optimization\n\nOptimize rendering performance for production:\n\n```tsx\n// Memoize the renderer to prevent unnecessary re-renders\nconst MemoizedRenderer = React.memo(LayerRenderer, (prevProps, nextProps) => {\n  return (\n    prevProps.page === nextProps.page &&\n    JSON.stringify(prevProps.variableValues) === JSON.stringify(nextProps.variableValues)\n  );\n});\n\n// Use in your component\nfunction OptimizedPage() {\n  return (\n    <MemoizedRenderer\n      page={page}\n      componentRegistry={myComponentRegistry}\n      variables={variables}\n      variableValues={variableValues}\n    />\n  );\n}\n```\n\n## Error Handling\n\nHandle rendering errors gracefully in production:\n\n```tsx\nimport { ErrorBoundary } from 'react-error-boundary';\n\nfunction ErrorFallback({ error }: { error: Error }) {\n  return (\n    <div className=\"p-4 bg-red-50 border border-red-200 rounded\">\n      <h2 className=\"text-lg font-semibold text-red-800\">Page failed to load</h2>\n      <p className=\"text-red-600\">{error.message}</p>\n      <button \n        onClick={() => window.location.reload()}\n        className=\"mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700\"\n      >\n        Reload Page\n      </button>\n    </div>\n  );\n}\n\nfunction SafeRenderedPage() {\n  return (\n    <ErrorBoundary FallbackComponent={ErrorFallback}>\n      <LayerRenderer \n        page={page}\n        componentRegistry={myComponentRegistry}\n        variables={variables}\n        variableValues={variableValues}\n      />\n    </ErrorBoundary>\n  );\n}\n```\n\n## LayerRenderer Props\n\n- **`page`** (required): The `ComponentLayer` to render\n- **`componentRegistry`** (required): Registry mapping component types to their definitions\n- **`className`**: Optional CSS class for the root container\n- **`variables`**: Array of `Variable` definitions available for binding\n- **`variableValues`**: Object mapping variable IDs to runtime values (overrides defaults)\n- **`editorConfig`**: Internal editor configuration (rarely needed in production)\n\n## ServerLayerRenderer (SSR/RSC)\n\nFor server-side rendering, static generation, or React Server Components, use `ServerLayerRenderer`. It provides the same rendering output as `LayerRenderer` but without any client-side dependencies.\n\n### When to Use ServerLayerRenderer\n\n- **React Server Components (RSC)** - Works in Next.js App Router server components\n- **Static Site Generation (SSG)** - Generate pages at build time\n- **Server-Side Rendering (SSR)** - Render pages on each request\n- **No JavaScript required** - Pages render without client-side JS\n\n### Basic SSR Usage\n\n```tsx\n// app/my-page/page.tsx - This is a Server Component (no 'use client')\nimport { ServerLayerRenderer } from '@/components/ui/ui-builder/server-layer-renderer';\nimport { ComponentLayer } from '@/components/ui/ui-builder/types';\n\n// Fetch page data on the server\nasync function getPageData(): Promise<ComponentLayer> {\n  const res = await fetch('https://api.example.com/pages/home');\n  return res.json();\n}\n\nexport default async function MyPage() {\n  const page = await getPageData();\n  \n  return (\n    <ServerLayerRenderer \n      page={page} \n      componentRegistry={myRegistry}\n    />\n  );\n}\n```\n\n### SSR with Variables\n\n```tsx\n// app/user/[id]/page.tsx\nimport { ServerLayerRenderer } from '@/components/ui/ui-builder/server-layer-renderer';\n\nexport default async function UserPage({ params }: { params: { id: string } }) {\n  // Fetch data on the server\n  const [page, user] = await Promise.all([\n    fetchPageTemplate(),\n    fetchUser(params.id)\n  ]);\n  \n  // Inject server-side data into variables\n  const variableValues = {\n    userName: user.name,\n    userEmail: user.email,\n    memberSince: user.createdAt\n  };\n  \n  return (\n    <ServerLayerRenderer \n      page={page}\n      componentRegistry={myRegistry}\n      variables={variables}\n      variableValues={variableValues}\n    />\n  );\n}\n```\n\n### ServerLayerRenderer Props\n\n- **`page`** (required): The `ComponentLayer` to render\n- **`componentRegistry`** (required): Registry mapping component types to their definitions\n- **`className`**: Optional CSS class for the root container\n- **`variables`**: Array of `Variable` definitions available for binding\n- **`variableValues`**: Object mapping variable IDs to runtime values\n\n### Key Differences from LayerRenderer\n\n| Feature | LayerRenderer | ServerLayerRenderer |\n|---------|--------------|--------------------|\n| React hooks | Uses hooks | No hooks |\n| 'use client' | Required | Not required |\n| SSR/SSG/RSC | No | Yes |\n| Editor integration | Yes | No |\n| Error boundaries | Built-in | Use your own |\n| Suspense | Built-in | Use your own |\n\n## Best Practices\n\n1. **Use the same `componentRegistry`** in both `UIBuilder` and `LayerRenderer`\n2. **Validate variable values** before passing to LayerRenderer to prevent runtime errors\n3. **Handle loading states** while fetching page data and variables\n4. **Implement error boundaries** to gracefully handle rendering failures\n5. **Cache page data** when possible for better performance\n6. **Memoize expensive variable calculations** to avoid unnecessary re-computations\n7. **Test variable bindings** thoroughly to ensure robustness across different data scenarios"
      }
    ]
  } as const satisfies ComponentLayer; 