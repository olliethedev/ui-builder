import { ComponentLayer } from "@/components/ui/ui-builder/types";

export const PAGE_THEMING_LAYER = {
    "id": "page-theming",
    "type": "div",
    "name": "Page Theming",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "rendering"
    },
    "children": [
      {
        "type": "span",
        "children": "Page Theming",
        "id": "page-theming-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "page-theming-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "Apply consistent theming across UI Builder pages. Configure colors, typography, spacing, and design tokens for cohesive visual experiences."
      },
      {
        "id": "page-theming-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Theme Configuration\n\n```tsx\nconst theme = {\n  colors: {\n    primary: '#3B82F6',\n    secondary: '#64748B',\n    background: '#FFFFFF',\n    text: '#1F2937'\n  },\n  typography: {\n    fontFamily: 'Inter, sans-serif',\n    sizes: {\n      xs: '0.75rem',\n      sm: '0.875rem',\n      base: '1rem',\n      lg: '1.125rem'\n    }\n  },\n  spacing: {\n    xs: '0.25rem',\n    sm: '0.5rem',\n    md: '1rem',\n    lg: '1.5rem'\n  }\n};\n\n<UIBuilder theme={theme} />\n```\n\n## CSS Variables\n\n```css\n:root {\n  --color-primary: 59 130 246;\n  --color-secondary: 100 116 139;\n  --color-background: 255 255 255;\n  --color-text: 31 41 55;\n  \n  --font-family: 'Inter', sans-serif;\n  --font-size-base: 1rem;\n  \n  --spacing-unit: 0.25rem;\n}\n```\n\n## Dark Mode Support\n\n```tsx\nconst darkTheme = {\n  colors: {\n    primary: '#60A5FA',\n    background: '#1F2937',\n    text: '#F9FAFB'\n  }\n};\n\nfunction ThemedUIBuilder() {\n  const [isDark, setIsDark] = useState(false);\n  \n  return (\n    <UIBuilder\n      theme={isDark ? darkTheme : lightTheme}\n      className={isDark ? 'dark' : 'light'}\n    />\n  );\n}\n```\n\n## Dynamic Theming\n\n```tsx\nfunction DynamicTheming() {\n  const [theme, setTheme] = useState(defaultTheme);\n  \n  const updateThemeColor = (property, value) => {\n    setTheme(prev => ({\n      ...prev,\n      colors: {\n        ...prev.colors,\n        [property]: value\n      }\n    }));\n  };\n  \n  return (\n    <div>\n      <ThemeControls onColorChange={updateThemeColor} />\n      <UIBuilder theme={theme} />\n    </div>\n  );\n}\n```"
      }
    ]
  } as const satisfies ComponentLayer; 