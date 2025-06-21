import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  CollisionDetection,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import { canLayerAcceptChildren, findAllParentLayersRecursive } from '@/lib/ui-builder/store/layer-utils';

// Custom collision detection that accounts for transform state
const createTransformAwareCollisionDetection = (): CollisionDetection => {
  return ({ active, droppableRects, droppableContainers, pointerCoordinates, collisionRect }) => {
    if (!pointerCoordinates) {
      return [];
    }

    // Try to get the transform state from the transform component
    const transformComponent = document.querySelector('[data-testid="transform-component"]');
    let transformState = { scale: 1, positionX: 0, positionY: 0 };
    
    if (transformComponent) {
      // Try to extract transform from the transform component's style
      const computedStyle = window.getComputedStyle(transformComponent);
      const transform = computedStyle.transform;
      
      if (transform && transform !== 'none') {
        // Parse matrix values to get scale and translation
        const matrixMatch = transform.match(/matrix\(([^)]*)\)/);
        if (matrixMatch) {
          const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
          if (values.length >= 6) {
            transformState = {
              scale: values[0], // scaleX
              positionX: values[4], // translateX
              positionY: values[5], // translateY
            };
          }
        }
      }
    }

    // Adjust pointer coordinates to account for the transform
    const adjustedPointerCoordinates = {
      x: (pointerCoordinates.x - transformState.positionX) / transformState.scale,
      y: (pointerCoordinates.y - transformState.positionY) / transformState.scale,
    };

    // Use the adjusted coordinates for collision detection
    const adjustedArgs = {
      active,
      droppableRects,
      droppableContainers,
      pointerCoordinates: adjustedPointerCoordinates,
      collisionRect,
    };

    // First try pointer-based collision detection with adjusted coordinates
    const pointerCollisions = pointerWithin(adjustedArgs);
    
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // Fallback to rect-based collision detection
    return rectIntersection(adjustedArgs);
  };
};

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

// Custom DragOverlay that renders inside the transform container
const TransformAwareDragOverlay: React.FC<{ 
  children: React.ReactNode;
}> = ({ children }) => {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Try to find the transform component container where we want to render the overlay
    const transformComponent = document.querySelector('[data-testid="transform-component"]') as HTMLElement;
    if (transformComponent) {
      setMountNode(transformComponent);
    } else {
      // Fallback to editor panel container
      const editorContainer = document.getElementById('editor-panel-content');
      setMountNode(editorContainer);
    }
  }, []);

  // Render the overlay inside the transformed container using a portal
  if (!mountNode) {
    return (
      <DragOverlay dropAnimation={null}>
        {children}
      </DragOverlay>
    );
  }

  // Create a positioned overlay that follows the mouse within the transform context
  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <DragOverlay dropAnimation={null}>
        {children}
      </DragOverlay>
    </div>,
    mountNode
  );
};

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

  // Create the custom collision detection instance
  const collisionDetection = useMemo(() => createTransformAwareCollisionDetection(), []);

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
  }, [moveLayer, isLayerDescendantOf]);

  const handleDragCancel = useCallback(() => {
    setActiveLayerId(null);
  }, []);

  const canDropOnLayerCallback = useCallback((layerId: string): boolean => {
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

  const contextValue: DndContextState = useMemo(() => ({
    isDragging: !!activeLayerId,
    activeLayerId,
    canDropOnLayer: canDropOnLayerCallback,
  }), [activeLayerId, canDropOnLayerCallback]);

  const componentDragContextValue: ComponentDragContextState = useMemo(() => ({
    isDragging: componentDragging,
    setDragging: setComponentDragging,
  }), [componentDragging]);

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
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {children}
          <TransformAwareDragOverlay>
            {activeLayerId ? <DragOverlayContent layerId={activeLayerId} /> : null}
          </TransformAwareDragOverlay>
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
    <div className="mt-10 bg-white shadow-lg border border-gray-200 rounded px-2 py-1 text-sm font-medium opacity-90 text-nowrap min-w-fit">
      {layer.name || layer.type}
    </div>
  );
};