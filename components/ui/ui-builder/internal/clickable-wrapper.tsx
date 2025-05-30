import React, {
  useState,
  useRef,
  useEffect,
  memo,
  useCallback,
  useMemo,
} from "react";
import { ComponentLayer } from "@/components/ui/ui-builder/types";
import { LayerMenu } from "@/components/ui/ui-builder/internal/layer-menu";
import { cn } from "@/lib/utils";
import { getScrollParent } from "@/lib/ui-builder/utils/get-scroll-parent";
import isDeepEqual from "fast-deep-equal";

const MIN_SIZE = 2;

interface ClickableWrapperProps {
  layer: ComponentLayer;
  isSelected: boolean;
  zIndex: number;
  totalLayers: number;
  onSelectElement: (layerId: string) => void;
  children: React.ReactNode;
  onDuplicateLayer: () => void;
  onDeleteLayer: () => void;
  listenToScrollParent: boolean;
  observeMutations: boolean;
}

/**
 * ClickableWrapper gives a layer a bounding box that can be clicked. And provides a context menu for the layer.
 */
const InternalClickableWrapper: React.FC<ClickableWrapperProps> = ({
  layer,
  isSelected,
  zIndex,
  totalLayers,
  onSelectElement,
  children,
  onDuplicateLayer,
  onDeleteLayer,
  listenToScrollParent,
  observeMutations,
}) => {
  const [boundingRect, setBoundingRect] = useState<DOMRect | null>(null);
  const [touchPosition, setTouchPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  // listen to resize and position changes
  useEffect(() => {
    // update bounding rect on page resize and scroll
    const element = wrapperRef.current?.firstElementChild as HTMLElement | null;
    if (!element) {
      setBoundingRect(null);
      return;
    }

    const updateBoundingRect = () => {
      const rect = element.getBoundingClientRect();
      // Prevent unnecessary re-renders if the rect is the same
      setBoundingRect((prevRect) => {
        if (
          prevRect &&
          rect.x === prevRect.x &&
          rect.y === prevRect.y &&
          rect.width === prevRect.width &&
          rect.height === prevRect.height &&
          rect.top === prevRect.top &&
          rect.left === prevRect.left &&
          rect.right === prevRect.right &&
          rect.bottom === prevRect.bottom
        ) {
          return prevRect;
        }
        return rect;
      });
    };

    updateBoundingRect();

    let resizeObserver: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(updateBoundingRect);
      resizeObserver.observe(element);
    }

    let mutationObserver: MutationObserver | null = null;
    if ("MutationObserver" in window && observeMutations) {
      mutationObserver = new MutationObserver(updateBoundingRect);
      mutationObserver.observe(document.body, {
        attributeFilter: ["style", "class"],
        attributes: true,
        subtree: true,
      });
    }

    let scrollParent: HTMLElement | null = null;
    if (listenToScrollParent) {
      scrollParent = getScrollParent(element);
      if (scrollParent) {
        scrollParent.addEventListener("scroll", updateBoundingRect);
      }
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.unobserve(element);
        resizeObserver.disconnect();
      }
      if (scrollParent) {
        scrollParent.removeEventListener("scroll", updateBoundingRect);
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [isSelected, layer.id, children, listenToScrollParent, observeMutations]);

  // listen to window resize
  useEffect(() => {
    const element = wrapperRef.current?.firstElementChild as HTMLElement | null;
    if (!element) {
      setBoundingRect(null);
      return;
    }

    const updateBoundingRect = () => {
      const currentRect = element.getBoundingClientRect();
      setBoundingRect((prevRect) => {
        if (
          prevRect &&
          currentRect.x === prevRect.x &&
          currentRect.y === prevRect.y &&
          currentRect.width === prevRect.width &&
          currentRect.height === prevRect.height &&
          currentRect.top === prevRect.top &&
          currentRect.left === prevRect.left &&
          currentRect.right === prevRect.right &&
          currentRect.bottom === prevRect.bottom
        ) {
          return prevRect;
        }
        return currentRect;
      });
    };

    window.addEventListener("resize", updateBoundingRect);
    return () => {
      window.removeEventListener("resize", updateBoundingRect);
    };
  }, []);

  // listen to panel size changes
  useEffect(() => {
    //since we are using resizable panel, we need to track parent size changes
    if (!wrapperRef.current) return;

    const panelContainer = document.getElementById("editor-panel-container");
    if (!panelContainer) return;

    const updateBoundingRect = () => {
      const element = wrapperRef.current
        ?.firstElementChild as HTMLElement | null;
      if (element) {
        const rect = element.getBoundingClientRect();
        // Prevent unnecessary re-renders if the rect is the same
        setBoundingRect((prevRect) => {
          if (
            prevRect &&
            rect.x === prevRect.x &&
            rect.y === prevRect.y &&
            rect.width === prevRect.width &&
            rect.height === prevRect.height &&
            rect.top === prevRect.top &&
            rect.left === prevRect.left &&
            rect.right === prevRect.right &&
            rect.bottom === prevRect.bottom
          ) {
            return prevRect;
          }
          return rect;
        });
      }
    };

    const resizeObserver = new ResizeObserver(updateBoundingRect);
    resizeObserver.observe(panelContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isSelected, layer.id, children]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelectElement(layer.id);
    },
    [onSelectElement, layer.id]
  );

  // const handleDoubleClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   e.preventDefault();
  //   const targetElement = wrapperRef.current?.firstElementChild;
  //   if (targetElement) {
  //     // Create a new MouseEvent with the same properties as the original
  //     const newEvent = new MouseEvent("click", {
  //       bubbles: true, // Ensure the event bubbles up if needed
  //       cancelable: true, // Allow it to be cancelled
  //       view: window, // Typically the window object
  //       detail: e.detail, // Copy detail (usually click count)
  //       screenX: e.screenX,
  //       screenY: e.screenY,
  //       clientX: e.clientX,
  //       clientY: e.clientY,
  //       ctrlKey: e.ctrlKey,
  //       altKey: e.altKey,
  //       shiftKey: e.shiftKey,
  //       metaKey: e.metaKey,
  //       button: e.button,
  //       relatedTarget: e.relatedTarget,
  //     });

  //     // Dispatch the new event on the target element
  //     targetElement.dispatchEvent(newEvent);
  //   }
  // };

  const style = useMemo(() => {
    if (!boundingRect) return {};
    return {
      top:
        boundingRect.width < MIN_SIZE && boundingRect.height < MIN_SIZE
          ? boundingRect.top - MIN_SIZE
          : boundingRect.top,
      left:
        boundingRect.width < MIN_SIZE && boundingRect.height < MIN_SIZE
          ? boundingRect.left - MIN_SIZE
          : boundingRect.left,
      width: Math.max(boundingRect.width, MIN_SIZE),
      height: Math.max(boundingRect.height, MIN_SIZE),
      zIndex: zIndex,
    };
  }, [boundingRect, zIndex]);


  const handleWheel = useCallback((e: React.WheelEvent) => {
    const scrollParent = getScrollParent(e.target as HTMLElement);
    if (scrollParent) {
      scrollParent.scrollLeft += e.deltaX;
      scrollParent.scrollTop += e.deltaY;
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchPosition({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (touchPosition) {
      const deltaX = touchPosition.x - e.touches[0].clientX;
      const deltaY = touchPosition.y - e.touches[0].clientY;
      const scrollParent = getScrollParent(e.target as HTMLElement);
      if (scrollParent) {
        scrollParent.scrollLeft += deltaX;
        scrollParent.scrollTop += deltaY;
      }
      setTouchPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    }
  }, [touchPosition]);

  const handleTouchEnd = useCallback(() => {
    setTouchPosition(null);
  }, []);

  return (
    <>
      <span
        data-testid="clickable-overlay"
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
          // onDoubleClick={handleDoubleClick}
          className={cn(
            "fixed box-border hover:border-blue-300 hover:border-2",
            isSelected ? "border-2 border-blue-500 hover:border-blue-500" : ""
          )}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={style}
        >
          {/* {small label with layer type floating above the bounding box} */}
          {isSelected && (
            <span className="absolute top-[-16px] left-[-2px] text-xs text-white bg-blue-500 px-[1px] whitespace-nowrap">
              {layer.name?.toLowerCase().startsWith(layer.type.toLowerCase())
                ? layer.type.replaceAll("_", "")
                : `${layer.name} (${layer.type.replaceAll("_", "")})`}
            </span>
          )}
        </div>
      )}
    </>
  );
};

const ClickableWrapper = memo(
  InternalClickableWrapper,
  (prevProps, nextProps) => {
    if (prevProps.isSelected !== nextProps.isSelected) return false;
    if (prevProps.zIndex !== nextProps.zIndex) return false;
    if (prevProps.totalLayers !== nextProps.totalLayers) return false;
    if (!isDeepEqual(prevProps.layer, nextProps.layer)) return false;
    if (prevProps.listenToScrollParent !== nextProps.listenToScrollParent)
      return false;
    if (prevProps.observeMutations !== nextProps.observeMutations) return false;

    // Assuming functions are memoized by parent and don't change unless necessary
    if (prevProps.onSelectElement !== nextProps.onSelectElement) return false;
    if (prevProps.onDuplicateLayer !== nextProps.onDuplicateLayer) return false;
    if (prevProps.onDeleteLayer !== nextProps.onDeleteLayer) return false;

    // Children comparison can be tricky. If children are simple ReactNodes or are memoized,
    // a shallow compare might be okay. If they are complex and change frequently, this might
    // still cause re-renders or hide necessary ones. For now, let's do a shallow compare.
    if (prevProps.children !== nextProps.children) return false;

    return true; // Props are equal
  }
);

InternalClickableWrapper.displayName = "ClickableWrapperBase"; // Give the base component a unique displayName
ClickableWrapper.displayName = "ClickableWrapper"; // The memoized component gets the original displayName

export { ClickableWrapper };
