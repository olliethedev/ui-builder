import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DragOverlay } from '@dnd-kit/core';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';

// Custom DragOverlay that renders inside the transform container
export const TransformAwareDragOverlay: React.FC<{ 
  children: React.ReactNode;
}> = ({ children }) => {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  // Create a positioned overlay that follows the mouse within the transform context
  const overlayStyle = useMemo(() => ({
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none' as const,
    zIndex: 9999,
  }), []);

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

  return createPortal(
    <div style={overlayStyle}>
      <DragOverlay dropAnimation={null}>
        {children}
      </DragOverlay>
    </div>,
    mountNode
  );
};

interface DragOverlayContentProps {
  layerId: string;
}

/* istanbul ignore next */
export const DragOverlayContent: React.FC<DragOverlayContentProps> = ({ layerId }) => {
  const layer = useLayerStore((state) => state.findLayerById(layerId));
  
  if (!layer) return null;

  return (
    <div className="mt-10 bg-white shadow-lg border border-gray-200 rounded px-2 py-1 text-sm font-medium opacity-60 text-nowrap min-w-fit">
      {layer.name || layer.type}
    </div>
  );
}; 