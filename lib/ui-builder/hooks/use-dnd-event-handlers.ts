import { useCallback } from 'react';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { findAllParentLayersRecursive } from '@/lib/ui-builder/store/layer-utils';

interface UseDndEventHandlersProps {
  stopAutoScroll: () => void;
  setActiveLayerId: (layerId: string | null) => void;
}

export const useDndEventHandlers = ({ stopAutoScroll, setActiveLayerId }: UseDndEventHandlersProps) => {
  const moveLayer = useLayerStore((state) => state.moveLayer);
  const pages = useLayerStore((state) => state.pages);

  // Helper function to check if a layer is a descendant of another layer
  const isLayerDescendantOf = useCallback((childId: string, parentId: string): boolean => {
    if (childId === parentId) return true; // A layer is considered its own descendant for drop prevention
    const parentLayers = findAllParentLayersRecursive(pages, childId);
    return parentLayers.some(parent => parent.id === parentId);
  }, [pages]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'layer') {
      setActiveLayerId(active.data.current.layerId);
    } else {
      console.log('Drag start: Non-layer drag detected', active.data.current?.type);
    }
  }, [setActiveLayerId]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    // Stop auto-scroll immediately
    stopAutoScroll();
    
    if (!over || !active.data.current?.layerId) {
      setActiveLayerId(null);
      return;
    }

    const activeLayerId = active.data.current.layerId;
    const overData = over.data.current;

    if (overData?.type === 'drop-zone') {
      const targetParentId = overData.parentId;
      const targetPosition = overData.position;
      
      // Don't allow dropping a layer onto itself or its descendants
      if (isLayerDescendantOf(targetParentId, activeLayerId)) {
        setActiveLayerId(null);
        return;
      }

      moveLayer(activeLayerId, targetParentId, targetPosition);
    }

    setActiveLayerId(null);
  }, [moveLayer, isLayerDescendantOf, stopAutoScroll, setActiveLayerId]);

  const handleDragCancel = useCallback(() => {
    stopAutoScroll();
    setActiveLayerId(null);
  }, [stopAutoScroll, setActiveLayerId]);

  return {
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    isLayerDescendantOf,
  };
}; 