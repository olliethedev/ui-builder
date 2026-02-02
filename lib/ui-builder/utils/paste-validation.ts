/**
 * Validation logic for paste operations in the UI Builder.
 * Ensures that layers can only be pasted into compatible parent layers.
 */

import type { ComponentLayer, ComponentRegistry } from '@/components/ui/ui-builder/types';
import { canLayerAcceptChildren } from '@/lib/ui-builder/store/layer-utils';
import { hasChildrenFieldOfTypeString } from '@/lib/ui-builder/store/schema-utils';

/**
 * Check if a layer can be pasted into a target layer.
 * 
 * Validates:
 * 1. Target layer exists
 * 2. Target layer can accept children (has children field and currently has array children)
 * 3. Target layer doesn't only accept string children
 * 4. Source layer's childOf constraint (if any) allows the target layer type
 * 
 * @param sourceLayer - The layer being pasted (from clipboard)
 * @param targetLayerId - The ID of the layer to paste into
 * @param componentRegistry - The component registry for looking up component definitions
 * @param findLayerById - Function to find a layer by ID
 * @returns true if the paste operation is valid
 */
export function canPasteLayer(
  sourceLayer: ComponentLayer,
  targetLayerId: string,
  componentRegistry: ComponentRegistry,
  findLayerById: (id: string) => ComponentLayer | undefined
): boolean {
  // Check if target layer exists
  const targetLayer = findLayerById(targetLayerId);
  if (!targetLayer) {
    return false;
  }

  // Check if target can accept children
  if (!canLayerAcceptChildren(targetLayer, componentRegistry)) {
    return false;
  }

  // Check if target only accepts string children
  const targetDef = componentRegistry[targetLayer.type];
  if (targetDef && 'shape' in targetDef.schema && hasChildrenFieldOfTypeString(targetDef.schema)) {
    return false;
  }

  // Check childOf constraint on the source layer
  const sourceDef = componentRegistry[sourceLayer.type];
  if (sourceDef?.childOf && !sourceDef.childOf.includes(targetLayer.type)) {
    return false;
  }

  return true;
}
