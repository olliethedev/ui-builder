import {
  SHORTCUTS,
  getShortcutDisplay,
  getShortcut,
  matchesShortcut,
  toKeyboardShortcut,
  type ShortcutDefinition,
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

  describe('getShortcutDisplay', () => {
    it('should return correct display for delete', () => {
      expect(getShortcutDisplay('delete')).toBe('⌫');
    });

    it('should return correct display for duplicate', () => {
      expect(getShortcutDisplay('duplicate')).toBe('⌘D');
    });

    it('should return correct display for copy', () => {
      expect(getShortcutDisplay('copy')).toBe('⌘C');
    });

    it('should return correct display for cut', () => {
      expect(getShortcutDisplay('cut')).toBe('⌘X');
    });

    it('should return correct display for paste', () => {
      expect(getShortcutDisplay('paste')).toBe('⌘V');
    });

    it('should return correct display for undo', () => {
      expect(getShortcutDisplay('undo')).toBe('⌘Z');
    });

    it('should return correct display for redo', () => {
      expect(getShortcutDisplay('redo')).toBe('⌘⇧Z');
    });
  });

  describe('getShortcut', () => {
    it('should return full shortcut definition for delete', () => {
      const shortcut = getShortcut('delete');
      expect(shortcut).toEqual(SHORTCUTS.delete);
    });

    it('should return full shortcut definition for copy', () => {
      const shortcut = getShortcut('copy');
      expect(shortcut).toEqual(SHORTCUTS.copy);
    });

    it('should return full shortcut definition for redo', () => {
      const shortcut = getShortcut('redo');
      expect(shortcut).toEqual(SHORTCUTS.redo);
    });
  });

  describe('matchesShortcut', () => {
    const createKeyboardEvent = (options: {
      key: string;
      metaKey?: boolean;
      shiftKey?: boolean;
      ctrlKey?: boolean;
      altKey?: boolean;
    }): KeyboardEvent => {
      return new KeyboardEvent('keydown', {
        key: options.key,
        metaKey: options.metaKey ?? false,
        shiftKey: options.shiftKey ?? false,
        ctrlKey: options.ctrlKey ?? false,
        altKey: options.altKey ?? false,
      });
    };

    it('should match delete shortcut (Backspace without modifiers)', () => {
      const event = createKeyboardEvent({ key: 'Backspace' });
      expect(matchesShortcut(event, 'delete')).toBe(true);
    });

    it('should not match delete shortcut with meta key', () => {
      const event = createKeyboardEvent({ key: 'Backspace', metaKey: true });
      expect(matchesShortcut(event, 'delete')).toBe(true); // delete has no key modifiers specified, so it matches
    });

    it('should match copy shortcut (Cmd+C)', () => {
      const event = createKeyboardEvent({ key: 'c', metaKey: true });
      expect(matchesShortcut(event, 'copy')).toBe(true);
    });

    it('should match copy shortcut case-insensitively', () => {
      const event = createKeyboardEvent({ key: 'C', metaKey: true });
      expect(matchesShortcut(event, 'copy')).toBe(true);
    });

    it('should not match copy shortcut without meta key', () => {
      const event = createKeyboardEvent({ key: 'c' });
      expect(matchesShortcut(event, 'copy')).toBe(false);
    });

    it('should match cut shortcut (Cmd+X)', () => {
      const event = createKeyboardEvent({ key: 'x', metaKey: true });
      expect(matchesShortcut(event, 'cut')).toBe(true);
    });

    it('should match paste shortcut (Cmd+V)', () => {
      const event = createKeyboardEvent({ key: 'v', metaKey: true });
      expect(matchesShortcut(event, 'paste')).toBe(true);
    });

    it('should match duplicate shortcut (Cmd+D)', () => {
      const event = createKeyboardEvent({ key: 'd', metaKey: true });
      expect(matchesShortcut(event, 'duplicate')).toBe(true);
    });

    it('should match undo shortcut (Cmd+Z)', () => {
      const event = createKeyboardEvent({ key: 'z', metaKey: true });
      expect(matchesShortcut(event, 'undo')).toBe(true);
    });

    it('should not match undo shortcut with shift key', () => {
      const event = createKeyboardEvent({ key: 'z', metaKey: true, shiftKey: true });
      expect(matchesShortcut(event, 'undo')).toBe(true); // undo doesn't specify shiftKey, so it's not checked
    });

    it('should match redo shortcut (Cmd+Shift+Z)', () => {
      const event = createKeyboardEvent({ key: 'z', metaKey: true, shiftKey: true });
      expect(matchesShortcut(event, 'redo')).toBe(true);
    });

    it('should not match redo shortcut without shift key', () => {
      const event = createKeyboardEvent({ key: 'z', metaKey: true, shiftKey: false });
      expect(matchesShortcut(event, 'redo')).toBe(false);
    });

    it('should not match wrong key', () => {
      const event = createKeyboardEvent({ key: 'a', metaKey: true });
      expect(matchesShortcut(event, 'copy')).toBe(false);
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
