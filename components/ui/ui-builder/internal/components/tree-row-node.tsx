import React, { useCallback, useState, memo, useMemo } from "react";
import { NodeAttrs } from "he-tree-react";
import isDeepEqual from "fast-deep-equal";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  MoreVertical,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hasLayerChildren } from "@/lib/ui-builder/store/layer-utils";
import { ComponentLayer } from "@/components/ui/ui-builder/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/components/add-component-popover";
import { NameEdit } from "@/components/ui/ui-builder/internal/components/name-edit";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { hasAnyChildrenField, hasChildrenFieldOfTypeString } from "@/lib/ui-builder/store/schema-utils";

interface TreeRowNodeProps {
  node: ComponentLayer;
  id: number | string;
  level: number;
  open: boolean;
  draggable: boolean;
  onToggle: (id: number | string, open: boolean) => void;
  nodeAttributes: NodeAttrs;
  selectedLayerId: string | null;
  selectLayer: (id: string) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  updateLayer: (
    id: string,
    update: Partial<ComponentLayer>,
    options?: {
      name?: string;
      children?: ComponentLayer[];
    }
  ) => void;
}

export const TreeRowNode: React.FC<TreeRowNodeProps> = memo(({
  node,
  id,
  level,
  open,
  draggable,
  onToggle,
  nodeAttributes,
  selectedLayerId,
  selectLayer,
  removeLayer,
  duplicateLayer,
  updateLayer,
}) => {
  const componentRegistry = useEditorStore((state) => state.registry);

  const [isRenaming, setIsRenaming] = useState(false);

  const [popoverOrMenuOpen, setPopoverOrMenuOpen] = useState(false);

  const allowPagesCreation = useEditorStore(
    (state) => state.allowPagesCreation
  );
  const allowPagesDeletion = useEditorStore(
    (state) => state.allowPagesDeletion
  );

  const handleOpen = useCallback(() => {
    onToggle(id, !open);
  }, [id, open, onToggle]);

  const handleSelect = useCallback(() => {
    selectLayer(node.id);
  }, [node.id, selectLayer]);

  const handleRemove = useCallback(() => {
    removeLayer(node.id);
  }, [node.id, removeLayer]);

  const handleDuplicate = useCallback(() => {
    duplicateLayer(node.id);
  }, [node.id, duplicateLayer]);

  const handleRenameClick = useCallback(() => {
    setIsRenaming(true);
  }, []);

  const handleSaveRename = useCallback(
    (newName: string) => {
      updateLayer(node.id, {}, { name: newName });
      setIsRenaming(false);
    },
    [node.id, updateLayer]
  );

  const handleCancelRename = useCallback(() => {
    setIsRenaming(false);
  }, []);

  const canRenderAddChild = useMemo(() => {

    const componentDef =
      componentRegistry[node.type as keyof typeof componentRegistry];
    if (!componentDef) return false;

    // Safely check if schema has shape property (ZodObject) and children field
    const canAddChildren =
      "shape" in componentDef.schema &&
      hasAnyChildrenField(componentDef.schema) && !hasChildrenFieldOfTypeString(componentDef.schema);

    return canAddChildren;
  }, [node, componentRegistry]);

  const { key, ...rest } = nodeAttributes;

  if (!node) {
    return null;
  }

  return (
    <div key={key} {...rest} className="w-fit flex items-center group relative">
      <RowOffset level={level} />

      {hasLayerChildren(node) && node.children.length > 0 ? (
        <Button
          className="w-4 ml-3 p-0"
          variant="ghost"
          size="sm"
          onClick={handleOpen}
        >
          {open ? (
            <ChevronDown className="size-4 bg-secondary rounded-full" />
          ) : (
            <ChevronRight className="size-4 bg-secondary rounded-full" />
          )}
        </Button>
      ) : (
        <div className="size-4 rounded-none opacity-0 ml-3" />
      )}

      {isRenaming ? (
        <NameEdit
          initialName={node.name ?? ""}
          onSave={handleSaveRename}
          onCancel={handleCancelRename}
        />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className={cn("pl-0 gap-0",
            node.id === selectedLayerId
              ? "text-primary"
              : "text-muted-foreground"
          )}
          onClick={handleSelect}
        >
          <div
            className={cn(
              "w-4 h-full flex items-center justify-center cursor-move opacity-0 rounded group-hover:opacity-100 hover:bg-muted-foreground hover:text-muted transition-opacity duration-200 ease-in-out",
              popoverOrMenuOpen ? "opacity-100" : "opacity-0"
            )}
            draggable={draggable}
          >
            <GripVertical className="size-4" />
          </div>
          {node.name}
        </Button>
      )}
      {canRenderAddChild && (
        <AddComponentsPopover
          parentLayerId={node.id}
          onOpenChange={setPopoverOrMenuOpen}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out",
              popoverOrMenuOpen ? "opacity-100" : "opacity-0"
            )}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add component</span>
          </Button>
        </AddComponentsPopover>
      )}
      <DropdownMenu onOpenChange={setPopoverOrMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out",
              popoverOrMenuOpen ? "opacity-100" : "opacity-0"
            )}
            variant="ghost"
            size="icon"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleRenameClick}>
            Rename
          </DropdownMenuItem>
          {allowPagesCreation && (
            <DropdownMenuItem onClick={handleDuplicate}>
              Duplicate
            </DropdownMenuItem>
          )}
          {allowPagesDeletion && (
            <DropdownMenuItem onClick={handleRemove}>Remove</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom equality check to prevent unnecessary re-renders
  
  // Check node identity and core properties
  if (prevProps.node.id !== nextProps.node.id) return false;
  if (!isDeepEqual(prevProps.node, nextProps.node)) return false;
  
  // Check simple props
  if (prevProps.id !== nextProps.id) return false;
  if (prevProps.level !== nextProps.level) return false;
  if (prevProps.open !== nextProps.open) return false;
  if (prevProps.draggable !== nextProps.draggable) return false;
  if (prevProps.selectedLayerId !== nextProps.selectedLayerId) return false;
  
  // Check nodeAttributes - these often change reference but may have same values
  if (!isDeepEqual(prevProps.nodeAttributes, nextProps.nodeAttributes)) return false;
  
  // Function props should be stable if parent memoization is working correctly
  // If not, these will cause re-renders but that might be necessary
  if (prevProps.onToggle !== nextProps.onToggle) return false;
  if (prevProps.selectLayer !== nextProps.selectLayer) return false;
  if (prevProps.removeLayer !== nextProps.removeLayer) return false;
  if (prevProps.duplicateLayer !== nextProps.duplicateLayer) return false;
  if (prevProps.updateLayer !== nextProps.updateLayer) return false;
  
  return true;
});

TreeRowNode.displayName = "TreeRowNode";

const RowOffset = ({ level }: { level: number }) => {

  const style = useMemo(() => ({
    width: level * 20,
  }), [level]);
  

  const arr = useMemo(() => Array.from({ length: level }), [level]);

  return (
    <div
      className="z-[-1] left-0 pointer-events-none absolute flex flex-row bottom-[20px] h-full"
      style={style}
    >
      {arr.map((_, index) => (
        <div
          key={index}
          className={cn(
            "w-5 h-full border-l border-dashed border-primary bg-background",
            index === level - 1 && "border-b "
          )}
        />
      ))}
    </div>
  );
};

export const TreeRowPlaceholder: React.FC<
  Pick<TreeRowNodeProps, "nodeAttributes">
> = ({ nodeAttributes }) => {
  const { key, ...rest } = nodeAttributes;
  return (
    <div key={key} {...rest} className="w-40 h-2">
      <div className="size-full border-b-2 border-blue-500 border-dashed" />
    </div>
  );
};
