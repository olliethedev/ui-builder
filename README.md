# UI Builder

UI Builder is a React component that allows you to create and edit user interfaces through a visual no-code editor. It comes with a handful of core components and integrates easily with existing [shadcn/ui](https://ui.shadcn.com/) projects but can be extended to use your own custom components. 

You can use UI Builder to design and build UIs quickly. It's a great tool for creating landing pages, forms, dashboards, or anything else you can imagine. It can be used internally within your organization as a storybook alternative or a prototyping tool or as part of a product that provides users a no-code way to build their own applications, like Shopify, Builder.io, Framer, etc.

See the [demo](https://uibuilder.app/) to get an idea of how it works.

![UI Builder Demo](./public/demo.png)


## Installation

If you are using the latest shadcn/ui in your project, you can install the component directly from the registry. 

```bash
npx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json
```

Note: You need to use [style variables](https://ui.shadcn.com/docs/theming) to have page theming working correctly.

Or you can start a new project with the UI Builder:

```bash
npx shadcn@latest init https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json
```

If you are not using shadcn/ui, you can install the component simply by copying the files in this repo into your project.

### Fixing Dependencies after shadcn `init` or `add`
Add dev dependencies, since there currently seems to be an issue with shadcn/ui not installing them from the registry:

```bash
npm install -D @types/lodash.template @tailwindcss/typography @types/react-syntax-highlighter react-docgen-typescript tailwindcss-animate ts-morph ts-to-zod
```

Fix zustand dependency to use latest stable version as opposed to default RC release that gets installed:

```bash
npm install zustand@4.5.5
```

And that's it! You have a UI Builder that you can use to build your UI.

## Usage

```tsx
import UIBuilder from "@/components/ui/ui-builder";

export function MyApp() {
  return <UIBuilder initialLayers={initialPages} onChange={handleChange} />;
}
```

- `initialLayers`: Optional prop to set up initial pages and layers. Useful for setting the initial state of the builder, from a database for example.
- `onChange`: Optional callback triggered when the editor state changes, providing the updated pages. Can be used to persist the state to a database.


You can also render the page without editor functionality by using the LayerRenderer component:

```tsx
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";

export function MyPage() {
  return <LayerRenderer page={page} />;
}
```

This is useful when you want to render the finished page in a non-editable fashion.

## Add your custom components to the registry

Navigate to the [component-registry.tsx](lib/ui-builder/registry/component-registry.tsx) file and add your component definitions to the array. See core concepts below for more information on the component definitions.

## Optional: Generate the component registry
To generate the zod schemas that will be used by the UI Builder to render and configure the components you can run the following command:

```bash
npx tsx lib/ui-builder/scripts/zod-gen.ts
```

This will generate the component definitions at the root of every folder in your /components/ui directory. Note: The generated files will need to be refactored in some cases. See Auto-Form limitations below.

## Auto-Form

This project leverages [Auto-Form](https://github.com/vantezzen/auto-form) to dynamically render component property forms based on the component definitions zod schema. Currently only these zod types are supported:

- boolean
- date
- enum
- number
- string
- object with properties of the supported zod types
- array of objects with properties of the supported zod types

# UI Builder Technical Overview

----
Note: This project is an work in progress and the API will change.

----

## Core Concepts

### Layers

- **Layers** are the fundamental units representing components, text, or pages within the UI structure.
- They form a hierarchical tree, allowing for complex and nested UI layouts.
- Each layer possesses properties and can contain child layers, enabling modular and scalable UI designs.


### Pages

- **Pages** are top-level layers that act as containers for other layers.
- They represent distinct sections or views within the application.
- Each page maintains its own set of properties and child layers, facilitating organized UI management.
- Pages can have theme settings.


### Components

- **Components** are reusable UI elements defined within the `component-registry`.
- They can be categorized as:
  - **Primitive Components**: Basic HTML elements like `<div>`, `<img>`, etc.
  - **Custom Components**: Complex UI elements like `<Button>`, `<Badge>`, etc.
- Components are registered with associated schemas, default properties, and behaviors, ensuring consistency and ease of use.


## Core Types

### `Layer` Types (`layer-store.ts`)


The `layer-store.ts` module defines the essential types used to manage UI layers.

```ts

export type Layer =
  | {
      id: string;
      name?: string;
      type: keyof typeof componentRegistry;
      props: Record<string, any>;
      children: Layer[];
    }
  | TextLayer
  | PageLayer;

export type ComponentLayer = Exclude<Layer, TextLayer>;

export type TextLayer = {
  id: string;
  name?: string;
  type: '_text_';
  props: Record<string, any>;
  text: string;
  textType: 'text' | 'markdown';
};

export type PageLayer = {
  id: string;
  name?: string;
  type: '_page_';
  props: Record<string, any>;
  children: Layer[];
};

interface LayerStore {
  pages: PageLayer[];
  selectedLayerId: string | null;
  selectedPageId: string;
  initialize: (pages: PageLayer[]) => void;
  addComponentLayer: (layerType: keyof typeof componentRegistry, parentId: string, parentPosition?: number) => void;
  addTextLayer: (text: string, textType: 'text' | 'markdown', parentId: string, parentPosition?: number) => void;
  addPageLayer: (pageId: string) => void;
  duplicateLayer: (layerId: string, parentId?: string) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, newProps: Record<string, any>, layerRest?: Partial<Omit<Layer, 'props'>>) => void;
  selectLayer: (layerId: string) => void;
  selectPage: (pageId: string) => void;
  findLayerById: (layerId: string | null) => Layer | undefined;
  findLayersForPageId: (pageId: string) => Layer[];
}

```

- `LayerType`: Enumerates the types of layers, including registered components and text layers.
- `Layer`: A union type representing any possible layer, encompassing component, text, or page layers.
- `ComponentLayer`: Represents layers that are components, excluding text layers.
- `TextLayer`: Represents layers containing text content. Text layers dont have children.
- `PageLayer`: Represents layers that serve as pages containing other layers.
- `LayerStore`: Defines the structure of the state, including pages, selected layer/page IDs, and various actions to manipulate layers.


### `ComponentRegistry` Types (`component-registry.tsx`)

The `component-registry.tsx` module manages the registration and configuration of UI components.

```ts
export interface RegistryEntry<T extends ReactComponentType<any>> {
  component?: T;
  schema: ZodObject<any>;
  from?: string;
  defaultChildren?: (ComponentLayer | TextLayer)[];
  fieldOverrides?: Record<string, FieldConfigFunction>;
}

export type ComponentRegistry = Record<
  string,
  RegistryEntry<ReactComponentType<any>>
>;

export type FieldConfigFunction = (layer: ComponentLayer | TextLayer) => FieldConfigItem;

export const componentRegistry: ComponentRegistry = {
  // ...YourOtherProjectComponentDefinitions
  ...complexComponentDefinitions,
  ...primitiveComponentDefinitions,
} as const;

export const generateFieldOverrides = (layer: ComponentLayer | TextLayer): Record<string, FieldConfigItem> => {...}

```

- `RegistryEntry`: Defines the structure for each component's registry entry, including the component itself, its schema, source path, default children, and field overrides.
- `ComponentRegistry`: A record mapping component names to their respective RegistryEntry.
- `FieldConfigFunction`: A function type used to override default form fields based on the layer.

### Registration Structure
Each component is registered with the following details:
- `component`: The React component itself.
- `schema`: A Zod schema defining the properties and validation rules for the component.
- `from`: The source path of the component. Used when exporting the page as code.
- `defaultChildren`: An array of default child layers that the component should contain upon creation.
- `fieldOverrides`: Functions to customize form fields when editing the component's properties.


### Example Registration

```ts
export const componentRegistry: ComponentRegistry = {
  Button: {
    component: Button,
    schema: z.object({
      className: z.string().optional(),
      asChild: z.boolean().optional(),
      children: z.any().optional(),
      variant: z.enum(["default", "destructive", "outline", "secondary", "ghost", "link"]).default("default"),
      size: z.enum(["default", "sm", "lg", "icon"]).default("default"),
    }),
    from: "@/components/ui/button",
    defaultChildren: [
      {
        id: "button-text",
        type: "_text_",
        name: "Text",
        text: "Button",
        textType: "text",
        props: {},
      },
    ],
    fieldOverrides: {
      className: (layer) => classNameFieldOverrides(layer),
      children: (layer) => childrenFieldOverrides(layer),
    },
  },
  // ... Other component definitions
} as const;
```

### Button Component:
- `Schema`: Defines props like className, variant, and size with default values.
- `Default Children`: A text layer with default text "Button".
- `Field Overrides`: Customizes form fields for className and children properties.

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
npx shadcn@latest add http://127.0.0.1:8080/ui-builder.json http://127.0.0.1:8080/ui-builder-lib.json
```

## Running Tests

```bash
npm run test
```

## Roadmap

- [ ] Increase test coverage
- [ ] Improve performance
- [ ] Rework text layers to be more consistent with component layers
- [ ] Add form components
- [ ] Add children (component or even page) by reference (as opposed to duplicating)
- [ ] Add more examples

## License

MIT
