# UI Builder 

Add a UI Builder to your project. Use existing React components to build 'fully' featured UIs.
Uses shadcn/ui for the UI components.

## Installation

If you are using @shadcn/ui 2.0.0 or later, you can install the component directly from the registry. 

```bash
npx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json
```

Add dev dependencies, since shadcn is not installing them correctly from the registry:

```bash
npm install -D @types/lodash.template @tailwindcss/typography @types/react-syntax-highlighter react-docgen-typescript tailwindcss-animate ts-morph ts-to-zod
```

Fix zustand dependency to use latest stable version as opposed to RC:

```bash
npm install zustand@4.5.5
```

Next, generate the zod schemas that will be used by the UI Builder to render and configure the components.

```bash
npx tsx lib/ui-builder/zod-gen.ts
```



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
npm test
```
