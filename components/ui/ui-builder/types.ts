/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodObject, ZodSchema } from "zod";
import { ComponentType as ReactComponentType, ReactNode } from 'react';
import {
    FieldConfigItem,
  } from "@/components/ui/auto-form/types";

export type {
    AutoFormInputComponentProps,
    FieldConfigItem,
  } from "@/components/ui/auto-form/types";

// Enhanced prop value types that can accommodate React props, variables, and common data types
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

// Generic component props that allow for flexible but safer typing
export type ComponentProps<TProps extends Record<string, PropValue> = Record<string, PropValue>> = TProps;

// Enhanced ComponentLayer with generic prop typing
export interface ComponentLayer<TProps extends Record<string, PropValue> = Record<string, PropValue>> {
    id: string;
    name?: string;
    type: string;
    props: ComponentProps<TProps>;
    children: ComponentLayer[] | string;
}

// Variable value types - more specific than before
export type VariableValueType = 'string' | 'number' | 'boolean';

// Type-safe variable values based on their type
export type VariableValue<T extends VariableValueType> = 
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  never;

// Enhanced Variable interface with generic typing
export interface Variable<T extends VariableValueType = VariableValueType> {
  id: string;
  name: string;
  type: T;
  defaultValue: VariableValue<T>;
}

// Variable reference marker for props
export interface VariableReference {
  __variableRef: string;
}

// Default variable binding configuration
export interface DefaultVariableBinding {
  propName: string;
  variableId: string;
  immutable?: boolean;
}

// Enhanced registry entry with better component typing
export interface RegistryEntry<T extends ReactComponentType<any>> {
  component?: T;
  schema: ZodObject<any> | ZodSchema<any>;
  from?: string;
  isFromDefaultExport?: boolean;
  defaultChildren?: ComponentLayer[] | string;
  defaultVariableBindings?: DefaultVariableBinding[];
  fieldOverrides?: Record<string, FieldConfigFunction>;
}

// Improved field config function type
export type FieldConfigFunction = (layer: ComponentLayer, allowVariableBinding?: boolean) => FieldConfigItem;

// Enhanced ComponentRegistry with better typing
export type ComponentRegistry = Record<string, RegistryEntry<ReactComponentType<any>>>;

// Type-safe layer change handler with registry awareness
export type LayerChangeHandler<TRegistry extends ComponentRegistry = ComponentRegistry> = 
  (layers: Array<ComponentLayer & {
    type: keyof TRegistry;
  }>) => void;

// Type-safe variable change handler  
export type VariableChangeHandler = (variables: Variable[]) => void;

// Helper types for extracting component props from registry
export type ExtractComponentProps<
  TRegistry extends ComponentRegistry,
  TComponentName extends keyof TRegistry
> = TRegistry[TComponentName] extends RegistryEntry<ReactComponentType<infer TProps>>
  ? TProps
  : never;

// Type-safe layer change handler with registry awareness
export type TypedLayerChangeHandler<TRegistry extends ComponentRegistry> = 
  (layers: Array<ComponentLayer & {
    type: keyof TRegistry;
  }>) => void;

// Utility function types for creating variables
export type CreateVariable = <T extends VariableValueType>(
  id: string,
  name: string,
  type: T,
  defaultValue: VariableValue<T>
) => Variable<T>;

// Utility to check if a value is a variable reference
export function isVariableReference(value: any): value is VariableReference {
  return typeof value === 'object' && value !== null && '__variableRef' in value;
}

// Type-safe variable creation helper
export const createVariable: CreateVariable = <T extends VariableValueType>(
  id: string,
  name: string,
  type: T,
  defaultValue: VariableValue<T>
): Variable<T> => ({
  id,
  name,
  type,
  defaultValue,
});






