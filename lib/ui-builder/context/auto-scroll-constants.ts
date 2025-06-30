// Auto-scroll configuration constants
export const AUTO_SCROLL_THRESHOLD = 50; // Distance in pixels from edge to trigger auto-scroll
export const MIN_SCROLL_SPEED = 5; // Minimum scroll speed in pixels per frame
export const MAX_SCROLL_SPEED = 25; // Maximum scroll speed in pixels per frame

// Auto-scroll state interface
export interface AutoScrollState {
  isScrolling: boolean;
  directions: {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
  };
  speeds: {
    horizontal: number;
    vertical: number;
  };
}

// Helper function to calculate scroll speed based on distance from edge
export const calculateScrollSpeed = (distanceFromEdge: number): number => {
  if (distanceFromEdge >= AUTO_SCROLL_THRESHOLD) return 0;
  
  // Calculate speed as a proportion - closer to edge = faster
  const speedRatio = (AUTO_SCROLL_THRESHOLD - distanceFromEdge) / AUTO_SCROLL_THRESHOLD;
  const easedRatio = Math.pow(speedRatio, 2);
  return MIN_SCROLL_SPEED + (MAX_SCROLL_SPEED - MIN_SCROLL_SPEED) * easedRatio;
}; 