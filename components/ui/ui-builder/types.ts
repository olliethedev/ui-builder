/* eslint-disable @typescript-eslint/no-explicit-any */
import { RegistryEntry } from '@/lib/ui-builder/store/editor-store';
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

export type ComponentRegistry = Record<
    string, RegistryEntry<ReactComponentType<any>>
>;

export type FieldConfigFunction = (layer: ComponentLayer) => FieldConfigItem;





