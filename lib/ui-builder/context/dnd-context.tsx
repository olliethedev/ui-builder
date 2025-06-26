import React, { useState, ReactNode, useMemo, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import { createTransformAwareCollisionDetection } from '@/lib/ui-builder/context/dnd-context-colission-utils';
import { getIframeElements } from '@/lib/ui-builder/context/dnd-utils';
import { 
  DndContextStateContext, 
  ComponentDragContext,
  DndContextState,
  ComponentDragContextState,
  useDndContext,
  useComponentDragContext
} from '@/lib/ui-builder/context/dnd-contexts';
import { TransformAwareDragOverlay, DragOverlayContent } from '@/lib/ui-builder/context/drag-overlay';
import { useAutoScroll } from '@/lib/ui-builder/hooks/use-auto-scroll';
import { useDndSensors } from '@/lib/ui-builder/hooks/use-dnd-sensors';
import { useDndEventHandlers } from '@/lib/ui-builder/hooks/use-dnd-event-handlers';
import { useDropValidation } from '@/lib/ui-builder/hooks/use-drop-validation';
import { useKeyboardShortcutsDnd } from '@/lib/ui-builder/hooks/use-keyboard-shortcuts-dnd';

// Re-export the contexts and hooks for backward compatibility
export { useDndContext, useComponentDragContext };

interface DndContextProviderProps {
  children: ReactNode;
}

export const DndContextProvider: React.FC<DndContextProviderProps> = ({ children }) => {
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [componentDragging, setComponentDragging] = useState(false);
  
  // Use extracted hooks
  const { handleParentMouseMove, handleIframeMouseMove, stopAutoScroll } = useAutoScroll();
  const sensors = useDndSensors();
  const { handleDragStart, handleDragEnd, handleDragCancel, isLayerDescendantOf } = useDndEventHandlers({
    stopAutoScroll,
    setActiveLayerId,
  });
  const { canDropOnLayer } = useDropValidation(activeLayerId, isLayerDescendantOf);
  
  // Use keyboard shortcuts hook
  useKeyboardShortcutsDnd(activeLayerId, handleDragCancel);

  // Create the custom collision detection instance fresh each time
  // Don't memoize this to ensure we always get fresh scroll positions during auto-scroll
  const collisionDetection = createTransformAwareCollisionDetection();

  const contextValue: DndContextState = useMemo(() => ({
    isDragging: !!activeLayerId,
    activeLayerId,
    canDropOnLayer,
  }), [activeLayerId, canDropOnLayer]);

  const componentDragContextValue: ComponentDragContextState = useMemo(() => ({
    isDragging: componentDragging,
    setDragging: setComponentDragging,
  }), [componentDragging]);

  // Auto-scroll event listeners setup/cleanup
  useEffect(() => {
    if (activeLayerId) {
      // Add global mouse move listener for auto-scroll on parent document
      const handleParentMove = (event: MouseEvent) => handleParentMouseMove(event, activeLayerId);
      document.addEventListener('mousemove', handleParentMove);
      
      // Also add mouse move listener to iframe content window
      const iframeElements = getIframeElements();
      let iframeCleanup: (() => void) | null = null;
      
      if (iframeElements) {
        const { window: iframeWindow } = iframeElements;
        if (iframeWindow) {
          const handleIframeMove = (event: MouseEvent) => handleIframeMouseMove(event, activeLayerId);
          iframeWindow.addEventListener('mousemove', handleIframeMove);
          iframeCleanup = () => {
            try {
              iframeWindow.removeEventListener('mousemove', handleIframeMove);
            } catch (error) {
              // Iframe might be unmounted, ignore errors
              console.warn('Failed to remove iframe mouse listener:', error);
            }
          };
        }
      }
      
      return () => {
        document.removeEventListener('mousemove', handleParentMove);
        if (iframeCleanup) {
          iframeCleanup();
        }
        stopAutoScroll();
      };
    } else {
      // Clean up when no active drag
      stopAutoScroll();
    }
  }, [activeLayerId, handleParentMouseMove, handleIframeMouseMove, stopAutoScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

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

