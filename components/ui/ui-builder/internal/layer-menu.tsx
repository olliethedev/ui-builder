import React, { useState } from "react";
import { ChevronRight, Plus, Trash, Copy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  componentRegistry,
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/add-component-popover";
import { cn } from "@/lib/utils";
import { hasLayerChildren } from "@/lib/ui-builder/store/layer-utils";

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
  zIndex,
  handleDuplicateComponent,
  handleDeleteComponent,
}) => {

  const [popoverOpen, setPopoverOpen] = useState(false);
  const selectedLayer = useLayerStore((state) =>
    state.findLayerById(layerId)
  );

  //const hasChildrenInSchema = schema.shape.children !== undefined;
  const hasChildrenInSchema =
    selectedLayer &&
    hasLayerChildren(selectedLayer) &&
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
        <span className={cn("h-5 group flex items-center rounded-bl-full rounded-r-full bg-blue-500/85 p-0 text-sm font-semibold text-secondary-foreground shadow-sm ring-1 ring-inset ring-blue-500 hover:bg-secondary/85 hover:h-10 hover:ring-2 transition-all duration-200 ease-in-out overflow-hidden cursor-pointer hover:cursor-auto", popoverOpen ? "h-10 ring-2" : "")}>
          <ChevronRight className={cn("h-5 w-5 text-secondary-foreground group-hover:size-8 transition-all duration-200 ease-in-out group-hover:opacity-30", popoverOpen ? "size-8 opacity-30" : "")} />

          <div className={cn("overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-200 ease-in-out", popoverOpen ? "max-w-xs" : "")}>
            {hasChildrenInSchema && (
              <AddComponentsPopover
                parentLayerId={layerId}
                className="flex-shrink w-min inline-flex"
                onOpenChange={setPopoverOpen}
              >
                <div className={cn(buttonVariants({ variant: "ghost", size: "sm" }),"cursor-pointer")} >
                  <span className="sr-only">Add Component</span>
                  <Plus className="h-5 w-5 text-secondary-foreground" />
                </div>
              </AddComponentsPopover>
            )}
             <div
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }),"cursor-pointer")}
              onClick={handleDuplicateComponent}
            >
              <span className="sr-only">Duplicate</span>
              <Copy className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "rounded-r-full mr-1 cursor-pointer"
              )}
              onClick={handleDeleteComponent}
            >
              <span className="sr-only">Delete</span>
              <Trash className="h-5 w-5 text-secondary-foreground" />
            </div>
          </div>
        </span>
      </div>
    </>
  );
};
