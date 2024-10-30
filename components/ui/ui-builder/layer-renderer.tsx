import React from "react";

import {
  PageLayer,
} from "@/lib/ui-builder/store/layer-store";
import { EditorConfig, RenderPage } from "@/components/ui/ui-builder/internal/render-utils";
import { DevProfiler } from "@/components/ui/ui-builder/internal/dev-profiler";

interface LayerRendererProps {
  className?: string;
  page: PageLayer;
  editorConfig?: EditorConfig;
}

const LayerRenderer: React.FC<LayerRendererProps> = ({
  className,
  page,
  editorConfig,
}: LayerRendererProps) => {

  return (
    <DevProfiler id="LayerRenderer" threshold={30}>
      <div className={className}>
        <RenderPage page={page} editorConfig={editorConfig} />
      </div>
    </DevProfiler>
  );
};

export default LayerRenderer;

