import { isVariableReference, resolveVariableReferences, resolveChildrenVariableReference } from '../lib/ui-builder/utils/variable-resolver';
import type { Variable, ComponentLayer, FunctionRegistry } from '../components/ui/ui-builder/types';

describe('Variable Resolver', () => {
  const mockVariables: Variable[] = [
    { id: 'var1', name: 'userName', type: 'string', defaultValue: 'John Doe' },
    { id: 'var2', name: 'userAge', type: 'number', defaultValue: 25 },
    { id: 'var3', name: 'isActive', type: 'boolean', defaultValue: true },
  ];

  const mockFunctionVariables: Variable[] = [
    ...mockVariables,
    { id: 'fn1', name: 'handleClick', type: 'function', defaultValue: 'mockClickHandler' },
    { id: 'fn2', name: 'handleSubmit', type: 'function', defaultValue: 'mockSubmitHandler' },
  ];

  const mockFunctionRegistry: FunctionRegistry = {
    mockClickHandler: {
      name: 'Mock Click Handler',
      schema: {} as any,
      fn: jest.fn(() => 'clicked'),
    },
    mockSubmitHandler: {
      name: 'Mock Submit Handler',
      schema: {} as any,
      fn: jest.fn(() => 'submitted'),
    },
  };

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

    describe('function-type variable resolution', () => {
      it('should resolve function-type variables to actual functions from registry', () => {
        const props = {
          onClick: { __variableRef: 'fn1' },
          onSubmit: { __variableRef: 'fn2' },
        };

        const resolved = resolveVariableReferences(
          props,
          mockFunctionVariables,
          undefined,
          mockFunctionRegistry
        );

        expect(resolved.onClick).toBe(mockFunctionRegistry.mockClickHandler!.fn);
        expect(resolved.onSubmit).toBe(mockFunctionRegistry.mockSubmitHandler!.fn);
      });

      it('should return undefined when function is not found in registry', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const props = {
          onClick: { __variableRef: 'fn1' },
        };

        const incompleteRegistry: FunctionRegistry = {
          // mockClickHandler is missing
        };

        const resolved = resolveVariableReferences(
          props,
          mockFunctionVariables,
          undefined,
          incompleteRegistry
        );

        expect(resolved.onClick).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should warn when function registry is not provided for function-type variable', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const props = {
          onClick: { __variableRef: 'fn1' },
        };

        const resolved = resolveVariableReferences(
          props,
          mockFunctionVariables,
          undefined,
          undefined // No function registry
        );

        expect(resolved.onClick).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalledWith(
          'Function-type variable found but no functionRegistry provided'
        );
        consoleSpy.mockRestore();
      });

      it('should mix function and non-function variables correctly', () => {
        const props = {
          title: { __variableRef: 'var1' },
          onClick: { __variableRef: 'fn1' },
          count: { __variableRef: 'var2' },
        };

        const resolved = resolveVariableReferences(
          props,
          mockFunctionVariables,
          undefined,
          mockFunctionRegistry
        );

        expect(resolved.title).toBe('John Doe');
        expect(resolved.onClick).toBe(mockFunctionRegistry.mockClickHandler!.fn);
        expect(resolved.count).toBe(25);
      });
    });

    describe('__function_* metadata resolution', () => {
      it('should resolve __function_* metadata to actual functions', () => {
        const props = {
          className: 'my-class',
          __function_onClick: 'mockClickHandler',
        };

        const resolved = resolveVariableReferences(
          props,
          [],
          undefined,
          mockFunctionRegistry
        );

        expect(resolved.onClick).toBe(mockFunctionRegistry.mockClickHandler!.fn);
        expect(resolved.className).toBe('my-class');
        // __function_onClick should not be in resolved props
        expect(resolved.__function_onClick).toBeUndefined();
      });

      it('should resolve multiple __function_* metadata props', () => {
        const props = {
          __function_onClick: 'mockClickHandler',
          __function_onSubmit: 'mockSubmitHandler',
        };

        const resolved = resolveVariableReferences(
          props,
          [],
          undefined,
          mockFunctionRegistry
        );

        expect(resolved.onClick).toBe(mockFunctionRegistry.mockClickHandler!.fn);
        expect(resolved.onSubmit).toBe(mockFunctionRegistry.mockSubmitHandler!.fn);
      });

      it('should warn and set undefined for missing function in __function_* metadata', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        const props = {
          __function_onClick: 'nonexistentFunction',
        };

        const resolved = resolveVariableReferences(
          props,
          [],
          undefined,
          mockFunctionRegistry
        );

        expect(resolved.onClick).toBeUndefined();
        expect(warnSpy).toHaveBeenCalledWith(
          'Function "nonexistentFunction" not found in function registry for prop "onClick"'
        );
        
        warnSpy.mockRestore();
      });

      it('should prioritize __function_* metadata over existing prop value', () => {
        const props = {
          onClick: () => 'original function',
          __function_onClick: 'mockClickHandler',
        };

        const resolved = resolveVariableReferences(
          props,
          [],
          undefined,
          mockFunctionRegistry
        );

        // Function from registry should override the original
        expect(resolved.onClick).toBe(mockFunctionRegistry.mockClickHandler!.fn);
      });
    });
  });

  describe('resolveChildrenVariableReference', () => {
    it('should resolve variable reference to default value', () => {
      const children: ComponentLayer['children'] = { __variableRef: 'var1' };
      
      const resolved = resolveChildrenVariableReference(children, mockVariables);
      
      expect(resolved).toBe('John Doe');
    });

    it('should use provided variable values over defaults', () => {
      const children: ComponentLayer['children'] = { __variableRef: 'var1' };
      const variableValues = { var1: 'Custom Text' };
      
      const resolved = resolveChildrenVariableReference(children, mockVariables, variableValues);
      
      expect(resolved).toBe('Custom Text');
    });

    it('should convert non-string variable values to string', () => {
      const children: ComponentLayer['children'] = { __variableRef: 'var2' };
      
      const resolved = resolveChildrenVariableReference(children, mockVariables);
      
      expect(resolved).toBe('25');
    });

    it('should convert boolean variable values to string', () => {
      const children: ComponentLayer['children'] = { __variableRef: 'var3' };
      
      const resolved = resolveChildrenVariableReference(children, mockVariables);
      
      expect(resolved).toBe('true');
    });

    it('should return empty string for missing variable', () => {
      const children: ComponentLayer['children'] = { __variableRef: 'nonexistent' };
      
      const resolved = resolveChildrenVariableReference(children, mockVariables);
      
      expect(resolved).toBe('');
    });

    it('should pass through string children unchanged', () => {
      const children: ComponentLayer['children'] = 'Static text content';
      
      const resolved = resolveChildrenVariableReference(children, mockVariables);
      
      expect(resolved).toBe('Static text content');
    });

    it('should pass through ComponentLayer array unchanged', () => {
      const childLayers: ComponentLayer[] = [
        { id: 'child1', type: 'span', props: {}, children: 'Text' },
        { id: 'child2', type: 'div', props: {}, children: [] },
      ];
      const children: ComponentLayer['children'] = childLayers;
      
      const resolved = resolveChildrenVariableReference(children, mockVariables);
      
      expect(resolved).toBe(childLayers);
      expect(Array.isArray(resolved)).toBe(true);
    });

    it('should handle empty variables array', () => {
      const children: ComponentLayer['children'] = { __variableRef: 'var1' };
      
      const resolved = resolveChildrenVariableReference(children, []);
      
      expect(resolved).toBe('');
    });
  });
}); 