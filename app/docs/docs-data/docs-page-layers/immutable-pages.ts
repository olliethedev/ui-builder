import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const IMMUTABLE_PAGES_LAYER = {
    "id": "immutable-pages",
    "type": "div",
    "name": "Immutable Pages",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "editor-features"
    },
    "children": [
      {
        "type": "span",
        "children": "Immutable Pages",
        "id": "immutable-pages-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "immutable-pages-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "Control page creation and deletion permissions to create template-based editing experiences. Perfect for maintaining approved layouts while allowing content customization, or creating read-only preview modes."
      },
      {
        "id": "immutable-pages-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "immutable-pages-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "immutable-pages-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Controlled Editing"
              }
            ]
          },
          {
            "id": "immutable-pages-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "immutable-pages-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "http://localhost:3000/examples/editor/immutable-pages",
                  "title": "Immutable Pages Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "immutable-pages-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Page Control Props\n\nUI Builder provides props to control page creation and deletion permissions:\n\n```tsx\n<UIBuilder\n  componentRegistry={componentRegistry}\n  initialLayers={templatePages}\n  allowPagesCreation={false}  // Prevents creating new pages\n  allowPagesDeletion={false}  // Prevents deleting existing pages\n  allowVariableEditing={true} // Still allow variable editing\n/>\n```\n\n## Use Cases\n\n### Template-Based Editing\n\nProvide pre-built page templates that users can customize but not restructure:\n\n```tsx\n// Pre-defined page templates\nconst templatePages = [\n  {\n    id: 'homepage-template',\n    type: 'div',\n    name: 'Homepage',\n    props: {\n      className: 'min-h-screen bg-background'\n    },\n    children: [\n      {\n        id: 'hero-section',\n        type: 'div',\n        name: 'Hero Section',\n        props: {\n          className: 'py-20 text-center'\n        },\n        children: [\n          {\n            id: 'hero-title',\n            type: 'span',\n            name: 'Hero Title',\n            props: {\n              className: 'text-4xl font-bold',\n              children: { __variableRef: 'hero-title-var' }\n            },\n            children: []\n          }\n        ]\n      }\n    ]\n  },\n  {\n    id: 'about-template',\n    type: 'div', \n    name: 'About Page',\n    props: {\n      className: 'min-h-screen bg-background p-8'\n    },\n    children: [\n      // Pre-structured about page content\n    ]\n  }\n];\n\n// Variables for customization\nconst templateVariables = [\n  { id: 'hero-title-var', name: 'heroTitle', type: 'string', defaultValue: 'Welcome to Our Site' },\n  { id: 'company-name-var', name: 'companyName', type: 'string', defaultValue: 'Your Company' }\n];\n\n<UIBuilder\n  componentRegistry={componentRegistry}\n  initialLayers={templatePages}\n  initialVariables={templateVariables}\n  allowPagesCreation={false}  // Can't add/remove pages\n  allowPagesDeletion={false}\n  allowVariableEditing={true} // Can customize content via variables\n/>\n```\n\n### White-Label Solutions\n\nCreate branded templates for different clients:\n\n```tsx\nconst ClientTemplateBuilder = ({ clientConfig }) => {\n  const clientPages = [\n    {\n      id: 'client-homepage',\n      type: 'div',\n      name: 'Homepage',\n      props: {\n        className: 'min-h-screen',\n        style: {\n          '--brand-color': clientConfig.brandColor\n        }\n      },\n      children: [\n        // Client-specific template structure\n      ]\n    }\n  ];\n  \n  const clientVariables = [\n    { id: 'client-name', name: 'clientName', type: 'string', defaultValue: clientConfig.name },\n    { id: 'client-logo', name: 'clientLogo', type: 'string', defaultValue: clientConfig.logoUrl },\n    { id: 'contact-email', name: 'contactEmail', type: 'string', defaultValue: clientConfig.email }\n  ];\n  \n  return (\n    <UIBuilder\n      componentRegistry={componentRegistry}\n      initialLayers={clientPages}\n      initialVariables={clientVariables}\n      allowPagesCreation={false}  // Fixed page structure\n      allowPagesDeletion={false}\n      allowVariableEditing={true} // Client can update their info\n      onChange={(pages) => saveClientPages(clientConfig.id, pages)}\n      onVariablesChange={(vars) => saveClientVariables(clientConfig.id, vars)}\n    />\n  );\n};\n```\n\n### Content-Only Editing\n\nAllow content updates without structural changes:\n\n```tsx\n// Blog template with fixed structure\nconst blogTemplate = [\n  {\n    id: 'blog-page',\n    type: 'article',\n    name: 'Blog Post',\n    props: {\n      className: 'max-w-4xl mx-auto py-8 px-4'\n    },\n    children: [\n      {\n        id: 'blog-header',\n        type: 'header',\n        name: 'Post Header',\n        props: { className: 'mb-8' },\n        children: [\n          {\n            id: 'blog-title',\n            type: 'span',\n            name: 'Post Title',\n            props: {\n              className: 'text-3xl font-bold mb-4 block',\n              children: { __variableRef: 'post-title' }\n            },\n            children: []\n          },\n          {\n            id: 'blog-meta',\n            type: 'div',\n            name: 'Post Meta',\n            props: { className: 'text-sm text-muted-foreground' },\n            children: [\n              {\n                id: 'publish-date',\n                type: 'span',\n                name: 'Publish Date',\n                props: {\n                  children: { __variableRef: 'publish-date' }\n                },\n                children: []\n              }\n            ]\n          }\n        ]\n      },\n      {\n        id: 'blog-content',\n        type: 'div',\n        name: 'Post Content',\n        props: {\n          className: 'prose prose-lg max-w-none',\n          children: { __variableRef: 'post-content' }\n        },\n        children: []\n      }\n    ]\n  }\n];\n\nconst contentVariables = [\n  { id: 'post-title', name: 'postTitle', type: 'string', defaultValue: 'New Blog Post' },\n  { id: 'publish-date', name: 'publishDate', type: 'string', defaultValue: 'January 1, 2024' },\n  { id: 'post-content', name: 'postContent', type: 'string', defaultValue: 'Write your blog post content here...' }\n];\n\n<UIBuilder\n  componentRegistry={componentRegistry}\n  initialLayers={blogTemplate}\n  initialVariables={contentVariables}\n  allowPagesCreation={false}\n  allowPagesDeletion={false}\n  allowVariableEditing={true}\n/>\n```\n\n## Read-Only Preview Mode\n\nCreate completely read-only experiences for previewing:\n\n```tsx\nconst PreviewOnlyBuilder = ({ pageData, variables }) => {\n  // Custom read-only props panel\n  const ReadOnlyPropsPanel = ({ className }) => (\n    <div className={className}>\n      <h3 className=\"text-lg font-semibold mb-4\">Preview Mode</h3>\n      <p className=\"text-sm text-muted-foreground mb-4\">\n        This is a read-only preview. Changes cannot be made.\n      </p>\n      \n      {/* Show selected component info */}\n      <SelectedComponentInfo />\n      \n      {/* Show variable values */}\n      <div className=\"mt-6\">\n        <h4 className=\"font-medium mb-2\">Variables</h4>\n        <div className=\"space-y-2\">\n          {variables.map(variable => (\n            <div key={variable.id} className=\"flex justify-between text-sm\">\n              <span>{variable.name}:</span>\n              <span className=\"text-muted-foreground\">{variable.defaultValue}</span>\n            </div>\n          ))}\n        </div>\n      </div>\n    </div>\n  );\n  \n  // Custom navigation for preview mode\n  const PreviewNavBar = () => (\n    <nav className=\"h-16 border-b bg-muted/30 flex items-center justify-between px-4\">\n      <div className=\"flex items-center gap-3\">\n        <div className=\"w-2 h-2 bg-orange-500 rounded-full\" />\n        <span className=\"font-medium\">Preview Mode</span>\n      </div>\n      \n      <div className=\"flex items-center gap-2\">\n        <Button variant=\"outline\" size=\"sm\" onClick={() => window.print()}>\n          Print\n        </Button>\n        <Button variant=\"default\" size=\"sm\" onClick={() => exitPreview()}>\n          Exit Preview\n        </Button>\n      </div>\n    </nav>\n  );\n  \n  return (\n    <UIBuilder\n      componentRegistry={componentRegistry}\n      initialLayers={pageData}\n      initialVariables={variables}\n      allowPagesCreation={false}\n      allowPagesDeletion={false}\n      allowVariableEditing={false} // No editing allowed\n      panelConfig={{\n        navBar: <PreviewNavBar />,\n        propsPanel: <ReadOnlyPropsPanel />\n      }}\n    />\n  );\n};\n```\n\n## Role-Based Permissions\n\nImplement different permission levels based on user roles:\n\n```tsx\nconst getRoleBasedConfig = (userRole) => {\n  switch (userRole) {\n    case 'admin':\n      return {\n        allowPagesCreation: true,\n        allowPagesDeletion: true,\n        allowVariableEditing: true\n      };\n      \n    case 'editor':\n      return {\n        allowPagesCreation: false,  // Can't change structure\n        allowPagesDeletion: false,\n        allowVariableEditing: true  // Can edit content\n      };\n      \n    case 'content-manager':\n      return {\n        allowPagesCreation: false,\n        allowPagesDeletion: false,\n        allowVariableEditing: true  // Content-only editing\n      };\n      \n    case 'viewer':\n      return {\n        allowPagesCreation: false,\n        allowPagesDeletion: false,\n        allowVariableEditing: false // Read-only\n      };\n      \n    default:\n      return {\n        allowPagesCreation: false,\n        allowPagesDeletion: false,\n        allowVariableEditing: false\n      };\n  }\n};\n\nconst RoleBasedBuilder = ({ user, pages, variables }) => {\n  const permissions = getRoleBasedConfig(user.role);\n  \n  return (\n    <UIBuilder\n      componentRegistry={componentRegistry}\n      initialLayers={pages}\n      initialVariables={variables}\n      {...permissions}\n      onChange={permissions.allowPagesCreation ? savePagesWithPermission : undefined}\n      onVariablesChange={permissions.allowVariableEditing ? saveVariablesWithPermission : undefined}\n    />\n  );\n};\n```\n\n## Progressive Enhancement\n\nStart with limited permissions and unlock features based on user progression:\n\n```tsx\nconst ProgressiveBuilder = ({ userLevel, achievements }) => {\n  const canCreatePages = userLevel >= 3 || achievements.includes('page-master');\n  const canDeletePages = userLevel >= 5 || achievements.includes('admin');\n  const canEditVariables = userLevel >= 1;\n  \n  return (\n    <UIBuilder\n      componentRegistry={componentRegistry}\n      allowPagesCreation={canCreatePages}\n      allowPagesDeletion={canDeletePages}\n      allowVariableEditing={canEditVariables}\n      panelConfig={{\n        navBar: (\n          <div className=\"h-16 border-b flex items-center justify-between px-4\">\n            <div className=\"flex items-center gap-3\">\n              <span>Level {userLevel} Builder</span>\n              <div className=\"flex gap-1\">\n                {achievements.map(achievement => (\n                  <Badge key={achievement} variant=\"secondary\" className=\"text-xs\">\n                    {achievement}\n                  </Badge>\n                ))}\n              </div>\n            </div>\n            \n            <div className=\"text-sm text-muted-foreground\">\n              {!canCreatePages && 'Unlock page creation at Level 3'}\n            </div>\n          </div>\n        )\n      }}\n    />\n  );\n};\n```\n\n## Best Practices\n\n### Template Design\n- **Create comprehensive templates** that cover all necessary content areas\n- **Use meaningful variable names** that content editors will understand\n- **Provide sensible defaults** for all variables\n- **Test templates** with real content scenarios\n\n### Permission Strategy\n- **Start restrictive** and gradually unlock features\n- **Clearly communicate** what users can and cannot do\n- **Provide upgrade paths** for users who need more permissions\n- **Document permission levels** for team understanding\n\n### User Experience\n- **Show permission status** clearly in the UI\n- **Provide helpful messages** when actions are restricted\n- **Focus on enabled capabilities** rather than disabled ones\n- **Offer alternative paths** for restricted actions\n\n### Content Management\n- **Separate structure from content** using variables effectively\n- **Version control templates** separately from content\n- **Provide content guidelines** for variable editing\n- **Monitor content quality** with validation and review processes"
      }
    ]
  } as const satisfies ComponentLayer; 