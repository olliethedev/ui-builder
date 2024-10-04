import { ComponentType as ReactComponentType } from 'react';
import { z, ZodObject } from 'zod';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transactions } from '@/components/ui/transactions';
import { Flexbox } from '@/components/ui/ui-builder/flexbox';
import ReactFunctionComplexTypes from '@/components/ui/ReactFunctionComplexTypes';
import { CodePanel } from '@/components/ui/ui-builder/code-panel';
import { patchSchema } from '@/lib/ui-builder/store/schema-utils';


interface RegistryEntry<T extends ReactComponentType<any>> {
  component: T;
  schema: ZodObject<any>;
  from: string;
}

type ComponentRegistry = Record<string, RegistryEntry<ReactComponentType<any>>>;


export const componentRegistry: ComponentRegistry = {
  // ...ComponentDefinitions
  Button: {
    component: Button,
    schema: patchSchema(z.object({
      asChild: z.boolean().optional(),
      children: z.any().optional(),
      variant: z.union([z.literal("default"), z.literal("destructive"), z.literal("outline"), z.literal("secondary"), z.literal("ghost"), z.literal("link")]).optional().nullable(),
      size: z.union([z.literal("default"), z.literal("sm"), z.literal("lg"), z.literal("icon")]).optional().nullable()

    })),
    from: '@/components/ui/button'
  },
  Badge: {
    component: Badge,
    schema: patchSchema(z.object({
      children: z.any().optional(),
      variant: z.enum(['default', 'secondary', 'destructive', 'outline']).default('default'),
    })),
    from: '@/components/ui/badge'
  },
  Transactions: {
    component: Transactions,
    schema: patchSchema(z.object({
      data: z.array(z.object({
        id: z.string(),
        customer: z.string(),
        email: z.string(),
        amount: z.number()
      }))
    })),
    from: '@/components/ui/transactions'
  },
  Flexbox: {
    component: Flexbox,
    schema: patchSchema(z.object({
      children: z.any().optional(),
      direction: z.union([z.literal("row"), z.literal("column"), z.literal("rowReverse"), z.literal("columnReverse")]).optional().nullable(),
      justify: z.union([z.literal("start"), z.literal("end"), z.literal("center"), z.literal("between"), z.literal("around"), z.literal("evenly")]).optional().nullable(),
      align: z.union([z.literal("start"), z.literal("end"), z.literal("center"), z.literal("baseline"), z.literal("stretch")]).optional().nullable(),
      wrap: z.union([z.literal("wrap"), z.literal("nowrap"), z.literal("wrapReverse")]).optional().nullable(),
      gap: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(4), z.literal(8)]).optional().nullable()
    })),
    from: '@/components/ui/ui-builder/flexbox'
  },
  ReactFunctionComplexTypes: {
    component: ReactFunctionComplexTypes,
    from: '@/components/ui/ReactFunctionComplexTypes',
    schema: z.object({
      stringProp: z.string(),
      numberProp: z.number(),
      booleanProp: z.boolean(),
      bigintProp: z.bigint(),
      optionalString: z.string().optional(),
      optionalNumber: z.number().optional(),
      optionalBoolean: z.boolean().optional(),
      optionalBigint: z.bigint().optional(),
      userArray: z.array(z.object({
        id: z.number(),
        name: z.string()
      })),
      productList: z.array(z.object({
        code: z.string(),
        price: z.number()
      })),
      address: z.object({
        street: z.string(),
        city: z.string(),
        zipCode: z.string()
      }),
      colorOrNumber: z.string().and(z.object({
        r: z.number(),
        g: z.number(),
        b: z.number()
      })),
      statusOrCode: z.union([z.number(), z.literal("active"), z.literal("inactive")]),
      mixedTuple: z.tuple([z.string(), z.number(), z.boolean()]).and(z.object({
        length: z.literal(3)
      })),
      userRole: z.union([z.literal("admin"), z.literal("user"), z.literal("guest")]),
      children: z.any(),
      className: z.string(),
      style: z.any()
    })
  },
  CodePanel: {
    component: CodePanel,
    schema: z.object({
      className: z.string().optional(),
    }),
    from: '@/components/ui/ui-builder/code-panel'
  }
};