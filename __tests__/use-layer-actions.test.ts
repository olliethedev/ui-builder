import { renderHook, act } from '@testing-library/react';
import {
  useLayerActions,
  useGlobalLayerActions,
  getGlobalClipboard,
  setGlobalClipboard,
} from '@/lib/ui-builder/hooks/use-layer-actions';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { useEditorStore } from '@/lib/ui-builder/store/editor-store';
import type { ComponentLayer, ComponentRegistry } from '@/components/ui/ui-builder/types';
import { z } from 'zod';

// Mock the stores
jest.mock('@/lib/ui-builder/store/layer-store');
jest.mock('@/lib/ui-builder/store/editor-store');

// Mock paste validation
jest.mock('@/lib/ui-builder/utils/paste-validation', () => ({
  canPasteLayer: jest.fn(),
}));

import { canPasteLayer } from '@/lib/ui-builder/utils/paste-validation';

const mockCanPasteLayer = canPasteLayer as jest.MockedFunction<typeof canPasteLayer>;

describe('useLayerActions', () => {
  const mockLayer: ComponentLayer = {
    id: 'layer-1',
    type: 'div',
    name: 'Test Layer',
    props: { className: 'test-class' },
    children: [],
  };

  const mockChildLayer: ComponentLayer = {
    id: 'child-1',
    type: 'Button',
    name: 'Child Button',
    props: {},
    children: [],
  };

  const mockLayerWithChildren: ComponentLayer = {
    ...mockLayer,
    children: [mockChildLayer],
  };

  const mockRegistry: ComponentRegistry = {
    div: {
      schema: z.object({
        className: z.string().optional(),
        children: z.array(z.any()).optional(),
      }),
      from: '@/components/div',
      component: () => null,
    },
    Button: {
      schema: z.object({
        label: z.string().optional(),
      }),
      from: '@/components/ui/button',
      component: () => null,
    },
  };

  const mockFindLayerById = jest.fn();
  const mockRemoveLayer = jest.fn();
  const mockDuplicateLayer = jest.fn();
  const mockAddLayerDirect = jest.fn();
  const mockIsLayerAPage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset global clipboard
    setGlobalClipboard({
      layer: null,
      isCut: false,
      sourceLayerId: null,
    });

    // Setup layer store mock
    (useLayerStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        selectedLayerId: 'layer-1',
        findLayerById: mockFindLayerById,
        removeLayer: mockRemoveLayer,
        duplicateLayer: mockDuplicateLayer,
        addLayerDirect: mockAddLayerDirect,
        isLayerAPage: mockIsLayerAPage,
      };
      return selector(state);
    });

    // Setup editor store mock
    (useEditorStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        registry: mockRegistry,
        allowPagesCreation: true,
        allowPagesDeletion: true,
      };
      return selector(state);
    });

    mockFindLayerById.mockReturnValue(mockLayer);
    mockIsLayerAPage.mockReturnValue(false);
    mockCanPasteLayer.mockReturnValue(true);
  });

  describe('useLayerActions hook', () => {
    it('should initialize with empty clipboard', () => {
      const { result } = renderHook(() => useLayerActions('layer-1'));

      expect(result.current.clipboard.layer).toBeNull();
      expect(result.current.clipboard.isCut).toBe(false);
      expect(result.current.clipboard.sourceLayerId).toBeNull();
    });

    it('should copy layer to clipboard', () => {
      const { result } = renderHook(() => useLayerActions('layer-1'));

      act(() => {
        result.current.handleCopy();
      });

      expect(result.current.clipboard.layer).not.toBeNull();
      expect(result.current.clipboard.layer?.type).toBe('div');
      expect(result.current.clipboard.isCut).toBe(false);
      expect(result.current.clipboard.sourceLayerId).toBe('layer-1');
    });

    it('should not copy if no layer ID is provided and no layer is selected', () => {
      (useLayerStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          selectedLayerId: null,
          findLayerById: mockFindLayerById,
          removeLayer: mockRemoveLayer,
          duplicateLayer: mockDuplicateLayer,
          addLayerDirect: mockAddLayerDirect,
          isLayerAPage: mockIsLayerAPage,
        };
        return selector(state);
      });

      const { result } = renderHook(() => useLayerActions());

      act(() => {
        result.current.handleCopy();
      });

      expect(result.current.clipboard.layer).toBeNull();
    });

    it('should not copy if layer is not found', () => {
      mockFindLayerById.mockReturnValue(undefined);

      const { result } = renderHook(() => useLayerActions('non-existent'));

      act(() => {
        result.current.handleCopy();
      });

      expect(result.current.clipboard.layer).toBeNull();
    });

    it('should cut layer (copy and delete)', () => {
      const { result } = renderHook(() => useLayerActions('layer-1'));

      act(() => {
        result.current.handleCut();
      });

      expect(result.current.clipboard.layer).not.toBeNull();
      expect(result.current.clipboard.isCut).toBe(true);
      expect(mockRemoveLayer).toHaveBeenCalledWith('layer-1');
    });

    it('should not cut if layer is a page and page deletion is not allowed', () => {
      mockIsLayerAPage.mockReturnValue(true);
      (useEditorStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          registry: mockRegistry,
          allowPagesCreation: true,
          allowPagesDeletion: false,
        };
        return selector(state);
      });

      const { result } = renderHook(() => useLayerActions('layer-1'));

      act(() => {
        result.current.handleCut();
      });

      expect(result.current.clipboard.layer).toBeNull();
      expect(mockRemoveLayer).not.toHaveBeenCalled();
    });

    it('should paste layer into target', () => {
      const { result } = renderHook(() => useLayerActions('layer-1'));

      // First copy
      act(() => {
        result.current.handleCopy();
      });

      // Then paste
      act(() => {
        result.current.handlePaste();
      });

      expect(mockAddLayerDirect).toHaveBeenCalled();
    });

    it('should not paste if clipboard is empty', () => {
      const { result } = renderHook(() => useLayerActions('layer-1'));

      act(() => {
        result.current.handlePaste();
      });

      expect(mockAddLayerDirect).not.toHaveBeenCalled();
    });

    it('should not paste if validation fails', () => {
      mockCanPasteLayer.mockReturnValue(false);

      const { result } = renderHook(() => useLayerActions('layer-1'));

      // First copy
      act(() => {
        result.current.handleCopy();
      });

      // Then try to paste
      act(() => {
        result.current.handlePaste();
      });

      expect(mockAddLayerDirect).not.toHaveBeenCalled();
    });

    it('should clear clipboard after paste if it was a cut operation', () => {
      const { result } = renderHook(() => useLayerActions('layer-1'));

      // Cut
      act(() => {
        result.current.handleCut();
      });

      expect(result.current.clipboard.isCut).toBe(true);

      // Paste
      act(() => {
        result.current.handlePaste();
      });

      expect(result.current.clipboard.layer).toBeNull();
    });

    it('should not clear clipboard after paste if it was a copy operation', () => {
      const { result } = renderHook(() => useLayerActions('layer-1'));

      // Copy
      act(() => {
        result.current.handleCopy();
      });

      // Paste
      act(() => {
        result.current.handlePaste();
      });

      expect(result.current.clipboard.layer).not.toBeNull();
    });

    it('should delete layer', () => {
      const { result } = renderHook(() => useLayerActions('layer-1'));

      act(() => {
        result.current.handleDelete();
      });

      expect(mockRemoveLayer).toHaveBeenCalledWith('layer-1');
    });

    it('should not delete if layer is a page and page deletion is not allowed', () => {
      mockIsLayerAPage.mockReturnValue(true);
      (useEditorStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          registry: mockRegistry,
          allowPagesCreation: true,
          allowPagesDeletion: false,
        };
        return selector(state);
      });

      const { result } = renderHook(() => useLayerActions('layer-1'));

      act(() => {
        result.current.handleDelete();
      });

      expect(mockRemoveLayer).not.toHaveBeenCalled();
    });

    it('should duplicate layer', () => {
      const { result } = renderHook(() => useLayerActions('layer-1'));

      act(() => {
        result.current.handleDuplicate();
      });

      expect(mockDuplicateLayer).toHaveBeenCalledWith('layer-1');
    });

    it('should not duplicate if layer is a page and page creation is not allowed', () => {
      mockIsLayerAPage.mockReturnValue(true);
      (useEditorStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          registry: mockRegistry,
          allowPagesCreation: false,
          allowPagesDeletion: true,
        };
        return selector(state);
      });

      const { result } = renderHook(() => useLayerActions('layer-1'));

      act(() => {
        result.current.handleDuplicate();
      });

      expect(mockDuplicateLayer).not.toHaveBeenCalled();
    });

    it('should return canPaste as false when clipboard is empty', () => {
      const { result } = renderHook(() => useLayerActions('layer-1'));

      expect(result.current.canPaste).toBe(false);
    });

    it('should return canPaste as true when clipboard has content and validation passes', () => {
      const { result } = renderHook(() => useLayerActions('layer-1'));

      act(() => {
        result.current.handleCopy();
      });

      expect(result.current.canPaste).toBe(true);
    });

    it('should canPerformPaste check validation for a given target', () => {
      const { result } = renderHook(() => useLayerActions('layer-1'));

      act(() => {
        result.current.handleCopy();
      });

      const canPaste = result.current.canPerformPaste('target-layer');

      expect(mockCanPasteLayer).toHaveBeenCalled();
    });
  });

  describe('useGlobalLayerActions hook', () => {
    it('should use global clipboard state', () => {
      setGlobalClipboard({
        layer: mockLayer,
        isCut: false,
        sourceLayerId: 'layer-1',
      });

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      expect(result.current.clipboard.layer).toEqual(mockLayer);
    });

    it('should update global clipboard on copy', () => {
      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handleCopy();
      });

      const globalClipboard = getGlobalClipboard();
      expect(globalClipboard.layer).not.toBeNull();
      expect(globalClipboard.sourceLayerId).toBe('layer-1');
    });

    it('should update global clipboard on cut', () => {
      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handleCut();
      });

      const globalClipboard = getGlobalClipboard();
      expect(globalClipboard.isCut).toBe(true);
      expect(mockRemoveLayer).toHaveBeenCalledWith('layer-1');
    });

    it('should paste from global clipboard', () => {
      setGlobalClipboard({
        layer: mockLayer,
        isCut: false,
        sourceLayerId: 'layer-1',
      });

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handlePaste();
      });

      expect(mockAddLayerDirect).toHaveBeenCalled();
    });

    it('should clear global clipboard after cut-paste', () => {
      setGlobalClipboard({
        layer: mockLayer,
        isCut: true,
        sourceLayerId: 'layer-1',
      });

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handlePaste();
      });

      const globalClipboard = getGlobalClipboard();
      expect(globalClipboard.layer).toBeNull();
    });
  });

  describe('Global clipboard functions', () => {
    it('should get global clipboard', () => {
      const clipboard = getGlobalClipboard();
      expect(clipboard).toBeDefined();
    });

    it('should set global clipboard', () => {
      const newClipboard = {
        layer: mockLayer,
        isCut: true,
        sourceLayerId: 'test-id',
      };

      setGlobalClipboard(newClipboard);

      const clipboard = getGlobalClipboard();
      expect(clipboard).toEqual(newClipboard);
    });
  });
});
