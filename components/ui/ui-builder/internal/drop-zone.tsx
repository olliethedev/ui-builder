import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { useDndContext } from './dnd-context';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';

interface DropZoneProps {
  parentId: string;
  position: number;
  isActive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Utility function to detect layout type from computed styles
function getLayoutType(element: HTMLElement): 'flex-row' | 'flex-col' | 'grid' | 'inline' | 'block' {
  const styles = window.getComputedStyle(element);
  const display = styles.display;
  const flexDirection = styles.flexDirection;
  
  // Handle flex layouts
  if (display === 'flex' || display === 'inline-flex') {
    return flexDirection === 'row' || flexDirection === 'row-reverse' ? 'flex-row' : 'flex-col';
  }
  
  // Handle grid layouts
  if (display === 'grid' || display === 'inline-grid') {
    return 'grid';
  }
  
  // Handle inline layouts
  if (display === 'inline' || display === 'inline-block') {
    return 'inline';
  }
  
  // CRITICAL: For block containers, check if children are inline
  if (display === 'block') {
    // Look at existing children to determine content flow
    const allChildren = Array.from(element.children);
    const nonDropChildren = allChildren.filter(
      child => !child.hasAttribute('data-drop-indicator')
    );
    
    if (nonDropChildren.length > 0) {
      // Check if most children are inline/inline-block
      const inlineChildren = nonDropChildren.filter(child => {
        const childDisplay = window.getComputedStyle(child).display;
        return childDisplay === 'inline' || childDisplay === 'inline-block';
      });
      
      // If majority of children are inline, treat as inline flow
      if (inlineChildren.length > nonDropChildren.length / 2) {
        return 'inline';
      }
    }
  }
  
  // Default to block for most other display types
  return 'block';
}

export const DropZone: React.FC<DropZoneProps> = ({
  parentId,
  position,
  isActive = false,
  className,
  children,
}) => {
  const {
    isOver,
    setNodeRef,
  } = useDroppable({
    id: `${parentId}-${position}`,
    data: {
      type: 'drop-zone',
      parentId,
      position,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative",
        className
      )}
      data-testid={`drop-zone-${parentId}-${position}`}
    >
      {/* Drop indicator */}
      {isActive && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none transition-all duration-200",
            isOver
              ? "bg-blue-500/20 border-2 border-blue-500 border-dashed rounded-md"
              : "bg-blue-200/10 border border-blue-300 border-dashed rounded-md"
          )}
        />
      )}
      
      {/* Placeholder for empty drop zones */}
      {isActive && !children && (
        <div
          className={cn(
            "h-8 transition-all duration-200",
            isOver
              ? "bg-blue-500/20 border-2 border-blue-500 border-dashed rounded-md"
              : "bg-blue-200/10 border border-blue-300 border-dashed rounded-md"
          )}
        >
          <div className="flex items-center justify-center h-full text-xs text-blue-600 font-medium">
            Drop here
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};

interface DropPlaceholderProps {
  parentId: string;
  position: number;
  isActive?: boolean;
  style?: React.CSSProperties;
}

export const DropPlaceholder: React.FC<DropPlaceholderProps> = ({
  parentId,
  position,
  isActive = false,
  style,
}) => {
  const {
    isOver,
    setNodeRef,
  } = useDroppable({
    id: `${parentId}-${position}`,
    data: {
      type: 'drop-zone',
      parentId,
      position,
    },
  });

  // Get parent element to determine actual layout type
  const [layoutType, setLayoutType] = React.useState<'flex-row' | 'flex-col' | 'grid' | 'inline' | 'block'>('block');
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  
  // Get the DND context to check what's being dragged
  const dndContext = useDndContext();
  
  React.useLayoutEffect(() => {
    if (!isActive || !element) return;
    
    // Find the parent element to determine layout - walk up to find the actual container
    let parentElement = element.parentElement;
    
    // Walk up until we find the actual layout container (skip relative wrapper)
    while (parentElement && parentElement.classList.contains('relative') && parentElement.children.length === 2) {
      parentElement = parentElement.parentElement;
    }
    
    if (parentElement) {
      let detectedLayout = getLayoutType(parentElement);
      
      // Override: If we're dragging an inline element, and parent is block,
      // treat it as inline flow to avoid breaking text layout
      if (dndContext?.activeLayerId) {
        // Find the actual DOM element being dragged by looking for elements with matching layer ID
        const draggedElement = document.querySelector(`[data-layer-id="${dndContext.activeLayerId}"]`) as HTMLElement;
        
        if (draggedElement) {
          const draggedTagName = draggedElement.tagName.toLowerCase();
          const draggedDisplay = window.getComputedStyle(draggedElement).display;
          
          // Check if the dragged element is inline or inline-block
          const isInlineElement = draggedDisplay === 'inline' || 
                                 draggedDisplay === 'inline-block' ||
                                 ['span', 'a', 'strong', 'em', 'code', 'small', 'mark', 'del', 'ins', 'sub', 'sup'].includes(draggedTagName);
          
          if (isInlineElement && detectedLayout === 'block') {
            detectedLayout = 'inline';
          }
        }
      }
      
      setLayoutType(detectedLayout);
    }
  }, [isActive, element, parentId, position, dndContext?.activeLayerId]);
  
  // Combine refs
  const combinedRef = React.useCallback((node: HTMLDivElement | null) => {
    setElement(node);
    setNodeRef(node);
  }, [setNodeRef]);

  if (!isActive) return null;

  // CRITICAL FIX: Use absolute positioning with precise calculations
  return (
    <div
      ref={combinedRef}
      className={cn(
        "absolute pointer-events-auto z-[999]",
        "before:content-[''] before:absolute before:transition-all before:duration-200",
        "before:pointer-events-none",
        // Use custom style if provided, otherwise use default layout-based positioning
        !style && [
          // Flex-row layout: vertical lines on the left edge
          layoutType === 'flex-row' && [
            "-left-2 top-0 bottom-0 w-4",
            "before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2",
            "before:w-0.5 before:h-6 before:rounded-full",
            isOver
              ? "before:bg-blue-500 before:shadow-xl before:w-1 before:h-10"
              : "before:bg-blue-400/50 before:w-0.5 before:h-4"
          ],
          // Inline layout: subtle vertical indicators for text flow
          layoutType === 'inline' && [
            "-left-1 top-0 bottom-0 w-2",
            "before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2",
            "before:w-px before:h-3 before:rounded-full",
            isOver
              ? "before:bg-blue-500 before:shadow-lg before:w-0.5 before:h-5"
              : "before:bg-blue-400/40 before:w-px before:h-2"
          ],
          // Vertical layout (flex-col, block): horizontal lines on the top edge
          (layoutType === 'flex-col' || layoutType === 'block') && [
            "left-0 right-0 -top-2 h-4",
            "before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2",
            "before:h-0.5 before:w-6 before:rounded-full",
            isOver
              ? "before:bg-blue-500 before:shadow-xl before:h-1 before:w-10"
              : "before:bg-blue-400/50 before:h-0.5 before:w-4"
          ],
          // Grid layout: corner indicator
          layoutType === 'grid' && [
            "-left-2 -top-2 w-4 h-4",
            "before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2",
            "before:h-1 before:w-1 before:rounded-full",
            isOver
              ? "before:bg-blue-500 before:shadow-xl before:h-2 before:w-2"
              : "before:bg-blue-400/50 before:h-1 before:w-1"
          ]
        ],
        // Custom style overrides for absolute positioning
        style && [
          "before:bg-blue-500/60 before:rounded-sm",
          isOver && "before:bg-blue-600 before:shadow-md"
        ]
      )}
      style={style}
      data-testid={`drop-placeholder-${parentId}-${position}`}
      data-drop-indicator
    />
  );
};