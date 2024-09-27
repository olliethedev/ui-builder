import React, { ReactNode, Suspense, useState, useEffect, useRef } from "react";
import { ChevronRight, Plus, Trash, Copy } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import {
  componentRegistry,
  isTextLayer,
  Layer,
  PageLayer,
  useComponentStore,
} from "@/components/ui/ui-builder/internal/store/component-store";
import { Markdown } from "@/components/ui/ui-builder/markdown";
import { DividerControl } from "@/components/ui/ui-builder/internal/divider-control";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/add-component-popover";
import { cn } from "@/lib/utils";
import ThemeWrapper from "@/components/ui/ui-builder/internal/theme-wrapper";
import { BaseColor } from "./base-colors";

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
    findLayersForPageId,
    selectedPageId,
  } = useComponentStore();

  console.log("EditorPanel", { selectedLayerId });
  const selectedLayer = findLayerById(selectedPageId) as PageLayer;
  console.log("selectedLayer", selectedLayer);

  const layers = selectedLayer?.children || [];

  const themeColors = selectedLayer?.props?.themeColors as BaseColor | undefined;
    const themeMode = (selectedLayer?.props?.mode || "light" )as "light" | "dark";

    const styleVariables = Object.entries(themeColors?.cssVars[themeMode] || {}).reduce((acc, [key, value]) => {
      acc[`--${key}`] = value;
      return acc;
    }, {} as { [key: string]: string });

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

  const renderLayer = (layer: Layer, zIndex: number = 10) => {
    if (isTextLayer(layer)) {
      const TextComponent = layer.textType === "markdown" ? Markdown : "span";
      console.log("text layer", layer);
      return (
        <ClickableWrapper
          key={layer.id}
          layer={layer}
          zIndex={zIndex}
          isSelected={layer.id === selectedLayer?.id}
          onSelectElement={onSelectElement}
          onDuplicateLayer={handleDuplicateLayer}
          onDeleteLayer={handleDeleteLayer}
        >
          <TextComponent {...layer.props}>{layer.text}</TextComponent>
        </ClickableWrapper>
      );
    }

    const { component: Component } =
      componentRegistry[layer.type as keyof typeof componentRegistry];
    if (!Component) return null;

    const childProps = { ...layer.props };
    if (layer.children && layer.children.length > 0) {
      childProps.children = layer.children.map((child) =>
        renderLayer(child, zIndex + 1)
      );
    }

    

    return (
      <ClickableWrapper
        key={layer.id}
        layer={layer}
        zIndex={zIndex}
        isSelected={layer.id === selectedLayer?.id}
        onSelectElement={onSelectElement}
        onDuplicateLayer={handleDuplicateLayer}
        onDeleteLayer={handleDeleteLayer}
      >
        <Component {...(childProps as any)} />
      </ClickableWrapper>
    );
  };

  return (
    <ThemeWrapper
      className={className}
      style={{
        ...styleVariables
      }}
    >
      {/* className={className} */}
      <div>
        <div className="relative w-full">
          <DividerControl addPosition={0} parentLayerId={selectedPageId} />
          <div className="flex flex-col w-full overflow-y-visible relative">
            {layers.map(renderLayer)}
          </div>
          <DividerControl parentLayerId={selectedPageId} />
        </div>
      </div>
    </ThemeWrapper>
  );
};

export default EditorPanel;

// Menu component that appears at the top-left corner of a selected layer
interface MenuProps {
  layerId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  handleDuplicateComponent: () => void;
  handleDeleteComponent: () => void;
}

const LayerMenu: React.FC<MenuProps> = ({
  layerId,
  x,
  y,
  width,
  height,
  zIndex,
  handleDuplicateComponent,
  handleDeleteComponent,
}) => {
  const selectedLayer = useComponentStore((state) =>
    state.findLayerById(layerId)
  );

  //const hasChildrenInSchema = schema.shape.children !== undefined;
  const hasChildrenInSchema =
    selectedLayer &&
    !isTextLayer(selectedLayer) &&
    componentRegistry[selectedLayer.type as keyof typeof componentRegistry]
      .schema.shape.children !== undefined;
  return (
    <>
      <div
        className="fixed"
        style={{
          top: y,
          left: x,
          zIndex: zIndex,
        }}
      >
        <span className="h-5 group flex items-center rounded-bl-full rounded-r-full bg-white/90 p-0 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-blue-500 hover:bg-gray-50/95 hover:h-10 hover:ring-2 transition-all duration-200 ease-in-out overflow-hidden cursor-pointer hover:cursor-auto">
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:size-8 transition-all duration-200 ease-in-out group-hover:opacity-30" />

          <div className="overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-200 ease-in-out">
            {hasChildrenInSchema && (
              <AddComponentsPopover
                parentLayerId={layerId}
                className="flex-shrink w-min inline-flex"
              >
                <Button size="sm" variant="ghost">
                  <span className="sr-only">Add Component</span>
                  <Plus className="h-5 w-5 text-gray-400" />
                </Button>
              </AddComponentsPopover>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDuplicateComponent}
            >
              <span className="sr-only">Duplicate</span>
              <Copy className="h-5 w-5 text-gray-400" />
            </Button>
            <Button
              className="rounded-r-full mr-1"
              size="sm"
              variant="ghost"
              onClick={handleDeleteComponent}
            >
              <span className="sr-only">Delete</span>
              <Trash className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
        </span>
      </div>
    </>
  );
};

interface ClickableWrapperProps {
  layer: Layer;
  isSelected: boolean;
  zIndex: number;
  onSelectElement: (layerId: string) => void;
  children: ReactNode;
  onDuplicateLayer: () => void;
  onDeleteLayer: () => void;
}

const ClickableWrapper: React.FC<ClickableWrapperProps> = ({
  layer,
  isSelected,
  zIndex,
  onSelectElement,
  children,
  onDuplicateLayer,
  onDeleteLayer,
}) => {
  const [boundingRect, setBoundingRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    // if (!isSelected) {
    //   setBoundingRect(null);
    //   return;
    // }

    const element = wrapperRef.current?.firstElementChild as HTMLElement | null;
    if (!element) {
      setBoundingRect(null);
      return;
    }

    const updateBoundingRect = () => {
      const rect = element.getBoundingClientRect();
      setBoundingRect(rect);
    };

    updateBoundingRect();

    let resizeObserver: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(updateBoundingRect);
      resizeObserver.observe(element);
    }

    const scrollParent = getScrollParent(element);
    if (scrollParent) {
      scrollParent.addEventListener("scroll", updateBoundingRect);
    }
    window.addEventListener("resize", updateBoundingRect);

    return () => {
      if (resizeObserver) {
        resizeObserver.unobserve(element);
        resizeObserver.disconnect();
      }
      if (scrollParent) {
        scrollParent.removeEventListener("scroll", updateBoundingRect);
      }
      window.removeEventListener("resize", updateBoundingRect);
    };
  }, [isSelected, layer.id, children]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(layer.id);
  };

  return (
    <ErrorBoundary fallbackRender={ErrorFallback}>
      <Suspense fallback={<div>Loading...</div>}>
        <span
          className="contents" // Preserves layout
          ref={wrapperRef}
        >
          {children}
        </span>

        {isSelected && boundingRect && (
          <LayerMenu
            layerId={layer.id}
            x={boundingRect.left + window.scrollX}
            y={boundingRect.bottom + window.scrollY}
            zIndex={40 + zIndex}
            width={boundingRect.width}
            height={boundingRect.height}
            handleDuplicateComponent={onDuplicateLayer}
            handleDeleteComponent={onDeleteLayer}
          />
        )}

        {boundingRect && (
          <div
            onClick={handleClick}
            className={cn(
              "fixed box-border hover:border-blue-300 hover:border-2",
              isSelected ? "border-2 border-blue-500 hover:border-blue-500" : ""
            )}
            onWheel={(e) => {
              console.log("wheel", e);
              const scrollParent = getScrollParent(e.target as HTMLElement);
              if (scrollParent) {
                scrollParent.scrollLeft += e.deltaX;
                scrollParent.scrollTop += e.deltaY;
              }
            }}
            style={{
              top: boundingRect.top,
              left: boundingRect.left,
              width: boundingRect.width,
              height: boundingRect.height,
              zIndex: zIndex,
            }}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  );
};

function ErrorFallback({ error }: { error: Error }) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <div className="p-4 border border-red-500 bg-red-100 text-red-700 rounded flex-grow w-full">
      <h3 className="font-bold mb-2">Component Error</h3>
      <p>Error: {error?.message || "Unknown error"}</p>
      <details className="mt-2">
        <summary className="cursor-pointer">Stack trace</summary>
        <pre className="mt-2 text-xs whitespace-pre-wrap">{error?.stack}</pre>
      </details>
    </div>
  );
}

function getScrollParent(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;

  const overflowRegex = /(auto|scroll)/;

  let parent: HTMLElement | null = element.parentElement;

  while (parent) {
    const style = getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;

    if (overflowRegex.test(overflowY) || overflowRegex.test(overflowX)) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
}
