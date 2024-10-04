import React, { useState, useRef, useEffect } from "react";
import { Layer } from "@/lib/ui-builder/store/component-store";
import { LayerMenu } from "@/components/ui/ui-builder/internal/layer-menu";
import { cn } from "@/lib/utils";

interface ClickableWrapperProps {
  layer: Layer;
  isSelected: boolean;
  zIndex: number;
  totalLayers: number;
  onSelectElement: (layerId: string) => void;
  children: React.ReactNode;
  onDuplicateLayer: () => void;
  onDeleteLayer: () => void;
}

/**
 * ClickableWrapper gives a layer a bounding box that can be clicked. And provides a context menu for the layer.
 */
export const ClickableWrapper: React.FC<ClickableWrapperProps> = ({
  layer,
  isSelected,
  zIndex,
  totalLayers,
  onSelectElement,
  children,
  onDuplicateLayer,
  onDeleteLayer,
}) => {
  const [boundingRect, setBoundingRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    // update bounding rect on page resize and scroll
    const element = wrapperRef.current?.firstElementChild as HTMLElement | null;
    if (!element) {
      setBoundingRect(null);
      return;
    }

    const updateBoundingRect = () => {
      const rect = element.getBoundingClientRect();
      setBoundingRect(rect);
    };

    updateBoundingRect();

    let resizeObserver: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(updateBoundingRect);
      resizeObserver.observe(element);
    }

    const scrollParent = getScrollParent(element);
    if (scrollParent) {
      scrollParent.addEventListener("scroll", updateBoundingRect);
    }
    window.addEventListener("resize", updateBoundingRect);

    return () => {
      if (resizeObserver) {
        resizeObserver.unobserve(element);
        resizeObserver.disconnect();
      }
      if (scrollParent) {
        scrollParent.removeEventListener("scroll", updateBoundingRect);
      }
      window.removeEventListener("resize", updateBoundingRect);
    };
  }, [isSelected, layer.id, children]);

  useEffect(() => {
    //since we are using resizable panel, we need to track parent size changes
    if (!wrapperRef.current) return;
  
    const updateBoundingRect = () => {
      const element = wrapperRef.current?.firstElementChild as HTMLElement | null;
      if (element) {
        const rect = element.getBoundingClientRect();
        setBoundingRect(rect);
      }
    };
  
    // Traverse up the DOM tree to attach ResizeObservers to all ancestor elements. 
    const parents: HTMLElement[] = [];
    let parent = wrapperRef.current.parentElement;
    while (parent) {
      parents.push(parent);
      parent = parent.parentElement;
    }
  
    const resizeObservers = parents.map((parent) => {
      const observer = new ResizeObserver(updateBoundingRect);
      observer.observe(parent);
      return observer;
    });
  
    return () => {
      resizeObservers.forEach((observer) => observer.disconnect());
    };
  }, [isSelected, layer.id, children]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(layer.id);
  };

  return (
    <>
      <span
        className="contents" // Preserves layout
        ref={wrapperRef}
      >
        {children}
      </span>

      {isSelected && boundingRect && (
        <LayerMenu
          layerId={layer.id}
          x={boundingRect.left + window.scrollX}
          y={boundingRect.bottom + window.scrollY}
          zIndex={totalLayers + zIndex}
          width={boundingRect.width}
          height={boundingRect.height}
          handleDuplicateComponent={onDuplicateLayer}
          handleDeleteComponent={onDeleteLayer}
        />
      )}

      {boundingRect && (
        <div
          onClick={handleClick}
          className={cn(
            "fixed box-border hover:border-blue-300 hover:border-2",
            isSelected ? "border-2 border-blue-500 hover:border-blue-500" : ""
          )}
          onWheel={(e) => {
            const scrollParent = getScrollParent(e.target as HTMLElement);
            if (scrollParent) {
              scrollParent.scrollLeft += e.deltaX;
              scrollParent.scrollTop += e.deltaY;
            }
          }}
          style={{
            top: boundingRect.top,
            left: boundingRect.left,
            width: boundingRect.width,
            height: boundingRect.height,
            zIndex: zIndex,
          }}
        />
      )}
    </>
  );
};

function getScrollParent(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;

  const overflowRegex = /(auto|scroll)/;

  let parent: HTMLElement | null = element.parentElement;

  while (parent) {
    const style = getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;

    if (overflowRegex.test(overflowY) || overflowRegex.test(overflowX)) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
}
