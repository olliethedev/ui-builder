# UI Builder 

Add a UI Builder to your project. Use existing React components to build 'fully' featured UIs.
Uses shadcn/ui for the UI components.

## Installation

If you are using @shadcn/ui 2.0.0 or later, you can install the component directly from the registry. 

```bash
npx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/ui-builder.json https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/ui-builder-lib.json
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
