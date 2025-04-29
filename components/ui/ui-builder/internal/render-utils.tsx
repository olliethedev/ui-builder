/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, Suspense, useRef } from "react";
import isDeepEqual from "fast-deep-equal";

import { ComponentLayer} from "@/lib/ui-builder/store/layer-store";
import { ClickableWrapper } from "@/components/ui/ui-builder/internal/clickable-wrapper";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "@/components/ui/ui-builder/internal/error-fallback";
import { isPrimitiveComponent } from "@/lib/ui-builder/store/editor-utils";
import { hasLayerChildren } from "@/lib/ui-builder/store/layer-utils";
import { DevProfiler } from "@/components/ui/ui-builder/internal/dev-profiler";
import { ComponentRegistry } from "@/lib/ui-builder/store/editor-store";

export interface EditorConfig {
  
  zIndex: number;
  totalLayers: number;
  selectedLayer: ComponentLayer;
  parentUpdated?: boolean;
  onSelectElement: (layerId: string) => void;
  handleDuplicateLayer: () => void;
  handleDeleteLayer: () => void;
  usingCanvas?: boolean;
}

export const RenderLayer: React.FC<{
  layer: ComponentLayer;
  componentRegistry: ComponentRegistry;
  editorConfig?: EditorConfig;
}> = memo(
  ({ layer, componentRegistry, editorConfig }) => {
    const componentDefinition =
      componentRegistry[layer.type as keyof typeof componentRegistry];

    const prevLayer = useRef(layer);

    if (!componentDefinition) {
      return null;
    }

    let Component: React.ElementType | undefined =
      componentDefinition.component;
    let isPrimitive = false;
    if (isPrimitiveComponent(componentDefinition)) {
      Component = layer.type as keyof JSX.IntrinsicElements;
      isPrimitive = true;
    }

    if (!Component) return null;

    const childProps: Record<string, any> = { ...layer.props };
    if (hasLayerChildren(layer) && layer.children.length > 0) {
      childProps.children = layer.children.map((child) => (
        <RenderLayer
          key={child.id}
          componentRegistry={componentRegistry}
          layer={child}
          editorConfig={
            editorConfig
              ? { ...editorConfig, zIndex: editorConfig.zIndex + 1, parentUpdated: editorConfig.parentUpdated || !isDeepEqual(prevLayer.current, layer) }
              : undefined
          }
        />
      ));
    } else if (typeof layer.children === "string") {
      childProps.children = layer.children;
    }

    const WrappedComponent = isPrimitive ? (
      <Component id={layer.id} data-testid={layer.id} {...childProps} />
    ) : (
      <ErrorSuspenseWrapper key={layer.id} id={layer.id}>
        <Component data-testid={layer.id} {...childProps} />
      </ErrorSuspenseWrapper>
    );

    if (!editorConfig) {
      return WrappedComponent;
    } else {
      const {
        zIndex,
        totalLayers,
        selectedLayer,
        onSelectElement,
        handleDuplicateLayer,
        handleDeleteLayer,
        usingCanvas,
      } = editorConfig;

      return (
        <DevProfiler
          id={layer.type}
          threshold={10}
        >
          <ClickableWrapper
            key={layer.id}
            layer={layer}
            zIndex={zIndex}
            totalLayers={totalLayers}
            isSelected={layer.id === selectedLayer?.id}
            onSelectElement={onSelectElement}
            onDuplicateLayer={handleDuplicateLayer}
            onDeleteLayer={handleDeleteLayer}
            listenToScrollParent={!usingCanvas}
            observeMutations={usingCanvas === true}
          >
            {WrappedComponent}
          </ClickableWrapper>
        </DevProfiler>
      );
    }
  },
  (prevProps, nextProps) => {
    if(nextProps.editorConfig?.parentUpdated) {
      return false;
    }
    const editorConfigEqual = isDeepEqual(
      prevProps.editorConfig?.selectedLayer?.id,
      nextProps.editorConfig?.selectedLayer?.id
    );
    const layerEqual = isDeepEqual(prevProps.layer, nextProps.layer);
    return editorConfigEqual && layerEqual;
  }
);

RenderLayer.displayName = "RenderLayer";

const ErrorSuspenseWrapper: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ children }) => (
  <ErrorBoundary fallbackRender={ErrorFallback}>
    <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
  </ErrorBoundary>
);
