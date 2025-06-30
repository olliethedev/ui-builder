import { LayerStore } from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer, ComponentRegistry } from '@/components/ui/ui-builder/types';
import { getDefaultProps } from '@/lib/ui-builder/store/schema-utils';

/**
 * Recursively visits each layer in the layer tree and applies the provided visitor function to each layer.
 * The visitor function can modify the layer and its children as needed.
 *
 * @param layer - The current layer to visit.
 * @param visitor - A function that takes a layer and returns a modified layer.
 * @returns The modified layer after applying the visitor function.
 */
export const visitLayer = (layer: ComponentLayer, parentLayer: ComponentLayer | null, visitor: (layer: ComponentLayer, parentLayer: ComponentLayer | null) => ComponentLayer): ComponentLayer => {
    // Apply the visitor to the current layer
    const updatedLayer = visitor(layer, parentLayer);

    // Recursively traverse and update children if they exist
    if (hasLayerChildren(updatedLayer)) {
        const updatedChildren = updatedLayer.children.map((child) =>
            visitLayer(child, updatedLayer, visitor)
        );
        return { ...updatedLayer, children: updatedChildren };
    }

    return updatedLayer;
};

export const countLayers = (layers: ComponentLayer[] | string): number => {
    if (typeof layers === 'string') {
        return 0;
    }
    return layers.reduce((count, layer) => {
        if (hasLayerChildren(layer)) {
            return count + 1 + countLayers(layer.children);
        }
        return count + 1;
    }, 0);
};

export const addLayer = (layers: ComponentLayer[], newLayer: ComponentLayer, parentId?: string, parentPosition?: number): ComponentLayer[] => {
    const updatedPages = layers.map((page) =>
        visitLayer(page, null, (layer) => {
            if (layer.id === parentId) {
                // Handle both layers with existing children and those with undefined/null children
                let updatedChildren: ComponentLayer[] = [];
                
                if (hasLayerChildren(layer)) {
                    updatedChildren = [...layer.children];
                } else if (layer.children === undefined || layer.children === null || (Array.isArray(layer.children) && layer.children.length === 0)) {
                    // Initialize children array for layers with undefined/null children or empty arrays
                    updatedChildren = [];
                } else {
                    // For layers with string children or other non-array types, we can't add children
                    return layer;
                }

                if (parentPosition !== undefined) {
                    if (parentPosition < 0) {
                        // If parentPosition is negative, insert at the beginning
                        updatedChildren = [newLayer, ...updatedChildren];
                    } else if (parentPosition >= updatedChildren.length) {
                        // If parentPosition is greater than or equal to the length, append to the end
                        updatedChildren = [...updatedChildren, newLayer];
                    } else {
                        // Insert at the specified position
                        updatedChildren = [
                            ...updatedChildren.slice(0, parentPosition),
                            newLayer,
                            ...updatedChildren.slice(parentPosition)
                        ];
                    }
                } else {
                    // If parentPosition is undefined, append to the end
                    updatedChildren = [...updatedChildren, newLayer];
                }

                return { ...layer, children: updatedChildren };
            }

            return layer;
        })
    );
    return updatedPages;
}

export const findAllParentLayersRecursive = (layers: ComponentLayer[], layerId: string): ComponentLayer[] => {
    const parents: ComponentLayer[] = [];

    const findParents = (layers: ComponentLayer[], targetId: string): boolean => {
        for (const layer of layers) {
            if (hasLayerChildren(layer)) {
                if (layer.children.some(child => child.id === targetId)) {
                    parents.push(layer);
                    // Continue searching upwards
                    findParents(layers, layer.id);
                    return true;
                }

                if (findParents(layer.children, targetId)) {
                    parents.push(layer);
                    return true;
                }
            }
        }
        return false;
    };

    findParents(layers, layerId);
    return parents;
};

export const findLayerRecursive = (layers: ComponentLayer[], layerId: string): ComponentLayer | undefined => {
    for (const layer of layers) {
        if (layer.id === layerId) {
            return layer;
        }
        if (hasLayerChildren(layer)) {
            const foundInChildren = findLayerRecursive(layer.children, layerId);
            if (foundInChildren) {
                return foundInChildren;
            }
        }
    }
    return undefined;
};

export const duplicateWithNewIdsAndName = (layer: ComponentLayer, addCopySuffix: boolean = true): ComponentLayer => {
    const newLayer: ComponentLayer = { ...layer, id: createId() };
    if (layer.name) {
      newLayer.name = `${ layer.name }${ addCopySuffix ? ' (Copy)' : ''}`;
    }
    if (hasLayerChildren(newLayer) && hasLayerChildren(layer)) {
      newLayer.children = layer.children.map(child => duplicateWithNewIdsAndName(child, false));
    }
    return newLayer;
  };


export function createId(): string {
    const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const ID_LENGTH = 7;
    let result = '';
    const alphabetLength = ALPHABET.length;

    for (let i = 0; i < ID_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * alphabetLength);
        result += ALPHABET.charAt(randomIndex);
    }

    return result;
}

export const hasLayerChildren = (layer: ComponentLayer): layer is ComponentLayer & { children: ComponentLayer[] } => {
    return Array.isArray(layer.children) && typeof layer.children !== 'string';
};

export function migrateV1ToV2(persistedState: unknown): LayerStore {
    type TextLayer = {
        id: string;
        name?: string;
        type: '_text_';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        props: Record<string, any>;
        text: string;
        textType: 'text' | 'markdown';
      };

      console.log("Migrating store", { persistedState, version: 1 });

      const migratedState = persistedState as LayerStore;

      // Utilize visitLayer to transform all layers recursively
      const transformLayer = (layer: ComponentLayer): ComponentLayer => {
        if (layer.type === "_text_") {
          const textLayer = layer as unknown as TextLayer;
          const transformedTextLayer: ComponentLayer = {
            type: textLayer.textType === "markdown" ? "Markdown" : "span",
            children: textLayer.text,
            id: textLayer.id,
            name: textLayer.name,
            props: textLayer.props,
          };
          console.log("Transformed text layer", transformedTextLayer);
          return transformedTextLayer;
        }

        return layer;
      };

      const migratedPages = migratedState.pages.map((page: ComponentLayer) => {
        return visitLayer(page, null, transformLayer) as ComponentLayer;
      }) satisfies ComponentLayer[];

      return {
        ...migratedState,
        pages: migratedPages,
      } satisfies LayerStore;
}

export function migrateV2ToV3(persistedState: unknown): LayerStore {
    
    
     type PageLayer = {
        id: string;
        name?: string;
        type: '_page_';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        props: Record<string, any>;
        children: ComponentLayer[];
      }

      console.log("Migrating store", { persistedState, version: 1 });

      const migratedState = persistedState as LayerStore;

      const keysToMap = {   
        borderRadius: "data-border-radius",
        colorTheme: "data-color-theme",
        mode: "data-mode",
      };

      const migratedPages = migratedState.pages.map((page: ComponentLayer) => {
        if (page.type === "_page_") {
            const pageLayer = page as unknown as PageLayer;
            const transformedPageLayer: ComponentLayer = {
                type: "div",
                children: pageLayer.children,
                id: pageLayer.id,
                name: pageLayer.name,
                //map keys called borderRadius, colorTheme, mode to data-border-radius, data-color-theme, data-mode
                props: Object.fromEntries(Object.entries(pageLayer.props).map(([key, value]) => {
                    if (keysToMap[key as keyof typeof keysToMap]) {
                        return [keysToMap[key as keyof typeof keysToMap], value];
                    }
                    return [key, value];
                })),
              };
              console.log("Transformed page layer", transformedPageLayer);
              return transformedPageLayer;
        }
        return page;
      }) satisfies ComponentLayer[];


      return {
        ...migratedState,
        pages: migratedPages,
      } satisfies LayerStore;
}

/**
 * Creates a new component layer with default props and children initialized from the component registry.
 * This utility function consolidates the layer initialization logic used across the application.
 * 
 * @param layerType - The type of component to create
 * @param componentRegistry - The component registry containing component definitions
 * @param options - Optional configuration for the layer
 * @returns A new ComponentLayer with initialized props and children
 */
export const createComponentLayer = (
  layerType: string,
  componentRegistry: ComponentRegistry,
  options: {
    id?: string;
    name?: string;
    applyVariableBindings?: boolean;
    variables?: Array<{ id: string; defaultValue: any }>;
  } = {}
): ComponentLayer => {
  const { id, name, applyVariableBindings = false, variables = [] } = options;
  
  const componentDef = componentRegistry[layerType as keyof typeof componentRegistry];
  if (!componentDef) {
    throw new Error(`Component definition not found for type: ${layerType}`);
  }

  const schema = componentDef.schema;
  
  // Safely check if schema has shape property (ZodObject)
  const defaultProps = 'shape' in schema && schema.shape ? getDefaultProps(schema as any) : {};
  const defaultChildrenRaw = componentDef.defaultChildren;
  const defaultChildren = typeof defaultChildrenRaw === "string" 
    ? defaultChildrenRaw 
    : (defaultChildrenRaw?.map(child => duplicateWithNewIdsAndName(child, false)) || []);

  const initialProps = Object.entries(defaultProps).reduce((acc, [key, propDef]) => {
    if (key !== "children") {
      acc[key] = propDef;
    }
    return acc;
  }, {} as Record<string, any>);

  const newLayer: ComponentLayer = {
    id: id || createId(),
    type: layerType,
    name: name || layerType,
    props: initialProps,
    children: defaultChildren,
  };

  // Apply default variable bindings if requested
  if (applyVariableBindings) {
    const defaultVariableBindings = componentDef.defaultVariableBindings || [];
    
    for (const binding of defaultVariableBindings) {
      const variable = variables.find(v => v.id === binding.variableId);
      if (variable) {
        // Set the variable reference in the props
        newLayer.props[binding.propName] = { __variableRef: binding.variableId };
      }
    }
  }

  return newLayer;
};

/**
 * Moves a layer from one position to another in the layer tree.
 * This function supports moving layers between different parents and reordering within the same parent.
 *
 * @param layers - The array of root layers (pages)
 * @param sourceLayerId - The ID of the layer to move
 * @param targetParentId - The ID of the target parent layer
 * @param targetPosition - The position in the target parent's children array (0-based index)
 * @returns The updated layers array with the layer moved to its new position
 */
export const moveLayer = (
  layers: ComponentLayer[],
  sourceLayerId: string,
  targetParentId: string,
  targetPosition: number
): ComponentLayer[] => {
  let layerToMove: ComponentLayer | null = null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let sourceParentId: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let sourcePosition: number = -1;

  // Find the layer to move and its current parent
  const findLayerAndParent = (layers: ComponentLayer[], parentId: string | null = null): boolean => {
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (layer.id === sourceLayerId) {
        layerToMove = layer;
        sourceParentId = parentId;
        sourcePosition = i;
        return true;
      }
      if (hasLayerChildren(layer)) {
        if (findLayerAndParent(layer.children, layer.id)) {
          return true;
        }
      }
    }
    return false;
  };

  // Find the layer in the tree
  findLayerAndParent(layers);

  if (!layerToMove) {
    console.warn(`Source layer with ID ${sourceLayerId} not found`);
    return layers;
  }

  // Remove the layer from its current position
  const layersWithoutSource = layers.map(page =>
    visitLayer(page, null, (layer) => {
      if (hasLayerChildren(layer)) {
        const updatedChildren = layer.children.filter(child => child.id !== sourceLayerId);
        return { ...layer, children: updatedChildren };
      }
      return layer;
    })
  );

  // Add the layer to its new position
  const updatedLayers = addLayer(layersWithoutSource, layerToMove, targetParentId, targetPosition);

  return updatedLayers;
};

/**
 * Checks if a layer can accept children (has a children property that is an array)
 *
 * @param layer - The layer to check
 * @param componentRegistry - The component registry to check schema
 * @returns true if the layer can accept children
 */
export const canLayerAcceptChildren = (
  layer: ComponentLayer,
  componentRegistry: ComponentRegistry
): boolean => {
  const componentDef = componentRegistry[layer.type as keyof typeof componentRegistry];
  if (!componentDef) return false;

  // Safely check if schema has shape property (ZodObject) and children field
  const hasChildrenField = 'shape' in componentDef.schema && 
                          componentDef.schema.shape && 
                          componentDef.schema.shape.children !== undefined;

  return hasChildrenField && hasLayerChildren(layer);
};

