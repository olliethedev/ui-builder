"use client";

import React, { useCallback, useMemo } from "react";
import { useGlobalLayerActions } from "@/lib/ui-builder/hooks/use-layer-actions";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
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
 * Captures right-click events and dispatches them to the global context menu portal.
 * If the layer is not selected, right-clicking will select it first.
 * Also handles keyboard shortcuts for copy/cut/paste/duplicate/delete.
 */
export const LayerContextMenu: React.FC<LayerContextMenuProps> = ({
  layerId,
  isSelected,
  onSelect,
  children,
  className,
  style,
}) => {
  const openContextMenu = useEditorStore((state) => state.openContextMenu);
  
  const {
    handleCopy,
    handleCut,
    handlePaste,
    handleDelete,
    handleDuplicate,
    canPaste,
  } = useGlobalLayerActions(layerId);

  // Handle right-click - open global context menu
  // Use the raw event coordinates since the menu renders inside the iframe
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Select the layer if not already selected
      if (!isSelected) {
        onSelect(layerId);
      }
      
      // Use raw event coordinates - the menu renders inside the iframe
      // so we don't need any coordinate conversion
      openContextMenu(e.clientX, e.clientY, layerId);
    },
    [isSelected, layerId, onSelect, openContextMenu]
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

  // If children is a single React element, clone it with the context menu handler
  // Otherwise, wrap in a span
  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onContextMenu: handleContextMenu,
      className: className ? `${(children.props as React.HTMLAttributes<HTMLElement>).className || ''} ${className}`.trim() : (children.props as React.HTMLAttributes<HTMLElement>).className,
      style: style ? { ...(children.props as React.HTMLAttributes<HTMLElement>).style, ...style } : (children.props as React.HTMLAttributes<HTMLElement>).style,
    });
  }

  return (
    <span
      onContextMenu={handleContextMenu}
      className={className}
      style={style}
    >
      {children}
    </span>
  );
};
