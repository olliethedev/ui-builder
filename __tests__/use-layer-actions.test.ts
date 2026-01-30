import { renderHook, act } from '@testing-library/react';
import {
  useGlobalLayerActions,
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

describe('useGlobalLayerActions', () => {
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
  const mockSetClipboard = jest.fn();
  const mockClearClipboard = jest.fn();

  let mockClipboard = {
    layer: null as ComponentLayer | null,
    isCut: false,
    sourceLayerId: null as string | null,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock clipboard
    mockClipboard = {
      layer: null,
      isCut: false,
      sourceLayerId: null,
    };

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

    // Setup editor store mock with clipboard
    // Use a getter function to always read the current mockClipboard value
    const getEditorState = () => ({
      registry: mockRegistry,
      allowPagesCreation: true,
      allowPagesDeletion: true,
      clipboard: mockClipboard,
      setClipboard: mockSetClipboard,
      clearClipboard: mockClearClipboard,
    });
    
    const mockUseEditorStore = useEditorStore as unknown as jest.Mock & { getState: typeof getEditorState };
    mockUseEditorStore.mockImplementation((selector) => {
      return selector(getEditorState());
    });
    
    // Add getState for imperative access in handlePaste
    mockUseEditorStore.getState = getEditorState;

    mockFindLayerById.mockReturnValue(mockLayer);
    mockIsLayerAPage.mockReturnValue(false);
    mockCanPasteLayer.mockReturnValue(true);
  });

  describe('clipboard initialization', () => {
    it('should initialize with empty clipboard from editor store', () => {
      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      expect(result.current.clipboard.layer).toBeNull();
      expect(result.current.clipboard.isCut).toBe(false);
      expect(result.current.clipboard.sourceLayerId).toBeNull();
    });

    it('should use clipboard from editor store when it has content', () => {
      mockClipboard = {
        layer: mockLayer,
        isCut: false,
        sourceLayerId: 'layer-1',
      };

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      expect(result.current.clipboard.layer).toEqual(mockLayer);
      expect(result.current.clipboard.sourceLayerId).toBe('layer-1');
    });
  });

  describe('copy operations', () => {
    it('should copy layer to clipboard via editor store', () => {
      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handleCopy();
      });

      expect(mockSetClipboard).toHaveBeenCalledWith(
        expect.objectContaining({
          isCut: false,
          sourceLayerId: 'layer-1',
        })
      );
      // Layer should be cloned with new ID
      expect(mockSetClipboard).toHaveBeenCalledWith(
        expect.objectContaining({
          layer: expect.objectContaining({ type: 'div' }),
        })
      );
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

      const { result } = renderHook(() => useGlobalLayerActions());

      act(() => {
        result.current.handleCopy();
      });

      expect(mockSetClipboard).not.toHaveBeenCalled();
    });

    it('should not copy if layer is not found', () => {
      mockFindLayerById.mockReturnValue(undefined);

      const { result } = renderHook(() => useGlobalLayerActions('non-existent'));

      act(() => {
        result.current.handleCopy();
      });

      expect(mockSetClipboard).not.toHaveBeenCalled();
    });
  });

  describe('cut operations', () => {
    it('should cut layer (copy and delete)', () => {
      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handleCut();
      });

      expect(mockSetClipboard).toHaveBeenCalledWith(
        expect.objectContaining({
          isCut: true,
          sourceLayerId: 'layer-1',
        })
      );
      expect(mockRemoveLayer).toHaveBeenCalledWith('layer-1');
    });

    it('should not cut if layer is a page and page deletion is not allowed', () => {
      mockIsLayerAPage.mockReturnValue(true);
      (useEditorStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          registry: mockRegistry,
          allowPagesCreation: true,
          allowPagesDeletion: false,
          clipboard: mockClipboard,
          setClipboard: mockSetClipboard,
          clearClipboard: mockClearClipboard,
        };
        return selector(state);
      });

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handleCut();
      });

      expect(mockSetClipboard).not.toHaveBeenCalled();
      expect(mockRemoveLayer).not.toHaveBeenCalled();
    });

    it('should not cut if layer is not found', () => {
      mockFindLayerById.mockReturnValue(undefined);

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handleCut();
      });

      expect(mockSetClipboard).not.toHaveBeenCalled();
      expect(mockRemoveLayer).not.toHaveBeenCalled();
    });
  });

  describe('paste operations', () => {
    beforeEach(() => {
      // Set up clipboard with content
      mockClipboard = {
        layer: mockLayer,
        isCut: false,
        sourceLayerId: 'layer-1',
      };
    });

    it('should paste layer into target', () => {
      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handlePaste();
      });

      expect(mockAddLayerDirect).toHaveBeenCalled();
    });

    it('should not paste if clipboard is empty', () => {
      mockClipboard = { layer: null, isCut: false, sourceLayerId: null };

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handlePaste();
      });

      expect(mockAddLayerDirect).not.toHaveBeenCalled();
    });

    it('should not paste if no target layer ID', () => {
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

      const { result } = renderHook(() => useGlobalLayerActions());

      act(() => {
        result.current.handlePaste();
      });

      expect(mockAddLayerDirect).not.toHaveBeenCalled();
    });

    it('should not paste if validation fails', () => {
      mockCanPasteLayer.mockReturnValue(false);

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handlePaste();
      });

      expect(mockAddLayerDirect).not.toHaveBeenCalled();
    });

    it('should clear clipboard after paste if it was a cut operation', () => {
      mockClipboard = {
        layer: mockLayer,
        isCut: true,
        sourceLayerId: 'layer-1',
      };

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handlePaste();
      });

      expect(mockClearClipboard).toHaveBeenCalled();
    });

    it('should not clear clipboard after paste if it was a copy operation', () => {
      mockClipboard = {
        layer: mockLayer,
        isCut: false,
        sourceLayerId: 'layer-1',
      };

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handlePaste();
      });

      expect(mockClearClipboard).not.toHaveBeenCalled();
    });

    it('should not paste twice on rapid paste after cut (stale closure fix)', () => {
      // This test verifies the fix for the stale closure issue where rapid
      // paste after cut could paste the layer twice before the callback refreshed.
      mockClipboard = {
        layer: mockLayer,
        isCut: true,
        sourceLayerId: 'layer-1',
      };

      // Simulate clearClipboard actually clearing the clipboard
      mockClearClipboard.mockImplementation(() => {
        mockClipboard = { layer: null, isCut: false, sourceLayerId: null };
      });

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      // First paste - should succeed and clear clipboard
      act(() => {
        result.current.handlePaste();
      });

      expect(mockAddLayerDirect).toHaveBeenCalledTimes(1);
      expect(mockClearClipboard).toHaveBeenCalledTimes(1);

      // Second paste - clipboard is now empty, should NOT paste
      // This verifies handlePaste reads current state, not stale closure
      act(() => {
        result.current.handlePaste();
      });

      // Should still be 1 call, not 2
      expect(mockAddLayerDirect).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete operations', () => {
    it('should delete layer', () => {
      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handleDelete();
      });

      expect(mockRemoveLayer).toHaveBeenCalledWith('layer-1');
    });

    it('should not delete if no layer ID', () => {
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

      const { result } = renderHook(() => useGlobalLayerActions());

      act(() => {
        result.current.handleDelete();
      });

      expect(mockRemoveLayer).not.toHaveBeenCalled();
    });

    it('should not delete if layer is a page and page deletion is not allowed', () => {
      mockIsLayerAPage.mockReturnValue(true);
      (useEditorStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          registry: mockRegistry,
          allowPagesCreation: true,
          allowPagesDeletion: false,
          clipboard: mockClipboard,
          setClipboard: mockSetClipboard,
          clearClipboard: mockClearClipboard,
        };
        return selector(state);
      });

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handleDelete();
      });

      expect(mockRemoveLayer).not.toHaveBeenCalled();
    });
  });

  describe('duplicate operations', () => {
    it('should duplicate layer', () => {
      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handleDuplicate();
      });

      expect(mockDuplicateLayer).toHaveBeenCalledWith('layer-1');
    });

    it('should not duplicate if no layer ID', () => {
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

      const { result } = renderHook(() => useGlobalLayerActions());

      act(() => {
        result.current.handleDuplicate();
      });

      expect(mockDuplicateLayer).not.toHaveBeenCalled();
    });

    it('should not duplicate if layer is a page and page creation is not allowed', () => {
      mockIsLayerAPage.mockReturnValue(true);
      (useEditorStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          registry: mockRegistry,
          allowPagesCreation: false,
          allowPagesDeletion: true,
          clipboard: mockClipboard,
          setClipboard: mockSetClipboard,
          clearClipboard: mockClearClipboard,
        };
        return selector(state);
      });

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      act(() => {
        result.current.handleDuplicate();
      });

      expect(mockDuplicateLayer).not.toHaveBeenCalled();
    });
  });

  describe('canPaste and canPerformPaste', () => {
    it('should return canPaste as false when clipboard is empty', () => {
      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      expect(result.current.canPaste).toBe(false);
    });

    it('should return canPaste as true when clipboard has content and validation passes', () => {
      mockClipboard = {
        layer: mockLayer,
        isCut: false,
        sourceLayerId: 'layer-1',
      };

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      expect(result.current.canPaste).toBe(true);
    });

    it('should return canPaste as false when validation fails', () => {
      mockClipboard = {
        layer: mockLayer,
        isCut: false,
        sourceLayerId: 'layer-1',
      };
      mockCanPasteLayer.mockReturnValue(false);

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      expect(result.current.canPaste).toBe(false);
    });

    it('should canPerformPaste check validation for a given target', () => {
      mockClipboard = {
        layer: mockLayer,
        isCut: false,
        sourceLayerId: 'layer-1',
      };

      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      result.current.canPerformPaste('target-layer');

      expect(mockCanPasteLayer).toHaveBeenCalledWith(
        mockLayer,
        'target-layer',
        mockRegistry,
        mockFindLayerById
      );
    });

    it('should canPerformPaste return false when clipboard is empty', () => {
      const { result } = renderHook(() => useGlobalLayerActions('layer-1'));

      const canPaste = result.current.canPerformPaste('target-layer');

      expect(canPaste).toBe(false);
    });
  });

  describe('uses selected layer when no layerId provided', () => {
    it('should use selectedLayerId when no layerId is passed', () => {
      const { result } = renderHook(() => useGlobalLayerActions());

      act(() => {
        result.current.handleCopy();
      });

      // Should have used 'layer-1' from selectedLayerId
      expect(mockFindLayerById).toHaveBeenCalledWith('layer-1');
      expect(mockSetClipboard).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceLayerId: 'layer-1',
        })
      );
    });
  });
});
