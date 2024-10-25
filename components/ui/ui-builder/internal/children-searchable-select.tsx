/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import { X as XIcon, ChevronsUpDown } from "lucide-react";
import {
  useLayerStore,
  Layer,
} from "@/lib/ui-builder/store/layer-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/add-component-popover";
import { hasLayerChildren } from "@/lib/ui-builder/store/layer-utils";
import { ComponentLayer } from "@/lib/ui-builder/store/layer-store";

interface ChildrenSearchableSelectProps { 
  layer: ComponentLayer;
  onChange: ({ layerType, parentLayerId, addPosition }: { layerType: string, parentLayerId: string, addPosition?: number }) => void;
}
  
export function ChildrenSearchableSelect({ layer, onChange }: ChildrenSearchableSelectProps) {
  
    const { selectLayer, removeLayer, selectedLayerId, findLayerById } = useLayerStore();

    const selectedLayer = findLayerById(selectedLayerId);
  
    const handleRemove = React.useCallback(
      (childId: string) => {
        removeLayer(childId);
      },
      [removeLayer]
    );
  
    return (
      <div className="w-full space-y-4">
        <AddComponentsPopover parentLayerId={layer.id} onChange={onChange}>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              Add Component
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </AddComponentsPopover>
  
        {hasLayerChildren(layer)  && (
          <div className="w-full flex gap-2 flex-wrap">
            {selectedLayer && hasLayerChildren(selectedLayer) && selectedLayer.children.map((child) => (
              <Badge key={child.id} className="flex items-center space-x-2 pl-2 pr-0 py-0" variant="secondary">
                <Button className="p-0 h-5" variant="link" size="sm" onClick={() => selectLayer(child.id)}>
                  {nameForLayer(child)}
                </Button>
                <Button className="p-0 size-6 rounded-full" variant="ghost" size="icon" onClick={() => handleRemove(child.id)}>
                  <XIcon className="w-4 h-4" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  const nameForLayer = (layer: Layer) => {
    return layer.name || layer.type.replaceAll("_","");
  };
