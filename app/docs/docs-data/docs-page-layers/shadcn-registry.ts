import type { ComponentLayer } from "@/components/ui/ui-builder/types";

export const SHADCN_REGISTRY_LAYER = {
    "id": "shadcn-registry",
    "type": "div",
    "name": "Shadcn Registry",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "component-system"
    },
    "children": [
      {
        "type": "span",
        "children": "Shadcn Component Registry",
        "id": "shadcn-registry-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "shadcn-registry-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "UI Builder provides an optional shadcn component registry that includes all 54 official shadcn/ui components pre-configured for the visual editor. This registry is separate from the core UI Builder package, allowing you to choose which components you need."
      },
      {
        "id": "shadcn-registry-content",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Installation\n\nThe shadcn component registry is optional and can be installed separately:\n\n```bash\n# Install the shadcn components registry (optional)\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/shadcn-components-registry.json\n```\n\nThis installs:\n- **54 shadcn/ui components** with curated default children and proper configurations\n- **124 shadcn blocks** as reusable templates\n- All necessary dependencies\n\n## Using the Registry\n\nAfter installation, import and use the components in your registry:\n\n```tsx\nimport { shadcnComponentDefinitions } from '@/lib/ui-builder/registry/shadcn-component-definitions';\nimport { blockDefinitions } from '@/lib/ui-builder/registry/block-definitions';\nimport { primitiveComponentDefinitions } from '@/lib/ui-builder/registry/primitive-component-definitions';\n\nconst myComponentRegistry: ComponentRegistry = {\n  ...primitiveComponentDefinitions,\n  ...shadcnComponentDefinitions,  // All 54 shadcn components\n  // Your custom components...\n};\n\n<UIBuilder \n  componentRegistry={myComponentRegistry}\n  blocks={blockDefinitions}  // Optional: Enable blocks tab\n/>\n```\n\n## Included Components\n\nThe shadcn registry includes these component categories:\n\n### Layout & Structure\n- **Card** (with CardHeader, CardTitle, CardDescription, CardContent, CardFooter)\n- **Accordion** (with AccordionItem, AccordionTrigger, AccordionContent)\n- **Tabs** (with TabsList, TabsTrigger, TabsContent)\n- **Resizable** (with ResizablePanel, ResizableHandle)\n- **Sidebar** (with SidebarHeader, SidebarContent, SidebarFooter, etc.)\n\n### Form Elements\n- **Input**, **Textarea**, **Label**\n- **Checkbox**, **Switch**, **RadioGroup** (with RadioGroupItem)\n- **Select** (with SelectTrigger, SelectContent, SelectItem, etc.)\n- **Calendar**, **DatePicker**\n\n### Feedback & Overlays\n- **Dialog** (with DialogTrigger, DialogContent, DialogHeader, etc.)\n- **Sheet** (with SheetTrigger, SheetContent, SheetHeader, etc.)\n- **Popover**, **Tooltip**\n- **Alert**, **AlertDialog**\n\n### Navigation\n- **Breadcrumb** (with BreadcrumbList, BreadcrumbItem, BreadcrumbLink, etc.)\n- **DropdownMenu** (with DropdownMenuTrigger, DropdownMenuContent, etc.)\n- **Command** (with CommandInput, CommandList, CommandItem, etc.)\n\n### Display\n- **Button**, **Badge**\n- **Avatar** (with AvatarImage, AvatarFallback)\n- **Table** (with TableHeader, TableBody, TableRow, TableCell, etc.)\n- **Toggle**, **ToggleGroup**\n- **Skeleton**, **Separator**\n\n## Compound Components\n\nMany shadcn components are \"compound components\" with multiple parts. The registry includes all parts with sensible default children:\n\n```tsx\n// When you add an Accordion, it comes pre-configured with:\nAccordion: {\n  component: Accordion,\n  schema: z.object({...}),\n  defaultChildren: [\n    {\n      type: 'AccordionItem',\n      children: [\n        { type: 'AccordionTrigger', children: 'Item Title' },\n        { type: 'AccordionContent', children: 'Item content...' }\n      ]\n    }\n  ]\n}\n```\n\nThis means when you add an Accordion in the editor, it comes ready to use with proper structure.\n\n## Blocks\n\nBlocks are pre-built UI templates that can be inserted as complete component trees. They appear in a \"Blocks\" tab in the add component popover.\n\n### Block Categories\n\n- **Login** - Authentication forms (login-01, login-02, etc.)\n- **Sidebar** - Navigation sidebars (sidebar-01, sidebar-02, etc.)\n- **Dashboard** - Dashboard layouts (dashboard-01, dashboard-02, etc.)\n- **Calendar** - Calendar views (calendar-01, calendar-02, etc.)\n- **Charts** - Various chart layouts (chart-area-default, chart-bar-default, etc.)\n\n### Using Blocks\n\nPass the block definitions to UIBuilder:\n\n```tsx\nimport { blockDefinitions } from '@/lib/ui-builder/registry/block-definitions';\n\n<UIBuilder \n  componentRegistry={myComponentRegistry}\n  blocks={blockDefinitions}\n/>\n```\n\nWhen users click \"Add Component\", they'll see a \"Blocks\" tab with categorized block templates.\n\n### Block Structure\n\nEach block is a `ComponentLayer` template:\n\n```tsx\nimport { BlockDefinition } from '@/lib/ui-builder/registry/block-definitions';\n\nconst myBlock: BlockDefinition = {\n  name: 'my-custom-block',\n  category: 'custom',\n  description: 'A custom block template',\n  template: {\n    id: 'root',\n    type: 'div',\n    name: 'My Block',\n    props: { className: 'p-4' },\n    children: [\n      // ... nested components\n    ]\n  },\n  requiredComponents: ['div', 'Button', 'Card']\n};\n```\n\n### Block Utilities\n\n```tsx\nimport { \n  getBlocksByCategory, \n  getBlockCategories, \n  getAllBlocks \n} from '@/lib/ui-builder/registry/block-definitions';\n\n// Get all block categories\nconst categories = getBlockCategories(); // ['login', 'sidebar', 'dashboard', ...]\n\n// Get blocks in a category\nconst loginBlocks = getBlocksByCategory('login');\n\n// Get all blocks as an array\nconst allBlocks = getAllBlocks();\n```\n\n## Keeping Up to Date\n\nThe sync script helps check for new shadcn components:\n\n```bash\nnpm run sync-shadcn\n```\n\nThis compares your local definitions with the latest shadcn registry and reports any missing components or blocks.\n\n## Separate vs Combined Registries\n\nUI Builder provides two registries:\n\n| Registry | Contents | Use Case |\n|----------|----------|----------|\n| `block-registry.json` | Core UI Builder + primitives + essential components | Minimal setup, bring your own components |\n| `shadcn-components-registry.json` | All 54 shadcn components + 124 blocks | Full shadcn/ui experience |\n\n**Minimal Setup** (just core UI Builder):\n```bash\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n```\n\n**Full Setup** (core + all shadcn components):\n```bash\n# Install core first\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json\n\n# Then add shadcn components\nnpx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/shadcn-components-registry.json\n```"
      },
      {
        "id": "shadcn-next-steps",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Next Steps\n\nNow that you understand the shadcn registry:\n\n- **Custom Components** - Learn how to add your own components alongside shadcn\n- **Blocks** - Create your own block templates\n- **Variables** - Bind dynamic data to shadcn components"
      }
    ]
  } as const satisfies ComponentLayer;
