"use client";

/**
 * Email builder utilities for UIBuilder consumers.
 *
 * Provides ready-to-use wiring for react-email page type support:
 *  - Canvas-safe substitutes for structural HTML elements
 *  - EmailCanvasRenderer — canvas renderer for email pages
 *  - generateEmailCode — JSX code generator
 *  - emailPageRenderer — PageTypeRenderer config (pass to UIBuilder)
 *  - emailCodeGenerator — PageTypeCodeGenerator config (pass to UIBuilder)
 *
 * UIBuilder itself has zero knowledge of @react-email. All email-specific
 * logic lives here.
 *
 * Usage:
 *   import { emailPageRenderer, emailCodeGenerator } from "@/lib/ui-builder/email/email-builder-utils";
 *   import { reactEmailComponentDefinitions } from "@/lib/ui-builder/registry/react-email-component-definitions";
 *
 *   <UIBuilder
 *     componentRegistry={reactEmailComponentDefinitions}
 *     pageTypeRenderers={{ email: emailPageRenderer }}
 *     pageTypeCodeGenerators={{ email: emailCodeGenerator }}
 *   />
 */

import React, { useMemo } from "react";
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import type {
  PageTypeRenderer,
  PageTypeCodeGenerator,
  PageTypeRendererProps,
  ComponentLayer,
  ComponentRegistry,
} from "@/components/ui/ui-builder/types";

// ---------------------------------------------------------------------------
// Canvas-safe substitutes for structural HTML elements.
//
// React-email components like <Html>, <Head>, <Body> render actual <html>,
// <head>, <body> DOM elements. When placed inside an iframe's content div
// those elements are either moved by the browser or rendered invisibly.
// For the editor canvas we swap them with div/null equivalents so the visual
// content appears correctly while click-to-select and drag-and-drop still work.
//
// The real @react-email components are preserved in the registry for code
// generation (generateEmailCode uses the original `from` paths and types).
// ---------------------------------------------------------------------------
export const NullComponent = () => null;
NullComponent.displayName = "NullComponent";

export const CanvasHtml = ({ children }: { children?: React.ReactNode }) => (
  <div data-email-html style={{ display: "contents" }}>{children}</div>
);
CanvasHtml.displayName = "CanvasHtml";

export const CanvasBody = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div data-email-body className={className} style={{ backgroundColor: "white", minHeight: "100%" }}>{children}</div>
);
CanvasBody.displayName = "CanvasBody";

// ---------------------------------------------------------------------------
// Email canvas renderer
//
// Uses a canvas-specific registry that replaces structural HTML elements
// (Html, Head, Preview) with safe div/null substitutes so they render
// correctly inside the AutoFrame iframe.
// ---------------------------------------------------------------------------
export function EmailCanvasRenderer({ page, componentRegistry, editorConfig }: PageTypeRendererProps) {
  const canvasRegistry: ComponentRegistry = useMemo(() => {
    const base = { ...componentRegistry };
    if (base.Html) base.Html = { ...base.Html, component: CanvasHtml };
    if (base.Head) base.Head = { ...base.Head, component: NullComponent };
    if (base.Preview) base.Preview = { ...base.Preview, component: NullComponent };
    if (base.Body) base.Body = { ...base.Body, component: CanvasBody };
    return base;
  }, [componentRegistry]);

  return (
    <LayerRenderer
      className="contents"
      page={page}
      componentRegistry={canvasRegistry}
      editorConfig={editorConfig}
    />
  );
}

// ---------------------------------------------------------------------------
// Email code generator
// Generates the JSX component + an example of how to call @react-email/render.
// This replaces the default "React" tab in the code panel for email pages.
// ---------------------------------------------------------------------------
export function generateEmailCode(page: ComponentLayer, registry: ComponentRegistry): string {
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
        if (typeof v === "string") return `${k}=${JSON.stringify(v)}`;
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
    "export async function renderEmailHtml() {",
    "  const html = await render(<EmailTemplate />);",
    "  return html;",
    "}",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// PageTypeRenderer config for email pages
// ---------------------------------------------------------------------------
export const emailPageRenderer: PageTypeRenderer = {
  label: "Email",
  defaultRootLayerType: "Html",
  defaultRootLayerProps: { lang: "en" },
  // skipAutoFrame is intentionally omitted so the canvas uses the AutoFrame
  // iframe (which provides style isolation and zoom/pan).
  // EmailCanvasRenderer swaps structural HTML elements with div substitutes
  // so the content renders visibly inside the iframe.
  filterRegistry: (registry) => registry,
  renderEditorCanvas: (props) => <EmailCanvasRenderer {...props} />,
};

// ---------------------------------------------------------------------------
// PageTypeCodeGenerator for email pages
// ---------------------------------------------------------------------------
export const emailCodeGenerator: PageTypeCodeGenerator = {
  label: "Email JSX",
  generateCode: generateEmailCode,
};
