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
import { ComponentRegistry } from "@/lib/ui-builder/store/editor-store";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions"; // Example registry
import { ThemePanel } from "@/components/ui/ui-builder/internal/theme-panel"; // Example page props form

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

```tsx
import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { ComponentLayer } from "@/lib/ui-builder/store/layer-store";
import { ComponentRegistry } from "@/lib/ui-builder/store/editor-store";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions"; // Example registry
import { ThemePanel } from "@/components/ui/ui-builder/internal/theme-panel"; // Example page props form

// Combine or define your component registry
const myComponentRegistry: ComponentRegistry = {
  ...primitiveComponentDefinitions,
  // ...add your custom components here
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
import { ComponentLayer } from "@/lib/ui-builder/store/layer-store";
import { ComponentRegistry } from "@/lib/ui-builder/store/editor-store";
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

You add custom components by defining them in a `ComponentRegistry` object and passing that object to the `UIBuilder` component via the `componentRegistry` prop.

Here is an example of how to define a custom component within the registry object:

```tsx
import { z } from 'zod';
import { FancyComponent } from '@/components/ui/fancy-component';
import { classNameFieldOverrides, childrenFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions"; // Example primitive components

// Define your custom component
const fancyComponentDefinition = {
    component: FancyComponent,
    schema: z.object({
        className: z.string().optional(),
        children: z.any().optional(),
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
    from: "@/components/ui/fancy-component", // Correct import path
    fieldOverrides: {
        className:(layer)=> classNameFieldOverrides(layer),
        children: (layer)=> childrenFieldOverrides(layer)
    }
};

// Create the full registry, potentially combining with existing definitions
export const myComponentRegistry: ComponentRegistry = {
    ...primitiveComponentDefinitions, // Include base components if needed
    FancyComponent: fancyComponentDefinition, // Add your custom component
    // ... add other custom components
};

// Then pass `myComponentRegistry` to the UIBuilder prop:
// <UIBuilder componentRegistry={myComponentRegistry} ... />
```

- `component`: The React component itself.
- `from`: The source path of the component. Used when exporting the page as code.
- `fieldOverrides`: Customizes auto-form fields for the component's properties.

- `schema`: A Zod schema defining the properties and validation rules for the component props. We use zod to define the component schema which represents the props that the component accepts. The required props **MUST** have a default value, this allows the UI Builder to render the component with the default value when the user adds the component to the page. This project leverages [Auto-Form](https://github.com/vantezzen/autoform/tree/pure-shadcn) to dynamically render component property forms based on the component definitions zod schema. Currently only these zod types are supported:
    - boolean
    - date
    - number
    - string
    - enum of supported zod types
    - object with properties of the supported zod types
    - array of objects with properties of the supported zod types


---
For more detailed documentation read the [docs](https://uibuilder.app/)
---


## Changelog

### v1.0.0
- Removed _page_ layer type in favor of using any component as a page. This allows for more fexibility, like react-email components. You should migrate any layers stored in the database to use the new components. You can use the [migrateV2ToV3](lib/ui-builder/store/layer-utils.ts) function in layer-utils.ts to help with the migration.
- Component registry is now a prop of the UIBuilder component instead of a standalone file.
- Removed script to generate component definitions from the registry. As these were problematic to maintain and were not functioning correctly for complex components.


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
- [ ] Add Blocks. Reusable component blocks that can be used in multiple pages
- [ ] Add data sources to component layers (ex, getUser() binds prop user.name)
- [ ] Add event handlers to component layers (onClick, onSubmit, etc)
- [ ] React native support
- [ ] Update to React 19
- [ ] Update to latest Shadcn/ui + Tailwind v4


## License

MIT
