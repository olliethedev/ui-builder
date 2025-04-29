import { ComponentLayer, LayerStore } from "@/lib/ui-builder/store/layer-store";

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
            if (layer.id === parentId && hasLayerChildren(layer)) {
                let updatedChildren = layer.children ? [...layer.children] : [];

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
      newLayer.children = layer.children.map(child => duplicateWithNewIdsAndName(child, addCopySuffix));
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

    

      const migratedPages = migratedState.pages.map((page: ComponentLayer) => {
        if (page.type === "_page_") {
            const pageLayer = page as unknown as PageLayer;
            const transformedPageLayer: ComponentLayer = {
                type: "div",
                children: pageLayer.children,
                id: pageLayer.id,
                name: pageLayer.name,
                props: pageLayer.props,
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

