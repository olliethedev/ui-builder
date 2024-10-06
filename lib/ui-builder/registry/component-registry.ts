/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType as ReactComponentType } from 'react';
import { ZodObject } from 'zod';
import { primitiveComponentDefinitions } from '@/lib/ui-builder/registry/primitive-component-definitions';
import { complexComponentDefinitions } from '@/lib/ui-builder/registry/complex-component-definitions';

// import { OtherComponentDefinitions } from '@/components/ui/generated-schemas';


export interface RegistryEntry<T extends ReactComponentType<any>> {
  component?: T;
  schema: ZodObject<any>;
  from?: string;
}

export type ComponentRegistry = Record<string, RegistryEntry<ReactComponentType<any>>>;

export type PrimitiveComponentRegistry = Record<string, RegistryEntry<ReactComponentType<any>>>;
export type CustomComponentRegistry = Record<string, RegistryEntry<ReactComponentType<any>>>;


export const componentRegistry: ComponentRegistry = {
  // ...OtherComponentDefinitions
  ...complexComponentDefinitions,
  ...primitiveComponentDefinitions
} as const;



