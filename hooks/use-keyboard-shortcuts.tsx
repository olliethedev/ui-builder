import { useEffect } from "react";

export interface KeyCombination {
  keys: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  };
  key: string;
  handler: (event: KeyboardEvent) => void;
}

export function useKeyboardShortcuts(combinations: KeyCombination[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      combinations.forEach((combo) => {
        const { keys: { ctrlKey, metaKey, shiftKey, altKey }, key, handler } = combo;
        const isMatch =
          (ctrlKey === undefined || event.ctrlKey === ctrlKey) &&
          (metaKey === undefined || event.metaKey === metaKey) &&
          (shiftKey === undefined || event.shiftKey === shiftKey) &&
          (altKey === undefined || event.altKey === altKey) &&
          event.key.toLowerCase() === key.toLowerCase();

        if (isMatch) {
          event.preventDefault();
          handler(event);
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [combinations]);
}