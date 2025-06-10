import { getScrollParent } from "@/lib/ui-builder/utils/get-scroll-parent";

// Mock getComputedStyle since it's not available in Jest environment
const mockGetComputedStyle = jest.fn();
Object.defineProperty(window, 'getComputedStyle', {
  value: mockGetComputedStyle,
});

describe('getScrollParent', () => {
  beforeEach(() => {
    mockGetComputedStyle.mockClear();
    document.body.innerHTML = '';
  });

  it('should return null for null element', () => {
    const result = getScrollParent(null);
    expect(result).toBeNull();
  });

  it('should return null when element has no parent', () => {
    const element = document.createElement('div');
    // Element has no parent
    const result = getScrollParent(element);
    expect(result).toBeNull();
  });

  it('should return null when no scrollable parent found', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    mockGetComputedStyle.mockReturnValue({
      overflowY: 'visible',
      overflowX: 'visible',
    });

    const result = getScrollParent(child);
    expect(result).toBeNull();
  });

  it('should return parent with overflow-y auto', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    mockGetComputedStyle.mockReturnValue({
      overflowY: 'auto',
      overflowX: 'visible',
    });

    const result = getScrollParent(child);
    expect(result).toBe(parent);
  });

  it('should return parent with overflow-y scroll', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    mockGetComputedStyle.mockReturnValue({
      overflowY: 'scroll',
      overflowX: 'visible',
    });

    const result = getScrollParent(child);
    expect(result).toBe(parent);
  });

  it('should return parent with overflow-x auto', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    mockGetComputedStyle.mockReturnValue({
      overflowY: 'visible',
      overflowX: 'auto',
    });

    const result = getScrollParent(child);
    expect(result).toBe(parent);
  });

  it('should return parent with overflow-x scroll', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    mockGetComputedStyle.mockReturnValue({
      overflowY: 'visible',
      overflowX: 'scroll',
    });

    const result = getScrollParent(child);
    expect(result).toBe(parent);
  });

  it('should find scrollable ancestor when direct parent is not scrollable', () => {
    const grandparent = document.createElement('div');
    const parent = document.createElement('div');
    const child = document.createElement('div');
    
    grandparent.appendChild(parent);
    parent.appendChild(child);
    document.body.appendChild(grandparent);

    mockGetComputedStyle
      .mockReturnValueOnce({
        overflowY: 'visible',
        overflowX: 'visible',
      })
      .mockReturnValueOnce({
        overflowY: 'auto',
        overflowX: 'visible',
      });

    const result = getScrollParent(child);
    expect(result).toBe(grandparent);
  });

  it('should return first scrollable parent in hierarchy', () => {
    const greatGrandparent = document.createElement('div');
    const grandparent = document.createElement('div');
    const parent = document.createElement('div');
    const child = document.createElement('div');
    
    greatGrandparent.appendChild(grandparent);
    grandparent.appendChild(parent);
    parent.appendChild(child);
    document.body.appendChild(greatGrandparent);

    mockGetComputedStyle
      .mockReturnValueOnce({
        overflowY: 'visible',
        overflowX: 'visible',
      })
      .mockReturnValueOnce({
        overflowY: 'scroll',
        overflowX: 'visible',
      });

    const result = getScrollParent(child);
    expect(result).toBe(grandparent);
  });
});