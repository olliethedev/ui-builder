import React from 'react';
import { GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface DragHandleProps {
  layerId: string;
  layerType: string;
  className?: string;
}

export const DragHandle: React.FC<DragHandleProps> = ({
  layerId,
  layerType,
  className,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: layerId,
    data: {
      type: 'layer',
      layerId,
      layerType,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "absolute top-0 left-0 transform -translate-x-full -translate-y-1/2 cursor-grab active:cursor-grabbing",
        "bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-md z-10",
        "opacity-100 transition-opacity duration-200",
        isDragging && "cursor-grabbing",
        className
      )}
      data-testid={`drag-handle-${layerId}`}
    >
      <GripVertical className="h-3 w-3" />
    </div>
  );
};