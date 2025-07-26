"use client";
import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { Plus, Crosshair, ZoomIn, ZoomOut, MousePointer } from "lucide-react";
import { countLayers, useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer } from "@/components/ui/ui-builder/types";
import {
  Sandpack,
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/components/add-component-popover";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { SandpackIframeBridge } from "./sandpack/sandpack-iframe-bridge";

interface SandpackPanelProps {
  className?: string;
}

const SandpackPanel: React.FC<SandpackPanelProps> = ({ className }) => {
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
    <SandpackPanelContent
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
      onSelectElement={onSelectElement}
      handleDeleteLayer={handleDeleteLayer}
      handleDuplicateLayer={handleDuplicateLayer}
    />
  );
};

export default SandpackPanel;

interface SandpackPanelContentProps {
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
  onSelectElement: (layerId: string) => void;
  handleDeleteLayer: () => void;
  handleDuplicateLayer: () => void;
}

const SandpackPanelContent: React.FC<SandpackPanelContentProps> = ({ 
  className,
  selectedPageId,
  selectedLayerId,
  selectedLayer,
  selectedPage,
  allowPagesCreation,
  allowPagesDeletion,
  previewMode,
  componentRegistry,
  onSelectElement,
  handleDeleteLayer,
  handleDuplicateLayer
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pointerEventsEnabled, setPointerEventsEnabled] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const layers = selectedPage.children;

  // Memoize totalLayers calculation separately to avoid recalculating on every render
  const totalLayers = useMemo(() => countLayers(layers), [layers]);
  
  const editorConfig = useMemo(
    () => ({
      zIndex: 1,
      totalLayers: totalLayers,
      selectedLayer: selectedLayer,
      onSelectElement: onSelectElement,
      handleDuplicateLayer: allowPagesCreation
        ? handleDuplicateLayer
        : undefined,
      handleDeleteLayer: allowPagesDeletion ? handleDeleteLayer : undefined,
    }),
    [
      totalLayers,
      selectedLayer,
      onSelectElement,
      handleDuplicateLayer,
      handleDeleteLayer,
      allowPagesCreation,
      allowPagesDeletion,
    ]
  );

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.1));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  const handlePointerEventsToggle = useCallback((enabled: boolean) => {
    setPointerEventsEnabled(enabled);
  }, []);

  // Generate the React component code for Sandpack
  const generateComponentCode = useCallback(() => {
    const renderLayerToCode = (layer: ComponentLayer, depth = 0): string => {
      const indent = "  ".repeat(depth);
      const componentDefinition = componentRegistry[layer.type as keyof typeof componentRegistry];
      
      if (!componentDefinition) {
        return `${indent}// Component ${layer.type} not found in registry\n`;
      }

      const propsStr = Object.entries(layer.props)
        .map(([key, value]) => {
          if (typeof value === "string") {
            return `${key}="${value}"`;
          } else if (typeof value === "number" || typeof value === "boolean") {
            return `${key}={${value}}`;
          } else if (typeof value === "object") {
            return `${key}={${JSON.stringify(value)}}`;
          }
          return "";
        })
        .filter(Boolean)
        .join(" ");

      const openTag = `<${layer.type}${propsStr ? " " + propsStr : ""} data-layer-id="${layer.id}">`;
      const closeTag = `</${layer.type}>`;

      if (Array.isArray(layer.children) && layer.children.length > 0) {
        const childrenCode = layer.children
          .map(child => renderLayerToCode(child, depth + 1))
          .join("");
        return `${indent}${openTag}\n${childrenCode}${indent}${closeTag}\n`;
      } else if (typeof layer.children === "string") {
        return `${indent}${openTag}${layer.children}${closeTag}\n`;
      } else {
        return `${indent}${openTag}${closeTag}\n`;
      }
    };

    const pageContent = Array.isArray(selectedPage.children) 
      ? selectedPage.children.map(child => renderLayerToCode(child, 1)).join("")
      : "";

    return `import React from 'react';

// UI Builder Generated Component
export default function GeneratedComponent() {
  return (
    <div className="p-4">
${pageContent}    </div>
  );
}`;
  }, [selectedPage, componentRegistry]);

  const sandpackFiles = useMemo(() => ({
    "/App.js": generateComponentCode(),
    "/styles.css": `
      .ui-builder-layer {
        position: relative;
      }
      .ui-builder-layer:hover {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      .ui-builder-layer.selected {
        outline: 2px solid #ef4444;
        outline-offset: 2px;
      }
    `
  }), [generateComponentCode]);

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

  const heightClass = useMemo(() => {
    if (previewMode === "responsive") {
      return "h-full";
    } else if (previewMode === "mobile") {
      return "h-[844px]";
    } else if (previewMode === "tablet") {
      return "h-[1024px]";
    } else if (previewMode === "desktop") {
      return "h-[900px]";
    } else {
      return "h-full";
    }
  }, [previewMode]);

  return (
    <div
      id="sandpack-panel-container"
      className={cn(
        "flex flex-col relative size-full bg-fixed bg-[radial-gradient(hsl(var(--border))_1px,hsl(var(--primary)/0.05)_1px)] [background-size:16px_16px] will-change-auto",
        className
      )}
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
    >
      <div className={cn("mx-auto shadow-lg", widthClass, heightClass)}>
        <SandpackProvider
          template="react"
          files={sandpackFiles}
          customSetup={{
            dependencies: {
              "react": "^18.2.0",
              "react-dom": "^18.2.0"
            }
          }}
        >
          <SandpackLayout>
            <SandpackPreview 
              ref={iframeRef}
              style={{ 
                height: "100%",
                pointerEvents: pointerEventsEnabled ? "auto" : "none"
              }}
            />
          </SandpackLayout>
          
          {/* Iframe Bridge for communication */}
          <SandpackIframeBridge
            iframeRef={iframeRef}
            editorConfig={editorConfig}
            selectedPage={selectedPage}
            componentRegistry={componentRegistry}
          />
        </SandpackProvider>
      </div>

      {/* Zoom Controls */}
      <TooltipProvider>
        <div className="absolute bottom-24 md:bottom-4 right-4 z-[1000] flex shadow-lg rounded-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-testid="button-ZoomIn"
                variant="secondary"
                className="size-14 md:size-10 rounded-l-full rounded-r-none border-r border-border [&_svg]:size-7 [&_svg]:md:size-4"
                onClick={handleZoomIn}
              >
                <span className="sr-only">Zoom in</span>
                <ZoomIn className="text-secondary-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Zoom in</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-testid="button-ZoomOut"
                variant="secondary"
                className="size-14 md:size-10 rounded-none border-r border-border [&_svg]:size-7 [&_svg]:md:size-4"
                onClick={handleZoomOut}
              >
                <span className="sr-only">Zoom out</span>
                <ZoomOut className="text-secondary-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Zoom out</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-testid="button-Reset"
                variant="secondary"
                className="size-14 md:size-10 rounded-none border-r border-border [&_svg]:size-7 [&_svg]:md:size-4"
                onClick={handleResetZoom}
              >
                <span className="sr-only">Reset</span>
                <Crosshair className="text-secondary-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Reset zoom and position</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-testid="button-PointerEvents"
                variant={pointerEventsEnabled ? "default" : "secondary"}
                className="size-14 md:size-10 rounded-r-full rounded-l-none [&_svg]:size-7 [&_svg]:md:size-4"
                onClick={() => handlePointerEventsToggle(!pointerEventsEnabled)}
              >
                <span className="sr-only">{pointerEventsEnabled ? "Disable pointer events" : "Enable pointer events"}</span>
                <MousePointer className={pointerEventsEnabled ? "text-primary-foreground" : "text-secondary-foreground"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{pointerEventsEnabled ? "Disable page interaction" : "Enable page interaction"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

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