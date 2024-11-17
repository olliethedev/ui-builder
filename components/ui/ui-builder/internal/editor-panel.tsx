import React from "react";
import { Plus } from "lucide-react";
import {
  countLayers,
  Layer,
  PageLayer,
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { cn } from "@/lib/utils";
import { IframeWrapper } from "@/components/ui/ui-builder/internal/iframe-wrapper";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { InteractiveCanvas } from "@/components/ui/ui-builder/internal/interactive-canvas";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/add-component-popover";
import { Button } from "@/components/ui/button";

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

  const isMobileScreen = window.innerWidth < 768;

  const renderer = (
    <div id="editor-panel-container" className="overflow-visible pt-3 pb-10">
      <LayerRenderer page={selectedPage} editorConfig={editorConfig} />
    </div>
  );

  return (
    <div
      id="editor-panel-container"
      className={cn(
        "flex flex-col relative size-full bg-fixed bg-[radial-gradient(hsl(var(--border))_1px,hsl(var(--primary)/0.05)_1px)] [background-size:16px_16px] will-change-auto",
        className
      )}
    >
      {useCanvas ? (
        <InteractiveCanvas
          frameId="editor-panel-frame"
          disableWheel={layers.length === 0}
          disablePinch={layers.length === 0}
          disableDrag={!isMobileScreen}
        >
          <IframeWrapper
            key={previewMode}
            frameId="editor-panel-frame"
            resizable={previewMode === "responsive" && layers.length > 0}
            className={cn(
              `block`,
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
      <AddComponentsPopover
        parentLayerId={selectedPageId}
      >
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-2 md:left-2 left-4 flex items-center rounded-full bg-secondary md:p-4 p-6 shadow"
        >
          <Plus className="h-5 w-5 text-secondary-foreground" />
        </Button>
      </AddComponentsPopover>
    </div>
  );
};

export default EditorPanel;
