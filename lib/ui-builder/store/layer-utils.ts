import { ComponentLayer, Layer, PageLayer, TextLayer } from "@/lib/ui-builder/store/component-store";

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
    if (hasChildren(updatedLayer)) {
        const updatedChildren = updatedLayer.children.map((child) =>
            visitLayer(child, updatedLayer, visitor)
        );
        return { ...updatedLayer, children: updatedChildren };
    }

    return updatedLayer;
};

export const countLayers = (layers: Layer[]): number => {
    return layers.reduce((count, layer) => {
        if (hasChildren(layer)) {
            return count + 1 + countLayers(layer.children);
        }
        return count + 1;
    }, 0);
};

export const addLayer = (layers: Layer[], newLayer: Layer, parentId?: string, parentPosition?: number): Layer[] => {
    const updatedPages = layers.map((page) =>
        visitLayer(page, null, (layer, parent) => {
            if (layer.id === parentId && hasChildren(layer)) {
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

export const findParentLayerRecursive = (layers: Layer[], layerId: string): Layer | null => {
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

export const findLayerRecursive = (layers: Layer[], layerId: string): Layer | undefined => {
    for (const layer of layers) {
        if (layer.id === layerId) {
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

export const hasChildren = (layer: Layer): layer is ComponentLayer & { children: Layer[] } => {
    return 'children' in layer && Array.isArray(layer.children);
};

export function isTextLayer(layer: Layer): layer is TextLayer {
    return layer.type === '_text_';
}

export function isPageLayer(layer: Layer): layer is PageLayer {
    return layer.type === '_page_';
}

