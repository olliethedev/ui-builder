import { useCallback } from 'react';
import { type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { findAllParentLayersRecursive } from '@/lib/ui-builder/store/layer-utils';

interface UseDndEventHandlersProps {
  stopAutoScroll: () => void;
  setActiveLayerId: (layerId: string | null) => void;
  setNewComponentType?: (componentType: string | null) => void;
  clearDragState?: () => void;
  canDropOnLayer?: (layerId: string) => boolean;
}

export const useDndEventHandlers = ({ 
  stopAutoScroll, 
  setActiveLayerId,
  setNewComponentType,
  clearDragState,
  canDropOnLayer,
}: UseDndEventHandlersProps) => {
  const moveLayer = useLayerStore((state) => state.moveLayer);
  const addComponentLayer = useLayerStore((state) => state.addComponentLayer);
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
    } else if (active.data.current?.type === 'new-component') {
      // Handle new component drag from popover
      const componentType = active.data.current.componentType;
      if (componentType && setNewComponentType) {
        setNewComponentType(componentType);
      }
    }
  }, [setActiveLayerId, setNewComponentType]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    // Stop auto-scroll immediately
    stopAutoScroll();
    
    const activeData = active.data.current;
    const overData = over?.data.current;
    
    // Handle case where there's no valid drop target
    if (!over || !overData || overData.type !== 'drop-zone') {
      if (clearDragState) {
        clearDragState();
      } else {
        setActiveLayerId(null);
      }
      return;
    }

    const targetParentId = overData.parentId;
    const targetPosition = overData.position;

    // Validate drop is allowed (childOf constraints, etc.)
    if (canDropOnLayer && !canDropOnLayer(targetParentId)) {
      if (clearDragState) {
        clearDragState();
      } else {
        setActiveLayerId(null);
      }
      return;
    }

    // Handle existing layer drag
    if (activeData?.type === 'layer' && activeData.layerId) {
      const activeLayerId = activeData.layerId;
      
      // Don't allow dropping a layer onto itself or its descendants
      if (isLayerDescendantOf(targetParentId, activeLayerId)) {
        if (clearDragState) {
          clearDragState();
        } else {
          setActiveLayerId(null);
        }
        return;
      }

      moveLayer(activeLayerId, targetParentId, targetPosition);
    } 
    // Handle new component drag from popover
    else if (activeData?.type === 'new-component' && activeData.componentType) {
      addComponentLayer(activeData.componentType, targetParentId, targetPosition);
    }

    if (clearDragState) {
      clearDragState();
    } else {
      setActiveLayerId(null);
    }
  }, [moveLayer, addComponentLayer, isLayerDescendantOf, stopAutoScroll, setActiveLayerId, clearDragState, canDropOnLayer]);

  const handleDragCancel = useCallback(() => {
    stopAutoScroll();
    if (clearDragState) {
      clearDragState();
    } else {
      setActiveLayerId(null);
    }
  }, [stopAutoScroll, setActiveLayerId, clearDragState]);

  return {
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    isLayerDescendantOf,
  };
}; 