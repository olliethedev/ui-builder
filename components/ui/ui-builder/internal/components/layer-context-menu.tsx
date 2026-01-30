"use client";

import React, { useCallback, useMemo } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { LayerMenuItems } from "@/components/ui/ui-builder/internal/components/layer-menu-items";
import { useGlobalLayerActions } from "@/lib/ui-builder/hooks/use-layer-actions";
import {
  type KeyCombination,
  useKeyboardShortcuts,
} from "@/hooks/use-keyboard-shortcuts";
import { SHORTCUTS } from "@/lib/ui-builder/shortcuts/shortcut-registry";

export interface LayerContextMenuProps {
  layerId: string;
  /** Whether the layer is currently selected */
  isSelected: boolean;
  /** Callback to select the layer */
  onSelect: (layerId: string) => void;
  /** Children to wrap with context menu */
  children: React.ReactNode;
  /** Additional class name for the trigger */
  className?: string;
  /** Style for the trigger */
  style?: React.CSSProperties;
}

/**
 * Context menu wrapper for layers.
 * Wraps children with a right-click context menu that provides layer actions.
 * If the layer is not selected, right-clicking will select it first.
 */
export const LayerContextMenu: React.FC<LayerContextMenuProps> = ({
  layerId,
  isSelected,
  onSelect,
  children,
  className,
  style,
}) => {
  const {
    handleCopy,
    handleCut,
    handlePaste,
    handleDelete,
    handleDuplicate,
    canPaste,
  } = useGlobalLayerActions(layerId);

  // Handle context menu open - select the layer if not selected
  const handleContextMenuOpen = useCallback(
    (open: boolean) => {
      if (open && !isSelected) {
        onSelect(layerId);
      }
    },
    [isSelected, layerId, onSelect]
  );

  // Check if the active element is an input or textarea
  const isInputFocused = useCallback(() => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    const tagName = activeElement.tagName.toLowerCase();
    const isContentEditable = activeElement.getAttribute('contenteditable') === 'true';
    
    return tagName === 'input' || tagName === 'textarea' || isContentEditable;
  }, []);

  // Register keyboard shortcuts only when this layer is selected
  const keyCombinations = useMemo<KeyCombination[]>(() => {
    if (!isSelected) return [];

    return [
      {
        keys: SHORTCUTS.copy.keys,
        key: SHORTCUTS.copy.key,
        handler: (e) => {
          if (isInputFocused()) return;
          e.preventDefault();
          handleCopy();
        },
      },
      {
        keys: SHORTCUTS.cut.keys,
        key: SHORTCUTS.cut.key,
        handler: (e) => {
          if (isInputFocused()) return;
          e.preventDefault();
          handleCut();
        },
      },
      {
        keys: SHORTCUTS.paste.keys,
        key: SHORTCUTS.paste.key,
        handler: (e) => {
          if (isInputFocused()) return;
          if (!canPaste) return;
          e.preventDefault();
          handlePaste();
        },
      },
      {
        keys: SHORTCUTS.duplicate.keys,
        key: SHORTCUTS.duplicate.key,
        handler: (e) => {
          if (isInputFocused()) return;
          e.preventDefault();
          handleDuplicate();
        },
      },
      {
        keys: SHORTCUTS.delete.keys,
        key: SHORTCUTS.delete.key,
        handler: (e) => {
          if (isInputFocused()) return;
          e.preventDefault();
          handleDelete();
        },
      },
    ];
  }, [isSelected, canPaste, handleCopy, handleCut, handlePaste, handleDuplicate, handleDelete, isInputFocused]);

  useKeyboardShortcuts(keyCombinations);

  return (
    <ContextMenu onOpenChange={handleContextMenuOpen}>
      <ContextMenuTrigger
        className={className}
        style={style}
        asChild
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <LayerMenuItems layerId={layerId} />
      </ContextMenuContent>
    </ContextMenu>
  );
};
