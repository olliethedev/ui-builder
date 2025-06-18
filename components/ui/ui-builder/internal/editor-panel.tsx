"use client";
import React, {
  useCallback,
  useMemo,
  useState,
  createContext,
  useLayoutEffect,
  useRef,
  useEffect,
} from "react";
import { Plus, GripVertical, Crosshair, ZoomIn, ZoomOut } from "lucide-react";
import { countLayers, useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer } from "@/components/ui/ui-builder/types";

import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { DndContextProvider } from "@/components/ui/ui-builder/internal/dnd-context";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/add-component-popover";
import { Button } from "@/components/ui/button";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import { DragConfig, useDrag } from "@use-gesture/react";

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

  const layers = selectedPage.children;

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

  const [dragging, setDragging] = useState(false);

  const handleDraggingChange = useCallback((isDragging: boolean) => {
    setDragging(isDragging);
  }, []);

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

  const renderer = useMemo(
    () => (
      <ResizableWrapper
        isResizable={previewMode === "responsive"}
        onDraggingChange={handleDraggingChange}
      >
        <div
          id="editor-panel-content"
          className="overflow-visible pt-3 pb-10 pr-20"
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
      handleDraggingChange,
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

  // Memoize panning configuration for TransformWrapper
  const panningConfig = useMemo(() => ({ disabled: dragging }), [dragging]);

  return (
    <div
      id="editor-panel-container"
      className={cn(
        "flex flex-col relative size-full bg-fixed bg-[radial-gradient(hsl(var(--border))_1px,hsl(var(--primary)/0.05)_1px)] [background-size:16px_16px] will-change-auto",
        className
      )}
    >
      <DndContextProvider>
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
          {/* <AutoZoomToSelected 
              selectedLayerId={selectedLayerId} 
              autoZoomToSelected={autoZoomToSelected} 
            /> */}
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
      </DndContextProvider>
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

export default EditorPanel;

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

// Context to track if a drag handle is active
export const DragHandleContext = createContext<{
  dragging: boolean;
  setDragging: (v: boolean) => void;
}>({ dragging: false, setDragging: () => {} });

// Resizer Handle Component
const Resizer = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
    },
    []
  );

  return (
    <div
      data-testid="resizer"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={cn(
        "flex items-center justify-center w-4 h-4 cursor-ew-resize rounded-sm border bg-border hover:bg-muted touch-none z-[1001]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Resizable Wrapper Component for responsive mode
interface ResizableWrapperProps {
  children: React.ReactNode;
  isResizable: boolean;
  onDraggingChange?: (dragging: boolean) => void;
  onSizeChange?: (width: number) => void;
}

const ResizableWrapper: React.FC<ResizableWrapperProps> = ({
  children,
  isResizable,
  onDraggingChange,
  onSizeChange,
}) => {
  const [dragging, setDragging] = useState(false);
  const [responsiveSize, setResponsiveSize] = useState<{
    width: number;
  } | null>(null);
  const initialSizeRef = useRef<{ width: number }>({ width: 0 });

  // Set initial responsive size
  useLayoutEffect(() => {
    if (isResizable) {
      const initialWidth = 800; // Default responsive width
      setResponsiveSize({ width: initialWidth });
      onSizeChange?.(initialWidth);
    }
  }, [isResizable, onSizeChange]);

  const dragConfig = useMemo(() => {
    return {
      axis: "x",
      from: () => [0, 0],
      filterTaps: true,
    } as DragConfig;
  }, []);

  // Handle resizing using useDrag for responsive mode
  const bindResizer = useDrag(({ down, movement: [mx], first, last }) => {
    if (first) {
      // Capture the initial size when drag starts
      initialSizeRef.current = {
        width: responsiveSize?.width || 800,
      };
      handleSetDragging(true);
    }

    if (down) {
      // Calculate new size based on initial size and movement
      const newWidth = Math.max(320, initialSizeRef.current.width + mx); // Min width of 320px
      setResponsiveSize({ width: newWidth });
      onSizeChange?.(newWidth);
    }

    // Notify when drag ends for final measurement update
    if (last) {
      // Small delay to ensure DOM updates are complete
      setTimeout(() => {
        handleSetDragging(false);
      }, 0);
    }
  }, dragConfig as any);

  const bindResizerValues = useMemo(() => {
    return typeof bindResizer === "function" ? bindResizer() : {};
  }, [bindResizer]);

  const resizerStyle = useMemo(() => {
    return {
      left: responsiveSize?.width
        ? `${responsiveSize.width - 80}px`
        : undefined,
    };
  }, [responsiveSize]);

  const responsiveWidthStyle = useMemo(() => {
    if (isResizable && responsiveSize) {
      return { width: `${responsiveSize.width}px` };
    }
    return {};
  }, [isResizable, responsiveSize]);

  const handleSetDragging = useCallback(
    (value: boolean) => {
      setDragging(value);
      onDraggingChange?.(value);
    },
    [onDraggingChange]
  );

  const contextValue = useMemo(() => ({
    dragging,
    setDragging: handleSetDragging
  }), [dragging, handleSetDragging]);

  return (
    <DragHandleContext.Provider
      value={contextValue}
    >
      <div className="relative" style={responsiveWidthStyle}>
        {isResizable && (
          <>
            <Resizer
              {...bindResizerValues}
              className="absolute top-0 right-[-40px]"
              style={resizerStyle}
            >
              <GripVertical className="w-4 h-4" />
            </Resizer>
            <Resizer
              {...bindResizerValues}
              className="absolute bottom-7 right-[-40px]"
              style={resizerStyle}
            >
              <GripVertical className="w-4 h-4" />
            </Resizer>
          </>
        )}
        {children}
      </div>
    </DragHandleContext.Provider>
  );
};
