# 🧩 Open-source Visual UI Builder — Build apps like Figma, Framer, and Webflow

UI Builder is a React component that lets you create and edit user interfaces through a fast, flexible no-code editor — powered by your own components or primitives.

- Visual no-code editor
- Extensible with your components
- Customizable user interface
- Integrates with existing projects
- Export pages as React code
- Live preview of changes
- Tailwind CSS support

Perfect for building landing pages, email templates, forms, admin dashboards, or giving your users no-code superpowers inside your product — without locking into closed platforms like Figma, Framer, Webflow, or Builder.io.

🛠 Extend it. 🎨 Style it. 🚀 Own it.


See the [demo](https://uibuilder.app/demo) to get an idea of how it works.
Read the [docs](https://uibuilder.app/) to get started.

![UI Builder Demo](./public/demo.png)


## Installation

If you are using shadcn/ui in your project, you can install the component directly from the registry. 

```bash
npx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json
```

Or you can start a new project with the UI Builder:

```bash
npx shadcn@latest init https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json
```

Note: You need to use [style variables](https://ui.shadcn.com/docs/theming) to have page theming working correctly.

If you are not using shadcn/ui, you can install the component simply by copying the files in this repo into your project.

### Fixing Dependencies after shadcn `init` or `add`

Add dev dependencies, since there currently seems to be an issue with shadcn/ui not installing them from the registry:

```bash
npm install -D @types/lodash.template @tailwindcss/typography @types/react-syntax-highlighter react-docgen-typescript tailwindcss-animate ts-morph ts-to-zod
```

And that's it! You have a UI Builder that you can use to build your UI.

## Usage

### Basic Example

To use the UI Builder, you need to provide a component registry and a form component for editing page-level properties.

```tsx
import UIBuilder from "@/components/ui/ui-builder";
import { ComponentRegistry } from "@/components/ui/ui-builder/types";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions"; // Basic html primitives registry
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions"; // Basic shadcn/ui components registry
import { ThemePanel } from "@/components/ui/ui-builder/internal/theme-panel"; // Tailwind+shadcn theme settings form for the page root component

// Combine or define your component registry
const myComponentRegistry: ComponentRegistry = {
  ...primitiveComponentDefinitions,
  // ...add your custom components here
};

export function App() {
  return (
    <UIBuilder
      componentRegistry={myComponentRegistry}
      pagePropsForm={<ThemePanel />}
    />
  );
}
```

By default the state of the UI is stored in the browser's local storage, so it will persist across sessions.

### Example with initial state and onChange callback

You can initialize the UI with initial layers from a database and use the onChange callback to persist the state to a database.

```tsx
import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { ComponentLayer, ComponentRegistry } from "@/components/ui/ui-builder/types";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { ThemePanel } from "@/components/ui/ui-builder/internal/theme-panel";

const myComponentRegistry: ComponentRegistry = {
  ...primitiveComponentDefinitions,
  ...complexComponentDefinitions
};


// Static initial layers or you can fetch from database
const initialLayers: ComponentLayer[] = [
  {
    id: "page1",
    type: "div", // Any component type can be a page root
    name: "Page 1",
    props: {
      className: "p-4 flex flex-col gap-2",
      // You might include theme/styling props here if your pagePropsForm handles them
    },
    children: [
      {
        id: "qCTIIed",
        type: "Button", // Ensure Button is in your componentRegistry
        name: "Button",
        props: {
            variant: "default",
            size: "default",
            className: "w-full items-center gap-2 max-w-sm",
        },
        children: [
            {
                id: "UzZY6Dp",
                type: "span", // Ensure span is in your componentRegistry
                name: "span",
                props: {},
                children: "Hello World",
            },
            {
                id: "hn3PF6A",
                type: "Icon", // Ensure Icon is in your componentRegistry
                name: "Icon",
                props: {
                    size: "medium",
                    color: "secondary",
                    rotate: "none",
                    iconName: "Github",
                    className: "",
                },
                children: [],
            },
        ],
        },
    ],
  },
];

const App = () => {
  const handleLayersChange = (updatedLayers: ComponentLayer[]) => {
    // Here you can send the updated layers to the backend
    console.log("Layers updated:", updatedLayers);
  };

  return (
    <div>
      <UIBuilder
        initialLayers={initialLayers}
        onChange={handleLayersChange}
        componentRegistry={myComponentRegistry}
        pagePropsForm={<ThemePanel />}
      />
    </div>
  );
};

export default App;

```

- `componentRegistry`: **Required**. An object mapping component type names to their definitions (component, schema, import path, etc.).
- `pagePropsForm`: **Required**. A React component used as the form to edit properties of the root page layer.
- `initialLayers`: Optional prop to set up initial pages and layers. Useful for setting the initial state of the builder, from a database for example.
- `onChange`: Optional callback triggered when the editor state changes, providing the updated pages. Can be used to persist the state to a database.
- `useCanvas`: Optional prop to disable the interactive canvas. Defaults to true.


You can also render the page layer without editor functionality by using the LayerRenderer component:

```tsx
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { ComponentLayer } from "@/components/ui/ui-builder/types";
import { ComponentRegistry } from "@/components/ui/ui-builder/types";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions"; // Example registry

// Component registry is needed for the renderer too
const myComponentRegistry: ComponentRegistry = {
  ...primitiveComponentDefinitions,
  // ...add your custom components here
};

const page: ComponentLayer = {...} // Fetch or define your page layer

export function MyPage() {
  return <LayerRenderer page={page} componentRegistry={myComponentRegistry} />;
}
```

`LayerRenderer` is useful when you want to render the finished page without any editor functionality. It also requires the `componentRegistry` to know how to render the components.

## Add your custom components to the registry

You add custom components by defining them in a `ComponentRegistry` object and passing that object to the `UIBuilder` component via the `componentRegistry` prop. The registry maps a unique component type name (string) to its definition.

Here is an example of how to define a custom component within the registry object:

```tsx
import { z } from 'zod';
import { FancyComponent } from '@/components/ui/fancy-component';
import { classNameFieldOverrides, childrenFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions"; // Example primitive components
import { ComponentRegistry } from "@/components/ui/ui-builder/types"; // Correct type import

// Define your custom component's schema and configuration
const fancyComponentDefinition = {
    // The React component itself
    component: FancyComponent,
    // The Zod schema defining the component's props
    schema: z.object({
        className: z.string().optional(),
        children: z.any().optional(), // Use z.any() or a more specific schema for children if needed
        title: z.string().default("Default Title"),
        count: z.coerce.number().default(1),
        disabled: z.boolean().optional(),
        timestamp: z.coerce.date().optional(),
        mode: z
            .enum([
                "fancy",
                "boring"
            ])
            .default("fancy"),
    }),
    // The import path for code generation
    from: "@/components/ui/fancy-component",
    // Customizations for the auto-generated properties form
    fieldOverrides: {
        className: (layer) => classNameFieldOverrides(layer), // Standard handling for className
        children: (layer) => childrenFieldOverrides(layer), // Standard handling for children
        // You can add overrides for other fields here, e.g.:
        // count: { label: "Number of items" }, // Change the label
        // disabled: { // Conditionally hide the field
        //   fieldType: "switch", // Specify field type
        //   isHidden: (layer) => layer.props.mode === "boring",
        // },
    }
};

// Create the full registry, potentially combining with existing definitions
export const myComponentRegistry: ComponentRegistry = {
    ...primitiveComponentDefinitions, // Include base components if needed
    FancyComponent: fancyComponentDefinition, // Add your custom component under a unique name
    // ... add other custom components
};

// Then pass `myComponentRegistry` to the UIBuilder prop:
// <UIBuilder componentRegistry={myComponentRegistry} pagePropsForm={...} />
```

**Component Definition Fields:**

-   `component`: **Required**. The React component function or class.
-   `schema`: **Required**. A Zod schema defining the component's props, their types, and validation rules.
    -   This schema powers the automatic generation of a properties form in the editor using [Auto-Form](https://github.com/vantezzen/autoform/tree/pure-shadcn).
    -   Props intended to be configurable in the UI Builder **MUST** have a default value specified in the schema (using `.default(...)`). This allows the UI Builder to render the component correctly when it's first added, before the user configures it.
    -   Currently supported Zod types for auto-form generation include: `boolean`, `date`, `number`, `string`, `enum` (of supported types), `object` (with supported property types), and `array` (of objects with supported property types).
-   `from`: **Required**. The source import path for the component. This is used when exporting the page structure as React code.
-   `fieldOverrides`: Optional. An object to customize the auto-generated form fields for the component's properties in the editor's sidebar.
    -   The keys of this object correspond to the prop names defined in the Zod schema.
    -   The values are typically functions that receive the current `layer` object and return configuration options for the `AutoForm` field. These options can control the field's label, input type (`fieldType`), visibility (`isHidden`), placeholder text, render logic, and more. See the AutoForm documentation for available options.
    -   This is useful for:
        *   Providing more descriptive labels or help text.
        *   Using specific input components (e.g., a color picker, a custom slider).
        *   Hiding props that shouldn't be user-editable (like internal state).
        *   Implementing conditional logic (e.g., showing/hiding a field based on another prop's value).
    -   The example uses `classNameFieldOverrides` and `childrenFieldOverrides` from `@/lib/ui-builder/registry/form-field-overrides` to provide standardized handling for common props like `className` (using a textarea) and `children` (often hidden or handled specially). You can create your own override functions or objects.


---
For more detailed documentation read the [docs](https://uibuilder.app/)
---


## Changelog

### v1.0.0
- Removed _page_ layer type in favor of using any component type (like `div`, `main`, or custom containers) as the root page layer. This enhances flexibility, enabling use cases like building react-email templates directly. You should migrate any layers stored in the database to use a standard component type as the root. The [migrateV2ToV3](lib/ui-builder/store/layer-utils.ts) function in `layer-utils.ts` can assist with this migration.
- The `componentRegistry` is now passed as a prop to the `UIBuilder` component instead of being defined in a standalone file.
- Removed the script used to generate component schema definitions. This approach proved problematic to maintain and didn't function correctly for complex components or varying project setups. Component schema definitions should now be manually created or generated using project-specific tooling if desired.
- `pagePropsForm` prop added to `UIBuilder` to allow customization of the form used for editing page-level (root layer) properties.
- Made `layer-store` local storage persistence optional and configurable via props.


### v0.0.2
- Removed _text_ layer type in favor of using span and Markdown components. You should migrate any layers stored in the database to use the new components. You can use the [migrateV1ToV2](lib/ui-builder/store/layer-utils.ts) function in layer-utils.ts to help with the migration.

## Development

Build component registry after updating lib or ui:

```bash
npm run build-registry
```

Host the registry locally:

```bash
npm run host-registry
```

Use the local registry in a local project:

```bash
npx shadcn@latest add http://127.0.0.1:8080/block-registry.json -o
```

## Running Tests

```bash
npm run test
```

## Roadmap

- [ ] Add user friendly styling component instead of directly using tailwind classes
- [ ] Add tiptap editor for markdown content
- [ ] Add global variables for component props
- [ ] Add Blocks. Reusable component blocks that can be used in multiple pages
- [ ] Move component schemas to separate shadcn registry to keep main registry light
- [ ] Move prop form field components (overrides) to separate shadcn registry to keep main registry light
- [ ] Add data sources to component layers (ex, getUser() binds prop user.name)
- [ ] Add event handlers to component layers (onClick, onSubmit, etc)
- [ ] React native support
- [ ] Update to React 19
- [ ] Update to latest Shadcn/ui + Tailwind CSS v4
- [ ] Update to new AutoForm when stable
- [ ] Update to Zod v4 (when stable) for native json schema conversion to enforce safety in layer props

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT
