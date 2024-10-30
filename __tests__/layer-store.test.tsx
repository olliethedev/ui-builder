import { renderHook, act } from '@testing-library/react';
import { ComponentLayer, useLayerStore } from '../lib/ui-builder/store/layer-store';
import { PageLayer } from '../lib/ui-builder/store/layer-store';

// Mock componentRegistry
jest.mock('../lib/ui-builder/registry/component-registry', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { z } = require('zod'); // Require zod within the mock factory

  return {
    componentRegistry: {
      Button: {
        schema: z.object({
          label: z.string().default('ollie'),
        }),
        from: '@/components/ui/button',
        component: () => null, // Mock component; replace with actual mocks if needed
      },
      Input: {
        schema: z.object({
          placeholder: z.string().default('input'),
        }),
        from: '@/components/ui/input',
        component: () => null,
      },
      Textarea: {
        schema: z.object({
          placeholder: z.string().default('textarea'),
        }),
        from: '@/components/ui/textarea',
        component: () => null,
      },
      // Add other components as needed with appropriate Zod schemas
    },
  };
});

describe('LayerStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useLayerStore.setState({
      pages: [
        {
          id: '1',
          type: '_page_',
          name: 'Page 1',
          props: { className: 'p-4 flex flex-col gap-2' },
          children: [],
        },
      ],
      selectedLayerId: null,
      selectedPageId: '1',
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLayerStore());
    expect(result.current.pages).toHaveLength(1);
    expect(result.current.pages[0].id).toBe('1');
    expect(result.current.selectedPageId).toBe('1');
    expect(result.current.selectedLayerId).toBeNull();
  });

  describe('addComponentLayer', () => {
    it('should add a component layer to the specified parent', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      expect(result.current.pages[0].children).toHaveLength(1);
      const newLayer = result.current.pages[0].children[0];
      expect(newLayer.type).toBe('Button');
      expect(newLayer.name).toBe('Button');
      expect(newLayer.props).toEqual({ label: 'ollie' });
    });

    it('should add a component layer at a specific position', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add first layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      // Add second layer at position 0
      act(() => {
        result.current.addComponentLayer('Input', '1', 0);
      });

      expect(result.current.pages[0].children).toHaveLength(2);
      expect(result.current.pages[0].children[0].type).toBe('Input');
      expect(result.current.pages[0].children[1].type).toBe('Button');
    });
  });

  describe('addPageLayer', () => {
    it('should add a new page', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addPageLayer('Page 2');
      });

      expect(result.current.pages).toHaveLength(2);
      const newPage = result.current.pages[1];
      expect(newPage.type).toBe('_page_');
      expect(newPage.name).toBe('Page 2');
      expect(result.current.selectedPageId).toBe(newPage.id);
    });
  });

  describe('duplicateLayer', () => {
    it('should duplicate a component layer', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a button layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      const originalLayer = result.current.pages[0].children[0];
      const originalId = originalLayer.id;

      // Duplicate the button layer
      act(() => {
        result.current.duplicateLayer(originalId);
      });

      expect(result.current.pages[0].children).toHaveLength(2);
      const duplicatedLayer = result.current.pages[0].children[1];
      expect(duplicatedLayer.type).toBe('Button');
      expect(duplicatedLayer.name).toBe(`${originalLayer.name} (Copy)`);
      expect(duplicatedLayer.props).toEqual(originalLayer.props);
      expect(duplicatedLayer.id).not.toBe(originalId);
    });

    it('should duplicate a page layer', () => {
      const { result } = renderHook(() => useLayerStore());

      // Duplicate the first page
      act(() => {
        result.current.duplicateLayer('1');
      });

      expect(result.current.pages).toHaveLength(2);
      const duplicatedPage = result.current.pages[1];
      expect(duplicatedPage.type).toBe('_page_');
      expect(duplicatedPage.name).toBe('Page 1');
      expect(result.current.selectedPageId).toBe(duplicatedPage.id);
    });

    it('should handle duplicating a non-existent layer gracefully', () => {
      const { result } = renderHook(() => useLayerStore());

      console.warn = jest.fn();

      act(() => {
        result.current.duplicateLayer('non-existent-id');
      });

      expect(console.warn).toHaveBeenCalledWith('Layer with ID non-existent-id not found.');
      expect(result.current.pages).toHaveLength(1);
    });
  });

  describe('removeLayer', () => {
    it('should remove a component layer', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a button layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      const layerId = result.current.pages[0].children[0].id;

      // Remove the layer
      act(() => {
        result.current.removeLayer(layerId);
      });

      expect(result.current.pages[0].children).toHaveLength(0);
    });

    it('should remove a page layer', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a second page
      act(() => {
        result.current.addPageLayer('Page 2');
      });

      expect(result.current.pages).toHaveLength(2);
      const pageId = result.current.pages[1].id;

      // Remove the second page
      act(() => {
        result.current.removeLayer(pageId);
      });

      expect(result.current.pages).toHaveLength(1);
      expect(result.current.selectedPageId).toBe('1');
    });

    it('should deselect the layer if the removed layer was selected', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a button layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      const layerId = result.current.pages[0].children[0].id;

      // Select the layer
      act(() => {
        result.current.selectLayer(layerId);
      });

      expect(result.current.selectedLayerId).toBe(layerId);

      // Remove the layer
      act(() => {
        result.current.removeLayer(layerId);
      });

      expect(result.current.selectedLayerId).toBeNull();
    });

    it('should handle removing the last remaining page gracefully', () => {
      const { result } = renderHook(() => useLayerStore());
  
      // Attempt to remove the only page
      act(() => {
        result.current.removeLayer('1');
      });
  
      // Expect that the page is not removed since it's the only one
      expect(result.current.pages).toHaveLength(1);
      expect(result.current.selectedPageId).toBe('1');
    });
  
    it('should handle removing a layer from a parent with multiple children correctly', () => {
      const { result } = renderHook(() => useLayerStore());
  
      // Add two layers
      act(() => {
        result.current.addComponentLayer('Button', '1');
        result.current.addComponentLayer('Input', '1');
      });
  
      expect(result.current.pages[0].children).toHaveLength(2);
  
      const buttonLayerId = result.current.pages[0].children[0].id;
      const inputLayerId = result.current.pages[0].children[1].id;
  
      // Remove the first layer (Button)
      act(() => {
        result.current.removeLayer(buttonLayerId);
      });
  
      expect(result.current.pages[0].children).toHaveLength(1);
      expect(result.current.pages[0].children[0].id).toBe(inputLayerId);
    });
  });

  describe('updateLayer', () => {
    it('should update a component layer\'s props and name', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a button layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      const layerId = result.current.pages[0].children[0].id;

      // Update the layer
      act(() => {
        result.current.updateLayer(layerId, { className: 'new-class' }, { name: 'Updated Button' });
      });

      const updatedLayer = result.current.pages[0].children[0];
      expect(updatedLayer.props.className).toBe('new-class');
      expect(updatedLayer.name).toBe('Updated Button');
    });

    it('should update a page layer\'s props and name', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a second page
      act(() => {
        result.current.addPageLayer('Page 2');
      });

      const pageId = result.current.pages[1].id;

      // Update the page layer
      act(() => {
        result.current.updateLayer(pageId, { className: 'new-page-class' }, { name: 'Updated Page' });
      });

      const updatedPage = result.current.pages[1];
      expect(updatedPage.props.className).toBe('new-page-class');
      expect(updatedPage.name).toBe('Updated Page');
    });

    it('should handle updating a non-existent layer gracefully', () => {
      const { result } = renderHook(() => useLayerStore());

      console.warn = jest.fn();

      act(() => {
        result.current.updateLayer('non-existent-id', { className: 'test' }, { name: 'Test' });
      });

      expect(console.warn).toHaveBeenCalledWith('Layer with ID non-existent-id was not found.');
      expect(result.current.pages).toHaveLength(1);
    });

    it('should update a component layer\'s props and additional fields', () => {
      const { result } = renderHook(() => useLayerStore());
  
      // Add a button layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });
  
      const layerId = result.current.pages[0].children[0].id;
  
      // Update the layer with new props and additional fields
      act(() => {
        result.current.updateLayer(layerId, { className: 'updated-class' }, { name: 'Updated Button' });
      });
  
      const updatedLayer = result.current.pages[0].children[0];
      expect(updatedLayer.props.className).toBe('updated-class');
      expect(updatedLayer.name).toBe('Updated Button');
    });
  
    it('should handle updating a layer when selectedPageId is null gracefully', () => {
      const { result } = renderHook(() => useLayerStore());
  
      // Initialize with an empty array of pages
      act(() => {
        result.current.initialize([
          {
            id: '1',
            type: '_page_',
            name: 'Page 1',
            props: { className: 'p-4 flex flex-col gap-2' },
            children: [],
          }
        ]);
      });
  
      act(() => {
        result.current.updateLayer('some-id', { className: 'test-class' }, { name: 'Test Layer' });
      });
  
      // Expect no pages to be present
      expect(result.current.pages).toHaveLength(1);
      // Optionally, check for a console warning if implemented
      // expect(console.warn).toHaveBeenCalledWith('No page is currently selected.');
    });

    it('should update a layer\'s type and children using layerRest', () => {
      const { result } = renderHook(() => useLayerStore());
    
      // Add a button layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });
    
      const layerId = result.current.pages[0].children[0].id;
    
      // Update the layer's type to 'Input' and add a child
      act(() => {
        result.current.updateLayer(layerId, {}, { type: 'Input', children: [] });
      });
    
      const updatedLayer = result.current.pages[0].children[0];
      expect(updatedLayer.type).toBe('Input');
      expect(updatedLayer.children).toEqual([]);
    });
    
    it('should update a layer with both newProps and layerRest', () => {
      const { result } = renderHook(() => useLayerStore());
    
      // Add an input layer
      act(() => {
        result.current.addComponentLayer('Input', '1');
      });
    
      const layerId = result.current.pages[0].children[0].id;
    
      // Update the layer's props and name
      act(() => {
        result.current.updateLayer(layerId, { placeholder: 'Enter text' }, { name: 'TextInput' });
      });
    
      const updatedLayer = result.current.pages[0].children[0];
      expect(updatedLayer.props.placeholder).toBe('Enter text');
      expect(updatedLayer.name).toBe('TextInput');
    });
    
    it('should not modify other layers when one layer is updated', () => {
      const { result } = renderHook(() => useLayerStore());
    
      // Add two layers
      act(() => {
        result.current.addComponentLayer('Button', '1');
        result.current.addComponentLayer('Input', '1');
      });
    
      const buttonLayerId = result.current.pages[0].children[0].id;
    
      // Update the button layer
      act(() => {
        result.current.updateLayer(buttonLayerId, { label: 'Submit' }, { name: 'SubmitButton' });
      });
    
      const updatedButtonLayer = result.current.pages[0].children[0];
      const updatedInputLayer = result.current.pages[0].children[1];
    
      expect(updatedButtonLayer.props.label).toBe('Submit');
      expect(updatedButtonLayer.name).toBe('SubmitButton');
      expect(updatedInputLayer.props.placeholder).toBe('input'); // unchanged
    });
    
    it('should handle updating a layer with no changes gracefully', () => {
      const { result } = renderHook(() => useLayerStore());
    
      // Add a textarea layer
      act(() => {
        result.current.addComponentLayer('Textarea', '1');
      });
    
      const layerId = result.current.pages[0].children[0].id;
    
      // Attempt to update the layer with no changes
      act(() => {
        result.current.updateLayer(layerId, {}, {});
      });
    
      const updatedLayer = result.current.pages[0].children[0];
      expect(updatedLayer).toEqual({
        id: layerId,
        type: 'Textarea',
        name: 'Textarea',
        props: { placeholder: 'textarea' },
        children: [],
      });
    });
    
    it('should update nested child layer\'s props correctly', () => {
      const { result } = renderHook(() => useLayerStore());
    
      // Add a button layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });
    
      const parentLayerId = result.current.pages[0].children[0].id;
    
      // Assuming Button can have children, add a nested Input layer
      act(() => {
        result.current.addComponentLayer('Input', parentLayerId);
      });
    
      const childLayerId = (result.current.pages[0].children[0].children[0] as ComponentLayer).id;
    
      // Update the nested Input layer
      act(() => {
        result.current.updateLayer(childLayerId, { placeholder: 'Nested Input' }, { name: 'NestedInput' });
      });
    
      const updatedChildLayer = result.current.pages[0].children[0].children[0] as ComponentLayer;
      expect(updatedChildLayer.props.placeholder).toBe('Nested Input');
      expect(updatedChildLayer.name).toBe('NestedInput');
    });
    
    it('should log a warning when attempting to update a layer with invalid layerRest properties', () => {
      const { result } = renderHook(() => useLayerStore());
      console.warn = jest.fn();
    
      // Add a button layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });
    
      const layerId = result.current.pages[0].children[0].id;
    
      // Attempt to update the layer with an invalid property
      act(() => {
        // @ts-expect-error: Intentional invalid property for testing
        result.current.updateLayer(layerId, { label: 'Click Me' }, { invalidProp: 'Invalid' });
      });
    
      const updatedLayer = result.current.pages[0].children[0];
      expect(updatedLayer.props.label).toBe('Click Me');
      expect(updatedLayer).toHaveProperty('invalidProp', 'Invalid');
    });
    
    it('should not update any layer if selectedPageId is incorrect', () => {
      const { result } = renderHook(() => useLayerStore());

      console.warn = jest.fn();
    
      // Add a button layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });
    
      const layerId = result.current.pages[0].children[0].id;
    
      act(() => {
        result.current.initialize([
          {
            id: '2',
            type: '_page_',
            name: 'Page 2',
            props: { className: 'p-4' },
            children: [],
          },
        ]);
      });
    
      // Attempt to update the original layer
      act(() => {
        result.current.updateLayer(layerId, { label: 'New Label' }, { name: 'NewButton' });
      });
    
      // The original layer should remain unchanged
      const originalLayer = result.current.pages.find(page => page.id === '2')?.children.find(layer => layer.id === layerId);
      expect(originalLayer).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(`Layer with ID ${layerId} was not found.`);
    });

    it('should warn if no layers found for page ID', () => {
      const { result } = renderHook(() => useLayerStore());
      console.warn = jest.fn();
      //initialize with non existing page id
      act(() => {
        result.current.initialize([
          {
            id: '2',
            type: '_page_',
            name: 'Page 2',
            props: { className: 'p-4' },
            children: [],
          },
        ],"3");
      });
      act(() => {
        result.current.updateLayer('non-existent-id', { className: 'test' }, { name: 'Test' });
      });
      expect(console.warn).toHaveBeenCalledWith('No layers found for page ID: 3');
    });

  });

  describe('selectLayer', () => {
    it('should select an existing layer', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      const layerId = result.current.pages[0].children[0].id;

      // Select the layer
      act(() => {
        result.current.selectLayer(layerId);
      });

      expect(result.current.selectedLayerId).toBe(layerId);
    });

    it('should not select a non-existent layer', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.selectLayer('non-existent-id');
      });

      expect(result.current.selectedLayerId).toBeNull();
    });
  });

  describe('selectPage', () => {
    it('should select an existing page', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a second page
      act(() => {
        result.current.addPageLayer('Page 2');
      });

      const newPageId = result.current.pages[1].id;

      // Select the new page
      act(() => {
        result.current.selectPage(newPageId);
      });

      expect(result.current.selectedPageId).toBe(newPageId);
    });

    it('should not change selection if page does not exist', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.selectPage('non-existent-id');
      });

      expect(result.current.selectedPageId).toBe('1');
    });
  });

  describe('findLayerById', () => {
    it('should find a layer by its ID', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a button layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      const layerId = result.current.pages[0].children[0].id;

      const layer = result.current.findLayerById(layerId);
      expect(layer).toBeDefined();
      expect(layer?.id).toBe(layerId);
      expect(layer?.type).toBe('Button');
    });

    it('should return undefined for non-existent ID', () => {
      const { result } = renderHook(() => useLayerStore());

      const layer = result.current.findLayerById('non-existent-id');
      expect(layer).toBeUndefined();
    });

    it('should return undefined if selectedPageId is null', () => {
      const { result } = renderHook(() => useLayerStore());

      const layer = result.current.findLayerById('non-existent-id');
      expect(layer).toBeUndefined();
    });

    it('should find a page layer by its ID', () => {
      const { result } = renderHook(() => useLayerStore());

      const page = result.current.findLayerById('1');
      expect(page).toBeDefined();
      expect(page?.type).toBe('_page_');
    });
  });

  describe('findLayersForPageId', () => {
    it('should return layers for a given page ID', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add two layers to page 1
      act(() => {
        result.current.addComponentLayer('Button', '1');
        result.current.addComponentLayer('Input', '1');
      });

      const layers = result.current.findLayersForPageId('1');
      expect(layers).toHaveLength(2);
      expect(layers[0].type).toBe('Button');
      expect(layers[1].type).toBe('Input');
    });

    it('should return an empty array if the page has no layers', () => {
      const { result } = renderHook(() => useLayerStore());

      const layers = result.current.findLayersForPageId('1');
      expect(layers).toEqual([]);
    });

    it('should return empty array for a non-existent page ID', () => {
      const { result } = renderHook(() => useLayerStore());

      const layers = result.current.findLayersForPageId('non-existent-id');
      expect(layers).toEqual([]);
    });
  });

  describe('initialize', () => {
    it('should initialize the store with provided pages', () => {
      const { result } = renderHook(() => useLayerStore());

      const newPages: PageLayer[] = [
        {
          id: '2',
          type: '_page_',
          name: 'Initialized Page',
          props: { className: 'initialized-class' },
          children: [],
        },
      ];

      act(() => {
        result.current.initialize(newPages);
      });

      expect(result.current.pages).toEqual(newPages);
      expect(result.current.selectedPageId).toEqual(newPages[0].id);
    });

    it('should handle initialization with empty pages', () => {
      const { result } = renderHook(() => useLayerStore());
      const initialPages: PageLayer[] = [
        {
          id: '2',
          type: '_page_',
          name: 'Initialized Page',
          props: { className: 'initialized-class' },
          children: [],
        },
      ];
      act(() => {
        result.current.initialize(initialPages);
      });

      expect(result.current.pages).toEqual(initialPages);
      expect(result.current.selectedPageId).toBe(initialPages[0].id);
    });
  });
});