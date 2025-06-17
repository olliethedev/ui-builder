import React, { useMemo } from 'react';
import { GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { DragHandleContext } from "./editor-panel";

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

  const { setDragging } = React.useContext(DragHandleContext);

  React.useEffect(() => {
    setDragging(!!isDragging);
    return () => setDragging(false);
  }, [isDragging, setDragging]);

  const style = useMemo(() => {
    return {
      transform: CSS.Translate.toString(transform),
    };
  }, [transform]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "absolute top-0 left-0 transform -translate-x-full -translate-y-full cursor-grab active:cursor-grabbing",
        "bg-blue-500 hover:bg-blue-600 text-white p-px shadow-md z-10",
        "opacity-100 transition-opacity duration-200",
        isDragging && "cursor-grabbing",
        className
      )}
      data-testid={`drag-handle-${layerId}`}
    >
      <GripVertical size={14} />
    </div>
  );
};