import React, { useCallback, useState } from "react";
import { NodeAttrs } from "he-tree-react";
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
import { Layer } from "@/lib/ui-builder/store/layer-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/add-component-popover";
import { NameEdit } from "@/components/ui/ui-builder/internal/name-edit";

interface TreeRowNodeProps {
  node: Layer;
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
    update: Partial<Layer>,
    options?: {
      name?: string;
      children?: Layer[];
    }
  ) => void;
}

export const TreeRowNode: React.FC<TreeRowNodeProps> = ({
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
  const [isRenaming, setIsRenaming] = useState(false);

  const [popoverOrMenuOpen, setPopoverOrMenuOpen] = useState(false);

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
      {hasLayerChildren(node) && (
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
          <DropdownMenuItem onClick={handleDuplicate}>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRemove}>Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const RowOffset = ({ level }: { level: number }) => {
  return (
    <div
      className="z-[-1] left-0 pointer-events-none absolute flex flex-row bottom-[20px] h-full"
      style={{
        width: level * 20,
      }}
    >
      {Array.from({ length: level }).map((_, index) => (
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

TreeRowNode.displayName = "TreeRowNode";

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
