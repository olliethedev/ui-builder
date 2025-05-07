/** 
 * Learn more about the UI Builder:
 * https://github.com/olliethedev/ui-builder 
*/

"use client";

import React, { useEffect, useState, useMemo } from "react";
import LayersPanel from "@/components/ui/ui-builder/internal/layers-panel";
import EditorPanel from "@/components/ui/ui-builder/internal/editor-panel";
import PropsPanel from "@/components/ui/ui-builder/internal/props-panel";
import { NavBar } from "@/components/ui/ui-builder/internal/nav";
import { ThemeProvider } from "next-themes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ResizablePanel,
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useStore } from "@/hooks/use-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import {
  ComponentRegistry,
  ComponentLayer,
} from "@/components/ui/ui-builder/types";
import { TailwindThemePanel } from "@/components/ui/ui-builder/internal/tailwind-theme-panel";

interface PanelConfig {
  navBar?: React.ReactNode;
  pageConfigPanel?: React.ReactNode;
  editorPanel?: React.ReactNode;
  propsPanel?: React.ReactNode;
  tailwindThemePanel?: React.ReactNode;
}

interface UIBuilderProps {
  initialLayers?: ComponentLayer[];
  onChange?: (pages: ComponentLayer[]) => void;
  componentRegistry: ComponentRegistry;
  panelConfig?: PanelConfig;
  persistLayerStore?: boolean;
}

const UIBuilder = ({
  initialLayers,
  onChange,
  componentRegistry,
  panelConfig: userPanelConfig,
  persistLayerStore = true,
}: UIBuilderProps) => {
  const layerStore = useStore(useLayerStore, (state) => state);
  const editorStore = useStore(useEditorStore, (state) => state);


  const [editorStoreInitialized, setEditorStoreInitialized] = useState(false);
  const [layerStoreInitialized, setLayerStoreInitialized] = useState(false);

  // Memoize the default panel configuration.
  // The dependency array is empty because defaultPanelConfig is called with a constant 'true'.
  const memoizedDefaultPanelConfig = useMemo(() => defaultPanelConfig(true), []);

  // Use user-provided config if available, otherwise use the memoized default.
  const currentPanelConfig = userPanelConfig || memoizedDefaultPanelConfig;


  // Effect 1: Initialize Editor Store with registry and page form props
  useEffect(() => {
    if (editorStore && componentRegistry && !editorStoreInitialized) {
      editorStore.initialize(componentRegistry, persistLayerStore);
      setEditorStoreInitialized(true);
    }
  }, [editorStore, componentRegistry, editorStoreInitialized, persistLayerStore]);

  // Effect 2: Conditionally initialize Layer Store *after* Editor Store is initialized
  useEffect(() => {
    if (layerStore && editorStore) {
      // Only initialize layer store if initial layers (pages) are provided, else empty div page is the root component
      if (initialLayers && !layerStoreInitialized) {
        layerStore.initialize(initialLayers);
        setLayerStoreInitialized(true);
        const { clear } = useLayerStore.temporal.getState();
        clear();
      } else {
        setLayerStoreInitialized(true);
      }
    }
  }, [
    layerStore,
    editorStore,
    componentRegistry,
    initialLayers,
    layerStoreInitialized,
  ]);

  // Effect 3: Handle onChange callback when pages change
  useEffect(() => {
    // Ensure onChange exists and layer store is initialized with pages
    if (onChange && layerStore?.pages && layerStoreInitialized) {
      onChange(layerStore.pages);
    }
    // Depend on the pages array itself for changes
  }, [layerStore?.pages, onChange, layerStoreInitialized]);

  const isLoading = !layerStoreInitialized || !editorStoreInitialized;
  const layout = isLoading ? (
    <LoadingSkeleton />
  ) : (
    <MainLayout panelConfig={currentPanelConfig} />
  );

  return (
    <ThemeProvider
      data-testid="theme-provider"
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {layout}
    </ThemeProvider>
  );
};

function MainLayout({ panelConfig }: { panelConfig: PanelConfig }) {
  const mainPanels = useMemo(
    () => [
      {
        title: "Page Config",
        content: panelConfig.pageConfigPanel,
        defaultSize: 25,
      },
      {
        title: "UI Editor",
        content: panelConfig.editorPanel,
        defaultSize: 50,
      },
      {
        title: "Props",
        content: panelConfig.propsPanel,
        defaultSize: 25,
      },
    ],
    [panelConfig]
  );

  const [selectedPanel, setSelectedPanel] = useState(mainPanels[1]);
  return (
    <div
      data-testid="component-editor"
      className="flex flex-col w-full flex-grow h-screen"
    >
      {panelConfig.navBar}
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="flex overflow-hidden flex-1"
        >
          {mainPanels.map((panel, index) => (
            <React.Fragment key={panel.title}>
              {index > 0 && <ResizableHandle withHandle />}
              <ResizablePanel
                defaultSize={panel.defaultSize}
                minSize={15}
                className="min-h-full flex-1"
              >
                {panel.content}
              </ResizablePanel>
            </React.Fragment>
          ))}
        </ResizablePanelGroup>
      </div>
      {/* Mobile Layout */}
      <div className="flex size-full flex-col md:hidden overflow-hidden ">
        {selectedPanel.content}
        <div className="absolute bottom-4 left-4 right-4 z-50">
          <div className="flex justify-center rounded-full bg-primary p-2 shadow-lg">
            {mainPanels.map((panel) => (
              <Button
                key={panel.title}
                variant={
                  selectedPanel.title !== panel.title ? "default" : "secondary"
                }
                size="sm"
                className="flex-1"
                onClick={() => setSelectedPanel(panel)}
              >
                {panel.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageConfigPanel({ className }: { className: string }) {
  return (
    <Tabs
      data-testid="page-config-panel"
      defaultValue="layers"
      className={className}
    >
      <TabsList className="grid grid-cols-1 mx-4">
        <TabsTrigger value="layers">Layers</TabsTrigger>
      </TabsList>
      <TabsContent value="layers">
        <LayersPanel />
      </TabsContent>
    </Tabs>
  );
}

export function LoadingSkeleton() {
  return (
    <div
      data-testid="loading-skeleton"
      className="flex flex-col flex-1 gap-1 bg-secondary/90"
    >
      <div className="w-full h-16 animate-pulse bg-background rounded-md"></div>
      <div className="flex flex-1 gap-1">
        <div className="w-1/4 animate-pulse bg-background rounded-md"></div>
        <div className="w-1/2 animate-pulse bg-muted-background/90 rounded-md"></div>
        <div className="w-1/4 animate-pulse bg-background rounded-md"></div>
      </div>
    </div>
  );
}

export default UIBuilder;

export const defaultPanelConfig = (useCanvas: boolean) => {
  return {
    navBar: <NavBar useCanvas={useCanvas} />,
    pageConfigPanel: (
      <PageConfigPanel className="pt-4 pb-20 md:pb-4 overflow-y-auto relative size-full" />
    ),
    editorPanel: (
      <EditorPanel
        useCanvas={useCanvas}
        className="pb-20 md:pb-0 overflow-y-auto"
      />
    ),
    propsPanel: (
      <PropsPanel className="px-4 pt-4 pb-20 md:pb-4 overflow-y-auto relative size-full" pagePropsForm={<TailwindThemePanel />} />
    )
  };
};
