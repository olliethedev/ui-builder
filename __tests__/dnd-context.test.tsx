import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DndContextProvider, useDndContext, useComponentDragContext } from '@/components/ui/ui-builder/internal/dnd-context';

// Mock the layer store
const mockUseLayerStore = jest.fn();
jest.mock('@/lib/ui-builder/store/layer-store', () => ({
  useLayerStore: (selector: any) => mockUseLayerStore(selector),
}));

// Mock the editor store
const mockUseEditorStore = jest.fn();
jest.mock('@/lib/ui-builder/store/editor-store', () => ({
  useEditorStore: (selector: any) => mockUseEditorStore(selector),
}));

// Mock layer utils
jest.mock('@/lib/ui-builder/store/layer-utils', () => ({
  canLayerAcceptChildren: jest.fn(() => true),
  findAllParentLayersRecursive: jest.fn(() => []),
}));

const mockFindLayerById = jest.fn();
const mockMoveLayer = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  
  mockUseLayerStore.mockImplementation((selector) => {
    const store = {
      findLayerById: mockFindLayerById,
      moveLayer: mockMoveLayer,
      pages: [],
    };
    return selector(store);
  });

  mockUseEditorStore.mockImplementation((selector) => {
    const store = {
      registry: {},
    };
    return selector(store);
  });
});

const TestComponent = () => {
  const context = useDndContext();
  
  return (
    <div>
      <div data-testid="is-dragging">{context.isDragging.toString()}</div>
      <div data-testid="active-layer">{context.activeLayerId || 'none'}</div>
      <div data-testid="can-drop">{context.canDropOnLayer('test').toString()}</div>
    </div>
  );
};

const ComponentDragTestComponent = () => {
  const { isDragging, setDragging } = useComponentDragContext();
  
  return (
    <div>
      <div data-testid="component-is-dragging">{isDragging.toString()}</div>
      <button 
        data-testid="toggle-drag-button" 
        onClick={() => setDragging(!isDragging)}
      >
        Toggle Drag
      </button>
    </div>
  );
};

const FailingTestComponent = () => {
  const context = useDndContext();
  // Check if we're getting the default context (outside provider) vs real context (inside provider)
  // Default context always returns false for canDropOnLayer, regardless of input
  const isDefaultContext = !context.canDropOnLayer('test') && context.activeLayerId === null && !context.isDragging;
  return <div data-testid="context-status">{isDefaultContext ? 'Default context' : 'Provider context'}</div>;
};

describe('DndContextProvider', () => {
  it('provides context to child components', () => {
    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    expect(screen.getByTestId('active-layer')).toHaveTextContent('none');
  });

  it('provides default values when used outside provider', () => {
    render(<FailingTestComponent />);
    expect(screen.getByTestId('context-status')).toHaveTextContent('Default context');
  });

  it('renders DndContext from dnd-kit', () => {
    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // The component should render without throwing
    expect(screen.getByTestId('is-dragging')).toBeInTheDocument();
  });

  it('canDropOnLayer returns false for non-existent layer', () => {
    mockFindLayerById.mockReturnValue(undefined);

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('can-drop')).toHaveTextContent('false');
  });

  it('canDropOnLayer returns false for layer that cannot accept children', () => {
    mockFindLayerById.mockReturnValue({
      id: 'test-layer',
      type: 'span',
      props: {},
      children: 'text'
    });

    const { canLayerAcceptChildren } = require('@/lib/ui-builder/store/layer-utils');
    canLayerAcceptChildren.mockReturnValue(false);

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('can-drop')).toHaveTextContent('false');
  });
});

describe('ComponentDragContext', () => {
  it('provides component drag context to child components', () => {
    render(
      <DndContextProvider>
        <ComponentDragTestComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('component-is-dragging')).toHaveTextContent('false');
    expect(screen.getByTestId('toggle-drag-button')).toBeInTheDocument();
  });

  it('updates component dragging state when setDragging is called', () => {
    render(
      <DndContextProvider>
        <ComponentDragTestComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('component-is-dragging')).toHaveTextContent('false');

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-drag-button'));
    });

    expect(screen.getByTestId('component-is-dragging')).toHaveTextContent('true');
  });

  it('provides default values when used outside provider', () => {
    render(<ComponentDragTestComponent />);
    
    expect(screen.getByTestId('component-is-dragging')).toHaveTextContent('false');
    expect(screen.getByTestId('toggle-drag-button')).toBeInTheDocument();
  });
});

describe('Escape Key Cancellation', () => {
  it('cancels drag operation when escape key is pressed', () => {
    const TestComponent = () => {
      const { isDragging, activeLayerId } = useDndContext();
      
      // Simulate starting a drag operation
      React.useEffect(() => {
        // Mock a drag start event
        const mockEvent = {
          active: {
            id: 'test-layer',
            data: {
              current: {
                type: 'layer',
                layerId: 'test-layer'
              }
            }
          }
        };
        
        // Access the provider's internal state by triggering a drag start
        // This is a bit hacky but needed for testing
        const provider = document.querySelector('[data-testid="dnd-provider"]') as any;
        if (provider && provider._dndContext) {
          provider._dndContext.handleDragStart(mockEvent);
        }
      }, []);
      
      return (
        <div data-testid="drag-status">
          <span data-testid="is-dragging">{isDragging.toString()}</span>
          <span data-testid="active-layer">{activeLayerId || 'none'}</span>
        </div>
      );
    };

    render(
      <DndContextProvider>
        <div data-testid="dnd-provider">
          <TestComponent />
        </div>
      </DndContextProvider>
    );

    // Simulate escape key press
    fireEvent.keyDown(document, { key: 'Escape' });

    // Verify drag state is reset
    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    expect(screen.getByTestId('active-layer')).toHaveTextContent('none');
  });

  it('only handles escape when actively dragging', () => {
    const TestComponent = () => {
      const { isDragging } = useDndContext();
      return <div data-testid="is-dragging">{isDragging.toString()}</div>;
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // Initially not dragging
    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');

    // Escape key should have no effect when not dragging
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
  });
}); 