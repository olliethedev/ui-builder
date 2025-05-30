import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { GripVertical } from "lucide-react";
import { DragConfig, useDrag } from "@use-gesture/react";
import { cn } from "@/lib/utils";

const initialSize = { width: 0 };

interface IframeWrapperProps extends React.HTMLAttributes<HTMLIFrameElement> {
  children: React.ReactNode;
  frameId?: string;
  resizable: boolean;
}

export const IframeWrapper: React.FC<IframeWrapperProps> = React.memo(
  ({ children, frameId, resizable, style, ...props }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const mountNodeRef = useRef<HTMLElement | null>(null); // Ref to store the mount node
    const [iframeSize, setIframeSize] = useState<{ width: number } | null>(
      null
    );
    const [isMounted, setIsMounted] = useState<boolean>(false); // State to track mount node readiness



    // Ref to store the initial size at the start of dragging
    const initialSizeRef = useRef<{ width: number }>(initialSize);

    const updateIframeHeight = () => {
      if (!iframeRef.current || !mountNodeRef.current) return;
      const newHeight = mountNodeRef.current.scrollHeight;
      iframeRef.current.style.height = `${newHeight}px`;
    };

    const dragConfig = useMemo(() => {
      return {
        axis: "x",
        from: () => [0, 0],
        filterTaps: true,
      } as DragConfig
    }, []);

    // Handle resizing using useDrag
    const bindResizer = useDrag(
      ({ down, movement: [mx], first }) => {
        if (first) {
          // Capture the initial size when drag starts
          initialSizeRef.current = {
            width: iframeRef.current?.offsetWidth || 0,
          };
        }

        if (down) {
          // Calculate new size based on initial size and movement
          setIframeSize({
            width: initialSizeRef.current.width + mx,
          });
        }
      },
      dragConfig as any
    );

    useLayoutEffect(() => {
        if (resizable && iframeRef.current) {
          setIframeSize({
            width: iframeRef.current.parentElement?.offsetWidth || 600, // Fallback to 600px or any default width
          });
        }
      }, [resizable]);

    useLayoutEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const handleLoad = () => {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        if (!mountNodeRef.current) {
          // Create a div inside the iframe for mounting React components only once
          const mountNode = iframeDoc.createElement("div");
          mountNode.id = "iframe-mount-node";
          iframeDoc.body.appendChild(mountNode);
          mountNodeRef.current = mountNode;

          iframeDoc.body.style.backgroundColor = "transparent";

          // Function to inject stylesheets into the iframe
          const injectStylesheets = () => {
            // Select all linked stylesheets in the parent document
            const links = Array.from(
              document.querySelectorAll('link[rel="stylesheet"]')
            );
            // Select all style tags in the parent document
            const styles = Array.from(document.querySelectorAll("style"));

            // Inject linked stylesheets
            links.forEach((link) => {
              const clonedLink = iframeDoc.createElement("link");
              clonedLink.rel = "stylesheet";
              clonedLink.href = (link as HTMLLinkElement).href;
              iframeDoc.head.appendChild(clonedLink);
            });

            // Inject inline styles
            styles.forEach((style) => {
              const clonedStyle = iframeDoc.createElement("style");
              clonedStyle.textContent = style.textContent || "";
              iframeDoc.head.appendChild(clonedStyle);
            });
          };

          // Inject styles on initial load
          injectStylesheets();

          const resizeObserver = new ResizeObserver(() => {
            updateIframeHeight();
          });

          // Observe the mount node for size changes
          resizeObserver.observe(mountNodeRef.current);

          const mutationObserver = new MutationObserver(() => {
            updateIframeHeight();
          });

          // Observe the mount node for changes
          mutationObserver.observe(mountNodeRef.current, {
            childList: true,
            subtree: true,
          });

          // Initial height update
          setTimeout(updateIframeHeight, 0);

          // Set the mount node as ready
          setIsMounted(true);

          // Cleanup observer on unmount
          return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
          };
        }
      };

      // Attach the load event listener
      iframe.addEventListener("load", handleLoad);

      // If the iframe is already loaded, trigger the handler
      if (iframe.contentDocument?.readyState === "complete") {
        handleLoad();
      }

      // Cleanup event listener on unmount
      return () => {
        iframe.removeEventListener("load", handleLoad);
      };
    }, [children]);


    const resizerStyle = useMemo(() => {
      return {
        left: iframeSize?.width ? `${iframeSize.width}px` : undefined
      }
    }, [iframeSize]);

    const iframeStyle = useMemo(() => {
      return {
        width: resizable
          ? iframeSize
            ? `${iframeSize.width}px`
            : "100%"
          : undefined,
        opacity: isMounted ? 1 : 0,
        transition: "opacity 0.5s ease-in",
        ...style,
      }
    }, [iframeSize, resizable, isMounted, style]);

    const bindResizerValues = useMemo(() => {
      return typeof bindResizer === 'function' ? bindResizer() : {};
    }, [bindResizer]);

    return (
      <div className="relative block">
        {resizable && (
          <Resizer {...bindResizerValues} className="absolute top-0 right-[-7px]" style={resizerStyle}>
            <GripVertical className="w-4 h-4" />
          </Resizer>
        )}
        <iframe
          title="Page Editor"
          id={frameId}
          ref={iframeRef}
          {...props}
          style={iframeStyle}
        />
        {isMounted &&
          mountNodeRef.current &&
          ReactDOM.createPortal(children, mountNodeRef.current)}
        {resizable && (
          <Resizer
            {...bindResizerValues}
            className="absolute bottom-7 right-[-7px] "
            style={resizerStyle}
          >
            <GripVertical className="w-4 h-4" />
          </Resizer>
        )}
      </div>
    );
  }
);

IframeWrapper.displayName = "IframeWrapper";

const Resizer = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      data-testid="resizer"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={cn(
        "flex items-center justify-center w-4 h-4 cursor-ew-resize rounded-sm border bg-border hover:bg-muted touch-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
