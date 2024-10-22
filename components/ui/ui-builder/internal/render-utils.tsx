/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from "react";
import { baseColors, BaseColor } from "@/components/ui/ui-builder/internal/base-colors";

import {
  Layer,
  PageLayer,
} from "@/lib/ui-builder/store/layer-store";
import { ClickableWrapper } from "@/components/ui/ui-builder/internal/clickable-wrapper";
import { componentRegistry } from "@/lib/ui-builder/store/layer-store";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "@/components/ui/ui-builder/internal/error-fallback";
import { isPrimitiveComponent } from "@/lib/ui-builder/registry/registry-utils";
import { hasChildren } from "@/lib/ui-builder/store/layer-utils";


export interface EditorConfig {
  zIndex: number;
  totalLayers: number;
  selectedLayer: Layer;
  onSelectElement: (layerId: string) => void;
  handleDuplicateLayer: () => void;
  handleDeleteLayer: () => void;
}

export const renderPage = (page: PageLayer, editorConfig?: EditorConfig) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mode, colorTheme, style, borderRadius, ...rest } = page.props;

  const colorData = colorTheme
    ? baseColors.find((color) => color.name === colorTheme)
    : undefined;

  const globalOverrides = colorData
    ? {
        color: `hsl(${colorData.cssVars[mode as "light" | "dark"].foreground})`,
        borderColor: `hsl(${
          colorData.cssVars[mode as "light" | "dark"].border
        })`,
      }
    : {};

  return (
    <div
      data-testid={page.id}
      className="flex flex-col w-full overflow-y-visible relative"
      style={{
        ...style,
        ...globalOverrides,
      }}
      {...rest}
    >
      {page.children.map((child) => renderLayer(child, editorConfig))}
    </div>
  );
};

export const renderLayer = (layer: Layer, editorConfig?: EditorConfig) => {

  const componentDefinition =
    componentRegistry[layer.type as keyof typeof componentRegistry];

  if (!componentDefinition) {
    return null;
  }

  let Component: React.ElementType | undefined = componentDefinition.component;

  if (isPrimitiveComponent(componentDefinition)) {
    // Set Component to the HTML tag name (e.g., 'a', 'img')
    Component = layer.type as keyof JSX.IntrinsicElements;

  }

  // If Component is still undefined, return null to avoid rendering issues
  if (!Component) return null;

  const childProps: Record<string, any> = { ...layer.props };
  if (hasChildren(layer) && layer.children.length > 0) {
    childProps.children = layer.children.map((child) => {
      if (editorConfig) {
        return renderLayer(child, {
          ...editorConfig,
          zIndex: editorConfig.zIndex + 1,
        });
      } else {
        return renderLayer(child);
      }
    });
  } else if (typeof layer.children === 'string') {
    childProps.children = layer.children;
  }

  if (!editorConfig) {
    return (
      <ErrorSuspenseWrapper key={layer.id} id={layer.id}>
        <Component data-testid={layer.id} {...(childProps as any)} />
      </ErrorSuspenseWrapper>
    );
  } else {
    const {
      zIndex,
      totalLayers,
      selectedLayer,
      onSelectElement,
      handleDuplicateLayer,
      handleDeleteLayer,
    } = editorConfig;
    return (
      <ClickableWrapper
        key={layer.id}
        layer={layer}
        zIndex={zIndex}
        totalLayers={totalLayers}
        isSelected={layer.id === selectedLayer?.id}
        onSelectElement={onSelectElement}
        onDuplicateLayer={handleDuplicateLayer}
        onDeleteLayer={handleDeleteLayer}
      >
        <ErrorSuspenseWrapper id={layer.id}>
          <Component data-testid={layer.id} {...(childProps as any)} />
        </ErrorSuspenseWrapper>
      </ClickableWrapper>
    );
  }
};

const ErrorSuspenseWrapper: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => (
  <ErrorBoundary fallbackRender={ErrorFallback}>
    <Suspense key={id} fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export function themeToStyleVars(
  colors: BaseColor["cssVars"]["dark"] | BaseColor["cssVars"]["light"] | undefined,
) {
  if (!colors) {
    return undefined;
  }
  const styleVariables = Object.entries(colors).reduce(
    (acc, [key, value]) => {
      acc[`--${key}`] = value;
      return acc;
    },
    {} as { [key: string]: string }
  );
  return styleVariables;
}

