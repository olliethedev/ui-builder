import React from "react";
import { Layer, useComponentStore, isTextLayer } from "@/components/ui/ui-builder/store/component-store";

interface LayersPanelProps {
  className?: string;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ className }) => {
  const { layers, selectLayer, selectedLayer } = useComponentStore();

  const isSelected = (layer: Layer): boolean => {
    if (isTextLayer(layer)) return false;
    return layer.id === selectedLayer?.id || 
           (layer.children && layer.children.some(isSelected)) || false;
  };

  const renderLayer = (layer: Layer, depth = 0) => {
    if (isTextLayer(layer)) return null;

    return (
      <div key={layer.id} style={{ marginLeft: depth === 0 ? "0px" : "20px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            selectLayer(layer.id);
          }}
          className={`text-left w-full p-1 rounded ${
            isSelected(layer) ? 'bg-blue-200' : 'hover:bg-gray-100'
          }`}
        >
          {layer.type}
        </button>
        {layer.children &&
          layer.children.length > 0 &&
          layer.children.map((child: Layer) => renderLayer(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">Component Tree</h2>
      {layers.map((layer: Layer) => renderLayer(layer))}
    </div>
  );
};

export default LayersPanel;