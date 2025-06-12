import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';

interface DropZoneProps {
  parentId: string;
  position: number;
  isActive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Utility function to detect flex direction from className
const getFlexDirection = (className?: string): 'row' | 'column' => {
  if (!className) return 'column'; // Default to column
  
  // Check for flex-row variants
  if (className.includes('flex-row')) return 'row';
  if (className.includes('flex-col')) return 'column';
  
  // Default to column if flex direction is not explicitly set
  return 'column';
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
}

export const DropPlaceholder: React.FC<DropPlaceholderProps> = ({
  parentId,
  position,
  isActive = false,
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

  // Get parent layer to determine flex direction
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const parentLayer = findLayerById(parentId);
  const parentClassName = parentLayer?.props?.className as string;
  const flexDirection = getFlexDirection(parentClassName);

  if (!isActive) return null;

  const isHorizontalLayout = flexDirection === 'row';

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute transition-all duration-150 pointer-events-auto z-20",
        "before:content-[''] before:absolute before:rounded-full before:transition-all before:duration-150",
        // Horizontal layout (flex-row): vertical lines between children
        isHorizontalLayout && [
          "inset-y-0 w-0.5",
          "before:inset-0 before:w-0.5",
          isOver
            ? "before:bg-blue-500 before:shadow-sm before:w-1 before:-left-0.5"
            : "before:bg-blue-400/40 before:w-0.5"
        ],
        // Vertical layout (flex-col): horizontal lines between children
        !isHorizontalLayout && [
          "inset-x-0 h-0.5",
          "before:inset-0 before:h-0.5",
          isOver
            ? "before:bg-blue-500 before:shadow-sm before:h-1 before:-top-0.5"
            : "before:bg-blue-400/40 before:h-0.5"
        ]
      )}
      style={
        isHorizontalLayout
          ? {
              left: position === 0 ? '-1px' : 'auto',
              right: position === 0 ? 'auto' : '-1px',
            }
          : {
              top: position === 0 ? '-1px' : 'auto',
              bottom: position === 0 ? 'auto' : '-1px',
            }
      }
      data-testid={`drop-placeholder-${parentId}-${position}`}
    />
  );
};