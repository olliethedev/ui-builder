/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodObject, ZodRawShape } from "zod";
import { ComponentType as ReactComponentType, ReactNode } from 'react';
import {
    FieldConfigItem,
  } from "@/components/ui/auto-form/types";

export type {
    AutoFormInputComponentProps,
    FieldConfigItem,
  } from "@/components/ui/auto-form/types";

// More specific type for variable values based on their type
export type VariableValue = string | number | boolean;

// Type for variable reference objects
export interface VariableReference {
  __variableRef: string;
}

// Union type for prop values that can be primitives, variable references, or objects
export type PropValue = 
  | VariableValue
  | VariableReference
  | Record<string, unknown>
  | PropValue[]
  | ReactNode
  | null
  | undefined;

// More strongly typed props object
export type ComponentProps = Record<string, PropValue>;

export type ComponentLayer = {
    id: string;
    name?: string;
    type: string;
    props: ComponentProps;
    children: ComponentLayer[] | string;
};

export interface Variable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean';
  defaultValue: VariableValue;
}

// More specific registry entry with better generic constraints
export interface RegistryEntry<T extends ReactComponentType<any> = ReactComponentType<any>> {
  component?: T;
  schema: ZodObject<ZodRawShape>;
  from?: string;
  isFromDefaultExport?: boolean;
  defaultChildren?: ComponentLayer[] | string;
  fieldOverrides?: Record<string, FieldConfigFunction>;
}

export type FieldConfigFunction = (layer: ComponentLayer, allowVariableBinding?: boolean) => FieldConfigItem;

export type ComponentRegistry = Record<string, RegistryEntry>;

// Type guards for better runtime type checking
export function isVariableReference(value: unknown): value is VariableReference {
  return typeof value === 'object' && value !== null && '__variableRef' in value;
}

export function isValidVariableValue(value: unknown, type: Variable['type']): value is VariableValue {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    default:
      return false;
  }
}

// Helper types for callbacks
export type LayerChangeHandler = (layers: ComponentLayer[]) => void;
export type VariableChangeHandler = (variables: Variable[]) => void;
export type LayerSelectHandler = (layerId: string) => void;






