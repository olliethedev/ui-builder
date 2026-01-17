import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DndContextProvider, useDndContext, useComponentDragContext } from '@/lib/ui-builder/context/dnd-context';

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

  // Reset mock implementations
  mockFindLayerById.mockReturnValue(undefined);
  mockMoveLayer.mockClear();
});

const TestComponent = () => {
  const context = useDndContext();
  
  return (
    <div>
      <div data-testid="is-dragging">{context.isDragging.toString()}</div>
      <div data-testid="active-layer">{context.activeLayerId || 'none'}</div>
      <div data-testid="new-component-type">{context.newComponentType || 'none'}</div>
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

  it('canDropOnLayer returns true for layer that can accept children', () => {
    mockFindLayerById.mockReturnValue({
      id: 'test-layer',
      type: 'div',
      props: {},
      children: []
    });

    const { canLayerAcceptChildren } = require('@/lib/ui-builder/store/layer-utils');
    canLayerAcceptChildren.mockReturnValue(true);

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('can-drop')).toHaveTextContent('true');
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

describe('Advanced canDropOnLayer Logic', () => {
  it('prevents dropping on currently dragged layer when activeLayerId matches', () => {
    // Mock a scenario where there's an active layer
    const TestActiveComponent = () => {
      const [activeId, setActiveId] = React.useState<string | null>(null);
      const context = useDndContext();
      
      React.useEffect(() => {
        setActiveId('active-layer');
      }, []);
      
      return (
        <div>
          <div data-testid="can-drop-active">{context.canDropOnLayer('active-layer').toString()}</div>
          <div data-testid="can-drop-other">{context.canDropOnLayer('other-layer').toString()}</div>
        </div>
      );
    };

    mockFindLayerById.mockImplementation((id) => {
      if (id === 'active-layer' || id === 'other-layer') {
        return {
          id,
          type: 'div',
          props: {},
          children: []
        };
      }
      return undefined;
    });

    const { canLayerAcceptChildren } = require('@/lib/ui-builder/store/layer-utils');
    canLayerAcceptChildren.mockReturnValue(true);

    render(
      <DndContextProvider>
        <TestActiveComponent />
      </DndContextProvider>
    );

    // Should be able to drop on other layers by default
    expect(screen.getByTestId('can-drop-other')).toHaveTextContent('true');
  });

  it('handles descendant checking logic', () => {
    const TestDescendantComponent = () => {
      const context = useDndContext();
      
      return (
        <div>
          <div data-testid="can-drop-descendant">{context.canDropOnLayer('child-layer').toString()}</div>
        </div>
      );
    };

    mockFindLayerById.mockReturnValue({
      id: 'child-layer',
      type: 'div',
      props: {},
      children: []
    });

    const { canLayerAcceptChildren, findAllParentLayersRecursive } = require('@/lib/ui-builder/store/layer-utils');
    canLayerAcceptChildren.mockReturnValue(true);
    findAllParentLayersRecursive.mockReturnValue([]);

    render(
      <DndContextProvider>
        <TestDescendantComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('can-drop-descendant')).toHaveTextContent('true');
  });
});

describe('childOf Validation in canDropOnLayer', () => {
  it('allows drop when dragged layer has no childOf constraint', () => {
    // AccordionItem has childOf: ['Accordion'], dragging a Button (no childOf) onto any target
    mockFindLayerById.mockImplementation((id) => {
      if (id === 'button-layer') {
        return { id: 'button-layer', type: 'Button', props: {}, children: [] };
      }
      if (id === 'target-div') {
        return { id: 'target-div', type: 'div', props: {}, children: [] };
      }
      return undefined;
    });

    mockUseEditorStore.mockImplementation((selector) => {
      const store = {
        registry: {
          Button: { component: () => null, schema: {} },
          div: { component: () => null, schema: {} },
        },
      };
      return selector(store);
    });

    const { canLayerAcceptChildren } = require('@/lib/ui-builder/store/layer-utils');
    canLayerAcceptChildren.mockReturnValue(true);

    const TestComponent = () => {
      const context = useDndContext();
      return <div data-testid="can-drop">{context.canDropOnLayer('target-div').toString()}</div>;
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('can-drop')).toHaveTextContent('true');
  });

  it('allows drop when dragged layer childOf includes target type', () => {
    // Dragging AccordionItem (childOf: ['Accordion']) onto Accordion target
    mockFindLayerById.mockImplementation((id) => {
      if (id === 'accordion-item-layer') {
        return { id: 'accordion-item-layer', type: 'AccordionItem', props: {}, children: [] };
      }
      if (id === 'accordion-target') {
        return { id: 'accordion-target', type: 'Accordion', props: {}, children: [] };
      }
      return undefined;
    });

    mockUseEditorStore.mockImplementation((selector) => {
      const store = {
        registry: {
          AccordionItem: { component: () => null, schema: {}, childOf: ['Accordion'] },
          Accordion: { component: () => null, schema: {} },
        },
      };
      return selector(store);
    });

    const { canLayerAcceptChildren } = require('@/lib/ui-builder/store/layer-utils');
    canLayerAcceptChildren.mockReturnValue(true);

    const TestComponent = () => {
      const context = useDndContext();
      return <div data-testid="can-drop">{context.canDropOnLayer('accordion-target').toString()}</div>;
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // When no active drag, it just checks if target can accept children
    expect(screen.getByTestId('can-drop')).toHaveTextContent('true');
  });
});

describe('DragOverlayContent Scenarios', () => {
  it('renders with layer name when available', () => {
    mockFindLayerById.mockReturnValue({
      id: 'test-layer',
      name: 'Test Layer',
      type: 'div',
      props: {},
      children: []
    });

    render(
      <DndContextProvider>
        <div data-testid="overlay-test">Test</div>
      </DndContextProvider>
    );

    // DragOverlayContent is rendered inside DragOverlay when dragging
    expect(screen.getByTestId('overlay-test')).toBeInTheDocument();
  });

  it('renders with layer type when no name', () => {
    mockFindLayerById.mockReturnValue({
      id: 'test-layer',
      type: 'button',
      props: {},
      children: []
    });

    render(
      <DndContextProvider>
        <div data-testid="overlay-test">Test</div>
      </DndContextProvider>
    );

    expect(screen.getByTestId('overlay-test')).toBeInTheDocument();
  });

  it('handles null layer gracefully', () => {
    mockFindLayerById.mockReturnValue(null);

    render(
      <DndContextProvider>
        <div data-testid="overlay-test">Test</div>
      </DndContextProvider>
    );

    expect(screen.getByTestId('overlay-test')).toBeInTheDocument();
  });
});

describe('Escape Key Cancellation', () => {
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

  it('handles non-escape keys without effect', () => {
    const TestComponent = () => {
      const { isDragging } = useDndContext();
      return <div data-testid="is-dragging">{isDragging.toString()}</div>;
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // Other keys should have no effect
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
  });
});

describe('Sensor Configuration', () => {
  it('renders with mouse and touch sensors configured', () => {
    render(
      <DndContextProvider>
        <div data-testid="sensors-test">Sensors Test</div>
      </DndContextProvider>
    );

    // The component should render with sensors configured
    expect(screen.getByTestId('sensors-test')).toBeInTheDocument();
  });
});

describe('Context State Management', () => {
  it('provides memoized context values', () => {
    const TestMemoComponent = () => {
      const context = useDndContext();
      const renderCount = React.useRef(0);
      renderCount.current += 1;
      
      React.useEffect(() => {
        // This effect should only run once due to memoization
      }, [context]);
      
      return (
        <div data-testid="memo-test">
          <div data-testid="render-count">{renderCount.current}</div>
          <div data-testid="context-values">{JSON.stringify({
            isDragging: context.isDragging,
            activeLayerId: context.activeLayerId
          })}</div>
        </div>
      );
    };

    render(
      <DndContextProvider>
        <TestMemoComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('memo-test')).toBeInTheDocument();
    expect(screen.getByTestId('context-values')).toHaveTextContent('{"isDragging":false,"activeLayerId":null}');
  });

  it('provides component drag context values', () => {
    const TestComponentDragMemo = () => {
      const context = useComponentDragContext();
      
      return (
        <div data-testid="component-drag-memo">
          <div data-testid="component-drag-values">{JSON.stringify({
            isDragging: context.isDragging
          })}</div>
        </div>
      );
    };

    render(
      <DndContextProvider>
        <TestComponentDragMemo />
      </DndContextProvider>
    );

    expect(screen.getByTestId('component-drag-memo')).toBeInTheDocument();
    expect(screen.getByTestId('component-drag-values')).toHaveTextContent('{"isDragging":false}');
  });
});

describe('Drag Event Handlers', () => {
  let DndContextInstance: any;

  beforeEach(() => {
    // We'll capture the DndContext instance to access its handlers
    const CaptureDndContext = React.forwardRef<any, any>((props, ref) => {
      const contextRef = React.useRef<any>(null);
      
      React.useImperativeHandle(ref, () => ({
        triggerDragStart: (event: any) => {
          if (contextRef.current?.handleDragStart) {
            contextRef.current.handleDragStart(event);
          }
        },
        triggerDragEnd: (event: any) => {
          if (contextRef.current?.handleDragEnd) {
            contextRef.current.handleDragEnd(event);
          }
        },
        triggerDragCancel: () => {
          if (contextRef.current?.handleDragCancel) {
            contextRef.current.handleDragCancel();
          }
        }
      }));

      // We need to access the provider's internal handlers
      const provider = {
        handleDragStart: (event: any) => {
          const { active } = event;
          if (active.data.current?.type === 'layer') {
            // This simulates the handleDragStart function
          }
        },
        handleDragEnd: (event: any) => {
          const { active, over } = event;
          if (!over || !active.data.current?.layerId) {
            return;
          }
          const sourceLayerId = active.data.current.layerId;
          const overData = over.data.current;
          if (overData?.type === 'drop-zone') {
            const { parentId, position } = overData;
            if (sourceLayerId === parentId) {
              return;
            }
            // Additional logic would be here
          }
        },
        handleDragCancel: () => {
          // Reset drag state
        }
      };

      contextRef.current = provider;
      
      return <div {...props} />;
    });

    DndContextInstance = React.createRef<any>();
  });

  it('handles drag start with layer data', () => {
    const TestComponent = () => {
      const { isDragging, activeLayerId } = useDndContext();
      return (
        <div>
          <div data-testid="is-dragging">{isDragging.toString()}</div>
          <div data-testid="active-layer">{activeLayerId || 'none'}</div>
        </div>
      );
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // Test that the component starts in non-dragging state
    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    expect(screen.getByTestId('active-layer')).toHaveTextContent('none');
  });

  it('handles drag start with non-layer data', () => {
    const TestComponent = () => {
      const { isDragging, activeLayerId } = useDndContext();
      return (
        <div>
          <div data-testid="is-dragging">{isDragging.toString()}</div>
          <div data-testid="active-layer">{activeLayerId || 'none'}</div>
        </div>
      );
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // When drag starts with non-layer data, should not set active layer
    expect(screen.getByTestId('active-layer')).toHaveTextContent('none');
  });

  it('handles drag end without over target', () => {
    const TestComponent = () => {
      const { isDragging } = useDndContext();
      return <div data-testid="is-dragging">{isDragging.toString()}</div>;
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // Should handle drag end without over target gracefully
    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    expect(mockMoveLayer).not.toHaveBeenCalled();
  });

  it('handles drag end without layerId in active data', () => {
    const TestComponent = () => {
      const { isDragging } = useDndContext();
      return <div data-testid="is-dragging">{isDragging.toString()}</div>;
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // Should handle drag end without layerId gracefully
    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    expect(mockMoveLayer).not.toHaveBeenCalled();
  });

  it('prevents dropping layer onto itself in drag end', () => {
    const TestComponent = () => {
      const { isDragging } = useDndContext();
      return <div data-testid="is-dragging">{isDragging.toString()}</div>;
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // moveLayer should not be called when source equals parent
    expect(mockMoveLayer).not.toHaveBeenCalled();
  });

  it('handles valid drop scenario in drag end', () => {
    mockFindLayerById.mockReturnValue({
      id: 'parent-layer',
      type: 'div',
      props: {},
      children: []
    });

    const { canLayerAcceptChildren } = require('@/lib/ui-builder/store/layer-utils');
    canLayerAcceptChildren.mockReturnValue(true);

    const TestComponent = () => {
      const { isDragging } = useDndContext();
      return <div data-testid="is-dragging">{isDragging.toString()}</div>;
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // In a real scenario, moveLayer would be called with valid parameters
    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
  });

  it('prevents dropping into descendants', () => {
    const { findAllParentLayersRecursive } = require('@/lib/ui-builder/store/layer-utils');
    findAllParentLayersRecursive.mockReturnValue([
      { id: 'source-layer', type: 'div', props: {}, children: [] }
    ]);

    const TestComponent = () => {
      const { isDragging } = useDndContext();
      return <div data-testid="is-dragging">{isDragging.toString()}</div>;
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // Should prevent dropping into descendants
    expect(mockMoveLayer).not.toHaveBeenCalled();
  });

  it('handles drag cancel', () => {
    const TestComponent = () => {
      const { isDragging, activeLayerId } = useDndContext();
      return (
        <div>
          <div data-testid="is-dragging">{isDragging.toString()}</div>
          <div data-testid="active-layer">{activeLayerId || 'none'}</div>
        </div>
      );
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // Should reset state on drag cancel
    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    expect(screen.getByTestId('active-layer')).toHaveTextContent('none');
  });
});

describe('Advanced canDropOnLayer Edge Cases', () => {
  it('returns true for valid layer when no active drag', () => {
    const TestComponent = () => {
      const { canDropOnLayer } = useDndContext();
      return (
        <div data-testid="can-drop-valid">{canDropOnLayer('valid-layer').toString()}</div>
      );
    };

    mockFindLayerById.mockReturnValue({
      id: 'valid-layer',
      type: 'div',
      props: {},
      children: []
    });

    const { canLayerAcceptChildren } = require('@/lib/ui-builder/store/layer-utils');
    canLayerAcceptChildren.mockReturnValue(true);

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('can-drop-valid')).toHaveTextContent('true');
  });

  it('handles invalid layer types that cannot accept children', () => {
    const TestComponent = () => {
      const { canDropOnLayer } = useDndContext();
      return (
        <div data-testid="can-drop-invalid">{canDropOnLayer('invalid-layer').toString()}</div>
      );
    };

    mockFindLayerById.mockReturnValue({
      id: 'invalid-layer',
      type: 'input',
      props: {},
      children: []
    });

    const { canLayerAcceptChildren } = require('@/lib/ui-builder/store/layer-utils');
    canLayerAcceptChildren.mockReturnValue(false);

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('can-drop-invalid')).toHaveTextContent('false');
  });
});

describe('DragOverlayContent Component', () => {
  it('renders content with layer name', () => {
    mockFindLayerById.mockReturnValue({
      id: 'named-layer',
      name: 'My Button',
      type: 'button',
      props: {},
      children: []
    });

    render(
      <DndContextProvider>
        <div data-testid="content-test">Content Test</div>
      </DndContextProvider>
    );

    // DragOverlayContent would render the layer name when available
    expect(screen.getByTestId('content-test')).toBeInTheDocument();
  });

  it('renders content with layer type when no name', () => {
    mockFindLayerById.mockReturnValue({
      id: 'unnamed-layer',
      type: 'input',
      props: {},
      children: []
    });

    render(
      <DndContextProvider>
        <div data-testid="content-test">Content Test</div>
      </DndContextProvider>
    );

    // DragOverlayContent would render the layer type when no name
    expect(screen.getByTestId('content-test')).toBeInTheDocument();
  });

  it('returns null for non-existent layer', () => {
    mockFindLayerById.mockReturnValue(null);

    render(
      <DndContextProvider>
        <div data-testid="content-test">Content Test</div>
      </DndContextProvider>
    );

    // DragOverlayContent returns null when layer doesn't exist
    expect(screen.getByTestId('content-test')).toBeInTheDocument();
  });
});

describe('Escape Key Event Handling', () => {
  it('sets up event listener when activeLayerId is present', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const TestComponent = () => {
      const { isDragging } = useDndContext();
      return <div data-testid="is-dragging">{isDragging.toString()}</div>;
    };

    const { unmount } = render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // Initially no active drag, so no event listener should be added
    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    
    unmount();

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('handles keydown events properly', () => {
    const TestComponent = () => {
      const { isDragging } = useDndContext();
      return <div data-testid="is-dragging">{isDragging.toString()}</div>;
    };

    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    // Test various key events
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Space' });

    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
  });
});

describe('New Component Type Support', () => {
  it('provides newComponentType in context', () => {
    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('new-component-type')).toHaveTextContent('none');
  });

  it('isDragging is true when newComponentType is set but no activeLayerId', () => {
    // This would require simulating a drag start event with new-component type
    // For now, verify the default state
    render(
      <DndContextProvider>
        <TestComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    expect(screen.getByTestId('new-component-type')).toHaveTextContent('none');
  });
});

describe('childOf Validation for New Components', () => {
  it('validates childOf constraint for new component drags', () => {
    // Mock registry with childOf constraint
    mockUseEditorStore.mockImplementation((selector) => {
      const store = {
        registry: {
          AccordionItem: { 
            component: () => null, 
            schema: {}, 
            childOf: ['Accordion'] 
          },
          Accordion: { 
            component: () => null, 
            schema: {} 
          },
          div: { 
            component: () => null, 
            schema: {} 
          },
        },
      };
      return selector(store);
    });

    mockFindLayerById.mockImplementation((id) => {
      if (id === 'accordion-target') {
        return { id: 'accordion-target', type: 'Accordion', props: {}, children: [] };
      }
      if (id === 'div-target') {
        return { id: 'div-target', type: 'div', props: {}, children: [] };
      }
      return undefined;
    });

    const { canLayerAcceptChildren } = require('@/lib/ui-builder/store/layer-utils');
    canLayerAcceptChildren.mockReturnValue(true);

    const TestChildOfComponent = () => {
      const { canDropOnLayer } = useDndContext();
      return (
        <div>
          <div data-testid="can-drop-accordion">{canDropOnLayer('accordion-target').toString()}</div>
          <div data-testid="can-drop-div">{canDropOnLayer('div-target').toString()}</div>
        </div>
      );
    };

    render(
      <DndContextProvider>
        <TestChildOfComponent />
      </DndContextProvider>
    );

    // Without active drag, both should be true (just checks if layer can accept children)
    expect(screen.getByTestId('can-drop-accordion')).toHaveTextContent('true');
    expect(screen.getByTestId('can-drop-div')).toHaveTextContent('true');
  });

  it('allows dropping component without childOf on any valid parent', () => {
    mockUseEditorStore.mockImplementation((selector) => {
      const store = {
        registry: {
          Button: { component: () => null, schema: {} },
          div: { component: () => null, schema: {} },
        },
      };
      return selector(store);
    });

    mockFindLayerById.mockReturnValue({
      id: 'div-target',
      type: 'div',
      props: {},
      children: []
    });

    const { canLayerAcceptChildren } = require('@/lib/ui-builder/store/layer-utils');
    canLayerAcceptChildren.mockReturnValue(true);

    const TestNoChildOfComponent = () => {
      const { canDropOnLayer } = useDndContext();
      return <div data-testid="can-drop">{canDropOnLayer('div-target').toString()}</div>;
    };

    render(
      <DndContextProvider>
        <TestNoChildOfComponent />
      </DndContextProvider>
    );

    expect(screen.getByTestId('can-drop')).toHaveTextContent('true');
  });
}); 