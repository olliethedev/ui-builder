import React, { useCallback, useEffect, useState } from "react";
import {
  Layer,
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { cn } from "@/lib/utils";
import { findAllParentLayersRecursive, hasChildren as layerHasChildren } from "../../../../lib/ui-builder/store/layer-utils";
import { useHeTree, Id } from "he-tree-react";
import { TreeRowNode, TreeRowPlaceholder } from "@/components/ui/ui-builder/internal/tree-row-node";

interface LayersPanelProps {
  className?: string;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ className }) => {
  
  const selectedPageId = useLayerStore((state) => state.selectedPageId);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const findLayersForPageId = useLayerStore((state) => state.findLayersForPageId);
  const updateLayer = useLayerStore((state) => state.updateLayer);
  const selectLayer = useLayerStore((state) => state.selectLayer);
  const removeLayer = useLayerStore((state) => state.removeLayer);
  const duplicateLayer = useLayerStore((state) => state.duplicateLayer);

  const layers = findLayersForPageId(selectedPageId);

  const [openIds, setOpenIds] = useState<Set<Id>>(new Set());



  const { renderTree } = useHeTree({
    data: layers,
    dataType: "tree",
    childrenKey: "children",
    openIds: Array.from(openIds),
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
          selectedLayerId={selectedLayerId}
          selectLayer={selectLayer}
          removeLayer={removeLayer}
          duplicateLayer={duplicateLayer}
          updateLayer={updateLayer}
        />
      );
    },
    onDragOpen(stat) {
      handleOpen(stat.id, true);
    },
    canDrop: (layer) => layerHasChildren(layer.node),
  });

  useEffect(() => {
    if (selectedLayerId) {
      const parentLayers = findAllParentLayersRecursive(layers, selectedLayerId);
      const parentIds = parentLayers.map((layer) => layer.id);
      setOpenIds((prevOpenIds) => {
        const updatedSet = new Set(prevOpenIds);
        parentIds.forEach((id) => updatedSet.add(id));
        return updatedSet;
      });
    }
  }, [selectedLayerId, layers]);

  const handleOpen = useCallback(
    (id: Id, open: boolean) => {
      setOpenIds((prev) => {
        const newSet = new Set(prev);
        if (open) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
    },
    []
  );

  return (
    <div className={cn(className, "flex flex-col size-full overflow-x-auto")}>
      {renderTree()}
    </div>
  );
};

export default LayersPanel;
