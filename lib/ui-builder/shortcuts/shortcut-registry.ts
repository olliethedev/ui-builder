/**
 * Unified keyboard shortcut registry for the UI Builder.
 * Centralizes all shortcut definitions for consistency across menus and keyboard handlers.
 */

export interface ShortcutKeys {
  metaKey?: boolean;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}

export interface ShortcutDefinition {
  id: string;
  keys: ShortcutKeys;
  key: string;
  label: string;
  shortcutDisplay: string;
  category: 'edit' | 'navigation' | 'view';
}

/**
 * All keyboard shortcuts used in the UI Builder.
 * These definitions are used for:
 * - Registering keyboard event handlers
 * - Displaying shortcut hints in menus
 * - Consistent shortcut behavior across the application
 */
export const SHORTCUTS = {
  delete: {
    id: 'delete',
    keys: {},
    key: 'Backspace',
    label: 'Delete',
    shortcutDisplay: '⌫',
    category: 'edit',
  },
  duplicate: {
    id: 'duplicate',
    keys: { metaKey: true },
    key: 'd',
    label: 'Duplicate',
    shortcutDisplay: '⌘D',
    category: 'edit',
  },
  copy: {
    id: 'copy',
    keys: { metaKey: true },
    key: 'c',
    label: 'Copy',
    shortcutDisplay: '⌘C',
    category: 'edit',
  },
  cut: {
    id: 'cut',
    keys: { metaKey: true },
    key: 'x',
    label: 'Cut',
    shortcutDisplay: '⌘X',
    category: 'edit',
  },
  paste: {
    id: 'paste',
    keys: { metaKey: true },
    key: 'v',
    label: 'Paste',
    shortcutDisplay: '⌘V',
    category: 'edit',
  },
  undo: {
    id: 'undo',
    keys: { metaKey: true },
    key: 'z',
    label: 'Undo',
    shortcutDisplay: '⌘Z',
    category: 'edit',
  },
  redo: {
    id: 'redo',
    keys: { metaKey: true, shiftKey: true },
    key: 'z',
    label: 'Redo',
    shortcutDisplay: '⌘⇧Z',
    category: 'edit',
  },
} as const satisfies Record<string, ShortcutDefinition>;

export type ShortcutId = keyof typeof SHORTCUTS;

/**
 * Convert a shortcut definition to the format expected by useKeyboardShortcuts hook.
 */
export function toKeyboardShortcut(
  shortcutId: ShortcutId,
  handler: (event: KeyboardEvent) => void
) {
  const shortcut = SHORTCUTS[shortcutId];
  return {
    keys: shortcut.keys,
    key: shortcut.key,
    handler,
  };
}
