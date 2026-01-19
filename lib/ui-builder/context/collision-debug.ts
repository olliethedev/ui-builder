/**
 * Collision Debug Utility for DnD Kit
 * 
 * This utility provides visual debugging for drag-and-drop collision detection.
 * It displays:
 * - Original pointer position (red circle)
 * - Adjusted pointer position (blue circle)
 * - Droppable rectangles (orange boxes, lime when colliding)
 * - Collision lines connecting pointer to detected collisions
 * - Debug info panel with coordinates and collision count
 * 
 * Usage:
 * - In browser console: enableCollisionDebug() to turn on
 * - In browser console: disableCollisionDebug() to turn off
 * - In browser console: toggleCollisionDebug() to toggle
 * - In browser console: clearDebugElements() to clear visualizations
 * 
 * Debug visualizations automatically clear after a few seconds.
 */

import type { Collision, UniqueIdentifier } from "@dnd-kit/core";
import type { Coordinates } from "@dnd-kit/utilities";
import { getIframeElements } from '@/lib/ui-builder/context/dnd-utils';

// Enable/disable debug visualization
let DEBUG = false;

const debugElements: Record<
  string,
  { svg: SVGSVGElement; elements: SVGElement[] }
> = {};

let timeout: NodeJS.Timeout;

// Main debug function for collision visualization
export const collisionDebug = (
  pointerCoordinates: Coordinates,
  adjustedPointerCoordinates: Coordinates,
  droppableRects: Map<UniqueIdentifier, { top: number; left: number; bottom: number; right: number; width: number; height: number }>,
  collisions: Collision[],
  options: {
    showPointer?: boolean;
    showRects?: boolean;
    showCollisions?: boolean;
    autoHide?: boolean;
    hideDelay?: number;
  } = {}
) => {
  if (!DEBUG) return;

  const {
    showPointer = true,
    showRects = true,
    showCollisions = true,
    autoHide = true,
    hideDelay = 2000
  } = options;

  const debugId = "collision-debug";

  // Clear previous timeout
  clearTimeout(timeout);

  // Auto-hide after delay
  if (autoHide) {
    timeout = setTimeout(() => {
      clearDebugElements();
    }, hideDelay);
  }

  requestAnimationFrame(() => {
    // Clear existing debug elements
    clearDebugElements();

    // Get iframe elements and positioning
    const iframeElements = getIframeElements();
    if (!iframeElements) {
      console.warn('Could not find iframe for debug overlay positioning');
      return;
    }

    const { iframe, window: iframeWindow } = iframeElements;
    const iframeRect = iframe.getBoundingClientRect();
    const iframeScrollOffset = {
      x: iframeWindow.pageXOffset || iframeWindow.scrollX || 0,
      y: iframeWindow.pageYOffset || iframeWindow.scrollY || 0,
    };

    const svgNs = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNs, "svg");
    const elements: SVGElement[] = [];

    // Setup SVG container positioned inside iframe to cover the entire content area
    svg.setAttribute("id", debugId);
    svg.setAttribute(
      "style",
      `position: absolute; height: 100%; width: 100%; pointer-events: none; top: 0px; left: 0px; z-index: 9999; overflow: visible;`
    );

    // Convert coordinates to iframe content positioning
    const originalPointerRelative = {
      x: pointerCoordinates.x,
      y: pointerCoordinates.y
    };
    
    // The adjustedPointerCoordinates should already be in content coordinates
    // but let's make sure we're displaying them correctly
    const adjustedPointerRelative = {
      x: adjustedPointerCoordinates.x + iframeRect.left,
      y: adjustedPointerCoordinates.y + iframeRect.top
    };

    // Debug: log the coordinate spaces to console  
    console.log('🎯 Debug Coordinates:', {
      original: pointerCoordinates,
      originalRelative: originalPointerRelative,
      adjusted: adjustedPointerCoordinates,
      adjustedRelative: adjustedPointerRelative,
      iframeRect,
      iframeScrollOffset,
      // Show first few rectangles for comparison (before and after conversion)
      sampleRects: Array.from(droppableRects.entries()).slice(0, 2).map(([id, rect]) => ({
        id,
        original: rect,
        converted: {
          left: rect.left + iframeRect.left,
          top: rect.top + iframeRect.top,
          width: rect.width,
          height: rect.height
        }
      }))
    });

    // Show pointer positions
    if (showPointer) {
      // Original pointer (relative to iframe)
      const originalPointer = createCircle(originalPointerRelative.x, originalPointerRelative.y, 6, "red", "Original Pointer");
      elements.push(originalPointer);
      svg.appendChild(originalPointer);

      // Adjusted pointer (relative to iframe content)
      const adjustedPointer = createCircle(adjustedPointerRelative.x, adjustedPointerRelative.y, 6, "blue", "Adjusted Pointer");
      elements.push(adjustedPointer);
      svg.appendChild(adjustedPointer);

      // Line connecting original and adjusted pointers
      if (originalPointerRelative.x !== adjustedPointerRelative.x || originalPointerRelative.y !== adjustedPointerRelative.y) {
        const connectionLine = createLine(
          originalPointerRelative.x, originalPointerRelative.y,
          adjustedPointerRelative.x, adjustedPointerRelative.y,
          "purple", 2, "dashed"
        );
        elements.push(connectionLine);
        svg.appendChild(connectionLine);
      }
    }

    // Show droppable rectangles
    if (showRects) {
      droppableRects.forEach((rect, id) => {
        const isColliding = collisions.some(c => c.id === id);
        const color = isColliding ? "lime" : "orange";
        const opacity = isColliding ? "0.3" : "0.1";
        
        // Convert rectangle coordinates to iframe-relative coordinates
        const rectRelative = {
          left: rect.left + iframeRect.left,
          top: rect.top + iframeRect.top,
          width: rect.width,
          height: rect.height
        };
        
        const rectElement = createRect(rectRelative.left, rectRelative.top, rectRelative.width, rectRelative.height, color, opacity);
        elements.push(rectElement);
        svg.appendChild(rectElement);

        // Add label for the rectangle
        const label = createText(rectRelative.left + 2, rectRelative.top + 12, String(id), "black", "10px");
        elements.push(label);
        svg.appendChild(label);
      });
    }

    // Show collision connections
    if (showCollisions && collisions.length > 0) {
      collisions.forEach((collision) => {
        const rect = droppableRects.get(collision.id);
        if (rect) {
          // Convert rectangle coordinates to iframe-relative coordinates
          const rectRelative = {
            left: rect.left + iframeRect.left,
            top: rect.top + iframeRect.top,
            width: rect.width,
            height: rect.height
          };
          
          // Draw line from adjusted pointer to collision center
          const centerX = rectRelative.left + rectRelative.width / 2;
          const centerY = rectRelative.top + rectRelative.height / 2;
          
          const collisionLine = createLine(
            adjustedPointerRelative.x, adjustedPointerRelative.y,
            centerX, centerY,
            "lime", 3, "solid"
          );
          elements.push(collisionLine);
          svg.appendChild(collisionLine);

          // Add collision info text
          const collisionText = createText(
            centerX, centerY - 5,
            `Collision: ${String(collision.id)}`,
            "lime", "12px", "bold"
          );
          elements.push(collisionText);
          svg.appendChild(collisionText);
        }
      });
    }

    // Add debug info panel with detailed coordinate info
    const infoPanel = createInfoPanel(originalPointerRelative, adjustedPointerRelative, collisions.length, {
      iframeScrollOffset,
      isAtTop: Math.abs(iframeScrollOffset.y) < 5,
      originalViewport: pointerCoordinates
    });
    elements.push(infoPanel);
    svg.appendChild(infoPanel);

    // Position debug overlay inside iframe document so it scrolls naturally with content
    const { document: iframeDoc } = iframeElements;
    iframeDoc.body.appendChild(svg);
    debugElements[debugId] = { svg, elements };
  });
};

// Utility function to clear all debug elements
export const clearDebugElements = () => {
  Object.entries(debugElements).forEach(([id, { svg }]) => {
    svg.remove();
    delete debugElements[id];
  });
};

// Utility function to toggle debug mode
export const toggleCollisionDebug = () => {
  DEBUG = !DEBUG;
  console.log(`🎯 Collision Debug ${DEBUG ? 'ENABLED' : 'DISABLED'}`);
  if (!DEBUG) {
    clearDebugElements();
  }
  return DEBUG;
};

// Utility function to enable debug mode
export const enableCollisionDebug = () => {
  DEBUG = true;
  console.log('🎯 Collision Debug ENABLED');
  return DEBUG;
};

// Utility function to disable debug mode
export const disableCollisionDebug = () => {
  DEBUG = false;
  clearDebugElements();
  console.log('🎯 Collision Debug DISABLED');
  return DEBUG;
};

// Make debug functions available globally for console access (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as any).toggleCollisionDebug = toggleCollisionDebug;
  (window as any).enableCollisionDebug = enableCollisionDebug;
  (window as any).disableCollisionDebug = disableCollisionDebug;
  (window as any).clearDebugElements = clearDebugElements;
}

// Helper functions for creating SVG elements
function createCircle(x: number, y: number, radius: number, color: string, title?: string): SVGCircleElement {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", x.toString());
  circle.setAttribute("cy", y.toString());
  circle.setAttribute("r", radius.toString());
  circle.setAttribute("fill", color);
  circle.setAttribute("stroke", "white");
  circle.setAttribute("stroke-width", "2");
  
  if (title) {
    const titleElement = document.createElementNS("http://www.w3.org/2000/svg", "title");
    titleElement.textContent = title;
    circle.appendChild(titleElement);
  }
  
  return circle;
}

function createLine(
  x1: number, y1: number, x2: number, y2: number,
  color: string, width: number = 2, dashArray?: string
): SVGLineElement {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1.toString());
  line.setAttribute("y1", y1.toString());
  line.setAttribute("x2", x2.toString());
  line.setAttribute("y2", y2.toString());
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", width.toString());
  
  if (dashArray) {
    line.setAttribute("stroke-dasharray", dashArray === "dashed" ? "5,5" : dashArray);
  }
  
  return line;
}

function createRect(
  x: number, y: number, width: number, height: number,
  color: string, opacity: string = "0.2"
): SVGRectElement {
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x.toString());
  rect.setAttribute("y", y.toString());
  rect.setAttribute("width", width.toString());
  rect.setAttribute("height", height.toString());
  rect.setAttribute("fill", color);
  rect.setAttribute("fill-opacity", opacity);
  rect.setAttribute("stroke", color);
  rect.setAttribute("stroke-width", "1");
  
  return rect;
}

function createText(
  x: number, y: number, text: string, color: string = "black",
  fontSize: string = "12px", fontWeight: string = "normal"
): SVGTextElement {
  const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textElement.setAttribute("x", x.toString());
  textElement.setAttribute("y", y.toString());
  textElement.setAttribute("fill", color);
  textElement.setAttribute("font-size", fontSize);
  textElement.setAttribute("font-weight", fontWeight);
  textElement.setAttribute("font-family", "monospace");
  textElement.textContent = text;
  
  return textElement;
}

function createInfoPanel(
  originalPointer: Coordinates,
  adjustedPointer: Coordinates,
  collisionCount: number,
  debugInfo?: {
    iframeScrollOffset: { x: number; y: number };
    isAtTop: boolean;
    originalViewport: Coordinates;
  }
): SVGGElement {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  
  // Background
  const bg = createRect(10, 10, 350, 140, "white", "0.9");
  bg.setAttribute("stroke", "black");
  bg.setAttribute("stroke-width", "1");
  group.appendChild(bg);
  
  // Info text
  const lines = [
    `Original Pointer: (${Math.round(originalPointer.x)}, ${Math.round(originalPointer.y)})`,
    `Adjusted Pointer: (${Math.round(adjustedPointer.x)}, ${Math.round(adjustedPointer.y)})`,
    `Collisions Found: ${collisionCount}`,
    `Debug Mode: ON`
  ];

  if (debugInfo) {
    lines.push(
      `Scroll: (${Math.round(debugInfo.iframeScrollOffset.x)}, ${Math.round(debugInfo.iframeScrollOffset.y)})`,
      `At Top: ${debugInfo.isAtTop}`,
      `Viewport: (${Math.round(debugInfo.originalViewport.x)}, ${Math.round(debugInfo.originalViewport.y)})`
    );
  }
  
  lines.forEach((line, index) => {
    const text = createText(15, 30 + (index * 15), line, "black", "11px");
    group.appendChild(text);
  });
  
  return group;
}

// Debug function specifically for your collision detection system
export const debugCollisionDetection = (
  originalPointer: Coordinates,
  adjustedPointer: Coordinates,
  droppableRects: Map<UniqueIdentifier, any>,
  collisions: Collision[],
  debugInfo?: any
) => {
  if (!DEBUG) return;

  console.group("🎯 Collision Detection Debug");
  console.log("Original Pointer:", originalPointer);
  console.log("Adjusted Pointer:", adjustedPointer);
  console.log("Droppable Rects:", Array.from(droppableRects.entries()));
  console.log("Collisions:", collisions);
  
  if (debugInfo) {
    console.log("Additional Debug Info:", debugInfo);
  }
  
  console.groupEnd();

  // Visual debug
  collisionDebug(originalPointer, adjustedPointer, droppableRects, collisions, {
    showPointer: true,
    showRects: true,
    showCollisions: true,
    autoHide: true,
    hideDelay: 3000
  });
}; 