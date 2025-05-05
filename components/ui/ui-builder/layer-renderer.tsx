import React from "react";

import { ComponentLayer } from './types';
import { EditorConfig, RenderLayer } from "@/components/ui/ui-builder/internal/render-utils";
import { DevProfiler } from "@/components/ui/ui-builder/internal/dev-profiler";
import { ComponentRegistry } from './types';
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

