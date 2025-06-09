/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodObject, ZodRawShape, ZodType, infer as ZodInfer } from "zod";
import { ComponentType as ReactComponentType, ReactNode } from 'react';
import {
    FieldConfigItem,
  } from "@/components/ui/auto-form/types";

export type {
    AutoFormInputComponentProps,
    FieldConfigItem,
  } from "@/components/ui/auto-form/types";

/**
 * Comprehensive prop value type that supports all React types and UI Builder features.
 * Includes React nodes, variable references, objects, arrays, and primitives.
 * 
 * @example
 * ```tsx
 * const props: Record<string, PropValue> = {
 *   children: "Hello World",                    // ReactNode
 *   onClick: () => console.log('clicked'),      // Function
 *   style: { color: 'red' },                   // Object
 *   items: ['a', 'b', 'c'],                    // Array
 *   title: { __variableRef: 'var1' },          // Variable reference
 *   count: 42,                                 // Number
 *   enabled: true                              // Boolean
 * };
 * ```
 */
export type PropValue = 
  | ReactNode
  | VariableReference
  | Record<string, any>
  | any[]
  | string
  | number
  | boolean
  | null
  | undefined;

/**
 * Variable reference object used to bind component properties to dynamic variables.
 * Contains a special `__variableRef` property that references a variable by ID.
 * 
 * @example
 * ```tsx
 * const variableRef: VariableReference = {
 *   __variableRef: 'user-name-var'
 * };
 * ```
 */
export interface VariableReference {
  __variableRef: string;
}

/**
 * Generic component props type with flexible typing support.
 * Defaults to a record of PropValue but can be specialized for specific components.
 * 
 * @template T - The specific props shape for a component
 * 
 * @example
 * ```tsx
 * // Generic usage
 * type GenericProps = ComponentProps; // Record<string, PropValue>
 * 
 * // Specific component props
 * type ButtonProps = ComponentProps<{
 *   label: string;
 *   variant: 'primary' | 'secondary';
 *   disabled?: boolean;
 * }>;
 * ```
 */
export type ComponentProps<T = Record<string, PropValue>> = T;

/**
 * Supported variable value types in the UI Builder system.
 * Each type corresponds to a specific TypeScript type for type safety.
 */
export type VariableValueType = 'string' | 'number' | 'boolean' | 'object' | 'array';

/**
 * Type-safe variable value based on the variable type.
 * Provides compile-time type checking for variable values.
 * 
 * @template T - The variable type constraint
 * 
 * @example
 * ```tsx
 * type StringValue = VariableValue<'string'>;  // string
 * type NumberValue = VariableValue<'number'>;  // number
 * type BooleanValue = VariableValue<'boolean'>; // boolean
 * type ObjectValue = VariableValue<'object'>;  // Record<string, unknown>
 * type ArrayValue = VariableValue<'array'>;    // unknown[]
 * ```
 */
export type VariableValue<T extends VariableValueType = VariableValueType> = 
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'object' ? Record<string, unknown> :
  T extends 'array' ? unknown[] :
  unknown;

/**
 * Generic variable interface with type constraints for enhanced type safety.
 * Variables are used to create dynamic, data-driven component properties.
 * 
 * @template T - The variable type for compile-time validation
 * 
 * @example
 * ```tsx
 * const stringVar: Variable<'string'> = {
 *   id: 'var1',
 *   name: 'userName',
 *   type: 'string',
 *   defaultValue: 'John Doe' // TypeScript ensures this is a string
 * };
 * 
 * const numberVar: Variable<'number'> = {
 *   id: 'var2',
 *   name: 'userAge',
 *   type: 'number',
 *   defaultValue: 25 // TypeScript ensures this is a number
 * };
 * ```
 */
export interface Variable<T extends VariableValueType = VariableValueType> {
  id: string;
  name: string;
  type: T;
  defaultValue: VariableValue<T>;
}

/**
 * Utility type to extract prop types from Zod schemas.
 * Used internally for type inference from component definitions.
 * 
 * @template T - The Zod object schema to extract types from
 */
export type InferPropsFromSchema<T extends ZodObject<ZodRawShape>> = ZodInfer<T>;

/**
 * Generic component layer with enhanced type safety and inference capabilities.
 * Represents a component instance in the UI Builder with its configuration.
 * 
 * @template TProps - The props shape for this specific component
 * 
 * @example
 * ```tsx
 * // Generic layer
 * const genericLayer: ComponentLayer = {
 *   id: 'layer1',
 *   type: 'div',
 *   props: { className: 'container' },
 *   children: []
 * };
 * 
 * // Typed layer for specific component
 * const buttonLayer: ComponentLayer<ButtonProps> = {
 *   id: 'btn1',
 *   type: 'Button',
 *   props: {
 *     label: 'Click me',
 *     variant: 'primary',
 *     disabled: false
 *   },
 *   children: []
 * };
 * ```
 */
export interface ComponentLayer<
  TProps extends Record<string, PropValue> = Record<string, PropValue>
> {
  id: string;
  name?: string;
  type: string;
  props: ComponentProps<TProps>;
  children: ComponentLayer[] | string;
}

/**
 * Enhanced registry entry with improved generics for better type inference.
 * Defines how a component should be handled in the UI Builder system.
 * 
 * @template TComponent - The React component type
 * @template TSchema - The Zod schema for component props
 * 
 * @example
 * ```tsx
 * const buttonEntry: RegistryEntry<typeof Button, typeof ButtonSchema> = {
 *   component: Button,
 *   schema: ButtonSchema,
 *   from: '@/components/ui/button',
 *   fieldOverrides: {
 *     className: (layer) => ({ fieldType: 'text' })
 *   }
 * };
 * ```
 */
export interface RegistryEntry<
  TComponent extends ReactComponentType<any> = ReactComponentType<any>,
  TSchema extends ZodObject<ZodRawShape> = ZodObject<ZodRawShape>
> {
  component?: TComponent;
  schema: TSchema;
  from?: string;
  isFromDefaultExport?: boolean;
  defaultChildren?: ComponentLayer[] | string;
  fieldOverrides?: Record<string, FieldConfigFunction>;
}

/**
 * Component registry mapping component type names to their definitions.
 * The foundation of the UI Builder's component system.
 * 
 * @example
 * ```tsx
 * const registry: ComponentRegistry = {
 *   Button: buttonDefinition,
 *   Input: inputDefinition,
 *   Card: cardDefinition
 * };
 * ```
 */
export type ComponentRegistry = Record<string, RegistryEntry>;

/**
 * Enhanced field configuration function with generic layer support.
 * Used to customize auto-generated form fields for component properties.
 * 
 * @template T - The component layer type
 */
export type FieldConfigFunction = <T extends ComponentLayer>(
  layer: T, 
  allowVariableBinding?: boolean
) => FieldConfigItem;

/**
 * Type-safe layer change handler with inference capabilities.
 * Provides compile-time validation for layer change callbacks.
 * 
 * @template T - Array of component layers
 */
export type LayerChangeHandler<T extends ComponentLayer[] = ComponentLayer[]> = (layers: T) => void;

/**
 * Type-safe variable change handler with inference capabilities.
 * Provides compile-time validation for variable change callbacks.
 * 
 * @template T - Array of variables
 */
export type VariableChangeHandler<T extends Variable[] = Variable[]> = (variables: T) => void;

/**
 * Layer selection handler for component interaction.
 * Called when a layer is selected in the UI Builder.
 */
export type LayerSelectHandler = (layerId: string) => void;

/**
 * Extract component props from a component registry for a specific component type.
 * Provides compile-time type inference from Zod schemas.
 * 
 * @template TRegistry - The component registry type
 * @template TKey - The component key in the registry
 * 
 * @example
 * ```tsx
 * type ButtonProps = ExtractComponentProps<typeof myRegistry, 'Button'>;
 * // Result: { label: string; variant: 'primary' | 'secondary'; disabled?: boolean }
 * 
 * // Use in typed functions
 * function createButton(props: ButtonProps) {
 *   // TypeScript knows exact prop structure
 * }
 * ```
 */
export type ExtractComponentProps<
  TRegistry extends ComponentRegistry,
  TKey extends keyof TRegistry
> = TRegistry[TKey] extends RegistryEntry<any, infer TSchema> 
  ? TSchema extends ZodObject<ZodRawShape>
    ? InferPropsFromSchema<TSchema>
    : Record<string, PropValue>
  : Record<string, PropValue>;

/**
 * Create a typed component layer for a specific component in the registry.
 * Combines type safety with component-specific prop validation.
 * 
 * @template TRegistry - The component registry type
 * @template TKey - The component key in the registry
 */
export type TypedComponentLayer<
  TRegistry extends ComponentRegistry,
  TKey extends keyof TRegistry
> = ComponentLayer<ExtractComponentProps<TRegistry, TKey>>;

/**
 * Variable collection type supporting both arrays and record structures.
 * Provides flexibility in how variables are stored and accessed.
 * 
 * @template T - The variable collection structure
 */
export type VariableCollection<T = Variable[]> = T extends Variable[] 
  ? T 
  : T extends Record<string, Variable> 
  ? T 
  : Variable[];

/**
 * Extract variable values with proper typing from a variable collection.
 * Maintains type safety when accessing variable values.
 * 
 * @template T - The variable collection type
 */
export type ExtractVariableValues<T extends VariableCollection> = 
  T extends Variable[] 
    ? { [K in keyof T]: T[K] extends Variable<infer VType> ? VariableValue<VType> : unknown }
    : T extends Record<string, Variable>
    ? { [K in keyof T]: T[K] extends Variable<infer VType> ? VariableValue<VType> : unknown }
    : Record<string, unknown>;

/**
 * Type guard to check if a value is a variable reference.
 * Provides runtime type checking with TypeScript integration.
 * 
 * @param value - Value to check
 * @returns True if value is a variable reference
 * 
 * @example
 * ```tsx
 * if (isVariableReference(propValue)) {
 *   // TypeScript knows propValue is VariableReference
 *   console.log(propValue.__variableRef);
 * }
 * ```
 */
export function isVariableReference(value: unknown): value is VariableReference {
  return typeof value === 'object' && value !== null && '__variableRef' in value;
}

/**
 * Runtime type validation for variable values with compile-time type safety.
 * Ensures variable values match their declared types.
 * 
 * @template T - The variable value type
 * @param value - Value to validate
 * @param type - Expected variable type
 * @returns True if value matches the expected type
 * 
 * @example
 * ```tsx
 * if (isValidVariableValue(userInput, 'string')) {
 *   // TypeScript knows userInput is string
 *   console.log(userInput.toUpperCase());
 * }
 * ```
 */
export function isValidVariableValue<T extends VariableValueType>(
  value: unknown, 
  type: T
): value is VariableValue<T> {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    default:
      return false;
  }
}

/**
 * Create a strongly typed variable with compile-time validation.
 * Ensures type safety between variable type and default value.
 * 
 * @template T - The variable value type
 * @param id - Unique identifier for the variable
 * @param name - Human-readable name for the variable
 * @param type - Variable type constraint
 * @param defaultValue - Default value matching the type
 * @returns Typed variable with enhanced type safety
 * 
 * @example
 * ```tsx
 * const stringVar = createVariable('var1', 'userName', 'string', 'John Doe');
 * const numberVar = createVariable('var2', 'userAge', 'number', 25);
 * const boolVar = createVariable('var3', 'isActive', 'boolean', true);
 * 
 * // TypeScript ensures type safety:
 * // stringVar.defaultValue is string
 * // numberVar.defaultValue is number
 * // boolVar.defaultValue is boolean
 * ```
 */
export function createVariable<T extends VariableValueType>(
  id: string,
  name: string,
  type: T,
  defaultValue: VariableValue<T>
): Variable<T> {
  return { id, name, type, defaultValue };
}

/**
 * Create a typed component layer with compile-time prop validation.
 * Ensures props match the component's schema from the registry.
 * 
 * @template TRegistry - The component registry type
 * @template TKey - The component key in the registry
 * @param id - Unique identifier for the layer
 * @param type - Component type from the registry
 * @param props - Component props with type validation
 * @param children - Child layers or content
 * @param name - Optional human-readable name
 * @returns Typed component layer with enhanced type safety
 * 
 * @example
 * ```tsx
 * const buttonLayer = createTypedLayer(
 *   'btn1',
 *   'Button' as keyof typeof registry,
 *   {
 *     label: 'Save Changes',  // ✅ TypeScript validates
 *     variant: 'primary',     // ✅ Only valid enum values
 *     disabled: false         // ✅ Boolean validation
 *   },
 *   [],
 *   'Save Button'
 * );
 * ```
 */
export function createTypedLayer<
  TRegistry extends ComponentRegistry,
  TKey extends keyof TRegistry
>(
  id: string,
  type: TKey,
  props: ExtractComponentProps<TRegistry, TKey>,
  children: ComponentLayer[] | string = [],
  name?: string
): TypedComponentLayer<TRegistry, TKey> {
  return {
    id,
    name,
    type: type as string,
    props,
    children
  } as TypedComponentLayer<TRegistry, TKey>;
}

/**
 * Enhanced layer change handler with component registry type inference.
 * Provides compile-time validation and IntelliSense for layer callbacks.
 * 
 * @template TRegistry - The component registry type for type inference
 * 
 * @example
 * ```tsx
 * const handleChange: TypedLayerChangeHandler<typeof myRegistry> = (layers) => {
 *   layers.forEach(layer => {
 *     if (layer.type === 'Button') {
 *       // ✅ TypeScript knows layer.props is ButtonProps
 *       console.log(layer.props.variant);
 *       console.log(layer.props.label);
 *     }
 *   });
 * };
 * ```
 */
export type TypedLayerChangeHandler<
  TRegistry extends ComponentRegistry = ComponentRegistry
> = <T extends keyof TRegistry>(
  layers: TypedComponentLayer<TRegistry, T>[]
) => void;

/**
 * Enhanced variable change handler with variable collection type inference.
 * Provides compile-time validation for variable change callbacks.
 * 
 * @template TVariables - The variable collection type for type inference
 * 
 * @example
 * ```tsx
 * const handleVariableChange: TypedVariableChangeHandler<typeof variables> = (vars) => {
 *   vars.forEach(variable => {
 *     // TypeScript knows the exact type of each variable
 *     console.log(`${variable.name}: ${variable.defaultValue}`);
 *   });
 * };
 * ```
 */
export type TypedVariableChangeHandler<
  TVariables extends VariableCollection = VariableCollection
> = (variables: TVariables) => void;






