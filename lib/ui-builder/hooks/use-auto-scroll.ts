import { useCallback, useRef } from 'react';
import { getIframeElements } from '@/lib/ui-builder/context/dnd-utils';
import { 
  AutoScrollState, 
  AUTO_SCROLL_THRESHOLD, 
  calculateScrollSpeed 
} from '../context/auto-scroll-constants';

export const useAutoScroll = () => {
  // Auto-scroll state management
  const autoScrollStateRef = useRef<AutoScrollState>({
    isScrolling: false,
    directions: { left: false, right: false, top: false, bottom: false },
    speeds: { horizontal: 0, vertical: 0 },
  });
  
  const mousePositionRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Auto-scroll logic
  const performAutoScroll = useCallback(() => {
    const iframeElements = getIframeElements();
    if (!iframeElements || !mousePositionRef.current) {
      return;
    }

    const { iframe, window: iframeWindow } = iframeElements;
    
    // Get iframe bounds in viewport coordinates
    const iframeRect = iframe.getBoundingClientRect();
    
    // Convert mouse position to iframe-relative coordinates (without transform)
    const iframeMouseX = mousePositionRef.current.x - iframeRect.left;
    const iframeMouseY = mousePositionRef.current.y - iframeRect.top;
    
    // The scrollable area dimensions are the iframe dimensions
    const scrollableWidth = iframeRect.width;
    const scrollableHeight = iframeRect.height;
    
    const distanceFromLeft = iframeMouseX;
    const distanceFromRight = scrollableWidth - iframeMouseX;
    const distanceFromTop = iframeMouseY;
    const distanceFromBottom = scrollableHeight - iframeMouseY;

    let shouldScrollLeft = distanceFromLeft < AUTO_SCROLL_THRESHOLD;
    let shouldScrollRight = distanceFromRight < AUTO_SCROLL_THRESHOLD;
    let shouldScrollUp = distanceFromTop < AUTO_SCROLL_THRESHOLD;
    let shouldScrollDown = distanceFromBottom < AUTO_SCROLL_THRESHOLD;

    if (shouldScrollLeft && shouldScrollRight) {
      if (distanceFromLeft < distanceFromRight) {
        shouldScrollRight = false;
      } else {
        shouldScrollLeft = false;
      }
    }

    if (shouldScrollUp && shouldScrollDown) {
      if (distanceFromTop < distanceFromBottom) {
        shouldScrollDown = false;
      } else {
        shouldScrollUp = false;
      }
    }
    
    // Calculate scroll speeds
    const leftSpeed = shouldScrollLeft ? calculateScrollSpeed(Math.max(0, distanceFromLeft)) : 0;
    const rightSpeed = shouldScrollRight ? calculateScrollSpeed(Math.max(0, distanceFromRight)) : 0;
    const upSpeed = shouldScrollUp ? calculateScrollSpeed(Math.max(0, distanceFromTop)) : 0;
    const downSpeed = shouldScrollDown ? calculateScrollSpeed(Math.max(0, distanceFromBottom)) : 0;
    
    // Update auto-scroll state
    const state = autoScrollStateRef.current;
    state.directions = {
      left: shouldScrollLeft,
      right: shouldScrollRight,
      top: shouldScrollUp,
      bottom: shouldScrollDown,
    };
    state.speeds = {
      horizontal: leftSpeed || rightSpeed,
      vertical: upSpeed || downSpeed,
    };
    state.isScrolling = shouldScrollLeft || shouldScrollRight || shouldScrollUp || shouldScrollDown;
    
    // Perform the actual scrolling
    if (state.isScrolling) {
      let scrollX = 0;
      let scrollY = 0;
      
      if (shouldScrollLeft) scrollX = -leftSpeed;
      else if (shouldScrollRight) scrollX = rightSpeed;
      
      if (shouldScrollUp) scrollY = -upSpeed;
      else if (shouldScrollDown) scrollY = downSpeed;
      
      // Apply scroll to iframe content
      if (scrollX !== 0 || scrollY !== 0) {
        try {
          iframeWindow.scrollBy(scrollX, scrollY);
        } catch (error) {
          console.warn('Auto-scroll failed:', error);
        }
      }
      
      // Continue scrolling
      animationFrameRef.current = requestAnimationFrame(performAutoScroll);
    } else {
      // Stop scrolling
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, []);

  // Mouse move handler for auto-scroll (parent document)
  const handleParentMouseMove = useCallback((event: MouseEvent, activeLayerId: string | null) => {
    if (!activeLayerId) return;
    
    mousePositionRef.current = { x: event.clientX, y: event.clientY };
    
    // Start auto-scroll if not already running
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(performAutoScroll);
    }
  }, [performAutoScroll]);

  // Mouse move handler for auto-scroll (iframe content)
  const handleIframeMouseMove = useCallback((event: MouseEvent, activeLayerId: string | null) => {
    if (!activeLayerId) return;
    
    const iframeElements = getIframeElements();
    if (!iframeElements) return;
    
    const { iframe } = iframeElements;
    const iframeRect = iframe.getBoundingClientRect();
    
    // Convert iframe-relative mouse position to parent document coordinates
    const parentX = event.clientX + iframeRect.left;
    const parentY = event.clientY + iframeRect.top;
    
    mousePositionRef.current = { x: parentX, y: parentY };
    
    // Start auto-scroll if not already running
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(performAutoScroll);
    }
  }, [performAutoScroll]);

  // Stop auto-scroll function
  const stopAutoScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    autoScrollStateRef.current = {
      isScrolling: false,
      directions: { left: false, right: false, top: false, bottom: false },
      speeds: { horizontal: 0, vertical: 0 },
    };
    
    mousePositionRef.current = null;
  }, []);

  return {
    handleParentMouseMove,
    handleIframeMouseMove,
    stopAutoScroll,
    autoScrollState: autoScrollStateRef.current,
  };
}; 