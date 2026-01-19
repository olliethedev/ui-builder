import React from "react";

import { type EditorConfig, RenderLayer } from "@/components/ui/ui-builder/internal/utils/render-utils";
import { DevProfiler } from "@/components/ui/ui-builder/internal/components/dev-profiler";

import type { Variable, ComponentLayer, ComponentRegistry, PropValue, FunctionRegistry } from '@/components/ui/ui-builder/types';

interface LayerRendererProps<TRegistry extends ComponentRegistry = ComponentRegistry> {
  className?: string;
  page: ComponentLayer;
  editorConfig?: EditorConfig;
  componentRegistry: TRegistry;
  /** Optional variable definitions */
  variables?: Variable[];
  /** Optional variable values to override defaults */
  variableValues?: Record<string, PropValue>;
  /** Optional function registry for resolving function-type variables */
  functionRegistry?: FunctionRegistry;
}

const LayerRenderer = React.memo<LayerRendererProps>(function LayerRenderer({
  className,
  page,
  editorConfig,
  componentRegistry,
  variables,
  variableValues,
  functionRegistry,
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
          functionRegistry={functionRegistry}
        />
      </div>
    </DevProfiler>
  );
}) as <TRegistry extends ComponentRegistry = ComponentRegistry>(
  props: LayerRendererProps<TRegistry>
) => React.JSX.Element;

export default LayerRenderer;

