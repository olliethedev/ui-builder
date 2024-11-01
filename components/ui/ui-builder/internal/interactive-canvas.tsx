import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  createUseGesture,
  usePinch,
  dragAction,
  wheelAction,
} from "@use-gesture/react";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";

const MAX_TRANSLATION = 6000;
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

interface InteractiveCanvasProps {
  children: React.ReactNode;
  frameId?: string;
}

export function InteractiveCanvas({ children, frameId }: InteractiveCanvasProps) {
  const windowFrame = frameId
    ? ((document.getElementById(frameId) as HTMLIFrameElement)?.contentDocument)
    : window;

  const [scale, setScale] = useState(0.98);
  const [translation, setTranslation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const previewMode = useEditorStore((state) => state.previewMode); 

  useEffect(() => {
    switch (previewMode) {
      case "mobile":
        setScale(0.98);
        setTranslation({ x: 0, y: 0 });
        break;
      case "tablet":
        setScale(0.98);
        setTranslation({ x: 0, y: 0 });
        break;
      case "desktop":
        setScale(0.86);
        setTranslation({ x: 0, y: 0 });
        break;
      default:
        setScale(0.98);
        setTranslation({ x: 0, y: 0 });
    }
  }, [previewMode]);

  useEffect(() => {
    document.addEventListener("gesturechange", (e) => {
      e.preventDefault();
    });
    document.addEventListener("gestureend", (e) => {
      e.preventDefault();
    });
    document.addEventListener("gesturestart", (e) => {
      e.preventDefault();
    });
    return () => {
      document.removeEventListener("gesturechange", (e) => {
        e.preventDefault();
      });
      document.removeEventListener("gestureend", (e) => {
        e.preventDefault();
      });
      document.removeEventListener("gesturestart", (e) => {
        e.preventDefault();
      });
    };
  }, []);


  const useGesture = createUseGesture([dragAction, wheelAction]);

    const bind =
  useGesture(
    {
      onDragStart: () => {
        setIsDragging(true);
      },
      onDrag: ({ event, delta: [dx, dy] }) => {
        event.preventDefault();
        setTranslation((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      },
      onDragEnd: () => {
        setIsDragging(false);
      },
      onWheel: ({ event, delta: [dx, dy] }) => {
        if (event.metaKey || event.ctrlKey) {
          setScale((prev) => clamp(prev - dy / 100, MIN_SCALE, MAX_SCALE));
        } else {
          setTranslation((prev) => ({
            x: clamp(prev.x - dx, -MAX_TRANSLATION, MAX_TRANSLATION),
            y: clamp(prev.y - dy, -MAX_TRANSLATION, MAX_TRANSLATION),
          }));
        }
      },
    },
    {
      window: windowFrame ? windowFrame : window,
      drag: {
        from: () => [translation.x, translation.y],
        filterTaps: true,
        preventScroll: true,
        target: containerRef,
        eventOptions: { passive: false, capture: true },
        preventDefault: true,
        bounds: {
          left: -MAX_TRANSLATION,
          right: MAX_TRANSLATION,
          top: -MAX_TRANSLATION,
          bottom: MAX_TRANSLATION * 2,
        },
      },
      wheel: {
        target: containerRef,
        eventOptions: { passive: false, capture: true },
      },
      eventOptions: { passive: false, capture: true },
    }
  );

  usePinch(({ delta: [d] }) => {
      setScale((prev) => clamp(prev + d / 50, MIN_SCALE, MAX_SCALE));
    },
    {
        scaleBounds: { min: 0.1, max: 5 },
        rubberband: true,
        target: containerRef,
        eventOptions: { passive: false, capture: true },
        window: windowFrame ? windowFrame : window,
    }
  );

  const transformStyle = useCallback(() => {
    return {
      transform: `translate(${translation.x}px, ${translation.y}px) scale(${scale})`,
      transformOrigin: `center top`,
      touchAction: "none",
    };
  }, [translation.x, translation.y, scale]);

  return (
    <div
      ref={containerRef}
        {...bind()}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      <div style={transformStyle()}>{children}</div>
      <ZoomControls
        onZoomIn={() => setScale(scale + 0.1)}
        onZoomOut={() => setScale(scale - 0.1)}
      />
    </div>
  );
}

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}
const ZoomControls = ({ onZoomIn, onZoomOut }: ZoomControlsProps) => {
  return (
    <div className="absolute bottom-2 right-2">
      <Button
        variant="secondary"
        size="icon"
        className="rounded-l-full rounded-r-none shadow"
        onClick={onZoomIn}
      >
        <PlusIcon />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="rounded-l-none rounded-r-full shadow"
        onClick={onZoomOut}
      >
        <MinusIcon />
      </Button>
    </div>
  );
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
