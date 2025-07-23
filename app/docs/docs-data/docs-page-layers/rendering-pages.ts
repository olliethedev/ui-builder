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
        "children": "Render UI Builder pages without the editor interface using the LayerRenderer component. Perfect for displaying your designs in production with full variable binding and dynamic content support."
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
                "children": "Live Rendering Demo"
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
        "id": "rendering-pages-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Basic Rendering\n\nUse the `LayerRenderer` component to render UI Builder pages without the editor:\n\n```tsx\nimport LayerRenderer from '@/components/ui/ui-builder/layer-renderer';\nimport { ComponentLayer, ComponentRegistry } from '@/components/ui/ui-builder/types';\n\n// Your component registry (same as used in UIBuilder)\nconst myComponentRegistry: ComponentRegistry = {\n  // Your component definitions\n};\n\n// Page data (from UIBuilder or database)\nconst page: ComponentLayer = {\n  id: \"my-page\",\n  type: \"div\",\n  name: \"My Page\",\n  props: {\n    className: \"p-4\"\n  },\n  children: [\n    // Your page structure\n  ]\n};\n\nfunction MyRenderedPage() {\n  return (\n    <LayerRenderer \n      page={page} \n      componentRegistry={myComponentRegistry}\n    />\n  );\n}\n```\n\n## Rendering with Variables\n\nThe real power of LayerRenderer comes from variable binding - same page structure with different data:\n\n```tsx\nimport LayerRenderer from '@/components/ui/ui-builder/layer-renderer';\nimport { ComponentLayer, Variable } from '@/components/ui/ui-builder/types';\n\n// Define variables for dynamic content\nconst variables: Variable[] = [\n  {\n    id: \"userName\",\n    name: \"User Name\",\n    type: \"string\",\n    defaultValue: \"John Doe\"\n  },\n  {\n    id: \"userAge\",\n    name: \"User Age\", \n    type: \"number\",\n    defaultValue: 25\n  },\n  {\n    id: \"isActive\",\n    name: \"Is Active\",\n    type: \"boolean\",\n    defaultValue: true\n  }\n];\n\n// Page with variable bindings\nconst pageWithVariables: ComponentLayer = {\n  id: \"user-profile\",\n  type: \"div\",\n  props: {\n    className: \"p-6 bg-white rounded-lg shadow\"\n  },\n  children: [\n    {\n      id: \"welcome-text\",\n      type: \"h1\",\n      props: {\n        className: \"text-2xl font-bold\",\n        children: { __variableRef: \"userName\" } // Bound to userName variable\n      },\n      children: []\n    },\n    {\n      id: \"age-text\",\n      type: \"p\",\n      props: {\n        children: { __variableRef: \"userAge\" } // Bound to userAge variable\n      },\n      children: []\n    }\n  ]\n};\n\n// Override variable values at runtime\nconst variableValues = {\n  userName: \"Jane Smith\", // Override default\n  userAge: 30,            // Override default\n  isActive: false         // Override default\n};\n\nfunction DynamicUserProfile() {\n  return (\n    <LayerRenderer \n      page={pageWithVariables}\n      componentRegistry={myComponentRegistry}\n      variables={variables}\n      variableValues={variableValues}\n    />\n  );\n}\n```\n\n## Multi-Tenant Applications\n\nPerfect for white-label applications where each customer gets customized branding:\n\n```tsx\nfunction CustomerDashboard({ customerId }: { customerId: string }) {\n  const [pageData, setPageData] = useState<ComponentLayer | null>(null);\n  const [customerVariables, setCustomerVariables] = useState({});\n  \n  useEffect(() => {\n    async function loadCustomerPage() {\n      // Load the page structure (same for all customers)\n      const pageResponse = await fetch('/api/templates/dashboard');\n      const page = await pageResponse.json();\n      \n      // Load customer-specific variable values\n      const varsResponse = await fetch(`/api/customers/${customerId}/branding`);\n      const variables = await varsResponse.json();\n      \n      setPageData(page);\n      setCustomerVariables(variables);\n    }\n    \n    loadCustomerPage();\n  }, [customerId]);\n  \n  if (!pageData) return <div>Loading...</div>;\n  \n  return (\n    <LayerRenderer \n      page={pageData}\n      componentRegistry={myComponentRegistry}\n      variables={baseVariables}\n      variableValues={{\n        companyName: customerVariables.companyName,\n        brandColor: customerVariables.primaryColor,\n        logoUrl: customerVariables.logoUrl,\n        // Same page structure, different branding!\n      }}\n    />\n  );\n}\n```\n\n## Server-Side Rendering (SSR)\n\nLayerRenderer works with Next.js SSR for better performance and SEO:\n\n```tsx\n// pages/page/[id].tsx or app/page/[id]/page.tsx\nimport { GetServerSideProps } from 'next';\nimport LayerRenderer from '@/components/ui/ui-builder/layer-renderer';\n\ninterface PageProps {\n  page: ComponentLayer;\n  variables: Variable[];\n  variableValues: Record<string, any>;\n}\n\n// Server-side data fetching\nexport const getServerSideProps: GetServerSideProps<PageProps> = async ({ params }) => {\n  const pageId = params?.id as string;\n  \n  // Fetch page data from your database\n  const [page, variables, userData] = await Promise.all([\n    getPageById(pageId),\n    getPageVariables(pageId),\n    getCurrentUserData() // For personalization\n  ]);\n  \n  const variableValues = {\n    userName: userData.name,\n    userEmail: userData.email,\n    // Inject real data into variables\n  };\n  \n  return {\n    props: {\n      page,\n      variables,\n      variableValues\n    }\n  };\n};\n\n// Component renders on server\nfunction ServerRenderedPage({ page, variables, variableValues }: PageProps) {\n  return (\n    <LayerRenderer \n      page={page}\n      componentRegistry={myComponentRegistry}\n      variables={variables}\n      variableValues={variableValues}\n    />\n  );\n}\n\nexport default ServerRenderedPage;\n```\n\n## Real-Time Data Integration\n\nBind to live data sources for dynamic, real-time interfaces:\n\n```tsx\nfunction LiveDashboard() {\n  const [liveData, setLiveData] = useState({\n    activeUsers: 0,\n    revenue: 0,\n    conversionRate: 0\n  });\n  \n  // Subscribe to real-time updates\n  useEffect(() => {\n    const socket = new WebSocket('ws://localhost:8080/analytics');\n    \n    socket.onmessage = (event) => {\n      const data = JSON.parse(event.data);\n      setLiveData(data);\n    };\n    \n    return () => socket.close();\n  }, []);\n  \n  return (\n    <LayerRenderer \n      page={dashboardPage}\n      componentRegistry={myComponentRegistry}\n      variables={dashboardVariables}\n      variableValues={{\n        activeUsers: liveData.activeUsers,\n        revenue: `$${liveData.revenue.toLocaleString()}`,\n        conversionRate: `${liveData.conversionRate}%`,\n        lastUpdated: new Date().toLocaleTimeString()\n      }}\n    />\n  );\n}\n```\n\n## A/B Testing & Feature Flags\n\nUse boolean variables for conditional rendering:\n\n```tsx\nfunction ABTestPage({ userId }: { userId: string }) {\n  const [experimentFlags, setExperimentFlags] = useState({});\n  \n  useEffect(() => {\n    // Determine which experiment variant user should see\n    async function getExperimentFlags() {\n      const response = await fetch(`/api/experiments/${userId}`);\n      const flags = await response.json();\n      setExperimentFlags(flags);\n    }\n    \n    getExperimentFlags();\n  }, [userId]);\n  \n  return (\n    <LayerRenderer \n      page={landingPage}\n      componentRegistry={myComponentRegistry}\n      variables={experimentVariables}\n      variableValues={{\n        showNewDesign: experimentFlags.newDesignEnabled,\n        showPricingV2: experimentFlags.pricingV2Enabled,\n        showTestimonials: experimentFlags.testimonialsEnabled\n        // Same page, different features based on experiments!\n      }}\n    />\n  );\n}\n```\n\n## LayerRenderer Props Reference\n\n- **`page`** (required): The ComponentLayer to render\n- **`componentRegistry`** (required): Registry of available components\n- **`className`**: CSS class for the root container\n- **`variables`**: Array of Variable definitions for the page\n- **`variableValues`**: Object mapping variable IDs to runtime values\n- **`editorConfig`**: Internal editor configuration (rarely needed)\n\n## Performance Optimization\n\nOptimize rendering performance for large pages:\n\n```tsx\n// Memoize the renderer to prevent unnecessary re-renders\nconst MemoizedRenderer = React.memo(LayerRenderer, (prevProps, nextProps) => {\n  return (\n    prevProps.page === nextProps.page &&\n    JSON.stringify(prevProps.variableValues) === JSON.stringify(nextProps.variableValues)\n  );\n});\n\n// Use in your component\nfunction OptimizedPage() {\n  return (\n    <MemoizedRenderer\n      page={page}\n      componentRegistry={myComponentRegistry}\n      variables={variables}\n      variableValues={variableValues}\n    />\n  );\n}\n```\n\n## Error Handling\n\nHandle rendering errors gracefully:\n\n```tsx\nimport { ErrorBoundary } from 'react-error-boundary';\n\nfunction ErrorFallback({ error }: { error: Error }) {\n  return (\n    <div className=\"p-4 bg-red-50 border border-red-200 rounded\">\n      <h2 className=\"text-lg font-semibold text-red-800\">Something went wrong</h2>\n      <p className=\"text-red-600\">{error.message}</p>\n      <button \n        onClick={() => window.location.reload()}\n        className=\"mt-2 px-4 py-2 bg-red-600 text-white rounded\"\n      >\n        Reload Page\n      </button>\n    </div>\n  );\n}\n\nfunction SafeRenderedPage() {\n  return (\n    <ErrorBoundary FallbackComponent={ErrorFallback}>\n      <LayerRenderer \n        page={page}\n        componentRegistry={myComponentRegistry}\n        variables={variables}\n        variableValues={variableValues}\n      />\n    </ErrorBoundary>\n  );\n}\n```\n\n## Best Practices\n\n1. **Always use the same componentRegistry** in both UIBuilder and LayerRenderer\n2. **Validate variable values** before passing to LayerRenderer to prevent runtime errors\n3. **Handle loading states** while fetching page data and variables\n4. **Use memoization** for expensive variable calculations\n5. **Implement error boundaries** to gracefully handle rendering failures\n6. **Consider caching** page data and variable values for better performance\n7. **Test with different variable combinations** to ensure your pages are robust"
      }
    ]
  } as const satisfies ComponentLayer; 