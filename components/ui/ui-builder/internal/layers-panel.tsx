/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Profiler, useCallback, useLayoutEffect, useRef, useState } from "react";
import isDeepEqual from "fast-deep-equal";
import { Layer, useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { cn } from "@/lib/utils";
import {
  findAllParentLayersRecursive,
  hasLayerChildren,
} from "@/lib/ui-builder/store/layer-utils";
import { useHeTree, Id } from "he-tree-react";
import {
  TreeRowNode,
  TreeRowPlaceholder,
} from "@/components/ui/ui-builder/internal/tree-row-node";

interface LayersPanelProps {
  className?: string;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ className }) => {
  const {
    selectedPageId,
    selectedLayerId,
    findLayersForPageId,
    updateLayer,
    selectLayer,
    removeLayer,
    duplicateLayer,
  } = useLayerStore();

  const layers = findLayersForPageId(selectedPageId);

  return (
    <LayersTree
      className={className}
      layers={layers}
      selectedPageId={selectedPageId}
      selectedLayerId={selectedLayerId}
      updateLayer={updateLayer}
      selectLayer={selectLayer}
      removeLayer={removeLayer}
      duplicateLayer={duplicateLayer}
    />
  );
};

interface LayersTreeProps {
  className?: string;
  layers: Layer[];
  selectedPageId: string;
  selectedLayerId: string | null;
  updateLayer: (
    layerId: string,
    newProps: Record<string, any>,
    layerRest?: Partial<Omit<Layer, "props">>
  ) => void;
  selectLayer: (layerId: string) => void;
  removeLayer: (layerId: string) => void;
  duplicateLayer: (layerId: string) => void;
}

const LayersTree: React.FC<LayersTreeProps> = React.memo(
  ({
    className,
    layers,
    selectedPageId,
    selectedLayerId,
    updateLayer,
    selectLayer,
    removeLayer,
    duplicateLayer,
  }) => {
    const [openIds, setOpenIds] = useState<Set<Id>>(new Set());

    const prevSelectedLayerId = useRef(selectedLayerId);

    const { renderTree, scrollToNode } = useHeTree({
      data: layers,
      dataType: "tree",
      childrenKey: "children",
      openIds: Array.from(openIds),
      dragOpen: true,
      onChange: (newLayers) => {
        updateLayer(selectedPageId, {}, { children: newLayers });
      },
      renderNodeBox: ({ stat, attrs, isPlaceholder }) => {
        return isPlaceholder ? (
          <TreeRowPlaceholder
            key={`placeholder-${attrs.key}`}
            nodeAttributes={attrs}
          />
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
        if (hasLayerChildren(stat.node)) {
          handleOpen(stat.id, true);
        }
      },
      canDrop: (layer) => {
        const isDroppable = hasLayerChildren(layer.node);
        return isDroppable;
      },
    });

    useLayoutEffect(() => {
      if (selectedLayerId) {
        const parentLayers = findAllParentLayersRecursive(
          layers,
          selectedLayerId
        );
        const parentIds = parentLayers.map((layer) => layer.id);
        setOpenIds((prevOpenIds) => {
          const updatedSet = new Set(prevOpenIds);
          parentIds.forEach((id) => updatedSet.add(id));
          return updatedSet;
        });
      }
    }, [selectedLayerId, layers]);

    useLayoutEffect(() => {
      if (prevSelectedLayerId.current !== selectedLayerId) {
        prevSelectedLayerId.current = selectedLayerId;
        if (selectedLayerId) {
          scrollToNode(selectedLayerId);
        }
      }
    }, [scrollToNode, selectedLayerId]);

    const handleOpen = useCallback((id: Id, open: boolean) => {
      setOpenIds((prev) => {
        const newSet = new Set(prev);
        if (open) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
    }, []);

    return (
      <Profiler
        id="LayersPanel"
        onRender={(id, phase, actualDuration) => {
          if (actualDuration > 20) {
            console.log(`%c${id} ${phase} ${actualDuration}`, "color: red");
          }
        }}
      >
        <div
          className={cn(className, "flex flex-col size-full overflow-x-auto")}
        >
          {renderTree()}
        </div>
      </Profiler>
    );
  },
  (prevProps, nextProps) => {
    return (
      isDeepEqual(prevProps.layers, nextProps.layers) &&
      prevProps.selectedPageId === nextProps.selectedPageId &&
      prevProps.selectedLayerId === nextProps.selectedLayerId &&
      prevProps.className === nextProps.className
    );
  }
);

LayersTree.displayName = "LayersTree";

export default LayersPanel;
