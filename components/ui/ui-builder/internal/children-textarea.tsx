/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import {
    ComponentLayer,
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { Textarea } from "@/components/ui/textarea";

interface ChildrenTextAreaProps {
  layer: ComponentLayer;
  className?: string;
}
  
export function ChildrenTextArea({ layer, className }: ChildrenTextAreaProps) {
  
    const { updateLayer } = useLayerStore();
  
    if (layer.children === undefined || typeof layer.children === "string") {
      return (
        <Textarea
          className={className}
          value={layer.children}
          onChange={(e) => updateLayer(layer.id, {  }, { children: e.target.value })}
        />
      );
    }
  }
