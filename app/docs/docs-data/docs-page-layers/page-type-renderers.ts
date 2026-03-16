import type { ComponentLayer } from "@/components/ui/ui-builder/types";

export const PAGE_TYPE_RENDERERS_LAYER = {
    "id": "page-type-renderers",
    "type": "div",
    "name": "Page Type Renderers",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "rendering"
    },
    "children": [
      {
        "type": "span",
        "children": "Page Type Renderers",
        "id": "page-type-renderers-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "page-type-renderers-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "UI Builder supports multiple **page types** via the `pageTypeRenderers` and `pageTypeCodeGenerators` props. This extension point lets you add support for email templates, PDFs, React Native, or any other rendering target — without modifying UI Builder's internals.\n\nUI Builder stays framework-agnostic. All framework-specific logic lives in your consumer code."
      },
      {
        "id": "page-type-renderers-api",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## API Reference\n\n### `pageTypeRenderers?: PageTypeRenderers`\n\nA map of page type key → `PageTypeRenderer` config. When provided, UI Builder shows a page type selector in the \"Create new page\" popover and dispatches canvas rendering to the matching renderer for pages of that type.\n\n```ts\ninterface PageTypeRenderer {\n  /** Display label shown in the page type selector (e.g. \"Email\", \"PDF\") */\n  label?: string;\n  /** Root component type for new pages of this type. Defaults to \"div\". */\n  defaultRootLayerType?: string;\n  /** Initial props for the root component of a new page. */\n  defaultRootLayerProps?: Record<string, unknown>;\n  /**\n   * When true, EditorPanel skips AutoFrame + ResizableWrapper entirely.\n   * Reserved for page types that CANNOT render inside an iframe (PDF, react-native-web).\n   * Do NOT set for email — email renders fine inside AutoFrame.\n   */\n  skipAutoFrame?: boolean;\n  /**\n   * Filters the global componentRegistry shown in the add-component popover.\n   * Return a subset of the registry to restrict available components.\n   */\n  filterRegistry?: (registry: ComponentRegistry) => ComponentRegistry;\n  /** Renders the editor canvas for this page type. */\n  renderEditorCanvas: (props: PageTypeRendererProps) => React.ReactNode;\n}\n```\n\n### `pageTypeCodeGenerators?: PageTypeCodeGenerators`\n\nA map of page type key → `PageTypeCodeGenerator`. When present for the active page, replaces the default \"React\" code tab in the code panel.\n\n```ts\ninterface PageTypeCodeGenerator {\n  /** Generates the code/output string for the page. */\n  generateCode: (page: ComponentLayer, registry: ComponentRegistry) => string;\n  /** Tab label, e.g. \"HTML Email\", \"PDF\", \"React Native\". Defaults to \"React\". */\n  label?: string;\n}\n```"
      },
      {
        "id": "page-type-renderers-email-example",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Email Builder Example\n\nThe react-email registry ships everything needed to wire up UI Builder as a full email editor — component definitions, canvas substitutes, code generator, and page renderer config. UI Builder itself has zero knowledge of `@react-email/*`.\n\n### 1. Install react-email components registry\n\n```bash\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/react-email-components-registry.json\n```\n\nThis installs:\n- `lib/ui-builder/registry/react-email-component-definitions.ts` — `ComponentRegistry` for all 14 react-email components\n- `lib/ui-builder/email/email-builder-utils.tsx` — ready-to-use `emailPageRenderer`, `emailCodeGenerator`, and canvas substitutes\n- npm packages: `@react-email/components`, `@react-email/render`, `web-streams-polyfill`\n\n### 2. Wire up the email builder\n\nImport and pass the pre-built config objects to `UIBuilder`:\n\n```tsx\nimport UIBuilder from '@/components/ui/ui-builder';\nimport { reactEmailComponentDefinitions } from '@/lib/ui-builder/registry/react-email-component-definitions';\nimport {\n  emailPageRenderer,\n  emailCodeGenerator,\n} from '@/lib/ui-builder/email/email-builder-utils';\n\nexport function EmailBuilder() {\n  return (\n    <UIBuilder\n      componentRegistry={reactEmailComponentDefinitions}\n      pageTypeRenderers={{ email: emailPageRenderer }}\n      pageTypeCodeGenerators={{ email: emailCodeGenerator }}\n      allowPagesCreation\n    />\n  );\n}\n```\n\n### 3. Safari / iOS compatibility\n\nAdd this import at the **top** of your email route's entry file for Safari/iOS compatibility with `@react-email/render`:\n\n```ts\nimport 'web-streams-polyfill/polyfill';\n```\n\n### Customizing the Email Builder\n\nThe `email-builder-utils.tsx` file also exports the lower-level building blocks if you need to customize behavior — for example, to modify how structural HTML elements are substituted on the canvas:\n\n```tsx\nimport { useMemo } from 'react';\nimport LayerRenderer from '@/components/ui/ui-builder/layer-renderer';\nimport {\n  NullComponent,\n  CanvasHtml,\n  CanvasBody,\n  generateEmailCode,\n} from '@/lib/ui-builder/email/email-builder-utils';\nimport type {\n  PageTypeRenderer,\n  PageTypeRendererProps,\n  ComponentRegistry,\n} from '@/components/ui/ui-builder/types';\n\n// Custom canvas renderer — add your own substitutes or logic\nfunction MyEmailCanvasRenderer({ page, componentRegistry, editorConfig }: PageTypeRendererProps) {\n  const canvasRegistry: ComponentRegistry = useMemo(() => {\n    const base = { ...componentRegistry };\n    if (base.Html) base.Html = { ...base.Html, component: CanvasHtml };\n    if (base.Head) base.Head = { ...base.Head, component: NullComponent };\n    if (base.Preview) base.Preview = { ...base.Preview, component: NullComponent };\n    if (base.Body) base.Body = { ...base.Body, component: CanvasBody };\n    return base;\n  }, [componentRegistry]);\n\n  return (\n    <LayerRenderer\n      className=\"contents\"\n      page={page}\n      componentRegistry={canvasRegistry}\n      editorConfig={editorConfig}\n    />\n  );\n}\n\nconst myEmailPageRenderer: PageTypeRenderer = {\n  label: 'Email',\n  defaultRootLayerType: 'Html',\n  defaultRootLayerProps: { lang: 'en' },\n  renderEditorCanvas: (props) => <MyEmailCanvasRenderer {...props} />,\n};\n```"
      },
      {
        "id": "page-type-renderers-email-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "page-type-renderers-email-demo-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "page-type-renderers-email-demo-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Try it now"
              }
            ]
          },
          {
            "id": "page-type-renderers-email-demo-container",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "page-type-renderers-email-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "/examples/email",
                  "title": "Email Builder Demo",
                  "className": "aspect-square md:aspect-video"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "page-type-renderers-email-components",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Available React Email Components\n\nThe react-email registry includes definitions for all commonly used `@react-email/components`:\n\n| Component | Notes |\n|-----------|-------|\n| `Html` | Root element — new email pages default to this |\n| `Head` | Email `<head>` — must be inside `Html` |\n| `Preview` | Inbox preview text — must be inside `Html` |\n| `Body` | Email body — inside `Html` or `Tailwind` |\n| `Tailwind` | Applies Tailwind CSS to email — wraps `Body` |\n| `Container` | Centered max-width table container |\n| `Section` | Semantic content section |\n| `Row` | Table row layout |\n| `Column` | Table cell — must be inside `Row` |\n| `Text` | Paragraph / text content |\n| `Button` | CTA link-button with VML Outlook support |\n| `Link` | Anchor link |\n| `Img` | Email-safe image |\n| `Hr` | Horizontal divider |\n\n### Tailwind in Email\n\nReact email supports a subset of Tailwind via the `<Tailwind>` wrapper component. Wrap your `<Body>` with `<Tailwind>` to use Tailwind classes on email components.\n\n**Supported:** Most layout utilities (`flex`, `grid`, `p-*`, `m-*`, `text-*`, `bg-*`, etc.)  \n**Not supported:** `prose` (requires @tailwindcss/typography), `space-*`, `hover:` pseudo-class, most media queries in older clients.\n\nSee [caniemail.com](https://www.caniemail.com) for client support details."
      },
      {
        "id": "page-type-renderers-extending",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Extending to Other Targets\n\nThe `PageTypeRenderer` / `PageTypeCodeGenerator` pattern is designed to support any rendering target:\n\n### react-pdf\n\n```tsx\nconst pdfPageRenderer: PageTypeRenderer = {\n  label: 'PDF',\n  defaultRootLayerType: 'Document',\n  skipAutoFrame: true, // PDF viewer cannot render inside an iframe\n  filterRegistry: (registry) => pdfOnlyRegistry,\n  renderEditorCanvas: (props) => (\n    <PDFViewer style={{ width: '100%', height: '100%' }}>\n      <LayerRenderer {...props} />\n    </PDFViewer>\n  ),\n};\n\nconst pdfCodeGenerator: PageTypeCodeGenerator = {\n  label: 'PDF',\n  generateCode: (page, registry) => {\n    // Generate React PDF JSX\n    return `// PDF template for ${page.name}`;\n  },\n};\n```\n\n### Future: react-native-web\n\n```tsx\nconst nativePageRenderer: PageTypeRenderer = {\n  label: 'Native',\n  filterRegistry: (registry) => nativeComponentRegistry,\n  renderEditorCanvas: (props) => <LayerRenderer {...props} />,\n};\n```"
      }
    ],
  } as const satisfies ComponentLayer;
