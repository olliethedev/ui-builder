import React from "react";
import {
  countLayers,
  Layer,
  PageLayer,
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
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
  } = useLayerStore();
  const selectedLayer = findLayerById(selectedLayerId) as Layer;
  const selectedPage = findLayerById(selectedPageId) as PageLayer;

  const layers = selectedPage.children;

  const onSelectElement = (layerId: string) => {
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
    <div id="editor-panel-container" className={cn("relative size-full bg-primary/5", className)}>
      <div className="absolute inset-0 size-full z-[-1] bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:16px_16px]" />
      {layers.length > 0 && (
        <DividerControl addPosition={0} parentLayerId={selectedPageId} />
      )}
      <LayerRenderer page={selectedPage} editorConfig={editorConfig} />
      <DividerControl parentLayerId={selectedPageId} />
    </div>
  );
};

export default EditorPanel;
