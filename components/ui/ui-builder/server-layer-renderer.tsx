import React from "react";

import { isPrimitiveComponent } from "@/lib/ui-builder/store/editor-utils";
import { hasLayerChildren } from "@/lib/ui-builder/store/layer-utils";
import type { ComponentRegistry, ComponentLayer, Variable, PropValue } from '@/components/ui/ui-builder/types';
import { isVariableReference } from '@/components/ui/ui-builder/types';
import { resolveVariableReferences, resolveChildrenVariableReference } from "@/lib/ui-builder/utils/variable-resolver";

export interface ServerLayerRendererProps<TRegistry extends ComponentRegistry = ComponentRegistry> {
  /** Optional CSS class for the root container */
  className?: string;
  /** The ComponentLayer tree to render */
  page: ComponentLayer;
  /** Registry mapping component types to their definitions */
  componentRegistry: TRegistry;
  /** Optional variable definitions */
  variables?: Variable[];
  /** Optional variable values to override defaults */
  variableValues?: Record<string, PropValue>;
}

/**
 * ServerLayerRenderer - An SSR-friendly renderer for UI Builder pages.
 * 
 * This component renders ComponentLayer trees without any client-side dependencies,
 * making it suitable for use in React Server Components (RSC), Static Site Generation (SSG),
 * and Server-Side Rendering (SSR).
 * 
 * Unlike LayerRenderer, this component:
 * - Uses no React hooks
 * - Does not access any Zustand stores
 * - Does not include editor functionality (selection, drag-and-drop)
 * - Is a pure functional component
 * 
 * @example
 * ```tsx
 * // In a Next.js Server Component (no "use client" needed)
 * import { ServerLayerRenderer } from '@/components/ui/ui-builder/server-layer-renderer';
 * 
 * export default async function Page() {
 *   const page = await fetchPageFromDatabase();
 *   return (
 *     <ServerLayerRenderer 
 *       page={page} 
 *       componentRegistry={myRegistry}
 *     />
 *   );
 * }
 * ```
 */
export function ServerLayerRenderer<TRegistry extends ComponentRegistry = ComponentRegistry>({
  className,
  page,
  componentRegistry,
  variables = [],
  variableValues,
}: ServerLayerRendererProps<TRegistry>): React.JSX.Element {
  return (
    <div className={className}>
      {renderLayer(page, componentRegistry, variables, variableValues)}
    </div>
  );
}

/**
 * Pure recursive function to render a ComponentLayer tree.
 * No hooks, no side effects - suitable for SSR/RSC.
 */
function renderLayer(
  layer: ComponentLayer,
  componentRegistry: ComponentRegistry,
  variables: Variable[],
  variableValues?: Record<string, PropValue>
): React.ReactNode {
  const componentDefinition = componentRegistry[layer.type as keyof typeof componentRegistry];

  if (!componentDefinition) {
    // Log error in development, but don't break rendering
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[ServerLayerRenderer] Component definition not found in registry:`,
        { layerType: layer.type, layerId: layer.id, layerName: layer.name }
      );
    }
    return null;
  }

  // Determine if this is a primitive HTML element or a custom component
  let Component: React.ElementType | undefined = componentDefinition.component;
  let isPrimitive = false;
  
  if (isPrimitiveComponent(componentDefinition)) {
    Component = layer.type as keyof React.JSX.IntrinsicElements;
    isPrimitive = true;
  }

  if (!Component) {
    return null;
  }

  // Resolve variable references in props
  const resolvedProps = resolveVariableReferences(layer.props, variables, variableValues);
  const childProps: Record<string, PropValue> = { ...resolvedProps };

  // Handle children rendering
  if (hasLayerChildren(layer) && layer.children.length > 0) {
    // Render child layers recursively
    childProps.children = layer.children.map((child) => (
      <React.Fragment key={child.id}>
        {renderLayer(child, componentRegistry, variables, variableValues)}
      </React.Fragment>
    ));
  } else if (isVariableReference(layer.children)) {
    // Resolve variable reference for children
    const resolvedChildren = resolveChildrenVariableReference(
      layer.children, 
      variables, 
      variableValues
    );
    childProps.children = resolvedChildren;
  } else if (typeof layer.children === "string") {
    // String children (text content)
    childProps.children = layer.children;
  }
  // Empty children array or undefined - no children prop needed

  // Render the component with data attributes for testing/debugging
  if (isPrimitive) {
    return (
      <Component 
        key={layer.id}
        id={layer.id} 
        data-testid={layer.id} 
        data-layer-id={layer.id} 
        {...childProps} 
      />
    );
  }

  // Custom components - render directly without error boundary/suspense
  // (Server components handle errors differently)
  return (
    <Component 
      key={layer.id}
      data-testid={layer.id} 
      data-layer-id={layer.id} 
      {...childProps} 
    />
  );
}

export default ServerLayerRenderer;
