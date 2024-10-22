/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType as ReactComponentType } from "react";
import { ZodObject } from "zod";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { ComponentLayer } from "@/lib/ui-builder/store/layer-store";
import { FieldConfigItem } from "@/components/ui/auto-form/types";

// import { OtherComponentDefinitions } from '@/components/ui/generated-schemas';

export interface RegistryEntry<T extends ReactComponentType<any>> {
  component?: T;
  schema: ZodObject<any>;
  from?: string;
  defaultChildren?: (ComponentLayer)[] | string;
  fieldOverrides?: Record<string, FieldConfigFunction>;
}

export type ComponentRegistry = Record<
  string,
  RegistryEntry<ReactComponentType<any>>
>;

export type FieldConfigFunction = (layer: ComponentLayer) => FieldConfigItem;


export const componentRegistry: ComponentRegistry = {
  // ...OtherComponentDefinitions
  ...complexComponentDefinitions,
  ...primitiveComponentDefinitions,
} as const;

export const generateFieldOverrides = (layer: ComponentLayer): Record<string, FieldConfigItem> => {
  const componentDefinition = componentRegistry[layer.type];
  if (!componentDefinition) {
    return {};
  }
  
  if(componentDefinition.fieldOverrides) {
    const fieldOverrides: Record<string, FieldConfigItem> = {};
    Object.keys(componentDefinition.fieldOverrides).forEach(key => {
      const override = componentDefinition.fieldOverrides?.[key];
      if(override) {
        fieldOverrides[key] = override(layer);
      }
    });
    return fieldOverrides;
  }
  return {};
  
}



