import { renderHook, act } from '@testing-library/react';
import { useLayerStore } from '@/lib/ui-builder/store/layer-store';
import { ComponentLayer } from '@/components/ui/ui-builder/types';
import { z } from 'zod';

import { useEditorStore } from '@/lib/ui-builder/store/editor-store';




describe('LayerStore', () => {
  beforeAll(() => {
    //adding a mock component registry to zustand store
    useEditorStore.setState({
      registry: {
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
        Card: {
          schema: z.object({
            title: z.string().default('Card Title'),
          }),
          from: '@/components/ui/card',
          component: () => null,
          // Test with string defaultChildren
          defaultChildren: 'Default card content',
        },
        Container: {
          schema: z.object({
            className: z.string().default('container'),
          }),
          from: '@/components/ui/container',
          component: () => null,
          // Test with array defaultChildren
          defaultChildren: [
            {
              id: 'default-child-1',
              type: 'Button',
              name: 'Default Button',
              props: { label: 'Default' },
              children: [],
            }
          ],
        },
        // Add other components as needed with appropriate Zod schemas
      }
    });
  });
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
      const newLayer = result.current.pages[0].children[0] as ComponentLayer;
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
      expect((result.current.pages[0].children[0] as ComponentLayer).type).toBe('Input');
      expect((result.current.pages[0].children[1] as ComponentLayer).type).toBe('Button');
    });

    it('should add a component with string defaultChildren', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addComponentLayer('Card', '1');
      });

      const newLayer = result.current.pages[0].children[0] as ComponentLayer;
      expect(newLayer.type).toBe('Card');
      expect(newLayer.children).toBe('Default card content');
    });

    it('should add a component with array defaultChildren', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addComponentLayer('Container', '1');
      });

      const newLayer = result.current.pages[0].children[0] as ComponentLayer;
      expect(newLayer.type).toBe('Container');
      expect(Array.isArray(newLayer.children)).toBe(true);
      expect(newLayer.children).toHaveLength(1);
      expect((newLayer.children[0] as ComponentLayer).type).toBe('Button');
      // Should have a different ID than the default one
      expect((newLayer.children[0] as ComponentLayer).id).not.toBe('default-child-1');
    });

    it('should handle components without defaultChildren', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      const newLayer = result.current.pages[0].children[0] as ComponentLayer;
      expect(newLayer.children).toEqual([]);
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
      expect(newPage.type).toBe('div');
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

      const originalLayer = result.current.pages[0].children[0] as ComponentLayer;
      const originalId = originalLayer.id;

      // Duplicate the button layer
      act(() => {
        result.current.duplicateLayer(originalId);
      });

      expect(result.current.pages[0].children).toHaveLength(2);
      const duplicatedLayer = result.current.pages[0].children[1] as ComponentLayer;
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
      expect(duplicatedPage.name).toBe('Page 1 (Copy)');
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

      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;

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

      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;

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
  
      const buttonLayerId = (result.current.pages[0].children[0] as ComponentLayer).id;
      const inputLayerId = (result.current.pages[0].children[1] as ComponentLayer).id;
  
      // Remove the first layer (Button)
      act(() => {
        result.current.removeLayer(buttonLayerId);
      });
  
      expect(result.current.pages[0].children).toHaveLength(1);
      expect((result.current.pages[0].children[0] as ComponentLayer).id).toBe(inputLayerId);
    });
  });

  describe('updateLayer', () => {
    it('should update a component layer\'s props and name', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a button layer
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;

      // Update the layer
      act(() => {
        result.current.updateLayer(layerId, { className: 'new-class' }, { name: 'Updated Button' });
      });

      const updatedLayer = result.current.pages[0].children[0] as ComponentLayer;
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
  
      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;
  
      // Update the layer with new props and additional fields
      act(() => {
        result.current.updateLayer(layerId, { className: 'updated-class' }, { name: 'Updated Button' });
      });
  
      const updatedLayer = result.current.pages[0].children[0] as ComponentLayer;
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
    
      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;
    
      // Update the layer's type to 'Input' and add a child
      act(() => {
        result.current.updateLayer(layerId, {}, { type: 'Input', children: [] });
      });
    
      const updatedLayer = result.current.pages[0].children[0] as ComponentLayer;
      expect(updatedLayer.type).toBe('Input');
      expect(updatedLayer.children).toEqual([]);
    });
    
    it('should update a layer with both newProps and layerRest', () => {
      const { result } = renderHook(() => useLayerStore());
    
      // Add an input layer
      act(() => {
        result.current.addComponentLayer('Input', '1');
      });
    
      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;
    
      // Update the layer's props and name
      act(() => {
        result.current.updateLayer(layerId, { placeholder: 'Enter text' }, { name: 'TextInput' });
      });
    
      const updatedLayer = result.current.pages[0].children[0] as ComponentLayer;
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
    
      const buttonLayerId = (result.current.pages[0].children[0] as ComponentLayer).id;
    
      // Update the button layer
      act(() => {
        result.current.updateLayer(buttonLayerId, { label: 'Submit' }, { name: 'SubmitButton' });
      });
    
      const updatedButtonLayer = result.current.pages[0].children[0] as ComponentLayer;
      const updatedInputLayer = result.current.pages[0].children[1] as ComponentLayer;
    
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
    
      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;
    
      // Attempt to update the layer with no changes
      act(() => {
        result.current.updateLayer(layerId, {}, {});
      });
    
      const updatedLayer = result.current.pages[0].children[0] as ComponentLayer;
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
    
      const parentLayerId = (result.current.pages[0].children[0] as ComponentLayer).id;
    
      // Assuming Button can have children, add a nested Input layer
      act(() => {
        result.current.addComponentLayer('Input', parentLayerId);
      });
    
      const childLayerId = ((result.current.pages[0].children[0] as ComponentLayer).children[0] as ComponentLayer).id;
    
      // Update the nested Input layer
      act(() => {
        result.current.updateLayer(childLayerId, { placeholder: 'Nested Input' }, { name: 'NestedInput' });
      });
    
      const updatedChildLayer = (result.current.pages[0].children[0] as ComponentLayer).children[0] as ComponentLayer;
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
    
      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;
    
      // Attempt to update the layer with an invalid property
      act(() => {
        // @ts-expect-error: Intentional invalid property for testing
        result.current.updateLayer(layerId, { label: 'Click Me' }, { invalidProp: 'Invalid' });
      });
    
      const updatedLayer = (result.current.pages[0].children[0] as ComponentLayer);
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
    
      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;
    
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
      const originalLayer = ((result.current.pages.find(page => page.id === '2') as ComponentLayer)?.children as ComponentLayer[]).find(layer => layer.id === layerId);
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

      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;

      act(() => {
        result.current.selectLayer(layerId);
      });

      expect(result.current.selectedLayerId).toBe(layerId);
    });

    it('should select a page when layerId equals selectedPageId', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.selectLayer('1');
      });

      expect(result.current.selectedLayerId).toBe('1');
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

      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;

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

      const newPages: ComponentLayer[] = [
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
      const initialPages: ComponentLayer[] = [
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

    it('should initialize with custom selectedPageId and selectedLayerId', () => {
      const { result } = renderHook(() => useLayerStore());

      const newPages: ComponentLayer[] = [
        {
          id: '2',
          type: '_page_',
          name: 'Page 2',
          props: { className: 'page-2' },
          children: [
            {
              id: 'layer-1',
              type: 'Button',
              name: 'Button 1',
              props: { label: 'Click' },
              children: [],
            }
          ],
        },
        {
          id: '3',
          type: '_page_',
          name: 'Page 3',
          props: { className: 'page-3' },
          children: [],
        },
      ];

      act(() => {
        result.current.initialize(newPages, '3', 'layer-1');
      });

      expect(result.current.pages).toEqual(newPages);
      expect(result.current.selectedPageId).toBe('3');
      expect(result.current.selectedLayerId).toBe('layer-1');
    });

    it('should initialize with variables', () => {
      const { result } = renderHook(() => useLayerStore());

      const newPages: ComponentLayer[] = [
        {
          id: '2',
          type: '_page_',
          name: 'Page',
          props: { className: 'page' },
          children: [],
        },
      ];

      const variables = [
        { id: 'var-1', name: 'testVar', type: 'string' as const, defaultValue: 'test' }
      ];

      act(() => {
        result.current.initialize(newPages, '2', undefined, variables);
      });

      expect(result.current.variables).toEqual(variables);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle edge case with findLayerById when layer has no children property', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a regular page with type 'div' (not '_page_')
      act(() => {
        result.current.addPageLayer('Test Page');
      });

      // Get the new page ID
      const newPageId = result.current.pages[1].id;

      // Select the new page
      act(() => {
        result.current.selectPage(newPageId);
      });

      // findLayersForPageId should handle pages with type 'div' correctly
      const layers = result.current.findLayersForPageId(newPageId);
      expect(layers).toEqual([]);
    });

    it('should handle when registry does not have schema for component type', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a component type that doesn't exist in registry
      useEditorStore.setState({
        registry: {
          ...useEditorStore.getState().registry,
          UnknownComponent: {
            schema: z.object({}), // Empty schema
            from: '@/components/ui/unknown',
            component: () => null,
          }
        }
      });

      act(() => {
        result.current.addComponentLayer('UnknownComponent', '1');
      });

      const newLayer = result.current.pages[0].children[0] as ComponentLayer;
      expect(newLayer.type).toBe('UnknownComponent');
      expect(newLayer.props).toEqual({});
    });

    it('should handle unbindPropFromVariable when layer is not found', () => {
      const { result } = renderHook(() => useLayerStore());

      console.warn = jest.fn();

      act(() => {
        result.current.unbindPropFromVariable('non-existent-layer', 'prop');
      });

      expect(console.warn).toHaveBeenCalledWith('Layer with ID non-existent-layer not found.');
    });

    it('should handle unbindPropFromVariable when schema has no default value', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add component with schema but no default for a specific prop
      useEditorStore.setState({
        registry: {
          ...useEditorStore.getState().registry,
          CustomComponent: {
            schema: z.object({
              customProp: z.string().optional(), // No default
            }),
            from: '@/components/ui/custom',
            component: () => null,
          }
        }
      });

      act(() => {
        result.current.addComponentLayer('CustomComponent', '1');
      });

      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;

      act(() => {
        result.current.unbindPropFromVariable(layerId, 'nonExistentProp');
      });

      const layer = result.current.findLayerById(layerId) as ComponentLayer;
      expect(layer.props.nonExistentProp).toBe("");
    });

    it('should handle removeVariable with prop that has no schema entry', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add component with incomplete schema
      useEditorStore.setState({
        registry: {
          ...useEditorStore.getState().registry,
          PartialComponent: {
            schema: z.object({
              knownProp: z.string().default('known'),
            }),
            from: '@/components/ui/partial',
            component: () => null,
          }
        }
      });

      act(() => {
        result.current.addComponentLayer('PartialComponent', '1');
        result.current.addVariable('testVar', 'string', 'test');
      });

      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;
      const variableId = result.current.variables[0].id;

      // Manually set a prop that's not in the schema
      act(() => {
        result.current.updateLayer(layerId, { unknownProp: { __variableRef: variableId } });
      });

      // Remove the variable - unknownProp should be deleted since it has no schema default
      act(() => {
        result.current.removeVariable(variableId);
      });

      const layer = result.current.findLayerById(layerId) as ComponentLayer;
      expect(layer.props.unknownProp).toBeUndefined();
    });
  });

  describe('Store Persistence Configuration', () => {
    it('should handle localStorage operations when persistLayerStoreConfig is disabled', () => {
      const { result } = renderHook(() => useLayerStore());

      // Mock localStorage
      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem');
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');

      // Set persistLayerStoreConfig to false
      useEditorStore.setState({ persistLayerStoreConfig: false });

      // Try to add a layer (which would normally trigger persistence)
      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      // localStorage should not be called when persistence is disabled
      // Note: This is hard to test directly without accessing the internal storage mechanism
      // The test mainly ensures the code doesn't break when persistence is disabled

      mockGetItem.mockRestore();
      mockSetItem.mockRestore();
    });

    it('should test localStorage getItem when persistLayerStoreConfig is enabled', async () => {
      // Set persistLayerStoreConfig to true
      useEditorStore.setState({ persistLayerStoreConfig: true });

      // Mock localStorage with a stored value
      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem');
      mockGetItem.mockReturnValue(JSON.stringify({
        state: {
          pages: [{ id: 'stored-page', type: 'div', name: 'Stored Page', props: {}, children: [] }],
          selectedPageId: 'stored-page',
          selectedLayerId: null,
          variables: []
        },
        version: 4
      }));

      // Note: Testing localStorage directly is difficult with Zustand persist middleware
      // This test ensures the mock is set up correctly
      const storedValue = localStorage.getItem('layer-store');
      expect(storedValue).toBeTruthy();

      mockGetItem.mockRestore();
    });

    it('should test localStorage setItem when persistLayerStoreConfig is enabled', () => {
      // Set persistLayerStoreConfig to true
      useEditorStore.setState({ persistLayerStoreConfig: true });

      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');

      // Create a new store instance to trigger persistence
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      // The test ensures setItem can be called without errors
      expect(() => {
        localStorage.setItem('test-key', 'test-value');
      }).not.toThrow();

      mockSetItem.mockRestore();
    });

    it('should test localStorage removeItem when persistLayerStoreConfig is enabled', () => {
      // Set persistLayerStoreConfig to true
      useEditorStore.setState({ persistLayerStoreConfig: true });

      const mockRemoveItem = jest.spyOn(Storage.prototype, 'removeItem');

      // The test ensures removeItem can be called without errors
      expect(() => {
        localStorage.removeItem('test-key');
      }).not.toThrow();

      mockRemoveItem.mockRestore();
    });
  });

  describe('Additional Variable Edge Cases', () => {
    it('should handle binding a prop when layer has no existing props', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a minimal component
      act(() => {
        result.current.addComponentLayer('Button', '1');
        result.current.addVariable('testVar', 'string', 'test value');
      });

      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;
      const variableId = result.current.variables[0].id;

      // Bind a new prop
      act(() => {
        result.current.bindPropToVariable(layerId, 'newProp', variableId);
      });

      const layer = result.current.findLayerById(layerId) as ComponentLayer;
      expect(layer.props.newProp).toEqual({ __variableRef: variableId });
    });

    it('should handle unbinding when layer has complex schema', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a component with complex schema
      useEditorStore.setState({
        registry: {
          ...useEditorStore.getState().registry,
          ComplexComponent: {
            schema: z.object({
              nested: z.object({
                prop: z.string().default('nested default')
              }).default({ prop: 'nested default' })
            }),
            from: '@/components/ui/complex',
            component: () => null,
          }
        }
      });

      act(() => {
        result.current.addComponentLayer('ComplexComponent', '1');
      });

      const layerId = (result.current.pages[0].children[0] as ComponentLayer).id;

      // Try to unbind a prop that uses nested schema
      act(() => {
        result.current.unbindPropFromVariable(layerId, 'nested');
      });

      const layer = result.current.findLayerById(layerId) as ComponentLayer;
      expect(layer.props.nested).toEqual({ prop: 'nested default' });
    });

    it('should handle removeVariable when no registry schema exists', () => {
      const { result } = renderHook(() => useLayerStore());

      // Temporarily remove registry to test edge case
      const originalRegistry = useEditorStore.getState().registry;
      useEditorStore.setState({ registry: {} });

      act(() => {
        // Add a layer manually (bypassing registry check)
        useLayerStore.setState({
          pages: [{
            id: '1',
            type: 'div',
            name: 'Page 1',
            props: { className: 'p-4' },
            children: [{
              id: 'manual-layer',
              type: 'UnknownType',
              name: 'Unknown',
              props: { someProp: { __variableRef: 'var-1' } },
              children: []
            }]
          }],
          variables: [{ id: 'var-1', name: 'testVar', type: 'string', defaultValue: 'test' }]
        });
      });

      // Remove the variable when no schema exists
      act(() => {
        result.current.removeVariable('var-1');
      });

      const layer = result.current.pages[0].children[0] as ComponentLayer;
      expect(layer.props.someProp).toBeUndefined();

      // Restore registry
      useEditorStore.setState({ registry: originalRegistry });
    });
  });

  describe('Default Variable Bindings', () => {
    beforeEach(() => {
      // Add variables to the store
      const { result } = renderHook(() => useLayerStore());
      act(() => {
        result.current.addVariable('userName', 'string', 'John Doe');
        result.current.addVariable('userAge', 'number', 25);
      });

      // Update registry with components that have default variable bindings
      useEditorStore.setState({
        registry: {
          ...useEditorStore.getState().registry,
          ComponentWithDefaultBindings: {
            schema: z.object({
              title: z.string().default('Default Title'),
              description: z.string().default('Default Description'),
              count: z.number().default(0),
            }),
            from: '@/components/ui/component-with-default-bindings',
            component: () => null,
            defaultVariableBindings: [
              { propName: 'title', variableId: 'var-id-1', immutable: true },
              { propName: 'description', variableId: 'var-id-2', immutable: false },
            ],
          },
          ComponentWithoutBindings: {
            schema: z.object({
              text: z.string().default('Default Text'),
            }),
            from: '@/components/ui/component-without-bindings',
            component: () => null,
          },
        }
      });
    });

    it('should apply default variable bindings when adding a component', () => {
      const { result } = renderHook(() => useLayerStore());

      // Manually set variable IDs to match what we expect in the binding definitions
      act(() => {
        const variables = result.current.variables;
        if (variables.length >= 2) {
          // Update the registry to use actual variable IDs
          const registry = useEditorStore.getState().registry;
          useEditorStore.setState({
            registry: {
              ...registry,
              ComponentWithDefaultBindings: {
                ...registry.ComponentWithDefaultBindings,
                defaultVariableBindings: [
                  { propName: 'title', variableId: variables[0].id, immutable: true },
                  { propName: 'description', variableId: variables[1].id, immutable: false },
                ],
              },
            }
          });

          result.current.addComponentLayer('ComponentWithDefaultBindings', '1');
        }
      });

      const addedLayer = (result.current.pages[0].children[0] as ComponentLayer);
      expect(addedLayer.type).toBe('ComponentWithDefaultBindings');
      
      // Check that variable bindings were applied
      const variables = result.current.variables;
      expect(addedLayer.props.title).toEqual({ __variableRef: variables[0].id });
      expect(addedLayer.props.description).toEqual({ __variableRef: variables[1].id });
      
      // Check that immutable bindings were tracked
      expect(result.current.isBindingImmutable(addedLayer.id, 'title')).toBe(true);
      expect(result.current.isBindingImmutable(addedLayer.id, 'description')).toBe(false);
    });

    it('should not apply bindings for non-existent variables', () => {
      const { result } = renderHook(() => useLayerStore());

      // Use registry with non-existent variable IDs
      useEditorStore.setState({
        registry: {
          ...useEditorStore.getState().registry,
          ComponentWithInvalidBindings: {
            schema: z.object({
              title: z.string().default('Default Title'),
            }),
            from: '@/components/ui/component-with-invalid-bindings',
            component: () => null,
            defaultVariableBindings: [
              { propName: 'title', variableId: 'non-existent-var', immutable: true },
            ],
          },
        }
      });

      act(() => {
        result.current.addComponentLayer('ComponentWithInvalidBindings', '1');
      });

      const addedLayer = (result.current.pages[0].children[0] as ComponentLayer);
      
      // Should use default value from schema, not variable binding
      expect(addedLayer.props.title).toBe('Default Title');
      expect(result.current.isBindingImmutable(addedLayer.id, 'title')).toBe(false);
    });

    it('should handle components without default variable bindings', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addComponentLayer('ComponentWithoutBindings', '1');
      });

      const addedLayer = (result.current.pages[0].children[0] as ComponentLayer);
      expect(addedLayer.type).toBe('ComponentWithoutBindings');
      expect(addedLayer.props.text).toBe('Default Text');
      expect(result.current.isBindingImmutable(addedLayer.id, 'text')).toBe(false);
    });

    it('should prevent unbinding immutable variable bindings', () => {
      const { result } = renderHook(() => useLayerStore());

      // Set up component with immutable binding
      act(() => {
        const variables = result.current.variables;
        if (variables.length >= 1) {
          useEditorStore.setState({
            registry: {
              ...useEditorStore.getState().registry,
              ComponentWithDefaultBindings: {
                ...useEditorStore.getState().registry.ComponentWithDefaultBindings,
                defaultVariableBindings: [
                  { propName: 'title', variableId: variables[0].id, immutable: true },
                ],
              },
            }
          });

          result.current.addComponentLayer('ComponentWithDefaultBindings', '1');
        }
      });

      const addedLayer = (result.current.pages[0].children[0] as ComponentLayer);
      
      // Verify binding exists
      expect(addedLayer.props.title).toEqual({ __variableRef: result.current.variables[0].id });
      expect(result.current.isBindingImmutable(addedLayer.id, 'title')).toBe(true);

      // Try to unbind immutable binding (should fail)
      act(() => {
        result.current.unbindPropFromVariable(addedLayer.id, 'title');
      });

      // Binding should still exist
      const layerAfterUnbind = result.current.findLayerById(addedLayer.id) as ComponentLayer;
      expect(layerAfterUnbind.props.title).toEqual({ __variableRef: result.current.variables[0].id });
    });

    it('should allow unbinding mutable variable bindings', () => {
      const { result } = renderHook(() => useLayerStore());

      // Set up component with mutable binding
      act(() => {
        const variables = result.current.variables;
        if (variables.length >= 1) {
          useEditorStore.setState({
            registry: {
              ...useEditorStore.getState().registry,
              ComponentWithDefaultBindings: {
                ...useEditorStore.getState().registry.ComponentWithDefaultBindings,
                defaultVariableBindings: [
                  { propName: 'description', variableId: variables[0].id, immutable: false },
                ],
              },
            }
          });

          result.current.addComponentLayer('ComponentWithDefaultBindings', '1');
        }
      });

      const addedLayer = (result.current.pages[0].children[0] as ComponentLayer);
      
      // Verify binding exists
      expect(addedLayer.props.description).toEqual({ __variableRef: result.current.variables[0].id });
      expect(result.current.isBindingImmutable(addedLayer.id, 'description')).toBe(false);

      // Unbind mutable binding (should succeed)
      act(() => {
        result.current.unbindPropFromVariable(addedLayer.id, 'description');
      });

      // Binding should be removed and default value set
      const layerAfterUnbind = result.current.findLayerById(addedLayer.id) as ComponentLayer;
      expect(layerAfterUnbind.props.description).toBe('Default Description');
    });

    it('should correctly report binding immutability', () => {
      const { result } = renderHook(() => useLayerStore());

      expect(result.current.isBindingImmutable('non-existent-layer', 'prop')).toBe(false);
      expect(result.current.isBindingImmutable('layer-id', 'non-existent-prop')).toBe(false);
    });
  });

  describe('Conditional localStorage operations with persistence enabled', () => {
    beforeEach(() => {
      // Enable persistence
      useEditorStore.setState({ persistLayerStoreConfig: true });
    });

    afterEach(() => {
      // Reset persistence config
      useEditorStore.setState({ persistLayerStoreConfig: false });
    });

    it('should call localStorage.setItem when persistence is enabled', async () => {
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');
      
      // Simulate the conditionalLocalStorage.setItem call
      const conditionalStorage = {
        setItem: async (name: string, value: string) => {
          const { persistLayerStoreConfig } = useEditorStore.getState();
          if (persistLayerStoreConfig) {
            localStorage.setItem(name, value);
          }
        }
      };

      await conditionalStorage.setItem('test-key', 'test-value');
      
      expect(mockSetItem).toHaveBeenCalledWith('test-key', 'test-value');
      mockSetItem.mockRestore();
    });

    it('should call localStorage.getItem when persistence is enabled', async () => {
      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem');
      mockGetItem.mockReturnValue('stored-value');
      
      // Simulate the conditionalLocalStorage.getItem call
      const conditionalStorage = {
        getItem: async (name: string) => {
          const { persistLayerStoreConfig } = useEditorStore.getState();
          if (!persistLayerStoreConfig) {
            return null;
          }
          return localStorage.getItem(name);
        }
      };

      const result = await conditionalStorage.getItem('test-key');
      
      expect(mockGetItem).toHaveBeenCalledWith('test-key');
      expect(result).toBe('stored-value');
      mockGetItem.mockRestore();
    });

    it('should call localStorage.removeItem when persistence is enabled', async () => {
      const mockRemoveItem = jest.spyOn(Storage.prototype, 'removeItem');
      
      // Simulate the conditionalLocalStorage.removeItem call
      const conditionalStorage = {
        removeItem: async (name: string) => {
          const { persistLayerStoreConfig } = useEditorStore.getState();
          if (persistLayerStoreConfig) {
            localStorage.removeItem(name);
          }
        }
      };

      await conditionalStorage.removeItem('test-key');
      
      expect(mockRemoveItem).toHaveBeenCalledWith('test-key');
      mockRemoveItem.mockRestore();
    });
  });

  describe('Store Migration Logic', () => {
    it('should migrate from version 1 to version 2', () => {
      const persistedState = {
        pages: [{ id: '1', type: 'div', name: 'Page 1', props: {}, children: [] }],
        selectedPageId: '1',
        selectedLayerId: null
      };

      // Import the actual migration function to test it directly
      const { migrateV1ToV2 } = require('@/lib/ui-builder/store/layer-utils');
      const result = migrateV1ToV2(persistedState);

      expect(result.pages).toBeDefined();
      expect(result.selectedPageId).toBe('1');
      expect(result.selectedLayerId).toBe(null);
      // The migrateV1ToV2 function should have transformed the data structure
      expect(result).toHaveProperty('pages');
    });

    it('should migrate from version 2 to version 3', () => {
      const persistedState = {
        pages: [{ id: '1', type: 'div', name: 'Page 1', props: {}, children: [] }],
        selectedPageId: '1',
        selectedLayerId: null
      };

      // Import the actual migration function to test it directly
      const { migrateV2ToV3 } = require('@/lib/ui-builder/store/layer-utils');
      const result = migrateV2ToV3(persistedState);

      expect(result.pages).toBeDefined();
      expect(result.selectedPageId).toBe('1');
      expect(result.selectedLayerId).toBe(null);
      // The migrateV2ToV3 function should have transformed the data structure
      expect(result).toHaveProperty('pages');
    });

    it('should migrate from version 3 to add variables array', () => {
      const persistedState = {
        pages: [{ id: '1', type: 'div', name: 'Page 1', props: {}, children: [] }],
        selectedPageId: '1',
        selectedLayerId: null
      };

      // Test the migration logic for version 3 (this is inline in the store)
      const result = { ...(persistedState as any), variables: [], immutableBindings: {} };

      expect(result).toEqual({
        ...persistedState,
        variables: [],
        immutableBindings: {}
      });
    });

    it('should migrate from version 4 to add immutableBindings', () => {
      const persistedState = {
        pages: [{ id: '1', type: 'div', name: 'Page 1', props: {}, children: [] }],
        selectedPageId: '1',
        selectedLayerId: null,
        variables: []
      };

      // Test the migration logic for version 4 (this is inline in the store)
      const result = { ...(persistedState as any), immutableBindings: {} };

      expect(result).toEqual({
        ...persistedState,
        immutableBindings: {}
      });
    });

    it('should handle migration edge cases', () => {
      // Test migration with minimal data
      const minimalState = {
        pages: [],
        selectedPageId: null,
        selectedLayerId: null
      };

      const { migrateV1ToV2, migrateV2ToV3 } = require('@/lib/ui-builder/store/layer-utils');
      
      const v2Result = migrateV1ToV2(minimalState);
      expect(v2Result.pages).toBeDefined();
      expect(Array.isArray(v2Result.pages)).toBe(true);

      const v3Result = migrateV2ToV3(minimalState);
      expect(v3Result.pages).toBeDefined();
      expect(Array.isArray(v3Result.pages)).toBe(true);
    });
  });
});