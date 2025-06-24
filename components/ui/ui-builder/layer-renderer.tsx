import React from "react";

import { EditorConfig, RenderLayer } from "@/components/ui/ui-builder/internal/utils/render-utils";
import { DevProfiler } from "@/components/ui/ui-builder/internal/components/dev-profiler";

import { Variable, ComponentLayer, ComponentRegistry, PropValue } from '@/components/ui/ui-builder/types';

interface LayerRendererProps<TRegistry extends ComponentRegistry = ComponentRegistry> {
  className?: string;
  page: ComponentLayer;
  editorConfig?: EditorConfig;
  componentRegistry: TRegistry;
  /** Optional variable definitions */
  variables?: Variable[];
  /** Optional variable values to override defaults */
  variableValues?: Record<string, PropValue>;
}

const LayerRenderer = React.memo<LayerRendererProps>(function LayerRenderer({
  className,
  page,
  editorConfig,
  componentRegistry,
  variables,
  variableValues,
}) {

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
}) as <TRegistry extends ComponentRegistry = ComponentRegistry>(
  props: LayerRendererProps<TRegistry>
) => JSX.Element;

export default LayerRenderer;

