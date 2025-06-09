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

// More permissive prop value type that supports all existing use cases
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

// Type for variable reference objects
export interface VariableReference {
  __variableRef: string;
}

// Generic component props that can be any valid props
export type ComponentProps<T = Record<string, PropValue>> = T;

// Basic variable value types
export type VariableValueType = 'string' | 'number' | 'boolean' | 'object' | 'array';

// Variable value based on type
export type VariableValue<T extends VariableValueType = VariableValueType> = 
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'object' ? Record<string, unknown> :
  T extends 'array' ? unknown[] :
  unknown;

// Generic variable interface with type inference
export interface Variable<T extends VariableValueType = VariableValueType> {
  id: string;
  name: string;
  type: T;
  defaultValue: VariableValue<T>;
}

// Extract prop types from Zod schema
export type InferPropsFromSchema<T extends ZodObject<ZodRawShape>> = ZodInfer<T>;

// Generic component layer with better children typing
export interface ComponentLayer<
  TProps extends Record<string, PropValue> = Record<string, PropValue>
> {
  id: string;
  name?: string;
  type: string;
  props: ComponentProps<TProps>;
  children: ComponentLayer[] | string;  // Keep existing type structure
}

// Enhanced registry entry with better generics
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

// Generic component registry with type mapping
export type ComponentRegistry = Record<string, RegistryEntry>;

// Enhanced field config function with generic layer
export type FieldConfigFunction = <T extends ComponentLayer>(
  layer: T, 
  allowVariableBinding?: boolean
) => FieldConfigItem;

// Type-safe callback handlers with inference
export type LayerChangeHandler<T extends ComponentLayer[] = ComponentLayer[]> = (layers: T) => void;

export type VariableChangeHandler<T extends Variable[] = Variable[]> = (variables: T) => void;

export type LayerSelectHandler = (layerId: string) => void;

// Helper type to extract component props from registry
export type ExtractComponentProps<
  TRegistry extends ComponentRegistry,
  TKey extends keyof TRegistry
> = TRegistry[TKey] extends RegistryEntry<any, infer TSchema> 
  ? TSchema extends ZodObject<ZodRawShape>
    ? InferPropsFromSchema<TSchema>
    : Record<string, PropValue>
  : Record<string, PropValue>;

// Helper type to create typed layer for specific component
export type TypedComponentLayer<
  TRegistry extends ComponentRegistry,
  TKey extends keyof TRegistry
> = ComponentLayer<ExtractComponentProps<TRegistry, TKey>>;

// Variable collection with type safety - supports both arrays and records
export type VariableCollection<T = Variable[]> = T extends Variable[] 
  ? T 
  : T extends Record<string, Variable> 
  ? T 
  : Variable[];

// Extract variable values with proper typing - handle both arrays and records
export type ExtractVariableValues<T extends VariableCollection> = 
  T extends Variable[] 
    ? { [K in keyof T]: T[K] extends Variable<infer VType> ? VariableValue<VType> : unknown }
    : T extends Record<string, Variable>
    ? { [K in keyof T]: T[K] extends Variable<infer VType> ? VariableValue<VType> : unknown }
    : Record<string, unknown>;

// Type guards for better runtime type checking
export function isVariableReference(value: unknown): value is VariableReference {
  return typeof value === 'object' && value !== null && '__variableRef' in value;
}

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

// Helper to create typed variable
export function createVariable<T extends VariableValueType>(
  id: string,
  name: string,
  type: T,
  defaultValue: VariableValue<T>
): Variable<T> {
  return { id, name, type, defaultValue };
}

// Helper to create typed layer
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

// Enhanced callback types with better inference
export type TypedLayerChangeHandler<
  TRegistry extends ComponentRegistry = ComponentRegistry
> = <T extends keyof TRegistry>(
  layers: TypedComponentLayer<TRegistry, T>[]
) => void;

export type TypedVariableChangeHandler<
  TVariables extends VariableCollection = VariableCollection
> = (variables: TVariables) => void;






