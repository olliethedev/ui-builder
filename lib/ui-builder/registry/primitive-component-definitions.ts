import { ComponentRegistry } from "@/lib/ui-builder/registry/component-registry";
import { z } from 'zod';

export const primitiveComponentDefinitions: ComponentRegistry = {
  'a': {
    schema: z.object({
        href: z.string().optional(),
        target: z.enum(['_blank', '_self', '_parent', '_top']).optional().default('_self'),
        rel: z.enum(['noopener', 'noreferrer', 'nofollow']).optional(),
        title: z.string().optional(),
        download: z.boolean().optional().default(false),
        children: z.any().optional(),
        className: z.string().optional(),
    }),
  },
  'img': {
    schema: z.object({
        src: z.string().default("https://placehold.co/200"),
        alt: z.string().optional(),
        width: z.coerce.number().optional(),
        height: z.coerce.number().optional(),
        className: z.string().optional(),
    }),
  },
  'div': {
    schema: z.object({
        children: z.any().optional(),
        className: z.string().optional(),
    }),
  },
  'iframe': {
    schema: z.object({
        src: z.string().default("https://www.youtube.com/embed/dQw4w9WgXcQ?si=oc74qTYUBuCsOJwL"),
        title: z.string().optional(),
        width: z.coerce.number().optional(),
        height: z.coerce.number().optional(),
        className: z.string().optional(),
        frameBorder: z.number().optional(),
        allowFullScreen: z.boolean().optional(),
        allow: z.string().optional(),
        referrerPolicy: z.enum(['no-referrer', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin', 'unsafe-url']).optional(),
    }),
  },
};
