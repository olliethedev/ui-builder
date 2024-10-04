import React, { useState } from "react";
import {
  Layer,
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { cn } from "@/lib/utils";
import { hasChildren as layerHasChildren } from "../../../../lib/ui-builder/store/layer-utils";
import { useHeTree, Id } from "he-tree-react";
import { TreeRowNode, TreeRowPlaceholder } from "./tree-row-node";

interface LayersPanelProps {
  className?: string;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ className }) => {
  const {
    selectedPageId,
    findLayersForPageId,
    updateLayer,
  } = useLayerStore();

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
    renderNodeBox: ({ stat, attrs, isPlaceholder }) => {
      return isPlaceholder ? (
        <TreeRowPlaceholder nodeAttributes={attrs} />
      ) : (
        <TreeRowNode
          key={attrs.key}
          nodeAttributes={attrs}
          node={stat.node}
          id={stat.id}
          open={stat.open}
          draggable={stat.draggable}
          onToggle={handleOpen}
          level={stat.level}
        />
      );
    },
    onDragOpen(stat) {
      handleOpen(stat.id, true);
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
