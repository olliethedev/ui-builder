import { ComponentRegistry } from "@/lib/ui-builder/registry/component-registry";
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flexbox } from '@/components/ui/ui-builder/flexbox';
import { Grid } from '@/components/ui/ui-builder/grid';
import { CodePanel } from '@/components/ui/ui-builder/code-panel';
import { Markdown } from "@/components/ui/ui-builder/markdown";
import { Icon, iconNames } from "@/components/ui/ui-builder/icon";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { classNameFieldOverrides, childrenFieldOverrides, iconNameFieldOverrides, childrenAsTextareaFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";
import { ComponentLayer } from "@/lib/ui-builder/store/layer-store";

export const complexComponentDefinitions: ComponentRegistry = {
    Button: {
        component: Button,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
            variant: z
                .enum([
                    "default",
                    "destructive",
                    "outline",
                    "secondary",
                    "ghost",
                    "link",
                ])
                .default("default"),
            size: z.enum(["default", "sm", "lg", "icon"]).default("default"),
        }),
        from: "@/components/ui/button",
        defaultChildren: [
            {
                id: "button-text",
                type: "span",
                name: "span",
                props: {},
                children: "Button",
            } satisfies ComponentLayer,
        ],
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
    },
    Badge: {
        component: Badge,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            variant: z
                .enum(["default", "secondary", "destructive", "outline"])
                .default("default"),
        }),
        from: "@/components/ui/badge",
        defaultChildren: [
            {
                id: "badge-text",
                type: "span",
                name: "span",
                props: {},
                children: "Badge",
            } satisfies ComponentLayer,
        ],
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
    },
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
            gap: z.enum(["0", "1", "2", "4", "8"]).default("1"),
        }),
        from: "@/components/ui/ui-builder/flexbox",
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
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
                .default("none"),
            gap: z.enum(["0", "1", "2", "4", "8"]).default("0"),
        }),
        from: "@/components/ui/ui-builder/grid",
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
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
            children: (layer)=> childrenAsTextareaFieldOverrides(layer)
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

    //Accordion
    Accordion: {
        component: Accordion,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            type: z.enum(["single", "multiple"]).default("single"),
            collapsible: z.boolean().optional(),
        }),
        from: "@/components/ui/accordion",
        defaultChildren: [
            {
                id: "acc-item-1",
                type: "AccordionItem",
                name: "AccordionItem",
                props: {
                    value: "item-1",
                },
                children: [
                    {
                        id: "acc-trigger-1",
                        type: "AccordionTrigger",
                        name: "AccordionTrigger",
                        props: {},
                        children: [
                            {
                                id: "WEz8Yku",
                                type: "span",
                                name: "span",
                                props: {},
                                children: "Accordion Item #1",
                            } satisfies ComponentLayer,
                        ],
                    },
                    {
                        id: "acc-content-1",
                        type: "AccordionContent",
                        name: "AccordionContent",
                        props: {},
                        children: [
                            {
                                id: "acc-content-1-text-1",
                                type: "span",
                                name: "span",
                                props: {},
                                children: "Accordion Content Text",
                            } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
            {
                id: "acc-item-2",
                type: "AccordionItem",
                name: "AccordionItem",
                props: {
                    value: "item-2",
                },
                children: [
                    {
                        id: "acc-trigger-2",
                        type: "AccordionTrigger",
                        name: "AccordionTrigger",
                        props: {},
                        children: [
                            {
                                id: "acc-trigger-2-text-1",
                                type: "span",
                                name: "span",
                                props: {},
                                children: "Accordion Item #2",
                            } satisfies ComponentLayer,
                        ],
                    },
                    {
                        id: "acc-content-2",
                        type: "AccordionContent",
                        name: "AccordionContent (Copy)",
                        props: {},
                        children: [
                            {
                                id: "acc-content-2-text-1",
                                type: "span",
                                name: "span",
                                props: {},
                                children: "Accordion Content Text",
                            } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
        ],
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
    },
    AccordionItem: {
        component: AccordionItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            value: z.string(),
        }),
        from: "@/components/ui/accordion",
        defaultChildren: [
            {
                id: "acc-trigger-1",
                type: "AccordionTrigger",
                name: "AccordionTrigger",
                props: {},
                children: [
                    {
                        id: "WEz8Yku",
                        type: "span",
                        name: "span",
                        props: {},
                        children: "Accordion Item #1",
                    } satisfies ComponentLayer,
                ],
            },
            {
                id: "acc-content-1",
                type: "AccordionContent",
                name: "AccordionContent",
                props: {},
                children: [
                    {
                        id: "acc-content-1-text-1",
                        type: "span",
                        name: "span",
                        props: {},
                        children: "Accordion Content Text",
                    } satisfies ComponentLayer,
                ],
            },
        ],
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
    },
    AccordionTrigger: {
        component: AccordionTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/accordion",
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
    },
    AccordionContent: {
        component: AccordionContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/accordion",
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
    },

    //Card
    Card: {
        component: Card,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        defaultChildren: [
            {
                id: "card-header",
                type: "CardHeader",
                name: "CardHeader",
                props: {},
                children: [
                    {
                        id: "card-title",
                        type: "CardTitle",
                        name: "CardTitle",
                        props: {},
                        children: [
                            {
                                id: "card-title-text",
                                type: "span",
                                name: "span",
                                props: {},
                                children: "Card Title",
                            } satisfies ComponentLayer,
                        ],
                    },
                    {
                        id: "card-description",
                        type: "CardDescription",
                        name: "CardDescription",
                        props: {},
                        children: [
                            {
                                id: "card-description-text",
                                type: "span",
                                name: "span",
                                props: {},
                                children: "Card Description",
                            } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
            {
                id: "card-content",
                type: "CardContent",
                name: "CardContent",
                props: {},
                children: [
                    {
                        id: "card-content-paragraph",
                        type: "span",
                        name: "span",
                        props: {},
                        children: "Card Content",
                    } satisfies ComponentLayer,
                ],
            },
            {
                id: "card-footer",
                type: "CardFooter",
                name: "CardFooter",
                props: {},
                children: [
                    {
                        id: "card-footer-paragraph",
                        type: "span",
                        name: "span",
                        props: {},
                        children: "Card Footer",
                    } satisfies ComponentLayer,
                ],
            },
        ],
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
    },
    CardHeader: {
        component: CardHeader,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
    },
    CardFooter: {
        component: CardFooter,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
    },
    CardTitle: {
        component: CardTitle,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
    },
    CardDescription: {
        component: CardDescription,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
    },
    CardContent: {
        component: CardContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        fieldOverrides: {
            className:(layer)=> classNameFieldOverrides(layer),
            children: (layer)=> childrenFieldOverrides(layer)
        }
    },
};