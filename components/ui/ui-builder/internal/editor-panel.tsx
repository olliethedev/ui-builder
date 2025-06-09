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
  const isLayerAPage = useLayerStore((state) => state.isLayerAPage(selectedLayerId || ""));
  const allowPagesCreation = useEditorStore((state) => state.allowPagesCreation);
  const allowPagesDeletion = useEditorStore((state) => state.allowPagesDeletion);

  const layers = selectedPage.children;

  const onSelectElement = useCallback((layerId: string) => {
    selectLayer(layerId);
  }, [selectLayer]);

  const handleDeleteLayer = useCallback(() => {
    if (selectedLayer && !isLayerAPage) {
      removeLayer(selectedLayer.id);
    }
  }, [selectedLayer, removeLayer, isLayerAPage]);

  const handleDuplicateLayer = useCallback(() => {
    if (selectedLayer && !isLayerAPage) {
      duplicateLayer(selectedLayer.id);
    }
  }, [selectedLayer, duplicateLayer, isLayerAPage]);

  const editorConfig = useMemo(() => ({
    zIndex: 1,
    totalLayers: countLayers(layers),
    selectedLayer: selectedLayer,
    onSelectElement: onSelectElement,
    handleDuplicateLayer: allowPagesCreation ? handleDuplicateLayer : undefined,
    handleDeleteLayer: allowPagesDeletion ? handleDeleteLayer : undefined,
    usingCanvas: useCanvas,
  }), [layers, selectedLayer, onSelectElement, handleDuplicateLayer, handleDeleteLayer, useCanvas, allowPagesCreation, allowPagesDeletion]);

  const isMobileScreen = window.innerWidth < 768;

  const renderer = useMemo(() => (
    <div id="editor-panel-container" className="overflow-visible pt-3 pb-10 pr-20">
      <LayerRenderer page={selectedPage} editorConfig={editorConfig} componentRegistry={componentRegistry} />
    </div>
  ), [selectedPage, editorConfig, componentRegistry]);

  const widthClass = useMemo(() => {
    return {
      responsive: "w-full",
      mobile: "w-[390px]",
      tablet: "w-[768px]",
      desktop: "w-[1440px]",
    }[previewMode]
  }, [previewMode]);

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
            className={cn(`block`, widthClass)}
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
