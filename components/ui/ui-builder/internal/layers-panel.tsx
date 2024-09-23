import React from "react";
import { Layer, useComponentStore, isTextLayer } from "@/components/ui/ui-builder/internal/store/component-store";
import { cn } from "@/lib/utils";

interface LayersPanelProps {
  className?: string;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ className }) => {
  const { layers, selectLayer, selectedLayerId } = useComponentStore();


  const renderLayer = (layer: Layer, depth = 0) => {
    

    return (
      <div key={layer.id} style={{ marginLeft: depth === 0 ? "0px" : "20px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            selectLayer(layer.id);
          }}
          className={`text-left mb-1 w-full p-1 rounded ${
            layer.id === selectedLayerId ? 'bg-blue-200' : 'bg-gray-50 hover:bg-blue-100'
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
      <h2 className="text-xl font-semibold mb-4">Component Tree</h2>
      {layers.map((layer: Layer) => renderLayer(layer))}
    </div>
  );
};

export default LayersPanel;