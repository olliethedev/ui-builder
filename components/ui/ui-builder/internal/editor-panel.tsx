"use client";
import React, { useCallback, useMemo, useState, createContext, useContext } from "react";
import { Plus } from "lucide-react";
import {
  countLayers,
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer } from '@/components/ui/ui-builder/types';

import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { DndContextProvider } from "@/components/ui/ui-builder/internal/dnd-context";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/add-component-popover";
import { Button } from "@/components/ui/button";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";

interface EditorPanelProps {
  className?: string;
  useCanvas?: boolean;
}

// Context to track if a drag handle is active
export const DragHandleContext = createContext<{ dragging: boolean; setDragging: (v: boolean) => void }>({ dragging: false, setDragging: () => {} });


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
    usingCanvas: useCanvas || false,
  }), [layers, selectedLayer, onSelectElement, handleDuplicateLayer, handleDeleteLayer, useCanvas, allowPagesCreation, allowPagesDeletion]);

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

  const [dragging, setDragging] = useState(false);

  return (
    <div
      id="editor-panel-container"
      className={cn(
        "flex flex-col relative size-full bg-fixed bg-[radial-gradient(hsl(var(--border))_1px,hsl(var(--primary)/0.05)_1px)] [background-size:16px_16px] will-change-auto",
        className
      )}
    >
      <DragHandleContext.Provider value={{ dragging, setDragging }}>
        <DndContextProvider>
            {useCanvas ? (
              <TransformWrapper
                initialScale={1}
                minScale={0.1}
                maxScale={5}
                wheel={{ step: 0.05 }}
                doubleClick={{ disabled: true }}
                panning={{ disabled: dragging }}
                centerOnInit={true}
                limitToBounds={false}
              >
                <ZoomControls />
                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div 
                    className={cn(`relative`, widthClass)} 
                    data-testid="transform-component"
                    style={{ 
                      minHeight: "100vh",
                      padding: "50px",
                    }}
                  >
                    {renderer}
                  </div>
                </TransformComponent>
              </TransformWrapper>
            ) : (
              renderer
            )}
          </DndContextProvider>
      </DragHandleContext.Provider>
      <AddComponentsPopover
        parentLayerId={selectedPageId}
      >
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 left-4 flex items-center rounded-full bg-secondary shadow-lg z-[1000]"
        >
          <Plus className="h-5 w-5 text-secondary-foreground" />
        </Button>
      </AddComponentsPopover>
    </div>
  );
};

export default EditorPanel;

// Standalone Zoom Controls Component
const ZoomControls: React.FC = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex gap-2">
      <Button
        data-testid="button-ZoomIn"
        variant="secondary"
        size="sm"
        className="rounded-l-full rounded-r-none shadow-lg"
        onClick={() => zoomIn()}
      >
        <span className="sr-only">Zoom in</span>
        +
      </Button>
      <Button
        data-testid="button-ZoomOut"
        variant="secondary"
        size="sm"
        className="rounded-none shadow-lg"
        onClick={() => zoomOut()}
      >
        <span className="sr-only">Zoom out</span>
        -
      </Button>
      <Button
        data-testid="button-Reset"
        variant="secondary"
        size="sm"
        className="rounded-r-full rounded-l-none shadow-lg"
        onClick={() => resetTransform()}
      >
        <span className="sr-only">Reset</span>
        ⟳
      </Button>
    </div>
  );
};

