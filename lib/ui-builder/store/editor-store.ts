/* eslint-disable @typescript-eslint/no-explicit-any */
import { create, StateCreator } from 'zustand';
import { ComponentType as ReactComponentType } from "react";
import { ZodObject } from "zod";
import { ComponentLayer, ComponentRegistry } from '@/components/ui/ui-builder/types';
import { FieldConfigItem } from '@/components/ui/auto-form/types';

export interface RegistryEntry<T extends ReactComponentType<any>> {
    component?: T;
    schema: ZodObject<any>;
    from?: string;
    defaultChildren?: (ComponentLayer)[] | string;
    fieldOverrides?: Record<string, FieldConfigFunction>;
}

export type FieldConfigFunction = (layer: ComponentLayer) => FieldConfigItem;

export interface EditorStore {
    previewMode: 'mobile' | 'tablet' | 'desktop' | 'responsive';
    setPreviewMode: (mode: 'mobile' | 'tablet' | 'desktop' | 'responsive') => void;

    registry: ComponentRegistry;

    initializeRegistry: (registry: ComponentRegistry) => void;
    getComponentDefinition: (type: string) => RegistryEntry<ReactComponentType<any>> | undefined;
}

const store: StateCreator<EditorStore, [], []> = (set, get) => ({
    previewMode: 'responsive',
    setPreviewMode: (mode) => set({ previewMode: mode }),

    registry: {},

    initializeRegistry: (registry) => {
        set({ registry });
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