# SandpackPanel Integration

This document describes the new SandpackPanel feature that provides an alternative editor panel using Sandpack for iframe-based component rendering.

## Overview

The SandpackPanel is an alternative to the standard EditorPanel that renders UI Builder layers inside a Sandpack iframe environment. This provides better isolation and allows for real-time code generation and preview capabilities.

## Key Features

- **Iframe-based rendering**: Components are rendered inside a secure Sandpack iframe
- **Real-time code generation**: Automatically generates React code from UI Builder layers
- **Cross-iframe communication**: Uses Penpal library for bidirectional communication between parent and iframe
- **Element selection**: Full element selection and highlighting works across the iframe boundary
- **Interactive controls**: All standard UI Builder interactions work seamlessly

## Usage

To use the SandpackPanel instead of the standard EditorPanel, simply pass the `useSandpack` prop to the UIBuilder component:

```tsx
import UIBuilder from "@/components/ui/ui-builder";

function MyApp() {
  return (
    <UIBuilder
      useSandpack={true}
      componentRegistry={myRegistry}
      initialLayers={myLayers}
      // ... other props
    />
  );
}
```

## Architecture

### Components

1. **SandpackPanel** (`components/ui/ui-builder/internal/sandpack-panel.tsx`)
   - Main panel component that replaces EditorPanel when `useSandpack=true`
   - Handles zoom controls and layout
   - Generates React code from layer structure

2. **SandpackIframeBridge** (`components/ui/ui-builder/internal/sandpack/sandpack-iframe-bridge.tsx`)
   - Manages Penpal communication between parent window and iframe
   - Handles element selection events
   - Synchronizes layer updates

### Communication Flow

```
Parent Window (UIBuilder)
    ↕ (Penpal)
Iframe (Sandpack)
```

The communication includes:
- Element click events from iframe to parent
- Layer updates from parent to iframe
- Element highlighting and selection state synchronization

### Code Generation

The SandpackPanel automatically converts UI Builder layers into executable React code:

```tsx
// Layer structure
{
  type: "Button",
  props: { children: "Click me", variant: "primary" },
  children: []
}

// Generated code
<Button children="Click me" variant="primary" data-layer-id="button-123">
```

## Dependencies

The SandpackPanel integration requires these additional dependencies:

- `@codesandbox/sandpack-react`: Provides the Sandpack environment
- `penpal`: Enables secure cross-iframe communication

## Example

A complete example is available at `/examples/sandpack/page.tsx` which demonstrates:
- Setting up a component registry
- Using initial layers
- Enabling the SandpackPanel with `useSandpack=true`

## Limitations

1. **Component Registry**: Only components registered in the componentRegistry can be rendered
2. **Performance**: Large component trees may have performance implications in the iframe environment
3. **Browser Compatibility**: Requires modern browsers that support iframe postMessage APIs

## Troubleshooting

### Common Issues

1. **Penpal Connection Failures**
   - Ensure the iframe has fully loaded before attempting communication
   - Check browser console for CORS or security policy errors

2. **Component Not Rendering**
   - Verify the component is properly registered in the componentRegistry
   - Check that all required props are provided in the layer definition

3. **Element Selection Not Working**
   - Ensure data-layer-id attributes are properly set on all elements
   - Verify the Penpal bridge script is successfully injected

### Debugging

Enable debug mode by checking the browser console for:
- Penpal connection status
- Generated React code
- Layer update events

## Future Enhancements

Potential improvements for the SandpackPanel:

1. **Hot Reloading**: Implement hot reloading for faster development cycles
2. **Code Export**: Add functionality to export the generated React code
3. **Custom Templates**: Support for custom Sandpack templates
4. **Performance Optimization**: Optimize rendering for large component trees
5. **Error Boundaries**: Better error handling and display within the iframe

## Contributing

When contributing to the SandpackPanel feature:

1. Ensure compatibility with the existing UIBuilder API
2. Test cross-iframe communication thoroughly
3. Maintain backwards compatibility with the standard EditorPanel
4. Update this documentation for any new features or changes