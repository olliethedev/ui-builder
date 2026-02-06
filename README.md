# UI Builder — Visual Editor for Your React App

**UI Builder is a shadcn/ui package that adds a Figma-style editor to your own product, letting non-developers compose pages, emails, dashboards, and white-label views with the exact React components you already ship.**

Layouts are saved as plain JSON for easy versioning and can be rendered instantly with dynamic data.

![UI Builder Demo](./public/demo.gif)

**[View Full Documentation](https://uibuilder.app/)**

---

> **UI Builder is now part of [BTST](https://better-stack.ai/)** — ship full-stack features faster with production-ready plugins that generate database schemas, API routes, and pages for Next.js, TanStack Start, and React Router.

---

## Installation

### Quick Start with shadcn/ui

If you already have a shadcn/ui project:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json
```

Or start a new Next.js project with UI Builder:

```bash
npx shadcn@latest init https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json --base-color zinc
```

### Optional: Add All Shadcn Components

Install the full shadcn component library with 54 pre-configured components and 124 block templates:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/shadcn-components-registry.json
```

### Handling Peer Dependencies

If you encounter peer dependency warnings (common with React 19), create a `.npmrc` file:

```bash
echo "legacy-peer-deps=true" > .npmrc
```

**Note:** Use [style variables](https://ui.shadcn.com/docs/theming) for proper page theming.

## Basic Usage

```tsx
import z from "zod";
import UIBuilder from "@/components/ui/ui-builder";
import { Button } from "@/components/ui/button";
import { ComponentRegistry } from "@/components/ui/ui-builder/types";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";

const myComponentRegistry: ComponentRegistry = {
  ...primitiveComponentDefinitions,
  Button: {
    component: Button,
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
      variant: z.enum(["default", "destructive", "outline", "secondary", "ghost", "link"]).default("default"),
    }),
    from: "@/components/ui/button",
  },
};

export function App() {
  return <UIBuilder componentRegistry={myComponentRegistry} />;
}
```

## Documentation

For comprehensive documentation, visit **[uibuilder.app](https://uibuilder.app/)**:

- **[Quick Start](https://uibuilder.app/docs/quick-start)** — Get up and running
- **[Component Registry](https://uibuilder.app/docs/component-registry)** — Configure components
- **[Shadcn Registry](https://uibuilder.app/docs/shadcn-registry)** — Use pre-built shadcn components and blocks
- **[Custom Components](https://uibuilder.app/docs/custom-components)** — Add your own components
- **[Variables](https://uibuilder.app/docs/variables)** — Dynamic data binding
- **[Rendering Pages](https://uibuilder.app/docs/rendering-pages)** — Render saved layouts

## Development

```bash
# Build component registries
npm run build-all-registries

# Run tests
npm run test

# Sync with latest shadcn components
npm run sync-shadcn
```

## Breaking Changes

### v2.0.0
- Internal structure changes. Delete old `/ui-builder` and `/lib/ui-builder` directories before updating.

### v1.0.0
- Removed `_page_` layer type. Use any component type as root.
- `componentRegistry` is now a prop, not a standalone file.

See the [full changelog](https://uibuilder.app/) for details.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Star History

<a href="https://www.star-history.com/#olliethedev/ui-builder&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=olliethedev/ui-builder&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=olliethedev/ui-builder&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=olliethedev/ui-builder&type=date&legend=top-left" />
 </picture>
</a>
