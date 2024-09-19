import { ComponentType as ReactComponentType } from 'react';
import { create } from 'zustand';
import { z } from 'zod';
// import { ComponentDefinitions } from '@/components/ui/generated-schemas';
import { customAlphabet } from "nanoid";
import { Button } from '../../button';


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
  schema: z.object({
    children: z.array(z.object({
      type: z.enum(['Button']),
      props: z.object({
        children: z.string(),
        variant: z.string(),
        size: z.string(),
        disabled: z.boolean(),
      }),
    })),
  }),
  from: '@/components/ui/button'
}
};

export function getDefaultProps(schema: z.ZodObject<any>) {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      let type = 'string';
      let options: string[] | undefined;
      let defaultValue = (value as any)._def.defaultValue?.() ;

      if (value instanceof z.ZodEnum) {
        type = 'string';
        options = value.options;
      } else if (value instanceof z.ZodBoolean) {
        type = 'boolean';
      } else if (value instanceof z.ZodNumber) {
        type = 'number';
      } else if (value instanceof z.ZodArray) {
        type = 'array';
      } else if (value instanceof z.ZodUnion) {
        type = 'mixed';
        options = Object.keys(componentRegistry);
      }

      return [key, { type, options, defaultValue }];
    })
  )as Record<keyof typeof componentRegistry, { type: 'string' | 'boolean' | 'number' | 'array' | 'mixed', options?: string[], defaultValue: any }>;
}

// Update the CustomComponentType interface
export interface CustomComponentType<T = any> {
  name: keyof typeof componentRegistry;
  component: ReactComponentType<T>;
  schema: z.ZodObject<any>;
}

export type LayerType = keyof typeof componentRegistry | '_text_';

export type Layer = {
  id: string;
} & (
  | {
      type: keyof typeof componentRegistry;
      props: Record<string, any>;
      children?: Layer[];
    }
  | {
      type: '_text_';
      text: string;
    }
);

export type ComponentLayer = Exclude<Layer, { type: '_text_'; text: string }>;

interface ComponentStore {
  components: CustomComponentType[];
  layers: Layer[];
  addComponentLayer: (layerType: keyof typeof componentRegistry, parentId?: string) => void;
  addTextLayer: (text: string, parentId?: string) => void;
  duplicateLayer: (layerId: string) => void;
  removeLayer: (layerId: string) => void;
  updateLayerProps: (layerId: string, newProps: Record<string, any>) => void;
  selectLayer: (layerId: string) => void;
  selectedLayer: ComponentLayer | null;
}

export const useComponentStore = create<ComponentStore>((set: any) => ({
  components: Object.entries(componentRegistry).map(([name, { component, schema }]) => ({
    name: name as keyof typeof componentRegistry,
    component,
    schema,
  })),
  layers: [],
  selectedLayer: null,
  addComponentLayer: (layerType: keyof typeof componentRegistry, parentId?: string) => set((state: ComponentStore) => {
    const defaultProps = getDefaultProps(componentRegistry[layerType].schema);
    const initialProps = Object.entries(defaultProps).reduce((acc, [key, propDef]) => {
      if (key !== 'children') {
        acc[key] = propDef.defaultValue;
      }
      return acc;
    }, {} as Record<string, any>);
    const newLayer: Layer = {
      id: createId(),
      type: layerType,
      props: initialProps,
      children: []
    };

    return addLayerToState(state, newLayer, parentId);
  }),

  addTextLayer: (text: string, parentId?: string) => set((state: ComponentStore) => {
    const newLayer: Layer = {
      id: createId(),
      type: '_text_',
      text
    };

    return addLayerToState(state, newLayer, parentId);
  }),
  duplicateLayer: (layerId: string) => set((state: ComponentStore) => {
    const layerToDuplicate = findLayerRecursive(state.layers, layerId);
    if (layerToDuplicate) {
      const duplicateWithNewIds = (layer: Layer): Layer => {
        const newLayer = { ...layer, id: createId() };
        if (!isTextLayer(newLayer) && newLayer.children) {
          newLayer.children = newLayer.children.map(duplicateWithNewIds);
        }
        return newLayer;
      };
  
      const newLayer = duplicateWithNewIds(layerToDuplicate);
      const parentLayer = findParentLayerRecursive(state.layers, layerId);
      return addLayerToState(state, newLayer, parentLayer?.id);
    }
    return state;
  }),
  removeLayer: (layerId: string) => set((state: ComponentStore) => {
    
  
    const updatedLayers = removeLayerRecursive(state.layers, layerId);
    
    // Find the parent of the removed layer
  
    const parentLayer = findParentLayerRecursive(updatedLayers, layerId);
    
    // Select the parent layer or null if the removed layer was a top-level layer
    const updatedSelectedLayer = parentLayer && !isTextLayer(parentLayer) ? parentLayer : 
      (updatedLayers.length > 0 && !isTextLayer(updatedLayers[0]) ? updatedLayers[0] : null);
  
    return {
      layers: updatedLayers,
      selectedLayer: updatedSelectedLayer
    };
  }),
  updateLayerProps: (layerId: string, newProps: Record<string, any>) => set((state: ComponentStore) => {
    const updateLayerRecursive = (layers: Layer[]): Layer[] => {
      return layers.map(layer => {
        if (layer.id === layerId) {
          if (isTextLayer(layer)) {
            // For text layers, update the text property
            return { ...layer, text: newProps.text || layer.text };
          } else {
            // For component layers, update the props
            return { ...layer, props: { ...layer.props, ...newProps } };
          }
        }
        if (!isTextLayer(layer) && layer.children) {
          return { ...layer, children: updateLayerRecursive(layer.children) };
        }
        return layer;
      });
    };
  
    const updatedLayers = updateLayerRecursive(state.layers);
    const updatedSelectedLayer = state.selectedLayer && state.selectedLayer.id === layerId && !isTextLayer(state.selectedLayer) ? 
      updateLayerRecursive([state.selectedLayer])[0] as ComponentLayer : 
      state.selectedLayer;
  
    return {
      layers: updatedLayers,
      selectedLayer: updatedSelectedLayer
    };
  }),
  selectLayer: (layerId: string) => set((state: ComponentStore) => {
    

    const layer = findLayerRecursive(state.layers, layerId);
    if (layer) {
      return {
        selectedLayer: layer,
      };
    }
    return {};
  }),
}));

 function isTextLayer(layer: Layer): layer is Layer & { type: '_text_'; text: string } {
  return layer.type === '_text_';
}

const addLayerToState = (state: ComponentStore, newLayer: Layer, parentId?: string) => {
  const addLayerRecursive = (layers: Layer[]): Layer[] => {
    return layers.map(layer => {
      if (layer.id === parentId) {
        if (!isTextLayer(layer)) {
          return { ...layer, children: [...(layer.children || []), newLayer] };
        }
        return layer; // Text layers can't have children
      }
      if (!isTextLayer(layer) && layer.children) {
        return { ...layer, children: addLayerRecursive(layer.children) };
      }
      return layer;
    });
  };

  const updatedLayers = parentId ? addLayerRecursive(state.layers) : [...state.layers, newLayer];
  
  // Only update selectedLayer if the new layer is not a text layer
  const updatedSelectedLayer = !isTextLayer(newLayer) ? newLayer : state.selectedLayer;

  return {
    layers: updatedLayers,
    selectedLayer: updatedSelectedLayer
  };
};

const findParentLayerRecursive = (layers: Layer[], layerId: string): Layer | null => {
  for (const layer of layers) {
    if (!isTextLayer(layer) && layer.children && layer.children.some(child => child.id === layerId)) {
      return layer;
    }
    if (!isTextLayer(layer) && layer.children) {
      const parent = findParentLayerRecursive(layer.children, layerId);
      if (parent) return parent;
    }
  }
  return null;
};

const findLayerRecursive = (layers: Layer[], layerId: string): ComponentLayer | undefined => {
  for (const layer of layers) {
    if (layer.id === layerId && !isTextLayer(layer)) {
      return layer;
    }
    if (!isTextLayer(layer) && layer.children) {
      const foundInChildren = findLayerRecursive(layer.children, layerId);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }
  return undefined;
};

const removeLayerRecursive = (layers: Layer[], layerId: string): Layer[] => {
  return layers.filter(layer => {
    if (layer.id === layerId) {
      return false;
    }
    if (!isTextLayer(layer) && layer.children) {
      layer.children = removeLayerRecursive(layer.children, layerId);
    }
    return true;
  });
};

export const createId = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export { componentRegistry, isTextLayer };