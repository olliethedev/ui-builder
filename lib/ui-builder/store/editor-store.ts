/* eslint-disable @typescript-eslint/no-explicit-any */
import { create, StateCreator } from 'zustand';
import { ComponentType as ReactComponentType } from "react";
import { RegistryEntry, ComponentRegistry } from '@/components/ui/ui-builder/types';



export interface EditorStore {
    previewMode: 'mobile' | 'tablet' | 'desktop' | 'responsive';
    setPreviewMode: (mode: 'mobile' | 'tablet' | 'desktop' | 'responsive') => void;

    registry: ComponentRegistry;

    initialize: (registry: ComponentRegistry, persistLayerStoreConfig: boolean, allowPagesCreation: boolean, allowPagesDeletion: boolean, allowVariableEditing: boolean) => void;
    getComponentDefinition: (type: string) => RegistryEntry<ReactComponentType<any>> | undefined;

    persistLayerStoreConfig: boolean;
    setPersistLayerStoreConfig: (shouldPersist: boolean) => void;

    // Revision counter to track state changes for form revalidation
    revisionCounter: number;
    incrementRevision: () => void;

    allowPagesCreation: boolean;
    setAllowPagesCreation: (allow: boolean) => void;
    allowPagesDeletion: boolean;
    setAllowPagesDeletion: (allow: boolean) => void;
    allowVariableEditing: boolean;
    setAllowVariableEditing: (allow: boolean) => void;
}

const store: StateCreator<EditorStore, [], []> = (set, get) => ({
    previewMode: 'responsive',
    setPreviewMode: (mode) => set({ previewMode: mode }),

    registry: {},

    initialize: (registry, persistLayerStoreConfig, allowPagesCreation, allowPagesDeletion, allowVariableEditing) => {
        set(state => ({ ...state, registry, persistLayerStoreConfig, allowPagesCreation, allowPagesDeletion, allowVariableEditing }));
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

    allowPagesCreation: true,
    setAllowPagesCreation: (allow) => set({ allowPagesCreation: allow }),
    allowPagesDeletion: true,
    setAllowPagesDeletion: (allow) => set({ allowPagesDeletion: allow }),
    allowVariableEditing: true,
    setAllowVariableEditing: (allow) => set({ allowVariableEditing: allow }),
});

export const useEditorStore = create<EditorStore>()(store);