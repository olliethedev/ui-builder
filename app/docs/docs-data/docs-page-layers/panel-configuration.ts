import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const PANEL_CONFIGURATION_LAYER = {
    "id": "panel-configuration",
    "type": "div",
    "name": "Panel Configuration",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "editor-features"
    },
    "children": [
      {
        "type": "span",
        "children": "Panel Configuration",
        "id": "panel-configuration-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "panel-configuration-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "Configure the editor's panel system to match your workflow. Control the layout, content, and behavior of the main UI Builder panels through the `panelConfig` prop for a customized editing experience."
      },
      {
        "id": "panel-configuration-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "panel-configuration-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "panel-configuration-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Customizable Layout"
              }
            ]
          },
          {
            "id": "panel-configuration-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "panel-configuration-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "http://localhost:3000/examples/editor",
                  "title": "Panel Configuration Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "panel-configuration-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Available Panels\n\nUI Builder consists of four main panels that can be customized:\n\n### Core Panels\n- **Navigation Bar** - Top toolbar with editor controls\n- **Page Config Panel** - Left panel with Layers, Appearance, and Data tabs\n- **Editor Panel** - Center canvas for visual editing\n- **Props Panel** - Right panel for component property editing\n\n## Basic Panel Configuration\n\nUse the `panelConfig` prop to customize any panel:\n\n```tsx\nimport UIBuilder from '@/components/ui/ui-builder';\nimport { NavBar } from '@/components/ui/ui-builder/internal/components/nav';\nimport LayersPanel from '@/components/ui/ui-builder/internal/layers-panel';\nimport EditorPanel from '@/components/ui/ui-builder/internal/editor-panel';\nimport PropsPanel from '@/components/ui/ui-builder/internal/props-panel';\n\n<UIBuilder\n  componentRegistry={componentRegistry}\n  panelConfig={{\n    // Custom navigation bar\n    navBar: <MyCustomNavBar />,\n    \n    // Custom editor panel\n    editorPanel: <MyCustomEditor />,\n    \n    // Custom props panel  \n    propsPanel: <MyCustomPropsPanel />,\n    \n    // Custom page config panel\n    pageConfigPanel: <MyCustomPageConfig />\n  }}\n/>\n```\n\n## Page Config Panel Tabs\n\nThe most common customization is modifying the left panel tabs:\n\n```tsx\nimport { VariablesPanel } from '@/components/ui/ui-builder/internal/variables-panel';\nimport { TailwindThemePanel } from '@/components/ui/ui-builder/internal/tailwind-theme-panel';\nimport { ConfigPanel } from '@/components/ui/ui-builder/internal/config-panel';\n\nconst customTabsContent = {\n  // Required: Layers tab\n  layers: { \n    title: \"Structure\", \n    content: <LayersPanel /> \n  },\n  \n  // Optional: Appearance tab\n  appearance: { \n    title: \"Styling\", \n    content: (\n      <div className=\"py-2 px-4 gap-2 flex flex-col overflow-y-auto\">\n        <ConfigPanel />\n        <TailwindThemePanel />\n        <MyCustomStylePanel />\n      </div>\n    )\n  },\n  \n  // Optional: Data tab\n  data: { \n    title: \"Variables\", \n    content: <VariablesPanel /> \n  },\n  \n  // Add completely custom tabs\n  assets: {\n    title: \"Assets\",\n    content: <MyAssetLibrary />\n  }\n};\n\n<UIBuilder\n  componentRegistry={componentRegistry}\n  panelConfig={{\n    pageConfigPanelTabsContent: customTabsContent\n  }}\n/>\n```\n\n## Default Panel Configuration\n\nThis is the default panel setup (equivalent to not providing `panelConfig`):\n\n```tsx\nimport { \n  defaultConfigTabsContent, \n  getDefaultPanelConfigValues \n} from '@/components/ui/ui-builder';\n\n// Default tabs content\nconst defaultTabs = defaultConfigTabsContent();\n// Returns:\n// {\n//   layers: { title: \"Layers\", content: <LayersPanel /> },\n//   appearance: { title: \"Appearance\", content: <ConfigPanel + TailwindThemePanel> },\n//   data: { title: \"Data\", content: <VariablesPanel /> }\n// }\n\n// Default panel values\nconst defaultPanels = getDefaultPanelConfigValues(defaultTabs);\n// Returns:\n// {\n//   navBar: <NavBar />,\n//   pageConfigPanel: <PageConfigPanel tabsContent={defaultTabs} />,\n//   editorPanel: <EditorPanel />,\n//   propsPanel: <PropsPanel />\n// }\n```\n\n## Custom Navigation Bar\n\nReplace the default navigation with your own:\n\n```tsx\nconst MyCustomNavBar = () => {\n  const showLeftPanel = useEditorStore(state => state.showLeftPanel);\n  const toggleLeftPanel = useEditorStore(state => state.toggleLeftPanel);\n  const showRightPanel = useEditorStore(state => state.showRightPanel);\n  const toggleRightPanel = useEditorStore(state => state.toggleRightPanel);\n  \n  return (\n    <nav className=\"h-16 border-b bg-background flex items-center justify-between px-4\">\n      {/* Left side */}\n      <div className=\"flex items-center gap-2\">\n        <img src=\"/my-logo.svg\" alt=\"My Builder\" className=\"h-8\" />\n        <span className=\"font-semibold\">Page Builder</span>\n      </div>\n      \n      {/* Center actions */}\n      <div className=\"flex items-center gap-2\">\n        <Button \n          variant=\"outline\" \n          size=\"sm\"\n          onClick={toggleLeftPanel}\n        >\n          {showLeftPanel ? 'Hide' : 'Show'} Panels\n        </Button>\n        <Button variant=\"default\" size=\"sm\">\n          Save\n        </Button>\n        <Button variant=\"outline\" size=\"sm\">\n          Preview\n        </Button>\n      </div>\n      \n      {/* Right side */}\n      <div className=\"flex items-center gap-2\">\n        <ThemeToggle />\n        <UserMenu />\n      </div>\n    </nav>\n  );\n};\n\n<UIBuilder\n  componentRegistry={componentRegistry}\n  panelConfig={{\n    navBar: <MyCustomNavBar />\n  }}\n/>\n```\n\n## Custom Editor Panel\n\nReplace the canvas area with custom functionality:\n\n```tsx\nconst MyCustomEditor = ({ className }) => {\n  const selectedPageId = useLayerStore(state => state.selectedPageId);\n  const findLayerById = useLayerStore(state => state.findLayerById);\n  const currentPage = findLayerById(selectedPageId);\n  \n  return (\n    <div className={className}>\n      {/* Custom toolbar */}\n      <div className=\"border-b p-2 flex items-center gap-2\">\n        <Button size=\"sm\" variant=\"outline\">\n          <Undo className=\"w-4 h-4\" />\n        </Button>\n        <Button size=\"sm\" variant=\"outline\">\n          <Redo className=\"w-4 h-4\" />\n        </Button>\n        <Separator orientation=\"vertical\" className=\"h-6\" />\n        <Select defaultValue=\"100%\">\n          <SelectTrigger className=\"w-24\">\n            <SelectValue />\n          </SelectTrigger>\n          <SelectContent>\n            <SelectItem value=\"50%\">50%</SelectItem>\n            <SelectItem value=\"100%\">100%</SelectItem>\n            <SelectItem value=\"150%\">150%</SelectItem>\n          </SelectContent>\n        </Select>\n      </div>\n      \n      {/* Custom canvas */}\n      <div className=\"flex-1 p-4\">\n        <div className=\"border rounded-lg overflow-hidden bg-white shadow-sm\">\n          {currentPage && (\n            <LayerRenderer\n              page={currentPage}\n              componentRegistry={componentRegistry}\n              editorConfig={{ isEditor: true }}\n            />\n          )}\n        </div>\n      </div>\n    </div>\n  );\n};\n\n<UIBuilder\n  panelConfig={{\n    editorPanel: <MyCustomEditor className=\"flex flex-col h-full\" />\n  }}\n/>\n```\n\n## Responsive Panel Behavior\n\nUI Builder automatically handles responsive layouts:\n\n### Desktop Layout\n- **Three panels** side by side using ResizablePanelGroup\n- **Resizable handles** between panels\n- **Collapsible panels** via editor store state\n\n### Mobile Layout\n- **Single panel view** with bottom navigation\n- **Panel switcher** at the bottom\n- **Full-screen panels** for better mobile experience\n\n### Panel Visibility Control\n\n```tsx\n// Control panel visibility programmatically\nconst MyPanelController = () => {\n  const { \n    showLeftPanel, \n    showRightPanel,\n    toggleLeftPanel, \n    toggleRightPanel \n  } = useEditorStore();\n  \n  return (\n    <div className=\"flex gap-2\">\n      <Button \n        variant={showLeftPanel ? \"default\" : \"outline\"}\n        onClick={toggleLeftPanel}\n      >\n        Left Panel\n      </Button>\n      <Button \n        variant={showRightPanel ? \"default\" : \"outline\"}\n        onClick={toggleRightPanel}\n      >\n        Right Panel\n      </Button>\n    </div>\n  );\n};\n```\n\n## Integration with Editor State\n\nPanels integrate with the editor state management:\n\n```tsx\n// Access editor state in custom panels\nconst MyCustomPanel = () => {\n  const componentRegistry = useEditorStore(state => state.registry);\n  const allowPagesCreation = useEditorStore(state => state.allowPagesCreation);\n  const allowVariableEditing = useEditorStore(state => state.allowVariableEditing);\n  \n  const selectedLayerId = useLayerStore(state => state.selectedLayerId);\n  const pages = useLayerStore(state => state.pages);\n  const variables = useLayerStore(state => state.variables);\n  \n  return (\n    <div className=\"p-4\">\n      <h3>Custom Panel</h3>\n      <p>Registry has {Object.keys(componentRegistry).length} components</p>\n      <p>Current page: {pages.find(p => p.id === selectedLayerId)?.name}</p>\n      <p>Variables: {variables.length}</p>\n    </div>\n  );\n};\n```\n\n## Best Practices\n\n### Panel Design\n- **Follow existing patterns** for consistency\n- **Use proper overflow handling** (`overflow-y-auto`) for scrollable content\n- **Include proper padding/spacing** (`px-4 py-2`)\n- **Respect theme variables** for colors and spacing\n\n### State Management\n- **Use editor and layer stores** for state access\n- **Don't duplicate state** - use the existing stores\n- **Subscribe to specific slices** to avoid unnecessary re-renders\n- **Use proper cleanup** in useEffect hooks\n\n### Performance\n- **Memoize expensive components** with React.memo\n- **Use virtualization** for large lists\n- **Debounce rapid updates** when needed\n- **Minimize re-renders** by careful state subscription\n\n### Accessibility\n- **Provide proper ARIA labels** for custom controls\n- **Ensure keyboard navigation** works correctly\n- **Use semantic HTML** where possible\n- **Test with screen readers** for complex interactions"
      }
    ]
  } as const satisfies ComponentLayer; 