import type { ComponentRegistry } from '@/components/ui/ui-builder/types';
import { z } from 'zod';
import { Flexbox } from '@/components/ui/ui-builder/components/flexbox';
import { Grid } from '@/components/ui/ui-builder/components/grid';
import { CodePanel } from '@/components/ui/ui-builder/components/code-panel';
import { Markdown } from "@/components/ui/ui-builder/components/markdown";
import { Icon, iconNames } from "@/components/ui/ui-builder/components/icon";
import { classNameFieldOverrides, iconNameFieldOverrides, commonFieldOverrides, childrenAsTipTapFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";

/**
 * Custom UI Builder component definitions.
 * These are components created specifically for the UI Builder,
 * separate from the standard shadcn/ui components.
 */
export const customComponentDefinitions: ComponentRegistry = {
    Flexbox: {
        component: Flexbox,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            direction: z
                .enum(["row", "column", "rowReverse", "columnReverse"])
                .default("row"),
            justify: z
                .enum(["start", "end", "center", "between", "around", "evenly"])
                .default("start"),
            align: z
                .enum(["start", "end", "center", "baseline", "stretch"])
                .default("start"),
            wrap: z.enum(["wrap", "nowrap", "wrapReverse"]).default("nowrap"),
            gap: z
              .preprocess(
                (val) => (typeof val === 'number' ? String(val) : val),
                z.enum(["0", "1", "2", "4", "8"]).default("1")
              )
              .transform(Number),
        }),
        from: "@/components/ui/ui-builder/flexbox",
        fieldOverrides: commonFieldOverrides()
    },
    Grid: {
        component: Grid,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            columns: z
                .enum(["auto", "1", "2", "3", "4", "5", "6", "7", "8"])
                .default("1"),
            autoRows: z.enum(["none", "min", "max", "fr"]).default("none"),
            justify: z
                .enum(["start", "end", "center", "between", "around", "evenly"])
                .default("start"),
            align: z
                .enum(["start", "end", "center", "baseline", "stretch"])
                .default("start"),
            templateRows: z
                .enum(["none", "1", "2", "3", "4", "5", "6"])
                .default("none")
                .transform(val => (val === "none" ? val : Number(val))),
            gap: z
              .preprocess(
                (val) => (typeof val === 'number' ? String(val) : val),
                z.enum(["0", "1", "2", "4", "8"]).default("0")
              )
              .transform(Number),
        }),
        from: "@/components/ui/ui-builder/grid",
        fieldOverrides: commonFieldOverrides()
    },
    CodePanel: {
        component: CodePanel,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/ui-builder/code-panel",
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer)
        }
    },
    Markdown: {
        component: Markdown,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/ui-builder/markdown",
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenAsTipTapFieldOverrides(layer)
        }
    },
    Icon: {
        component: Icon,
        schema: z.object({
            className: z.string().optional(),
            iconName: z.enum([...iconNames]).default("Image"),
            size: z.enum(["small", "medium", "large"]).default("medium"),
            color: z
                .enum([
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
                    "foreground",
                ])
                .optional(),
            rotate: z.enum(["none", "90", "180", "270"]).default("none"),
        }),
        from: "@/components/ui/ui-builder/icon",
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            iconName: (layer)=> iconNameFieldOverrides(layer)
        }
    },
};
