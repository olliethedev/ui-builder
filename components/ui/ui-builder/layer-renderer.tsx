import React from "react";

import { EditorConfig, RenderLayer } from "@/components/ui/ui-builder/internal/render-utils";
import { DevProfiler } from "@/components/ui/ui-builder/internal/dev-profiler";

import { Variable, ComponentLayer, ComponentRegistry, PropValue } from '@/components/ui/ui-builder/types';

interface LayerRendererProps<T extends ComponentLayer = ComponentLayer> {
  className?: string;
  page: T;
  editorConfig?: EditorConfig;
  componentRegistry: ComponentRegistry;
  /** Optional variable definitions */
  variables?: Variable[];
  /** Optional variable values to override defaults */
  variableValues?: Record<string, PropValue>;
}

const LayerRenderer = <T extends ComponentLayer = ComponentLayer>({
  className,
  page,
  editorConfig,
  componentRegistry,
  variables,
  variableValues,
}: LayerRendererProps<T>) => {

  return (
    <DevProfiler id="LayerRenderer" threshold={30}>
      <div className={className}>
        <RenderLayer 
          layer={page} 
          editorConfig={editorConfig} 
          componentRegistry={componentRegistry} 
          variables={variables}
          variableValues={variableValues} 
        />
      </div>
    </DevProfiler>
  );
};

export default LayerRenderer;

