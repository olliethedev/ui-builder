"use client";

import React from "react";
import LayersPanel from "@/components/ui/ui-builder/internal/layers-panel";
import EditorPanel from "@/components/ui/ui-builder/internal/editor-panel";
import PropsPanel from "@/components/ui/ui-builder/internal/props-panel";
import { NavBar } from "@/components/ui/ui-builder/internal/nav";

const ComponentEditor = () => {
  return (
    <div data-testid="component-editor" className="flex flex-col w-full flex-grow h-full">
      <NavBar />
      <div className="flex h-full overflow-hidden">
        <LayersPanel className="w-1/4 p-4 border-r overflow-y-auto" />
        <EditorPanel className="w-1/2 p-4 overflow-y-auto" />
        <PropsPanel className="w-1/4 p-4 border-l overflow-y-auto" />
      </div>
    </div>
  );
};

export default ComponentEditor;
