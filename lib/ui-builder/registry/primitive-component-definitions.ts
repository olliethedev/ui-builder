import { ComponentRegistry } from '@/components/ui/ui-builder/types';
import { z } from 'zod';
import { childrenAsTextareaFieldOverrides, classNameFieldOverrides, commonFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";

export const primitiveComponentDefinitions: ComponentRegistry = {
  'a': {
    schema: z.object({
        className: z.string().optional(),
        children: z.any().optional(),
        href: z.string().optional(),
        target: z.enum(['_blank', '_self', '_parent', '_top']).optional().default('_self'),
        rel: z.enum(['noopener', 'noreferrer', 'nofollow']).optional(),
        title: z.string().optional(),
        download: z.boolean().optional().default(false),
    }),
        fieldOverrides: commonFieldOverrides()
  },
  'img': {
    schema: z.object({
        className: z.string().optional(),
        src: z.string().default("https://placehold.co/200"),
        alt: z.string().optional(),
        width: z.coerce.number().optional(),
        height: z.coerce.number().optional(),
    }),
    fieldOverrides: {
        className:(layer)=> classNameFieldOverrides(layer)
    }
  },
  'div': {
    schema: z.object({
        className: z.string().optional(),
        children: z.any().optional(),
    }),
    fieldOverrides: commonFieldOverrides()
  },
  'iframe': {
    schema: z.object({
        className: z.string().optional(),
        src: z.string().default("https://www.youtube.com/embed/dQw4w9WgXcQ?si=oc74qTYUBuCsOJwL"),
        title: z.string().optional(),
        width: z.coerce.number().optional(),
        height: z.coerce.number().optional(),
        frameBorder: z.number().optional(),
        allowFullScreen: z.boolean().optional(),
        allow: z.string().optional(),
        referrerPolicy: z.enum(['no-referrer', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin', 'unsafe-url']).optional(),
    }),
    fieldOverrides: {
        className:(layer)=> classNameFieldOverrides(layer)
    }
  },
  'span': {
    schema: z.object({
        className: z.string().optional(),
        children: z.string().optional(),
    }),
    fieldOverrides: {
        className:(layer)=> classNameFieldOverrides(layer),
        children: (layer)=> childrenAsTextareaFieldOverrides(layer)
    },
    defaultChildren: "Text"
  },
  'h1': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer)
    },
    defaultChildren: "Heading 1"
  },
  'h2': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer)
    },
    defaultChildren: "Heading 2"
  },
  'h3': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer)
    },
    defaultChildren: "Heading 3"
  },
  'p': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer)
    },
    defaultChildren: "Paragraph text"
  },
  'li': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer)
    },
    defaultChildren: "List item"
  },
  'ul': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: commonFieldOverrides()
  },
  'ol': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: commonFieldOverrides()
  }
};
