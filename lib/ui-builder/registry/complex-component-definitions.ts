import { ComponentRegistry } from "@/lib/ui-builder/registry/component-registry";
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flexbox } from '@/components/ui/ui-builder/flexbox';
import { Grid } from '@/components/ui/ui-builder/grid';
import { CodePanel } from '@/components/ui/ui-builder/code-panel';
import { Icon, iconNames } from "@/components/ui/ui-builder/icon";

export const complexComponentDefinitions: ComponentRegistry = {
    Button: {
        component: Button,
        schema: z.object({
            className: z.string().optional(),
            asChild: z.boolean().optional(),
            children: z.any().optional(),
            variant: z.enum([
                "default",
                "destructive",
                "outline",
                "secondary",
                "ghost",
                "link"
            ]).default("default"),
            size: z.enum([
                "default",
                "sm",
                "lg",
                "icon"
            ]).default("default"),

        }),
        from: '@/components/ui/button'
    },
    Badge: {
        component: Badge,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            variant: z.enum([
                'default',
                'secondary',
                'destructive',
                'outline']).default('default'),
        }),
        from: '@/components/ui/badge'
    },
    Flexbox: {
        component: Flexbox,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            direction: z.enum([
                "row",
                "column",
                "rowReverse",
                "columnReverse"
            ]).default("row"),
            justify: z.enum([
                "start",
                "end",
                "center",
                "between",
                "around",
                "evenly"
            ]).default("start"),
            align: z.enum([
                "start",
                "end",
                "center",
                "baseline",
                "stretch"
            ]).default("start"),
            wrap: z.enum([
                "wrap",
                "nowrap",
                "wrapReverse"
            ]).default("nowrap"),
            gap: z.enum([
                "0",
                "1",
                "2",
                "4",
                "8"
            ]).default("1")
        }),
        from: '@/components/ui/ui-builder/flexbox'
    },
    Grid: {
        component: Grid,
        schema: z.object({
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
            ]).default("1"),
            autoRows: z.enum([
                "none",
                "min",
                "max",
                "fr",
            ]).default("none"),
            justify: z.enum([
                "start",
                "end",
                "center",
                "between",
                "around",
                "evenly",
            ]).default("start"),
            align: z.enum([
                "start",
                "end",
                "center",
                "baseline",
                "stretch",
            ]).default("start"),
            templateRows: z.enum([
                "none",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
            ]).default("none"),
            gap: z.enum([
                "0",
                "1",
                "2",
                "4",
                "8",
            ]).default("0"),
        }),
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
        schema: z.object({
            iconName: z.enum([
                ...(iconNames)
            ]).default("Image"),
            size: z.enum([
                "small",
                "medium",
                "large"
            ]).default("medium"),
            color: z.enum([
                "accent",
                "accentForeground",
                "primary",
                "primaryForeground",
                "secondary",
                "secondaryForeground",
                "destructive",
                "destructiveForeground",
                "muted",
                "mutedForeground",
                "background",
                "foreground"
            ]).optional(),
            rotate: z.enum([
                "none",
                "90",
                "180",
                "270"
            ]).default("none"),
            className: z.string().optional(),
        }),
        from: '@/components/ui/ui-builder/icon'
    },
};