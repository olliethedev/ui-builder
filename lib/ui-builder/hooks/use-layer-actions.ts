/**
 * Hook for layer actions (copy, cut, paste, delete, duplicate).
 * Centralizes layer operations with validation and clipboard support.
 * Uses the editor store for global clipboard state.
 */

import { useCallback } from 'react';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import { duplicateWithNewIdsAndName } from '@/lib/ui-builder/store/layer-utils';
import { canPasteLayer } from '@/lib/ui-builder/utils/paste-validation';

/**
 * Hook that provides layer actions with clipboard support.
 * Uses the global clipboard from editor store for cross-component copy/paste.
 * 
 * @param layerId - The ID of the layer to operate on (optional, defaults to selected layer)
 * @returns Object with clipboard state and action handlers
 */
export function useGlobalLayerActions(layerId?: string) {
  // Layer store
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const removeLayer = useLayerStore((state) => state.removeLayer);
  const duplicateLayer = useLayerStore((state) => state.duplicateLayer);
  const addLayerDirect = useLayerStore((state) => state.addLayerDirect);
  const isLayerAPage = useLayerStore((state) => state.isLayerAPage);

  // Editor store - including clipboard
  const componentRegistry = useEditorStore((state) => state.registry);
  const allowPagesCreation = useEditorStore((state) => state.allowPagesCreation);
  const allowPagesDeletion = useEditorStore((state) => state.allowPagesDeletion);
  const clipboard = useEditorStore((state) => state.clipboard);
  const setClipboard = useEditorStore((state) => state.setClipboard);
  const clearClipboard = useEditorStore((state) => state.clearClipboard);

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
  }, [effectiveLayerId, findLayerById, setClipboard]);

  /**
   * Cut the layer (copy to clipboard and delete)
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
  }, [effectiveLayerId, findLayerById, isLayerAPage, allowPagesDeletion, removeLayer, setClipboard]);

  /**
   * Paste the clipboard layer into the selected layer.
   */
  const handlePaste = useCallback(() => {
    if (!effectiveLayerId) return;

    // Read current clipboard state imperatively to avoid stale closure
    const currentClipboard = useEditorStore.getState().clipboard;
    if (!currentClipboard.layer) return;

    // Validate paste operation
    if (!canPasteLayer(currentClipboard.layer, effectiveLayerId, componentRegistry, findLayerById)) {
      return;
    }

    // Create a new copy with fresh IDs
    const layerToAdd = duplicateWithNewIdsAndName(currentClipboard.layer, false);

    // Add the layer to the target
    addLayerDirect(layerToAdd, effectiveLayerId);

    // If this was a cut operation, clear the clipboard
    if (currentClipboard.isCut) {
      clearClipboard();
    }
  }, [effectiveLayerId, componentRegistry, findLayerById, addLayerDirect, clearClipboard]);

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

  // Compute permissions for layer operations
  const isPage = effectiveLayerId ? isLayerAPage(effectiveLayerId) : false;
  const canDuplicate = !isPage || allowPagesCreation;
  const canDelete = !isPage || allowPagesDeletion;
  const canCut = canDelete; // Cut is only possible if we can delete

  return {
    clipboard,
    canPaste,
    canDuplicate,
    canDelete,
    canCut,
    handleCopy,
    handleCut,
    handlePaste,
    handleDelete,
    handleDuplicate,
    canPerformPaste,
  };
}
