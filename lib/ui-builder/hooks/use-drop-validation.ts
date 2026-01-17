import { useCallback } from 'react';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import { canLayerAcceptChildren } from '@/lib/ui-builder/store/layer-utils';

export const useDropValidation = (
  activeLayerId: string | null, 
  isLayerDescendantOf: (childId: string, parentId: string) => boolean,
  newComponentType?: string | null
) => {
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const componentRegistry = useEditorStore((state) => state.registry);

  const canDropOnLayer = useCallback((layerId: string): boolean => {
    const targetLayer = findLayerById(layerId);
    if (!targetLayer) return false;

    // If no active drag (neither existing layer nor new component), check if layer can accept children
    if (!activeLayerId && !newComponentType) {
      return canLayerAcceptChildren(targetLayer, componentRegistry);
    }
    
    // Handle new component drag from popover
    if (newComponentType) {
      const componentDef = componentRegistry[newComponentType];
      
      // Check childOf constraint for new component
      if (componentDef?.childOf && !componentDef.childOf.includes(targetLayer.type)) {
        return false;
      }
      
      return canLayerAcceptChildren(targetLayer, componentRegistry);
    }
    
    // Handle existing layer drag
    if (activeLayerId) {
      // Don't allow dropping onto self or descendants
      if (isLayerDescendantOf(layerId, activeLayerId)) {
        return false;
      }

      const draggedLayer = findLayerById(activeLayerId);
      if (!draggedLayer) return false;

      // Check childOf constraint: if the dragged layer has a childOf constraint,
      // only allow dropping onto valid parent types
      const draggedDef = componentRegistry[draggedLayer.type];
      if (draggedDef?.childOf && !draggedDef.childOf.includes(targetLayer.type)) {
        return false;
      }
    }

    return canLayerAcceptChildren(targetLayer, componentRegistry);
  }, [activeLayerId, newComponentType, isLayerDescendantOf, findLayerById, componentRegistry]);

  return { canDropOnLayer };
}; 