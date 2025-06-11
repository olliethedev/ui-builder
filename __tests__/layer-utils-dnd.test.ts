import { moveLayer, canLayerAcceptChildren } from '@/lib/ui-builder/store/layer-utils';
import { ComponentLayer, ComponentRegistry } from '@/components/ui/ui-builder/types';

describe('Layer Utils - Drag and Drop', () => {
  const mockRegistry: ComponentRegistry = {
    div: {
      schema: {
        shape: {
          children: { type: 'array' },
        },
      } as any,
    },
    span: {
      schema: {
        shape: {
          children: { type: 'string' },
        },
      } as any,
    },
    button: {
      schema: {
        shape: {
          // No children property
        },
      } as any,
    },
  };

  const createMockLayer = (id: string, type: string = 'div', children: ComponentLayer[] | string = []): ComponentLayer => ({
    id,
    type,
    name: `Layer ${id}`,
    props: {},
    children,
  });

  describe('moveLayer', () => {
    it('should move layer to new position within same parent', () => {
      const child1 = createMockLayer('child-1');
      const child2 = createMockLayer('child-2');
      const child3 = createMockLayer('child-3');
      const parent = createMockLayer('parent', 'div', [child1, child2, child3]);
      const pages = [parent];

      const result = moveLayer(pages, 'child-1', 'parent', 2);

      expect(result[0].children).toHaveLength(3);
      expect((result[0].children as ComponentLayer[])[0].id).toBe('child-2');
      expect((result[0].children as ComponentLayer[])[1].id).toBe('child-3');
      expect((result[0].children as ComponentLayer[])[2].id).toBe('child-1');
    });

    it('should move layer to different parent', () => {
      const child1 = createMockLayer('child-1');
      const child2 = createMockLayer('child-2');
      const parent1 = createMockLayer('parent-1', 'div', [child1]);
      const parent2 = createMockLayer('parent-2', 'div', [child2]);
      const pages = [parent1, parent2];

      const result = moveLayer(pages, 'child-1', 'parent-2', 1);

      // Source parent should have no children
      expect((result[0].children as ComponentLayer[])).toHaveLength(0);
      
      // Target parent should have both children
      expect((result[1].children as ComponentLayer[])).toHaveLength(2);
      expect((result[1].children as ComponentLayer[])[0].id).toBe('child-2');
      expect((result[1].children as ComponentLayer[])[1].id).toBe('child-1');
    });

    it('should move layer to beginning of target parent', () => {
      const child1 = createMockLayer('child-1');
      const child2 = createMockLayer('child-2');
      const child3 = createMockLayer('child-3');
      const parent = createMockLayer('parent', 'div', [child1, child2, child3]);
      const pages = [parent];

      const result = moveLayer(pages, 'child-3', 'parent', 0);

      expect((result[0].children as ComponentLayer[])[0].id).toBe('child-3');
      expect((result[0].children as ComponentLayer[])[1].id).toBe('child-1');
      expect((result[0].children as ComponentLayer[])[2].id).toBe('child-2');
    });

    it('should handle moving to end of target parent', () => {
      const child1 = createMockLayer('child-1');
      const child2 = createMockLayer('child-2');
      const parent = createMockLayer('parent', 'div', [child1, child2]);
      const newChild = createMockLayer('new-child');
      const otherParent = createMockLayer('other-parent', 'div', [newChild]);
      const pages = [parent, otherParent];

      const result = moveLayer(pages, 'new-child', 'parent', 2);

      expect((result[0].children as ComponentLayer[])).toHaveLength(3);
      expect((result[0].children as ComponentLayer[])[2].id).toBe('new-child');
      expect((result[1].children as ComponentLayer[])).toHaveLength(0);
    });

    it('should handle nested layer movement', () => {
      const grandchild = createMockLayer('grandchild');
      const child1 = createMockLayer('child-1', 'div', [grandchild]);
      const child2 = createMockLayer('child-2');
      const parent = createMockLayer('parent', 'div', [child1, child2]);
      const pages = [parent];

      const result = moveLayer(pages, 'grandchild', 'parent', 1);

      // Should move grandchild from nested position to direct child of parent
      expect((result[0].children as ComponentLayer[])).toHaveLength(3);
      expect((result[0].children as ComponentLayer[])[0].id).toBe('child-1');
      expect((result[0].children as ComponentLayer[])[1].id).toBe('grandchild');
      expect((result[0].children as ComponentLayer[])[2].id).toBe('child-2');
      
      // Original parent of grandchild should be empty
      expect(((result[0].children as ComponentLayer[])[0].children as ComponentLayer[])).toHaveLength(0);
    });

    it('should return original layers when source layer not found', () => {
      const child = createMockLayer('child');
      const parent = createMockLayer('parent', 'div', [child]);
      const pages = [parent];

      const result = moveLayer(pages, 'non-existent', 'parent', 0);

      expect(result).toEqual(pages);
    });

    it('should handle moving layer to empty parent', () => {
      const child = createMockLayer('child');
      const sourceParent = createMockLayer('source-parent', 'div', [child]);
      const targetParent = createMockLayer('target-parent', 'div', []);
      const pages = [sourceParent, targetParent];

      const result = moveLayer(pages, 'child', 'target-parent', 0);

      expect((result[0].children as ComponentLayer[])).toHaveLength(0);
      expect((result[1].children as ComponentLayer[])).toHaveLength(1);
      expect((result[1].children as ComponentLayer[])[0].id).toBe('child');
    });
  });

  describe('canLayerAcceptChildren', () => {
    it('should return true for layer with array children schema', () => {
      const layer = createMockLayer('test', 'div');
      const result = canLayerAcceptChildren(layer, mockRegistry);
      expect(result).toBe(true);
    });

    it('should return false for layer without children schema', () => {
      const layer = createMockLayer('test', 'button');
      const result = canLayerAcceptChildren(layer, mockRegistry);
      expect(result).toBe(false);
    });

    it('should return false for layer with string children', () => {
      const layer = createMockLayer('test', 'span', 'text content');
      const result = canLayerAcceptChildren(layer, mockRegistry);
      expect(result).toBe(false);
    });

    it('should return false for layer not in registry', () => {
      const layer = createMockLayer('test', 'unknown-type');
      const result = canLayerAcceptChildren(layer, mockRegistry);
      expect(result).toBe(false);
    });

    it('should return false for layer with non-array children field', () => {
      const layer = createMockLayer('test', 'span');
      const result = canLayerAcceptChildren(layer, mockRegistry);
      expect(result).toBe(false);
    });

    it('should handle layers with empty children array', () => {
      const layer = createMockLayer('test', 'div', []);
      const result = canLayerAcceptChildren(layer, mockRegistry);
      expect(result).toBe(true);
    });

    it('should handle layers with existing children', () => {
      const child = createMockLayer('child');
      const layer = createMockLayer('test', 'div', [child]);
      const result = canLayerAcceptChildren(layer, mockRegistry);
      expect(result).toBe(true);
    });
  });
});