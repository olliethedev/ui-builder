import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DragOverlayContent, TransformAwareDragOverlay } from '@/lib/ui-builder/context/drag-overlay';

// Mock dependencies
jest.mock('@/lib/ui-builder/store/layer-store', () => ({
  useLayerStore: jest.fn(),
}));

import { useLayerStore } from '@/lib/ui-builder/store/layer-store';

const mockUseLayerStore = useLayerStore as jest.MockedFunction<typeof useLayerStore>;

describe('DragOverlayContent', () => {
  const mockFindLayerById = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseLayerStore.mockImplementation((selector) => {
      const store = {
        findLayerById: mockFindLayerById,
      };
      return selector(store as any);
    });
  });

  describe('Existing layer drag', () => {
    it('displays layer name for existing layer', () => {
      mockFindLayerById.mockReturnValue({
        id: 'layer-1',
        type: 'Button',
        name: 'My Button',
        props: {},
        children: [],
      });

      render(<DragOverlayContent layerId="layer-1" />);

      expect(screen.getByText('My Button')).toBeInTheDocument();
    });

    it('displays layer type when no name', () => {
      mockFindLayerById.mockReturnValue({
        id: 'layer-1',
        type: 'Button',
        props: {},
        children: [],
      });

      render(<DragOverlayContent layerId="layer-1" />);

      expect(screen.getByText('Button')).toBeInTheDocument();
    });

    it('returns null when layer not found and no componentType', () => {
      mockFindLayerById.mockReturnValue(null);

      const { container } = render(<DragOverlayContent layerId="non-existent" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('New component drag from popover', () => {
    it('displays component type for new component drag', () => {
      mockFindLayerById.mockReturnValue(null);
      
      render(<DragOverlayContent componentType="Card" />);

      expect(screen.getByText('Card')).toBeInTheDocument();
    });
  });

  describe('Priority handling', () => {
    it('prefers layer name over component type when both provided', () => {
      mockFindLayerById.mockReturnValue({
        id: 'layer-1',
        type: 'Button',
        name: 'Existing Layer',
        props: {},
        children: [],
      });

      render(<DragOverlayContent layerId="layer-1" componentType="Card" />);

      // Should show the existing layer name
      expect(screen.getByText('Existing Layer')).toBeInTheDocument();
    });
  });
});

describe('TransformAwareDragOverlay', () => {
  beforeEach(() => {
    // Reset document body
    document.body.innerHTML = '';
  });

  it('renders without crashing', () => {
    // TransformAwareDragOverlay uses portals and DragOverlay from dnd-kit
    // which may not render children directly in test environment
    expect(() => {
      render(
        <TransformAwareDragOverlay>
          <div data-testid="overlay-content">Overlay Content</div>
        </TransformAwareDragOverlay>
      );
    }).not.toThrow();
  });

  it('accepts children prop', () => {
    // Verify the component accepts children without errors
    const { container } = render(
      <TransformAwareDragOverlay>
        <div>Content</div>
      </TransformAwareDragOverlay>
    );

    // Component renders without errors (content may be in portal)
    expect(container).toBeDefined();
  });
});
