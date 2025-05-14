/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodObject } from "zod";
import { ComponentType as ReactComponentType } from 'react';
import {
    FieldConfigItem,
  } from "@/components/ui/auto-form/types";


export type {
    AutoFormInputComponentProps,
    FieldConfigItem,
  } from "@/components/ui/auto-form/types";

export type ComponentLayer = {
    id: string;
    name?: string;
    type: string;
    props: Record<string, any>;
    children: ComponentLayer[] | string;
};

export interface RegistryEntry<T extends ReactComponentType<any>> {
  component?: T;
  schema: ZodObject<any>;
  from?: string;
  isFromDefaultExport?: boolean;
  defaultChildren?: (ComponentLayer)[] | string;
  fieldOverrides?: Record<string, FieldConfigFunction>;
}

export type FieldConfigFunction = (layer: ComponentLayer) => FieldConfigItem;

export type ComponentRegistry = Record<
    string, RegistryEntry<ReactComponentType<any>>
>;






