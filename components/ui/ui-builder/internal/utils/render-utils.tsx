 
import React, { memo, Suspense, useMemo, useRef, Fragment } from "react";
import isDeepEqual from "fast-deep-equal";

import { ElementSelector } from "@/components/ui/ui-builder/internal/components/element-selector";
import { DropPlaceholder } from "@/components/ui/ui-builder/internal/dnd/drop-zone";
import { useDndContext } from "@/lib/ui-builder/context/dnd-context";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "@/components/ui/ui-builder/internal/components/error-fallback";
import { isPrimitiveComponent } from "@/lib/ui-builder/store/editor-utils";
import { hasLayerChildren, canLayerAcceptChildren, findLayerRecursive } from "@/lib/ui-builder/store/layer-utils";
import { DevProfiler } from "@/components/ui/ui-builder/internal/components/dev-profiler";
import { ComponentRegistry, ComponentLayer, Variable, PropValue, isVariableReference } from '@/components/ui/ui-builder/types';
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { resolveVariableReferences, resolveChildrenVariableReference } from "@/lib/ui-builder/utils/variable-resolver";

// Note: useDndContext has default values defined in dnd-contexts.tsx,
// so it will return { isDragging: false, activeLayerId: null, newComponentType: null, canDropOnLayer: () => false }
// when used outside DndContextProvider. No try-catch needed.

/**
 * Check if a layer is the active dragged layer or a descendant of it.
 * Used to apply visual feedback and disable drop zones inside dragged layers.
 */
function isLayerBeingDraggedOrDescendant(
  layerId: string,
  activeLayerId: string | null,
  pages: ComponentLayer[] | undefined
): boolean {
  if (!activeLayerId) return false;
  if (layerId === activeLayerId) return true;
  
  // Safety check for pages
  if (!pages || !Array.isArray(pages) || pages.length === 0) return false;
  
  // Check if this layer is a descendant of the dragged layer
  const draggedLayer = findLayerRecursive(pages, activeLayerId);
  if (!draggedLayer) return false;
  
  // Check if this layerId exists within the dragged layer's descendants
  if (hasLayerChildren(draggedLayer)) {
    const foundInDragged = findLayerRecursive([draggedLayer], layerId);
    return !!foundInDragged;
  }
  
  return false;
}

export interface EditorConfig {
  zIndex: number;
  totalLayers: number;
  selectedLayer: ComponentLayer;
  parentUpdated?: boolean;
  onSelectElement: (layerId: string) => void;
  handleDuplicateLayer?: () => void;
  handleDeleteLayer?: () => void;
}



export const RenderLayer: React.FC<{
  layer: ComponentLayer;
  componentRegistry: ComponentRegistry;
  editorConfig?: EditorConfig;
  variables?: Variable[];
  variableValues?: Record<string, PropValue>;
}> = memo(
  ({ layer, componentRegistry, editorConfig, variables, variableValues }) => {
    const storeVariables = useLayerStore((state) => state.variables);
    const pages = useLayerStore((state) => state.pages);
    const isLayerAPage = useLayerStore((state) => state.isLayerAPage(layer.id));
    const registry = useEditorStore((state) => state.registry);
    const dndContext = useDndContext();
    
    // Use provided variables or fall back to store variables
    const effectiveVariables = variables || storeVariables;
    const componentDefinition =
      componentRegistry[layer.type as keyof typeof componentRegistry];

    const prevLayer = useRef(layer);

    const infoData = useMemo(() => ({
      layerType: layer.type,
      layerId: layer.id,
      layerName: layer.name,
      availableComponents: Object.keys(componentRegistry),
      layer: layer
    }), [layer, componentRegistry]);

    // Resolve variable references in props with proper memoization
    const resolvedProps = useMemo(() => 
      resolveVariableReferences(layer.props, effectiveVariables, variableValues),
      [layer.props, effectiveVariables, variableValues]
    );
    
    const childProps: Record<string, PropValue> = useMemo(() => ({ ...resolvedProps }), [resolvedProps]);
    
    // Memoize child editor config to avoid creating objects in JSX
    const childEditorConfig = useMemo(() => {
      return editorConfig
        ? { ...editorConfig, zIndex: editorConfig.zIndex + 1, parentUpdated: editorConfig.parentUpdated || !isDeepEqual(prevLayer.current, layer) }
        : undefined;
    }, [editorConfig, layer]);

    // Check if this layer is being dragged or is a descendant of a dragged layer
    const isBeingDragged = useMemo(() => 
      isLayerBeingDraggedOrDescendant(layer.id, dndContext.activeLayerId, pages),
      [layer.id, dndContext.activeLayerId, pages]
    );
    
    // Check if this is the root layer being dragged (not a descendant)
    const isRootDraggedLayer = layer.id === dndContext.activeLayerId;

    // Check if this layer can accept children and if drag is active (must be before early returns)
    const canAcceptChildren = useMemo(() => canLayerAcceptChildren(layer, registry), [layer, registry]);
    
    // Don't show drop zones inside the layer being dragged or its descendants
    const showDropZones = useMemo(() => 
      editorConfig && dndContext.isDragging && canAcceptChildren && !isBeingDragged,
      [editorConfig, dndContext.isDragging, canAcceptChildren, isBeingDragged]
    );

    if (!componentDefinition) {
      console.error(
        `[UIBuilder] Component definition not found in registry:`, 
        infoData
      );
      return null;
    }

    let Component: React.ElementType | undefined =
      componentDefinition.component;
    let isPrimitive = false;
    if (isPrimitiveComponent(componentDefinition)) {
      Component = layer.type as keyof React.JSX.IntrinsicElements;
      isPrimitive = true;
    }

    if (!Component) return null;
    
    // Handle children rendering with improved drop zones
    if (hasLayerChildren(layer) && layer.children.length > 0) {
      // CRITICAL: Add position:relative to parent when showing drop zones
      // This ensures absolutely positioned DropPlaceholders position correctly
      if (showDropZones) {
        const existingClassName = childProps.className as string || '';
        // Only add 'relative' if not already present to avoid duplication
        if (!existingClassName.includes('relative')) {
          childProps.className = existingClassName ? `${existingClassName} relative` : 'relative';
        }
      }
      
      const childElements = layer.children.map((child, index) => {
        const childElement = (
          <RenderLayer
            key={child.id}
            componentRegistry={componentRegistry}
            layer={child}
            variables={variables}
            variableValues={variableValues}
            editorConfig={childEditorConfig}
          />
        );

        // CRITICAL FIX: Use Fragment to render drop placeholders as siblings
        // This prevents wrapper divs from breaking flex/grid layouts
        // The DropPlaceholder calculates its position based on its next sibling
        if (showDropZones) {
          return (
            <Fragment key={child.id}>
              <DropPlaceholder
                parentId={layer.id}
                position={index}
                isActive={true}
              />
              {childElement}
            </Fragment>
          );
        }

        return childElement;
      });

      // Add drop zone after the last child (no wrapper needed)
      if (showDropZones) {
        childElements.push(
          <DropPlaceholder
            key={`drop-${layer.id}-${layer.children.length}`}
            parentId={layer.id}
            position={layer.children.length}
            isActive={true}
          />
        );
      }

      childProps.children = childElements;
    } else if (isVariableReference(layer.children)) {
      // Resolve variable reference for children
      const resolvedChildren = resolveChildrenVariableReference(
        layer.children, effectiveVariables, variableValues
      );
      childProps.children = resolvedChildren;
    } else if (typeof layer.children === "string") {
      childProps.children = layer.children;
    } else if (showDropZones && hasLayerChildren(layer)) {
      // Show drop zone for empty containers
      // Add position:relative to parent for proper placeholder positioning
      const existingClassName = childProps.className as string || '';
      if (!existingClassName.includes('relative')) {
        childProps.className = existingClassName ? `${existingClassName} relative` : 'relative';
      }
      // Also add min-height so empty containers are droppable
      childProps.children = (
        <div className="min-h-[2rem] w-full">
          <DropPlaceholder
            parentId={layer.id}
            position={0}
            isActive={true}
          />
        </div>
      );
    }

    const WrappedComponent = isPrimitive ? (
      <Component id={layer.id} data-testid={layer.id} data-layer-id={layer.id} {...childProps} />
    ) : (
      <ErrorSuspenseWrapper key={layer.id} id={layer.id}>
        <Component data-testid={layer.id} data-layer-id={layer.id} {...childProps} />
      </ErrorSuspenseWrapper>
    );

    // Apply visual feedback for dragged layer (only on root dragged layer, not descendants)
    const DragFeedbackWrapper = isRootDraggedLayer ? (
      <div 
        className="relative opacity-50 pointer-events-none"
        data-dragging="true"
      >
        {/* Blue overlay to indicate dragging */}
        <div className="absolute inset-0 bg-primary/20 rounded pointer-events-none z-10" />
        {WrappedComponent}
      </div>
    ) : WrappedComponent;

    if (!editorConfig) {
      return DragFeedbackWrapper;
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
        <DevProfiler
          id={layer.type}
          threshold={20}
        >
          <ElementSelector
            key={layer.id}
            layer={layer}
            zIndex={zIndex}
            isSelected={layer.id === selectedLayer?.id}
            onSelectElement={onSelectElement}
            isPageLayer={isLayerAPage}
            totalLayers={totalLayers}
            onDuplicateLayer={handleDuplicateLayer}
            onDeleteLayer={handleDeleteLayer}
          >
            {DragFeedbackWrapper}
          </ElementSelector>
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
    const variablesEqual = isDeepEqual(prevProps.variables, nextProps.variables);
    const variableValuesEqual = isDeepEqual(prevProps.variableValues, nextProps.variableValues);
    return editorConfigEqual && layerEqual && variablesEqual && variableValuesEqual;
  }
);

RenderLayer.displayName = "RenderLayer";

const ErrorSuspenseWrapper: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ children }) => {
  const loadingFallback = useMemo(() => <LoadingComponent />, []);
  
  return (
    <ErrorBoundary fallbackRender={ErrorFallback}>
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
};

const LoadingComponent: React.FC = () => (
  <div>Loading...</div>
);
