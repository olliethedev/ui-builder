/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import isDeepEqual from "fast-deep-equal";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer } from "@/components/ui/ui-builder/types";
import { cn } from "@/lib/utils";
import {
  findAllParentLayersRecursive,
  hasLayerChildren,
} from "@/lib/ui-builder/store/layer-utils";
import { Plus } from "lucide-react";
import { useHeTree, Id } from "he-tree-react";
import {
  TreeRowNode,
  TreeRowPlaceholder,
} from "@/components/ui/ui-builder/internal/tree-row-node";
import { DevProfiler } from "@/components/ui/ui-builder/internal/dev-profiler";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/add-component-popover";
import { buttonVariants } from "@/components/ui/button";
import { DividerControl } from "@/components/ui/ui-builder/internal/divider-control";

interface LayersPanelProps {
  className?: string;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ className }) => {
  const {
    selectedPageId,
    selectedLayerId,
    findLayerById,
    updateLayer,
    selectLayer,
    removeLayer,
    duplicateLayer,
  } = useLayerStore();

  const pageLayer = findLayerById(selectedPageId);

  const layers = useMemo(() => [pageLayer as ComponentLayer], [pageLayer]);

  if (!pageLayer) {
    return null;
  }

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
  layers: ComponentLayer[];
  selectedPageId: string;
  selectedLayerId: string | null;
  updateLayer: (
    layerId: string,
    newProps: Record<string, any>,
    layerRest?: Partial<Omit<ComponentLayer, "props">>
  ) => void;
  selectLayer: (layerId: string) => void;
  removeLayer: (layerId: string) => void;
  duplicateLayer: (layerId: string) => void;
}

export const LayersTree: React.FC<LayersTreeProps> = React.memo(
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

    const handleNodeToggle = useCallback((id: Id, open: boolean) => {
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

    const handleChange = useCallback(
      (newLayers: unknown) => {
        if (Array.isArray(newLayers) && newLayers.length > 0) {
          const updatedPageLayer = newLayers[0] as ComponentLayer;
          const updatedChildren = hasLayerChildren(updatedPageLayer)
            ? updatedPageLayer.children
            : [];
          updateLayer(selectedPageId, {}, { children: updatedChildren });
        } else {
          console.error(
            "LayersTree onChange: Invalid newLayers structure received",
            newLayers
          );
        }
      },
      [updateLayer, selectedPageId]
    );

    const handleDragOpen = useCallback(
      (stat: { node: ComponentLayer; id: Id }) => {
        if (hasLayerChildren(stat.node)) {
          handleNodeToggle(stat.id, true);
        }
      },
      [handleNodeToggle]
    );

    const canNodeDrop = useCallback((layer: { node: ComponentLayer }) => {
      const isDroppable = hasLayerChildren(layer.node);
      return isDroppable;
    }, []);

    const renderNode = useCallback(
      ({ stat, attrs, isPlaceholder }: any) => {
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
            onToggle={handleNodeToggle}
            level={stat.level}
            selectedLayerId={selectedLayerId}
            selectLayer={selectLayer}
            removeLayer={removeLayer}
            duplicateLayer={duplicateLayer}
            updateLayer={updateLayer}
          />
        );
      },
      [
        handleNodeToggle,
        selectedLayerId,
        selectLayer,
        removeLayer,
        duplicateLayer,
        updateLayer,
      ]
    );

    const data = useMemo(() => {
      return {
        data: layers,
        dataType: "tree" as const,
        childrenKey: "children",
        openIds: Array.from(openIds),
        dragOpen: true,
        onChange: handleChange,
        renderNodeBox: renderNode,
        onDragOpen: handleDragOpen,
        canDrop: canNodeDrop,
      };
    }, [
      layers,
      openIds,
      handleChange,
      renderNode,
      handleDragOpen,
      canNodeDrop,
    ]);

    const { renderTree, scrollToNode } = useHeTree<ComponentLayer>(data);

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

    const buttonClass = useMemo(() => {
      return cn(
        buttonVariants({ variant: "default", size: "sm" }),
        "cursor-pointer w-full"
      );
    }, []);

    return (
      <DevProfiler id="LayersPanel" threshold={40}>
        <div
          data-testid="layers-tree"
          className={cn(
            className,
            "flex flex-col size-full overflow-x-auto pl-4"
          )}
        >
          {layers.length > 0 ? (
            <>
              <DividerControl
                className="border-l border-dashed border-primary"
                addPosition={0}
                parentLayerId={selectedPageId}
              />
              {renderTree()}
              <div className="relative">
                <div className="w-[1px] h-4 absolute left-0 bottom-0 border-l border-dashed border-primary bg-background" />
              </div>
              <DividerControl
                className="border-l border-dashed border-primary"
                parentLayerId={selectedPageId}
              />
            </>
          ) : (
            <AddComponentsPopover
              parentLayerId={selectedPageId}
              className="w-full mt-4"
            >
              <div
                className={buttonClass}
              >
                <span className="sr-only">Add Component</span>
                <Plus className="h-5 w-5" />
                <span>Add Component</span>
              </div>
            </AddComponentsPopover>
          )}
        </div>
      </DevProfiler>
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
