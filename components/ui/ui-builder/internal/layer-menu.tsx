import React, { useMemo, useState } from "react";
import { ChevronRight, Plus, Trash, Copy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
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
  handleDuplicateComponent?: () => void;
  handleDeleteComponent?: () => void;
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
  const selectedLayer = useLayerStore((state) => state.findLayerById(layerId));
  const isLayerAPage = useLayerStore((state) => state.isLayerAPage(layerId));

  const componentRegistry = useEditorStore((state) => state.registry);
  const allowPagesCreation = useEditorStore((state) => state.allowPagesCreation);
  const allowPagesDeletion = useEditorStore((state) => state.allowPagesDeletion);

  // Check permissions for page operations
  const canDuplicate = !isLayerAPage || allowPagesCreation;
  const canDelete = !isLayerAPage || allowPagesDeletion;

  const style = useMemo(() => ({
    position: "absolute" as const,
    top: y,
    left: x,
    zIndex: zIndex,
  }), [y, x, zIndex]);

  const buttonVariantsValues = useMemo(() => {
    return buttonVariants({ variant: "ghost", size: "sm" });
  }, []);

  const canRenderAddChild = useMemo(() => {
    if (!selectedLayer) return false;
    
    const componentDef = componentRegistry[selectedLayer.type as keyof typeof componentRegistry];
    if (!componentDef) return false;
    
    // Safely check if schema has shape property (ZodObject) and children field
    const hasChildrenField = 'shape' in componentDef.schema && 
                            componentDef.schema.shape && 
                            componentDef.schema.shape.children !== undefined;
    
    return (
      hasLayerChildren(selectedLayer) &&
      hasChildrenField
    );
  }, [selectedLayer, componentRegistry]);

  return (
    <>
      <div
        style={style}
      >
        <span
          className={cn(
            "h-5 group flex items-center rounded-bl-full rounded-r-full bg-blue-500/85 p-0 text-sm font-semibold text-secondary-foreground shadow-sm ring-1 ring-inset ring-blue-500 hover:bg-secondary/85 hover:h-10 hover:ring-2 transition-all duration-200 ease-in-out overflow-hidden cursor-pointer hover:cursor-auto",
            popoverOpen ? "h-10 ring-2" : ""
          )}
        >
          <ChevronRight
            className={cn(
              "h-5 w-5 text-secondary-foreground group-hover:size-8 transition-all duration-200 ease-in-out group-hover:opacity-30",
              popoverOpen ? "size-8 opacity-30" : ""
            )}
          />

          <div
            className={cn(
              "flex flex-nowrap overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-200 ease-in-out",
              popoverOpen ? "max-w-xs" : ""
            )}
          >
            {canRenderAddChild && (
              <AddComponentsPopover
                parentLayerId={layerId}
                className="flex-shrink w-min inline-flex"
                onOpenChange={setPopoverOpen}
              >
                <div
                  className={cn(
                    buttonVariantsValues,
                    "cursor-pointer"
                  )}
                >
                  <span className="sr-only">Add Component</span>
                  <Plus className="h-5 w-5 text-secondary-foreground" />
                </div>
              </AddComponentsPopover>
            )}
            {canDuplicate && (
              <div
                className={cn(
                  buttonVariantsValues,
                  "cursor-pointer"
                )}
                onClick={handleDuplicateComponent}
              >
                <span className="sr-only">Duplicate {isLayerAPage ? "Page" : "Component"}</span>
                <Copy className="h-5 w-5 text-secondary-foreground" />
              </div>
            )}
            {canDelete && (
              <div
                className={cn(
                  buttonVariantsValues,
                  "rounded-r-full mr-1 cursor-pointer"
                )}
                onClick={handleDeleteComponent}
              >
                <span className="sr-only">Delete {isLayerAPage ? "Page" : "Component"}</span>
                <Trash className="h-5 w-5 text-secondary-foreground" />
              </div>
            )}
          </div>
        </span>
      </div>
    </>
  );
};
