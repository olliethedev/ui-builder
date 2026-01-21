 
import { create, type StateCreator } from 'zustand';
import { type ComponentType as ReactComponentType } from "react";
import type { RegistryEntry, ComponentRegistry, BlockRegistry, FunctionRegistry, FunctionDefinition } from '@/components/ui/ui-builder/types';



export interface EditorStore {
    previewMode: 'mobile' | 'tablet' | 'desktop' | 'responsive';
    setPreviewMode: (mode: 'mobile' | 'tablet' | 'desktop' | 'responsive') => void;

    registry: ComponentRegistry;
    blocks: BlockRegistry | undefined;
    functionRegistry: FunctionRegistry | undefined;

    initialize: (registry: ComponentRegistry, persistLayerStoreConfig: boolean, allowPagesCreation: boolean, allowPagesDeletion: boolean, allowVariableEditing: boolean, blocks?: BlockRegistry, functionRegistry?: FunctionRegistry) => void;
    getComponentDefinition: (type: string) => RegistryEntry<ReactComponentType<any>> | undefined;
    getFunctionDefinition: (id: string) => FunctionDefinition | undefined;

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

    // Panel visibility state
    showLeftPanel: boolean;
    setShowLeftPanel: (show: boolean) => void;
    showRightPanel: boolean;
    setShowRightPanel: (show: boolean) => void;
}

const store: StateCreator<EditorStore, [], []> = (set, get) => ({
    previewMode: 'responsive',
    setPreviewMode: (mode) => set({ previewMode: mode }),

    registry: {},
    blocks: undefined,
    functionRegistry: undefined,

    initialize: (registry, persistLayerStoreConfig, allowPagesCreation, allowPagesDeletion, allowVariableEditing, blocks, functionRegistry) => {
        set(state => ({ ...state, registry, persistLayerStoreConfig, allowPagesCreation, allowPagesDeletion, allowVariableEditing, blocks, functionRegistry }));
    },
    getComponentDefinition: (type: string) => {
        const { registry } = get();
        if (!registry) {
            console.warn("Registry accessed via editor store before initialization.");
            return undefined;
        }
        return registry[type];
    },
    getFunctionDefinition: (id: string) => {
        const { functionRegistry } = get();
        if (!functionRegistry) {
            return undefined;
        }
        return functionRegistry[id];
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

    // Panel visibility state
    showLeftPanel: true,
    setShowLeftPanel: (show) => set({ showLeftPanel: show }),
    showRightPanel: true,
    setShowRightPanel: (show) => set({ showRightPanel: show }),
});

export const useEditorStore = create<EditorStore>()(store);