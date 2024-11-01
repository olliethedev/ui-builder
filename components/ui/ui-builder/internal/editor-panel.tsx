import React from "react";
import {
  countLayers,
  Layer,
  PageLayer,
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { cn } from "@/lib/utils";
import { IframeWrapper } from "./iframe-wrapper";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { InteractiveCanvas } from "@/components/ui/ui-builder/internal/interactive-canvas";

interface EditorPanelProps {
  className?: string;
  useCanvas?: boolean;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ className, useCanvas }) => {
  const {
    selectLayer,
    selectedLayerId,
    findLayerById,
    duplicateLayer,
    removeLayer,
    selectedPageId,
  } = useLayerStore();
  const { previewMode } = useEditorStore();
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
    usingCanvas: useCanvas,
  };

  const renderer = (
    <div
      id="editor-panel-container"
      className="will-change-auto overflow-visible"
    >
      <div className="h-3 w-full" />
      <LayerRenderer page={selectedPage} editorConfig={editorConfig} />
      <div className="h-6 w-full" />
    </div>
  );

  return (
    <div
      id="editor-panel-container"
      className={cn(
        "flex flex-col relative size-full bg-fixed bg-[radial-gradient(hsl(var(--border))_1px,hsl(var(--primary)/0.05)_1px)] [background-size:16px_16px] ",
        className
      )}
    >
      {useCanvas ? (
        <InteractiveCanvas frameId="editor-panel-frame">
          <IframeWrapper
            key={previewMode}
            frameId="editor-panel-frame"
            className={cn(
              `mx-auto`,
              {
                responsive: "w-full",
                mobile: "w-[390px]",
                tablet: "w-[768px]",
                desktop: "w-[1440px]",
              }[previewMode]
            )}
          >
            {renderer}
          </IframeWrapper>
        </InteractiveCanvas>
      ) : (
        renderer
      )}
    </div>
  );
};

export default EditorPanel;
