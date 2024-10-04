/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType as ReactComponentType } from 'react';
import { z, ZodObject } from 'zod';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flexbox } from '@/components/ui/ui-builder/flexbox';
import { CodePanel } from '@/components/ui/ui-builder/code-panel';
import { patchSchema } from '@/lib/ui-builder/store/schema-utils';

// import { ComponentDefinitions } from '@/components/ui/generated-schemas';


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
  CodePanel: {
    component: CodePanel,
    schema: z.object({
      className: z.string().optional(),
    }),
    from: '@/components/ui/ui-builder/code-panel'
  }
};