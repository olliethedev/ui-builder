import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  parentId: string;
  position: number;
  isActive?: boolean;
  className?: string;
  children?: React.ReactNode;
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

  if (!isActive) return null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-2 transition-all duration-200 my-1",
        isOver
          ? "bg-blue-500/30 border border-blue-500 rounded-sm"
          : "bg-blue-200/20 border border-blue-300 border-dashed rounded-sm"
      )}
      data-testid={`drop-placeholder-${parentId}-${position}`}
    />
  );
};