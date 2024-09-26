import React from "react";
import { Layer, useComponentStore, isTextLayer } from "@/components/ui/ui-builder/internal/store/component-store";
import { cn } from "@/lib/utils";

interface LayersPanelProps {
  className?: string;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ className }) => {
  const { selectedPageId, findLayersForPageId, selectLayer, selectedLayerId } = useComponentStore();

  const layers = findLayersForPageId(selectedPageId);

  const renderLayer = (layer: Layer, depth = 0) => {
    

    return (
      <div key={layer.id} style={{ marginLeft: depth === 0 ? "0px" : "20px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            selectLayer(layer.id);
          }}
          className={`text-left mb-1 w-full p-1 rounded ${
            layer.id === selectedLayerId ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
          }`}
        >
          {isTextLayer(layer) ? "Text" : layer.type}
        </button>
        {!isTextLayer(layer) && layer.children &&
          layer.children.length > 0 &&
          layer.children.map((child: Layer) => renderLayer(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className={cn(className, "flex flex-col flex-shrink-0")}>
      {layers.map((layer: Layer) => renderLayer(layer))}
    </div>
  );
};

export default LayersPanel;