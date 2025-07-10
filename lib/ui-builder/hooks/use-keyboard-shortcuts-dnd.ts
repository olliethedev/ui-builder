import { useEffect } from 'react';

export const useKeyboardShortcutsDnd = (activeLayerId: string | null, handleDragCancel: () => void) => {
  // Handle escape key to cancel drag operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeLayerId) {
        event.preventDefault();
        event.stopPropagation();
        handleDragCancel();
      }
    };

    // Only add the listener when actively dragging
    if (activeLayerId) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [activeLayerId, handleDragCancel]);
}; 