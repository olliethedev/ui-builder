import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect, useRef } from 'react';
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

// Auto-scroll configuration constants
const AUTO_SCROLL_THRESHOLD = 50; // Distance in pixels from edge to trigger auto-scroll
const MIN_SCROLL_SPEED = 2; // Minimum scroll speed in pixels per frame
const MAX_SCROLL_SPEED = 20; // Maximum scroll speed in pixels per frame

// Transform state interface
interface TransformState {
  scale: number;
  positionX: number;
  positionY: number;
}

// Auto-scroll state interface
interface AutoScrollState {
  isScrolling: boolean;
  directions: {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
  };
  speeds: {
    horizontal: number;
    vertical: number;
  };
}

// Helper function to get transform state
const getTransformState = (): TransformState => {
  const transformComponent = document.querySelector('[data-testid="transform-component"]');
  let transformState: TransformState = { scale: 1, positionX: 0, positionY: 0 };
  
  if (transformComponent) {
    const computedStyle = window.getComputedStyle(transformComponent);
    const transform = computedStyle.transform;
    
    if (transform && transform !== 'none') {
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
  
  return transformState;
};

// Helper function to calculate scroll speed based on distance from edge
const calculateScrollSpeed = (distanceFromEdge: number): number => {
  if (distanceFromEdge >= AUTO_SCROLL_THRESHOLD) return 0;
  
  // Calculate speed as a proportion - closer to edge = faster
  const speedRatio = (AUTO_SCROLL_THRESHOLD - distanceFromEdge) / AUTO_SCROLL_THRESHOLD;
  return MIN_SCROLL_SPEED + (MAX_SCROLL_SPEED - MIN_SCROLL_SPEED) * speedRatio;
};

// Helper function to get iframe and its content window
const getIframeElements = () => {
  const iframe = document.querySelector('[data-testid="auto-frame"]') as HTMLIFrameElement | null;
  if (!iframe) return null;
  
  const iframeWindow = iframe.contentWindow;
  const iframeDocument = iframe.contentDocument;
  
  if (!iframeWindow || !iframeDocument) return null;
  
  return {
    iframe,
    window: iframeWindow,
    document: iframeDocument,
    body: iframeDocument.body,
  };
};

// Custom collision detection that accounts for transform state
const createTransformAwareCollisionDetection = (): CollisionDetection => {
  return ({ active, droppableRects, droppableContainers, pointerCoordinates, collisionRect }) => {
    if (!pointerCoordinates) {
      return [];
    }

    const transformState = getTransformState();

    // Get iframe and its current scroll position (force fresh read)
    const iframeElements = getIframeElements();
    let iframeScrollOffset = { x: 0, y: 0 };
    let iframeRect = { left: 0, top: 0 };
    
    if (iframeElements) {
      const { iframe, window: iframeWindow } = iframeElements;
      if (iframeWindow) {
        // Force a fresh read of scroll position to handle auto-scroll updates
        iframeScrollOffset = {
          x: iframeWindow.pageXOffset || iframeWindow.scrollX || 0,
          y: iframeWindow.pageYOffset || iframeWindow.scrollY || 0,
        };
      }
      
      // Get iframe position relative to viewport
      const rect = iframe.getBoundingClientRect();
      iframeRect = { left: rect.left, top: rect.top };
    }

    // During auto-scroll, force fresh droppable rectangle calculations
    // This addresses the core issue where cached rectangles become stale
    const freshDroppableRects = new Map(droppableRects);
    
    // Special handling for when we're at the very top (scrollY = 0) vs mid-scroll
    const isAtTop = Math.abs(iframeScrollOffset.y) < 5;
    const needsFreshRects = Math.abs(iframeScrollOffset.y) > 10 || isAtTop;
    
    // If we're scrolling significantly or at the very top, recalculate rectangles for all droppable containers
    if (needsFreshRects) {
      droppableContainers.forEach((container) => {
        const element = container.node.current;
        if (element) {
          try {
            // Get fresh rectangle from the DOM (this gives us viewport coordinates)
            const rect = element.getBoundingClientRect();
            
            if (isAtTop) {
              // When at the top, use a different coordinate calculation
              // Convert iframe viewport coordinates to content coordinates
              freshDroppableRects.set(container.id, {
                top: rect.top - iframeRect.top,
                left: rect.left - iframeRect.left,
                bottom: rect.bottom - iframeRect.top,
                right: rect.right - iframeRect.left,
                width: rect.width,
                height: rect.height,
              });
            } else {
              // When mid-scroll, adjust the rectangle to account for scroll position to make it content-relative
              // This makes the fresh rectangles consistent with how dnd-kit originally calculated them
              freshDroppableRects.set(container.id, {
                top: rect.top + iframeScrollOffset.y,
                left: rect.left + iframeScrollOffset.x,
                bottom: rect.bottom + iframeScrollOffset.y,
                right: rect.right + iframeScrollOffset.x,
                width: rect.width,
                height: rect.height,
              });
            }
          } catch (error) {
            // Keep the old rectangle if we can't get a fresh one
            console.warn('Failed to get fresh rectangle for:', container.id, error);
          }
        }
      });
    }

    // Transform pointer coordinates step by step:
    // 1. First, convert from viewport coordinates to iframe-relative coordinates
    const iframeRelativeX = pointerCoordinates.x - iframeRect.left;
    const iframeRelativeY = pointerCoordinates.y - iframeRect.top;
    
    // 2. Then account for the zoom/pan transform
    const transformAdjustedX = (iframeRelativeX - transformState.positionX) / transformState.scale;
    const transformAdjustedY = (iframeRelativeY - transformState.positionY) / transformState.scale;
    
    // 3. Handle coordinate calculation differently for "at top" vs "mid-scroll"
    let adjustedPointerCoordinates;
    
    if (isAtTop) {
      // When at the very top, use simpler coordinate calculation
      // This matches the coordinate system used for fresh rectangles at top
      adjustedPointerCoordinates = {
        x: transformAdjustedX,
        y: transformAdjustedY,
      };
    } else {
      // When mid-scroll, add the scroll offset to get content-relative coordinates
      // The scroll offset represents how much content has moved from its original position
      // We add it because if content scrolled down by 100px, a viewport point needs 100px added to hit the same content
      adjustedPointerCoordinates = {
        x: transformAdjustedX + iframeScrollOffset.x,
        y: transformAdjustedY + iframeScrollOffset.y,
      };
    }

    // Alternative coordinate calculation to test if the issue is in the math
    // Try a simpler approach that might work better during scroll
    const simpleAdjustedCoordinates = {
      x: pointerCoordinates.x - iframeRect.left + iframeScrollOffset.x,
      y: pointerCoordinates.y - iframeRect.top + iframeScrollOffset.y,
    };

    // Debug logging for scroll direction issues
    const isScrollingUp = iframeScrollOffset.y > 0;
    const debugInfo = {
      scrollY: iframeScrollOffset.y,
      direction: isScrollingUp ? 'up' : 'down',
      isAtTop: isAtTop,
      original: pointerCoordinates,
      iframeRelative: { x: iframeRelativeX, y: iframeRelativeY },
      transformAdjusted: { x: transformAdjustedX, y: transformAdjustedY },
      final: adjustedPointerCoordinates,
      simple: simpleAdjustedCoordinates,
      transform: transformState,
      rectsRefreshed: needsFreshRects,
      containerCount: droppableContainers.length,
    };
    
    // Only log when there's significant scrolling or at top to debug the up/down issue
    if (Math.abs(iframeScrollOffset.y) > 50 || isAtTop) {
      console.debug('Collision detection scroll debug:', debugInfo);
    }



    // Validate adjusted coordinates are reasonable
    if (isNaN(adjustedPointerCoordinates.x) || isNaN(adjustedPointerCoordinates.y)) {
      console.warn('Invalid adjusted coordinates, falling back to original');
      // Use original coordinates as fallback
      const fallbackArgs = {
        active,
        droppableRects,
        droppableContainers,
        pointerCoordinates,
        collisionRect,
      };
      return pointerWithin(fallbackArgs);
    }

    // Use the adjusted coordinates and fresh rectangles for collision detection
    const adjustedArgs = {
      active,
      droppableRects: freshDroppableRects,
      droppableContainers,
      pointerCoordinates: adjustedPointerCoordinates,
      collisionRect,
    };

    // First try pointer-based collision detection with adjusted coordinates
    const pointerCollisions = pointerWithin(adjustedArgs);
    
    if (pointerCollisions.length > 0) {
      if (Math.abs(iframeScrollOffset.y) > 50 || isAtTop) {
        console.debug(`Found pointer collisions with fresh rects ${isAtTop ? '(at top)' : '(mid-scroll)'}:`, pointerCollisions.map(c => c.id));
      }
      return pointerCollisions;
    }

    // Fallback to rect-based collision detection with adjusted coordinates
    const rectCollisions = rectIntersection(adjustedArgs);
    
    if (rectCollisions.length > 0) {
      if (Math.abs(iframeScrollOffset.y) > 50 || isAtTop) {
        console.debug(`Found rect collisions with fresh rects ${isAtTop ? '(at top)' : '(mid-scroll)'}:`, rectCollisions.map(c => c.id));
      }
      return rectCollisions;
    }

    // If fresh rectangles didn't work, try with simpler coordinate calculation
    // This skips the complex transform math and uses a direct approach
    const simpleArgs = {
      active,
      droppableRects: freshDroppableRects,
      droppableContainers,
      pointerCoordinates: simpleAdjustedCoordinates,
      collisionRect,
    };
    
    const simpleCollisions = pointerWithin(simpleArgs);
    if (simpleCollisions.length > 0) {
      if (Math.abs(iframeScrollOffset.y) > 50 || isAtTop) {
        console.debug(`Found collisions with simple coords ${isAtTop ? '(at top)' : '(mid-scroll)'}:`, simpleCollisions.map(c => c.id));
      }
      return simpleCollisions;
    }

    // If fresh rectangles didn't work, try with the original cached rectangles
    // This handles cases where the fresh rectangle calculation might have issues
    const cachedArgs = {
      active,
      droppableRects,
      droppableContainers,
      pointerCoordinates: adjustedPointerCoordinates,
      collisionRect,
    };
    
    const cachedCollisions = pointerWithin(cachedArgs);
    if (cachedCollisions.length > 0) {
      if (Math.abs(iframeScrollOffset.y) > 50 || isAtTop) {
        console.debug(`Found collisions with cached rects ${isAtTop ? '(at top)' : '(mid-scroll)'}:`, cachedCollisions.map(c => c.id));
      }
      return cachedCollisions;
    }

    // Final fallback: try original coordinates if adjusted ones didn't work
    // This can happen during rapid auto-scroll when coordinate transformation gets out of sync
    const originalArgs = {
      active,
      droppableRects,
      droppableContainers,
      pointerCoordinates,
      collisionRect,
    };
    
    const originalCollisions = pointerWithin(originalArgs);
    if ((Math.abs(iframeScrollOffset.y) > 50 || isAtTop) && originalCollisions.length === 0) {
      console.debug(`No collisions found with any method ${isAtTop ? '(at top)' : '(mid-scroll)'}`);
    }
    
    return originalCollisions;
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

export const DndContextProvider: React.FC<DndContextProviderProps> = ({ children }) => {
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [componentDragging, setComponentDragging] = useState(false);
  const moveLayer = useLayerStore((state) => state.moveLayer);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const pages = useLayerStore((state) => state.pages);
  const componentRegistry = useEditorStore((state) => state.registry);
  
  // Auto-scroll state management
  const autoScrollStateRef = useRef<AutoScrollState>({
    isScrolling: false,
    directions: { left: false, right: false, top: false, bottom: false },
    speeds: { horizontal: 0, vertical: 0 },
  });
  const mousePositionRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Helper function to check if a layer is a descendant of another layer
  const isLayerDescendantOf = useCallback((childId: string, parentId: string): boolean => {
    if (childId === parentId) return true; // A layer is considered its own descendant for drop prevention
    const parentLayers = findAllParentLayersRecursive(pages, childId);
    return parentLayers.some(parent => parent.id === parentId);
  }, [pages]);

  // Auto-scroll logic
  const performAutoScroll = useCallback(() => {
    const iframeElements = getIframeElements();
    if (!iframeElements || !mousePositionRef.current) {
      return;
    }

    const { iframe, window: iframeWindow } = iframeElements;
    
    // Get iframe bounds in viewport coordinates
    const iframeRect = iframe.getBoundingClientRect();
    
    // Convert mouse position to iframe-relative coordinates (without transform)
    const iframeMouseX = mousePositionRef.current.x - iframeRect.left;
    const iframeMouseY = mousePositionRef.current.y - iframeRect.top;
    
    // The scrollable area dimensions are the iframe dimensions
    const scrollableWidth = iframeRect.width;
    const scrollableHeight = iframeRect.height;
    
    // Calculate distances from edges using iframe coordinates (not content coordinates)
    // because we want to trigger scroll when near the visible iframe edges
    const distanceFromLeft = Math.max(0, iframeMouseX);
    const distanceFromRight = Math.max(0, scrollableWidth - iframeMouseX);
    const distanceFromTop = Math.max(0, iframeMouseY);
    const distanceFromBottom = Math.max(0, scrollableHeight - iframeMouseY);
    
    // Determine scroll directions based on threshold
    // Check if mouse is within the iframe bounds and near edges
    const shouldScrollLeft = distanceFromLeft < AUTO_SCROLL_THRESHOLD && iframeMouseX > 0;
    const shouldScrollRight = distanceFromRight < AUTO_SCROLL_THRESHOLD && iframeMouseX < scrollableWidth;
    const shouldScrollUp = distanceFromTop < AUTO_SCROLL_THRESHOLD && iframeMouseY > 0;
    const shouldScrollDown = distanceFromBottom < AUTO_SCROLL_THRESHOLD && iframeMouseY < scrollableHeight;
    
    // Calculate scroll speeds
    const leftSpeed = shouldScrollLeft ? calculateScrollSpeed(distanceFromLeft) : 0;
    const rightSpeed = shouldScrollRight ? calculateScrollSpeed(distanceFromRight) : 0;
    const upSpeed = shouldScrollUp ? calculateScrollSpeed(distanceFromTop) : 0;
    const downSpeed = shouldScrollDown ? calculateScrollSpeed(distanceFromBottom) : 0;
    
    // Update auto-scroll state
    const state = autoScrollStateRef.current;
    state.directions = {
      left: shouldScrollLeft,
      right: shouldScrollRight,
      top: shouldScrollUp,
      bottom: shouldScrollDown,
    };
    state.speeds = {
      horizontal: leftSpeed || rightSpeed,
      vertical: upSpeed || downSpeed,
    };
    state.isScrolling = shouldScrollLeft || shouldScrollRight || shouldScrollUp || shouldScrollDown;
    
    // Perform the actual scrolling
    if (state.isScrolling) {
      let scrollX = 0;
      let scrollY = 0;
      
      if (shouldScrollLeft) scrollX = -leftSpeed;
      else if (shouldScrollRight) scrollX = rightSpeed;
      
      if (shouldScrollUp) scrollY = -upSpeed;
      else if (shouldScrollDown) scrollY = downSpeed;
      
      // Apply scroll to iframe content
      if (scrollX !== 0 || scrollY !== 0) {
        try {
          iframeWindow.scrollBy(scrollX, scrollY);
        } catch (error) {
          console.warn('Auto-scroll failed:', error);
        }
      }
      
      // Continue scrolling
      animationFrameRef.current = requestAnimationFrame(performAutoScroll);
    } else {
      // Stop scrolling
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, []);

  // Mouse move handler for auto-scroll (parent document)
  const handleParentMouseMove = useCallback((event: MouseEvent) => {
    if (!activeLayerId) return;
    
    mousePositionRef.current = { x: event.clientX, y: event.clientY };
    
    // Start auto-scroll if not already running
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(performAutoScroll);
    }
  }, [activeLayerId, performAutoScroll]);

  // Mouse move handler for auto-scroll (iframe content)
  const handleIframeMouseMove = useCallback((event: MouseEvent) => {
    if (!activeLayerId) return;
    
    const iframeElements = getIframeElements();
    if (!iframeElements) return;
    
    const { iframe } = iframeElements;
    const iframeRect = iframe.getBoundingClientRect();
    
    // Convert iframe-relative mouse position to parent document coordinates
    const parentX = event.clientX + iframeRect.left;
    const parentY = event.clientY + iframeRect.top;
    
    mousePositionRef.current = { x: parentX, y: parentY };
    
    // Start auto-scroll if not already running
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(performAutoScroll);
    }
  }, [activeLayerId, performAutoScroll]);

  // Stop auto-scroll function
  const stopAutoScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    autoScrollStateRef.current = {
      isScrolling: false,
      directions: { left: false, right: false, top: false, bottom: false },
      speeds: { horizontal: 0, vertical: 0 },
    };
    
    mousePositionRef.current = null;
  }, []);

  // Create the custom collision detection instance fresh each time
  // Don't memoize this to ensure we always get fresh scroll positions during auto-scroll
  const collisionDetection = createTransformAwareCollisionDetection();

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
    } else {
      console.log('Drag start: Non-layer drag detected', active.data.current?.type);
    }
  }, []);

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
  }, [moveLayer, isLayerDescendantOf, stopAutoScroll]);

  const handleDragCancel = useCallback(() => {
    stopAutoScroll();
    setActiveLayerId(null);
  }, [stopAutoScroll]);

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

  // Auto-scroll event listeners setup/cleanup
  useEffect(() => {
    if (activeLayerId) {
      // Add global mouse move listener for auto-scroll on parent document
      document.addEventListener('mousemove', handleParentMouseMove);
      
      // Also add mouse move listener to iframe content window
      const iframeElements = getIframeElements();
      let iframeCleanup: (() => void) | null = null;
      
      if (iframeElements) {
        const { window: iframeWindow } = iframeElements;
        if (iframeWindow) {
          iframeWindow.addEventListener('mousemove', handleIframeMouseMove);
          iframeCleanup = () => {
            try {
              iframeWindow.removeEventListener('mousemove', handleIframeMouseMove);
            } catch (error) {
              // Iframe might be unmounted, ignore errors
              console.warn('Failed to remove iframe mouse listener:', error);
            }
          };
        }
      }
      
      return () => {
        document.removeEventListener('mousemove', handleParentMouseMove);
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

interface DragOverlayContentProps {
  layerId: string;
}

/* istanbul ignore next */
const DragOverlayContent: React.FC<DragOverlayContentProps> = ({ layerId }) => {
  const layer = useLayerStore((state) => state.findLayerById(layerId));
  
  if (!layer) return null;

  return (
    <div className="mt-10 bg-white shadow-lg border border-gray-200 rounded px-2 py-1 text-sm font-medium opacity-60 text-nowrap min-w-fit">
      {layer.name || layer.type}
    </div>
  );
};