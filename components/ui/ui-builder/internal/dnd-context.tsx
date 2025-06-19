import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import { canLayerAcceptChildren, findAllParentLayersRecursive } from '@/lib/ui-builder/store/layer-utils';

interface DndContextState {
  isDragging: boolean;
  activeLayerId: string | null;
  canDropOnLayer: (layerId: string) => boolean;
}

// Component drag context for tracking individual component drag states
interface ComponentDragContextState {
  isDragging: boolean;
  setDragging: (isDragging: boolean) => void;
}

const DndContextStateContext = createContext<DndContextState>({
  isDragging: false,
  activeLayerId: null,
  canDropOnLayer: () => false,
});

// New context specifically for component drag operations
const ComponentDragContext = createContext<ComponentDragContextState>({
  isDragging: false,
  setDragging: () => {},
});

export const useDndContext = () => useContext(DndContextStateContext);
export const useComponentDragContext = () => useContext(ComponentDragContext);

interface DndContextProviderProps {
  children: ReactNode;
}

export const DndContextProvider: React.FC<DndContextProviderProps> = ({ children }) => {
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [componentDragging, setComponentDragging] = useState(false);
  const moveLayer = useLayerStore((state) => state.moveLayer);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const pages = useLayerStore((state) => state.pages);
  const componentRegistry = useEditorStore((state) => state.registry);
  
  // Helper function to check if a layer is a descendant of another layer
  const isLayerDescendantOf = useCallback((childId: string, parentId: string): boolean => {
    if (childId === parentId) return true; // A layer is considered its own descendant for drop prevention
    const parentLayers = findAllParentLayersRecursive(pages, childId);
    return parentLayers.some(parent => parent.id === parentId);
  }, [pages]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'layer') {
      setActiveLayerId(active.data.current.layerId);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLayerId(null);
    setComponentDragging(false);

    if (!over || !active.data.current?.layerId) {
      return;
    }

    const sourceLayerId = active.data.current.layerId;
    const overData = over.data.current;

    if (overData?.type === 'drop-zone') {
      const { parentId, position } = overData;
      
      // Prevent dropping a layer onto itself
      if (sourceLayerId === parentId) {
        return;
      }

      // Prevent dropping a layer into its own descendants
      if (isLayerDescendantOf(parentId, sourceLayerId)) {
        return;
      }

      // Check if the target parent can accept children
      const targetParent = findLayerById(parentId);
      if (targetParent && canLayerAcceptChildren(targetParent, componentRegistry)) {
        moveLayer(sourceLayerId, parentId, position);
      }
    }
  }, [findLayerById, componentRegistry, moveLayer, isLayerDescendantOf]);

  const handleDragCancel = useCallback(() => {
    setActiveLayerId(null);
    setComponentDragging(false);
  }, []);

  const canDropOnLayer = useCallback((layerId: string): boolean => {
    const layer = findLayerById(layerId);
    if (!layer) return false;
    
    // Don't allow dropping on the currently dragged layer
    if (activeLayerId === layerId) return false;
    
    // Don't allow dropping into descendants of the dragged layer
    if (activeLayerId && isLayerDescendantOf(layerId, activeLayerId)) {
      return false;
    }
    
    return canLayerAcceptChildren(layer, componentRegistry);
  }, [findLayerById, activeLayerId, componentRegistry, isLayerDescendantOf]);

  const contextValue: DndContextState = useMemo(() => ({
    isDragging: activeLayerId !== null,
    activeLayerId,
    canDropOnLayer,
  }), [activeLayerId, canDropOnLayer]);

  const componentDragContextValue: ComponentDragContextState = useMemo(() => ({
    isDragging: componentDragging,
    setDragging: setComponentDragging,
  }), [componentDragging]);

  const dropAnimationConfig = useMemo(() => null, []);

  // Handle escape key to cancel drag operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeLayerId) {
        event.preventDefault();
        event.stopPropagation();
        handleDragCancel();
      }
    };

    // Only add the listener when actively dragging
    if (activeLayerId) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [activeLayerId, handleDragCancel]);

  return (
    <DndContextStateContext.Provider value={contextValue}>
      <ComponentDragContext.Provider value={componentDragContextValue}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {children}
          <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeLayerId ? <DragOverlayContent layerId={activeLayerId} /> : null}
          </DragOverlay>
        </DndContext>
      </ComponentDragContext.Provider>
    </DndContextStateContext.Provider>
  );
};

interface DragOverlayContentProps {
  layerId: string;
}

/* istanbul ignore next */
const DragOverlayContent: React.FC<DragOverlayContentProps> = ({ layerId }) => {
  const layer = useLayerStore((state) => state.findLayerById(layerId));
  
  if (!layer) return null;

  return (
    <div className="bg-white shadow-lg border border-gray-200 rounded px-2 py-1 text-sm font-medium opacity-90 text-nowrap min-w-fit">
      {layer.name || layer.type}
    </div>
  );
};