/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback } from "react";

import { X as XIcon, ChevronsUpDown } from "lucide-react";
import {
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer } from '@/components/ui/ui-builder/types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/components/add-component-popover";
import { hasLayerChildren } from "@/lib/ui-builder/store/layer-utils";

interface ChildrenSearchableSelectProps { 
  layer: ComponentLayer;
  onChange: ({ layerType, parentLayerId, addPosition }: { layerType: string, parentLayerId: string, addPosition?: number }) => void;
}
  
export function ChildrenSearchableSelect({ layer, onChange }: ChildrenSearchableSelectProps) {
  
    const { selectLayer, removeLayer, selectedLayerId, findLayerById } = useLayerStore();

    const selectedLayer = findLayerById(selectedLayerId);

  
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
              <ChildLayerBadge
                key={child.id}
                child={child}
                selectLayer={selectLayer}
                removeLayer={removeLayer}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  function ChildLayerBadge({child, selectLayer, removeLayer}: {child: ComponentLayer, selectLayer: (id: string) => void, removeLayer: (id: string) => void}){

    const handleSelect = useCallback(() => {
      selectLayer(child.id);
    }, [selectLayer, child.id]);

    const handleRemove = useCallback(() => {
      removeLayer(child.id);
    }, [removeLayer, child.id]);
    return (
      <Badge key={child.id} className="flex items-center space-x-2 pl-2 pr-0 py-0" variant="secondary">
                <Button className="p-0 h-5" variant="link" size="sm" onClick={handleSelect}>
                  {nameForLayer(child)}
                </Button>
                <Button className="p-0 size-6 rounded-full" variant="ghost" size="icon" onClick={handleRemove}>
                  <XIcon className="w-4 h-4" />
                </Button>
              </Badge>
    )
  }

  const nameForLayer = (layer: ComponentLayer) => {
    return layer.name || layer.type.replaceAll("_","");
  };
