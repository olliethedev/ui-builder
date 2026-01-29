/**
 * Hook for layer actions (copy, cut, paste, delete, duplicate).
 * Centralizes layer operations with validation and clipboard support.
 */

import { useCallback, useState } from 'react';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import { duplicateWithNewIdsAndName } from '@/lib/ui-builder/store/layer-utils';
import { canPasteLayer } from '@/lib/ui-builder/utils/paste-validation';
import type { ComponentLayer } from '@/components/ui/ui-builder/types';

export interface ClipboardState {
  layer: ComponentLayer | null;
  isCut: boolean;
  sourceLayerId: string | null;
}

export interface LayerActionsState {
  clipboard: ClipboardState;
  canPaste: boolean;
}

export interface LayerActionsHandlers {
  handleCopy: () => void;
  handleCut: () => void;
  handlePaste: () => void;
  handleDelete: () => void;
  handleDuplicate: () => void;
  canPerformPaste: (targetLayerId: string) => boolean;
}

export interface UseLayerActionsResult extends LayerActionsState, LayerActionsHandlers {}

/**
 * Hook that provides layer actions with clipboard support.
 * 
 * @param layerId - The ID of the layer to operate on (optional, defaults to selected layer)
 * @returns Object with clipboard state and action handlers
 */
export function useLayerActions(layerId?: string): UseLayerActionsResult {
  const [clipboard, setClipboard] = useState<ClipboardState>({
    layer: null,
    isCut: false,
    sourceLayerId: null,
  });

  // Layer store
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const removeLayer = useLayerStore((state) => state.removeLayer);
  const duplicateLayer = useLayerStore((state) => state.duplicateLayer);
  const addLayerDirect = useLayerStore((state) => state.addLayerDirect);
  const isLayerAPage = useLayerStore((state) => state.isLayerAPage);

  // Editor store
  const componentRegistry = useEditorStore((state) => state.registry);
  const allowPagesCreation = useEditorStore((state) => state.allowPagesCreation);
  const allowPagesDeletion = useEditorStore((state) => state.allowPagesDeletion);

  // Get the effective layer ID (passed in or selected)
  const effectiveLayerId = layerId ?? selectedLayerId;

  /**
   * Copy the layer to clipboard
   */
  const handleCopy = useCallback(() => {
    if (!effectiveLayerId) return;

    const layer = findLayerById(effectiveLayerId);
    if (!layer) return;

    // Deep clone the layer with new IDs prepared
    const clonedLayer = duplicateWithNewIdsAndName(layer, false);

    setClipboard({
      layer: clonedLayer,
      isCut: false,
      sourceLayerId: effectiveLayerId,
    });
  }, [effectiveLayerId, findLayerById]);

  /**
   * Cut the layer (copy to clipboard and mark for deletion)
   */
  const handleCut = useCallback(() => {
    if (!effectiveLayerId) return;

    const layer = findLayerById(effectiveLayerId);
    if (!layer) return;

    // Check if we can delete this layer (for pages, check permissions)
    const isPage = isLayerAPage(effectiveLayerId);
    if (isPage && !allowPagesDeletion) return;

    // Deep clone the layer with new IDs prepared
    const clonedLayer = duplicateWithNewIdsAndName(layer, false);

    setClipboard({
      layer: clonedLayer,
      isCut: true,
      sourceLayerId: effectiveLayerId,
    });

    // Delete the original layer
    removeLayer(effectiveLayerId);
  }, [effectiveLayerId, findLayerById, isLayerAPage, allowPagesDeletion, removeLayer]);

  /**
   * Paste the clipboard layer into the selected layer
   */
  const handlePaste = useCallback(() => {
    if (!clipboard.layer || !effectiveLayerId) return;

    // Validate paste operation
    if (!canPasteLayer(clipboard.layer, effectiveLayerId, componentRegistry, findLayerById)) {
      return;
    }

    // Create a new copy with fresh IDs
    const layerToAdd = duplicateWithNewIdsAndName(clipboard.layer, false);

    // Add the layer to the target
    addLayerDirect(layerToAdd, effectiveLayerId);

    // If this was a cut operation, clear the clipboard
    if (clipboard.isCut) {
      setClipboard({
        layer: null,
        isCut: false,
        sourceLayerId: null,
      });
    }
  }, [clipboard, effectiveLayerId, componentRegistry, findLayerById, addLayerDirect]);

  /**
   * Delete the layer
   */
  const handleDelete = useCallback(() => {
    if (!effectiveLayerId) return;

    // Check if we can delete this layer (for pages, check permissions)
    const isPage = isLayerAPage(effectiveLayerId);
    if (isPage && !allowPagesDeletion) return;

    removeLayer(effectiveLayerId);
  }, [effectiveLayerId, isLayerAPage, allowPagesDeletion, removeLayer]);

  /**
   * Duplicate the layer
   */
  const handleDuplicate = useCallback(() => {
    if (!effectiveLayerId) return;

    // Check if we can duplicate this layer (for pages, check permissions)
    const isPage = isLayerAPage(effectiveLayerId);
    if (isPage && !allowPagesCreation) return;

    duplicateLayer(effectiveLayerId);
  }, [effectiveLayerId, isLayerAPage, allowPagesCreation, duplicateLayer]);

  /**
   * Check if paste operation is valid for a target layer
   */
  const canPerformPaste = useCallback(
    (targetLayerId: string): boolean => {
      if (!clipboard.layer) return false;
      return canPasteLayer(clipboard.layer, targetLayerId, componentRegistry, findLayerById);
    },
    [clipboard.layer, componentRegistry, findLayerById]
  );

  // Compute whether paste is currently possible
  const canPaste = effectiveLayerId
    ? canPerformPaste(effectiveLayerId)
    : false;

  return {
    clipboard,
    canPaste,
    handleCopy,
    handleCut,
    handlePaste,
    handleDelete,
    handleDuplicate,
    canPerformPaste,
  };
}

/**
 * Global clipboard state for sharing across components.
 * This allows copy in one place and paste in another.
 */
let globalClipboard: ClipboardState = {
  layer: null,
  isCut: false,
  sourceLayerId: null,
};

/**
 * Get the global clipboard state
 */
export function getGlobalClipboard(): ClipboardState {
  return globalClipboard;
}

/**
 * Set the global clipboard state
 */
export function setGlobalClipboard(clipboard: ClipboardState): void {
  globalClipboard = clipboard;
}

/**
 * Hook that uses the global clipboard for cross-component copy/paste.
 * Similar to useLayerActions but uses global clipboard state.
 */
export function useGlobalLayerActions(layerId?: string): UseLayerActionsResult {
  // Force re-render when clipboard changes
  const [, setForceUpdate] = useState(0);

  // Layer store
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const removeLayer = useLayerStore((state) => state.removeLayer);
  const duplicateLayer = useLayerStore((state) => state.duplicateLayer);
  const addLayerDirect = useLayerStore((state) => state.addLayerDirect);
  const isLayerAPage = useLayerStore((state) => state.isLayerAPage);

  // Editor store
  const componentRegistry = useEditorStore((state) => state.registry);
  const allowPagesCreation = useEditorStore((state) => state.allowPagesCreation);
  const allowPagesDeletion = useEditorStore((state) => state.allowPagesDeletion);

  // Get the effective layer ID (passed in or selected)
  const effectiveLayerId = layerId ?? selectedLayerId;

  const updateClipboard = useCallback((newClipboard: ClipboardState) => {
    globalClipboard = newClipboard;
    setForceUpdate((prev) => prev + 1);
  }, []);

  const handleCopy = useCallback(() => {
    if (!effectiveLayerId) return;

    const layer = findLayerById(effectiveLayerId);
    if (!layer) return;

    const clonedLayer = duplicateWithNewIdsAndName(layer, false);

    updateClipboard({
      layer: clonedLayer,
      isCut: false,
      sourceLayerId: effectiveLayerId,
    });
  }, [effectiveLayerId, findLayerById, updateClipboard]);

  const handleCut = useCallback(() => {
    if (!effectiveLayerId) return;

    const layer = findLayerById(effectiveLayerId);
    if (!layer) return;

    const isPage = isLayerAPage(effectiveLayerId);
    if (isPage && !allowPagesDeletion) return;

    const clonedLayer = duplicateWithNewIdsAndName(layer, false);

    updateClipboard({
      layer: clonedLayer,
      isCut: true,
      sourceLayerId: effectiveLayerId,
    });

    removeLayer(effectiveLayerId);
  }, [effectiveLayerId, findLayerById, isLayerAPage, allowPagesDeletion, removeLayer, updateClipboard]);

  const handlePaste = useCallback(() => {
    if (!globalClipboard.layer || !effectiveLayerId) return;

    if (!canPasteLayer(globalClipboard.layer, effectiveLayerId, componentRegistry, findLayerById)) {
      return;
    }

    const layerToAdd = duplicateWithNewIdsAndName(globalClipboard.layer, false);
    addLayerDirect(layerToAdd, effectiveLayerId);

    if (globalClipboard.isCut) {
      updateClipboard({
        layer: null,
        isCut: false,
        sourceLayerId: null,
      });
    }
  }, [effectiveLayerId, componentRegistry, findLayerById, addLayerDirect, updateClipboard]);

  const handleDelete = useCallback(() => {
    if (!effectiveLayerId) return;

    const isPage = isLayerAPage(effectiveLayerId);
    if (isPage && !allowPagesDeletion) return;

    removeLayer(effectiveLayerId);
  }, [effectiveLayerId, isLayerAPage, allowPagesDeletion, removeLayer]);

  const handleDuplicate = useCallback(() => {
    if (!effectiveLayerId) return;

    const isPage = isLayerAPage(effectiveLayerId);
    if (isPage && !allowPagesCreation) return;

    duplicateLayer(effectiveLayerId);
  }, [effectiveLayerId, isLayerAPage, allowPagesCreation, duplicateLayer]);

  const canPerformPaste = useCallback(
    (targetLayerId: string): boolean => {
      if (!globalClipboard.layer) return false;
      return canPasteLayer(globalClipboard.layer, targetLayerId, componentRegistry, findLayerById);
    },
    [componentRegistry, findLayerById]
  );

  const canPaste = effectiveLayerId
    ? canPerformPaste(effectiveLayerId)
    : false;

  return {
    clipboard: globalClipboard,
    canPaste,
    handleCopy,
    handleCut,
    handlePaste,
    handleDelete,
    handleDuplicate,
    canPerformPaste,
  };
}
