import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { LayerContextMenu } from '@/components/ui/ui-builder/internal/components/layer-context-menu';
import type { ComponentLayer, ComponentRegistry } from '@/components/ui/ui-builder/types';
import { z } from 'zod';

// Capture the keyboard shortcuts for testing
let capturedKeyboardShortcuts: any[] = [];
let capturedOnOpenChange: ((open: boolean) => void) | null = null;

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

// Mock context menu components - capture onOpenChange for testing
jest.mock('@/components/ui/context-menu', () => ({
  ContextMenu: ({ children, onOpenChange }: any) => {
    capturedOnOpenChange = onOpenChange;
    return <div data-testid="context-menu" data-on-open-change={!!onOpenChange}>
      {children}
    </div>;
  },
  ContextMenuTrigger: ({ children, className, style }: any) => (
    <div data-testid="context-menu-trigger" className={className} style={style}>
      {children}
    </div>
  ),
  ContextMenuContent: ({ children, className }: any) => (
    <div data-testid="context-menu-content" className={className}>
      {children}
    </div>
  ),
}));

// Mock LayerMenuItems
jest.mock('@/components/ui/ui-builder/internal/components/layer-menu-items', () => ({
  LayerMenuItems: ({ layerId }: any) => (
    <div data-testid="layer-menu-items" data-layer-id={layerId}>
      Menu Items
    </div>
  ),
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
    capturedOnOpenChange = null;

    // Setup layer actions mock
    mockUseGlobalLayerActions.mockReturnValue({
      clipboard: { layer: null, isCut: false, sourceLayerId: null },
      canPaste: false,
      handleCopy: mockHandleCopy,
      handleCut: mockHandleCut,
      handlePaste: mockHandlePaste,
      handleDelete: mockHandleDelete,
      handleDuplicate: mockHandleDuplicate,
      canPerformPaste: jest.fn().mockReturnValue(false),
    });
  });

  it('should render children inside context menu trigger', () => {
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

  it('should render context menu structure', () => {
    render(
      <LayerContextMenu
        layerId="layer-1"
        isSelected={true}
        onSelect={mockOnSelect}
      >
        <div>Child</div>
      </LayerContextMenu>
    );

    expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    expect(screen.getByTestId('context-menu-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('context-menu-content')).toBeInTheDocument();
  });

  it('should render LayerMenuItems with correct layer ID', () => {
    render(
      <LayerContextMenu
        layerId="layer-1"
        isSelected={true}
        onSelect={mockOnSelect}
      >
        <div>Child</div>
      </LayerContextMenu>
    );

    const menuItems = screen.getByTestId('layer-menu-items');
    expect(menuItems).toHaveAttribute('data-layer-id', 'layer-1');
  });

  it('should apply className to trigger', () => {
    render(
      <LayerContextMenu
        layerId="layer-1"
        isSelected={true}
        onSelect={mockOnSelect}
        className="custom-class"
      >
        <div>Child</div>
      </LayerContextMenu>
    );

    expect(screen.getByTestId('context-menu-trigger')).toHaveClass('custom-class');
  });

  it('should apply style to trigger', () => {
    const customStyle = { backgroundColor: 'red' };

    render(
      <LayerContextMenu
        layerId="layer-1"
        isSelected={true}
        onSelect={mockOnSelect}
        style={customStyle}
      >
        <div>Child</div>
      </LayerContextMenu>
    );

    expect(screen.getByTestId('context-menu-trigger')).toHaveStyle(customStyle);
  });

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

  it('should select layer when context menu opens and layer is not selected', () => {
    render(
      <LayerContextMenu
        layerId="layer-1"
        isSelected={false}
        onSelect={mockOnSelect}
      >
        <div>Child</div>
      </LayerContextMenu>
    );

    expect(capturedOnOpenChange).toBeDefined();
    
    act(() => {
      capturedOnOpenChange!(true);
    });

    expect(mockOnSelect).toHaveBeenCalledWith('layer-1');
  });

  it('should not select layer when context menu opens and layer is already selected', () => {
    render(
      <LayerContextMenu
        layerId="layer-1"
        isSelected={true}
        onSelect={mockOnSelect}
      >
        <div>Child</div>
      </LayerContextMenu>
    );

    act(() => {
      capturedOnOpenChange!(true);
    });

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should not select layer when context menu closes', () => {
    render(
      <LayerContextMenu
        layerId="layer-1"
        isSelected={false}
        onSelect={mockOnSelect}
      >
        <div>Child</div>
      </LayerContextMenu>
    );

    act(() => {
      capturedOnOpenChange!(false);
    });

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  describe('Keyboard shortcut handlers', () => {
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
      copyShortcut.handler(mockEvent);

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
      cutShortcut.handler(mockEvent);

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
      pasteShortcut.handler(mockEvent);

      expect(mockHandlePaste).not.toHaveBeenCalled();
    });

    it('should call handlePaste when canPaste is true', () => {
      mockUseGlobalLayerActions.mockReturnValue({
        clipboard: { layer: mockLayer, isCut: false, sourceLayerId: 'layer-1' },
        canPaste: true,
        handleCopy: mockHandleCopy,
        handleCut: mockHandleCut,
        handlePaste: mockHandlePaste,
        handleDelete: mockHandleDelete,
        handleDuplicate: mockHandleDuplicate,
        canPerformPaste: jest.fn().mockReturnValue(true),
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
      pasteShortcut.handler(mockEvent);

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
      duplicateShortcut.handler(mockEvent);

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
      deleteShortcut.handler(mockEvent);

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
      copyShortcut.handler(mockEvent);

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
      cutShortcut.handler(mockEvent);

      expect(mockHandleCut).not.toHaveBeenCalled();

      document.body.removeChild(textareaElement);
    });

    it('should not call handlers when contenteditable is focused', () => {
      const editableDiv = document.createElement('div');
      editableDiv.setAttribute('contenteditable', 'true');
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
      duplicateShortcut.handler(mockEvent);

      expect(mockHandleDuplicate).not.toHaveBeenCalled();

      document.body.removeChild(editableDiv);
    });
  });

  it('should render context menu content with correct class', () => {
    render(
      <LayerContextMenu
        layerId="layer-1"
        isSelected={true}
        onSelect={mockOnSelect}
      >
        <div>Child</div>
      </LayerContextMenu>
    );

    expect(screen.getByTestId('context-menu-content')).toHaveClass('w-56');
  });

  it('should render with different layer IDs', () => {
    const { rerender } = render(
      <LayerContextMenu
        layerId="layer-1"
        isSelected={true}
        onSelect={mockOnSelect}
      >
        <div>Child</div>
      </LayerContextMenu>
    );

    let menuItems = screen.getByTestId('layer-menu-items');
    expect(menuItems).toHaveAttribute('data-layer-id', 'layer-1');

    rerender(
      <LayerContextMenu
        layerId="layer-2"
        isSelected={true}
        onSelect={mockOnSelect}
      >
        <div>Child</div>
      </LayerContextMenu>
    );

    menuItems = screen.getByTestId('layer-menu-items');
    expect(menuItems).toHaveAttribute('data-layer-id', 'layer-2');
  });
});
