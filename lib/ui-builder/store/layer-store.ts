/* eslint-disable @typescript-eslint/no-explicit-any */
import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import { produce } from 'immer';
import { temporal } from 'zundo';
import isDeepEqual from 'fast-deep-equal';

import { visitLayer, addLayer, hasChildren, isTextLayer, isPageLayer, findLayerRecursive, createId, countLayers } from '@/lib/ui-builder/store/layer-utils';
import { getDefaultProps } from '@/lib/ui-builder/store/schema-utils';

import { componentRegistry } from '@/lib/ui-builder/registry/component-registry';


const DEFAULT_PAGE_PROPS = {
  className: "p-4 flex flex-col gap-2",
};

export type LayerType = keyof typeof componentRegistry | '_text_';

export type Layer =
  | {
    id: string;
    name?: string;
    type: keyof typeof componentRegistry;
    props: Record<string, any>;
    children: Layer[];
  }
  | TextLayer
  | PageLayer;

export type ComponentLayer = Exclude<Layer, TextLayer>;

export type TextLayer = {
  id: string;
  name?: string;
  type: '_text_';
  props: Record<string, any>;
  text: string;
  textType: 'text' | 'markdown';
};

export type PageLayer = {
  id: string;
  name?: string;
  type: '_page_';
  props: Record<string, any>;
  children: Layer[];
}

interface LayerStore {
  pages: PageLayer[];
  selectedLayerId: string | null;
  selectedPageId: string;
  initialize: (pages: PageLayer[]) => void;
  addComponentLayer: (layerType: keyof typeof componentRegistry, parentId: string, parentPosition?: number) => void;
  addTextLayer: (text: string, textType: 'text' | 'markdown', parentId: string, parentPosition?: number) => void;
  addPageLayer: (pageId: string) => void;
  duplicateLayer: (layerId: string, parentId?: string) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, newProps: Record<string, any>, layerRest?: Partial<Omit<Layer, 'props'>>) => void;
  selectLayer: (layerId: string) => void;
  selectPage: (pageId: string) => void;
  findLayerById: (layerId: string | null) => Layer | undefined;
  findLayersForPageId: (pageId: string) => Layer[];
}

const store: StateCreator<LayerStore, [], []> = (set, get) => (
  {
    // Default to a single empty page
    pages: [
      {
        id: '1',
        type: '_page_',
        name: 'Page 1',
        props: DEFAULT_PAGE_PROPS,
        children: [],
      }
    ],

    selectedLayerId: null,
    selectedPageId: '1',
    initialize: (pages: PageLayer[]) => {
      set({ pages, selectedPageId: pages[0].id });
      console.log("Store initialized with", { pages });
    },
    findLayerById: (layerId: string | null) => {
      const { selectedPageId, findLayersForPageId, pages } = get();
      if (!layerId || !selectedPageId) return undefined;
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
      return page?.children || [];
    },

    addComponentLayer: (layerType: keyof typeof componentRegistry, parentId: string, parentPosition?: number) => set(produce((state: LayerStore) => {
      const defaultProps = getDefaultProps(componentRegistry[layerType].schema);

      const initialProps = Object.entries(defaultProps).reduce((acc, [key, propDef]) => {
        if (key !== "children") {
          acc[key] = propDef;
        }
        return acc;
      }, {} as Record<string, any>);

      const newLayer: Layer = {
        id: createId(),
        type: layerType,
        name: layerType,
        props: initialProps,
        children: [],
      };

      // Traverse and update the pages to add the new layer
      const updatedPages = addLayer(state.pages, newLayer, parentId, parentPosition);
      return {
        ...state,
        pages: updatedPages
      };
    })),

    addTextLayer: (text: string, textType: 'text' | 'markdown', parentId: string, parentPosition?: number) => set(produce((state: LayerStore) => {
      const newLayer: TextLayer = {
        id: createId(),
        type: '_text_',
        name: "Text",
        text,
        textType,
        props: {},
      };

      // Traverse and update the pages to add the new text layer
      const updatedPages = addLayer(state.pages, newLayer, parentId, parentPosition);
      return {
        ...state,
        pages: updatedPages
      };
    })),

    addPageLayer: (pageName: string) => set(produce((state: LayerStore) => {
      const newPage: PageLayer = {
        id: createId(),
        type: '_page_',
        name: pageName,
        props: DEFAULT_PAGE_PROPS,
        children: [],
      };
      return {
        pages: [...state.pages, newPage],
        selectedPageId: newPage.id,
      };
    })),

    duplicateLayer: (layerId: string) => set(produce((state: LayerStore) => {
      let layerToDuplicate: Layer | undefined;
      let parentId: string | undefined;
      let parentPosition: number | undefined;

      // Find the layer to duplicate
      state.pages.forEach((page) =>
        visitLayer(page, null, (layer, parent) => {
          if (layer.id === layerId) {
            layerToDuplicate = layer;
            parentId = parent?.id;
            if (parent && hasChildren(parent)) {
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

      // Create a deep copy of the layer with new IDs
      const duplicateWithNewIdsAndName = (layer: Layer, addCopySuffix: boolean = true): Layer => {
        const newLayer: Layer = { ...layer, id: createId() };
        if (layer.name) {
          newLayer.name = `${ layer.name }${ addCopySuffix ? ' (Copy)' : ''}`;
        }
        if (hasChildren(newLayer) && hasChildren(layer)) {
          newLayer.children = layer.children.map(child => duplicateWithNewIdsAndName(child, addCopySuffix));
        }
        return newLayer;
      };

      const isNewLayerAPage = isPageLayer(layerToDuplicate);

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
      const { selectedLayerId, pages, findLayerById } = get();

      let newSelectedLayerId = selectedLayerId;

      if (isPageLayer(findLayerById(layerId) as Layer) && pages.length > 1) {
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

          if (hasChildren(layer)) {

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

    updateLayer: (layerId: string, newProps: Layer['props'], layerRest?: Partial<Omit<Layer, 'props'>>) => set(
      produce((state: LayerStore) => {
        const { selectedPageId, findLayersForPageId, pages } = get();

        if (!selectedPageId) {
          console.warn("No page is currently selected.");
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
        if (!layers) {
          console.warn(`No layers found for page ID: ${ selectedPageId }`);
          return state;
        }

        // Visitor function to update layer properties
        const visitor = (layer: Layer): Layer => {
          if (layer.id === layerId) {
            if (isTextLayer(layer)) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { props, ...rest } = newProps;
              return {
                ...layer,
                props: { ...layer.props, ...rest },
                ...(layerRest || {}),
              } as TextLayer;
            } else {
              return {
                ...layer,
                ...(layerRest || {}),
                props: { ...layer.props, ...newProps },
              } as ComponentLayer;
            }
          }
          return layer;
        };

        // Apply the visitor to update layers
        const updatedLayers = layers.map(layer => visitLayer(layer, null, visitor));

        if (updatedLayers === layers) {
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
      if (!selectedPageId) return state;
      const layers = findLayersForPageId(selectedPageId);
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
    // onSave: (pastState: LayerStore, currentState: LayerStore) => {
    //   console.log("Temporal Store onSave", { previousState: pastState, currentState });
    // },
    equality: (pastState, currentState) =>
      isDeepEqual(pastState, currentState),
  }
), {
  name: "layer-store",
  version: 1,
  storage: createJSONStorage(() => localStorage),
}))

export { useLayerStore, componentRegistry, isTextLayer, isPageLayer, countLayers };
