import type { ComponentLayer } from "@/components/ui/ui-builder/types";

export const READ_ONLY_MODE_LAYER = {
    "id": "read-only-mode",
    "type": "div",
    "name": "Editing Restrictions",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "data-variables"
    },
    "children": [
      {
        "type": "span",
        "children": "Editing Restrictions",
        "id": "read-only-mode-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "read-only-mode-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "Control editing capabilities in UI Builder by restricting specific operations like variable editing, page creation, and page deletion. Perfect for production environments, content-only editing, and role-based access control."
      },
      {
        "id": "read-only-mode-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Permission Control Props\n\nUI Builder provides three boolean props to control editing permissions:\n\n```tsx\n<UIBuilder\n  allowVariableEditing={false}  // Disable variable CRUD operations\n  allowPagesCreation={false}    // Disable creating new pages\n  allowPagesDeletion={false}    // Disable deleting pages\n  componentRegistry={myComponentRegistry}\n/>\n```\n\n| Prop | Default | Description |\n|------|---------|-------------|\n| `allowVariableEditing` | `true` | Controls variable add/edit/delete in Variables panel |\n| `allowPagesCreation` | `true` | Controls ability to create new pages |\n| `allowPagesDeletion` | `true` | Controls ability to delete existing pages |\n\n## Interactive Demo\n\nExperience all read-only modes in one interactive demo:\n\n- **Live Demo:** [/examples/editor/read-only-mode](/examples/editor/read-only-mode)\n- **Features:** Switch between different permission levels in real-time\n- **Modes:** Full editing, content-only, no variables, and full read-only\n- **What to try:** Toggle between modes to see UI changes and restrictions"
      },
      {
        "id": "demo-iframe",
        "type": "iframe",
        "name": "Read-Only Demo Iframe",
        "props": {
          "src": "/examples/editor/read-only-mode",
          "width": "100%",
          "height": "600",
          "frameBorder": "0",
          "className": "w-full border border-gray-200 rounded-lg shadow-sm mb-6",
          "title": "UI Builder Read-Only Mode Interactive Demo"
        },
        "children": []
      },
      {
        "id": "read-only-mode-content-continued",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Common Use Cases\n\n### Content-Only Editing\n\nAllow content editing while preventing structural changes:\n\n```tsx\n<UIBuilder\n  allowPagesCreation={false}    // Lock page structure\n  allowPagesDeletion={false}    // Prevent accidental page loss\n  allowVariableEditing={true}   // Allow content variable updates\n  componentRegistry={myComponentRegistry}\n/>\n```\n\n**Use case:** Content teams updating copy, images, and variable content without changing page layouts.\n\n### Production Preview Mode\n\nLock down all structural changes:\n\n```tsx\n<UIBuilder\n  allowVariableEditing={false}  // Lock system variables\n  allowPagesCreation={false}    // No new pages\n  allowPagesDeletion={false}    // No page deletion\n  initialLayers={templatePages}\n  initialVariables={systemVariables}\n  componentRegistry={myComponentRegistry}\n/>\n```\n\n**Use case:** Previewing templates in production with system-controlled variables.\n\n### Role-Based Access Control\n\nDifferent permissions based on user roles:\n\n```tsx\nfunction RoleBasedEditor({ user, template }) {\n  const canEditVariables = user.role === 'admin' || user.role === 'developer';\n  const canManagePages = user.role === 'admin';\n\n  return (\n    <UIBuilder\n      allowVariableEditing={canEditVariables}\n      allowPagesCreation={canManagePages}\n      allowPagesDeletion={canManagePages}\n      initialLayers={template.pages}\n      initialVariables={template.variables}\n      componentRegistry={myComponentRegistry}\n    />\n  );\n}\n```\n\n## Variable Binding in Templates\n\nWhen creating templates with variable references, use the correct format:\n\n```tsx\n// ✅ Correct: Variable binding in component props\nconst templateLayer: ComponentLayer = {\n  id: \"title\",\n  type: \"span\",\n  name: \"Title\",\n  props: {\n    className: \"text-2xl font-bold\",\n    children: { __variableRef: \"pageTitle\" }  // Correct format\n  },\n  children: []\n};\n\n// ❌ Incorrect: Variable binding directly in children\nconst badTemplate: ComponentLayer = {\n  id: \"title\",\n  type: \"span\",\n  name: \"Title\",\n  props: {\n    className: \"text-2xl font-bold\"\n  },\n  children: { __variableRef: \"pageTitle\" }  // Wrong - causes TypeScript errors\n};\n```\n\n**Key points:**\n- Variable references go in the `props` object\n- Use `__variableRef` (without quotes) as the property name\n- The value is the variable ID as a string\n- Set `children: []` when using variable binding\n\n## Additional Examples\n\n### Fixed Pages Example\n\nSee the immutable pages example that demonstrates locked page structure:\n\n- **Live Demo:** [/examples/editor/immutable-pages](/examples/editor/immutable-pages)\n- **Implementation:** Uses `allowPagesCreation={false}` and `allowPagesDeletion={false}`\n- **What's locked:** Page creation and deletion\n- **What works:** Content editing, component manipulation, theme changes\n\n### Variable Read-Only Example\n\nSee the immutable bindings example that demonstrates locked variables:\n\n- **Live Demo:** [/examples/editor/immutable-bindings](/examples/editor/immutable-bindings)\n- **Implementation:** Uses `allowVariableEditing={false}`\n- **What's locked:** Variable creation, editing, and deletion\n- **What works:** Variable binding in props panel, visual component editing\n\n## What's Still Available in Read-Only Mode\n\nEven with restrictions enabled, users can still:\n\n✅ **Visual Component Editing:** Add, remove, and modify components on the canvas  \n✅ **Props Panel:** Configure component properties and bind to existing variables  \n✅ **Appearance Panel:** Modify themes and styling  \n✅ **Layer Navigation:** Select and organize components in the layers panel  \n✅ **Undo/Redo:** Full history navigation  \n✅ **Code Generation:** Export React code  \n\n## When to Use LayerRenderer Instead\n\nFor pure display without any editing interface, use `LayerRenderer`:\n\n```tsx\nimport LayerRenderer from '@/components/ui/ui-builder/layer-renderer';\n\nfunction DisplayOnlyPage({ pageData, variables, userValues }) {\n  return (\n    <LayerRenderer\n      page={pageData}\n      componentRegistry={myComponentRegistry}\n      variables={variables}\n      variableValues={userValues}  // Runtime data injection\n    />\n  );\n}\n```\n\n**Choose LayerRenderer when:**\n- No editing interface needed\n- Smaller bundle size required  \n- Better performance for display-only scenarios\n- Rendering with dynamic data at runtime\n\n**Choose restricted UIBuilder when:**\n- Some editing capabilities needed\n- Code generation features required\n- Visual interface helps with content understanding\n- Fine-grained permission control needed\n\n## Implementation Pattern\n\n```tsx\nfunction ConfigurableEditor({ \n  template, \n  user, \n  environment \n}) {\n  const permissions = {\n    allowVariableEditing: environment !== 'production' && user.canEditVariables,\n    allowPagesCreation: user.role === 'admin',\n    allowPagesDeletion: user.role === 'admin'\n  };\n\n  return (\n    <UIBuilder\n      {...permissions}\n      initialLayers={template.pages}\n      initialVariables={template.variables}\n      componentRegistry={myComponentRegistry}\n      persistLayerStore={environment === 'development'}\n    />\n  );\n}\n```\n\n## Best Practices\n\n### Security Considerations\n\n- **Validate data server-side:** Client-side restrictions are for UX, not security\n- **Sanitize inputs:** Always validate and sanitize layer data and variables\n- **Use immutable bindings:** For system variables that must never change\n- **Implement proper authentication:** Control access at the application level\n\n### User Experience\n\n- **Provide clear feedback:** Show users what's restricted and why\n- **Progressive permissions:** Unlock features as users gain trust/experience\n- **Contextual help:** Explain restrictions in context\n- **Consistent behavior:** Apply restrictions predictably across the interface\n\n### Performance\n\n- **Use LayerRenderer for display-only:** Smaller bundle, better performance\n- **Cache configurations:** Avoid re-computing permissions on every render\n- **Optimize initial data:** Only load necessary variables and pages\n- **Consider lazy loading:** Load restricted features only when needed"
      }
    ]
  } as const satisfies ComponentLayer; 