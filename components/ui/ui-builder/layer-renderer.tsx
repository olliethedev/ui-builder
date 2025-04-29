import React from "react";

import {
  ComponentLayer,
} from "@/lib/ui-builder/store/layer-store";
import { EditorConfig, RenderLayer } from "@/components/ui/ui-builder/internal/render-utils";
import { DevProfiler } from "@/components/ui/ui-builder/internal/dev-profiler";
import { ComponentRegistry } from "@/lib/ui-builder/store/editor-store";
interface LayerRendererProps {
  className?: string;
  page: ComponentLayer;
  editorConfig?: EditorConfig;
  componentRegistry: ComponentRegistry;
}

const LayerRenderer: React.FC<LayerRendererProps> = ({
  className,
  page,
  editorConfig,
  componentRegistry,
}: LayerRendererProps) => {

  return (
    <DevProfiler id="LayerRenderer" threshold={30}>
      <div className={className}>
        <RenderLayer layer={page} editorConfig={editorConfig} componentRegistry={componentRegistry} />
      </div>
    </DevProfiler>
  );
};

export default LayerRenderer;

