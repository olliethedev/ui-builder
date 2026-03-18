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
export { EmailTailwindThemePanel } from "@/lib/ui-builder/email/email-tailwind-theme-panel";
export {
  getEmailThemeColors,
  createEmailTailwindConfig,
  DEFAULT_EMAIL_TAILWIND_CONFIG,
} from "@/lib/ui-builder/email/email-theme-config";

/**
 * Canvas-safe substitutes for structural HTML elements.
 *
 * React-email components like Html, Head, Body render actual html/head/body DOM
 * elements. When placed inside an iframe's content div those elements are either
 * moved by the browser or rendered invisibly. For the editor canvas we swap them
 * with div/null equivalents so the visual content appears correctly while
 * click-to-select and drag-and-drop still work.
 *
 * The real @react-email components are preserved in the registry for code
 * generation (generateEmailCode uses the original `from` paths and types).
 */
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

/**
 * Canvas-safe substitute for the react-email Tailwind component.
 *
 * The real @react-email/tailwind Tailwind component uses `mapReactTree` to walk
 * the React tree and inline CSS styles by calling component functions directly.
 * In the UIBuilder canvas, components are wrapped in hook-using wrappers
 * (RenderLayer, ElementSelector, etc.) that break this direct-call approach.
 *
 * Instead, this canvas substitute injects the email theme colors as CSS custom
 * property overrides via a <style> tag. Because the AutoFrame iframe copies the
 * host page's Tailwind CSS (which uses `hsl(var(--primary))` etc.), overriding
 * the CSS custom properties is sufficient to reflect the email theme in the canvas.
 */

function asConfigRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function extractHslValues(hslString: string): string {
  // "hsl(221.2 83.2% 53.3%)" -> "221.2 83.2% 53.3%"
  const match = /^hsl\((.+)\)$/.exec(hslString);
  return match?.[1] ?? hslString;
}

// All shadcn/ui theme color keys that map to CSS custom properties.
const THEME_COLOR_KEYS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
] as const;

function generateCanvasThemeCss(config: Record<string, unknown>): string {
  const theme = asConfigRecord(config.theme);
  const extend = asConfigRecord(theme.extend);
  const colors = asConfigRecord(extend.colors);
  const borderRadius = asConfigRecord(extend.borderRadius);

  const cssVars: string[] = [];

  for (const colorKey of THEME_COLOR_KEYS) {
    const colorValue = colors[colorKey];
    if (typeof colorValue === "string") {
      const hslValues = extractHslValues(colorValue);
      // --primary: 221.2 83.2% 53.3%  (for hsl(var(--primary)) pattern)
      cssVars.push(`--${colorKey}: ${hslValues};`);
      // --color-primary: hsl(221.2 83.2% 53.3%)  (for Tailwind v4 var(--color-*) pattern)
      // AutoFrame copies pre-computed --color-* values as inline styles on <html>/<body>,
      // so we must explicitly override them here for all descendant elements.
      cssVars.push(`--color-${colorKey}: ${colorValue};`);
    }
  }

  // Border radius: override both --radius (base) and the Tailwind v4 --radius-* tokens
  // that AutoFrame copies as pre-computed inline styles.
  const radiusLg = borderRadius.lg;
  if (typeof radiusLg === "string") {
    cssVars.push(`--radius: ${radiusLg};`);
    cssVars.push(`--radius-lg: ${radiusLg};`);
    if (typeof borderRadius.md === "string") {
      cssVars.push(`--radius-md: ${borderRadius.md};`);
    }
    if (typeof borderRadius.sm === "string") {
      cssVars.push(`--radius-sm: ${borderRadius.sm};`);
    }
  }

  if (cssVars.length === 0) return "";

  return `*,::before,::after,::backdrop {\n  ${cssVars.join("\n  ")}\n}`;
}

export const CanvasTailwind = ({
  children,
  config,
}: {
  children?: React.ReactNode;
  config?: Record<string, unknown>;
}) => {
  const cssOverrides = config ? generateCanvasThemeCss(config) : "";
  return (
    <>
      {cssOverrides && (
        <style dangerouslySetInnerHTML={{ __html: cssOverrides }} />
      )}
      {children}
    </>
  );
};
CanvasTailwind.displayName = "CanvasTailwind";

/**
 * Email canvas renderer.
 * Uses a canvas-specific registry that replaces structural HTML elements
 * (Html, Head, Preview) with safe div/null substitutes so they render
 * correctly inside the AutoFrame iframe.
 */
export function EmailCanvasRenderer({
  page,
  componentRegistry,
  editorConfig,
  variables,
  variableValues,
  functionRegistry,
}: PageTypeRendererProps) {
  const canvasRegistry: ComponentRegistry = useMemo(() => {
    const base = { ...componentRegistry };
    if (base.Html) base.Html = { ...base.Html, component: CanvasHtml };
    if (base.Head) base.Head = { ...base.Head, component: NullComponent };
    if (base.Preview) base.Preview = { ...base.Preview, component: NullComponent };
    if (base.Body) base.Body = { ...base.Body, component: CanvasBody };
    // Replace the @react-email Tailwind component with a canvas-safe substitute.
    // The real Tailwind component uses mapReactTree to inline styles by calling
    // component functions directly — this breaks when those components use hooks.
    // CanvasTailwind instead injects theme colors as CSS custom property overrides.
    if (base.Tailwind) base.Tailwind = { ...base.Tailwind, component: CanvasTailwind };
    return base;
  }, [componentRegistry]);

  return (
    <LayerRenderer
      className="contents"
      page={page}
      componentRegistry={canvasRegistry}
      editorConfig={editorConfig}
      variables={variables}
      variableValues={variableValues}
      functionRegistry={functionRegistry}
    />
  );
}

/**
 * Email code generator.
 * Generates the JSX component + an example of how to call @react-email/render.
 * This replaces the default "React" tab in the code panel for email pages.
 */
export function generateEmailCode(page: ComponentLayer, registry: ComponentRegistry): string {
  // Map from module path -> set of named exports to import from that module.
  const namedImports = new Map<string, Set<string>>();
  namedImports.set("@react-email/render", new Set(["render"]));

  const collectImports = (layer: ComponentLayer) => {
    const def = registry[layer.type];
    if (def?.from) {
      if (!namedImports.has(def.from)) {
        namedImports.set(def.from, new Set());
      }
      namedImports.get(def.from)!.add(layer.type);
    }
    if (Array.isArray(layer.children)) {
      layer.children.forEach(collectImports);
    }
  };
  collectImports(page);

  const imports = Array.from(namedImports.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mod, names]) => `import { ${Array.from(names).sort().join(", ")} } from "${mod}";`);

  const renderLayer = (layer: ComponentLayer, indent = 0): string => {
    const pad = "  ".repeat(indent);
    const propsStr = Object.entries(layer.props)
      // `children` is rendered from `layer.children` to avoid duplicate/conflicting output.
      .filter(([k, v]) => k !== "children" && v !== undefined && v !== null && v !== "")
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
      return `${pad}<${layer.type}${propsStr ? " " + propsStr : ""}>{${JSON.stringify(layer.children)}}</${layer.type}>`;
    }
    return `${pad}<${layer.type}${propsStr ? " " + propsStr : ""} />`;
  };

  const jsx = renderLayer(page, 1);

  return [
    imports.join("\n"),
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

/** PageTypeRenderer config for email pages. */
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

/** PageTypeCodeGenerator for email pages. */
export const emailCodeGenerator: PageTypeCodeGenerator = {
  label: "Email JSX",
  generateCode: generateEmailCode,
};
