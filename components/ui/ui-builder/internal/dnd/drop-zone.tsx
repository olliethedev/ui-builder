import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { useDndContext } from '@/lib/ui-builder/context/dnd-context';

// Constants for repeated class patterns
const BEFORE_CENTER_TRANSFORM = "before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2";
const BEFORE_ROUNDED_DEFAULT = "before:rounded-full";
const BEFORE_ROUNDED_HOVER = "before:rounded-sm";
const BEFORE_TRANSITION = "before:transition-all before:duration-200";

// Drop zone background patterns
const DROP_ZONE_ACTIVE_BG = "bg-blue-500/20 border-2 border-blue-500 border-dashed rounded-md";
const DROP_ZONE_INACTIVE_BG = "bg-blue-200/10 border border-blue-300 border-dashed rounded-md";
const DROP_ZONE_DISABLED_BG = "bg-gray-200/20 border border-gray-300 border-dashed rounded-md";

// Drop indicator patterns for different states
const DROP_INDICATOR_HOVER = "before:bg-blue-500 before:shadow-xl";
const DROP_INDICATOR_DEFAULT = "before:bg-blue-400/50";
const DROP_INDICATOR_INLINE_HOVER = "before:bg-blue-500 before:shadow-lg";
const DROP_INDICATOR_INLINE_DEFAULT = "before:bg-blue-400/40";
const DROP_INDICATOR_DISABLED = "before:bg-gray-400/30";
const DROP_INDICATOR_DISABLED_HOVER = "before:bg-gray-500/40";

interface DropZoneProps {
  parentId: string;
  position: number;
  isActive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Utility function to detect layout type from computed styles
/* istanbul ignore next - DOM-dependent layout detection, tested via integration/e2e */
export function getLayoutType(element: HTMLElement): 'flex-row' | 'flex-col' | 'grid' | 'inline' | 'block' {
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
  // Check if drop is valid using the DND context
  const dndContext = useDndContext();
  const isDropValid = dndContext.canDropOnLayer(parentId);

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
    // Disable the droppable when drop is not valid (e.g., childOf constraint violation)
    disabled: !isDropValid,
  });

  // Determine background based on validity and hover state
  const getDropZoneBg = () => {
    if (!isDropValid) {
      return DROP_ZONE_DISABLED_BG;
    }
    return isOver ? DROP_ZONE_ACTIVE_BG : DROP_ZONE_INACTIVE_BG;
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative",
        !isDropValid && "opacity-60",
        className
      )}
      data-testid={`drop-zone-${parentId}-${position}`}
      data-drop-valid={isDropValid}
    >
      {/* Drop indicator */}
      {isActive && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none transition-all duration-200",
            getDropZoneBg()
          )}
        />
      )}
      
      {/* Placeholder for empty drop zones */}
      {isActive && !children && (
        <div
          className={cn(
            "h-8 transition-all duration-200",
            getDropZoneBg()
          )}
        >
          <div className={cn(
            "flex items-center justify-center h-full text-xs font-medium",
            isDropValid ? "text-blue-600" : "text-gray-400"
          )}>
            {isDropValid ? "Drop here" : "Cannot drop here"}
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
  // State for calculated position and layout
  const [layoutType, setLayoutType] = React.useState<'flex-row' | 'flex-col' | 'grid' | 'inline' | 'block'>('block');
  const [calculatedStyle, setCalculatedStyle] = React.useState<React.CSSProperties | null>(null);
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  
  // Get the DND context to check what's being dragged and if drop is valid
  const dndContext = useDndContext();
  
  // Check if the drop is valid for this parent (childOf constraint validation)
  const isDropValid = dndContext.canDropOnLayer(parentId);

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
    // Disable the droppable when drop is not valid (e.g., childOf constraint violation)
    disabled: !isDropValid,
  });
  
  /* istanbul ignore next - DOM position calculation, tested via e2e */
  React.useLayoutEffect(() => {
    if (!isActive || !element) return;
    
    // Find the parent container (the element with data-layer-id that contains us)
    const parentContainer = element.closest(`[data-layer-id="${parentId}"]`) as HTMLElement;
    if (!parentContainer) return;
    
    // Detect the layout type from the parent container
    let detectedLayout = getLayoutType(parentContainer);
    
    // Override: If we're dragging an inline element, and parent is block,
    // treat it as inline flow to avoid breaking text layout
    if (dndContext?.activeLayerId) {
      const draggedElement = document.querySelector(`[data-layer-id="${dndContext.activeLayerId}"]`) as HTMLElement;
      
      if (draggedElement) {
        const draggedTagName = draggedElement.tagName.toLowerCase();
        const draggedDisplay = window.getComputedStyle(draggedElement).display;
        
        const isInlineElement = draggedDisplay === 'inline' || 
                               draggedDisplay === 'inline-block' ||
                               ['span', 'a', 'strong', 'em', 'code', 'small', 'mark', 'del', 'ins', 'sub', 'sup'].includes(draggedTagName);
        
        if (isInlineElement && detectedLayout === 'block') {
          detectedLayout = 'inline';
        }
      }
    }
    
    setLayoutType(detectedLayout);
    
    // Calculate position based on sibling element
    // The drop placeholder should position relative to the next sibling (the actual child element)
    // Note: The sibling might be wrapped in DevProfiler/ElementSelector, so we need to find
    // the actual element with data-layer-id within the sibling subtree
    const nextSibling = element.nextElementSibling as HTMLElement;
    let siblingElement: HTMLElement | null = null;
    
    if (nextSibling) {
      // Check if the sibling itself has data-layer-id
      if (nextSibling.hasAttribute('data-layer-id')) {
        siblingElement = nextSibling;
      } else {
        // Search within the sibling subtree for the element with data-layer-id
        siblingElement = nextSibling.querySelector('[data-layer-id]') as HTMLElement;
      }
    }
    
    const parentRect = parentContainer.getBoundingClientRect();
    
    if (siblingElement) {
      const siblingRect = siblingElement.getBoundingClientRect();
      
      // Calculate position relative to parent container
      const positionStyle: React.CSSProperties = {
        position: 'absolute',
        pointerEvents: 'auto',
        zIndex: 999,
      };
      
      // Position based on layout type
      if (detectedLayout === 'flex-row') {
        // Vertical line on the left edge of sibling
        positionStyle.left = siblingRect.left - parentRect.left - 4;
        positionStyle.top = siblingRect.top - parentRect.top;
        positionStyle.width = 8;
        positionStyle.height = siblingRect.height;
      } else if (detectedLayout === 'inline') {
        // Inline indicator
        positionStyle.left = siblingRect.left - parentRect.left - 3;
        positionStyle.top = siblingRect.top - parentRect.top;
        positionStyle.width = 6;
        positionStyle.height = siblingRect.height;
      } else if (detectedLayout === 'grid') {
        // Corner indicator
        positionStyle.left = siblingRect.left - parentRect.left - 4;
        positionStyle.top = siblingRect.top - parentRect.top - 4;
        positionStyle.width = 8;
        positionStyle.height = 8;
      } else {
        // Vertical layout (flex-col, block): horizontal line above sibling
        positionStyle.left = siblingRect.left - parentRect.left;
        positionStyle.top = siblingRect.top - parentRect.top - 4;
        positionStyle.width = siblingRect.width;
        positionStyle.height = 8;
      }
      
      setCalculatedStyle(positionStyle);
    } else {
      // No sibling (this is the last drop zone), position at the end
      // Get all child elements with data-layer-id (may be nested in wrapper elements)
      const childLayers = parentContainer.querySelectorAll('[data-layer-id]');
      // Filter to only include direct children of the parent (not nested grandchildren)
      const directChildLayers = Array.from(childLayers).filter(el => {
        // Walk up to find if the closest data-layer-id parent is the parentContainer itself
        const closestLayerParent = el.parentElement?.closest('[data-layer-id]');
        return closestLayerParent === parentContainer || closestLayerParent === null;
      });
      const lastChild = directChildLayers[directChildLayers.length - 1] as HTMLElement;
      
      if (lastChild) {
        const lastChildRect = lastChild.getBoundingClientRect();
        const positionStyle: React.CSSProperties = {
          position: 'absolute',
          pointerEvents: 'auto',
          zIndex: 999,
        };
        
        if (detectedLayout === 'flex-row') {
          // After the last child in a row
          positionStyle.left = lastChildRect.right - parentRect.left - 4;
          positionStyle.top = lastChildRect.top - parentRect.top;
          positionStyle.width = 8;
          positionStyle.height = lastChildRect.height;
        } else if (detectedLayout === 'inline') {
          positionStyle.left = lastChildRect.right - parentRect.left - 3;
          positionStyle.top = lastChildRect.top - parentRect.top;
          positionStyle.width = 6;
          positionStyle.height = lastChildRect.height;
        } else if (detectedLayout === 'grid') {
          positionStyle.left = lastChildRect.right - parentRect.left - 4;
          positionStyle.top = lastChildRect.top - parentRect.top - 4;
          positionStyle.width = 8;
          positionStyle.height = 8;
        } else {
          // Below the last child
          positionStyle.left = lastChildRect.left - parentRect.left;
          positionStyle.top = lastChildRect.bottom - parentRect.top - 4;
          positionStyle.width = lastChildRect.width;
          positionStyle.height = 8;
        }
        
        setCalculatedStyle(positionStyle);
      } else {
        // Empty container - position at start
        setCalculatedStyle({
          position: 'absolute',
          pointerEvents: 'auto',
          zIndex: 999,
          left: 0,
          top: 0,
          right: 0,
          height: 8,
        });
      }
    }
  }, [isActive, element, parentId, position, dndContext?.activeLayerId]);
  
  // Combine refs
  const combinedRef = React.useCallback((node: HTMLDivElement | null) => {
    setElement(node);
    setNodeRef(node);
  }, [setNodeRef]);

  if (!isActive) return null;

  // Use calculated style if available, otherwise fall back to CSS classes
  const useCalculatedPositioning = calculatedStyle !== null;

  // Determine indicator styles based on drop validity
  const getIndicatorStyles = (baseHover: string, baseDefault: string) => {
    if (!isDropValid) {
      return isOver ? DROP_INDICATOR_DISABLED_HOVER : DROP_INDICATOR_DISABLED;
    }
    return isOver ? baseHover : baseDefault;
  };

  return (
    <div
      ref={combinedRef}
      className={cn(
        // Always apply absolute positioning base classes
        "absolute pointer-events-auto z-[999]",
        "before:content-[''] before:absolute",
        BEFORE_TRANSITION,
        "before:pointer-events-none",
        // Disabled state visual cue
        !isDropValid && "opacity-60 cursor-not-allowed",
        // Fallback positioning classes when calculatedStyle is not available
        !useCalculatedPositioning && !style && [
          // Flex-row layout: vertical lines on left edge
          layoutType === 'flex-row' && [
            "-left-1 top-0 bottom-0 w-2",
            BEFORE_CENTER_TRANSFORM,
            "before:w-1 before:h-8",
            getIndicatorStyles(
              `${DROP_INDICATOR_HOVER} ${BEFORE_ROUNDED_HOVER} before:w-2 before:h-16`,
              `${DROP_INDICATOR_DEFAULT} ${BEFORE_ROUNDED_DEFAULT} before:w-1 before:h-6`
            )
          ],
          // Inline layout: subtle vertical indicators
          layoutType === 'inline' && [
            "-left-1 top-0 bottom-0 w-2",
            BEFORE_CENTER_TRANSFORM,
            "before:w-0.5 before:h-4",
            getIndicatorStyles(
              `${DROP_INDICATOR_INLINE_HOVER} ${BEFORE_ROUNDED_HOVER} before:w-1 before:h-8`,
              `${DROP_INDICATOR_INLINE_DEFAULT} ${BEFORE_ROUNDED_DEFAULT} before:w-0.5 before:h-3`
            )
          ],
          // Vertical layout (flex-col, block): horizontal lines on top edge
          (layoutType === 'flex-col' || layoutType === 'block') && [
            "left-0 right-0 -top-1 h-2",
            BEFORE_CENTER_TRANSFORM,
            "before:h-1 before:w-8",
            getIndicatorStyles(
              `${DROP_INDICATOR_HOVER} ${BEFORE_ROUNDED_HOVER} before:h-2 before:w-16`,
              `${DROP_INDICATOR_DEFAULT} ${BEFORE_ROUNDED_DEFAULT} before:h-1 before:w-6`
            )
          ],
          // Grid layout: corner indicator
          layoutType === 'grid' && [
            "-left-1 -top-1 w-2 h-2",
            BEFORE_CENTER_TRANSFORM,
            "before:h-2 before:w-2",
            getIndicatorStyles(
              `${DROP_INDICATOR_HOVER} ${BEFORE_ROUNDED_HOVER} before:h-4 before:w-4`,
              `${DROP_INDICATOR_DEFAULT} ${BEFORE_ROUNDED_DEFAULT} before:h-2 before:w-2`
            )
          ]
        ],
        // When using calculated positioning, only apply visual indicator classes
        useCalculatedPositioning && [
          BEFORE_CENTER_TRANSFORM,
          layoutType === 'flex-row' && [
            "before:w-1 before:h-8",
            getIndicatorStyles(
              `${DROP_INDICATOR_HOVER} ${BEFORE_ROUNDED_HOVER} before:w-2 before:h-16`,
              `${DROP_INDICATOR_DEFAULT} ${BEFORE_ROUNDED_DEFAULT}`
            )
          ],
          layoutType === 'inline' && [
            "before:w-0.5 before:h-4",
            getIndicatorStyles(
              `${DROP_INDICATOR_INLINE_HOVER} ${BEFORE_ROUNDED_HOVER}`,
              `${DROP_INDICATOR_INLINE_DEFAULT} ${BEFORE_ROUNDED_DEFAULT}`
            )
          ],
          (layoutType === 'flex-col' || layoutType === 'block') && [
            "before:h-1 before:w-8",
            getIndicatorStyles(
              `${DROP_INDICATOR_HOVER} ${BEFORE_ROUNDED_HOVER} before:h-2 before:w-16`,
              `${DROP_INDICATOR_DEFAULT} ${BEFORE_ROUNDED_DEFAULT}`
            )
          ],
          layoutType === 'grid' && [
            "before:h-2 before:w-2",
            getIndicatorStyles(
              `${DROP_INDICATOR_HOVER} ${BEFORE_ROUNDED_HOVER}`,
              `${DROP_INDICATOR_DEFAULT} ${BEFORE_ROUNDED_DEFAULT}`
            )
          ]
        ],
        // Custom style overrides
        style && [
          isDropValid 
            ? ["before:bg-blue-500/60 before:rounded-sm", isOver && "before:bg-blue-600 before:shadow-md"]
            : ["before:bg-gray-400/30 before:rounded-sm", isOver && "before:bg-gray-500/40"]
        ]
      )}
      style={useCalculatedPositioning ? calculatedStyle! : style}
      data-testid={`drop-placeholder-${parentId}-${position}`}
      data-drop-indicator
      data-drop-valid={isDropValid}
    />
  );
};