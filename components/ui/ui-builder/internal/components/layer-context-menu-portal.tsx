"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash, Copy, Scissors, ClipboardPaste, CopyPlus } from "lucide-react";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { canComponentAcceptChildren } from "@/lib/ui-builder/store/schema-utils";
import { SHORTCUTS } from "@/lib/ui-builder/shortcuts/shortcut-registry";
import { useGlobalLayerActions } from "@/lib/ui-builder/hooks/use-layer-actions";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/components/add-component-popover";
import { cn } from "@/lib/utils";
import { useFrame } from "@/components/ui/ui-builder/internal/canvas/auto-frame";
import { useDndContext } from "@/lib/ui-builder/context/dnd-context";
import {
  useFloating,
  offset,
  flip,
  shift,
  limitShift,
  type VirtualElement,
} from "@floating-ui/react";

/**
 * Global context menu portal that renders at mouse position INSIDE the iframe.
 * This component should be rendered inside the AutoFrame/iframe context.
 * It subscribes to context menu state from editor-store and renders
 * a menu at the captured mouse coordinates using floating-ui for smart positioning.
 */
export const LayerContextMenuPortal: React.FC = () => {
  const contextMenu = useEditorStore((state) => state.contextMenu);
  const closeContextMenu = useEditorStore((state) => state.closeContextMenu);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const { isDragging } = useDndContext();
  const [mounted, setMounted] = useState(false);
  
  // Track the layer ID that the context menu was opened for
  const contextMenuLayerIdRef = useRef<string | null>(null);
  
  // Get iframe context - if we're inside an iframe, we'll render there
  const frameContext = useFrame();

  // Use floating-ui for smart positioning with boundary detection
  const { refs, floatingStyles } = useFloating({
    placement: "bottom-start",
    middleware: [
      offset(2), // Small offset from cursor
      flip({
        fallbackPlacements: ["top-start", "bottom-end", "top-end"],
        padding: 8,
      }),
      shift({
        crossAxis: true,
        limiter: limitShift(),
        padding: 8,
      }),
    ],
  });

  // Update the virtual reference position when context menu coordinates change
  useEffect(() => {
    if (!contextMenu.open) return;
    
    const virtualReference: VirtualElement = {
      getBoundingClientRect: () => ({
        x: contextMenu.x,
        y: contextMenu.y,
        width: 0,
        height: 0,
        top: contextMenu.y,
        left: contextMenu.x,
        right: contextMenu.x,
        bottom: contextMenu.y,
      }),
    };
    
    refs.setPositionReference(virtualReference);
  }, [contextMenu.open, contextMenu.x, contextMenu.y, refs]);

  // Ensure we only render portal on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track which layer the context menu was opened for
  useEffect(() => {
    if (contextMenu.open && contextMenu.layerId) {
      contextMenuLayerIdRef.current = contextMenu.layerId;
    } else {
      contextMenuLayerIdRef.current = null;
    }
  }, [contextMenu.open, contextMenu.layerId]);

  // Close menu when a different layer is selected
  useEffect(() => {
    if (contextMenu.open && contextMenuLayerIdRef.current && selectedLayerId !== contextMenuLayerIdRef.current) {
      closeContextMenu();
    }
  }, [selectedLayerId, contextMenu.open, closeContextMenu]);

  // Close menu when drag starts
  useEffect(() => {
    if (isDragging && contextMenu.open) {
      closeContextMenu();
    }
  }, [isDragging, contextMenu.open, closeContextMenu]);

  // Handle click outside to close menu
  useEffect(() => {
    if (!contextMenu.open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const floatingEl = refs.floating.current;
      if (floatingEl && !floatingEl.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    const handleContextMenuOutside = (e: MouseEvent) => {
      // If right-clicking outside the menu, close it
      // (The new context menu event will open a new one if applicable)
      const floatingEl = refs.floating.current;
      if (floatingEl && !floatingEl.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    // Use mousedown for faster response
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("contextmenu", handleContextMenuOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleContextMenuOutside);
    };
  }, [contextMenu.open, closeContextMenu, refs.floating]);

  // Handle escape key to close menu
  useEffect(() => {
    if (!contextMenu.open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeContextMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [contextMenu.open, closeContextMenu]);

  if (!mounted || !contextMenu.open || !contextMenu.layerId) {
    return null;
  }

  // Determine where to render the portal
  // If we're inside an iframe, render to the iframe's body
  // Otherwise, render to the parent document's body
  const portalTarget = frameContext.document?.body || document.body;

  const menuContent = (
    <div
      ref={refs.setFloating}
      data-testid="layer-context-menu-portal"
      className="z-[10000] min-w-[14rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
      style={floatingStyles}
    >
      <ContextMenuPortalItems
        layerId={contextMenu.layerId}
        onAction={closeContextMenu}
      />
    </div>
  );

  // Render portal to the appropriate body (iframe or parent)
  return createPortal(menuContent, portalTarget);
};

interface ContextMenuPortalItemsProps {
  layerId: string;
  onAction: () => void;
}

/**
 * Menu items for the context menu portal.
 */
const ContextMenuPortalItems: React.FC<ContextMenuPortalItemsProps> = ({
  layerId,
  onAction,
}) => {
  const selectedLayer = useLayerStore((state) => state.findLayerById(layerId));
  const componentRegistry = useEditorStore((state) => state.registry);

  const {
    canPaste,
    canDuplicate,
    canDelete,
    canCut,
    handleCopy,
    handleCut,
    handlePaste,
    handleDelete,
    handleDuplicate,
  } = useGlobalLayerActions(layerId);

  // Check if component can have children added
  const canRenderAddChild = React.useMemo(() => {
    if (!selectedLayer) return false;

    const componentDef = componentRegistry[selectedLayer.type as keyof typeof componentRegistry];
    if (!componentDef) return false;

    return canComponentAcceptChildren(componentDef.schema);
  }, [selectedLayer, componentRegistry]);

  const handleCopyClick = useCallback(() => {
    handleCopy();
    onAction();
  }, [handleCopy, onAction]);

  const handleCutClick = useCallback(() => {
    handleCut();
    onAction();
  }, [handleCut, onAction]);

  const handlePasteClick = useCallback(() => {
    handlePaste();
    onAction();
  }, [handlePaste, onAction]);

  const handleDuplicateClick = useCallback(() => {
    handleDuplicate();
    onAction();
  }, [handleDuplicate, onAction]);

  const handleDeleteClick = useCallback(() => {
    handleDelete();
    onAction();
  }, [handleDelete, onAction]);

  return (
    <>
      {canRenderAddChild && (
        <>
          <AddComponentsPopover parentLayerId={layerId}>
            <MenuItem onClick={(e) => e.stopPropagation()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Child
            </MenuItem>
          </AddComponentsPopover>
          <MenuSeparator />
        </>
      )}

      <MenuItem onClick={handleCopyClick}>
        <Copy className="mr-2 h-4 w-4" />
        Copy
        <MenuShortcut>{SHORTCUTS.copy.shortcutDisplay}</MenuShortcut>
      </MenuItem>

      {canCut && (
        <MenuItem onClick={handleCutClick}>
          <Scissors className="mr-2 h-4 w-4" />
          Cut
          <MenuShortcut>{SHORTCUTS.cut.shortcutDisplay}</MenuShortcut>
        </MenuItem>
      )}

      <MenuItem onClick={handlePasteClick} disabled={!canPaste}>
        <ClipboardPaste className="mr-2 h-4 w-4" />
        Paste
        <MenuShortcut>{SHORTCUTS.paste.shortcutDisplay}</MenuShortcut>
      </MenuItem>

      <MenuSeparator />

      {canDuplicate && (
        <MenuItem onClick={handleDuplicateClick}>
          <CopyPlus className="mr-2 h-4 w-4" />
          Duplicate
          <MenuShortcut>{SHORTCUTS.duplicate.shortcutDisplay}</MenuShortcut>
        </MenuItem>
      )}

      {canDelete && (
        <MenuItem
          onClick={handleDeleteClick}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
          <MenuShortcut>{SHORTCUTS.delete.shortcutDisplay}</MenuShortcut>
        </MenuItem>
      )}
    </>
  );
};

// Simple menu item component
interface MenuItemProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  children,
  onClick,
  disabled,
  className,
}) => {
  return (
    <div
      role="menuitem"
      data-testid="menu-item"
      onClick={disabled ? undefined : onClick}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {children}
    </div>
  );
};

// Simple separator component
const MenuSeparator: React.FC = () => {
  return <div className="-mx-1 my-1 h-px bg-muted" data-testid="menu-separator" />;
};

// Simple shortcut display component
const MenuShortcut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="ml-auto text-xs tracking-widest opacity-60" data-testid="menu-shortcut">
      {children}
    </span>
  );
};
