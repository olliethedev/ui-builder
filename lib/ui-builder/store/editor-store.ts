/* eslint-disable @typescript-eslint/no-explicit-any */
import { create, StateCreator } from 'zustand';
import { ComponentType as ReactComponentType, ReactNode } from "react";
import { ZodObject } from "zod";
import { ComponentLayer } from '@/lib/ui-builder/store/layer-store';
import { FieldConfigItem } from '@/components/ui/auto-form/types';

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

export interface EditorStore {
    previewMode: 'mobile' | 'tablet' | 'desktop' | 'responsive';
    setPreviewMode: (mode: 'mobile' | 'tablet' | 'desktop' | 'responsive') => void;

    registry: ComponentRegistry;
    pagePropsForm: ReactNode | null;

    initializeRegistry: (registry: ComponentRegistry, pagePropsForm: ReactNode) => void;
    getComponentDefinition: (type: string) => RegistryEntry<ReactComponentType<any>> | undefined;
}

const store: StateCreator<EditorStore, [], []> = (set, get) => ({
    previewMode: 'responsive',
    setPreviewMode: (mode) => set({ previewMode: mode }),

    registry: {},
    pagePropsForm: null,

    initializeRegistry: (registry, pagePropsForm) => {
        set({ registry, pagePropsForm });
    },
    getComponentDefinition: (type: string) => {
        const { registry } = get();
        if (!registry) {
            console.warn("Registry accessed via editor store before initialization.");
            return undefined;
        }
        return registry[type];
    }



});

export const useEditorStore = create<EditorStore>()(store);