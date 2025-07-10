import React, { useMemo, useState } from "react";
import {  Plus, Trash, Copy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/components/add-component-popover";
import { cn } from "@/lib/utils";
import { hasAnyChildrenField, hasChildrenFieldOfTypeString } from "@/lib/ui-builder/store/schema-utils";

interface MenuProps {
  layerId: string;
  handleDuplicateComponent?: () => void;
  handleDeleteComponent?: () => void;
}

export const LayerMenu: React.FC<MenuProps> = ({
  layerId,
  handleDuplicateComponent,
  handleDeleteComponent,
}) => {
  const selectedLayer = useLayerStore((state) => state.findLayerById(layerId));
  const isLayerAPage = useLayerStore((state) => state.isLayerAPage(layerId));
  const [popoverOpen, setPopoverOpen] = useState(false);
  const componentRegistry = useEditorStore((state) => state.registry);
  const allowPagesCreation = useEditorStore(
    (state) => state.allowPagesCreation
  );
  const allowPagesDeletion = useEditorStore(
    (state) => state.allowPagesDeletion
  );

  // Check permissions for page operations
  const canDuplicate = !isLayerAPage || allowPagesCreation;
  const canDelete = !isLayerAPage || allowPagesDeletion;

  const buttonVariantsValues = useMemo(() => {
    return buttonVariants({ variant: "ghost", size: "sm" });
  }, []);

  const buttonClass = "p-2 h-6 w-6 cursor-pointer [&_svg]:size-3 bg-blue-500 rounded-lg text-white hover:bg-white hover:text-black";

  const canRenderAddChild = useMemo(() => {
    if (!selectedLayer) return false;

    const componentDef =
      componentRegistry[selectedLayer.type as keyof typeof componentRegistry];
    if (!componentDef) return false;

    // Safely check if schema has shape property (ZodObject) and children field
    const canAddChildren =
      "shape" in componentDef.schema &&
      hasAnyChildrenField(componentDef.schema) && !hasChildrenFieldOfTypeString(componentDef.schema);

    return canAddChildren;
  }, [selectedLayer, componentRegistry]);

  return (
    <>
      <div
        className={cn(
          "flex flex-nowrap overflow-hidden transition-all duration-200 ease-in-out rounded-lg bg-blue-500 text-white",
        )}
      >
        {canRenderAddChild && (
          <AddComponentsPopover
            parentLayerId={layerId}
            className="flex-shrink w-min inline-flex"
            onOpenChange={setPopoverOpen}
          >
            <div className={cn(buttonVariantsValues, buttonClass, popoverOpen ? "bg-white text-black" : "")}>
              <span className="sr-only">Add Component</span>
              <Plus className="size-3" />
            </div>
          </AddComponentsPopover>
        )}
        {canDuplicate && (
          <div
            className={cn(buttonVariantsValues, buttonClass)}
            onClick={handleDuplicateComponent}
            data-testid="duplicate-button"
          >
            <span className="sr-only">
              Duplicate {isLayerAPage ? "Page" : "Component"}
            </span>
            <Copy className="size-3" data-testid="duplicate-icon" />
          </div>
        )}
        {canDelete && (
          <div
            className={cn(buttonVariantsValues, buttonClass)}
            onClick={handleDeleteComponent}
            data-testid="delete-button"
          >
            <span className="sr-only">
              Delete {isLayerAPage ? "Page" : "Component"}
            </span>
            <Trash className="size-3" data-testid="delete-icon" />
          </div>
        )}
      </div>
    </>
  );
};
