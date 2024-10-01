import React from "react";
import { ChevronRight, Plus, Trash, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  componentRegistry,
  isTextLayer,
  useComponentStore,
} from "@/components/ui/ui-builder/internal/store/component-store";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/add-component-popover";

interface MenuProps {
  layerId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  handleDuplicateComponent: () => void;
  handleDeleteComponent: () => void;
}

export const LayerMenu: React.FC<MenuProps> = ({
  layerId,
  x,
  y,
  width,
  height,
  zIndex,
  handleDuplicateComponent,
  handleDeleteComponent,
}) => {
  const selectedLayer = useComponentStore((state) =>
    state.findLayerById(layerId)
  );

  //const hasChildrenInSchema = schema.shape.children !== undefined;
  const hasChildrenInSchema =
    selectedLayer &&
    !isTextLayer(selectedLayer) &&
    componentRegistry[selectedLayer.type as keyof typeof componentRegistry]
      .schema.shape.children !== undefined;
  return (
    <>
      <div
        className="fixed"
        style={{
          top: y,
          left: x,
          zIndex: zIndex,
        }}
      >
        <span className="h-5 group flex items-center rounded-bl-full rounded-r-full bg-blue-500 p-0 text-sm font-semibold text-secondary-foreground shadow-sm ring-1 ring-inset ring-blue-500 hover:bg-secondary/95 hover:h-10 hover:ring-2 transition-all duration-200 ease-in-out overflow-hidden cursor-pointer hover:cursor-auto">
          <ChevronRight className="h-5 w-5 text-secondary-foreground group-hover:size-8 transition-all duration-200 ease-in-out group-hover:opacity-30" />

          <div className="overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-200 ease-in-out">
            {hasChildrenInSchema && (
              <AddComponentsPopover
                parentLayerId={layerId}
                className="flex-shrink w-min inline-flex"
              >
                <Button size="sm" variant="ghost">
                  <span className="sr-only">Add Component</span>
                  <Plus className="h-5 w-5 text-secondary-foreground" />
                </Button>
              </AddComponentsPopover>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDuplicateComponent}
            >
              <span className="sr-only">Duplicate</span>
              <Copy className="h-5 w-5 text-secondary-foreground" />
            </Button>
            <Button
              className="rounded-r-full mr-1"
              size="sm"
              variant="ghost"
              onClick={handleDeleteComponent}
            >
              <span className="sr-only">Delete</span>
              <Trash className="h-5 w-5 text-secondary-foreground" />
            </Button>
          </div>
        </span>
      </div>
    </>
  );
};
