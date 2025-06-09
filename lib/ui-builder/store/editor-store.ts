/* eslint-disable @typescript-eslint/no-explicit-any */
import { create, StateCreator } from 'zustand';
import { ComponentType as ReactComponentType } from "react";
import { RegistryEntry, ComponentRegistry } from '@/components/ui/ui-builder/types';

export interface EditorStore {
    previewMode: 'mobile' | 'tablet' | 'desktop' | 'responsive';
    setPreviewMode: (mode: 'mobile' | 'tablet' | 'desktop' | 'responsive') => void;

    registry: ComponentRegistry;

    initialize: (registry: ComponentRegistry, persistLayerStoreConfig: boolean) => void;
    getComponentDefinition: (type: string) => RegistryEntry | undefined;

    persistLayerStoreConfig: boolean;
    setPersistLayerStoreConfig: (shouldPersist: boolean) => void;

    // Revision counter to track state changes for form revalidation
    revisionCounter: number;
    incrementRevision: () => void;
}

const store: StateCreator<EditorStore, [], []> = (set, get) => ({
    previewMode: 'responsive',
    setPreviewMode: (mode) => set({ previewMode: mode }),

    registry: {},

    initialize: (registry, persistLayerStoreConfig) => {
        set(state => ({ ...state, registry, persistLayerStoreConfig }));
    },
    getComponentDefinition: (type: string) => {
        const { registry } = get();
        if (!registry) {
            console.warn("Registry accessed via editor store before initialization.");
            return undefined;
        }
        return registry[type];
    },

    persistLayerStoreConfig: true,
    setPersistLayerStoreConfig: (shouldPersist) => set({ persistLayerStoreConfig: shouldPersist }),

    revisionCounter: 0,
    incrementRevision: () => set(state => ({ revisionCounter: state.revisionCounter + 1 })),
});

export const useEditorStore = create<EditorStore>()(store);