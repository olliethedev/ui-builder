/**
 * Type-Safe UI Builder Example
 * 
 * This example demonstrates the enhanced type system that supports:
 * 1. Any valid React types for props and children
 * 2. Type inference from component prop definitions (Zod schemas)
 * 3. Type inference from variable definitions  
 * 4. Strongly typed callbacks that return properly typed data
 */

import React from 'react';
import { z } from 'zod';
import { ComponentType } from 'react';
import {
  ComponentRegistry,
  ComponentLayer,
  Variable,
  VariableValueType,
  createVariable,
  createTypedLayer,
  ExtractComponentProps,
  TypedComponentLayer,
  VariableValue,
  InferPropsFromSchema,
  TypedLayerChangeHandler,
  TypedVariableChangeHandler,
  VariableCollection,
  ExtractVariableValues,
} from '@/components/ui/ui-builder/types';

// Example 1: Component with Zod schema - types are inferred automatically
const ButtonSchema = z.object({
  label: z.string().default('Click me'),
  variant: z.enum(['primary', 'secondary', 'destructive']).default('primary'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  disabled: z.boolean().default(false),
  onClick: z.function().optional(),
});

const CardSchema = z.object({
  title: z.string().default('Card Title'),
  description: z.string().optional(),
  className: z.string().default(''),
  children: z.any().optional(), // React children
});

// Example registry with type-safe component definitions
const exampleRegistry = {
  Button: {
    component: (() => null) as ComponentType<InferPropsFromSchema<typeof ButtonSchema>>,
    schema: ButtonSchema,
    from: '@/components/ui/button',
  },
  Card: {
    component: (() => null) as ComponentType<InferPropsFromSchema<typeof CardSchema>>,
    schema: CardSchema,
    from: '@/components/ui/card',
  },
} as const satisfies ComponentRegistry;

// Example 2: Type-safe variable creation with inference
const stringVariable = createVariable('var1', 'title', 'string', 'Default Title');
const numberVariable = createVariable('var2', 'count', 'number', 0);
const booleanVariable = createVariable('var3', 'enabled', 'boolean', true);

// Variables collection as array (proper format)
const variables = [stringVariable, numberVariable, booleanVariable] satisfies Variable[];

// Example 3: Extract types from component registry
type ButtonProps = ExtractComponentProps<typeof exampleRegistry, 'Button'>;
// Result: { label: string; variant: 'primary' | 'secondary' | 'destructive'; size: 'sm' | 'md' | 'lg'; disabled: boolean; onClick?: Function }

type CardProps = ExtractComponentProps<typeof exampleRegistry, 'Card'>;
// Result: { title: string; description?: string; className: string; children?: any }

// Example 4: Create typed layers with full type safety
const typedButtonLayer = createTypedLayer(
  'button-1',
  'Button' as keyof typeof exampleRegistry,
  {
    label: 'Save Changes',  // ✅ Type-safe: string expected
    variant: 'primary',     // ✅ Type-safe: only valid enum values
    size: 'lg',            // ✅ Type-safe: only valid enum values
    disabled: false,       // ✅ Type-safe: boolean expected
    // onClick: 'invalid'  // ❌ Would cause TypeScript error
  },
  [],
  'Save Button'
);

const typedCardLayer = createTypedLayer(
  'card-1', 
  'Card' as keyof typeof exampleRegistry,
  {
    title: 'User Profile',
    description: 'Edit your profile information',
    className: 'p-4 border rounded',
    // children can be any React node
    children: [typedButtonLayer], // ✅ Can include other layers
  },
  [],
  'Profile Card'
);

// Example 5: Type-safe callbacks with inference
const handleLayerChange: TypedLayerChangeHandler<typeof exampleRegistry> = (layers) => {
  // layers parameter is properly typed based on registry
  layers.forEach(layer => {
    if (layer.type === 'Button') {
      // TypeScript knows this is a Button layer with Button props
      console.log('Button label:', layer.props.label); // ✅ Type-safe access
      console.log('Button variant:', layer.props.variant); // ✅ Knows it's the enum type
    }
    if (layer.type === 'Card') {
      // TypeScript knows this is a Card layer with Card props
      console.log('Card title:', layer.props.title); // ✅ Type-safe access
    }
  });
};

const handleVariableChange: TypedVariableChangeHandler<typeof variables> = (vars) => {
  // Variables are properly typed
  vars.forEach(variable => {
    console.log('Variable:', variable.name, 'Value:', variable.defaultValue);
  });
};

// Example 6: Variable values with proper typing  
const variableValues = {
  [stringVariable.id]: 'Dynamic Title' as string,     // ✅ Must be string
  [numberVariable.id]: 42 as number,                  // ✅ Must be number  
  [booleanVariable.id]: true as boolean,              // ✅ Must be boolean
};

// Example 7: Complex nested component with children inference
const complexLayer: ComponentLayer = {
  id: 'root',
  type: 'Card',
  name: 'Root Card',
  props: {
    title: 'Dashboard',
    className: 'container mx-auto',
    children: 'Card content here', // ✅ Simple text content
  },
  children: [
    {
      id: 'button-1',
      type: 'Button', 
      props: {
        label: 'Primary Action',
        variant: 'primary',
      },
      children: [], // Can be empty array
    },
    {
      id: 'button-2',
      type: 'Button',
      props: {
        label: 'Secondary Action', 
        variant: 'secondary',
      },
      children: 'Text content', // ✅ Can be string
    },
  ],
};

// Example 8: Generic variable handling with type safety
function createTypedVariable<T extends VariableValueType>(
  id: string,
  name: string, 
  type: T,
  defaultValue: VariableValue<T>
): Variable<T> {
  return createVariable(id, name, type, defaultValue);
}

// Usage with full type inference
const objectVariable = createTypedVariable('var4', 'config', 'object', { theme: 'dark' });
const arrayVariable = createTypedVariable('var5', 'items', 'array', ['item1', 'item2']);

// TypeScript correctly infers the types:
// objectVariable.defaultValue is Record<string, unknown>
// arrayVariable.defaultValue is unknown[]

export {
  exampleRegistry,
  variables,
  typedButtonLayer,
  typedCardLayer,
  handleLayerChange,
  handleVariableChange,
  variableValues,
  complexLayer,
};

/**
 * Key Benefits of the Enhanced Type System:
 * 
 * 🎯 **Full Type Inference**: Types are automatically inferred from Zod schemas
 * 🛡️ **Compile-Time Safety**: Catch type errors before runtime
 * 🔄 **Any React Types**: Support for all valid React prop and children types
 * 📊 **Strongly Typed Callbacks**: Callbacks receive properly typed data
 * 🎛️ **Variable Type Safety**: Variables maintain their type constraints
 * 💡 **Better IntelliSense**: Enhanced autocomplete and type hints
 * 🔧 **Developer Experience**: Self-documenting code with rich type information
 * ⚡ **Performance**: No runtime overhead, pure compile-time benefits
 */