import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  createUseGesture,
  pinchAction,
  wheelAction,
  dragAction,
} from "@use-gesture/react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";

const MAX_TRANSLATION = 6000;
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

interface InteractiveCanvasProps {
  children: React.ReactNode;
  frameId?: string;
  disableWheel: boolean;
  disablePinch: boolean;
  disableDrag: boolean;
}

export function InteractiveCanvas({
  children,
  frameId,
  disableWheel,
  disablePinch,
  disableDrag,
}: InteractiveCanvasProps) {

  const windowFrame = frameId
    ? (document.getElementById(frameId) as HTMLIFrameElement)?.contentDocument
    : window;

  const [scale, setScale] = useState(0.98);
  const [translation, setTranslation] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const previewMode = useEditorStore((state) => state.previewMode);

  const zoom = useCallback((scaleDelta: number) => {
    setScale((prevScale) => {
      const newScale = clamp(prevScale + scaleDelta, MIN_SCALE, MAX_SCALE);

      return newScale;
    });
  }, []);

  useEffect(() => {
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("gesturechange", handleGesture);
    document.addEventListener("gestureend", handleGesture);
    document.addEventListener("gesturestart", handleGesture);
    return () => {
      document.removeEventListener("gesturechange", handleGesture);
      document.removeEventListener("gestureend", handleGesture);
      document.removeEventListener("gesturestart", handleGesture);
    };
  }, []);

  useEffect(() => {
    // Reset scale and translation on preview mode change to center the contents
    switch (previewMode) {
      case "tablet":
        setScale(0.80);
        setTranslation({ x: -30, y: 5 });
        break;
      case "desktop":
        setScale(0.46);
        setTranslation({ x: -170, y: 5 });
        break;
      default:
        setScale(0.95);
        setTranslation({ x: 0, y: 5 });
    }
  }, [previewMode]);

  const useGestureHook = createUseGesture([wheelAction, pinchAction, dragAction]);

  const bind = useGestureHook(
    {
      onWheel: ({ event, delta }) => {
        // Normalize deltaY for different deltaModes
        let deltaY = delta[1];
        if (event.deltaMode === 1) {
          // Delta is in lines; convert to pixels
          deltaY *= 16; // Approximate line height in pixels
        } else if (event.deltaMode === 2) {
          // Delta is in pages; convert to pixels
          deltaY *= window.innerHeight;
        }

        if (event.metaKey || event.ctrlKey) {
          // Zoom based on normalized deltaY
          zoom(-deltaY / 500);
        } else {
          // Handle panning
          setTranslation((prev) => ({
            x: clamp(prev.x - delta[0], -MAX_TRANSLATION, MAX_TRANSLATION),
            y: clamp(prev.y - deltaY, -MAX_TRANSLATION, MAX_TRANSLATION),
          }));
        }
      },
      onPinch: ({ delta: [d] }) => {
        zoom(d / 200);
      },
      onDrag: ({ movement: [x, y] }) => {
        setTranslation((prev) => ({
          x: clamp(prev.x + x, -MAX_TRANSLATION, MAX_TRANSLATION),
          y: clamp(prev.y + y, -MAX_TRANSLATION, MAX_TRANSLATION),
        }));
      },
    },
    {
      window: windowFrame || window,

      wheel: {
        target: containerRef,
        eventOptions: { passive: false, capture: true },
        window: windowFrame || window,
        enabled: !disableWheel,
      },
      pinch: {
        rubberband: true,
        target: containerRef,
        eventOptions: { passive: false, capture: true },
        window: windowFrame || window,
        enabled: !disablePinch,
      },
      drag: {
        target: containerRef,
        eventOptions: { passive: false, capture: true },
        enabled: !disableDrag,
      },
    }
  );

  const transformStyle = useCallback(() => {
    return {
      transform: `translate(${translation.x}px, ${translation.y}px) scale(${scale})`,
      transformOrigin: "top center",
    };
  }, [translation.x, translation.y, scale]);

  const handleZoomIn = () => {
    zoom(0.05);
  };

  const handleZoomOut = () => {
    zoom(-0.05);
  };

  return (
    <div
      ref={containerRef}
      {...bind()}
      className="w-full h-full overflow-hidden relative touch-none cursor-default transition-transform duration-100 ease-in-out"
    >
      <div data-testid="interactive-canvas-container" className="touch-none" style={transformStyle()}>
        {children}
      </div>
      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
    </div>
  );
}

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const ZoomControls = ({ onZoomIn, onZoomOut }: ZoomControlsProps) => {
  return (
    <div className="absolute bottom-2 md:right-2 right-4">
      <Button
        data-testid="button-ZoomIn"
        variant="secondary"
        size="icon"
        className="rounded-l-full rounded-r-none shadow md:p-4 p-6"
        onClick={onZoomIn}
      >
        <ZoomIn />
      </Button>
      <Button
        data-testid="button-ZoomOut"
        variant="secondary"
        size="icon"
        className="rounded-l-none rounded-r-full shadow md:p-4 p-6"
        onClick={onZoomOut}
      >
        <ZoomOut />
      </Button>
    </div>
  );
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
