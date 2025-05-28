import { isVariableReference, resolveVariableReferences } from '@/lib/ui-builder/utils/variable-resolver';
import { Variable } from '@/lib/ui-builder/store/layer-store';

describe('Variable Resolver', () => {
  const mockVariables: Variable[] = [
    { id: 'var1', name: 'userName', type: 'string', defaultValue: 'John Doe' },
    { id: 'var2', name: 'userAge', type: 'number', defaultValue: 25 },
    { id: 'var3', name: 'isActive', type: 'boolean', defaultValue: true },
  ];

  describe('isVariableReference', () => {
    it('should return true for valid variable reference objects', () => {
      expect(isVariableReference({ __variableRef: 'var1' })).toBe(true);
    });

    it('should return false for non-objects', () => {
      expect(isVariableReference('string')).toBe(false);
      expect(isVariableReference(123)).toBe(false);
      expect(isVariableReference(true)).toBe(false);
      expect(isVariableReference(null)).toBe(false);
      expect(isVariableReference(undefined)).toBe(false);
    });

    it('should return false for objects without __variableRef property', () => {
      expect(isVariableReference({})).toBe(false);
      expect(isVariableReference({ someOtherProp: 'value' })).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isVariableReference([])).toBe(false);
      expect(isVariableReference([1, 2, 3])).toBe(false);
    });
  });

  describe('resolveVariableReferences', () => {
    it('should resolve variable references to default values', () => {
      const props = {
        title: { __variableRef: 'var1' },
        count: { __variableRef: 'var2' },
        enabled: { __variableRef: 'var3' },
        staticProp: 'static value',
      };

      const resolved = resolveVariableReferences(props, mockVariables);

      expect(resolved).toEqual({
        title: 'John Doe',
        count: 25,
        enabled: true,
        staticProp: 'static value',
      });
    });

    it('should use provided variable values over defaults', () => {
      const props = {
        title: { __variableRef: 'var1' },
        count: { __variableRef: 'var2' },
      };

      const variableValues = {
        var1: 'Jane Smith',
        var2: 30,
      };

      const resolved = resolveVariableReferences(props, mockVariables, variableValues);

      expect(resolved).toEqual({
        title: 'Jane Smith',
        count: 30,
      });
    });

    it('should handle missing variables gracefully', () => {
      const props = {
        title: { __variableRef: 'nonexistent' },
        validProp: { __variableRef: 'var1' },
      };

      const resolved = resolveVariableReferences(props, mockVariables);

      expect(resolved).toEqual({
        title: undefined,
        validProp: 'John Doe',
      });
    });

    it('should recursively resolve nested objects', () => {
      const props = {
        user: {
          name: { __variableRef: 'var1' },
          age: { __variableRef: 'var2' },
          profile: {
            active: { __variableRef: 'var3' },
            staticField: 'static',
          },
        },
        topLevel: 'static top level',
      };

      const resolved = resolveVariableReferences(props, mockVariables);

      expect(resolved).toEqual({
        user: {
          name: 'John Doe',
          age: 25,
          profile: {
            active: true,
            staticField: 'static',
          },
        },
        topLevel: 'static top level',
      });
    });

    it('should preserve arrays without modification', () => {
      const props = {
        items: [1, 2, 3],
        config: { __variableRef: 'var1' },
      };

      const resolved = resolveVariableReferences(props, mockVariables);

      expect(resolved).toEqual({
        items: [1, 2, 3],
        config: 'John Doe',
      });
    });

    it('should handle empty props object', () => {
      const resolved = resolveVariableReferences({}, mockVariables);
      expect(resolved).toEqual({});
    });

    it('should handle empty variables array', () => {
      const props = {
        title: { __variableRef: 'var1' },
        static: 'value',
      };

      const resolved = resolveVariableReferences(props, []);

      expect(resolved).toEqual({
        title: undefined,
        static: 'value',
      });
    });

    it('should handle complex nested structures with mixed types', () => {
      const props = {
        config: {
          user: {
            name: { __variableRef: 'var1' },
            settings: {
              theme: 'dark',
              notifications: { __variableRef: 'var3' },
            },
          },
          metadata: {
            version: 1,
            features: ['feature1', 'feature2'],
          },
        },
        simpleRef: { __variableRef: 'var2' },
      };

      const resolved = resolveVariableReferences(props, mockVariables);

      expect(resolved).toEqual({
        config: {
          user: {
            name: 'John Doe',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
          metadata: {
            version: 1,
            features: ['feature1', 'feature2'],
          },
        },
        simpleRef: 25,
      });
    });
  });
}); 