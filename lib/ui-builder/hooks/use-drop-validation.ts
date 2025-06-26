import { useCallback } from 'react';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import { canLayerAcceptChildren } from '@/lib/ui-builder/store/layer-utils';

export const useDropValidation = (activeLayerId: string | null, isLayerDescendantOf: (childId: string, parentId: string) => boolean) => {
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const componentRegistry = useEditorStore((state) => state.registry);

  const canDropOnLayer = useCallback((layerId: string): boolean => {
    const targetLayer = findLayerById(layerId);
    if (!targetLayer) return false;

    // If no active drag, check if layer can accept children
    if (!activeLayerId) {
      return canLayerAcceptChildren(targetLayer, componentRegistry);
    }
    
    // Don't allow dropping onto self or descendants
    if (isLayerDescendantOf(layerId, activeLayerId)) {
      return false;
    }

    const draggedLayer = findLayerById(activeLayerId);
    if (!draggedLayer) return false;

    return canLayerAcceptChildren(targetLayer, componentRegistry);
  }, [activeLayerId, isLayerDescendantOf, findLayerById, componentRegistry]);

  return { canDropOnLayer };
}; 