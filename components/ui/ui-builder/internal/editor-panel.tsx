import React from "react";
import {
  countLayers,
  Layer,
  PageLayer,
  useComponentStore,
} from "@/components/ui/ui-builder/internal/store/component-store";
import { DividerControl } from "@/components/ui/ui-builder/internal/divider-control";
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { cn } from "@/lib/utils";

interface EditorPanelProps {
  className?: string;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ className }) => {
  const {
    selectLayer,
    selectedLayerId,
    findLayerById,
    duplicateLayer,
    removeLayer,
    selectedPageId,
  } = useComponentStore();

  console.log("EditorPanel", { selectedLayerId });
  const selectedLayer = findLayerById(selectedLayerId) as Layer;
  const selectedPage = findLayerById(selectedPageId) as PageLayer;
  console.log("selected", { selectedLayer, selectedPage });

  const layers = selectedPage.children;

  const onSelectElement = (layerId: string) => {
    console.log("onSelectElement", layerId);
    selectLayer(layerId);
  };

  const handleDeleteLayer = () => {
    if (selectedLayer) {
      removeLayer(selectedLayer.id);
    }
  };

  const handleDuplicateLayer = () => {
    if (selectedLayer) {
      duplicateLayer(selectedLayer.id);
    }
  };

  const editorConfig = {
    zIndex: 1,
    totalLayers: countLayers(layers),
    selectedLayer: selectedLayer,
    onSelectElement: onSelectElement,
    handleDuplicateLayer: handleDuplicateLayer,
    handleDeleteLayer: handleDeleteLayer,
  };

  return (
    <div className={cn("relative size-full", className)}>
      <div className="absolute inset-0 size-full  bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:16px_16px]" />
      {layers.length > 0 && (
        <DividerControl addPosition={0} parentLayerId={selectedPageId} />
      )}
      <LayerRenderer page={selectedPage} editorConfig={editorConfig} />
      <DividerControl parentLayerId={selectedPageId} />
    </div>
  );
};

export default EditorPanel;
