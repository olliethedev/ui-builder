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

// Utility function to detect actual layout from computed styles and child content
const getLayoutType = (element: HTMLElement | null): 'flex-row' | 'flex-col' | 'grid' | 'inline' | 'block' => {
  if (!element) return 'block';
  
  const computedStyle = window.getComputedStyle(element);
  const display = computedStyle.display;
  
  // Check for CSS Grid (including inline-grid)
  if (display.includes('grid')) {
    return 'grid';
  }
  
  // Check for Flexbox (flex and inline-flex)
  if (display.includes('flex')) {
    const flexDirection = computedStyle.flexDirection;
    return flexDirection === 'row' || flexDirection === 'row-reverse' ? 'flex-row' : 'flex-col';
  }
  
  // Check for inline elements (these flow horizontally like flex-row)
  if (display === 'inline' || display === 'inline-block') {
    return 'inline';
  }
  
  // Check for table-related displays (these have specific layout rules)
  if (display.startsWith('table')) {
    // table-row flows horizontally, table flows vertically
    return display === 'table-row' ? 'inline' : 'block';
  }
  
  // Check for list-item (typically flows vertically)
  if (display === 'list-item') {
    return 'block';
  }
  
  // Check for contents (element doesn't generate a box)
  if (display === 'contents') {
    // For contents, we should probably check the parent's display
    const parent = element.parentElement;
    if (parent) {
      return getLayoutType(parent);
    }
    return 'block';
  }
  
  // Check for hidden elements
  if (display === 'none') {
    return 'block'; // Fallback, though this shouldn't normally be droppable
  }
  
  // CRITICAL: For block containers, check if children are inline
  if (display === 'block') {
    // Look at existing children to determine content flow
    const allChildren = Array.from(element.children);
    const nonDropChildren = allChildren.filter(
      child => !child.hasAttribute('data-drop-indicator')
    );
    
    console.log('🔍 Block container analysis:', {
      elementTag: element.tagName,
      allChildren: allChildren.length,
      nonDropChildren: nonDropChildren.length,
      childrenDetails: nonDropChildren.map(child => ({
        tag: child.tagName,
        display: window.getComputedStyle(child).display,
        classes: child.className
      }))
    });
    
    if (nonDropChildren.length > 0) {
      // Check if most children are inline/inline-block
      const inlineChildren = nonDropChildren.filter(child => {
        const childDisplay = window.getComputedStyle(child).display;
        return childDisplay === 'inline' || childDisplay === 'inline-block';
      });
      
      console.log('🔍 Inline detection:', {
        totalChildren: nonDropChildren.length,
        inlineChildren: inlineChildren.length,
        shouldBeInline: inlineChildren.length > nonDropChildren.length / 2
      });
      
      // If majority of children are inline, treat as inline flow
      if (inlineChildren.length > nonDropChildren.length / 2) {
        return 'inline';
      }
    }
  }
  
  // Default to block for everything else
  return 'block';
};

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

  const findLayerById = useLayerStore((state) => state.findLayerById);

  if (!isActive) return null;

  // Get parent layer to determine layout
  const parentLayer = findLayerById(parentId);
  const parentClassName = typeof parentLayer?.props?.className === 'string' ? parentLayer.props.className : '';
  
  // Determine layout type based on parent's className
  const isHorizontalLayout = parentClassName.includes('flex-row');
  const isVerticalLayout = parentClassName.includes('flex-col') || !parentClassName.includes('flex-row');
  
  // Calculate positioning styles based on layout and position
  const getPositioningStyle = (): React.CSSProperties => {
    if (style) return style;
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: isHorizontalLayout ? '2px' : '100%',
      height: isHorizontalLayout ? '100%' : '2px',
      backgroundColor: isOver ? '#3b82f6' : '#93c5fd',
      borderRadius: '1px',
      zIndex: 20,
    };

    if (isHorizontalLayout) {
      // For horizontal layout (flex-row), show vertical drop lines
      if (position === 0) {
        return { ...baseStyle, left: '-1px' };
      } else {
        return { ...baseStyle, right: '-1px' };
      }
    } else {
      // For vertical layout (flex-col or default), show horizontal drop lines
      if (position === 0) {
        return { ...baseStyle, top: '-1px' };
      } else {
        return { ...baseStyle, bottom: '-1px' };
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={getPositioningStyle()}
      data-testid={`drop-placeholder-${parentId}-${position}`}
      data-drop-indicator
    />
  );
};