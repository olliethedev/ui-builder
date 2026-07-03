/**
 * React Email component registry definitions for UIBuilder.
 *
 * Install via shadcn CLI:
 *   npx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/react-email-components-registry.json
 *
 * Usage:
 *   import { reactEmailComponentDefinitions } from "@/lib/ui-builder/registry/react-email-component-definitions";
 *
 *   <UIBuilder
 *     componentRegistry={{ ...reactEmailComponentDefinitions }}
 *     pageTypeRenderers={{ email: emailPageRenderer }}
 *     pageTypeCodeGenerators={{ email: emailCodeGenerator }}
 *   />
 *
 * Tailwind note: React email supports a subset of Tailwind via the <Tailwind> wrapper.
 * Unsupported utilities include: prose (@tailwindcss/typography), space-*, hover: pseudo-class.
 * Media queries work but are only applied in supporting clients.
 * See https://www.caniemail.com for client support details.
 */

import {
  Html,
  Head,
  Body,
  Preview,
  Container,
  Section,
  Row,
  Column,
  Text,
  Button,
  Link,
  Img,
  Hr,
  Tailwind,
} from "@react-email/components";
import { z } from "zod";
import type { ComponentRegistry } from "@/components/ui/ui-builder/types";
import {
  emailClassNameFieldOverrides,
  childrenFieldOverrides,
  childrenAsTextareaFieldOverrides,
} from "@/lib/ui-builder/registry/form-field-overrides";

// ---------------------------------------------------------------------------
// Shared style schema — accepts a plain string (inline style shorthand) or
// an object. We use z.record for the props panel to treat it as freeform JSON.
// ---------------------------------------------------------------------------
const styleSchema = z.record(z.string(), z.any()).optional();

// ---------------------------------------------------------------------------
// Html — root element
// ---------------------------------------------------------------------------
const htmlSchema = z.object({
  lang: z.string().optional().default("en"),
  dir: z.enum(["ltr", "rtl", "auto"]).optional().default("ltr"),
  className: z.string().optional(),
  style: styleSchema,
  children: z.any().optional(),
});

// ---------------------------------------------------------------------------
// Head — email head (contains meta, Font, style tags)
// ---------------------------------------------------------------------------
const headSchema = z.object({});

// ---------------------------------------------------------------------------
// Body — email body
// ---------------------------------------------------------------------------
const bodySchema = z.object({
  className: z.string().optional(),
  style: styleSchema,
  children: z.any().optional(),
});

// ---------------------------------------------------------------------------
// Preview — inbox preview text (hidden, string-only children)
// ---------------------------------------------------------------------------
const previewSchema = z.object({
  children: z.string().optional().default("Email preview text"),
});

// ---------------------------------------------------------------------------
// Tailwind — Tailwind CSS wrapper for email
// Note: wraps email body content; config accepts a Tailwind theme config object
// ---------------------------------------------------------------------------
const tailwindSchema = z.object({
  config: z
    .record(z.string(), z.any())
    .optional()
    .describe(
      "Tailwind config object (without 'content'). Supports theme, plugins, darkMode, etc."
    ),
  children: z.any().optional(),
});

// ---------------------------------------------------------------------------
// Container — centered max-width container (renders as <table>)
// ---------------------------------------------------------------------------
const containerSchema = z.object({
  className: z.string().optional(),
  style: styleSchema,
  children: z.any().optional(),
});

// ---------------------------------------------------------------------------
// Section — semantic content section (renders as <table>)
// ---------------------------------------------------------------------------
const sectionSchema = z.object({
  className: z.string().optional(),
  style: styleSchema,
  children: z.any().optional(),
});

// ---------------------------------------------------------------------------
// Row — table row layout container (renders as <table>); children must be <Column>
// ---------------------------------------------------------------------------
const rowSchema = z.object({
  className: z.string().optional(),
  style: styleSchema,
  children: z.any().optional(),
});

// ---------------------------------------------------------------------------
// Column — table cell (renders as <td>); must be inside <Row>
// ---------------------------------------------------------------------------
const columnSchema = z.object({
  className: z.string().optional(),
  style: styleSchema,
  colSpan: z.number().optional(),
  width: z.union([z.string(), z.number()]).optional(),
  children: z.any().optional(),
});

// ---------------------------------------------------------------------------
// Text — paragraph (renders as <p>)
// ---------------------------------------------------------------------------
const textSchema = z.object({
  className: z.string().optional(),
  style: styleSchema,
  children: z.string().optional().default("Text content"),
});

// ---------------------------------------------------------------------------
// Button — CTA link-button (renders as <a> with Outlook VML padding)
// ---------------------------------------------------------------------------
const buttonSchema = z.object({
  href: z.string().optional().default("https://example.com"),
  target: z.string().optional().default("_blank"),
  className: z.string().optional(),
  style: styleSchema,
  children: z.string().optional().default("Click me"),
});

// ---------------------------------------------------------------------------
// Link — plain anchor link
// ---------------------------------------------------------------------------
const linkSchema = z.object({
  href: z.string().optional().default("https://example.com"),
  target: z.string().optional().default("_blank"),
  className: z.string().optional(),
  style: styleSchema,
  children: z.string().optional().default("Click here"),
});

// ---------------------------------------------------------------------------
// Img — email-safe image (component is named Img, not Image)
// ---------------------------------------------------------------------------
const imgSchema = z.object({
  src: z.string().optional().default("https://placehold.co/600x200"),
  alt: z.string().optional().default(""),
  width: z.union([z.string(), z.number()]).optional(),
  height: z.union([z.string(), z.number()]).optional(),
  className: z.string().optional(),
  style: styleSchema,
});

// ---------------------------------------------------------------------------
// Hr — horizontal rule divider
// ---------------------------------------------------------------------------
const hrSchema = z.object({
  className: z.string().optional(),
  style: styleSchema,
});

// ---------------------------------------------------------------------------
// Registry export
// ---------------------------------------------------------------------------
export const reactEmailComponentDefinitions: ComponentRegistry = {
  Html: {
    component: Html,
    schema: htmlSchema,
    from: "@react-email/components",
    skipEditorWrapper: true,
    defaultChildren: [],
    fieldOverrides: {
      className: emailClassNameFieldOverrides,
      children: childrenFieldOverrides,
    },
  },

  Head: {
    component: Head,
    schema: headSchema,
    from: "@react-email/components",
    skipEditorWrapper: true,
    childOf: ["Html"],
    defaultChildren: [],
  },

  Body: {
    component: Body,
    schema: bodySchema,
    from: "@react-email/components",
    skipEditorWrapper: true,
    childOf: ["Html", "Tailwind"],
    defaultChildren: [],
    fieldOverrides: {
      className: emailClassNameFieldOverrides,
      children: childrenFieldOverrides,
    },
  },

  Preview: {
    component: Preview,
    schema: previewSchema,
    from: "@react-email/components",
    skipEditorWrapper: true,
    childOf: ["Html"],
    defaultChildren: "Email preview text",
    fieldOverrides: {
      children: childrenAsTextareaFieldOverrides,
    },
  },

  Tailwind: {
    component: Tailwind,
    schema: tailwindSchema,
    from: "@react-email/components",
    childOf: ["Html"],
    defaultChildren: [],
    fieldOverrides: {
      children: childrenFieldOverrides,
    },
  },

  Container: {
    component: Container,
    schema: containerSchema,
    from: "@react-email/components",
    defaultChildren: [],
    fieldOverrides: {
      className: emailClassNameFieldOverrides,
      children: childrenFieldOverrides,
    },
  },

  Section: {
    component: Section,
    schema: sectionSchema,
    from: "@react-email/components",
    defaultChildren: [],
    fieldOverrides: {
      className: emailClassNameFieldOverrides,
      children: childrenFieldOverrides,
    },
  },

  Row: {
    component: Row,
    schema: rowSchema,
    from: "@react-email/components",
    childOf: ["Section", "Container", "Column", "Body"],
    defaultChildren: [],
    fieldOverrides: {
      className: emailClassNameFieldOverrides,
      children: childrenFieldOverrides,
    },
  },

  Column: {
    component: Column,
    schema: columnSchema,
    from: "@react-email/components",
    childOf: ["Row"],
    defaultChildren: [],
    fieldOverrides: {
      className: emailClassNameFieldOverrides,
      children: childrenFieldOverrides,
    },
  },

  Text: {
    component: Text,
    schema: textSchema,
    from: "@react-email/components",
    defaultChildren: "Text content",
    fieldOverrides: {
      className: emailClassNameFieldOverrides,
      children: childrenAsTextareaFieldOverrides,
    },
  },

  Button: {
    component: Button,
    schema: buttonSchema,
    from: "@react-email/components",
    defaultChildren: "Click me",
    fieldOverrides: {
      className: emailClassNameFieldOverrides,
      children: childrenAsTextareaFieldOverrides,
    },
  },

  Link: {
    component: Link,
    schema: linkSchema,
    from: "@react-email/components",
    defaultChildren: "Click here",
    fieldOverrides: {
      className: emailClassNameFieldOverrides,
      children: childrenAsTextareaFieldOverrides,
    },
  },

  Img: {
    component: Img,
    schema: imgSchema,
    from: "@react-email/components",
    fieldOverrides: {
      className: emailClassNameFieldOverrides,
    },
  },

  Hr: {
    component: Hr,
    schema: hrSchema,
    from: "@react-email/components",
    fieldOverrides: {
      className: emailClassNameFieldOverrides,
    },
  },
};
