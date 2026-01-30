"use client";

import React, { useMemo } from "react";
import { Plus, Trash, Copy, Scissors, ClipboardPaste, CopyPlus } from "lucide-react";
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { canComponentAcceptChildren } from "@/lib/ui-builder/store/schema-utils";
import { SHORTCUTS } from "@/lib/ui-builder/shortcuts/shortcut-registry";
import { useGlobalLayerActions } from "@/lib/ui-builder/hooks/use-layer-actions";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/components/add-component-popover";

export interface LayerMenuItemsProps {
  layerId: string;
  /** Callback when an action is performed - useful for closing menus */
  onAction?: () => void;
  /** Whether to show the "Add Child" option */
  showAddChild?: boolean;
}

/**
 * Shared menu items for layer context menu.
 * Renders menu items with shortcuts for copy, cut, paste, duplicate, and delete actions.
 */
export const LayerMenuItems: React.FC<LayerMenuItemsProps> = ({
  layerId,
  onAction,
  showAddChild = true,
}) => {
  const selectedLayer = useLayerStore((state) => state.findLayerById(layerId));
  const isLayerAPage = useLayerStore((state) => state.isLayerAPage(layerId));
  const componentRegistry = useEditorStore((state) => state.registry);
  const allowPagesCreation = useEditorStore((state) => state.allowPagesCreation);
  const allowPagesDeletion = useEditorStore((state) => state.allowPagesDeletion);

  const {
    canPaste,
    handleCopy,
    handleCut,
    handlePaste,
    handleDelete,
    handleDuplicate,
  } = useGlobalLayerActions(layerId);

  // Check permissions for page operations
  const canDuplicate = !isLayerAPage || allowPagesCreation;
  const canDelete = !isLayerAPage || allowPagesDeletion;
  const canCut = canDelete; // Cut is only possible if we can delete

  // Check if component can have children added
  const canRenderAddChild = useMemo(() => {
    if (!showAddChild) return false;
    if (!selectedLayer) return false;

    const componentDef = componentRegistry[selectedLayer.type as keyof typeof componentRegistry];
    if (!componentDef) return false;

    return canComponentAcceptChildren(componentDef.schema);
  }, [showAddChild, selectedLayer, componentRegistry]);

  const handleCopyClick = () => {
    handleCopy();
    onAction?.();
  };

  const handleCutClick = () => {
    handleCut();
    onAction?.();
  };

  const handlePasteClick = () => {
    handlePaste();
    onAction?.();
  };

  const handleDuplicateClick = () => {
    handleDuplicate();
    onAction?.();
  };

  const handleDeleteClick = () => {
    handleDelete();
    onAction?.();
  };

  return (
    <>
      {canRenderAddChild && (
        <>
          <AddComponentsPopover parentLayerId={layerId}>
            <ContextMenuItem
              onSelect={(e) => {
                // Prevent the menu from closing so the popover can open
                e.preventDefault();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Child
            </ContextMenuItem>
          </AddComponentsPopover>
          <ContextMenuSeparator />
        </>
      )}

      <ContextMenuItem onSelect={handleCopyClick}>
        <Copy className="mr-2 h-4 w-4" />
        Copy
        <ContextMenuShortcut>{SHORTCUTS.copy.shortcutDisplay}</ContextMenuShortcut>
      </ContextMenuItem>

      {canCut && (
        <ContextMenuItem onSelect={handleCutClick}>
          <Scissors className="mr-2 h-4 w-4" />
          Cut
          <ContextMenuShortcut>{SHORTCUTS.cut.shortcutDisplay}</ContextMenuShortcut>
        </ContextMenuItem>
      )}

      <ContextMenuItem onSelect={handlePasteClick} disabled={!canPaste}>
        <ClipboardPaste className="mr-2 h-4 w-4" />
        Paste
        <ContextMenuShortcut>{SHORTCUTS.paste.shortcutDisplay}</ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuSeparator />

      {canDuplicate && (
        <ContextMenuItem onSelect={handleDuplicateClick}>
          <CopyPlus className="mr-2 h-4 w-4" />
          Duplicate
          <ContextMenuShortcut>{SHORTCUTS.duplicate.shortcutDisplay}</ContextMenuShortcut>
        </ContextMenuItem>
      )}

      {canDelete && (
        <ContextMenuItem
          onSelect={handleDeleteClick}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
          <ContextMenuShortcut>{SHORTCUTS.delete.shortcutDisplay}</ContextMenuShortcut>
        </ContextMenuItem>
      )}
    </>
  );
};
