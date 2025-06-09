# TypeScript Type Safety Migration Guide

This guide helps you migrate to the enhanced TypeScript type safety features in UI Builder. **All changes are backward compatible** - you can adopt them gradually.

## Quick Start - No Migration Required

Your existing code continues to work without any changes:

```tsx
// ✅ Still works exactly as before
const handleChange = (layers: ComponentLayer[]) => {
  // Your existing logic
};

<UIBuilder
  componentRegistry={myRegistry}
  onChange={handleChange}
/>
```

## Progressive Enhancement Strategy

### Step 1: Start Using Helper Functions

Replace manual object creation with type-safe helpers:

```tsx
// Old approach (still works)
const variable = {
  id: 'var1',
  name: 'userName',
  type: 'string',
  defaultValue: 'John Doe'
};

// ✅ New type-safe approach
import { createVariable } from "@/components/ui/ui-builder/types";

const variable = createVariable('var1', 'userName', 'string', 'John Doe');
// TypeScript ensures defaultValue matches the type
```

### Step 2: Adopt Typed Callbacks

Enhance your event handlers with full type inference:

```tsx
// Old approach (still works)
const handleLayerChange = (layers: ComponentLayer[]) => {
  layers.forEach(layer => {
    console.log(layer.props); // props is any
  });
};

// ✅ New typed approach
import { TypedLayerChangeHandler } from "@/components/ui/ui-builder/types";

const handleLayerChange: TypedLayerChangeHandler<typeof myRegistry> = (layers) => {
  layers.forEach(layer => {
    if (layer.type === 'Button') {
      // ✅ TypeScript knows exact prop types
      console.log(layer.props.variant); // Autocomplete + validation
      console.log(layer.props.disabled);
    }
  });
};
```

### Step 3: Use Type Extraction

Extract exact prop types from your component definitions:

```tsx
// ✅ Automatic type extraction
import { ExtractComponentProps } from "@/components/ui/ui-builder/types";

type ButtonProps = ExtractComponentProps<typeof myRegistry, 'Button'>;
// Result: { variant: 'primary' | 'secondary'; disabled?: boolean; ... }

function processButtonProps(props: ButtonProps) {
  // TypeScript knows exact structure
  if (props.variant === 'primary') {
    // Type-safe access to all properties
  }
}
```

### Step 4: Create Typed Layers

Use the new layer creation helper for compile-time validation:

```tsx
// Old approach (still works)
const layer = {
  id: 'btn1',
  type: 'Button',
  props: {
    variant: 'primary',
    disabled: false
  },
  children: []
};

// ✅ New typed approach with validation
import { createTypedLayer } from "@/components/ui/ui-builder/types";

const layer = createTypedLayer(
  'btn1',
  'Button' as keyof typeof myRegistry,
  {
    variant: 'primary',  // ✅ TypeScript validates enum
    disabled: false      // ✅ TypeScript validates boolean
    // variant: 'invalid' // ❌ TypeScript error
  }
);
```

### Step 5: Enhance Variable Handling

Use typed variable collections for better type safety:

```tsx
// Old approach (still works)
const handleVariablesChange = (variables: Variable[]) => {
  // Basic handling
};

// ✅ New typed approach
import { TypedVariableChangeHandler } from "@/components/ui/ui-builder/types";

const handleVariablesChange: TypedVariableChangeHandler<typeof myVariables> = (variables) => {
  variables.forEach(variable => {
    // TypeScript knows exact types for each variable
    console.log(`${variable.name}: ${variable.defaultValue}`);
  });
};
```

## Common Migration Patterns

### Pattern 1: Converting Component Registries

Your existing registries work as-is, but you can enhance them:

```tsx
// Old registry (still works)
const registry = {
  Button: {
    component: Button,
    schema: buttonSchema,
    // ...
  }
};

// ✅ Enhanced with better typing
import type { ComponentRegistry } from "@/components/ui/ui-builder/types";

const registry: ComponentRegistry = {
  Button: {
    component: Button,
    schema: buttonSchema,
    from: '@/components/ui/button',
    fieldOverrides: {
      className: (layer) => ({ fieldType: 'text' })
    }
  }
} as const; // 'as const' for better type inference
```

### Pattern 2: Converting Variable Definitions

```tsx
// Old variables (still work)
const variables = [
  { id: 'var1', name: 'title', type: 'string', defaultValue: 'Hello' }
];

// ✅ Enhanced with type safety
import { createVariable } from "@/components/ui/ui-builder/types";

const variables = [
  createVariable('var1', 'title', 'string', 'Hello'),
  createVariable('var2', 'count', 'number', 42),
  createVariable('var3', 'enabled', 'boolean', true)
];
```

### Pattern 3: Converting UIBuilder Props

```tsx
// Old UIBuilder usage (still works)
<UIBuilder
  componentRegistry={registry}
  onChange={handleChange}
  onVariablesChange={handleVariablesChange}
/>

// ✅ Enhanced with type inference
<UIBuilder
  componentRegistry={registry}
  onChange={handleChange as TypedLayerChangeHandler<typeof registry>}
  onVariablesChange={handleVariablesChange as TypedVariableChangeHandler<typeof variables>}
/>
```

## Advanced Type Usage

### Using Type Guards

```tsx
import { isVariableReference, isValidVariableValue } from "@/components/ui/ui-builder/types";

// Type-safe variable reference checking
if (isVariableReference(propValue)) {
  // TypeScript knows propValue is VariableReference
  console.log(propValue.__variableRef);
}

// Runtime type validation
if (isValidVariableValue(userInput, 'string')) {
  // TypeScript knows userInput is string
  console.log(userInput.toUpperCase());
}
```

### Generic Component Functions

```tsx
import type { ExtractComponentProps, ComponentRegistry } from "@/components/ui/ui-builder/types";

function createComponent<
  TRegistry extends ComponentRegistry,
  TKey extends keyof TRegistry
>(
  registry: TRegistry,
  type: TKey,
  props: ExtractComponentProps<TRegistry, TKey>
) {
  // TypeScript ensures props match component schema
  return { type, props };
}

// Usage with full type safety
const button = createComponent(myRegistry, 'Button', {
  variant: 'primary', // ✅ Validated
  disabled: false     // ✅ Validated
});
```

## Benefits of Migration

### Before (Any Types)
```tsx
const handleChange = (layers: ComponentLayer[]) => {
  layers.forEach(layer => {
    console.log(layer.props.variant); // ❌ No autocomplete, runtime errors possible
  });
};
```

### After (Type Safety)
```tsx
const handleChange: TypedLayerChangeHandler<typeof registry> = (layers) => {
  layers.forEach(layer => {
    if (layer.type === 'Button') {
      console.log(layer.props.variant); // ✅ Autocomplete + compile-time validation
    }
  });
};
```

## Migration Checklist

- [ ] **Start small** - Begin with new code using helper functions
- [ ] **Add type annotations** to existing callbacks gradually  
- [ ] **Use type extraction** for component-specific logic
- [ ] **Replace manual object creation** with typed helpers
- [ ] **Add 'as const'** to registries for better inference
- [ ] **Leverage type guards** for runtime safety
- [ ] **Test thoroughly** - all existing functionality should work unchanged

## Troubleshooting

### "Type 'any' is not assignable to..."
This usually means you're mixing old untyped code with new typed code. Solution:
```tsx
// If you need to bridge old/new code temporarily
const legacyLayer = oldLayer as ComponentLayer<ButtonProps>;
```

### "Property does not exist on type..."
This means TypeScript is correctly catching a potential error:
```tsx
// Check the component type first
if (layer.type === 'Button') {
  // Now TypeScript knows layer.props is ButtonProps
  console.log(layer.props.variant);
}
```

### "Cannot infer type arguments..."
Add explicit type parameters:
```tsx
// Instead of relying on inference
createTypedLayer('id', 'Button', props)

// Be explicit about the registry type
createTypedLayer<typeof myRegistry, 'Button'>('id', 'Button', props)
```

Remember: **Migration is optional and gradual**. Start where it adds the most value to your development workflow!