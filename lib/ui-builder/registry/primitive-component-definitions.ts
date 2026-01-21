import type { ComponentRegistry } from '@/components/ui/ui-builder/types';
import { z } from 'zod';
import { childrenAsTextareaFieldOverrides, classNameFieldOverrides, commonFieldOverrides, functionPropFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";

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
        onClick: z.any().optional(),
    }),
    fieldOverrides: {
        ...commonFieldOverrides(),
        onClick: () => functionPropFieldOverrides('onClick'),
    }
  },
  'button': {
    schema: z.object({
        className: z.string().optional(),
        children: z.any().optional(),
        type: z.enum(['button', 'submit', 'reset']).optional().default('button'),
        disabled: z.boolean().optional().default(false),
        onClick: z.any().optional(),
    }),
    fieldOverrides: {
        ...commonFieldOverrides(),
        onClick: () => functionPropFieldOverrides('onClick'),
    },
    defaultChildren: "Button"
  },
  'form': {
    schema: z.object({
        className: z.string().optional(),
        children: z.any().optional(),
        action: z.string().optional(),
        method: z.enum(['get', 'post']).optional(),
        onSubmit: z.any().optional(),
    }),
    fieldOverrides: {
        ...commonFieldOverrides(),
        onSubmit: () => functionPropFieldOverrides('onSubmit'),
    }
  },
  'input': {
    schema: z.object({
        className: z.string().optional(),
        type: z.enum(['text', 'password', 'email', 'number', 'tel', 'url', 'search', 'date', 'time', 'hidden']).optional().default('text'),
        name: z.string().optional(),
        placeholder: z.string().optional(),
        defaultValue: z.string().optional(),
        disabled: z.boolean().optional().default(false),
        required: z.boolean().optional().default(false),
        onChange: z.any().optional(),
        onBlur: z.any().optional(),
        onFocus: z.any().optional(),
    }),
    fieldOverrides: {
        className: (layer) => classNameFieldOverrides(layer),
        onChange: () => functionPropFieldOverrides('onChange'),
        onBlur: () => functionPropFieldOverrides('onBlur'),
        onFocus: () => functionPropFieldOverrides('onFocus'),
    }
  },
  'textarea': {
    schema: z.object({
        className: z.string().optional(),
        name: z.string().optional(),
        placeholder: z.string().optional(),
        defaultValue: z.string().optional(),
        rows: z.coerce.number().optional(),
        disabled: z.boolean().optional().default(false),
        required: z.boolean().optional().default(false),
        onChange: z.any().optional(),
        onBlur: z.any().optional(),
        onFocus: z.any().optional(),
    }),
    fieldOverrides: {
        className: (layer) => classNameFieldOverrides(layer),
        onChange: () => functionPropFieldOverrides('onChange'),
        onBlur: () => functionPropFieldOverrides('onBlur'),
        onFocus: () => functionPropFieldOverrides('onFocus'),
    }
  },
  'select': {
    schema: z.object({
        className: z.string().optional(),
        children: z.any().optional(),
        name: z.string().optional(),
        defaultValue: z.string().optional(),
        disabled: z.boolean().optional().default(false),
        required: z.boolean().optional().default(false),
        onChange: z.any().optional(),
    }),
    fieldOverrides: {
        ...commonFieldOverrides(),
        onChange: () => functionPropFieldOverrides('onChange'),
    }
  },
  'label': {
    schema: z.object({
        className: z.string().optional(),
        children: z.any().optional(),
        htmlFor: z.string().optional(),
        onClick: z.any().optional(),
    }),
    fieldOverrides: {
        ...commonFieldOverrides(),
        onClick: () => functionPropFieldOverrides('onClick'),
    }
  },
  'img': {
    schema: z.object({
        className: z.string().optional(),
        src: z.string().default("https://placehold.co/200"),
        alt: z.string().optional(),
        width: z.coerce.number().optional(),
        height: z.coerce.number().optional(),
        onClick: z.any().optional(),
    }),
    fieldOverrides: {
        className:(layer)=> classNameFieldOverrides(layer),
        onClick: () => functionPropFieldOverrides('onClick'),
    }
  },
  'div': {
    schema: z.object({
        className: z.string().optional(),
        children: z.any().optional(),
        onClick: z.any().optional(),
    }),
    fieldOverrides: {
        ...commonFieldOverrides(),
        onClick: () => functionPropFieldOverrides('onClick'),
    }
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
        onClick: z.any().optional(),
    }),
    fieldOverrides: {
        className:(layer)=> classNameFieldOverrides(layer),
        children: (layer)=> childrenAsTextareaFieldOverrides(layer),
        onClick: () => functionPropFieldOverrides('onClick'),
    },
    defaultChildren: "Text"
  },
  'h1': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
      onClick: z.any().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer),
      onClick: () => functionPropFieldOverrides('onClick'),
    },
    defaultChildren: "Heading 1"
  },
  'h2': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
      onClick: z.any().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer),
      onClick: () => functionPropFieldOverrides('onClick'),
    },
    defaultChildren: "Heading 2"
  },
  'h3': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
      onClick: z.any().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer),
      onClick: () => functionPropFieldOverrides('onClick'),
    },
    defaultChildren: "Heading 3"
  },
  'p': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
      onClick: z.any().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer),
      onClick: () => functionPropFieldOverrides('onClick'),
    },
    defaultChildren: "Paragraph text"
  },
  'li': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
      onClick: z.any().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer),
      onClick: () => functionPropFieldOverrides('onClick'),
    },
    defaultChildren: "List item"
  },
  'ul': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
      onClick: z.any().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      onClick: () => functionPropFieldOverrides('onClick'),
    }
  },
  'ol': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
      onClick: z.any().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      onClick: () => functionPropFieldOverrides('onClick'),
    }
  }
};
