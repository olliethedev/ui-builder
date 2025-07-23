import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const APPEARANCE_PANEL_LAYER = {
    "id": "appearance-panel",
    "type": "div",
    "name": "Appearance Panel",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "editor-features"
    },
    "children": [
      {
        "type": "span",
        "children": "Appearance Panel",
        "id": "appearance-panel-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "appearance-panel-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "The appearance panel provides visual tools for page configuration and Tailwind CSS theme management. Configure page settings and global styling through an intuitive interface that integrates with your design system."
      },
      {
        "id": "appearance-panel-demo",
        "type": "div",
        "name": "div",
        "props": {},
        "children": [
          {
            "id": "appearance-panel-badge",
            "type": "Badge",
            "name": "Badge",
            "props": {
              "variant": "default",
              "className": "rounded rounded-b-none"
            },
            "children": [
              {
                "id": "appearance-panel-badge-text",
                "type": "span",
                "name": "span",
                "props": {},
                "children": "Theme & Config"
              }
            ]
          },
          {
            "id": "appearance-panel-demo-frame",
            "type": "div",
            "name": "div",
            "props": {
              "className": "border border-primary shadow-lg rounded-b-sm rounded-tr-sm overflow-hidden"
            },
            "children": [
              {
                "id": "appearance-panel-iframe",
                "type": "iframe",
                "name": "iframe",
                "props": {
                  "src": "http://localhost:3000/examples/editor",
                  "title": "Appearance Panel Demo",
                  "className": "aspect-square md:aspect-video w-full"
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "appearance-panel-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Panel Components\n\nThe appearance panel consists of two main components:\n\n### ConfigPanel\nManages page-level configuration:\n- **Page Name** - Edit the current page's display name\n- **Page Properties** - Configure page-specific settings\n- **Page Actions** - Duplicate or delete pages\n\n### TailwindThemePanel\nProvides Tailwind CSS theme management:\n- **CSS Variables** - Edit theme CSS custom properties\n- **Color Palette** - Manage theme colors\n- **Theme Toggle** - Switch between light/dark modes\n- **Live Preview** - See theme changes instantly\n\n## Page Configuration\n\nThe ConfigPanel allows you to edit page properties:\n\n```tsx\n// Current page configuration\nconst currentPage = {\n  id: 'homepage',\n  name: 'Home Page', // Editable in ConfigPanel\n  type: 'div',\n  props: {\n    className: 'min-h-screen bg-background'\n  },\n  children: []\n};\n\n// ConfigPanel provides:\n// - Page name editing\n// - Duplicate page button\n// - Delete page button (if multiple pages exist)\n```\n\n## Tailwind Theme Management\n\nThe TailwindThemePanel integrates with shadcn/ui's CSS variable system:\n\n### CSS Variables Structure\n\n```css\n/* Light mode variables */\n:root {\n  --background: 0 0% 100%;\n  --foreground: 222.2 84% 4.9%;\n  --primary: 221.2 83.2% 53.3%;\n  --primary-foreground: 210 40% 98%;\n  --secondary: 210 40% 96%;\n  --secondary-foreground: 222.2 84% 4.9%;\n  /* ... more variables */\n}\n\n/* Dark mode variables */\n.dark {\n  --background: 222.2 84% 4.9%;\n  --foreground: 210 40% 98%;\n  --primary: 217.2 91.2% 59.8%;\n  --primary-foreground: 222.2 84% 4.9%;\n  /* ... more variables */\n}\n```\n\n### Theme Editing\n\nThe TailwindThemePanel allows real-time editing of theme variables:\n\n- **Color Pickers** - Visual color selection for theme variables\n- **HSL Values** - Direct HSL value editing\n- **Live Preview** - Changes apply instantly to the editor\n- **Reset Options** - Restore default theme values\n\n## Customizing the Appearance Panel\n\nYou can customize the appearance panel through `panelConfig`:\n\n```tsx\nimport { ConfigPanel } from '@/components/ui/ui-builder/internal/config-panel';\nimport { TailwindThemePanel } from '@/components/ui/ui-builder/internal/tailwind-theme-panel';\n\n// Custom appearance panel content\nconst customAppearancePanel = (\n  <div className=\"py-2 px-4 gap-2 flex flex-col overflow-y-auto\">\n    <ConfigPanel />\n    <TailwindThemePanel />\n    {/* Add your custom components */}\n    <MyCustomThemeSettings />\n  </div>\n);\n\n<UIBuilder\n  panelConfig={{\n    pageConfigPanelTabsContent: {\n      layers: { title: \"Layers\", content: <LayersPanel /> },\n      appearance: { \n        title: \"Theme\", \n        content: customAppearancePanel \n      },\n      data: { title: \"Data\", content: <VariablesPanel /> }\n    }\n  }}\n/>\n```\n\n## Theme Integration with Components\n\nComponents automatically inherit theme variables through Tailwind CSS classes:\n\n```tsx\n// Component using theme colors\nconst ThemedButton = {\n  component: Button,\n  schema: z.object({\n    variant: z.enum(['default', 'destructive', 'outline']).default('default'),\n    children: z.any().optional()\n  }),\n  from: '@/components/ui/button'\n};\n\n// Button component CSS (simplified)\n.btn-default {\n  background-color: hsl(var(--primary));\n  color: hsl(var(--primary-foreground));\n}\n\n.btn-destructive {\n  background-color: hsl(var(--destructive));\n  color: hsl(var(--destructive-foreground));\n}\n```\n\n## Working with CSS Variables\n\n### Adding Custom Variables\n\nExtend the theme system with custom CSS variables:\n\n```css\n/* In your global CSS */\n:root {\n  /* Existing shadcn/ui variables */\n  --background: 0 0% 100%;\n  --foreground: 222.2 84% 4.9%;\n  \n  /* Your custom variables */\n  --brand-primary: 220 90% 56%;\n  --brand-secondary: 340 82% 52%;\n  --accent-gradient: linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)));\n}\n\n.dark {\n  /* Dark mode overrides */\n  --brand-primary: 220 90% 66%;\n  --brand-secondary: 340 82% 62%;\n}\n```\n\n### Using Variables in Components\n\n```tsx\n// Component that uses custom theme variables\nconst BrandCard = {\n  component: ({ children, className, ...props }) => (\n    <div \n      className={cn(\n        'p-6 rounded-lg border',\n        'bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]',\n        'text-white',\n        className\n      )}\n      {...props}\n    >\n      {children}\n    </div>\n  ),\n  schema: z.object({\n    className: z.string().optional(),\n    children: z.any().optional()\n  }),\n  from: '@/components/brand-card'\n};\n```\n\n## Responsive Theming\n\nTailwind CSS and the theme panel support responsive design:\n\n```tsx\n// Responsive component using theme variables\nconst ResponsiveHero = {\n  type: 'div',\n  props: {\n    className: [\n      'bg-background text-foreground',\n      'p-4 md:p-8 lg:p-12', // Responsive padding\n      'min-h-screen flex items-center justify-center'\n    ].join(' ')\n  },\n  children: [\n    {\n      type: 'div',\n      props: {\n        className: [\n          'text-center max-w-2xl mx-auto',\n          'space-y-4 md:space-y-6 lg:space-y-8'\n        ].join(' ')\n      },\n      children: [\n        // Hero content\n      ]\n    }\n  ]\n};\n```\n\n## Theme Persistence\n\nTheme changes are automatically persisted:\n\n- **localStorage** - Theme preferences saved locally\n- **CSS Variables** - Applied immediately to the document\n- **Component Updates** - All components reflect theme changes instantly\n\n## Best Practices\n\n### Theme Design\n- **Use HSL values** for better color manipulation\n- **Maintain contrast ratios** for accessibility\n- **Test both light and dark modes** thoroughly\n- **Keep semantic naming** (primary, secondary, destructive)\n\n### Component Integration\n- **Use theme variables** instead of hardcoded colors\n- **Follow shadcn/ui patterns** for consistency\n- **Test with different themes** to ensure compatibility\n- **Provide fallbacks** for custom variables\n\n### Performance\n- **CSS variables are fast** - they update instantly\n- **Avoid inline styles** when possible\n- **Use Tailwind classes** for optimal performance\n- **Minimize theme variable count** to reduce complexity\n\n## Integration with Design Systems\n\nThe appearance panel works well with existing design systems:\n\n```tsx\n// Design system integration\nconst designSystemTheme = {\n  colors: {\n    // Map design system colors to CSS variables\n    primary: 'hsl(var(--brand-blue))',\n    secondary: 'hsl(var(--brand-purple))',\n    accent: 'hsl(var(--brand-green))',\n    neutral: 'hsl(var(--neutral-500))'\n  },\n  spacing: {\n    // Use consistent spacing scale\n    xs: '0.25rem',\n    sm: '0.5rem',\n    md: '1rem',\n    lg: '1.5rem',\n    xl: '2rem'\n  }\n};\n```"
      }
    ]
  } as const satisfies ComponentLayer; 