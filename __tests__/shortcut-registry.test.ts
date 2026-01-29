import {
  SHORTCUTS,
  toKeyboardShortcut,
  type ShortcutId,
} from '@/lib/ui-builder/shortcuts/shortcut-registry';

describe('Shortcut Registry', () => {
  describe('SHORTCUTS constant', () => {
    it('should have all required shortcuts defined', () => {
      expect(SHORTCUTS.delete).toBeDefined();
      expect(SHORTCUTS.duplicate).toBeDefined();
      expect(SHORTCUTS.copy).toBeDefined();
      expect(SHORTCUTS.cut).toBeDefined();
      expect(SHORTCUTS.paste).toBeDefined();
      expect(SHORTCUTS.undo).toBeDefined();
      expect(SHORTCUTS.redo).toBeDefined();
    });

    it('should have correct properties for delete shortcut', () => {
      expect(SHORTCUTS.delete.id).toBe('delete');
      expect(SHORTCUTS.delete.key).toBe('Backspace');
      expect(SHORTCUTS.delete.label).toBe('Delete');
      expect(SHORTCUTS.delete.shortcutDisplay).toBe('⌫');
      expect(SHORTCUTS.delete.category).toBe('edit');
    });

    it('should have correct properties for duplicate shortcut', () => {
      expect(SHORTCUTS.duplicate.id).toBe('duplicate');
      expect(SHORTCUTS.duplicate.keys.metaKey).toBe(true);
      expect(SHORTCUTS.duplicate.key).toBe('d');
      expect(SHORTCUTS.duplicate.label).toBe('Duplicate');
      expect(SHORTCUTS.duplicate.shortcutDisplay).toBe('⌘D');
      expect(SHORTCUTS.duplicate.category).toBe('edit');
    });

    it('should have correct properties for copy shortcut', () => {
      expect(SHORTCUTS.copy.id).toBe('copy');
      expect(SHORTCUTS.copy.keys.metaKey).toBe(true);
      expect(SHORTCUTS.copy.key).toBe('c');
      expect(SHORTCUTS.copy.label).toBe('Copy');
      expect(SHORTCUTS.copy.shortcutDisplay).toBe('⌘C');
      expect(SHORTCUTS.copy.category).toBe('edit');
    });

    it('should have correct properties for cut shortcut', () => {
      expect(SHORTCUTS.cut.id).toBe('cut');
      expect(SHORTCUTS.cut.keys.metaKey).toBe(true);
      expect(SHORTCUTS.cut.key).toBe('x');
      expect(SHORTCUTS.cut.label).toBe('Cut');
      expect(SHORTCUTS.cut.shortcutDisplay).toBe('⌘X');
      expect(SHORTCUTS.cut.category).toBe('edit');
    });

    it('should have correct properties for paste shortcut', () => {
      expect(SHORTCUTS.paste.id).toBe('paste');
      expect(SHORTCUTS.paste.keys.metaKey).toBe(true);
      expect(SHORTCUTS.paste.key).toBe('v');
      expect(SHORTCUTS.paste.label).toBe('Paste');
      expect(SHORTCUTS.paste.shortcutDisplay).toBe('⌘V');
      expect(SHORTCUTS.paste.category).toBe('edit');
    });

    it('should have correct properties for undo shortcut', () => {
      expect(SHORTCUTS.undo.id).toBe('undo');
      expect(SHORTCUTS.undo.keys.metaKey).toBe(true);
      expect(SHORTCUTS.undo.keys.shiftKey).toBe(false);
      expect(SHORTCUTS.undo.key).toBe('z');
      expect(SHORTCUTS.undo.label).toBe('Undo');
      expect(SHORTCUTS.undo.shortcutDisplay).toBe('⌘Z');
      expect(SHORTCUTS.undo.category).toBe('edit');
    });

    it('should have correct properties for redo shortcut', () => {
      expect(SHORTCUTS.redo.id).toBe('redo');
      expect(SHORTCUTS.redo.keys.metaKey).toBe(true);
      expect(SHORTCUTS.redo.keys.shiftKey).toBe(true);
      expect(SHORTCUTS.redo.key).toBe('z');
      expect(SHORTCUTS.redo.label).toBe('Redo');
      expect(SHORTCUTS.redo.shortcutDisplay).toBe('⌘⇧Z');
      expect(SHORTCUTS.redo.category).toBe('edit');
    });

    it('should have all shortcuts in edit category', () => {
      const shortcutIds = Object.keys(SHORTCUTS) as ShortcutId[];
      shortcutIds.forEach((id) => {
        expect(SHORTCUTS[id].category).toBe('edit');
      });
    });
  });

  describe('toKeyboardShortcut', () => {
    it('should convert shortcut to KeyCombination format for copy', () => {
      const handler = jest.fn();
      const result = toKeyboardShortcut('copy', handler);

      expect(result.keys).toEqual(SHORTCUTS.copy.keys);
      expect(result.key).toBe(SHORTCUTS.copy.key);
      expect(result.handler).toBe(handler);
    });

    it('should convert shortcut to KeyCombination format for delete', () => {
      const handler = jest.fn();
      const result = toKeyboardShortcut('delete', handler);

      expect(result.keys).toEqual(SHORTCUTS.delete.keys);
      expect(result.key).toBe(SHORTCUTS.delete.key);
      expect(result.handler).toBe(handler);
    });

    it('should convert shortcut to KeyCombination format for redo', () => {
      const handler = jest.fn();
      const result = toKeyboardShortcut('redo', handler);

      expect(result.keys).toEqual(SHORTCUTS.redo.keys);
      expect(result.key).toBe(SHORTCUTS.redo.key);
      expect(result.handler).toBe(handler);
    });

    it('should allow handler to be called', () => {
      const handler = jest.fn();
      const result = toKeyboardShortcut('copy', handler);

      const mockEvent = new KeyboardEvent('keydown', { key: 'c', metaKey: true });
      result.handler(mockEvent);

      expect(handler).toHaveBeenCalledWith(mockEvent);
    });
  });
});
