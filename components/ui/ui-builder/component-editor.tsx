"use client";

import React from "react";
import LayersPanel from "@/components/ui/ui-builder/internal/layers-panel";
import EditorPanel from "@/components/ui/ui-builder/internal/editor-panel";
import PropsPanel from "@/components/ui/ui-builder/internal/props-panel";
import { NavBar } from "@/components/ui/ui-builder/internal/nav";
import { ThemeProvider } from "next-themes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemePanel } from "@/components/ui/ui-builder/internal/theme-panel";

const ComponentEditor = () => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div
        data-testid="component-editor"
        className="flex flex-col w-full flex-grow h-full"
      >
        <NavBar />
        <div className="flex h-full overflow-hidden">
          <Tabs defaultValue="layers" className="w-1/4 p-4 border-r overflow-y-auto" >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="layers">Layers</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
            </TabsList>
            <TabsContent value="layers">
              <LayersPanel />
            </TabsContent>
            <TabsContent value="theme">
              <ThemePanel />
            </TabsContent>
          </Tabs>

          <EditorPanel className="w-1/2 p-4 overflow-y-auto" />
          <PropsPanel className="w-1/4 p-4 border-l overflow-y-auto" />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ComponentEditor;
