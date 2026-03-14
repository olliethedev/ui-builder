"use client";

/**
 * Example: Email Builder wired up with react-email page type support.
 *
 * This file demonstrates how to configure UIBuilder as a consumer — UIBuilder
 * itself has zero knowledge of @react-email. All email-specific logic lives here.
 *
 * The key extension points used:
 *  - pageTypeRenderers  → controls canvas rendering & component filtering per page type
 *  - pageTypeCodeGenerators → replaces the React code tab with the actual rendered HTML
 */

import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { reactEmailComponentDefinitions } from "@/lib/ui-builder/registry/react-email-component-definitions";
import type {
  PageTypeRenderer,
  PageTypeCodeGenerator,
  PageTypeRendererProps,
  ComponentLayer,
  ComponentRegistry,
} from "@/components/ui/ui-builder/types";

// ---------------------------------------------------------------------------
// Email canvas renderer
// Email components render fine in a browser, so we reuse <LayerRenderer>
// unchanged — this gives click-to-select and drag-and-drop for free.
// ---------------------------------------------------------------------------
function EmailCanvasRenderer({ page, componentRegistry, editorConfig }: PageTypeRendererProps) {
  return (
    <LayerRenderer
      className="contents"
      page={page}
      componentRegistry={componentRegistry}
      editorConfig={editorConfig}
    />
  );
}

// ---------------------------------------------------------------------------
// Email code generator
// Generates the JSX component + an example of how to call @react-email/render.
// This replaces the default "React" tab in the code panel for email pages.
// ---------------------------------------------------------------------------
function generateEmailCode(page: ComponentLayer, registry: ComponentRegistry): string {
  const imports = new Set<string>();
  imports.add('import { render } from "@react-email/render";');

  const collectImports = (layer: ComponentLayer) => {
    const def = registry[layer.type];
    if (def?.from) {
      imports.add(`import { ${layer.type} } from "${def.from}";`);
    }
    if (Array.isArray(layer.children)) {
      layer.children.forEach(collectImports);
    }
  };
  collectImports(page);

  const renderLayer = (layer: ComponentLayer, indent = 0): string => {
    const pad = "  ".repeat(indent);
    const propsStr = Object.entries(layer.props)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => {
        if (typeof v === "string") return `${k}="${v}"`;
        return `${k}={${JSON.stringify(v)}}`;
      })
      .join(" ");

    if (Array.isArray(layer.children) && layer.children.length > 0) {
      const childrenStr = layer.children
        .map((child) => renderLayer(child, indent + 1))
        .join("\n");
      return `${pad}<${layer.type}${propsStr ? " " + propsStr : ""}>\n${childrenStr}\n${pad}</${layer.type}>`;
    } else if (typeof layer.children === "string" && layer.children) {
      return `${pad}<${layer.type}${propsStr ? " " + propsStr : ""}>${layer.children}</${layer.type}>`;
    }
    return `${pad}<${layer.type}${propsStr ? " " + propsStr : ""} />`;
  };

  const jsx = renderLayer(page, 1);

  return [
    Array.from(imports).sort().join("\n"),
    "",
    "// Email template component",
    "export function EmailTemplate() {",
    "  return (",
    jsx,
    "  );",
    "}",
    "",
    "// Generate HTML string (use in your email sending service)",
    "// const html = await render(<EmailTemplate />);",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// PageTypeRenderer config for email pages
// ---------------------------------------------------------------------------
const emailPageRenderer: PageTypeRenderer = {
  label: "Email",
  defaultRootLayerType: "Html",
  defaultRootLayerProps: { lang: "en" },
  // skipAutoFrame intentionally omitted — email components render fine in the
  // AutoFrame iframe, preserving click-to-select and drag-and-drop.
  filterRegistry: (registry) => registry,
  renderEditorCanvas: (props) => <EmailCanvasRenderer {...props} />,
};

// ---------------------------------------------------------------------------
// PageTypeCodeGenerator for email pages
// ---------------------------------------------------------------------------
const emailCodeGenerator: PageTypeCodeGenerator = {
  label: "Email JSX",
  generateCode: generateEmailCode,
};

// ---------------------------------------------------------------------------
// Initial layers — start with a minimal email structure
// ---------------------------------------------------------------------------
const initialLayers: ComponentLayer[] = [
  {
    id: "email-page-1",
    type: "Html",
    name: "Email 1",
    pageType: "email",
    props: { lang: "en" },
    children: [
      {
        id: "email-head-1",
        type: "Head",
        name: "Head",
        props: {},
        children: [],
      },
      {
        id: "email-preview-1",
        type: "Preview",
        name: "Preview",
        props: {},
        children: "Welcome to our email",
      },
      {
        id: "email-body-1",
        type: "Body",
        name: "Body",
        props: { className: "bg-white font-sans" },
        children: [
          {
            id: "email-container-1",
            type: "Container",
            name: "Container",
            props: { className: "max-w-2xl mx-auto p-6" },
            children: [
              {
                id: "email-text-1",
                type: "Text",
                name: "Heading",
                props: { className: "text-2xl font-bold text-gray-900" },
                children: "Hello from UIBuilder Email!",
              },
              {
                id: "email-text-2",
                type: "Text",
                name: "Body Text",
                props: { className: "text-base text-gray-600" },
                children: "Edit this email template using the UIBuilder editor.",
              },
              {
                id: "email-button-1",
                type: "Button",
                name: "CTA Button",
                props: {
                  href: "https://example.com",
                  className: "bg-blue-600 text-white px-6 py-3 rounded font-semibold",
                },
                children: "Get Started",
              },
            ],
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// EmailBuilder component
// ---------------------------------------------------------------------------
export function EmailBuilder() {
  return (
    <UIBuilder
      initialLayers={initialLayers}
      persistLayerStore={false}
      componentRegistry={reactEmailComponentDefinitions}
      pageTypeRenderers={{ email: emailPageRenderer }}
      pageTypeCodeGenerators={{ email: emailCodeGenerator }}
      allowPagesCreation
      allowPagesDeletion
    />
  );
}
