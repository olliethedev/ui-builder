# UI Builder 

Add a UI Builder to your project. Use existing React components to build 'fully' featured UIs.
Uses shadcn/ui for the UI components.


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
