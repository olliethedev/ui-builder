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



  // Resizable Wrapper Component for responsive mode
  interface ResizableWrapperProps {
    children: React.ReactNode;
    isResizable: boolean;
    onDraggingChange?: (dragging: boolean) => void;
    onSizeChange?: (width: number) => void;
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
    } | null>(null);
    const initialSizeRef = useRef<{ width: number }>({ width: 0 });
  
    // Set initial responsive size
    useLayoutEffect(() => {
      if (isResizable) {
        const initialWidth = 800; // Default responsive width
        setResponsiveSize({ width: initialWidth });
        onSizeChange?.(initialWidth);
      }
    }, [isResizable, onSizeChange]);
  
      const handleSetDragging = useCallback(
    (value: boolean) => {
      setDragging(value);
      onDraggingChange?.(value);
    },
    [onDraggingChange]
  );

  const dragConfig = useMemo(() => {
    return {
      axis: "x",
      from: () => [0, 0],
      filterTaps: true,
    } as DragConfig;
  }, []);

  // Handle resizing using useDrag for responsive mode
  const bindResizer = useDrag(({ down, movement: [mx], first, last }) => {
    if (first) {
      // Capture the initial size when drag starts
      initialSizeRef.current = {
        width: responsiveSize?.width || 800,
      };
      handleSetDragging(true);
    }

    if (down) {
      // Calculate new size based on initial size and movement
      const newWidth = Math.max(320, initialSizeRef.current.width + mx); // Min width of 320px
      setResponsiveSize({ width: newWidth });
      onSizeChange?.(newWidth);
    }

    // Notify when drag ends for final measurement update
    if (last) {
      // Small delay to ensure DOM updates are complete
      setTimeout(() => {
        handleSetDragging(false);
      }, 0);
    }
  }, dragConfig as any);

  const bindResizerValues = useMemo(() => {
    return typeof bindResizer === "function" ? bindResizer() : {};
  }, [bindResizer]);

  const resizerStyle = useMemo(() => {
    return {
      left: responsiveSize?.width
        ? `${responsiveSize.width - 80}px`
        : undefined,
    };
  }, [responsiveSize]);

  const responsiveWidthStyle = useMemo(() => {
    if (isResizable && responsiveSize) {
      return { width: `${responsiveSize.width}px` };
    }
    return {};
  }, [isResizable, responsiveSize]);
  
    const contextValue = useMemo(() => ({
      dragging,
      setDragging: handleSetDragging
    }), [dragging, handleSetDragging]);
  
    return (
      <DragHandleContext.Provider
        value={contextValue}
      >
        <div className="relative" style={responsiveWidthStyle}>
          {isResizable && (
            <>
              <Resizer
                {...bindResizerValues}
                className="absolute top-0 right-[-40px]"
                style={resizerStyle}
              >
                <GripVertical className="w-4 h-4" />
              </Resizer>
              <Resizer
                {...bindResizerValues}
                className="absolute bottom-7 right-[-40px]"
                style={resizerStyle}
              >
                <GripVertical className="w-4 h-4" />
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
          "flex items-center justify-center w-4 h-4 cursor-ew-resize rounded-sm border bg-border hover:bg-muted touch-none z-[1001]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  };
  