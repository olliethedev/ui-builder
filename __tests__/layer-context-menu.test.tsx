import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayerContextMenu } from '@/components/ui/ui-builder/internal/components/layer-context-menu';
import type { ComponentLayer } from '@/components/ui/ui-builder/types';

// Capture the keyboard shortcuts for testing
let capturedKeyboardShortcuts: Array<{ key: string; keys: string[]; handler: (e: KeyboardEvent) => void }> = [];

// Mock the editor store
const mockOpenContextMenu = jest.fn();
jest.mock('@/lib/ui-builder/store/editor-store', () => ({
  useEditorStore: jest.fn((selector) => {
    const state = {
      openContextMenu: mockOpenContextMenu,
    };
    return selector(state);
  }),
}));

// Mock the layer actions hook
jest.mock('@/lib/ui-builder/hooks/use-layer-actions', () => ({
  useGlobalLayerActions: jest.fn(),
}));

// Mock keyboard shortcuts hook - capture the shortcuts for testing
jest.mock('@/hooks/use-keyboard-shortcuts', () => ({
  useKeyboardShortcuts: jest.fn((shortcuts) => {
    capturedKeyboardShortcuts = shortcuts;
  }),
}));

import { useGlobalLayerActions } from '@/lib/ui-builder/hooks/use-layer-actions';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

const mockUseGlobalLayerActions = useGlobalLayerActions as jest.MockedFunction<typeof useGlobalLayerActions>;
const mockUseKeyboardShortcuts = useKeyboardShortcuts as jest.MockedFunction<typeof useKeyboardShortcuts>;

describe('LayerContextMenu', () => {
  const mockLayer: ComponentLayer = {
    id: 'layer-1',
    type: 'div',
    name: 'Test Layer',
    props: {},
    children: [],
  };

  const mockHandleCopy = jest.fn();
  const mockHandleCut = jest.fn();
  const mockHandlePaste = jest.fn();
  const mockHandleDelete = jest.fn();
  const mockHandleDuplicate = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    capturedKeyboardShortcuts = [];

    // Setup layer actions mock
    mockUseGlobalLayerActions.mockReturnValue({
      clipboard: { layer: null, isCut: false, sourceLayerId: null },
      canPaste: false,
      canDuplicate: true,
      canDelete: true,
      canCut: true,
      handleCopy: mockHandleCopy,
      handleCut: mockHandleCut,
      handlePaste: mockHandlePaste,
      handleDelete: mockHandleDelete,
      handleDuplicate: mockHandleDuplicate,
    });
  });

  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div data-testid="child-content">Child Content</div>
        </LayerContextMenu>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('should apply className to child element', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
          className="custom-class"
        >
          <div data-testid="child-content" className="existing-class">Child</div>
        </LayerContextMenu>
      );

      const child = screen.getByTestId('child-content');
      expect(child).toHaveClass('existing-class');
      expect(child).toHaveClass('custom-class');
    });

    it('should apply style to child element', () => {
      const customStyle = { backgroundColor: 'red' };

      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
          style={customStyle}
        >
          <div data-testid="child-content">Child</div>
        </LayerContextMenu>
      );

      expect(screen.getByTestId('child-content')).toHaveStyle(customStyle);
    });

    it('should wrap non-element children in span', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          Text content
        </LayerContextMenu>
      );

      expect(screen.getByText('Text content').tagName).toBe('SPAN');
    });
  });

  describe('Context menu event handling', () => {
    it('should call openContextMenu with mouse position on right-click', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div data-testid="child-content">Child</div>
        </LayerContextMenu>
      );

      const child = screen.getByTestId('child-content');
      fireEvent.contextMenu(child, { clientX: 100, clientY: 200 });

      expect(mockOpenContextMenu).toHaveBeenCalledWith(100, 200, 'layer-1');
    });

    it('should select layer on right-click when not selected', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={false}
          onSelect={mockOnSelect}
        >
          <div data-testid="child-content">Child</div>
        </LayerContextMenu>
      );

      const child = screen.getByTestId('child-content');
      fireEvent.contextMenu(child, { clientX: 100, clientY: 200 });

      expect(mockOnSelect).toHaveBeenCalledWith('layer-1');
    });

    it('should not select layer on right-click when already selected', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div data-testid="child-content">Child</div>
        </LayerContextMenu>
      );

      const child = screen.getByTestId('child-content');
      fireEvent.contextMenu(child, { clientX: 100, clientY: 200 });

      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should prevent default and stop propagation on right-click', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div data-testid="child-content">Child</div>
        </LayerContextMenu>
      );

      const child = screen.getByTestId('child-content');
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 200,
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

      child.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('Keyboard shortcuts', () => {
    it('should register keyboard shortcuts when selected', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      expect(mockUseKeyboardShortcuts).toHaveBeenCalled();
      expect(capturedKeyboardShortcuts.length).toBeGreaterThan(0);
    });

    it('should not register keyboard shortcuts when not selected', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={false}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      expect(mockUseKeyboardShortcuts).toHaveBeenCalled();
      expect(capturedKeyboardShortcuts.length).toBe(0);
    });

    it('should use layer actions hook with correct layer ID', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      expect(mockUseGlobalLayerActions).toHaveBeenCalledWith('layer-1');
    });

    it('should call handleCopy when copy shortcut handler is invoked', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      const copyShortcut = capturedKeyboardShortcuts.find(s => s.key === 'c');
      expect(copyShortcut).toBeDefined();

      const mockEvent = { preventDefault: jest.fn() } as unknown as KeyboardEvent;
      copyShortcut!.handler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockHandleCopy).toHaveBeenCalled();
    });

    it('should call handleCut when cut shortcut handler is invoked', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      const cutShortcut = capturedKeyboardShortcuts.find(s => s.key === 'x');
      expect(cutShortcut).toBeDefined();

      const mockEvent = { preventDefault: jest.fn() } as unknown as KeyboardEvent;
      cutShortcut!.handler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockHandleCut).toHaveBeenCalled();
    });

    it('should not call handlePaste when canPaste is false', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      const pasteShortcut = capturedKeyboardShortcuts.find(s => s.key === 'v');
      expect(pasteShortcut).toBeDefined();

      const mockEvent = { preventDefault: jest.fn() } as unknown as KeyboardEvent;
      pasteShortcut!.handler(mockEvent);

      expect(mockHandlePaste).not.toHaveBeenCalled();
    });

    it('should call handlePaste when canPaste is true', () => {
      mockUseGlobalLayerActions.mockReturnValue({
        clipboard: { layer: mockLayer, isCut: false, sourceLayerId: 'layer-1' },
        canPaste: true,
        canDuplicate: true,
        canDelete: true,
        canCut: true,
        handleCopy: mockHandleCopy,
        handleCut: mockHandleCut,
        handlePaste: mockHandlePaste,
        handleDelete: mockHandleDelete,
        handleDuplicate: mockHandleDuplicate,
      });

      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      const pasteShortcut = capturedKeyboardShortcuts.find(s => s.key === 'v');
      expect(pasteShortcut).toBeDefined();

      const mockEvent = { preventDefault: jest.fn() } as unknown as KeyboardEvent;
      pasteShortcut!.handler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockHandlePaste).toHaveBeenCalled();
    });

    it('should call handleDuplicate when duplicate shortcut handler is invoked', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      const duplicateShortcut = capturedKeyboardShortcuts.find(s => s.key === 'd');
      expect(duplicateShortcut).toBeDefined();

      const mockEvent = { preventDefault: jest.fn() } as unknown as KeyboardEvent;
      duplicateShortcut!.handler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockHandleDuplicate).toHaveBeenCalled();
    });

    it('should call handleDelete when delete shortcut handler is invoked', () => {
      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      const deleteShortcut = capturedKeyboardShortcuts.find(s => s.key === 'Backspace');
      expect(deleteShortcut).toBeDefined();

      const mockEvent = { preventDefault: jest.fn() } as unknown as KeyboardEvent;
      deleteShortcut!.handler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockHandleDelete).toHaveBeenCalled();
    });

    it('should not call handlers when input is focused', () => {
      // Create a mock input element
      const inputElement = document.createElement('input');
      document.body.appendChild(inputElement);
      inputElement.focus();

      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      const copyShortcut = capturedKeyboardShortcuts.find(s => s.key === 'c');
      const mockEvent = { preventDefault: jest.fn() } as unknown as KeyboardEvent;
      copyShortcut!.handler(mockEvent);

      expect(mockHandleCopy).not.toHaveBeenCalled();

      document.body.removeChild(inputElement);
    });

    it('should not call handlers when textarea is focused', () => {
      const textareaElement = document.createElement('textarea');
      document.body.appendChild(textareaElement);
      textareaElement.focus();

      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      const cutShortcut = capturedKeyboardShortcuts.find(s => s.key === 'x');
      const mockEvent = { preventDefault: jest.fn() } as unknown as KeyboardEvent;
      cutShortcut!.handler(mockEvent);

      expect(mockHandleCut).not.toHaveBeenCalled();

      document.body.removeChild(textareaElement);
    });

    it('should not call handlers when contenteditable is focused', () => {
      const editableDiv = document.createElement('div');
      editableDiv.setAttribute('contenteditable', 'true');
      // jsdom doesn't implement isContentEditable, so we need to mock it
      Object.defineProperty(editableDiv, 'isContentEditable', { value: true, configurable: true });
      document.body.appendChild(editableDiv);
      editableDiv.focus();

      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      const duplicateShortcut = capturedKeyboardShortcuts.find(s => s.key === 'd');
      const mockEvent = { preventDefault: jest.fn() } as unknown as KeyboardEvent;
      duplicateShortcut!.handler(mockEvent);

      expect(mockHandleDuplicate).not.toHaveBeenCalled();

      document.body.removeChild(editableDiv);
    });

    it('should not call handlers when short-form contenteditable is focused', () => {
      // Test the short-form syntax: <div contenteditable> (empty string attribute)
      // This is valid HTML and should also be detected as editable
      const editableDiv = document.createElement('div');
      editableDiv.setAttribute('contenteditable', ''); // Empty string, like <div contenteditable>
      // jsdom doesn't implement isContentEditable, so we need to mock it
      // In real browsers, short-form contenteditable="" returns isContentEditable: true
      Object.defineProperty(editableDiv, 'isContentEditable', { value: true, configurable: true });
      document.body.appendChild(editableDiv);
      editableDiv.focus();

      render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div>Child</div>
        </LayerContextMenu>
      );

      // Test delete shortcut specifically since Backspace in contenteditable would be problematic
      const deleteShortcut = capturedKeyboardShortcuts.find(s => s.key === 'Backspace');
      const mockEvent = { preventDefault: jest.fn() } as unknown as KeyboardEvent;
      deleteShortcut!.handler(mockEvent);

      expect(mockHandleDelete).not.toHaveBeenCalled();

      document.body.removeChild(editableDiv);
    });
  });

  describe('Layer ID handling', () => {
    it('should handle different layer IDs', () => {
      const { rerender } = render(
        <LayerContextMenu
          layerId="layer-1"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div data-testid="child-content">Child</div>
        </LayerContextMenu>
      );

      const child = screen.getByTestId('child-content');
      fireEvent.contextMenu(child, { clientX: 100, clientY: 200 });

      expect(mockOpenContextMenu).toHaveBeenCalledWith(100, 200, 'layer-1');

      mockOpenContextMenu.mockClear();

      rerender(
        <LayerContextMenu
          layerId="layer-2"
          isSelected={true}
          onSelect={mockOnSelect}
        >
          <div data-testid="child-content">Child</div>
        </LayerContextMenu>
      );

      fireEvent.contextMenu(child, { clientX: 150, clientY: 250 });

      expect(mockOpenContextMenu).toHaveBeenCalledWith(150, 250, 'layer-2');
    });
  });
});
