export function getScrollParent(element: HTMLElement | null): HTMLElement | null {
    if (!element) return null;
  
    const overflowRegex = /(auto|scroll)/;
  
    let parent: HTMLElement | null = element.parentElement;
  
    while (parent) {
      const style = getComputedStyle(parent);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;
  
      if (overflowRegex.test(overflowY) || overflowRegex.test(overflowX)) {
        return parent;
      }
  
      parent = parent.parentElement;
    }
  
    return null;
  }