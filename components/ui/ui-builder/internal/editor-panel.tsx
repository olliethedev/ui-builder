"use client";
import React, { useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import {
  countLayers,
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer } from '@/components/ui/ui-builder/types';

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
  const previewMode = useEditorStore((state) => state.previewMode);
  const componentRegistry = useEditorStore((state) => state.registry);
  const selectedLayer = findLayerById(selectedLayerId) as ComponentLayer;
  const selectedPage = findLayerById(selectedPageId) as ComponentLayer;

  const layers = selectedPage?.children;
  const layersArray = Array.isArray(layers) ? layers : [];

  const onSelectElement = useCallback((layerId: string) => {
    selectLayer(layerId);
  }, [selectLayer]);

  const handleDeleteLayer = useCallback(() => {
    if (selectedLayer) {
      removeLayer(selectedLayer.id);
    }
  }, [selectedLayer, removeLayer]);

  const handleDuplicateLayer = useCallback(() => {
    if (selectedLayer) {
      duplicateLayer(selectedLayer.id);
    }
  }, [selectedLayer, duplicateLayer]);

  const editorConfig = useMemo(() => ({
    zIndex: 1,
    totalLayers: countLayers(layersArray),
    selectedLayer: selectedLayer,
    onSelectElement: onSelectElement,
    handleDuplicateLayer: handleDuplicateLayer,
    handleDeleteLayer: handleDeleteLayer,
    usingCanvas: useCanvas,
  }), [layersArray, selectedLayer, onSelectElement, handleDuplicateLayer, handleDeleteLayer, useCanvas]);

  const isMobileScreen = window.innerWidth < 768;

  const renderer = selectedPage && <LayerRenderer 
    key={selectedPage.id} 
    page={selectedPage} 
    componentRegistry={componentRegistry} 
    editorConfig={editorConfig}
  />;

  const widthClass = useMemo(() => {
    switch (previewMode) {
      case 'mobile':
        return 'w-[375px]';
      case 'tablet':
        return 'w-[768px]';
      case 'desktop':
        return 'w-[960px]';
      case 'responsive':
        return 'w-full max-w-[960px]';
      default:
        return 'w-[960px]';
    }
  }, [previewMode]);

  return (
    <div
      id="editor-panel-container"
      className={cn(
        "flex flex-col relative size-full bg-fixed bg-[radial-gradient(hsl(var(--border))_1px,hsl(var(--primary)/0.05)_1px)] [background-size:16px_16px] will-change-auto",
        className
      )}
    >
      <div className="h-full flex-1 overflow-y-auto">
        {useCanvas ? (
          <InteractiveCanvas
            frameId="editor-panel-frame"
            disableWheel={layersArray.length === 0}
            disablePinch={layersArray.length === 0}
            disableDrag={!isMobileScreen}
          >
            <IframeWrapper
              key={previewMode}
              frameId="editor-panel-frame"
              resizable={previewMode === "responsive" && layersArray.length > 0}
              className={cn(`block`, widthClass)}
            >
              {renderer}
            </IframeWrapper>
          </InteractiveCanvas>
        ) : (
          <div className="bg-center bg-transparent grid justify-center h-full w-full overflow-auto p-8">
            {renderer}
          </div>
        )}
      </div>
      <aside className="flex p-1 gap-1 bg-accent">
        <AddComponentsPopover parentLayerId={selectedPageId}>
          <Button
            variant="secondary"
            size="icon"
            className="flex items-center rounded-full bg-secondary p-4 shadow"
          >
            <Plus className="h-5 w-5 text-secondary-foreground" />
          </Button>
        </AddComponentsPopover>
      </aside>
    </div>
  );
};

export default EditorPanel;
