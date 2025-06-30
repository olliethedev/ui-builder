/**
 * Learn more about the UI Builder:
 * https://github.com/olliethedev/ui-builder
 */

"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import LayersPanel from "@/components/ui/ui-builder/internal/layers-panel";
import EditorPanel from "@/components/ui/ui-builder/internal/editor-panel";
import PropsPanel from "@/components/ui/ui-builder/internal/props-panel";
import { NavBar } from "@/components/ui/ui-builder/internal/components/nav";
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
  Variable,
  LayerChangeHandler,
  VariableChangeHandler
} from "@/components/ui/ui-builder/types";
import { TailwindThemePanel } from "@/components/ui/ui-builder/internal/tailwind-theme-panel";
import { ConfigPanel } from "@/components/ui/ui-builder/internal/config-panel";
import { VariablesPanel } from "@/components/ui/ui-builder/internal/variables-panel";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * TabsContentConfig defines the structure for the content of the page config panel tabs.
 */
export interface TabsContentConfig {
  layers: { title: string; content: React.ReactNode };
  appearance?: { title: string; content: React.ReactNode };
  data?: { title: string; content: React.ReactNode };
}

/**
 * PanelConfig defines the configuration for the main panels in the UI Builder.
 */
interface PanelConfig {
  navBar?: React.ReactNode;
  pageConfigPanel?: React.ReactNode;
  pageConfigPanelTabsContent?: TabsContentConfig;
  editorPanel?: React.ReactNode;
  propsPanel?: React.ReactNode;
}

/**
 * UIBuilderProps defines the props for the UIBuilder component with enhanced type safety.
 */
interface UIBuilderProps<TRegistry extends ComponentRegistry = ComponentRegistry> {
  initialLayers?: ComponentLayer[];
  onChange?: LayerChangeHandler<TRegistry>;
  initialVariables?: Variable[];
  onVariablesChange?: VariableChangeHandler;
  componentRegistry: TRegistry;
  panelConfig?: PanelConfig;
  persistLayerStore?: boolean;
  allowVariableEditing?: boolean;
  allowPagesCreation?: boolean;
  allowPagesDeletion?: boolean;
}

/**
 * UIBuilder component manages the initialization of editor and layer stores, and renders the serializable layout.
 *
 * @param {UIBuilderProps} props - The props for the UIBuilder component.
 * @returns {JSX.Element} The UIBuilder component wrapped in a ThemeProvider.
 */
const UIBuilder = <TRegistry extends ComponentRegistry = ComponentRegistry>({
  initialLayers,
  onChange,
  initialVariables,
  onVariablesChange,
  componentRegistry,
  panelConfig: userPanelConfig,
  persistLayerStore = true,
  allowVariableEditing = true,
  allowPagesCreation = true,
  allowPagesDeletion = true,
}: UIBuilderProps<TRegistry>) => {
  const layerStore = useStore(useLayerStore, (state) => state);
  const editorStore = useStore(useEditorStore, (state) => state);

  const [editorStoreInitialized, setEditorStoreInitialized] = useState(false);
  const [layerStoreInitialized, setLayerStoreInitialized] = useState(false);

  const memoizedDefaultTabsContent = useMemo(() => defaultConfigTabsContent(), []);

  const currentPanelConfig = useMemo(() => {
    const effectiveTabsContent = userPanelConfig?.pageConfigPanelTabsContent || memoizedDefaultTabsContent;
    const defaultPanels = getDefaultPanelConfigValues(effectiveTabsContent);

    return {
      navBar: userPanelConfig?.navBar ?? defaultPanels.navBar,
      pageConfigPanel: userPanelConfig?.pageConfigPanel ?? defaultPanels.pageConfigPanel,
      editorPanel: userPanelConfig?.editorPanel ?? defaultPanels.editorPanel,
      propsPanel: userPanelConfig?.propsPanel ?? defaultPanels.propsPanel,
    };
  }, [userPanelConfig, memoizedDefaultTabsContent]);

  // Effect 1: Initialize Editor Store with registry and page form props
  useEffect(() => {
    if (editorStore && componentRegistry && !editorStoreInitialized) {
      editorStore.initialize(componentRegistry, persistLayerStore, allowPagesCreation, allowPagesDeletion, allowVariableEditing);
      setEditorStoreInitialized(true);
    }
  }, [
    editorStore,
    componentRegistry,
    editorStoreInitialized,
    persistLayerStore,
    allowPagesCreation,
    allowPagesDeletion,
    allowVariableEditing,
  ]);

  // Effect 2: Conditionally initialize Layer Store *after* Editor Store is initialized
  useEffect(() => {
    if (layerStore && editorStore) {
      if (initialLayers && !layerStoreInitialized) {
        layerStore.initialize(initialLayers, undefined, undefined, initialVariables);
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
    initialVariables,
    layerStoreInitialized,
  ]);

  // Effect 3: Handle onChange callback when pages change
  useEffect(() => {
    if (onChange && layerStore?.pages && layerStoreInitialized) {
      onChange(layerStore.pages);
    }
  }, [layerStore?.pages, onChange, layerStoreInitialized]);

  // Effect 4: Handle onVariablesChange callback when variables change
  useEffect(() => {
    if (onVariablesChange && layerStore?.variables && layerStoreInitialized) {
      onVariablesChange(layerStore.variables);
    }
  }, [layerStore?.variables, onVariablesChange, layerStoreInitialized]);

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
      <TooltipProvider>
      {layout}
      </TooltipProvider>
    </ThemeProvider>
  );
};

function MainLayout({ panelConfig }: { panelConfig: PanelConfig }) {
  const showLeftPanel = useEditorStore((state) => state.showLeftPanel);
  const showRightPanel = useEditorStore((state) => state.showRightPanel);

  const mainPanels = useMemo(() => {
    const panels = [];
    
    if (showLeftPanel) {
      panels.push({
        title: "Page Config",
        content: panelConfig.pageConfigPanel,
        defaultSize: showRightPanel ? 25 : 33,
      });
    }
    
    panels.push({
      title: "UI Editor",
      content: panelConfig.editorPanel,
      defaultSize: showLeftPanel && showRightPanel ? 50 : (showLeftPanel || showRightPanel ? 67 : 100),
    });
    
    if (showRightPanel) {
      panels.push({
        title: "Props",
        content: panelConfig.propsPanel,
        defaultSize: showLeftPanel ? 25 : 33,
      });
    }
    
    return panels;
  }, [panelConfig, showLeftPanel, showRightPanel]);

  const [selectedPanel, setSelectedPanel] = useState(() => {
    const editorPanel = mainPanels.find(panel => panel.title === "UI Editor");
    return editorPanel || mainPanels[0];
  });

  // Update selected panel when panels change
  useEffect(() => {
    const editorPanel = mainPanels.find(panel => panel.title === "UI Editor");
    const currentPanel = mainPanels.find(panel => panel.title === selectedPanel.title);
    
    if (!currentPanel) {
      setSelectedPanel(editorPanel || mainPanels[0]);
    }
  }, [mainPanels, selectedPanel.title]);

  const handlePanelClickById = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const panelIndex = parseInt(e.currentTarget.dataset.panelIndex || "0");
    setSelectedPanel(mainPanels[panelIndex]);
  }, [mainPanels]);

  return (
    <div
      data-testid="component-editor"
      className="flex flex-col w-full flex-grow h-dvh"
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
            {mainPanels.map((panel, index) => (
              <Button
                key={panel.title}
                variant={
                  selectedPanel.title !== panel.title ? "default" : "secondary"
                }
                size="sm"
                className="flex-1"
                data-panel-index={index}
                onClick={handlePanelClickById}
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

/**
 * PageConfigPanel renders a tabbed panel for page configuration, including layers, appearance, and variables tabs.
 *
 * @param {object} props
 * @param {string} props.className - The class name for the panel container.
 * @param {TabsContentConfig} props.tabsContent - The content for the tabs.
 * @returns {JSX.Element} The page config panel with tabs.
 */
export function PageConfigPanel({
  className,
  tabsContent,
}: {
  className: string;
  tabsContent: TabsContentConfig;
}) {
  const { layers, appearance, data } = tabsContent;
  const tabCount = 1 + (appearance ? 1 : 0) + (data ? 1 : 0);
  
  return (
    <Tabs
      data-testid="page-config-panel"
      defaultValue="layers"
      className={className}
    >
      <TabsList className={`grid grid-cols-${tabCount} mx-4`}>
        <TabsTrigger value="layers">{layers.title}</TabsTrigger>
        {appearance && <TabsTrigger value="appearance">{appearance.title}</TabsTrigger>}
        {data && <TabsTrigger value="variables">{data.title}</TabsTrigger>}
      </TabsList>
      <TabsContent value="layers">
        {layers.content}
      </TabsContent>
      {appearance && (
        <TabsContent value="appearance">
          {appearance.content}
        </TabsContent>
      )}
      {data && (
        <TabsContent value="variables">
          {data.content}
        </TabsContent>
      )}
    </Tabs>
  );
}

/**
 * Returns the default tab content configuration for the page config panel.
 *
 * @param {boolean} editVariables - Whether to allow editing variables.
 * @returns {TabsContentConfig} The default tabs content configuration.
 */
export function defaultConfigTabsContent() {
  return {
    layers: { title: "Layers", content: <LayersPanel /> },
    appearance: { title: "Appearance", content: (
      <div className="py-2 px-4 gap-2 flex flex-col overflow-y-auto overflow-x-auto">
        <ConfigPanel />
        <TailwindThemePanel />
        </div>
      ),
    },
    data: { title: "Data", content: <VariablesPanel /> }
  }
}

/**
 * LoadingSkeleton renders a skeleton UI while the builder is initializing.
 *
 * @returns {JSX.Element} The loading skeleton.
 */
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

/**
 * Returns the default panel configuration values for the UI Builder.
 *
 * @param {TabsContentConfig} tabsContent - The content for the page config panel tabs.
 * @returns {PanelConfig} The default panel configuration.
 */
export const getDefaultPanelConfigValues = ( tabsContent: TabsContentConfig) => {
  return {
    navBar: <NavBar />,
    pageConfigPanel: (
      <PageConfigPanel className="pt-4 pb-20 md:pb-4 overflow-y-auto relative size-full" tabsContent={tabsContent} />
    ),
    editorPanel: (
      <EditorPanel
        className="pb-20 md:pb-0 overflow-y-auto"
      />
    ),
    propsPanel: (
      <PropsPanel className="px-4 pt-4 pb-20 md:pb-4 overflow-y-auto relative size-full" />
    ),
  };
};

export default UIBuilder;
