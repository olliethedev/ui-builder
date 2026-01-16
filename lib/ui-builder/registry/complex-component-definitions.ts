/**
 * Complex Component Definitions
 * 
 * This file provides the core component definitions for the UI Builder.
 * It includes custom UI Builder components plus essential shadcn components.
 * 
 * For the complete set of 54 shadcn components, import from:
 * - shadcnComponentDefinitions from './shadcn-component-definitions'
 * 
 * For blocks:
 * - blockDefinitions from './block-definitions'
 */

import { ComponentRegistry, ComponentLayer } from '@/components/ui/ui-builder/types';
import { z } from 'zod';
import { customComponentDefinitions } from './custom-component-definitions';

// Essential shadcn components for core UI Builder functionality
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { commonFieldOverrides, classNameFieldOverrides, childrenFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";

/**
 * Essential shadcn component definitions.
 * These are the minimum shadcn components needed for the UI Builder to function.
 * For all 54 shadcn components, use shadcnComponentDefinitions instead.
 */
const essentialShadcnComponents: ComponentRegistry = {
    Button: {
        component: Button,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
            variant: z
                .enum(["default", "destructive", "outline", "secondary", "ghost", "link"])
                .default("default"),
            size: z.enum(["default", "sm", "lg", "icon"]).default("default"),
        }),
        from: "@/components/ui/button",
        defaultChildren: [
            { id: "button-text", type: "span", name: "span", props: {}, children: "Button" } satisfies ComponentLayer,
        ],
        fieldOverrides: commonFieldOverrides()
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
            { id: "badge-text", type: "span", name: "span", props: {}, children: "Badge" } satisfies ComponentLayer,
        ],
        fieldOverrides: commonFieldOverrides()
    },
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
                props: { value: "item-1" },
                children: [
                    {
                        id: "acc-trigger-1",
                        type: "AccordionTrigger",
                        name: "AccordionTrigger",
                        props: {},
                        children: [
                            { id: "acc-trigger-1-text", type: "span", name: "span", props: {}, children: "Accordion Item #1" } satisfies ComponentLayer,
                        ],
                    },
                    {
                        id: "acc-content-1",
                        type: "AccordionContent",
                        name: "AccordionContent",
                        props: {},
                        children: [
                            { id: "acc-content-1-text", type: "span", name: "span", props: {}, children: "Accordion Content Text" } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
            {
                id: "acc-item-2",
                type: "AccordionItem",
                name: "AccordionItem",
                props: { value: "item-2" },
                children: [
                    {
                        id: "acc-trigger-2",
                        type: "AccordionTrigger",
                        name: "AccordionTrigger",
                        props: {},
                        children: [
                            { id: "acc-trigger-2-text", type: "span", name: "span", props: {}, children: "Accordion Item #2" } satisfies ComponentLayer,
                        ],
                    },
                    {
                        id: "acc-content-2",
                        type: "AccordionContent",
                        name: "AccordionContent",
                        props: {},
                        children: [
                            { id: "acc-content-2-text", type: "span", name: "span", props: {}, children: "Accordion Content Text" } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
        ],
        fieldOverrides: commonFieldOverrides()
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
                id: "acc-trigger-default",
                type: "AccordionTrigger",
                name: "AccordionTrigger",
                props: {},
                children: [
                    { id: "acc-trigger-default-text", type: "span", name: "span", props: {}, children: "Accordion Item" } satisfies ComponentLayer,
                ],
            },
            {
                id: "acc-content-default",
                type: "AccordionContent",
                name: "AccordionContent",
                props: {},
                children: [
                    { id: "acc-content-default-text", type: "span", name: "span", props: {}, children: "Accordion Content" } satisfies ComponentLayer,
                ],
            },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    AccordionTrigger: {
        component: AccordionTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/accordion",
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer),
            children: (layer) => childrenFieldOverrides(layer)
        }
    },
    AccordionContent: {
        component: AccordionContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/accordion",
        fieldOverrides: commonFieldOverrides()
    },
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
                            { id: "card-title-text", type: "span", name: "span", props: {}, children: "Card Title" } satisfies ComponentLayer,
                        ],
                    },
                    {
                        id: "card-description",
                        type: "CardDescription",
                        name: "CardDescription",
                        props: {},
                        children: [
                            { id: "card-description-text", type: "span", name: "span", props: {}, children: "Card Description" } satisfies ComponentLayer,
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
                    { id: "card-content-text", type: "span", name: "span", props: {}, children: "Card Content" } satisfies ComponentLayer,
                ],
            },
            {
                id: "card-footer",
                type: "CardFooter",
                name: "CardFooter",
                props: {},
                children: [
                    { id: "card-footer-text", type: "span", name: "span", props: {}, children: "Card Footer" } satisfies ComponentLayer,
                ],
            },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    CardHeader: {
        component: CardHeader,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        fieldOverrides: commonFieldOverrides()
    },
    CardFooter: {
        component: CardFooter,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        fieldOverrides: commonFieldOverrides()
    },
    CardTitle: {
        component: CardTitle,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        fieldOverrides: commonFieldOverrides()
    },
    CardDescription: {
        component: CardDescription,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        fieldOverrides: commonFieldOverrides()
    },
    CardContent: {
        component: CardContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        fieldOverrides: commonFieldOverrides()
    },
};

/**
 * Combined component definitions for the core UI Builder.
 * Includes custom UI Builder components + essential shadcn components.
 */
export const complexComponentDefinitions: ComponentRegistry = {
    ...customComponentDefinitions,
    ...essentialShadcnComponents,
};

// Re-export for convenience
export { customComponentDefinitions } from './custom-component-definitions';
