import { renderHook, act } from '@testing-library/react'
import { useLayerStore } from '../lib/ui-builder/store/layer-store';
import { Layer, PageLayer, TextLayer } from '../lib/ui-builder/store/layer-store';

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

  describe('addTextLayer', () => {
    it('should add a text layer to the specified parent', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addTextLayer('Sample text', 'text', '1');
      });

      expect(result.current.pages[0].children).toHaveLength(1);
      const newLayer = result.current.pages[0].children[0] as TextLayer;
      expect(newLayer.type).toBe('_text_');
      expect(newLayer.text).toBe('Sample text');
      expect(newLayer.textType).toBe('text');
    });

    it('should add a markdown text layer', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addTextLayer('**Bold Text**', 'markdown', '1');
      });

      const newLayer = result.current.pages[0].children[0] as TextLayer;
      expect(newLayer.textType).toBe('markdown');
      expect(newLayer.text).toBe('**Bold Text**');
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

    it('should duplicate a text layer', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a text layer
      act(() => {
        result.current.addTextLayer('Hello World', 'text', '1');
      });

      const originalLayer = result.current.pages[0].children[0];
      const originalId = originalLayer.id;

      // Duplicate the text layer
      act(() => {
        result.current.duplicateLayer(originalId);
      });

      expect(result.current.pages[0].children).toHaveLength(2);
      const duplicatedLayer = result.current.pages[0].children[1];
      expect(duplicatedLayer.type).toBe('_text_');
      expect(duplicatedLayer.name).toBe('Text (Copy)');
      expect((duplicatedLayer as TextLayer).text).toBe('Hello World');
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

    it('should duplicate component layer', () => {
      const { result } = renderHook(() => useLayerStore());

      act(() => {
        result.current.addComponentLayer('Button', '1');
      });

      const originalLayer = result.current.pages[0].children[0];
      const originalId = originalLayer.id;

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

    it('should remove a text layer', () => {
      const { result } = renderHook(() => useLayerStore());

      // Add a text layer
      act(() => {
        result.current.addTextLayer('Sample Text', 'text', '1');
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

    it('should update a text layer\'s text and props', () => {
        const { result } = renderHook(() => useLayerStore());
   
        // Add a text layer
        act(() => {
          result.current.addTextLayer('Old Text', 'text', '1');
        });
   
        const layerId = result.current.pages[0].children[0].id;
   
        // Correctly update the layer
        act(() => {
          result.current.updateLayer(layerId, { className: 'text-class' }, { text: 'New Text' } as Partial<Omit<Layer, 'props'>>);
        });
   
        const updatedLayer = result.current.pages[0].children[0] as TextLayer;
        expect(updatedLayer.text).toBe('New Text');
        expect(updatedLayer.props.className).toBe('text-class');
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
        result.current.addTextLayer('Text Layer', 'text', '1');
      });

      const layers = result.current.findLayersForPageId('1');
      expect(layers).toHaveLength(2);
      expect(layers[0].type).toBe('Button');
      expect(layers[1].type).toBe('_text_');
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
  });
});