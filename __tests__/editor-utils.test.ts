import {
  generateFieldOverrides,
  isPrimitiveComponent,
  isCustomComponent
} from '@/lib/ui-builder/store/editor-utils';
import { ComponentRegistry, ComponentLayer, RegistryEntry } from '@/components/ui/ui-builder/types';
import { FieldConfigItem } from "@/components/ui/auto-form/types";
import { ComponentType as ReactComponentType } from "react";
import { z } from 'zod';

describe('Editor Utils', () => {
  describe('generateFieldOverrides', () => {
    const mockRegistry: ComponentRegistry = {
      Button: {
        schema: z.object({
          label: z.string().default('Button'),
          disabled: z.boolean().default(false),
        }),
        from: '@/components/ui/button',
        component: () => null,
        fieldOverrides: {
          label: (layer: ComponentLayer) => ({
            fieldType: 'fallback',
            label: `Label for ${layer.name}`,
            description: 'Custom label field',
          }),
          disabled: (layer: ComponentLayer) => ({
            fieldType: 'switch',
            label: 'Disable Button',
            description: `Disable state for ${layer.id}`,
          }),
        },
      },
      Input: {
        schema: z.object({
          placeholder: z.string().default('Enter text'),
          type: z.string().default('text'),
        }),
        from: '@/components/ui/input',
        component: () => null,
        fieldOverrides: {
          placeholder: (layer: ComponentLayer) => ({
            fieldType: 'textarea',
            label: 'Placeholder Text',
            description: 'Custom placeholder field',
          }),
        },
      },
      SimpleComponent: {
        schema: z.object({
          title: z.string().default('Title'),
        }),
        from: '@/components/ui/simple',
        component: () => null,
        // No fieldOverrides
      },
      ComponentWithEmptyOverrides: {
        schema: z.object({
          value: z.string().default('Value'),
        }),
        from: '@/components/ui/empty',
        component: () => null,
        fieldOverrides: {},
      },
    };

    const mockLayer: ComponentLayer = {
      id: 'layer-1',
      type: 'Button',
      name: 'Test Button',
      props: { label: 'Click Me', disabled: false },
      children: [],
    };

    it('should generate field overrides for component with overrides', () => {
      const overrides = generateFieldOverrides(mockRegistry, mockLayer);

      expect(overrides).toEqual({
        label: {
          fieldType: 'fallback',
          label: 'Label for Test Button',
          description: 'Custom label field',
        },
        disabled: {
          fieldType: 'switch',
          label: 'Disable Button',
          description: 'Disable state for layer-1',
        },
      });
    });

    it('should generate partial field overrides when some overrides exist', () => {
      const inputLayer: ComponentLayer = {
        id: 'input-1',
        type: 'Input',
        name: 'Test Input',
        props: { placeholder: 'Enter value' },
        children: [],
      };

      const overrides = generateFieldOverrides(mockRegistry, inputLayer);

      expect(overrides).toEqual({
        placeholder: {
          fieldType: 'textarea',
          label: 'Placeholder Text',
          description: 'Custom placeholder field',
        },
      });
    });

    it('should return empty object for component without field overrides', () => {
      const simpleLayer: ComponentLayer = {
        id: 'simple-1',
        type: 'SimpleComponent',
        name: 'Simple',
        props: { title: 'Test Title' },
        children: [],
      };

      const overrides = generateFieldOverrides(mockRegistry, simpleLayer);
      expect(overrides).toEqual({});
    });

    it('should return empty object for component with empty field overrides', () => {
      const emptyLayer: ComponentLayer = {
        id: 'empty-1',
        type: 'ComponentWithEmptyOverrides',
        name: 'Empty',
        props: { value: 'Test' },
        children: [],
      };

      const overrides = generateFieldOverrides(mockRegistry, emptyLayer);
      expect(overrides).toEqual({});
    });

    it('should return empty object for non-existent component type', () => {
      const unknownLayer: ComponentLayer = {
        id: 'unknown-1',
        type: 'UnknownComponent',
        name: 'Unknown',
        props: {},
        children: [],
      };

      const overrides = generateFieldOverrides(mockRegistry, unknownLayer);
      expect(overrides).toEqual({});
    });

    it('should handle component definition without fieldOverrides property', () => {
      const registryWithoutOverrides: ComponentRegistry = {
        NoOverrides: {
          schema: z.object({
            text: z.string().default('Text'),
          }),
          from: '@/components/ui/no-overrides',
          component: () => null,
          // fieldOverrides is undefined
        },
      };

      const noOverridesLayer: ComponentLayer = {
        id: 'no-overrides-1',
        type: 'NoOverrides',
        name: 'No Overrides',
        props: { text: 'Test' },
        children: [],
      };

      const overrides = generateFieldOverrides(registryWithoutOverrides, noOverridesLayer);
      expect(overrides).toEqual({});
    });

    it('should handle field override functions that return undefined', () => {
      const registryWithUndefinedOverrides: ComponentRegistry = {
        UndefinedOverrides: {
          schema: z.object({
            prop1: z.string().default('Value'),
            prop2: z.string().default('Value2'),
          }),
          from: '@/components/ui/undefined-overrides',
          component: () => null,
          fieldOverrides: {
            prop1: () => undefined as any,
            prop2: (layer: ComponentLayer) => ({
              fieldType: 'fallback',
              label: 'Valid Override',
              description: 'This override is valid',
            }),
          },
        },
      };

      const layer: ComponentLayer = {
        id: 'undefined-1',
        type: 'UndefinedOverrides',
        name: 'Undefined',
        props: {},
        children: [],
      };

      const overrides = generateFieldOverrides(registryWithUndefinedOverrides, layer);
      
      // Should only include the valid override, skip the undefined one
      expect(overrides).toEqual({
        prop2: {
          fieldType: 'fallback',
          label: 'Valid Override',
          description: 'This override is valid',
        },
      });
    });

    it('should pass correct layer data to field override functions', () => {
      const mockOverrideFunction = jest.fn().mockReturnValue({
        fieldType: 'fallback',
        label: 'Mock Label',
        description: 'Mock Description',
      });

      const registryWithMockOverride: ComponentRegistry = {
        MockComponent: {
          schema: z.object({
            testProp: z.string().default('test'),
          }),
          from: '@/components/ui/mock',
          component: () => null,
          fieldOverrides: {
            testProp: mockOverrideFunction,
          },
        },
      };

      const testLayer: ComponentLayer = {
        id: 'test-layer',
        type: 'MockComponent',
        name: 'Test Layer',
        props: { testProp: 'value' },
        children: [],
      };

      generateFieldOverrides(registryWithMockOverride, testLayer);

      expect(mockOverrideFunction).toHaveBeenCalledWith(testLayer);
      expect(mockOverrideFunction).toHaveBeenCalledTimes(1);
    });

    it('should handle complex field override configurations', () => {
      const complexLayer: ComponentLayer = {
        id: 'complex-1',
        type: 'Button',
        name: 'Complex Button',
        props: { 
          label: 'Complex Label', 
          disabled: true,
          customProp: 'custom value'
        },
        children: [
          {
            id: 'child-1',
            type: 'span',
            name: 'Child',
            props: {},
            children: 'Child text'
          }
        ],
      };

      const overrides = generateFieldOverrides(mockRegistry, complexLayer);

      expect(overrides.label.label).toBe('Label for Complex Button');
      expect(overrides.disabled.description).toBe('Disable state for complex-1');
    });
  });

  describe('isPrimitiveComponent', () => {
    it('should return true for primitive components (from property is undefined)', () => {
      const primitiveComponent: RegistryEntry<ReactComponentType<any>> = {
        schema: z.object({
          className: z.string().default(''),
        }),
        component: () => null,
        // from is undefined
      };

      expect(isPrimitiveComponent(primitiveComponent)).toBe(true);
    });

    it('should return false for custom components (from property is defined)', () => {
      const customComponent: RegistryEntry<ReactComponentType<any>> = {
        schema: z.object({
          label: z.string().default('Button'),
        }),
        from: '@/components/ui/button',
        component: () => null,
      };

      expect(isPrimitiveComponent(customComponent)).toBe(false);
    });

    it('should return false for components with empty string from property', () => {
      const componentWithEmptyFrom: RegistryEntry<ReactComponentType<any>> = {
        schema: z.object({
          text: z.string().default(''),
        }),
        from: '',
        component: () => null,
      };

      expect(isPrimitiveComponent(componentWithEmptyFrom)).toBe(false);
    });

    it('should return true for components with null from property', () => {
      const componentWithNullFrom: RegistryEntry<ReactComponentType<any>> = {
        schema: z.object({
          text: z.string().default(''),
        }),
        from: null as any,
        component: () => null,
      };

      expect(isPrimitiveComponent(componentWithNullFrom)).toBe(true);
    });
  });

  describe('isCustomComponent', () => {
    it('should return false for primitive components (from property is undefined)', () => {
      const primitiveComponent: RegistryEntry<ReactComponentType<any>> = {
        schema: z.object({
          className: z.string().default(''),
        }),
        component: () => null,
        // from is undefined
      };

      expect(isCustomComponent(primitiveComponent)).toBe(false);
    });

    it('should return true for custom components (from property is defined)', () => {
      const customComponent: RegistryEntry<ReactComponentType<any>> = {
        schema: z.object({
          label: z.string().default('Button'),
        }),
        from: '@/components/ui/button',
        component: () => null,
      };

      expect(isCustomComponent(customComponent)).toBe(true);
    });

    it('should return true for components with empty string from property', () => {
      const componentWithEmptyFrom: RegistryEntry<ReactComponentType<any>> = {
        schema: z.object({
          text: z.string().default(''),
        }),
        from: '',
        component: () => null,
      };

      expect(isCustomComponent(componentWithEmptyFrom)).toBe(true);
    });

    it('should return false for components with null from property', () => {
      const componentWithNullFrom: RegistryEntry<ReactComponentType<any>> = {
        schema: z.object({
          text: z.string().default(''),
        }),
        from: null as any,
        component: () => null,
      };

      expect(isCustomComponent(componentWithNullFrom)).toBe(false);
    });

    it('should return true for components with complex from paths', () => {
      const complexFromComponent: RegistryEntry<ReactComponentType<any>> = {
        schema: z.object({
          value: z.string().default(''),
        }),
        from: '@/components/ui/complex/nested/component',
        component: () => null,
      };

      expect(isCustomComponent(complexFromComponent)).toBe(true);
    });

    it('should return true for components with relative from paths', () => {
      const relativeFromComponent: RegistryEntry<ReactComponentType<any>> = {
        schema: z.object({
          value: z.string().default(''),
        }),
        from: './relative/component',
        component: () => null,
      };

      expect(isCustomComponent(relativeFromComponent)).toBe(true);
    });
  });

  describe('Component type checking consistency', () => {
    it('should have opposite results for isPrimitiveComponent and isCustomComponent', () => {
      const primitiveComponent: RegistryEntry<ReactComponentType<any>> = {
        schema: z.object({}),
        component: () => null,
      };

      const customComponent: RegistryEntry<ReactComponentType<any>> = {
        schema: z.object({}),
        from: '@/components/ui/custom',
        component: () => null,
      };

      // Primitive component
      expect(isPrimitiveComponent(primitiveComponent)).toBe(true);
      expect(isCustomComponent(primitiveComponent)).toBe(false);

      // Custom component
      expect(isPrimitiveComponent(customComponent)).toBe(false);
      expect(isCustomComponent(customComponent)).toBe(true);
    });

    it('should handle edge cases consistently', () => {
      const edgeCases = [
        { from: undefined },
        { from: null },
        { from: '' },
        { from: 'valid-path' },
        { from: '/absolute/path' },
        { from: './relative/path' },
        { from: '../parent/path' },
      ];

      edgeCases.forEach(({ from }) => {
        const component: RegistryEntry<ReactComponentType<any>> = {
          schema: z.object({}),
          from: from as any,
          component: () => null,
        };

        const isPrimitive = isPrimitiveComponent(component);
        const isCustom = isCustomComponent(component);

        // They should always be opposite
        expect(isPrimitive).toBe(!isCustom);
      });
    });
  });
});