# AGENTS.md

Agent-focused instructions for working on the UI Builder project.

## Project Overview

UI Builder is a shadcn/ui component that provides a Figma-style visual editor for React applications. It allows non-developers to compose pages using existing React components, with layouts saved as JSON.

**Core folders** (the UI Builder package):
- `components/ui/ui-builder/` - UI components for the editor
- `lib/ui-builder/` - Store, utilities, and registry definitions
- `__tests__/` - Test files
- `app/docs/` - Documentation site (must be updated if component APIs change)

**Do not modify** other `components/ui/` files — they are standard shadcn components. If you need to add a new component or update existing run `npx shadcn@latest add ...` to add the component to the shadcn registry.

## Setup Commands

```bash
# Install dependencies
npm install

# Start dev server (usually already running on port 3000)
npm run dev

# Run tests with coverage
npm run test -- --coverage

# Lint check
npx eslint components/ui/ui-builder/ lib/ --max-warnings 0

# Type check
npx tsc --noEmit

# Build the shadcn registry
npm run build-registry
```

## Validation Workflow

After making changes, always run these checks in order:

1. `npx eslint components/ui/ui-builder/ lib/ --max-warnings 0`
2. `npx tsc --noEmit`
3. `npm run test`
4. `npm run build-registry`

**Important**: If you've changed component APIs (props, types, or public interfaces), update the documentation in `app/docs/docs-data/docs-page-layers/` to reflect the changes.

The CI pipeline (`.github/workflows/pull-request-tests.yml`) enforces 90% test coverage.

## Key Architecture

### Component Registry System

Components are defined in `ComponentRegistry` objects with:
- `component` - The React component
- `schema` - Zod schema for props (enables auto-form generation)
- `from` - Import path for code generation
- `fieldOverrides` - Custom form field behavior

```typescript
const myRegistry: ComponentRegistry = {
  Button: {
    component: Button,
    schema: z.object({
      className: z.string().optional(),
      variant: z.enum(["default", "destructive"]).default("default"),
    }),
    from: "@/components/ui/button",
    fieldOverrides: commonFieldOverrides()
  }
};
```

### Layer-Based Architecture

UI is a tree of `ComponentLayer` objects:
```typescript
interface ComponentLayer {
  id: string;
  type: string;      // Registry key
  name: string;      // Display name
  props: Record<string, any>;
  children?: ComponentLayer[] | string;
}
```

### State Management

- **Zustand** for global state (`layer-store.ts`, `editor-store.ts`)
- **Zod** for schema validation (v4 - see below)
- **react-hook-form** with `@hookform/resolvers` for forms

## Zod v4 Usage (CRITICAL)

This project uses **Zod v4**. Key differences from v3:

### Internal API Access
```typescript
// ❌ Zod v3 (old)
schema._def.typeName
schema._def.defaultValue()

// ✅ Zod v4 (current)
schema._zod.def.type        // e.g., "string", "object", "default"
schema._zod.def.defaultValue // Value directly, not a function
```

### Type Checking
```typescript
// ❌ Zod v3 - instanceof checks
if (schema instanceof ZodOptional) { ... }

// ✅ Zod v4 - use def.type
const defType = (schema as any)._zod?.def?.type;
if (defType === "optional") { ... }
```

### Type Names
Zod v4 uses lowercase type names: `"string"`, `"number"`, `"object"`, `"enum"`, `"optional"`, `"default"`, `"nullable"`.

See `lib/ui-builder/store/schema-utils.ts` for helper functions.

## Auto-Form Component

Located at `components/ui/auto-form/`. Key files:
- `index.tsx` - Main AutoForm component
- `helpers.tsx` - Zod schema utilities (formerly `utils.tsx`)
- `types.ts` - TypeScript types
- `fields/` - Field components (input, checkbox, date, enum, etc.)
- `shared-form-types.ts` - Shared type definitions

### Auto-Form API
```typescript
<AutoForm
  formSchema={zodSchema}
  values={currentValues}
  onValuesChange={(values) => handleChange(values)}
  onParsedValuesChange={(validValues) => handleValidChange(validValues)}
  fieldConfig={customFieldConfig}
/>
```

## File Structure Conventions

- Test files: `__tests__/{componentName}.test.tsx`
- Lowercase with dashes for directories: `components/ui-builder`
- Structure: static content → types → exported components → subcomponents → helpers

## Testing Guidelines

- Use Jest + `@testing-library/react`
- Mock complex UI components (dropdown-menu, react-markdown)
- Test component registry definitions, layer manipulation, variable binding
- Aim for 90% coverage

```typescript
// Mock example
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  // ...
}));
```

## Common Patterns

### Field Overrides
```typescript
import { 
  commonFieldOverrides, 
  classNameFieldOverrides, 
  childrenFieldOverrides 
} from "@/lib/ui-builder/registry/form-field-overrides";
```

### Variable Resolution
```typescript
import { resolveVariableReferences } from "@/lib/ui-builder/utils/variable-resolver";
const resolvedProps = resolveVariableReferences(layer.props, variables);
```

### Schema Patching
```typescript
import { patchSchema, addDefaultValues } from "@/lib/ui-builder/store/schema-utils";
const formSchema = addDefaultValues(patchSchema(schema), currentValues);
```

## Registry Build

The project is distributed as a shadcn registry. The build script at `scripts/build.ts`:
- Collects files from `components/ui/ui-builder/`, `lib/ui-builder/`, `hooks/`
- Outputs to `registry/block-registry.json`
- References external dependencies like auto-form from: `https://raw.githubusercontent.com/better-stack-ai/form-builder/refs/heads/main/registry/auto-form.json`

## Gotchas

1. **Don't run `npm run dev`** - The dev server is typically already running on port 3000

2. **Zod v4 breaking changes** - Always use `._zod.def` not `._def`

3. **Auto-form imports** - Use `@/components/ui/auto-form/helpers` (not `utils`)

4. **Registry dependencies** - Handled by shadcn CLI, avoid manual npm installs for registry components

5. **Type comparisons** - Use string literals like `"ZodDate"`, `"ZodEnum"` instead of `z.ZodFirstPartyTypeKind.*`

6. **Nullable vs Optional** - In Zod v4, nullable means "can be null" not "is optional with default"

## Documentation

The documentation site is located at `app/docs/`. Documentation content is stored in `app/docs/docs-data/docs-page-layers/` as TypeScript files.

**When to update docs:**
- Component API changes (props, types, interfaces)
- New features or capabilities
- Breaking changes or deprecations
- Updated examples or usage patterns

The docs are rendered at https://uibuilder.app/ and should stay in sync with the codebase.

## External Documentation

- For outdated library knowledge, use Context7 tool or search the web.
- Zod v4 migration guide: https://zod.dev/v4/changelog
- Shadcn UI: https://ui.shadcn.com/
- Project docs: https://uibuilder.app/

