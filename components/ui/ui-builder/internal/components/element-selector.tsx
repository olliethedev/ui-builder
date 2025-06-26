"use client";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useMemo,
  useContext,
} from "react";
import { useTransformEffect } from "react-zoom-pan-pinch";
import { ComponentLayer } from "@/components/ui/ui-builder/types";
import { LayerMenu } from "@/components/ui/ui-builder/internal/components/layer-menu";
import { DragHandle as ComponentDragHandle } from "@/components/ui/ui-builder/internal/dnd/drag-handle";
import { DragHandleContext } from "@/components/ui/ui-builder/internal/canvas/resizable-wrapper";
import { useDndContext } from "@/lib/ui-builder/context/dnd-context";
import { cn } from "@/lib/utils";
import { offset, useFloating, autoUpdate, shift, limitShift } from "@floating-ui/react";

const style: React.CSSProperties = {
  display: "contents",
};

interface ElementSelectorProps {
  layer: ComponentLayer;
  isSelected: boolean;
  zIndex: number;
  totalLayers: number;
  onSelectElement: (layerId: string) => void;
  onDuplicateLayer?: () => void;
  onDeleteLayer?: () => void;
  children: React.ReactNode;
  isPageLayer?: boolean;
}

/**
 * Element selector that measures elements using offset properties (relative to parent)
 * instead of getBoundingClientRect (relative to viewport). This works correctly with
 * zoom/pan transformations since the overlays are rendered inside the canvas.
 */
export const ElementSelector: React.FC<ElementSelectorProps> = ({
  layer,
  isSelected,
  zIndex,
  onSelectElement,
  onDuplicateLayer,
  onDeleteLayer,
  children,
  isPageLayer = false,
}) => {
  const [boundingRect, setBoundingRect] = useState<{
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
  } | null>(null);

  const dndContext = useDndContext();

  const {refs, floatingStyles} = useFloating({
    placement: "top-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(-2), // Negative offset to overlap like the sticky label
      shift({
        crossAxis: true, // Allow sliding along the cross axis
        limiter: limitShift(),
      }),
    ],
  });




  // Check if this specific layer is being dragged
  const isBeingDragged = dndContext.activeLayerId === layer.id;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(layer.id);
  }, [layer.id, onSelectElement]);

  const overlayStyle = useMemo(() => {
    if (!boundingRect) return { display: "none" };
    return {
      position: "absolute" as const,
      top: boundingRect.top,
      left: boundingRect.left,
      width: boundingRect.width,
      height: boundingRect.height,
      zIndex: zIndex,
      boxSizing: "border-box" as const,
    } as React.CSSProperties;
  }, [boundingRect, zIndex]);



  return (
    <>
      <MeasureRange debug={false} onChange={setBoundingRect}>
        {children}
      </MeasureRange>

      {boundingRect && (
        <div
          onClick={handleClick}
          ref={refs.setReference}
          className={cn(
            "absolute box-border hover:border-blue-300 hover:border-2 hover:bg-blue-300/20 hover:shadow-md hover:shadow-blue-500/20",
            isBeingDragged
              ? "border-2 border-orange-500 border-dashed shadow-lg shadow-orange-500/30 opacity-70 bg-orange-50/20"
              : isSelected
              ? "border-2 border-blue-500 hover:border-blue-500 hover:bg-transparent  hover:shadow-none"
              : ""
          )}
          style={overlayStyle}
        >
          
        </div>
      )}

      {/* Floating UI element - positioned outside the overlay */}
      {isSelected && (
        <div className="z-[9999]" ref={refs.setFloating} style={floatingStyles}>
          <div className="flex items-center bg-blue-500">
            {/* Drag handle for non-page layers */}
            {!isPageLayer && isSelected && (
                <ComponentDragHandle
                  layerId={layer.id}
                  layerType={layer.type}
                />
              )}
              
              {!isBeingDragged && (
                <>
                  <span className="text-xs text-white  px-[1px] whitespace-nowrap">
                    {layer.name
                      ?.toLowerCase()
                      .startsWith(layer.type.toLowerCase())
                      ? layer.type.replaceAll("_", "")
                      : `${layer.name} (${layer.type.replaceAll("_", "")})`}
                  </span>
                  <div className="w-px h-4 bg-white/20 ml-1" />
                  <LayerMenu
                    layerId={layer.id}
                    handleDuplicateComponent={onDuplicateLayer}
                    handleDeleteComponent={onDeleteLayer}
                  />
                </>
              )}
          </div>
        </div>
      )}
    </>
  );
};

export interface MeasureRangeProps {
  /** Called after every size/position change. */
  onChange?: (
    rect: DOMRectReadOnly & { bottom: number; right: number }
  ) => void;
  /** Children you want to watch (anything renderable). */
  children: React.ReactNode;
  debug?: boolean;
}

export const MeasureRange: React.FC<MeasureRangeProps> = ({
  onChange,
  children,
  debug = false,
}) => {
  // A wrapper that DOESN'T affect layout thanks to display: contents
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [rect, setRect] = useState<DOMRectReadOnly | null>(null);

  // Performance optimizations
  const rafIdRef = useRef<number | null>(null);
  const lastMeasurementRef = useRef<DOMRectReadOnly | null>(null);
  const elementsRef = useRef<HTMLElement[]>([]);
  const transformUpdatePendingRef = useRef(false);

  // Get dragging context to respond to ResizableWrapper changes
  const { dragging } = useContext(DragHandleContext);

  // Parent container observer to track ResizableWrapper resizing
  const parentObserverRef = useRef<ResizeObserver | null>(null);

  // Throttled measurement function using RAF
  const measureElements = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const elements = elementsRef.current;
      if (elements.length === 0) return;

      try {
        // Use cached elements for better performance
        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];

        // Calculate the natural dimensions before transform
        const naturalWidth =
          lastElement.offsetLeft +
          lastElement.offsetWidth -
          firstElement.offsetLeft;
        const naturalHeight =
          lastElement.offsetTop +
          lastElement.offsetHeight -
          firstElement.offsetTop;

        const newRect = {
          top: firstElement.offsetTop,
          left: firstElement.offsetLeft,
          width: naturalWidth,
          height: naturalHeight,
          bottom: firstElement.offsetTop + naturalHeight,
          right: firstElement.offsetLeft + naturalWidth,
        } as DOMRectReadOnly & { bottom: number; right: number };

        // Only update if measurements actually changed (avoid unnecessary re-renders)
        const hasChanged =
          !lastMeasurementRef.current ||
          lastMeasurementRef.current.top !== newRect.top ||
          lastMeasurementRef.current.left !== newRect.left ||
          lastMeasurementRef.current.width !== newRect.width ||
          lastMeasurementRef.current.height !== newRect.height;

        if (hasChanged) {
          lastMeasurementRef.current = newRect;
          setRect(newRect);
          onChange?.(newRect);
        }

        transformUpdatePendingRef.current = false;
      } catch (error) {
        console.warn("Error measuring elements:", error);
      }
    });
  }, [onChange]);

  // Handle transform updates with throttling
  useTransformEffect(
    useCallback(
      () => {
        // Avoid duplicate updates if one is already pending
        if (transformUpdatePendingRef.current) return;

        transformUpdatePendingRef.current = true;
        measureElements();
      },
      [measureElements]
    )
  );

  // Re-measure when dragging state changes (for ResizableWrapper)
  useEffect(() => {
    measureElements();
  }, [dragging, measureElements]);

  // Cache elements and set up ResizeObservers (without transform state dependency)
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Cache filtered elements to avoid repeated filtering
    const elements = Array.from(wrapper.childNodes).filter(
      (n): n is HTMLElement => n.nodeType === Node.ELEMENT_NODE
    );

    elementsRef.current = elements;

    if (elements.length === 0) return;

    // Set up ResizeObservers only once (not on every transform change)
    const observers = elements.map((el) => {
      const ro = new ResizeObserver(measureElements);
      ro.observe(el);
      return ro;
    });

    // Set up parent container ResizeObserver to track ResizableWrapper changes
    const parentContainer =
      wrapper.closest("#editor-panel-container") ||
      wrapper.closest('[data-testid="transform-component"]') ||
      wrapper.closest(".relative");
    if (parentContainer && parentContainer instanceof HTMLElement) {
      parentObserverRef.current = new ResizeObserver(measureElements);
      parentObserverRef.current.observe(parentContainer);
    }

    // Initial measurement
    measureElements();

    return () => {
      observers.forEach((ro) => ro.disconnect());
      if (parentObserverRef.current) {
        parentObserverRef.current.disconnect();
        parentObserverRef.current = null;
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [children, measureElements]); // Removed transformState dependency

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const memoizedStyle: React.CSSProperties = useMemo(() => {
    if (!rect) return {};
    return {
      position: "absolute",
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      border: "1px solid #5be312",
      zIndex: 9999,
      boxSizing: "border-box",
      pointerEvents: "none",
    };
  }, [rect]);

  return (
    <>
      <span ref={wrapperRef} style={style}>
        {children}
      </span>

      {/* Debug overlay that scales naturally with the transform */}
      {rect && debug && <div style={memoizedStyle} />}
    </>
  );
};
