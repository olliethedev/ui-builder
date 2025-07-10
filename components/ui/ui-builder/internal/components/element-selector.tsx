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
import {
  offset,
  useFloating,
  autoUpdate,
  shift,
  limitShift,
} from "@floating-ui/react";
import { getScrollParent } from "@/lib/ui-builder/utils/get-scroll-parent";
import { useFrame } from "@/components/ui/ui-builder/internal/canvas/auto-frame";

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

  const { refs, floatingStyles } = useFloating({
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

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelectElement(layer.id);
    },
    [layer.id, onSelectElement]
  );

  // Block all pointer events from passing through
  const handlePointerEvent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const overlayStyle = useMemo(() => {
    if (!boundingRect) return { display: "none" };
    return {
      position: "fixed" as const,
      top: boundingRect.top,
      left: boundingRect.left,
      width: boundingRect.width,
      height: boundingRect.height,
      zIndex: zIndex,
      boxSizing: "border-box" as const,
      pointerEvents: "auto" as const, // Ensure overlay captures all pointer events
    } as React.CSSProperties;
  }, [boundingRect, zIndex]);

  const handleBoundingRectChange = useCallback(
    (
      rect: {
        top: number;
        left: number;
        bottom: number;
        right: number;
        width: number;
        height: number;
      } | null
    ) => {
      setBoundingRect(rect);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layer.id]
  );

  return (
    <>
      <MeasureRange debug={false} onChange={handleBoundingRectChange}>
        {children}
      </MeasureRange>

      {boundingRect && (
        <div
          onClick={handleClick}
          onMouseDown={handlePointerEvent}
          onMouseUp={handlePointerEvent}
          onDoubleClick={handlePointerEvent}
          onContextMenu={handlePointerEvent}
          ref={refs.setReference}
          className={cn(
            "fixed box-border hover:border-blue-300 hover:border-2 hover:bg-blue-300/20 hover:shadow-md hover:shadow-blue-500/20 cursor-default",
            isBeingDragged
              ? "border-2 border-orange-500 border-dashed shadow-lg shadow-orange-500/30 opacity-70 bg-orange-50/20"
              : isSelected
              ? "border-2 border-blue-500 hover:border-blue-500 hover:bg-transparent  hover:shadow-none"
              : ""
          )}
          style={overlayStyle}
        ></div>
      )}

      {/* Floating UI element - positioned outside the overlay */}
      {isSelected && (
        <div className="z-[9999]" ref={refs.setFloating} style={floatingStyles}>
          <div className="flex items-center bg-blue-500">
            {/* Drag handle for non-page layers */}
            {!isPageLayer && isSelected && (
              <ComponentDragHandle layerId={layer.id} layerType={layer.type} />
            )}

            {!isBeingDragged && (
              <>
                <span className="text-xs text-white  px-[1px] whitespace-nowrap cursor-default">
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

const MIN_SIZE = 5;

const MIN_CHANGE_THRESHOLD = 0;

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
  const elementsRef = useRef<Element[]>([]);
  const transformUpdatePendingRef = useRef(false);

  // Get dragging context to respond to ResizableWrapper changes
  const { dragging } = useContext(DragHandleContext);

  // Get iframe context if we're running inside an AutoFrame
  const frameContext = useFrame();

  // Parent container observer to track ResizableWrapper resizing
  const parentObserverRef = useRef<ResizeObserver | null>(null);

  // Throttled measurement function using RAF
  const measureElements = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) {
        console.warn(`[MeasureRange] No wrapper found`);
        return;
      }

      const elements = elementsRef.current;
      if (elements.length === 0) {
        return;
      }

      try {
        // Use getBoundingClientRect for universal compatibility (works with SVGs, HTML elements, etc.)
        const elementRects = elements.map((el) => el.getBoundingClientRect());
        if (elementRects.length === 0) return;

        // Find the bounds of all elements
        const minTop = Math.min(...elementRects.map((rect) => rect.top));
        const minLeft = Math.min(...elementRects.map((rect) => rect.left));
        const maxBottom = Math.max(...elementRects.map((rect) => rect.bottom));
        const maxRight = Math.max(...elementRects.map((rect) => rect.right));

        // Use viewport coordinates directly for fixed positioning
        const newRect = {
          top: minTop,
          left: minLeft,
          width: maxRight - minLeft,
          height: maxBottom - minTop,
          bottom: maxBottom,
          right: maxRight,
        } as DOMRectReadOnly & { bottom: number; right: number };

        // Only update if measurements actually changed (avoid unnecessary re-renders)
        const hasChanged =
          !lastMeasurementRef.current ||
          Math.abs(lastMeasurementRef.current.top - newRect.top) >
            MIN_CHANGE_THRESHOLD ||
          Math.abs(lastMeasurementRef.current.left - newRect.left) >
            MIN_CHANGE_THRESHOLD ||
          Math.abs(lastMeasurementRef.current.width - newRect.width) >
            MIN_CHANGE_THRESHOLD ||
          Math.abs(lastMeasurementRef.current.height - newRect.height) >
            MIN_CHANGE_THRESHOLD;

        if (hasChanged) {
          lastMeasurementRef.current = newRect;
          setRect(newRect);
          if (onChange) {
            const adjustedWidth = Math.max(newRect.width, MIN_SIZE);
            const adjustedHeight = Math.max(newRect.height, MIN_SIZE);
            onChange({
              ...newRect,
              width: adjustedWidth,
              height: adjustedHeight,
              bottom: newRect.top + adjustedHeight,
              right: newRect.left + adjustedWidth,
            });
          }
        }

        transformUpdatePendingRef.current = false;
      } catch (error) {
        console.warn("Error measuring elements:", error);
      }
    });
  }, [onChange]);

  // Handle transform updates
  useTransformEffect(
    useCallback(() => {
      // Avoid duplicate updates if one is already pending
      if (transformUpdatePendingRef.current) return;

      transformUpdatePendingRef.current = true;
      measureElements();
    }, [measureElements])
  );

  // Re-measure when dragging state changes (for ResizableWrapper)
  useEffect(() => {
    measureElements();
  }, [dragging, measureElements]);

  // Cache elements and set up ResizeObservers (without transform state dependency)
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Cache all element nodes (HTML, SVG, etc.) and filter out text/comment nodes
    // Also filter out elements that are not actually rendered (like script, style, etc.)
    const elements = Array.from(wrapper.childNodes).filter(
      (node): node is Element => {
        if (node.nodeType !== Node.ELEMENT_NODE) return false;

        // Check if element is actually rendered (has layout)
        const element = node as Element;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 || rect.height > 0;
      }
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

    // Set up scroll listeners for various containers
    const scrollListeners: Array<() => void> = [];

    // Determine which document/window to use - iframe context if available, otherwise parent
    const targetDocument = frameContext.document || document;
    const targetWindow = frameContext.window || window;

    // Listen to multiple potential scroll containers
    const potentialScrollContainers = [
      // Editor panel container (in parent document)
      document.getElementById("editor-panel-container"),
      // Transform component (zoom/pan container)
      wrapper.closest('[data-testid="transform-component"]'),
      // Any iframe that might contain our content
      document.querySelector("iframe"),
      // Canvas containers
      wrapper.closest(".relative"),
      wrapper.closest("[data-zoom-pan-pinch]"),
      // Traditional scroll parent
      elements.length > 0 ? getScrollParent(elements[0] as HTMLElement) : null,
      // Iframe-specific containers if we're in an iframe
      ...(frameContext.document
        ? [
            frameContext.document.getElementById("frame-root"),
            frameContext.document.body,
          ]
        : []),
    ].filter(Boolean) as HTMLElement[];

    // Add scroll listeners to all potential containers
    potentialScrollContainers.forEach((container) => {
      if (
        container &&
        container !== document.body &&
        container !== targetDocument.body
      ) {
        const scrollHandler = () => {
          measureElements();
        };
        container.addEventListener("scroll", scrollHandler, { passive: true });
        scrollListeners.push(() =>
          container.removeEventListener("scroll", scrollHandler)
        );
      }
    });

    // Listen to both parent window and iframe window events
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const setupWindowListeners = (win: Window, _: string) => {
      const windowScrollHandler = () => {
        measureElements();
      };
      const windowResizeHandler = () => {
        measureElements();
      };

      win.addEventListener("scroll", windowScrollHandler, { passive: true });
      win.addEventListener("resize", windowResizeHandler, { passive: true });

      scrollListeners.push(() =>
        win.removeEventListener("scroll", windowScrollHandler)
      );
      scrollListeners.push(() =>
        win.removeEventListener("resize", windowResizeHandler)
      );
    };

    // Always listen to parent window
    setupWindowListeners(window, "Parent");

    // Also listen to iframe window if available and different from parent
    if (frameContext.window && frameContext.window !== window) {
      setupWindowListeners(frameContext.window, "Iframe");
    }

    // Add mutation observer for style/class changes that might affect positioning
    let mutationObserver: MutationObserver | null = null;
    if ("MutationObserver" in targetWindow) {
      mutationObserver = new MutationObserver(measureElements);
      // Watch for transform/style changes on containers in the appropriate document context
      const transformContainer =
        wrapper.closest('[data-testid="transform-component"]') ||
        wrapper.closest("[data-zoom-pan-pinch]") ||
        targetDocument.body;
      mutationObserver.observe(transformContainer, {
        attributeFilter: ["style", "class", "transform"],
        attributes: true,
        subtree: true,
      });
    }

    // Initial measurement
    measureElements();

    return () => {
      observers.forEach((ro) => ro.disconnect());
      if (parentObserverRef.current) {
        parentObserverRef.current.disconnect();
        parentObserverRef.current = null;
      }

      // Clean up all scroll listeners
      scrollListeners.forEach((cleanup) => cleanup());

      // Clean up mutation observer
      if (mutationObserver) {
        mutationObserver.disconnect();
      }

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [children, measureElements, frameContext.document, frameContext.window]); // Include iframe context

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
      position: "fixed",
      top: rect.top,
      left: rect.left,
      width: Math.max(rect.width, MIN_SIZE),
      height: Math.max(rect.height, MIN_SIZE),
      border: "1px solid #5be312",
      zIndex: 9999,
      boxSizing: "border-box",
      pointerEvents: "none",
      cursor: "default",
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
