import { interfacesToSchema } from '../lib/ui-builder/scripts/interfaces-to-schema';
import { PropInterfaceData } from '../lib/ui-builder/scripts/doc-to-interface';
import { normalizeSchema } from './test-utils';

describe('interfacesToSchema', () => {
  it('generates correct schema with single interface', () => {
    const input: PropInterfaceData[] = [
      {
        interfaceString: `export interface TestProps { name: string; age: number; }`,
        componentName: 'Test',
        from: '@/components/Test',
        isDefault: true,
        filePath: '@/components/Test.tsx',
      },
    ];

    const expectedSchema = `
      import { z } from 'zod';
      import Test from './Test';
      
      export const TestSchema = z.object({
          name: z.string(),
          age: z.number()
      });
      
      export const ComponentDefinitions = {
          Test: {
            component: Test,
            from: '@/components/Test',
            schema: TestSchema
          },
      };
    `;

    const result = interfacesToSchema(input);
    expect(normalizeSchema(result)).toBe(normalizeSchema(expectedSchema));
  });

  it('handles name collisions by aliasing', () => {
    const input: PropInterfaceData[] = [
      {
        interfaceString: `export interface ButtonProps { label: string; onClick: () => void; }`,
        componentName: 'Button',
        from: '@/components/Button',
        isDefault: true,
        filePath: '@/components/Button.tsx',
      },
      {
        interfaceString: `export interface ButtonProps { size: 'small' | 'large'; disabled: boolean; }`,
        componentName: 'Button',
        from: '@/components/ButtonVariant',
        isDefault: false,
        filePath: '@/components/ButtonVariant.tsx',
      },
    ];

    const expectedSchema = `
      import { z } from 'zod';
      
      import Button from './Button';
      import { Button as Button2 } from './ButtonVariant';
      
      export const ButtonSchema = z.object({
        label: z.string(),
        onClick: z.function().args().returns(z.void())
      });
      
      export const Button2Schema = z.object({
        size: z.union([z.literal("small"), z.literal("large")]),
        disabled: z.boolean()
      });
      
      export const ComponentDefinitions = {
          Button: {
            component: Button,
            from: '@/components/Button',
            schema: ButtonSchema
          },
          Button2: {
            component: Button2,
            from: '@/components/ButtonVariant',
            schema: Button2Schema
          },
      };
    `;

    const result = interfacesToSchema(input);
    expect(normalizeSchema(result)).toBe(normalizeSchema(expectedSchema));
  });

  it('uses empty schema on generation errors', () => {
    const input: PropInterfaceData[] = [
      {
        interfaceString: `export interface InvalidProps { data: unknownType; }`,
        componentName: 'Invalid',
        from: '@/components/Invalid',
        isDefault: true,
        filePath: '@/components/Invalid.tsx',
      },
    ];

    const expectedSchema = `
      import { z } from 'zod';
      
      import Invalid from './Invalid';
      
      export const InvalidSchema = z.object({})
      
      export const ComponentDefinitions = {
          Invalid: {
            component: Invalid,
            from: '@/components/Invalid',
            schema: InvalidSchema
          },
      };
    `;

    const result = interfacesToSchema(input);
    expect(normalizeSchema(result)).toBe(normalizeSchema(expectedSchema));
  });
});