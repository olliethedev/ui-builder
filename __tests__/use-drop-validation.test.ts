import { renderHook } from '@testing-library/react';
import { useDropValidation } from '@/lib/ui-builder/hooks/use-drop-validation';

// Mock dependencies
const mockFindLayerById = jest.fn();
const mockComponentRegistry: Record<string, any> = {};

jest.mock('@/lib/ui-builder/store/layer-store', () => ({
  useLayerStore: jest.fn((selector) => {
    const store = {
      findLayerById: mockFindLayerById,
    };
    return selector(store);
  }),
}));

jest.mock('@/lib/ui-builder/store/editor-store', () => ({
  useEditorStore: jest.fn((selector) => {
    const store = {
      registry: mockComponentRegistry,
    };
    return selector(store);
  }),
}));

jest.mock('@/lib/ui-builder/store/layer-utils', () => ({
  canLayerAcceptChildren: jest.fn(() => true),
}));

import { canLayerAcceptChildren } from '@/lib/ui-builder/store/layer-utils';
const mockCanLayerAcceptChildren = canLayerAcceptChildren as jest.Mock;

describe('useDropValidation', () => {
  const mockIsLayerDescendantOf = jest.fn(() => false);

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLayerDescendantOf.mockReturnValue(false);
    mockCanLayerAcceptChildren.mockReturnValue(true);
    
    // Reset registry
    Object.keys(mockComponentRegistry).forEach(key => delete mockComponentRegistry[key]);
  });

  describe('basic validation', () => {
    it('returns false when layerId is empty', () => {
      const { result } = renderHook(() => 
        useDropValidation(null, mockIsLayerDescendantOf)
      );

      expect(result.current.canDropOnLayer('')).toBe(false);
    });

    it('returns false when target layer is not found', () => {
      mockFindLayerById.mockReturnValue(null);

      const { result } = renderHook(() => 
        useDropValidation(null, mockIsLayerDescendantOf)
      );

      expect(result.current.canDropOnLayer('non-existent')).toBe(false);
    });

    it('returns true when no active drag and layer can accept children', () => {
      mockFindLayerById.mockReturnValue({
        id: 'target',
        type: 'div',
        props: {},
        children: [],
      });

      const { result } = renderHook(() => 
        useDropValidation(null, mockIsLayerDescendantOf)
      );

      expect(result.current.canDropOnLayer('target')).toBe(true);
    });
  });

  describe('childOf constraint for existing layer drag', () => {
    beforeEach(() => {
      // Setup registry with Accordion and AccordionItem
      mockComponentRegistry['Accordion'] = {
        component: () => null,
        schema: { shape: { children: {} } },
      };
      mockComponentRegistry['AccordionItem'] = {
        component: () => null,
        schema: { shape: { children: {} } },
        childOf: ['Accordion'],
      };
      mockComponentRegistry['div'] = {
        component: () => null,
        schema: { shape: { children: {} } },
      };
    });

    it('allows dropping AccordionItem onto Accordion', () => {
      // Target is Accordion
      mockFindLayerById.mockImplementation((id: string) => {
        if (id === 'accordion-1') {
          return { id: 'accordion-1', type: 'Accordion', props: {}, children: [] };
        }
        if (id === 'accordion-item-1') {
          return { id: 'accordion-item-1', type: 'AccordionItem', props: {}, children: [] };
        }
        return null;
      });

      const { result } = renderHook(() => 
        useDropValidation('accordion-item-1', mockIsLayerDescendantOf)
      );

      expect(result.current.canDropOnLayer('accordion-1')).toBe(true);
    });

    it('prevents dropping AccordionItem onto div', () => {
      // Target is div (not in AccordionItem.childOf)
      mockFindLayerById.mockImplementation((id: string) => {
        if (id === 'div-1') {
          return { id: 'div-1', type: 'div', props: {}, children: [] };
        }
        if (id === 'accordion-item-1') {
          return { id: 'accordion-item-1', type: 'AccordionItem', props: {}, children: [] };
        }
        return null;
      });

      const { result } = renderHook(() => 
        useDropValidation('accordion-item-1', mockIsLayerDescendantOf)
      );

      expect(result.current.canDropOnLayer('div-1')).toBe(false);
    });

    it('allows dropping component without childOf onto any valid parent', () => {
      mockFindLayerById.mockImplementation((id: string) => {
        if (id === 'div-1') {
          return { id: 'div-1', type: 'div', props: {}, children: [] };
        }
        if (id === 'button-1') {
          return { id: 'button-1', type: 'Button', props: {}, children: [] };
        }
        return null;
      });

      mockComponentRegistry['Button'] = {
        component: () => null,
        schema: { shape: { children: {} } },
        // No childOf constraint
      };

      const { result } = renderHook(() => 
        useDropValidation('button-1', mockIsLayerDescendantOf)
      );

      expect(result.current.canDropOnLayer('div-1')).toBe(true);
    });

    it('prevents dropping onto self', () => {
      mockFindLayerById.mockReturnValue({
        id: 'layer-1',
        type: 'div',
        props: {},
        children: [],
      });
      mockIsLayerDescendantOf.mockReturnValue(true);

      const { result } = renderHook(() => 
        useDropValidation('layer-1', mockIsLayerDescendantOf)
      );

      expect(result.current.canDropOnLayer('layer-1')).toBe(false);
    });

    it('handles case when dragged layer is not found gracefully', () => {
      mockFindLayerById.mockImplementation((id: string) => {
        if (id === 'target') {
          return { id: 'target', type: 'div', props: {}, children: [] };
        }
        // Dragged layer not found
        return null;
      });

      const { result } = renderHook(() => 
        useDropValidation('non-existent-layer', mockIsLayerDescendantOf)
      );

      // Should still allow the drop based on target's ability to accept children
      expect(result.current.canDropOnLayer('target')).toBe(true);
    });
  });

  describe('childOf constraint for new component drag', () => {
    beforeEach(() => {
      mockComponentRegistry['Accordion'] = {
        component: () => null,
        schema: { shape: { children: {} } },
      };
      mockComponentRegistry['AccordionItem'] = {
        component: () => null,
        schema: { shape: { children: {} } },
        childOf: ['Accordion'],
      };
      mockComponentRegistry['div'] = {
        component: () => null,
        schema: { shape: { children: {} } },
      };
    });

    it('allows dropping new AccordionItem onto Accordion', () => {
      mockFindLayerById.mockReturnValue({
        id: 'accordion-1',
        type: 'Accordion',
        props: {},
        children: [],
      });

      const { result } = renderHook(() => 
        useDropValidation(null, mockIsLayerDescendantOf, 'AccordionItem')
      );

      expect(result.current.canDropOnLayer('accordion-1')).toBe(true);
    });

    it('prevents dropping new AccordionItem onto div', () => {
      mockFindLayerById.mockReturnValue({
        id: 'div-1',
        type: 'div',
        props: {},
        children: [],
      });

      const { result } = renderHook(() => 
        useDropValidation(null, mockIsLayerDescendantOf, 'AccordionItem')
      );

      expect(result.current.canDropOnLayer('div-1')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles undefined component registry entry', () => {
      mockFindLayerById.mockImplementation((id: string) => {
        if (id === 'target') {
          return { id: 'target', type: 'div', props: {}, children: [] };
        }
        if (id === 'unknown') {
          return { id: 'unknown', type: 'UnknownComponent', props: {}, children: [] };
        }
        return null;
      });

      const { result } = renderHook(() => 
        useDropValidation('unknown', mockIsLayerDescendantOf)
      );

      // Should allow since UnknownComponent has no childOf constraint
      expect(result.current.canDropOnLayer('target')).toBe(true);
    });

    it('handles empty childOf array', () => {
      mockComponentRegistry['EmptyChildOf'] = {
        component: () => null,
        schema: { shape: { children: {} } },
        childOf: [],
      };

      mockFindLayerById.mockImplementation((id: string) => {
        if (id === 'target') {
          return { id: 'target', type: 'div', props: {}, children: [] };
        }
        if (id === 'empty-childof') {
          return { id: 'empty-childof', type: 'EmptyChildOf', props: {}, children: [] };
        }
        return null;
      });

      const { result } = renderHook(() => 
        useDropValidation('empty-childof', mockIsLayerDescendantOf)
      );

      // Empty childOf array means can't be dropped anywhere
      expect(result.current.canDropOnLayer('target')).toBe(false);
    });
  });
});
