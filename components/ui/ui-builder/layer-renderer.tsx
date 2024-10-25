import React, { Profiler } from "react";

import {
  PageLayer,
} from "@/lib/ui-builder/store/layer-store";
import { EditorConfig, RenderPage } from "@/components/ui/ui-builder/internal/render-utils";

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
    <Profiler id="LayerRenderer" onRender={(id, phase, actualDuration) => {
      if(actualDuration > 30){
        console.log(`%c${id} ${phase} ${actualDuration}`, "color: red");
      }
    }}>
      <div className={className}>
        <RenderPage page={page} editorConfig={editorConfig} />
      </div>
    </Profiler>
  );
};

export default LayerRenderer;

