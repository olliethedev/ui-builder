import React  from "react";

import {
  PageLayer,
} from "@/components/ui/ui-builder/internal/store/component-store";
import { EditorConfig, renderPage } from "@/components/ui/ui-builder/internal/render-utils";

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
    <div className={className}>
      {renderPage(page, editorConfig)}
    </div>
  );
};

export default LayerRenderer;

