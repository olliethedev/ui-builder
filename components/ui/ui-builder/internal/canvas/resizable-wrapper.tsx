import React, {
    useCallback,
    useMemo,
    useState,
    createContext,
    useLayoutEffect,
    useRef,
  } from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import { useDrag } from "@use-gesture/react";
import { DragConfig } from "@use-gesture/react";

const RESPONSIVE_DEFAULT_SIZE = 800;

  // Resizable Wrapper Component for responsive mode
  interface ResizableWrapperProps {
    children: React.ReactNode;
    isResizable: boolean;
    onDraggingChange?: (dragging: boolean) => void;
    onSizeChange?: (width: number, height: number) => void;
  }
  
export  const ResizableWrapper: React.FC<ResizableWrapperProps> = ({
    children,
    isResizable,
    onDraggingChange,
    onSizeChange,
  }) => {
    const [dragging, setDragging] = useState(false);
    const [responsiveSize, setResponsiveSize] = useState<{
      width: number;
      height: number;
    } | null>(null);
    const initialSizeRef = useRef<{ width: number, height: number }>({ width: 0, height: 0 });
  
    // Set initial responsive size
    useLayoutEffect(() => {
      if (isResizable) {
        const initialWidth = RESPONSIVE_DEFAULT_SIZE; // Default responsive width
        const initialHeight = RESPONSIVE_DEFAULT_SIZE; // Default responsive height
        setResponsiveSize({ width: initialWidth, height: initialHeight });
        onSizeChange?.(initialWidth, initialHeight);
      }
    }, [isResizable, onSizeChange]);
  
      const handleSetDragging = useCallback(
    (value: boolean) => {
      setDragging(value);
      onDraggingChange?.(value);
    },
    [onDraggingChange]
  );

  const horizontalDragConfig = useMemo(() => {
    return {
      axis: "x",
      from: () => [0, 0],
      filterTaps: true,
    } as DragConfig;
  }, []);

  const verticalDragConfig = useMemo(() => {
    return {
      axis: "y",
      from: () => [0, 0],
      filterTaps: true,
    } as DragConfig;
  }, []);

  // Handle horizontal resizing
  const bindHorizontalResizer = useDrag(({ down, movement: [mx], first, last }) => {
    if (first) {
      // Capture the initial size when drag starts
      initialSizeRef.current = {
        width: responsiveSize?.width || RESPONSIVE_DEFAULT_SIZE,
        height: responsiveSize?.height || RESPONSIVE_DEFAULT_SIZE,
      };
      handleSetDragging(true);
    }

    if (down) {
      // Calculate new width based on initial size and movement
      const newWidth = Math.max(320, initialSizeRef.current.width + mx); // Min width of 320px
      const newHeight = initialSizeRef.current.height; // Keep height unchanged
      setResponsiveSize({ width: newWidth, height: newHeight });
      onSizeChange?.(newWidth, newHeight);
    }

    // Notify when drag ends for final measurement update
    if (last) {
      // Small delay to ensure DOM updates are complete
      setTimeout(() => {
        handleSetDragging(false);
      }, 0);
    }
  }, horizontalDragConfig as any);

  // Handle vertical resizing
  const bindVerticalResizer = useDrag(({ down, movement: [, my], first, last }) => {
    if (first) {
      // Capture the initial size when drag starts
      initialSizeRef.current = {
        width: responsiveSize?.width || RESPONSIVE_DEFAULT_SIZE,
        height: responsiveSize?.height || RESPONSIVE_DEFAULT_SIZE,
      };
      handleSetDragging(true);
    }

    if (down) {
      // Calculate new height based on initial size and movement
      const newWidth = initialSizeRef.current.width; // Keep width unchanged
      const newHeight = Math.max(200, initialSizeRef.current.height + my); // Min height of 200px
      setResponsiveSize({ width: newWidth, height: newHeight });
      onSizeChange?.(newWidth, newHeight);
    }

    // Notify when drag ends for final measurement update
    if (last) {
      // Small delay to ensure DOM updates are complete
      setTimeout(() => {
        handleSetDragging(false);
      }, 0);
    }
  }, verticalDragConfig as any);

  const bindHorizontalResizerValues = useMemo(() => {
    return typeof bindHorizontalResizer === "function" ? bindHorizontalResizer() : {};
  }, [bindHorizontalResizer]);

  const bindVerticalResizerValues = useMemo(() => {
    return typeof bindVerticalResizer === "function" ? bindVerticalResizer() : {};
  }, [bindVerticalResizer]);

  const responsiveStyle = useMemo(() => {
    if (isResizable && responsiveSize) {
      return { 
        width: `${responsiveSize.width}px`,
        height: `${responsiveSize.height}px`
      };
    }
    // When not resizable, ensure we inherit the parent's width constraint
    return { width: '100%' };
  }, [isResizable, responsiveSize]);
  
    const contextValue = useMemo(() => ({
      dragging,
      setDragging: handleSetDragging
    }), [dragging, handleSetDragging]);
  
    return (
      <DragHandleContext.Provider
        value={contextValue}
      >
        <div className="relative" style={responsiveStyle}>
          {isResizable && (
            <>
              {/* Horizontal resizer on the right middle */}
              <Resizer
                {...bindHorizontalResizerValues}
                className="absolute top-1/2 right-[-20px] -translate-y-1/2"
              >
                <GripVertical className="w-4 h-4" />
              </Resizer>
              {/* Vertical resizer at the bottom center */}
              <Resizer
                {...bindVerticalResizerValues}
                className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 cursor-ns-resize"
              >
                <GripVertical className="w-4 h-4 rotate-90" />
              </Resizer>
            </>
          )}
          {children}
        </div>
      </DragHandleContext.Provider>
    );
  };

  // Context to track if a drag handle is active
export const DragHandleContext = createContext<{
    dragging: boolean;
    setDragging: (v: boolean) => void;
  }>({ dragging: false, setDragging: () => {} });
  
  // Resizer Handle Component
  const Resizer = ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => {
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
    }, []);
  
    const handleTouchStart = useCallback(
      (e: React.TouchEvent<HTMLDivElement>) => {
        e.stopPropagation();
      },
      []
    );
  
    return (
      <div
        data-testid="resizer"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={cn(
          "flex items-center justify-center w-4 h-4 rounded-sm border bg-border hover:bg-muted touch-none z-[1001]",
          // Default cursor is ew-resize, but can be overridden by className
          !className?.includes('cursor-') && "cursor-ew-resize",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  };
  