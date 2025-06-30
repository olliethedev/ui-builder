import {
    CollisionDetection,
    pointerWithin,
    rectIntersection,
} from '@dnd-kit/core';
import { getIframeElements } from '@/lib/ui-builder/context/dnd-utils';
import { debugCollisionDetection } from '@/lib/ui-builder/context/collision-debug';


// Transform state interface
interface TransformState {
    scale: number;
    positionX: number;
    positionY: number;
}


// Custom collision detection that accounts for transform state
export const createTransformAwareCollisionDetection = (): CollisionDetection => {
    return ({ active, droppableRects, droppableContainers, pointerCoordinates, collisionRect }) => {
        if (!pointerCoordinates) {
            return [];
        }

        const transformState = getTransformState();

        // Get iframe and its current scroll position (force fresh read)
        const iframeElements = getIframeElements();
        let iframeScrollOffset = { x: 0, y: 0 };
        let iframeRect = { left: 0, top: 0 };

        if (iframeElements) {
            const { iframe, window: iframeWindow } = iframeElements;
            if (iframeWindow) {
                // Force a fresh read of scroll position to handle auto-scroll updates
                iframeScrollOffset = {
                    x: iframeWindow.pageXOffset || iframeWindow.scrollX || 0,
                    y: iframeWindow.pageYOffset || iframeWindow.scrollY || 0,
                };
            }

            // Get iframe position relative to viewport
            const rect = iframe.getBoundingClientRect();
            iframeRect = { left: rect.left, top: rect.top };
        }

        // During auto-scroll, force fresh droppable rectangle calculations
        // This addresses the core issue where cached rectangles become stale
        const freshDroppableRects = new Map(droppableRects);

        // Special handling for when we're at the very top (scrollY = 0) vs mid-scroll
        const isAtTop = Math.abs(iframeScrollOffset.y) < 5;
        const needsFreshRects = Math.abs(iframeScrollOffset.y) > 10 || isAtTop;

        // If we're scrolling significantly or at the very top, recalculate rectangles for all droppable containers
        if (needsFreshRects) {
            droppableContainers.forEach((container) => {
                const element = container.node.current;
                if (element) {
                    try {
                        // Get fresh rectangle from the DOM (this gives us viewport coordinates)
                        const rect = element.getBoundingClientRect();

                        if (isAtTop) {
                            // When at the top, convert viewport coordinates to content coordinates
                            // Since we're at top, scroll offset is 0, so we just convert viewport to content
                            freshDroppableRects.set(container.id, {
                                top: rect.top - iframeRect.top + iframeScrollOffset.y,
                                left: rect.left - iframeRect.left + iframeScrollOffset.x,
                                bottom: rect.bottom - iframeRect.top + iframeScrollOffset.y, 
                                right: rect.right - iframeRect.left + iframeScrollOffset.x,
                                width: rect.width,
                                height: rect.height,
                            });
                        } else {
                            // When mid-scroll, convert viewport to iframe-relative, then add scroll offset for content coordinates
                            // rect.left is viewport coordinates, need to convert to content coordinates
                            freshDroppableRects.set(container.id, {
                                top: rect.top - iframeRect.top + iframeScrollOffset.y,
                                left: rect.left - iframeRect.left + iframeScrollOffset.x,
                                bottom: rect.bottom - iframeRect.top + iframeScrollOffset.y,
                                right: rect.right - iframeRect.left + iframeScrollOffset.x,
                                width: rect.width,
                                height: rect.height,
                            });
                        }
                    } catch (error) {
                        // Keep the old rectangle if we can't get a fresh one
                        console.warn('Failed to get fresh rectangle for:', container.id, error);
                    }
                }
            });
        }

        // Transform pointer coordinates step by step:
        // 1. First, convert from viewport coordinates to iframe-relative coordinates
        const iframeRelativeX = pointerCoordinates.x - iframeRect.left;
        const iframeRelativeY = pointerCoordinates.y - iframeRect.top;

        // 2. Then account for the zoom/pan transform
        const transformAdjustedX = (iframeRelativeX - transformState.positionX) / transformState.scale;
        const transformAdjustedY = (iframeRelativeY - transformState.positionY) / transformState.scale;

        // 3. Handle coordinate calculation differently for "at top" vs "mid-scroll"
        let adjustedPointerCoordinates;

        if (isAtTop) {
            // When at the very top, use simpler coordinate calculation
            // This matches the coordinate system used for fresh rectangles at top
            adjustedPointerCoordinates = {
                x: transformAdjustedX,
                y: transformAdjustedY,
            };
        } else {
            // When mid-scroll, add the scroll offset to get content-relative coordinates
            // The scroll offset represents how much content has moved from its original position
            // We add it because if content scrolled down by 100px, a viewport point needs 100px added to hit the same content
            adjustedPointerCoordinates = {
                x: transformAdjustedX + iframeScrollOffset.x,
                y: transformAdjustedY + iframeScrollOffset.y,
            };
        }

        // Alternative coordinate calculation to test if the issue is in the math
        // Try a simpler approach that might work better during scroll
        const simpleAdjustedCoordinates = {
            x: pointerCoordinates.x - iframeRect.left + iframeScrollOffset.x,
            y: pointerCoordinates.y - iframeRect.top + iframeScrollOffset.y,
        };

        // Debug logging for scroll direction issues
        const isScrollingUp = iframeScrollOffset.y > 0;
        const debugInfo = {
            scrollY: iframeScrollOffset.y,
            direction: isScrollingUp ? 'up' : 'down',
            isAtTop: isAtTop,
            original: pointerCoordinates,
            iframeRelative: { x: iframeRelativeX, y: iframeRelativeY },
            transformAdjusted: { x: transformAdjustedX, y: transformAdjustedY },
            final: adjustedPointerCoordinates,
            simple: simpleAdjustedCoordinates,
            transform: transformState,
            rectsRefreshed: needsFreshRects,
            containerCount: droppableContainers.length,
        };

        // Only log when there's significant scrolling or at top to debug the up/down issue
        if (Math.abs(iframeScrollOffset.y) > 50 || isAtTop) {
            console.debug('Collision detection scroll debug:', debugInfo);
        }



        // Validate adjusted coordinates are reasonable
        if (isNaN(adjustedPointerCoordinates.x) || isNaN(adjustedPointerCoordinates.y)) {
            console.warn('Invalid adjusted coordinates, falling back to original');
            // Use original coordinates as fallback
            const fallbackArgs = {
                active,
                droppableRects,
                droppableContainers,
                pointerCoordinates,
                collisionRect,
            };
            return pointerWithin(fallbackArgs);
        }

        // Use the adjusted coordinates and fresh rectangles for collision detection
        const adjustedArgs = {
            active,
            droppableRects: freshDroppableRects,
            droppableContainers,
            pointerCoordinates: adjustedPointerCoordinates,
            collisionRect,
        };

        // First try pointer-based collision detection with adjusted coordinates
        const pointerCollisions = pointerWithin(adjustedArgs);

        if (pointerCollisions.length > 0) {
            if (Math.abs(iframeScrollOffset.y) > 50 || isAtTop) {
                console.debug(`Found pointer collisions with fresh rects ${ isAtTop ? '(at top)' : '(mid-scroll)' }:`, pointerCollisions.map(c => c.id));
            }
            
            // Debug visualization for successful collisions
            debugCollisionDetection(
                pointerCoordinates, 
                adjustedPointerCoordinates, 
                freshDroppableRects, 
                pointerCollisions,
                { method: 'pointerWithin', scrollState: isAtTop ? 'at top' : 'mid-scroll', ...debugInfo }
            );
            
            return pointerCollisions;
        }

        // Fallback to rect-based collision detection with adjusted coordinates
        const rectCollisions = rectIntersection(adjustedArgs);

        if (rectCollisions.length > 0) {
            if (Math.abs(iframeScrollOffset.y) > 50 || isAtTop) {
                console.debug(`Found rect collisions with fresh rects ${ isAtTop ? '(at top)' : '(mid-scroll)' }:`, rectCollisions.map(c => c.id));
            }
            
            // Debug visualization for successful rect collisions
            debugCollisionDetection(
                pointerCoordinates, 
                adjustedPointerCoordinates, 
                freshDroppableRects, 
                rectCollisions,
                { method: 'rectIntersection', scrollState: isAtTop ? 'at top' : 'mid-scroll', ...debugInfo }
            );
            
            return rectCollisions;
        }

        // If fresh rectangles didn't work, try with simpler coordinate calculation
        // This skips the complex transform math and uses a direct approach
        const simpleArgs = {
            active,
            droppableRects: freshDroppableRects,
            droppableContainers,
            pointerCoordinates: simpleAdjustedCoordinates,
            collisionRect,
        };

        const simpleCollisions = pointerWithin(simpleArgs);
        if (simpleCollisions.length > 0) {
            if (Math.abs(iframeScrollOffset.y) > 50 || isAtTop) {
                console.debug(`Found collisions with simple coords ${ isAtTop ? '(at top)' : '(mid-scroll)' }:`, simpleCollisions.map(c => c.id));
            }
            return simpleCollisions;
        }

        // If fresh rectangles didn't work, try with the original cached rectangles
        // This handles cases where the fresh rectangle calculation might have issues
        const cachedArgs = {
            active,
            droppableRects,
            droppableContainers,
            pointerCoordinates: adjustedPointerCoordinates,
            collisionRect,
        };

        const cachedCollisions = pointerWithin(cachedArgs);
        if (cachedCollisions.length > 0) {
            if (Math.abs(iframeScrollOffset.y) > 50 || isAtTop) {
                console.debug(`Found collisions with cached rects ${ isAtTop ? '(at top)' : '(mid-scroll)' }:`, cachedCollisions.map(c => c.id));
            }
            return cachedCollisions;
        }

        // Final fallback: try original coordinates if adjusted ones didn't work
        // This can happen during rapid auto-scroll when coordinate transformation gets out of sync
        const originalArgs = {
            active,
            droppableRects,
            droppableContainers,
            pointerCoordinates,
            collisionRect,
        };

        const originalCollisions = pointerWithin(originalArgs);
        if ((Math.abs(iframeScrollOffset.y) > 50 || isAtTop) && originalCollisions.length === 0) {
            console.debug(`No collisions found with any method ${ isAtTop ? '(at top)' : '(mid-scroll)' }`);
        }

        // Debug visualization for when no collisions are found
        if (originalCollisions.length === 0 && (Math.abs(iframeScrollOffset.y) > 50 || isAtTop)) {
            debugCollisionDetection(
                pointerCoordinates, 
                adjustedPointerCoordinates, 
                freshDroppableRects, 
                originalCollisions,
                { method: 'no collisions found', scrollState: isAtTop ? 'at top' : 'mid-scroll', ...debugInfo }
            );
        }

        return originalCollisions;
    };
};

// Helper function to get transform state
const getTransformState = (): TransformState => {
    const transformComponent = document.querySelector('[data-testid="transform-component"]');
    let transformState: TransformState = { scale: 1, positionX: 0, positionY: 0 };

    if (transformComponent) {
        const computedStyle = window.getComputedStyle(transformComponent);
        const transform = computedStyle.transform;

        if (transform && transform !== 'none') {
            const matrixMatch = transform.match(/matrix\(([^)]*)\)/);
            if (matrixMatch) {
                const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
                if (values.length >= 6) {
                    transformState = {
                        scale: values[0], // scaleX
                        positionX: values[4], // translateX
                        positionY: values[5], // translateY
                    };
                }
            }
        }
    }

    return transformState;
};