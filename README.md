# 🧩 UI Builder — Drop‑in Visual Editor for Your React App

**UI Builder solves the fundamental problem of UI creation tools: they ignore your existing React component library and force you to rebuild from scratch.**

UI Builder is a shadcn/ui package that adds a Figma‑style editor to your own product, letting non‑developers compose pages, emails, dashboards, and white‑label views with the exact React components you already ship. 

Layouts are saved as plain JSON for easy versioning and can be rendered instantly allowing:

- your marketing team to update a landing page without waiting on engineering.
- a customer to tweak a branded portal.
- a product manager to modify email templates.
- add a visual "head" to your headless CMS, connecting your content API with your component library.


How it unlocks novel product features:

- Give users no‑code superpowers — add a full visual builder to your SaaS with one install.
- Design with components you already ship — nothing new to build or maintain.
- Store layouts as human‑readable JSON — render inside your product to ship changes immediately.

See the [docs site](https://uibuilder.app/) for more information.

![UI Builder Demo](./public/demo.png)

---

# Quick Start

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

To use the UI Builder, you just need to provide a component registry.

```tsx
import UIBuilder from "@/components/ui/ui-builder";
import { ComponentRegistry } from "@/components/ui/ui-builder/types";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions"; // Basic html primitives registry
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions"; // Sample shadcn/ui components registry

// Define your component registry
const myComponentRegistry: ComponentRegistry = {
  ...primitiveComponentDefinitions,
  ...complexComponentDefinitions,
};

export function App() {
  return (
    <UIBuilder
      componentRegistry={myComponentRegistry}
    />
  );
}
```

### Example with initial state and onChange callback

You can initialize the UI with initial layers from a database and use the onChange callback to persist the state to a database.

```tsx
import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { ComponentLayer, ComponentRegistry } from "@/components/ui/ui-builder/types";

const myComponentRegistry: ComponentRegistry = {...}; // Your component registry

// Static initial layers or you can fetch from database
const initialLayers: ComponentLayer[] = [
  {
    id: "page1",
    type: "div", // Ensure div is in your componentRegistry
    name: "Page 1",
    props: {
      className: "p-4 flex flex-col gap-2",
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
      />
    </div>
  );
};

export default App;

```

### UIBuilder Props
- `componentRegistry`: **Required**. An object mapping component type names to their definitions (component, schema, import path, etc.).
- `initialLayers`: Optional prop to set up initial pages and layers. Useful for setting the initial state of the builder, from a database for example.
- `onChange`: Optional callback triggered when the editor state changes, providing the updated pages. Can be used to persist the state to a database.
- `panelConfig`: Optional. An object to customize the different panels of the UI Builder (e.g., nav bar, editor panel, props panel). If not provided, a default configuration is used. This allows for fine-grained control over the editor's appearance and layout.
- `persistLayerStore`: Optional boolean (defaults to `true`). Determines whether the editor's state (layers and their configurations) is persisted in the browser's local storage across sessions. Set to `false` to disable local storage persistence, useful if you are managing state entirely through `initialLayers` and `onChange`.


## Rendering from Serialized Layer Data

You can also render the page layer without editor functionality by using the LayerRenderer component:

```tsx
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { ComponentLayer } from "@/components/ui/ui-builder/types";
import { ComponentRegistry } from "@/components/ui/ui-builder/types";

const myComponentRegistry: ComponentRegistry = {...}; // Your component registry

const page: ComponentLayer = {...} // Fetch or define your page layer

export function MyPage() {
  return <LayerRenderer page={page} componentRegistry={myComponentRegistry} />;
}
```

## Add your custom components to the registry

You add custom components by defining them in a `ComponentRegistry` object and passing that object to the `UIBuilder` component via the `componentRegistry` prop. The registry maps a unique component type name (string) to its definition.

Here is an example of how to define a custom component within the registry object:

```tsx
import { z } from 'zod';
import { FancyComponent } from '@/components/ui/fancy-component'; // Example custom component with className, children, title, count, disabled, timestamp, mode props
import { classNameFieldOverrides, childrenFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";
import { ComponentRegistry } from "@/components/ui/ui-builder/types";

// Define your custom component's schema and configuration
const fancyComponentDefinition = {
    // The React component itself
    component: FancyComponent,
    // The Zod schema defining the component's props. This will be used to generate the properties form in the editor
    schema: z.object({
        className: z.string().optional(),
        children: z.any().optional(), // Use z.any() for children prop and provide custom handling in fieldOverrides
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
    // Customizations for the properties auto-form
    fieldOverrides: {
        className: (layer) => classNameFieldOverrides(layer), // Handle className selection with a custom component that is not a default auto-form component
        children: (layer) => childrenFieldOverrides(layer), // Handle children selection with a custom component that is not a default auto-form component
        // You can add your own component overrides for other fields here
    }
};

// Create the full registry, potentially combining with other component definitions
export const myComponentRegistry: ComponentRegistry = {
    FancyComponent: fancyComponentDefinition,
};

// Then pass `myComponentRegistry` to the UIBuilder prop:
// <UIBuilder componentRegistry={myComponentRegistry} />
```

**Component Definition Fields:**

-   `component`: **Required**. The React component function or class.
-   `schema`: **Required**. A Zod schema defining the component's props, their types, and validation rules.
    -   This schema powers the automatic generation of a properties form in the editor using [Auto-Form](https://github.com/vantezzen/autoform/tree/pure-shadcn).
    -   Currently supported Zod types for auto-form generation include: `boolean`, `date`, `number`, `string`, `enum` (of supported types), `object` (with supported property types), and `array` (of objects with supported property types).
-   `from`: **Required**. The source import path for the component. This is used when generating React code.
-   `isFromDefaultExport`: Optional. If true, indicates the component should be imported as a default export when generating React code.
-   `fieldOverrides`: Optional. An object to customize the auto-generated form fields for the component's properties in the editor's sidebar.
    -   The keys of this object correspond to the prop names defined in the Zod schema.
    -   The values are typically functions that receive the current `layer` object and return configuration options for the `AutoForm` field. These options can control the field's label, input type (`fieldType`), visibility (`isHidden`), placeholder text, render logic, and more. See the AutoForm documentation for available options.
    -   This is useful for:
        *   Providing more descriptive labels or help text.
        *   Using specific input components (e.g., a color picker, a custom slider).
        *   Hiding props that shouldn't be user-editable (like internal state).
        *   Implementing conditional logic (e.g., showing/hiding a field based on another prop's value).
    -   The example uses `classNameFieldOverrides` and `childrenFieldOverrides` from `@/lib/ui-builder/registry/form-field-overrides` to provide standardized handling for common props like `className` (using a auto suggest text input) and `children` (using a custom component). You can create your own override functions or objects.
-   `defaultChildren`: Optional. Default children to use when a new instance of this component is added to the canvas. For example setting initial text on a span component.


### Customizing the Page Config Panel Tabs

You can customize the tabs in the left "Page Config" panel (by default, "Layers" and "Appearance") by providing a `pageConfigPanelTabsContent` property inside the `panelConfig` prop. This allows you to change the tab titles or provide custom content for each tab. For example, you might want to provide your own appearance tab if you not using tailwind or a custom subset of tailwind like in React-Email .

```tsx
import UIBuilder, { defaultConfigTabsContent } from "@/components/ui/ui-builder";

// Example: Customizing the tabs
const myTabsContent = {
  layers: { title: "My Layers", content: <MyCustomLayersPanel /> },
  appearance: { title: "Theme", content: <MyCustomAppearancePanel /> },
};

<UIBuilder
  componentRegistry={myComponentRegistry}
  panelConfig={{
    pageConfigPanelTabsContent: myTabsContent,
    // ...other panel overrides
  }}
/>
```

If you do not provide this, the default tabs ("Layers" and "Appearance") will be used.
You can also override other panels in the `panelConfig` like `editorPanel`, `propsPanel`, and `navBar`.

---

## How it Works

UI Builder empowers you to visually construct and modify user interfaces by leveraging your own React components. Here's a breakdown of its core principles:

*   **Component-Driven Foundation**: At its heart, UI Builder operates on your existing React components. You provide a `componentRegistry` detailing the components you want to make available in the editor. This registry includes the component itself, its Zod schema for props, its import path for code generation, and optional UI customizations for the editor.

*   **Layer-Based Canvas**: The user interface is constructed as a tree of "layers." Each layer represents an instance of a component from your registry. Users can visually add, remove, reorder, and nest these layers on an interactive canvas, offering a direct manipulation experience. Any component type, like `div`, `main`, or custom containers, can serve as the root page layer.

*   **Dynamic Props Editing**: Each component in the registry is defined with a Zod schema that outlines its props, their types, and default values. UI Builder utilizes this schema to automatically generate a properties panel (using [Auto-Form](https://github.com/vantezzen/autoform/tree/pure-shadcn)). This allows users to configure component instances in real-time, with changes immediately reflected on the canvas.

*   **Flexible State Management**: By default, the editor's state (the arrangement and configuration of layers) is persisted in the browser's local storage for convenience across sessions. For more robust or backend-integrated solutions, you can provide `initialLayers` to seed the editor (e.g., from a database) and use the `onChange` callback to capture state changes and persist them as needed.

*   **React Code Generation**: A key feature is the ability to export the visually designed page structure as clean, readable React code. This process uses the import paths (`from` property) specified in your component registry, ensuring the generated code correctly references your components.

*   **Extensibility and Customization**: The system is designed for deep integration with your project:
    *   Customize the properties form for each component using `fieldOverrides` to enhance the editing experience (e.g., custom labels, input types, or conditional visibility).
    *   Provide custom React components via the `panelConfig` prop to provide custom components for the editor panels.
    *   If you only need to display a UI Builder page without the editor, the `LayerRenderer` component can render it using the same `componentRegistry` and serialized page data.

---


## Changelog

### v1.0.0
- Removed _page_ layer type in favor of using any component type (like `div`, `main`, or custom containers) as the root page layer. This enhances flexibility, enabling use cases like building react-email templates directly. You should migrate any layers stored in the database to use a standard component type as the root. The [migrateV2ToV3](lib/ui-builder/store/layer-utils.ts) function in `layer-utils.ts` can assist with this migration.
- The `componentRegistry` is now passed as a prop to the `UIBuilder` component instead of being defined in a standalone file.
- Removed the script used to generate component schema definitions. This approach proved problematic to maintain and didn't function correctly for complex components or varying project setups. Component schema definitions should now be manually created or generated using project-specific tooling if desired.
- `panelConfig` prop added to `UIBuilder` to allow customization of the page config panel tabs.
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

- [ ] Add user friendly styling component along with of directly using tailwind classes
- [ ] Add tiptap editor for markdown content
- [ ] Add global variables for component props
- [ ] Add Blocks. Reusable component blocks that can be used in multiple pages
- [ ] Move component schemas to separate shadcn registry to keep main registry light
- [ ] Move prop form field components (overrides) to separate shadcn registry to keep main registry light
- [ ] Add data sources to component layers (ex, getUser() binds prop user.name)
- [ ] Add event handlers to component layers (onClick, onSubmit, etc)
- [ ] React Native support
- [ ] Update to React 19
- [ ] Update to latest Shadcn/ui + Tailwind CSS v4
- [ ] Update to new AutoForm when stable
- [ ] Update to Zod v4 (when stable) for native json schema conversion to enforce safety in layer props

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT
