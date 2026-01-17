import { createContext, useContext } from 'react';

// Main DND context state interface
export interface DndContextState {
  isDragging: boolean;
  activeLayerId: string | null;
  /** Component type being dragged from the popover (for new component drags) */
  newComponentType: string | null;
  canDropOnLayer: (layerId: string) => boolean;
}

// Component drag context for tracking individual component drag states
export interface ComponentDragContextState {
  isDragging: boolean;
  setDragging: (isDragging: boolean) => void;
}

// Context definitions
export const DndContextStateContext = createContext<DndContextState>({
  isDragging: false,
  activeLayerId: null,
  newComponentType: null,
  canDropOnLayer: () => false,
});

export const ComponentDragContext = createContext<ComponentDragContextState>({
  isDragging: false,
  setDragging: () => {},
});

// Custom hooks for using contexts
export const useDndContext = () => useContext(DndContextStateContext);
export const useComponentDragContext = () => useContext(ComponentDragContext); 