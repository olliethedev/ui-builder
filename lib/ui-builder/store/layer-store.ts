/* eslint-disable @typescript-eslint/no-explicit-any */
import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import { produce } from 'immer';
import { temporal } from 'zundo';
import isDeepEqual from 'fast-deep-equal';

import { visitLayer, addLayer, hasLayerChildren, findLayerRecursive, createId, countLayers, duplicateWithNewIdsAndName, findAllParentLayersRecursive, migrateV1ToV2, migrateV2ToV3 } from '@/lib/ui-builder/store/layer-utils';
import { getDefaultProps } from '@/lib/ui-builder/store/schema-utils';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import { ComponentLayer } from '@/components/ui/ui-builder/types';




const DEFAULT_PAGE_PROPS = {
  className: "p-4 flex flex-col gap-2",
};



export interface LayerStore {
  pages: ComponentLayer[];
  selectedLayerId: string | null;
  selectedPageId: string;
  initialize: (pages: ComponentLayer[], selectedPageId?: string, selectedLayerId?: string) => void;
  addComponentLayer: (layerType: string, parentId: string, parentPosition?: number) => void;
  addPageLayer: (pageId: string) => void;
  duplicateLayer: (layerId: string, parentId?: string) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, newProps: Record<string, any>, layerRest?: Partial<Omit<ComponentLayer, 'props'>>) => void;
  selectLayer: (layerId: string) => void;
  selectPage: (pageId: string) => void;
  findLayerById: (layerId: string | null) => ComponentLayer | undefined;
  findLayersForPageId: (pageId: string) => ComponentLayer[];
}

const store: StateCreator<LayerStore, [], []> = (set, get) => (
  {
    // Default to a single empty page
    pages: [
      {
        id: '1',
        type: 'div',
        name: 'Page 1',
        props: DEFAULT_PAGE_PROPS,
        children: [],
      }
    ],

    selectedLayerId: null,
    selectedPageId: '1',
    initialize: (pages: ComponentLayer[], selectedPageId?: string, selectedLayerId?: string) => {
      set({ pages, selectedPageId: selectedPageId || pages[0].id, selectedLayerId: selectedLayerId || null });
    },
    findLayerById: (layerId: string | null) => {
      const { selectedPageId, findLayersForPageId, pages } = get();
      if (!layerId) return undefined;
      if (layerId === selectedPageId) {
        return pages.find(page => page.id === selectedPageId);
      }
      const layers = findLayersForPageId(selectedPageId);
      if (!layers) return undefined;
      return findLayerRecursive(layers, layerId);
    },
    findLayersForPageId: (pageId: string) => {
      const { pages } = get();
      const page = pages.find(page => page.id === pageId);
      if(page && hasLayerChildren(page)) {
        return page?.children || [];
      }
      return  [];
    },

    addComponentLayer: (layerType: string, parentId: string, parentPosition?: number) => set(produce((state: LayerStore) => {
      const { registry } = useEditorStore.getState();
      const defaultProps = getDefaultProps(registry[layerType].schema);
      const defaultChildrenRaw = registry[layerType].defaultChildren;
      const defaultChildren = typeof defaultChildrenRaw === "string" ? defaultChildrenRaw : (defaultChildrenRaw?.map(child => duplicateWithNewIdsAndName(child, false)) || []);

      const initialProps = Object.entries(defaultProps).reduce((acc, [key, propDef]) => {
        if (key !== "children") {
          acc[key] = propDef;
        }
        return acc;
      }, {} as Record<string, any>);

      const newLayer: ComponentLayer = {
        id: createId(),
        type: layerType,
        name: layerType,
        props: initialProps,
        children: defaultChildren,
      };

      // Traverse and update the pages to add the new layer
      const updatedPages = addLayer(state.pages, newLayer, parentId, parentPosition);
      return {
        ...state,
        pages: updatedPages
      };
    })),

    addPageLayer: (pageName: string) => set(produce((state: LayerStore) => {
      const newPage: ComponentLayer = {
        id: createId(),
        type: 'div',
        name: pageName,
        props: DEFAULT_PAGE_PROPS,
        children: [],
      };
      return {
        pages: [...state.pages, newPage],
        selectedPageId: newPage.id,
        selectedLayerId: newPage.id,
      };
    })),

    duplicateLayer: (layerId: string) => set(produce((state: LayerStore) => {
      let layerToDuplicate: ComponentLayer | undefined;
      let parentId: string | undefined;
      let parentPosition: number | undefined;

      // Find the layer to duplicate
      state.pages.forEach((page) =>
        visitLayer(page, null, (layer, parent) => {
          if (layer.id === layerId) {
            layerToDuplicate = layer;
            parentId = parent?.id;
            if (parent && hasLayerChildren(parent)) {
              parentPosition = parent.children.indexOf(layer) + 1;
            }
          }
          return layer;
        })
      );
      if (!layerToDuplicate) {
        console.warn(`Layer with ID ${ layerId } not found.`);
        return;
      }

      const isNewLayerAPage = state.pages.some(page => page.id === layerId);

      const newLayer = duplicateWithNewIdsAndName(layerToDuplicate, !isNewLayerAPage);

      if (isNewLayerAPage) {
        return {
          ...state,
          pages: [...state.pages, newLayer],
          selectedPageId: newLayer.id,
        };
      }

      //else add it as a child of the parent

      const updatedPages = addLayer(state.pages, newLayer, parentId, parentPosition);

      // Insert the duplicated layer
      return {
        ...state,
        pages: updatedPages
      };
    })),

    removeLayer: (layerId: string) => set(produce((state: LayerStore) => {
      const { selectedLayerId, pages } = get();

      let newSelectedLayerId = selectedLayerId;

      const isPage = state.pages.some(page => page.id === layerId);
      if (isPage && pages.length > 1) {
        const newPages = state.pages.filter(page => page.id !== layerId);
        return {
          ...state,
          pages: newPages,
          selectedPageId: newPages[0].id,
        };
      }

      // Traverse and update the pages to remove the specified layer
      const updatedPages = pages.map((page) =>
        visitLayer(page, null, (layer) => {

          if (hasLayerChildren(layer)) {

            // Remove the layer by filtering it out from the children
            const updatedChildren = layer.children.filter((child) => child.id !== layerId);
            return { ...layer, children: updatedChildren };
          }

          return layer;
        })
      );

      if (selectedLayerId === layerId) {
        // If the removed layer was selected, deselect it 
        newSelectedLayerId = null;
      }
      return {
        ...state,
        selectedLayerId: newSelectedLayerId,
        pages: updatedPages,
      };
    })),

    updateLayer: (layerId: string, newProps: ComponentLayer['props'], layerRest?: Partial<Omit<ComponentLayer, 'props'>>) => set(
      produce((state: LayerStore) => {
        const { selectedPageId, findLayersForPageId, pages } = get();

        const pageExists = pages.some(page => page.id === selectedPageId);
        if (!pageExists) {
          console.warn(`No layers found for page ID: ${ selectedPageId }`);
          return state;
        }

        if (layerId === selectedPageId) {
          const updatedPages = pages.map(page =>
            page.id === selectedPageId
              ? { ...page, props: { ...page.props, ...newProps }, ...(layerRest || {}) }
              : page
          );
          return { ...state, pages: updatedPages };
        }

        const layers = findLayersForPageId(selectedPageId);


        // Visitor function to update layer properties
        const visitor = (layer: ComponentLayer): ComponentLayer => {
          if (layer.id === layerId) {
            return {
              ...layer,
              ...(layerRest || {}),
              props: { ...layer.props, ...newProps },
            } as ComponentLayer
          }
          return layer;
        };

        // Apply the visitor to update layers
        const updatedLayers = layers.map(layer => visitLayer(layer, null, visitor));

        const isUnchanged = updatedLayers.every((layer, index) => layer === layers[index]);

        if (isUnchanged) {
          console.warn(`Layer with ID ${ layerId } was not found.`);
          return state;
        }

        // Update the state with the modified layers
        const updatedPages = state.pages.map(page =>
          page.id === selectedPageId ? { ...page, children: updatedLayers } : page
        );

        return { ...state, pages: updatedPages };
      })
    ),


    selectLayer: (layerId: string) => set(produce((state: LayerStore) => {
      const { selectedPageId, findLayersForPageId } = get();
      const layers = findLayersForPageId(selectedPageId);
      if(selectedPageId === layerId) {
        return {
          selectedLayerId: layerId
        };
      }
      if (!layers) return state;
      const layer = findLayerRecursive(layers, layerId);
      if (layer) {
        return {
          selectedLayerId: layer.id
        };
      }
      return {};
    })),

    selectPage: (pageId: string) => set(produce((state: LayerStore) => {
      const page = state.pages.find(page => page.id === pageId);
      if (!page) return state;
      return {
        selectedPageId: pageId
      };
    })),
  }
)

const useLayerStore = create(persist(temporal<LayerStore>(store,
  {
    equality: (pastState, currentState) =>
      isDeepEqual(pastState, currentState),
  }
), {
  name: "layer-store",
  version: 3,
  storage: createJSONStorage(() => localStorage),
  migrate: (persistedState: unknown, version: number) => {
    /* istanbul ignore if*/
    if (version === 1) {
      return migrateV1ToV2(persistedState as LayerStore);
    } else if (version === 2) {
      return migrateV2ToV3(persistedState as LayerStore);
    }
    return persistedState;
  }
}))

export { useLayerStore, countLayers, findAllParentLayersRecursive };
