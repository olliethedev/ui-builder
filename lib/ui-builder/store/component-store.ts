import { ComponentType as ReactComponentType } from 'react';
import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import { produce } from 'immer';
import { temporal } from 'zundo';
import isDeepEqual from 'fast-deep-equal';
import { z, ZodObject } from 'zod';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transactions } from '@/components/ui/transactions';
import { Flexbox } from '@/components/ui/ui-builder/flexbox';

import { visitLayer, addLayer, hasChildren, isTextLayer, isPageLayer, findLayerRecursive, createId, countLayers } from '@/lib/ui-builder/store/layer-utils';
import { patchSchema, getDefaultProps } from '@/lib/ui-builder/store/schema-utils';
import ReactFunctionComplexTypes from '@/components/ui/ReactFunctionComplexTypes';
import { CodePanel } from '@/components/ui/ui-builder/code-panel';
// import { ComponentDefinitions } from '@/components/ui/generated-schemas';

export const DEFAULT_PAGE_PROPS = {
  className: "p-4 flex flex-col gap-2",
};

// Component registry with Zod schemas or add manually like:
// Button: {
//   component: Button,
//   schema: z.object({
//     children: z.array(z.object({
//       type: z.enum(['Button']),
//       props: z.object({
//         children: z.string(),
//         variant: z.string(),
//         size: z.string(),
//         disabled: z.boolean(),
//       }),
//     })),
//   }),
//   from: '@/components/ui/button'
// }
const componentRegistry = {
  // ...ComponentDefinitions
  Button: {
    component: Button,
    schema: patchSchema(z.object({
      asChild: z.boolean().optional(),
      children: z.any().optional(),
      variant: z.union([z.literal("default"), z.literal("destructive"), z.literal("outline"), z.literal("secondary"), z.literal("ghost"), z.literal("link")]).optional().nullable(),
      size: z.union([z.literal("default"), z.literal("sm"), z.literal("lg"), z.literal("icon")]).optional().nullable()

    })),
    from: '@/components/ui/button'
  },
  Badge: {
    component: Badge,
    schema: patchSchema(z.object({
      children: z.any().optional(),
      variant: z.enum(['default', 'secondary', 'destructive', 'outline']).default('default'),
    })),
    from: '@/components/ui/badge'
  },
  Transactions: {
    component: Transactions,
    schema: patchSchema(z.object({
      data: z.array(z.object({
        id: z.string(),
        customer: z.string(),
        email: z.string(),
        amount: z.number()
      }))
    })),
    from: '@/components/ui/transactions'
  },
  Flexbox: {
    component: Flexbox,
    schema: patchSchema(z.object({
      children: z.any().optional(),
      direction: z.union([z.literal("row"), z.literal("column"), z.literal("rowReverse"), z.literal("columnReverse")]).optional().nullable(),
      justify: z.union([z.literal("start"), z.literal("end"), z.literal("center"), z.literal("between"), z.literal("around"), z.literal("evenly")]).optional().nullable(),
      align: z.union([z.literal("start"), z.literal("end"), z.literal("center"), z.literal("baseline"), z.literal("stretch")]).optional().nullable(),
      wrap: z.union([z.literal("wrap"), z.literal("nowrap"), z.literal("wrapReverse")]).optional().nullable(),
      gap: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(4), z.literal(8)]).optional().nullable()
    })),
    from: '@/components/ui/ui-builder/flexbox'
  },
  ReactFunctionComplexTypes: {
    component: ReactFunctionComplexTypes,
    from: '@/components/ui/ReactFunctionComplexTypes',
    schema: z.object({
      stringProp: z.string(),
      numberProp: z.number(),
      booleanProp: z.boolean(),
      bigintProp: z.bigint(),
      optionalString: z.string().optional(),
      optionalNumber: z.number().optional(),
      optionalBoolean: z.boolean().optional(),
      optionalBigint: z.bigint().optional(),
      userArray: z.array(z.object({
        id: z.number(),
        name: z.string()
      })),
      productList: z.array(z.object({
        code: z.string(),
        price: z.number()
      })),
      address: z.object({
        street: z.string(),
        city: z.string(),
        zipCode: z.string()
      }),
      colorOrNumber: z.string().and(z.object({
        r: z.number(),
        g: z.number(),
        b: z.number()
      })),
      statusOrCode: z.union([z.number(), z.literal("active"), z.literal("inactive")]),
      mixedTuple: z.tuple([z.string(), z.number(), z.boolean()]).and(z.object({
        length: z.literal(3)
      })),
      userRole: z.union([z.literal("admin"), z.literal("user"), z.literal("guest")]),
      children: z.any(),
      className: z.string(),
      style: z.any()
    })
  },
  CodePanel: {
    component: CodePanel,
    schema: z.object({
      className: z.string().optional(),
    }),
    from: '@/components/ui/ui-builder/code-panel'
  }
};

export interface CustomComponentType<T = any> {
  name: keyof typeof componentRegistry;
  component: ReactComponentType<T>;
  schema: ZodObject<any>;
}

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

interface ComponentStore {
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
  reorderChildrenLayers: (parentId: string, orderedChildrenIds: string[]) => void;
  findLayerById: (layerId: string | null) => Layer | undefined;
  findLayersForPageId: (pageId: string) => Layer[];
}

const store: StateCreator<ComponentStore, [], []> = (set, get) => (
  {

    // components: Object.entries(componentRegistry).map(([name, { component, schema }]) => ({
    //   name: name as keyof typeof componentRegistry,
    //   component,
    //   schema,
    // })),

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
      set({ pages });
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

    addComponentLayer: (layerType: keyof typeof componentRegistry, parentId: string, parentPosition?: number) => set(produce((state: ComponentStore) => {
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

    addTextLayer: (text: string, textType: 'text' | 'markdown', parentId: string, parentPosition?: number) => set(produce((state: ComponentStore) => {
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

    addPageLayer: (pageName: string) => set(produce((state: ComponentStore) => {
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

    duplicateLayer: (layerId: string) => set(produce((state: ComponentStore) => {
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
          newLayer.name = `${ layer.name } (Copy)`;
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

    removeLayer: (layerId: string) => set(produce((state: ComponentStore) => {
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
        visitLayer(page, null, (layer, parent) => {

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
      produce((state: ComponentStore) => {
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


    selectLayer: (layerId: string) => set(produce((state: ComponentStore) => {
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

    selectPage: (pageId: string) => set(produce((state: ComponentStore) => {
      const page = state.pages.find(page => page.id === pageId);
      if (!page) return state;
      return {
        selectedPageId: pageId
      };
    })),

    reorderChildrenLayers: (parentId: string, orderedChildrenIds: string[]) => set(produce((state: ComponentStore) => {

      const { pages } = get();

      // Define the visitor function
      const visitor = (layer: Layer, parent: Layer | null): Layer => {
        if (layer.id === parentId && hasChildren(layer)) {
          if (!layer.children) {
            // If the parent layer has no children, return it unchanged
            return layer;
          }

          // Reorder children based on orderedChildrenIds
          const newChildren = orderedChildrenIds
            .map(id => layer.children!.find(child => child.id === id))
            .filter(child => child !== undefined) as Layer[];

          return {
            ...layer,
            children: newChildren,
          };
        }

        return layer;
      };

      // Apply the visitor to all layers
      const updatedPages = pages.map(page => ({
        ...page,
        children: page.children.map(layer => visitLayer(layer, null, visitor)),
      }));

      return {
        ...state,
        pages: updatedPages,
      };
    })),
  }
)

const useComponentStore = create(persist(temporal<ComponentStore>(store,
  {
    onSave: (pastState: ComponentStore, currentState: ComponentStore) => {
      console.log("onSave", {previousState:pastState, currentState });
    },
    equality: (pastState, currentState) =>
      isDeepEqual(pastState, currentState),
  }
), {
  name: "layer-store",
  version: 1,
  storage: createJSONStorage(() => localStorage),
}))

export { useComponentStore, componentRegistry, isTextLayer, isPageLayer, countLayers };
