import { z } from 'zod';
import {
  isZodFunctionSchema,
  extractFunctionArgsSchema,
  areFunctionSignaturesCompatible,
  getCompatibleFunctions,
  getFunctionTypeVariables,
  getCompatibleFunctionVariables,
} from '../lib/ui-builder/utils/function-compatibility';
import type { FunctionRegistry, Variable } from '../components/ui/ui-builder/types';

describe('Function Compatibility Utils', () => {
  describe('isZodFunctionSchema', () => {
    it('should return true for function schemas', () => {
      // Create a mock function schema with the Zod v4 internal structure
      const mockFunctionSchema = {
        _zod: { def: { type: 'function' } }
      };
      expect(isZodFunctionSchema(mockFunctionSchema as any)).toBe(true);
    });

    it('should return true for optional function schemas', () => {
      // Create a mock optional wrapper around a function schema
      const mockOptionalFunctionSchema = {
        _zod: { 
          def: { 
            type: 'optional',
            innerType: { _zod: { def: { type: 'function' } } }
          } 
        }
      };
      expect(isZodFunctionSchema(mockOptionalFunctionSchema as any)).toBe(true);
    });

    it('should return false for non-function schemas', () => {
      expect(isZodFunctionSchema(z.string())).toBe(false);
      expect(isZodFunctionSchema(z.number())).toBe(false);
      expect(isZodFunctionSchema(z.object({}))).toBe(false);
    });

    it('should handle schemas without _zod property', () => {
      expect(isZodFunctionSchema({} as any)).toBe(false);
      expect(isZodFunctionSchema(null as any)).toBe(false);
      expect(isZodFunctionSchema(undefined as any)).toBe(false);
    });
  });

  describe('extractFunctionArgsSchema', () => {
    it('should extract args from function schema', () => {
      // Create a mock function schema with args
      const argsSchema = z.tuple([z.string(), z.number()]);
      const mockFunctionSchema = {
        _zod: { def: { type: 'function', args: argsSchema } }
      };
      const result = extractFunctionArgsSchema(mockFunctionSchema as any);
      expect(result).toBe(argsSchema);
    });

    it('should return undefined for non-function schemas', () => {
      expect(extractFunctionArgsSchema(z.string())).toBeUndefined();
      expect(extractFunctionArgsSchema(z.object({}))).toBeUndefined();
    });

    it('should handle optional function schemas', () => {
      const argsSchema = z.tuple([z.string()]);
      const mockOptionalFunctionSchema = {
        _zod: { 
          def: { 
            type: 'optional',
            innerType: { _zod: { def: { type: 'function', args: argsSchema } } }
          } 
        }
      };
      const result = extractFunctionArgsSchema(mockOptionalFunctionSchema as any);
      expect(result).toBe(argsSchema);
    });
  });

  describe('areFunctionSignaturesCompatible', () => {
    it('should return true when both schemas are undefined', () => {
      expect(areFunctionSignaturesCompatible(undefined, undefined)).toBe(true);
    });

    it('should return true when target has more tuple items than candidate', () => {
      const target = z.tuple([z.string(), z.number(), z.boolean()]);
      const candidate = z.tuple([z.string()]);
      expect(areFunctionSignaturesCompatible(target, candidate)).toBe(true);
    });

    it('should return false when candidate requires more tuple items than target', () => {
      const target = z.tuple([z.string()]);
      const candidate = z.tuple([z.string(), z.number(), z.boolean()]);
      expect(areFunctionSignaturesCompatible(target, candidate)).toBe(false);
    });

    it('should return true when object candidate is subset of target', () => {
      const target = z.object({ a: z.string(), b: z.number(), c: z.boolean() });
      const candidate = z.object({ a: z.string() });
      expect(areFunctionSignaturesCompatible(target, candidate)).toBe(true);
    });

    it('should return false when candidate has properties not in target', () => {
      const target = z.object({ a: z.string() });
      const candidate = z.object({ a: z.string(), b: z.number() });
      expect(areFunctionSignaturesCompatible(target, candidate)).toBe(false);
    });

    it('should be permissive for mixed types', () => {
      const target = z.tuple([z.string()]);
      const candidate = z.object({ a: z.string() });
      expect(areFunctionSignaturesCompatible(target, candidate)).toBe(true);
    });
  });

  describe('getCompatibleFunctions', () => {
    const mockFunctionRegistry: FunctionRegistry = {
      noArgs: {
        name: 'No Args',
        schema: z.tuple([]),
        fn: () => {},
      },
      oneArg: {
        name: 'One Arg',
        schema: z.tuple([z.string()]),
        fn: (s: string) => s,
      },
      twoArgs: {
        name: 'Two Args',
        schema: z.tuple([z.string(), z.number()]),
        fn: (s: string, n: number) => `${s}-${n}`,
      },
    };

    it('should return empty array when no registry is provided', () => {
      const mockFunctionSchema = { _zod: { def: { type: 'function' } } };
      expect(getCompatibleFunctions(undefined, mockFunctionSchema as any)).toEqual([]);
    });

    it('should return all functions when target schema is undefined', () => {
      const result = getCompatibleFunctions(mockFunctionRegistry, undefined);
      expect(result).toContain('noArgs');
      expect(result).toContain('oneArg');
      expect(result).toContain('twoArgs');
    });

    it('should filter functions by compatibility', () => {
      // A mock function schema with args for filtering
      const mockTargetSchema = {
        _zod: { 
          def: { 
            type: 'function', 
            args: z.tuple([z.string()]) 
          } 
        }
      };
      const result = getCompatibleFunctions(mockFunctionRegistry, mockTargetSchema as any);
      // With the compatibility logic, noArgs and oneArg should be compatible (less or equal args)
      expect(result).toContain('noArgs');
      expect(result).toContain('oneArg');
    });
  });

  describe('getFunctionTypeVariables', () => {
    const mockVariables: Variable[] = [
      { id: 'v1', name: 'name', type: 'string', defaultValue: 'John' },
      { id: 'v2', name: 'age', type: 'number', defaultValue: 25 },
      { id: 'v3', name: 'onClick', type: 'function', defaultValue: 'handleClick' },
      { id: 'v4', name: 'onSubmit', type: 'function', defaultValue: 'handleSubmit' },
    ];

    it('should return only function-type variables', () => {
      const result = getFunctionTypeVariables(mockVariables);
      expect(result).toHaveLength(2);
      expect(result.map(v => v.id)).toEqual(['v3', 'v4']);
    });

    it('should return empty array when no function variables exist', () => {
      const nonFunctionVariables = mockVariables.filter(v => v.type !== 'function');
      const result = getFunctionTypeVariables(nonFunctionVariables);
      expect(result).toHaveLength(0);
    });

    it('should return empty array for empty variables array', () => {
      const result = getFunctionTypeVariables([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getCompatibleFunctionVariables', () => {
    const mockFunctionRegistry: FunctionRegistry = {
      handleClick: {
        name: 'Handle Click',
        schema: z.tuple([]),
        fn: () => {},
      },
      handleSubmit: {
        name: 'Handle Submit',
        schema: z.tuple([z.custom<FormData>()]),
        fn: () => {},
      },
    };

    const mockVariables: Variable[] = [
      { id: 'v1', name: 'name', type: 'string', defaultValue: 'John' },
      { id: 'v3', name: 'onClick', type: 'function', defaultValue: 'handleClick' },
      { id: 'v4', name: 'onSubmit', type: 'function', defaultValue: 'handleSubmit' },
    ];

    it('should return empty array when no registry is provided', () => {
      const result = getCompatibleFunctionVariables(mockVariables, undefined, z.function());
      expect(result).toEqual([]);
    });

    it('should return compatible function variables', () => {
      const result = getCompatibleFunctionVariables(mockVariables, mockFunctionRegistry, undefined);
      // All function variables are compatible when target is undefined
      expect(result.map(v => v.id)).toEqual(['v3', 'v4']);
    });

    it('should filter out non-function variables', () => {
      const result = getCompatibleFunctionVariables(mockVariables, mockFunctionRegistry, undefined);
      expect(result.every(v => v.type === 'function')).toBe(true);
    });
  });
});
