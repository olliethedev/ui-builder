"use client";
import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { Plus, Crosshair, ZoomIn, ZoomOut } from "lucide-react";
import { countLayers, useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer } from "@/components/ui/ui-builder/types";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { DndContextProvider, useComponentDragContext } from "@/components/ui/ui-builder/internal/dnd-context";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/add-component-popover";
import { Button } from "@/components/ui/button";
import { ResizableWrapper } from "@/components/ui/ui-builder/internal/resizable-wrapper";

// ZoomControls component definition moved before EditorPanel
const ZoomControls: React.FC = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  const handleZoomIn = useCallback(() => zoomIn(), [zoomIn]);
  const handleZoomOut = useCallback(() => zoomOut(), [zoomOut]);
  const handleReset = useCallback(() => resetTransform(), [resetTransform]);

  return (
    <div className="absolute bottom-24 md:bottom-4 right-4 z-[1000] flex shadow-lg rounded-full">
      <Button
        data-testid="button-ZoomIn"
        variant="secondary"
        className="size-14 md:size-10 rounded-l-full rounded-r-none border-r border-border [&_svg]:size-7 [&_svg]:md:size-4"
        onClick={handleZoomIn}
      >
        <span className="sr-only">Zoom in</span>
        <ZoomIn className="text-secondary-foreground" />
      </Button>
      <Button
        data-testid="button-ZoomOut"
        variant="secondary"
        className="size-14 md:size-10 rounded-none [&_svg]:size-7 [&_svg]:md:size-4"
        onClick={handleZoomOut}
      >
        <span className="sr-only">Zoom out</span>
        <ZoomOut className="text-secondary-foreground" />
      </Button>
      <Button
        data-testid="button-Reset"
        variant="secondary"
        className="size-14 md:size-10 rounded-r-full rounded-l-none border-l border-border [&_svg]:size-7 [&_svg]:md:size-4"
        onClick={handleReset}
      >
        <span className="sr-only">Reset</span>
        <Crosshair className="text-secondary-foreground" />
      </Button>
    </div>
  );
};

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
  const previewMode = useEditorStore((state) => state.previewMode);
  const componentRegistry = useEditorStore((state) => state.registry);
  const selectedLayer = findLayerById(selectedLayerId) as ComponentLayer;
  const selectedPage = findLayerById(selectedPageId) as ComponentLayer;
  const isLayerAPage = useLayerStore((state) =>
    state.isLayerAPage(selectedLayerId || "")
  );
  const allowPagesCreation = useEditorStore(
    (state) => state.allowPagesCreation
  );
  const allowPagesDeletion = useEditorStore(
    (state) => state.allowPagesDeletion
  );

  const onSelectElement = useCallback(
    (layerId: string) => {
      selectLayer(layerId);
    },
    [selectLayer]
  );

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

  return (
    <DndContextProvider>
      <EditorPanelContent
        className={className}
        selectedLayerId={selectedLayerId}
        selectedPageId={selectedPageId}
        selectedLayer={selectedLayer}
        selectedPage={selectedPage}
        isLayerAPage={isLayerAPage}
        allowPagesCreation={allowPagesCreation}
        allowPagesDeletion={allowPagesDeletion}
        previewMode={previewMode}
        componentRegistry={componentRegistry}
        autoZoomToSelected={false}
        onSelectElement={onSelectElement}
        handleDeleteLayer={handleDeleteLayer}
        handleDuplicateLayer={handleDuplicateLayer}
      />
    </DndContextProvider>
  );
};

export default EditorPanel;

interface EditorPanelContentProps {
  className?: string;
  selectedLayerId: string | null;
  selectedPageId: string;
  selectedLayer: ComponentLayer;
  selectedPage: ComponentLayer;
  isLayerAPage: boolean;
  allowPagesCreation: boolean;
  allowPagesDeletion: boolean;
  previewMode: string;
  componentRegistry: any;
  autoZoomToSelected?: boolean;
  onSelectElement: (layerId: string) => void;
  handleDeleteLayer: () => void;
  handleDuplicateLayer: () => void;
}

// Inner component that can access ComponentDragContext
const EditorPanelContent: React.FC<EditorPanelContentProps> = ({ 
  className,
  selectedPageId,
  selectedLayerId,
  selectedLayer,
  selectedPage,
  allowPagesCreation,
  allowPagesDeletion,
  previewMode,
  componentRegistry,
  autoZoomToSelected,
  onSelectElement,
  handleDeleteLayer,
  handleDuplicateLayer
}) => {
  const { isDragging: isComponentDragging } = useComponentDragContext();
  const [resizing, setResizing] = useState(false);

  const handleResizingChange = useCallback((isDragging: boolean) => {
    setResizing(isDragging);
  }, []);

  const layers = selectedPage.children;

  const editorConfig = useMemo(
    () => ({
      zIndex: 1,
      totalLayers: countLayers(layers),
      selectedLayer: selectedLayer,
      onSelectElement: onSelectElement,
      handleDuplicateLayer: allowPagesCreation
        ? handleDuplicateLayer
        : undefined,
      handleDeleteLayer: allowPagesDeletion ? handleDeleteLayer : undefined,
    }),
    [
      layers,
      selectedLayer,
      onSelectElement,
      handleDuplicateLayer,
      handleDeleteLayer,
      allowPagesCreation,
      allowPagesDeletion,
    ]
  );

  const widthClass = useMemo(() => {
    if (previewMode === "responsive") {
      return "w-full";
    } else if (previewMode === "mobile") {
      return "w-[390px]";
    } else if (previewMode === "tablet") {
      return "w-[768px]";
    } else if (previewMode === "desktop") {
      return "w-[1440px]";
    } else {
      return "w-full";
    }
  }, [previewMode]);


  const renderer = useMemo(
    () => (
      <ResizableWrapper
        isResizable={previewMode === "responsive"}
        onDraggingChange={handleResizingChange}
      >
        <div
          id="editor-panel-content"
          className={cn("overflow-visible pt-3 pb-10 pr-20", widthClass)}
        >
          <LayerRenderer
            page={selectedPage}
            editorConfig={editorConfig}
            componentRegistry={componentRegistry}
          />
        </div>
      </ResizableWrapper>
    ),
    [
      selectedPage,
      editorConfig,
      componentRegistry,
      previewMode,
      handleResizingChange,
      widthClass
    ]
  );

  
  // Memoize style objects for TransformComponent
  const wrapperStyle = useMemo(() => ({
    width: "100%",
    height: "100%",
  }), []);

  const contentStyle = useMemo(() => ({
    width: "100%",
    height: "100%",
  }), []);

  const transformDivStyle = useMemo(() => ({
    minHeight: "100vh",
    padding: "50px",
  }), []);

  // Memoize wheel configuration for TransformWrapper
  const wheelConfig = useMemo(() => ({ step: 0.05 }), []);

  // Memoize doubleClick configuration for TransformWrapper
  const doubleClickConfig = useMemo(() => ({ disabled: true }), []);

  // Disable panning when either resizing the viewport OR dragging components
  const panningConfig = useMemo(() => ({ 
    disabled: resizing || isComponentDragging 
  }), [resizing, isComponentDragging]);

  return (
    <div
      id="editor-panel-container"
      className={cn(
        "flex flex-col relative size-full bg-fixed bg-[radial-gradient(hsl(var(--border))_1px,hsl(var(--primary)/0.05)_1px)] [background-size:16px_16px] will-change-auto",
        className
      )}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={5}
        wheel={wheelConfig}
        doubleClick={doubleClickConfig}
        panning={panningConfig}
        centerOnInit={true}
        limitToBounds={false}
      >
        <ZoomControls />
        {autoZoomToSelected && <AutoZoomToSelected 
            selectedLayerId={selectedLayerId} 
            autoZoomToSelected={autoZoomToSelected} 
          /> }
        <TransformComponent
          wrapperStyle={wrapperStyle}
          contentStyle={contentStyle}
        >
          <div
            className={cn("relative", widthClass)}
            data-testid="transform-component"
            style={transformDivStyle}
          >
            {renderer}
          </div>
        </TransformComponent>
      </TransformWrapper>
      <AddComponentsPopover parentLayerId={selectedPageId}>
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 left-4 size-14 md:size-10 flex items-center rounded-full bg-secondary shadow-lg z-[1000] [&_svg]:size-7 [&_svg]:md:size-4"
        >
          <Plus className="text-secondary-foreground" />
        </Button>
      </AddComponentsPopover>
    </div>
  );
};

/* istanbul ignore next */

// Auto-zoom to selected element component
const AutoZoomToSelected: React.FC<{
  selectedLayerId: string | null;
  autoZoomToSelected: boolean;
}> = ({ selectedLayerId, autoZoomToSelected }) => {
  const { zoomToElement } = useControls();
  const previousSelectedLayerIdRef = useRef<string | null>(null);

  // Zoom to selected element when selection changes
  useEffect(() => {
    if (!selectedLayerId || !zoomToElement || !autoZoomToSelected) return;

    // Only zoom if the selected element is different from the previous one
    if (previousSelectedLayerIdRef.current === selectedLayerId) return;

    // Update the previous selected layer ID
    previousSelectedLayerIdRef.current = selectedLayerId;

    // Small delay to ensure DOM is updated after selection change
    const timeoutId = setTimeout(() => {
      // Try to find the selected element by data attribute or ID
      const selectedElement =
        document.querySelector(`[data-layer-id="${selectedLayerId}"]`) ||
        document.getElementById(`layer-${selectedLayerId}`);

      if (selectedElement) {
        zoomToElement(selectedElement as HTMLElement, undefined, 300); // 1.5x scale, 300ms animation
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedLayerId, zoomToElement, autoZoomToSelected]);

  return null; // This component doesn't render anything
};


