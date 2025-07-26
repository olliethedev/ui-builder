/* eslint-disable @typescript-eslint/no-explicit-any */
import { create, StateCreator } from 'zustand';
import { ComponentType as ReactComponentType } from "react";
import { RegistryEntry, ComponentRegistry } from '@/components/ui/ui-builder/types';

export interface CustomComponent {
    id: string;
    name: string;
    code: string;
    schema: string;
    createdAt: Date;
}

export interface EditorStore {
    previewMode: 'mobile' | 'tablet' | 'desktop' | 'responsive';
    setPreviewMode: (mode: 'mobile' | 'tablet' | 'desktop' | 'responsive') => void;

    registry: ComponentRegistry;
    customComponents: CustomComponent[];

    initialize: (registry: ComponentRegistry, persistLayerStoreConfig: boolean, allowPagesCreation: boolean, allowPagesDeletion: boolean, allowVariableEditing: boolean) => void;
    getComponentDefinition: (type: string) => RegistryEntry<ReactComponentType<any>> | undefined;
    addCustomComponent: (component: CustomComponent, registryEntry: RegistryEntry<ReactComponentType<any>>) => void;
    removeCustomComponent: (componentId: string) => void;
    updateCustomComponent: (componentId: string, component: CustomComponent, registryEntry: RegistryEntry<ReactComponentType<any>>) => void;

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
    customComponents: [],

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
    addCustomComponent: (component: CustomComponent, registryEntry: RegistryEntry<ReactComponentType<any>>) => {
        set(state => ({
            customComponents: [...state.customComponents, component],
            registry: {
                ...state.registry,
                [component.name]: registryEntry
            }
        }));
    },
    removeCustomComponent: (componentId: string) => {
        set(state => {
            const componentToRemove = state.customComponents.find(c => c.id === componentId);
            if (!componentToRemove) return state;
            
            const newRegistry = { ...state.registry };
            delete newRegistry[componentToRemove.name];
            
            return {
                customComponents: state.customComponents.filter(c => c.id !== componentId),
                registry: newRegistry
            };
        });
    },
    updateCustomComponent: (componentId: string, component: CustomComponent, registryEntry: RegistryEntry<ReactComponentType<any>>) => {
        set(state => {
            const oldComponent = state.customComponents.find(c => c.id === componentId);
            if (!oldComponent) return state;
            
            const newRegistry = { ...state.registry };
            // Remove old component name if it changed
            if (oldComponent.name !== component.name) {
                delete newRegistry[oldComponent.name];
            }
            newRegistry[component.name] = registryEntry;
            
            return {
                customComponents: state.customComponents.map(c => 
                    c.id === componentId ? component : c
                ),
                registry: newRegistry
            };
        });
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