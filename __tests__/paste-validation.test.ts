import { canPasteLayer, canPasteComponentType } from '@/lib/ui-builder/utils/paste-validation';
import type { ComponentLayer, ComponentRegistry } from '@/components/ui/ui-builder/types';
import { z } from 'zod';

// Mock the layer-utils module
jest.mock('@/lib/ui-builder/store/layer-utils', () => ({
  canLayerAcceptChildren: jest.fn(),
}));

// Mock the schema-utils module
jest.mock('@/lib/ui-builder/store/schema-utils', () => ({
  hasChildrenFieldOfTypeString: jest.fn(),
}));

import { canLayerAcceptChildren } from '@/lib/ui-builder/store/layer-utils';
import { hasChildrenFieldOfTypeString } from '@/lib/ui-builder/store/schema-utils';

const mockCanLayerAcceptChildren = canLayerAcceptChildren as jest.MockedFunction<typeof canLayerAcceptChildren>;
const mockHasChildrenFieldOfTypeString = hasChildrenFieldOfTypeString as jest.MockedFunction<typeof hasChildrenFieldOfTypeString>;

describe('Paste Validation', () => {
  // Create mock layers
  const createMockLayer = (overrides?: Partial<ComponentLayer>): ComponentLayer => ({
    id: 'test-layer',
    type: 'div',
    name: 'Test Layer',
    props: {},
    children: [],
    ...overrides,
  });

  // Create mock registry
  const createMockRegistry = (): ComponentRegistry => ({
    div: {
      schema: z.object({
        className: z.string().optional(),
        children: z.array(z.any()).optional(),
      }),
      from: '@/components/ui/div',
      component: () => null,
    },
    Button: {
      schema: z.object({
        label: z.string().default('Button'),
        children: z.string().optional(),
      }),
      from: '@/components/ui/button',
      component: () => null,
    },
    Card: {
      schema: z.object({
        title: z.string().optional(),
        children: z.array(z.any()).optional(),
      }),
      from: '@/components/ui/card',
      component: () => null,
    },
    CardContent: {
      schema: z.object({
        children: z.array(z.any()).optional(),
      }),
      from: '@/components/ui/card',
      component: () => null,
      childOf: ['Card'], // Can only be child of Card
    },
    Text: {
      schema: z.object({
        content: z.string().optional(),
      }),
      from: '@/components/ui/text',
      component: () => null,
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCanLayerAcceptChildren.mockReturnValue(true);
    mockHasChildrenFieldOfTypeString.mockReturnValue(false);
  });

  describe('canPasteLayer', () => {
    it('should return false if target layer does not exist', () => {
      const sourceLayer = createMockLayer({ id: 'source', type: 'div' });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(undefined);

      const result = canPasteLayer(sourceLayer, 'non-existent', registry, findLayerById);

      expect(result).toBe(false);
      expect(findLayerById).toHaveBeenCalledWith('non-existent');
    });

    it('should return false if target cannot accept children', () => {
      const sourceLayer = createMockLayer({ id: 'source', type: 'div' });
      const targetLayer = createMockLayer({ id: 'target', type: 'Text' });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      mockCanLayerAcceptChildren.mockReturnValue(false);

      const result = canPasteLayer(sourceLayer, 'target', registry, findLayerById);

      expect(result).toBe(false);
      expect(mockCanLayerAcceptChildren).toHaveBeenCalledWith(targetLayer, registry);
    });

    it('should return false if target only accepts string children', () => {
      const sourceLayer = createMockLayer({ id: 'source', type: 'div' });
      const targetLayer = createMockLayer({ id: 'target', type: 'Button' });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      mockHasChildrenFieldOfTypeString.mockReturnValue(true);

      const result = canPasteLayer(sourceLayer, 'target', registry, findLayerById);

      expect(result).toBe(false);
    });

    it('should return false if source has childOf constraint that does not include target type', () => {
      const sourceLayer = createMockLayer({ id: 'source', type: 'CardContent' });
      const targetLayer = createMockLayer({ id: 'target', type: 'div' });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      const result = canPasteLayer(sourceLayer, 'target', registry, findLayerById);

      expect(result).toBe(false);
    });

    it('should return true if source childOf constraint includes target type', () => {
      const sourceLayer = createMockLayer({ id: 'source', type: 'CardContent' });
      const targetLayer = createMockLayer({ id: 'target', type: 'Card' });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      const result = canPasteLayer(sourceLayer, 'target', registry, findLayerById);

      expect(result).toBe(true);
    });

    it('should return true for valid paste operation without childOf constraint', () => {
      const sourceLayer = createMockLayer({ id: 'source', type: 'Button' });
      const targetLayer = createMockLayer({ id: 'target', type: 'div', children: [] });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      const result = canPasteLayer(sourceLayer, 'target', registry, findLayerById);

      expect(result).toBe(true);
    });

    it('should return true when source component is not in registry', () => {
      const sourceLayer = createMockLayer({ id: 'source', type: 'UnknownComponent' });
      const targetLayer = createMockLayer({ id: 'target', type: 'div', children: [] });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      const result = canPasteLayer(sourceLayer, 'target', registry, findLayerById);

      expect(result).toBe(true);
    });

    it('should return true when target component is not in registry but can accept children', () => {
      const sourceLayer = createMockLayer({ id: 'source', type: 'div' });
      const targetLayer = createMockLayer({ id: 'target', type: 'UnknownComponent', children: [] });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      const result = canPasteLayer(sourceLayer, 'target', registry, findLayerById);

      expect(result).toBe(true);
    });
  });

  describe('canPasteComponentType', () => {
    it('should return false if target layer does not exist', () => {
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(undefined);

      const result = canPasteComponentType('div', 'non-existent', registry, findLayerById);

      expect(result).toBe(false);
    });

    it('should return false if target cannot accept children', () => {
      const targetLayer = createMockLayer({ id: 'target', type: 'Text' });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      mockCanLayerAcceptChildren.mockReturnValue(false);

      const result = canPasteComponentType('div', 'target', registry, findLayerById);

      expect(result).toBe(false);
    });

    it('should return false if target only accepts string children', () => {
      const targetLayer = createMockLayer({ id: 'target', type: 'Button' });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      mockHasChildrenFieldOfTypeString.mockReturnValue(true);

      const result = canPasteComponentType('div', 'target', registry, findLayerById);

      expect(result).toBe(false);
    });

    it('should return false if component type has childOf constraint that does not include target type', () => {
      const targetLayer = createMockLayer({ id: 'target', type: 'div' });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      const result = canPasteComponentType('CardContent', 'target', registry, findLayerById);

      expect(result).toBe(false);
    });

    it('should return true if component type childOf constraint includes target type', () => {
      const targetLayer = createMockLayer({ id: 'target', type: 'Card' });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      const result = canPasteComponentType('CardContent', 'target', registry, findLayerById);

      expect(result).toBe(true);
    });

    it('should return true for valid paste operation without childOf constraint', () => {
      const targetLayer = createMockLayer({ id: 'target', type: 'div', children: [] });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      const result = canPasteComponentType('Button', 'target', registry, findLayerById);

      expect(result).toBe(true);
    });

    it('should return true when component type is not in registry', () => {
      const targetLayer = createMockLayer({ id: 'target', type: 'div', children: [] });
      const registry = createMockRegistry();
      const findLayerById = jest.fn().mockReturnValue(targetLayer);

      const result = canPasteComponentType('UnknownComponent', 'target', registry, findLayerById);

      expect(result).toBe(true);
    });
  });
});
