import React, { createContext, useContext, useState, ReactNode } from 'react';
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
import { canLayerAcceptChildren } from '@/lib/ui-builder/store/layer-utils';
import { ComponentLayer } from '@/components/ui/ui-builder/types';

interface DndContextState {
  isDragging: boolean;
  activeLayerId: string | null;
  canDropOnLayer: (layerId: string) => boolean;
}

const DndContextStateContext = createContext<DndContextState | null>(null);

export const useDndContext = () => {
  const context = useContext(DndContextStateContext);
  if (!context) {
    throw new Error('useDndContext must be used within a DndContextProvider');
  }
  return context;
};

interface DndContextProviderProps {
  children: ReactNode;
}

export const DndContextProvider: React.FC<DndContextProviderProps> = ({ children }) => {
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const moveLayer = useLayerStore((state) => state.moveLayer);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const componentRegistry = useEditorStore((state) => state.registry);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'layer') {
      setActiveLayerId(active.data.current.layerId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLayerId(null);

    if (!over || !active.data.current?.layerId) {
      return;
    }

    const sourceLayerId = active.data.current.layerId;
    const overData = over.data.current;

    if (overData?.type === 'drop-zone') {
      const { parentId, position } = overData;
      
      // Prevent dropping a layer onto itself or its children
      if (sourceLayerId === parentId) {
        return;
      }

      // Check if the target parent can accept children
      const targetParent = findLayerById(parentId);
      if (targetParent && canLayerAcceptChildren(targetParent, componentRegistry)) {
        moveLayer(sourceLayerId, parentId, position);
      }
    }
  };

  const canDropOnLayer = (layerId: string): boolean => {
    const layer = findLayerById(layerId);
    if (!layer) return false;
    
    // Don't allow dropping on the currently dragged layer
    if (activeLayerId === layerId) return false;
    
    return canLayerAcceptChildren(layer, componentRegistry);
  };

  const contextValue: DndContextState = {
    isDragging: activeLayerId !== null,
    activeLayerId,
    canDropOnLayer,
  };

  return (
    <DndContextStateContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {activeLayerId ? <DragOverlayContent layerId={activeLayerId} /> : null}
        </DragOverlay>
      </DndContext>
    </DndContextStateContext.Provider>
  );
};

interface DragOverlayContentProps {
  layerId: string;
}

const DragOverlayContent: React.FC<DragOverlayContentProps> = ({ layerId }) => {
  const layer = useLayerStore((state) => state.findLayerById(layerId));
  
  if (!layer) return null;

  return (
    <div className="bg-white shadow-lg border border-gray-200 rounded px-2 py-1 text-sm font-medium opacity-90">
      {layer.name || layer.type}
    </div>
  );
};