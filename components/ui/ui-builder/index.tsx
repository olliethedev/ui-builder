"use client";

import React, { useEffect, useState } from "react";
import LayersPanel from "@/components/ui/ui-builder/internal/layers-panel";
import EditorPanel from "@/components/ui/ui-builder/internal/editor-panel";
import PropsPanel from "@/components/ui/ui-builder/internal/props-panel";
import { NavBar } from "@/components/ui/ui-builder/internal/nav";
import { ThemeProvider } from "next-themes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemePanel } from "@/components/ui/ui-builder/internal/theme-panel";
import {
  ResizablePanel,
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ConfigPanel } from "@/components/ui/ui-builder/internal/config-panel";
import { PageLayer, useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useStore } from "@/hooks/use-store";

interface UIBuilderProps {
  initialLayers?: PageLayer[];
  onChange?: (pages: PageLayer[]) => void;
}

const UIBuilder = ({ initialLayers, onChange }: UIBuilderProps) => {
  const store = useStore(useLayerStore, (state) => state);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (store) {
      if (initialLayers && !initialized) {
        store?.initialize(initialLayers);
        setInitialized(true);
        const { clear } = useLayerStore.temporal.getState();
        clear();
      } else {
        setInitialized(true);
      }
    }
  }, [initialLayers, store, initialized]);

  useEffect(() => {
    if (onChange && store) {
      onChange(store.pages);
    }
  }, [store, onChange]);

  const layout = !store || !initialized ? <LoadingSkeleton /> : <MainLayout />;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {layout}
    </ThemeProvider>
  );
};

function MainLayout() {
  const mainPanels = [
    {
      title: "Page Config",
      content: (
        <PageConfigPanel className="px-4 pt-4 pb-20 md:pb-4 overflow-y-auto relative size-full" />
      ),
      defaultSize: 25,
    },
    {
      title: "UI Editor",
      content: <EditorPanel className="pb-20 md:pb-0 overflow-y-auto" />,
      defaultSize: 50,
    },
    {
      title: "Props",
      content: (
        <PropsPanel className="px-4 pt-4 pb-20 md:pb-4 overflow-y-auto relative size-full" />
      ),
      defaultSize: 25,
    },
  ];

  const [selectedPanel, setSelectedPanel] = useState(mainPanels[0]);
  return (
    <div
      data-testid="component-editor"
      className="flex flex-col w-full flex-grow h-screen"
    >
      <NavBar />
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

function PageConfigPanel({ className }: { className: string }) {
  return (
    <Tabs defaultValue="layers" className={className}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="layers">Layers</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
      </TabsList>
      <TabsContent value="layers">
        <LayersPanel />
      </TabsContent>
      <TabsContent value="appearance">
        <div className="py-2 gap-2 flex flex-col overflow-y-auto overflow-x-auto">
          <ConfigPanel />
          <ThemePanel />
        </div>
      </TabsContent>
    </Tabs>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col flex-1 gap-1 bg-secondary/90">
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