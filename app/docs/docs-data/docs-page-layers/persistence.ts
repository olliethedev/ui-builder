import type { ComponentLayer } from "@/components/ui/ui-builder/types";

export const PERSISTENCE_LAYER = {
    "id": "persistence",
    "type": "div",
    "name": "State Management & Persistence",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "layout-persistence"
    },
    "children": [
      {
        "type": "span",
        "children": "State Management & Persistence",
        "id": "persistence-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "persistence-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "UI Builder provides flexible state management and persistence options for your layouts and variables. Choose between automatic local storage, custom database integration, or complete manual control based on your application's needs."
      },
      {
        "id": "persistence-state-overview",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Understanding UI Builder State\n\nUI Builder manages two main types of state:\n- **Pages & Layers**: The component hierarchy, structure, and configuration\n- **Variables**: Dynamic data definitions that can be bound to component properties\n\nBoth are managed independently and can be persisted using different strategies."
      },
      {
        "id": "persistence-local-storage",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Local Storage Persistence\n\nBy default, UI Builder automatically saves state to browser local storage:\n\n```tsx\n// Default behavior - auto-saves to localStorage\n<UIBuilder componentRegistry={componentRegistry} />\n\n// Disable local storage persistence\n<UIBuilder \n  componentRegistry={componentRegistry}\n  persistLayerStore={false}\n/>\n```\n\n**When to use:** Development, prototyping, or single-user applications where browser storage is sufficient.\n\n**Limitations:** Data is tied to the browser/device and can be cleared by the user."
      },
      {
        "id": "persistence-database-integration",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Database Integration\n\nFor production applications, integrate with your database using the initialization and callback props:\n\n```tsx\nimport UIBuilder from '@/components/ui/ui-builder';\nimport type { ComponentLayer, Variable, LayerChangeHandler, VariableChangeHandler } from '@/components/ui/ui-builder/types';\n\nfunction DatabaseIntegratedBuilder({ userId }: { userId: string }) {\n  const [initialLayers, setInitialLayers] = useState<ComponentLayer[]>();\n  const [initialVariables, setInitialVariables] = useState<Variable[]>();\n  const [isLoading, setIsLoading] = useState(true);\n\n  // Load initial state from database\n  useEffect(() => {\n    async function loadUserLayout() {\n      try {\n        const [layoutRes, variablesRes] = await Promise.all([\n          fetch(`/api/layouts/${userId}`),\n          fetch(`/api/variables/${userId}`)\n        ]);\n        \n        const layoutData = await layoutRes.json();\n        const variablesData = await variablesRes.json();\n        \n        setInitialLayers(layoutData.layers || []);\n        setInitialVariables(variablesData.variables || []);\n      } catch (error) {\n        console.error('Failed to load layout:', error);\n        setInitialLayers([]);\n        setInitialVariables([]);\n      } finally {\n        setIsLoading(false);\n      }\n    }\n\n    loadUserLayout();\n  }, [userId]);\n\n  // Save layers to database\n  const handleLayersChange: LayerChangeHandler = async (updatedLayers) => {\n    try {\n      await fetch(`/api/layouts/${userId}`, {\n        method: 'PUT',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ layers: updatedLayers })\n      });\n    } catch (error) {\n      console.error('Failed to save layers:', error);\n    }\n  };\n\n  // Save variables to database\n  const handleVariablesChange: VariableChangeHandler = async (updatedVariables) => {\n    try {\n      await fetch(`/api/variables/${userId}`, {\n        method: 'PUT',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ variables: updatedVariables })\n      });\n    } catch (error) {\n      console.error('Failed to save variables:', error);\n    }\n  };\n\n  if (isLoading) {\n    return <div>Loading your layout...</div>;\n  }\n\n  return (\n    <UIBuilder\n      componentRegistry={componentRegistry}\n      initialLayers={initialLayers}\n      onChange={handleLayersChange}\n      initialVariables={initialVariables}\n      onVariablesChange={handleVariablesChange}\n      persistLayerStore={false} // Disable localStorage\n    />\n  );\n}\n```"
      },
      {
        "id": "persistence-props-reference",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Persistence-Related Props\n\n### Core Persistence Props\n\n- **`persistLayerStore`** (`boolean`, default: `true`): Controls localStorage persistence\n- **`initialLayers`** (`ComponentLayer[]`): Initial pages/layers to load\n- **`onChange`** (`LayerChangeHandler<TRegistry>`): Callback when layers change\n- **`initialVariables`** (`Variable[]`): Initial variables to load\n- **`onVariablesChange`** (`VariableChangeHandler`): Callback when variables change\n\n### Permission Control Props\n\nControl what users can modify to prevent unwanted changes:\n\n- **`allowVariableEditing`** (`boolean`, default: `true`): Allow variable creation/editing\n- **`allowPagesCreation`** (`boolean`, default: `true`): Allow new page creation\n- **`allowPagesDeletion`** (`boolean`, default: `true`): Allow page deletion\n\n```tsx\n// Read-only editor for content review\n<UIBuilder\n  componentRegistry={componentRegistry}\n  initialLayers={existingLayout}\n  allowVariableEditing={false}\n  allowPagesCreation={false}\n  allowPagesDeletion={false}\n  persistLayerStore={false}\n/>\n```"
      },
      {
        "id": "persistence-working-examples",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Working Examples\n\nExplore these working examples in the project:\n\n- **[Basic Example](/examples/basic)**: Simple setup with localStorage persistence\n- **[Editor Example](/examples/editor)**: Full editor with custom configuration\n- **[Immutable Pages](/examples/editor/immutable-pages)**: Read-only pages with `allowPagesCreation={false}` and `allowPagesDeletion={false}`\n\nThe examples demonstrate different persistence patterns you can adapt for your use case."
      },
      {
        "id": "persistence-debounced-save",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Debounced Auto-Save\n\nAvoid excessive API calls with debounced saving:\n\n```tsx\nimport { useCallback } from 'react';\nimport { debounce } from 'lodash';\n\nfunction AutoSaveBuilder() {\n  // Debounce saves to reduce API calls\n  const debouncedSaveLayers = useCallback(\n    debounce(async (layers: ComponentLayer[]) => {\n      try {\n        await fetch('/api/layouts/save', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ layers })\n        });\n      } catch (error) {\n        console.error('Auto-save failed:', error);\n      }\n    }, 2000), // 2 second delay\n    []\n  );\n\n  const debouncedSaveVariables = useCallback(\n    debounce(async (variables: Variable[]) => {\n      try {\n        await fetch('/api/variables/save', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ variables })\n        });\n      } catch (error) {\n        console.error('Variables auto-save failed:', error);\n      }\n    }, 2000),\n    []\n  );\n\n  return (\n    <UIBuilder\n      componentRegistry={componentRegistry}\n      onChange={debouncedSaveLayers}\n      onVariablesChange={debouncedSaveVariables}\n      persistLayerStore={false}\n    />\n  );\n}\n```"
      },
      {
        "id": "persistence-data-format",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Data Format\n\nUI Builder saves data as plain JSON with a predictable structure:\n\n```json\n{\n  \"layers\": [\n    {\n      \"id\": \"page-1\",\n      \"type\": \"div\",\n      \"name\": \"Page 1\",\n      \"props\": {\n        \"className\": \"p-4 bg-white\"\n      },\n      \"children\": [\n        {\n          \"id\": \"button-1\",\n          \"type\": \"Button\",\n          \"name\": \"Submit Button\",\n          \"props\": {\n            \"variant\": \"default\",\n            \"children\": {\n              \"__variableRef\": \"buttonText\"\n            }\n          },\n          \"children\": []\n        }\n      ]\n    }\n  ],\n  \"variables\": [\n    {\n      \"id\": \"buttonText\",\n      \"name\": \"Button Text\",\n      \"type\": \"string\",\n      \"defaultValue\": \"Click Me!\"\n    }\n  ]\n}\n```\n\n**Variable References**: Component properties bound to variables use `{ \"__variableRef\": \"variableId\" }` format."
      },
      {
        "id": "persistence-api-routes",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Next.js API Route Examples\n\n### Layout API Route\n\n```tsx\n// app/api/layouts/[userId]/route.ts\nimport { NextRequest, NextResponse } from 'next/server';\n\nexport async function GET(\n  request: NextRequest,\n  { params }: { params: { userId: string } }\n) {\n  try {\n    const layout = await getUserLayout(params.userId);\n    return NextResponse.json({ layers: layout });\n  } catch (error) {\n    return NextResponse.json(\n      { error: 'Failed to load layout' },\n      { status: 500 }\n    );\n  }\n}\n\nexport async function PUT(\n  request: NextRequest,\n  { params }: { params: { userId: string } }\n) {\n  try {\n    const { layers } = await request.json();\n    await saveUserLayout(params.userId, layers);\n    return NextResponse.json({ success: true });\n  } catch (error) {\n    return NextResponse.json(\n      { error: 'Failed to save layout' },\n      { status: 500 }\n    );\n  }\n}\n```\n\n### Variables API Route  \n\n```tsx\n// app/api/variables/[userId]/route.ts\nexport async function PUT(\n  request: NextRequest,\n  { params }: { params: { userId: string } }\n) {\n  try {\n    const { variables } = await request.json();\n    await saveUserVariables(params.userId, variables);\n    return NextResponse.json({ success: true });\n  } catch (error) {\n    return NextResponse.json(\n      { error: 'Failed to save variables' },\n      { status: 500 }\n    );\n  }\n}\n```"
      },
      {
        "id": "persistence-error-handling",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Error Handling & Recovery\n\nImplement robust error handling for production applications:\n\n```tsx\nfunction RobustBuilder() {\n  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error' | 'success'>('idle');\n  const [lastError, setLastError] = useState<string | null>(null);\n\n  const handleSaveWithRetry = async (layers: ComponentLayer[], retries = 3) => {\n    setSaveStatus('saving');\n    \n    for (let i = 0; i < retries; i++) {\n      try {\n        await fetch('/api/layouts/save', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ layers })\n        });\n        \n        setSaveStatus('success');\n        setLastError(null);\n        return;\n      } catch (error) {\n        if (i === retries - 1) {\n          setSaveStatus('error');\n          setLastError('Failed to save after multiple attempts');\n        } else {\n          // Wait before retry with exponential backoff\n          await new Promise(resolve => \n            setTimeout(resolve, Math.pow(2, i) * 1000)\n          );\n        }\n      }\n    }\n  };\n\n  return (\n    <div className=\"flex flex-col h-full\">\n      {/* Status Bar */}\n      <div className=\"flex items-center justify-between p-2 border-b bg-muted/50\">\n        <div className=\"flex items-center gap-2\">\n          {saveStatus === 'saving' && (\n            <Badge variant=\"outline\">Saving...</Badge>\n          )}\n          {saveStatus === 'success' && (\n            <Badge variant=\"default\">Saved</Badge>\n          )}\n          {saveStatus === 'error' && (\n            <Badge variant=\"destructive\">Save Failed</Badge>\n          )}\n        </div>\n        \n        {lastError && (\n          <Button \n            variant=\"outline\" \n            size=\"sm\"\n            onClick={() => window.location.reload()}\n          >\n            Reload Page\n          </Button>\n        )}\n      </div>\n      \n      {/* Builder */}\n      <div className=\"flex-1\">\n        <UIBuilder\n          componentRegistry={componentRegistry}\n          onChange={handleSaveWithRetry}\n          persistLayerStore={false}\n        />\n      </div>\n    </div>\n  );\n}\n```"
      },
      {
        "id": "persistence-best-practices",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Best Practices\n\n### 1. **Choose the Right Persistence Strategy**\n- **localStorage**: Development, prototyping, single-user apps\n- **Database**: Production, multi-user, collaborative editing\n- **Hybrid**: localStorage for drafts, database for published versions\n\n### 2. **Implement Proper Error Handling**\n- Always handle save failures gracefully\n- Provide user feedback for save status\n- Implement retry logic with exponential backoff\n- Offer recovery options when saves fail\n\n### 3. **Optimize API Performance**\n- Use debouncing to reduce API calls (2-5 second delays)\n- Consider batching layer and variable saves\n- Implement optimistic updates for better UX\n- Use proper HTTP status codes and error responses\n\n### 4. **Control User Permissions**\n- Use `allowVariableEditing={false}` for content-only editing\n- Set `allowPagesCreation={false}` for fixed page structures  \n- Implement role-based access control in your API routes\n\n### 5. **Plan for Scale**\n- Consider data size limits (layers can grow large)\n- Implement pagination for large datasets\n- Use database indexing on user IDs and timestamps\n- Consider caching frequently accessed layouts"
      }
    ]
  } as const satisfies ComponentLayer; 