import React, { useEffect, useState } from "react";
import {
  Layer,
  useComponentStore,
  isTextLayer,
} from "@/components/ui/ui-builder/internal/store/component-store";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import {
  hasChildren,
  hasChildren as layerHasChildren,
} from "./store/layer-utils";
import { Button } from "@/components/ui/button";
import { useHeTree, Id } from "he-tree-react";

interface LayersPanelProps {
  className?: string;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ className }) => {
  const {
    selectedPageId,
    findLayersForPageId,
    selectLayer,
    selectedLayerId,
    updateLayer,
  } = useComponentStore();

  const layers = findLayersForPageId(selectedPageId);

  const [openIds, setopenIds] = useState<Id[] | undefined>([]);

  const handleOpen = (id: Id, open: boolean) => {
    if (open) {
      setopenIds([...(openIds || allIds), id]);
    } else {
      setopenIds((openIds || allIds).filter((i) => i !== id));
    }
  };

  const { renderTree, allIds } = useHeTree({
    data: layers,
    dataType: "tree",
    childrenKey: "children",
    openIds,
    dragOpen: true,
    onChange: (newLayers) => {
      updateLayer(selectedPageId, {}, { children: newLayers } as Partial<
        Omit<Layer, "props">
      >);
    },
    // renderNode: ({ id, node, open, draggable }) => (
    //   <div>
    //     <Button className="size-6" variant="ghost" size="icon" draggable={draggable}>
    //       <GripVertical className="size-4" />
    //     </Button>
    //     {hasChildren(node) && node.children.length > 0 && (
    //       <Button
    //         className="size-6"
    //         variant="ghost"
    //         size="icon"
    //         onClick={() => handleOpen(id, !open)}
    //       >
    //         {open ? (
    //           <ChevronDown className="w-4 h-4" />
    //         ) : (
    //           <ChevronRight className="w-4 h-4" />
    //         )}
    //       </Button>
    //     )}
    //     <Button
    //       variant="ghost"
    //       size="sm"
    //       className={cn(
    //         node.id === selectedLayerId
    //           ? "text-primary"
    //           : "text-muted-foreground"
    //       )}
    //       onClick={() => selectLayer(node.id)}
    //     >
    //       {node.name}
    //     </Button>
    //   </div>
    // ),
    renderNodeBox: ({ stat, attrs, isPlaceholder }) => {
      if (isPlaceholder) {
        return (
          <div {...attrs} key={attrs.key}>
            <div className="w-40 h-2 border-b border-blue-500 border-dashed"></div>
          </div>
        );
      } else {
        const { node, draggable, open, id } = stat;
        return (
          <div {...attrs} key={attrs.key} className="min-w-40 flex items-center">
            <Button
              className="w-4 h-6 rounded-none cursor-move"
              variant="ghost"
              size="icon"
              draggable={draggable}
            >
              <GripVertical className="size-4" />
            </Button>
            {hasChildren(node) && node.children.length > 0 && (
              <Button
                className="size-6"
                variant="ghost"
                size="icon"
                onClick={() => handleOpen(id, !open)}
              >
                {open ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                node.id === selectedLayerId
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              onClick={() => selectLayer(node.id)}
            >
              {node.name}
            </Button>
          </div>
        );
      }
    },
    onDragOpen(stat) {
      handleOpen(stat.id, true)
    },
    canDrop: (layer) => layerHasChildren(layer.node),
  });

  return (
    <div className={cn(className, "flex flex-col size-full overflow-x-auto")}>
      {renderTree()}
    </div>
  );
};

export default LayersPanel;
