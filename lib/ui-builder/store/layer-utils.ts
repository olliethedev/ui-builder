import { ComponentLayer, Layer, LayerStore, PageLayer } from "@/lib/ui-builder/store/layer-store";

/**
 * Recursively visits each layer in the layer tree and applies the provided visitor function to each layer.
 * The visitor function can modify the layer and its children as needed.
 *
 * @param layer - The current layer to visit.
 * @param visitor - A function that takes a layer and returns a modified layer.
 * @returns The modified layer after applying the visitor function.
 */
export const visitLayer = (layer: Layer, parentLayer: Layer | null, visitor: (layer: Layer, parentLayer: Layer | null) => Layer): Layer => {
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

export const countLayers = (layers: Layer[]): number => {
    return layers.reduce((count, layer) => {
        if (hasLayerChildren(layer)) {
            return count + 1 + countLayers(layer.children);
        }
        return count + 1;
    }, 0);
};

export const addLayer = (layers: Layer[], newLayer: Layer, parentId?: string, parentPosition?: number): Layer[] => {
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

export const findAllParentLayersRecursive = (layers: Layer[], layerId: string): Layer[] => {
    const parents: Layer[] = [];

    const findParents = (layers: Layer[], targetId: string): boolean => {
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

export const findLayerRecursive = (layers: Layer[], layerId: string): Layer | undefined => {
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

export const duplicateWithNewIdsAndName = (layer: Layer, addCopySuffix: boolean = true): Layer => {
    const newLayer: Layer = { ...layer, id: createId() };
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

export const hasLayerChildren = (layer: Layer): layer is ComponentLayer & { children: Layer[] } => {
    return Array.isArray(layer.children) && typeof layer.children !== 'string';
};

export function isPageLayer(layer: Layer): layer is PageLayer {
    return layer.type === '_page_';
}

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
      const transformLayer = (layer: Layer): Layer => {
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

      const migratedPages = migratedState.pages.map((page: PageLayer) => {
        return visitLayer(page, null, transformLayer) as PageLayer;
      }) satisfies PageLayer[];

      return {
        ...migratedState,
        pages: migratedPages,
      } satisfies LayerStore;
}

