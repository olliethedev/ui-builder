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
import { hasChildren } from "@/lib/ui-builder/store/layer-utils";
import { useComponentStore } from "@/lib/ui-builder/store/component-store";
import { Layer } from "@/lib/ui-builder/store/component-store";
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
}

export const TreeRowNode: React.FC<TreeRowNodeProps> = ({
  node,
  id,
  level,
  open,
  draggable,
  onToggle,
  nodeAttributes,
}) => {
  const {
    selectedLayerId,
    selectLayer,
    removeLayer,
    duplicateLayer,
    updateLayer,
  } = useComponentStore();

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

  return (
    <div key={key} {...rest} className="w-fit flex items-center group relative">
      <div
        className={`z-[-1] pointer-events-none absolute bottom-[20px] h-full border-b border-l border-border border-dashed bg-background`}
        style={{
          width: "20px",
          left: (level - 1) * 20,
        }}
      />
      <Button
        className={cn(
          "size-4 cursor-move opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out",
          popoverOrMenuOpen ? "opacity-100" : "opacity-0"
        )}
        variant="link"
        size="icon"
        draggable={draggable}
      >
        <GripVertical className="size-4" />
      </Button>
      {hasChildren(node) && node.children.length > 0 ? (
        <Button
          className="size-4 rounded-none"
          variant="link"
          size="icon"
          onClick={handleOpen}
        >
          {open ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      ) : (
        <div
          className="size-4 rounded-none opacity-0"
        />
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
          className={cn(
            node.id === selectedLayerId
              ? "text-primary"
              : "text-muted-foreground"
          )}
          onClick={handleSelect}
        >
          {node.name}
        </Button>
      )}
      {hasChildren(node) && (
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

export const TreeRowPlaceholder: React.FC<
  Pick<TreeRowNodeProps, "nodeAttributes">
> = ({ nodeAttributes }) => {
  const { key, ...rest } = nodeAttributes;
  return (
    <div
      key={key}
      {...rest}
      className="w-40 h-2"
    >
        <div className="size-full border-b-2 border-blue-500 border-dashed" />
    </div>
  );
};
