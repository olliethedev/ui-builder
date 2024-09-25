import React, { Suspense } from "react";

import {
  componentRegistry,
  isTextLayer,
  Layer,
} from "@/components/ui/ui-builder/internal/store/component-store";
import { Markdown } from "@/components/ui/ui-builder/markdown";
import { ErrorBoundary } from "react-error-boundary";

interface LayerRendererProps {
  className?: string;
  layers: Layer[];
}

const LayerRenderer: React.FC<LayerRendererProps> = ({
  className,
  layers,
}: LayerRendererProps) => {
  const renderLayer = (layer: Layer) => {
    if (isTextLayer(layer)) {
      const TextComponent = layer.textType === "markdown" ? Markdown : "span";
      return (
        <ErrorBoundary fallbackRender={ErrorFallback}>
          <Suspense fallback={<div>Loading...</div>}>
            <TextComponent {...layer.props}>{layer.text}</TextComponent>
          </Suspense>
        </ErrorBoundary>
      );
    }

    const { component: Component } =
      componentRegistry[layer.type as keyof typeof componentRegistry];
    if (!Component) return null;

    const childProps = { ...layer.props };
    if (layer.children && layer.children.length > 0) {
      childProps.children = layer.children.map((child) => renderLayer(child));
    }

    return (
      <ErrorBoundary fallbackRender={ErrorFallback}>
        <Suspense fallback={<div>Loading...</div>}>
          <Component {...(childProps as any)} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  return <div className={className}>{layers.map(renderLayer)}</div>;
};

export default LayerRenderer;

function ErrorFallback({ error }: { error: Error }) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <div className="p-4 border border-red-500 bg-red-100 text-red-700 rounded flex-grow w-full">
      <h3 className="font-bold mb-2">Component Error</h3>
      <p>Error: {error?.message || "Unknown error"}</p>
      <details className="mt-2">
        <summary className="cursor-pointer">Stack trace</summary>
        <pre className="mt-2 text-xs whitespace-pre-wrap">{error?.stack}</pre>
      </details>
    </div>
  );
}
