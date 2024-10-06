import { ComponentRegistry } from "@/lib/ui-builder/registry/component-registry";
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flexbox } from '@/components/ui/ui-builder/flexbox';
import { Grid } from '@/components/ui/ui-builder/grid';
import { CodePanel } from '@/components/ui/ui-builder/code-panel';
import { patchSchema } from '@/lib/ui-builder/store/schema-utils';
import { Icon, iconNames } from "@/components/ui/ui-builder/icon";

export const complexComponentDefinitions: ComponentRegistry = {
    Button: {
        component: Button,
        schema: patchSchema(z.object({
            asChild: z.boolean().optional(),
            children: z.any().optional(),
            variant: z.enum([
                "default",
                "destructive",
                "outline",
                "secondary",
                "ghost",
                "link"
            ]).optional().nullable(),
            size: z.enum([
                "default",
                "sm",
                "lg",
                "icon"
            ]).optional().nullable()

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
            direction: z.enum([
                "row",
                "column",
                "rowReverse",
                "columnReverse"
            ]).optional().default("row").nullable(),
            justify: z.enum([
                "start",
                "end",
                "center",
                "between",
                "around",
                "evenly"
            ]).optional().default("start").nullable(),
            align: z.enum([
                "start",
                "end",
                "center",
                "baseline",
                "stretch"
            ]).optional().default("center").nullable(),
            wrap: z.enum([
                "wrap",
                "nowrap",
                "wrapReverse"
            ]).optional().default("nowrap").nullable(),
            gap: z.enum([
                "0",
                "1",
                "2",
                "4",
                "8"
            ]).optional().default("0").nullable()
        })),
        from: '@/components/ui/ui-builder/flexbox'
    },
    Grid: {
        component: Grid,
        schema: patchSchema(z.object({
            children: z.any().optional(),
            className: z.string().optional(),
            columns: z.enum([
                "auto",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8"
            ]).optional().default("1").nullable(),
            autoRows: z.enum([
                "none",
                "min",
                "max",
                "fr",
            ]).optional().default("none").nullable(),
            justify: z.enum([
                "start",
                "end",
                "center",
                "between",
                "around",
                "evenly",
            ]).optional().default("start").nullable(),
            align: z.enum([
                "start",
                "end",
                "center",
                "baseline",
                "stretch",
            ]).optional().default("start").nullable(),
            templateRows: z.enum([
                "none",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
            ]).optional().default("none").nullable(),
            gap: z.enum([
                "0",
                "1",
                "2",
                "4",
                "8",
            ]).optional().default("0").nullable(),
        })),
        from: '@/components/ui/ui-builder/grid'
    },
    CodePanel: {
        component: CodePanel,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: '@/components/ui/ui-builder/code-panel'
    },
    Icon: {
        component: Icon,
        schema: patchSchema(z.object({
            iconName: z.enum([
                ...(iconNames)
            ]),
            size: z.union([
                z.literal("small"),
                z.literal("medium"),
                z.literal("large")
            ]).optional().nullable(),
            color: z.union([
                z.literal("accent"),
                z.literal("accentForeground"),
                z.literal("primary"),
                z.literal("primaryForeground"),
                z.literal("secondary"),
                z.literal("secondaryForeground"),
                z.literal("destructive"),
                z.literal("destructiveForeground"),
                z.literal("muted"),
                z.literal("mutedForeground"),
                z.literal("background"),
                z.literal("foreground")
            ]).optional().nullable(),
            rotate: z.union([
                z.literal("none"),
                z.literal("90"),
                z.literal("180"),
                z.literal("270")
            ]).optional().nullable(),
            className: z.string().optional(),
        })),
        from: '@/components/ui/ui-builder/icon'
    },
};