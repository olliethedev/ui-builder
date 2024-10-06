/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
    visitLayer, 
    countLayers, 
    addLayer, 
    findParentLayerRecursive, 
    findLayerRecursive, 
    createId, 
    hasChildren, 
    isTextLayer, 
    isPageLayer 
} from '../lib/ui-builder/store/layer-utils';
import { Layer, PageLayer, TextLayer, ComponentLayer } from '../lib/ui-builder/store/layer-store';

describe('Layer Utils', () => {
    let mockPages: PageLayer[];

    beforeEach(() => {
        mockPages = [
            {
                id: 'page1',
                type: '_page_',
                name: 'Page 1',
                props: { className: 'page-class' },
                children: [
                    {
                        id: 'layer1',
                        type: 'button',
                        name: 'Button Layer',
                        props: { label: 'Click Me' },
                        children: [], // Ensure children is present, even if empty
                    },
                    {
                        id: 'layer2',
                        type: '_text_',
                        name: 'Text Layer',
                        text: 'Hello World', // Required for TextLayer
                        textType: 'text', // Required for TextLayer
                        props: {},
                        // children is optional and omitted since TextLayer doesn't have children
                    },
                ],
            },
            {
                id: 'page2',
                type: '_page_',
                name: 'Page 2',
                props: { className: 'page2-class' },
                children: [], // Ensure children is present, even if empty
            },
        ];
    });

    describe('visitLayer', () => {
        it('should apply visitor function to all layers', () => {
            const visitor = jest.fn((layer: Layer, parent: Layer | null) => layer);
            visitLayer(mockPages[0], null, visitor);
            
            // Expect visitor to be called for each layer including the page
            expect(visitor).toHaveBeenCalledTimes(3);
            expect(visitor).toHaveBeenCalledWith(mockPages[0], null);
            expect(visitor).toHaveBeenCalledWith(mockPages[0].children![0], mockPages[0]);
            expect(visitor).toHaveBeenCalledWith(mockPages[0].children![1], mockPages[0]);
        });

        it('should modify layers correctly', () => {
            const visitor = (layer: Layer, parent: Layer | null): Layer => {
                if (layer.type === 'button') {
                    return { 
                        ...layer, 
                        props: { 
                            ...layer.props, 
                            label: 'Updated Label' 
                        } 
                    };
                }
                return layer;
            };
            const updatedPages = visitLayer(mockPages[0], null, visitor) as PageLayer;

            const updatedButton = updatedPages.children!.find(layer => layer.id === 'layer1') as ComponentLayer;
            expect(updatedButton.props.label).toBe('Updated Label');

            const textLayer = updatedPages.children!.find(layer => layer.id === 'layer2') as TextLayer;
            expect(textLayer.text).toBe('Hello World'); // Unchanged
        });
    });

    describe('countLayers', () => {
        it('should count all layers correctly', () => {
            const total = countLayers(mockPages);
            // page1 has 2 children, page2 has 0
            expect(total).toBe(4); // 2 pages + 2 layers
        });

        it('should return 0 for empty layers', () => {
            const total = countLayers([]);
            expect(total).toBe(0);
        });
    });

    describe('addLayer', () => {
        it('should add a new layer to a specified parent', () => {
            const newLayer: ComponentLayer = {
                id: 'layer3',
                type: 'input',
                name: 'Input Layer',
                props: { placeholder: 'Enter text' },
                children: [],
            };
            const updatedLayers = addLayer(mockPages, newLayer, 'page1');

            const page1 = updatedLayers.find(page => page.id === 'page1') as PageLayer;
            expect(page1.children).toHaveLength(3);
            const addedLayer = page1.children.find(layer => layer.id === 'layer3');
            expect(addedLayer).toBeDefined();
            expect(addedLayer?.type).toBe('input');
        });

        it('should insert the new layer at the specified position', () => {
            const newLayer: ComponentLayer = {
                id: 'layer3',
                type: 'input',
                name: 'Input Layer',
                props: { placeholder: 'Enter text' },
                children: [],
            };
            const updatedLayers = addLayer(mockPages, newLayer, 'page1', 1);

            const page1 = updatedLayers.find(page => page.id === 'page1') as PageLayer;
            expect(page1.children).toHaveLength(3);
            expect(page1.children[1].id).toBe('layer3');
        });

        it('should append the new layer if position is undefined', () => {
            const newLayer: ComponentLayer = {
                id: 'layer3',
                type: 'input',
                name: 'Input Layer',
                props: { placeholder: 'Enter text' },
                children: [],
            };
            const updatedLayers = addLayer(mockPages, newLayer, 'page1');

            const page1 = updatedLayers.find(page => page.id === 'page1') as PageLayer;
            expect(page1.children).toHaveLength(3);
            expect(page1.children[2].id).toBe('layer3');
        });

        it('should handle negative positions by inserting at the beginning', () => {
            const newLayer: ComponentLayer = {
                id: 'layer0',
                type: 'checkbox',
                name: 'Checkbox Layer',
                props: { checked: false },
                children: [],
            };
            const updatedLayers = addLayer(mockPages, newLayer, 'page1', -1);

            const page1 = updatedLayers.find(page => page.id === 'page1') as PageLayer;
            expect(page1.children).toHaveLength(3);
            expect(page1.children[0].id).toBe('layer0');
        });

        it('should append if position exceeds the number of children', () => {
            const newLayer: ComponentLayer = {
                id: 'layer4',
                type: 'select',
                name: 'Select Layer',
                props: { options: ['Option 1', 'Option 2'] },
                children: [],
            };
            const updatedLayers = addLayer(mockPages, newLayer, 'page1', 10);

            const page1 = updatedLayers.find(page => page.id === 'page1') as PageLayer;
            expect(page1.children).toHaveLength(3);
            expect(page1.children[2].id).toBe('layer4');
        });
    });

    describe('findParentLayerRecursive', () => {
        it('should find the correct parent layer', () => {
            const parent = findParentLayerRecursive(mockPages, 'layer1');
            expect(parent).toBeDefined();
            expect(parent?.id).toBe('page1');
        });

        it('should return null if the parent does not exist', () => {
            const parent = findParentLayerRecursive(mockPages, 'non-existent-layer');
            expect(parent).toBeNull();
        });
    });

    describe('findLayerRecursive', () => {
        it('should find the layer by ID', () => {
            const layer = findLayerRecursive(mockPages, 'layer2');
            expect(layer).toBeDefined();
            expect(layer?.id).toBe('layer2');
            expect(isTextLayer(layer!)).toBe(true);
        });

        it('should return undefined for non-existent ID', () => {
            const layer = findLayerRecursive(mockPages, 'unknown-id');
            expect(layer).toBeUndefined();
        });

        it('should find a page layer by ID', () => {
            const page = findLayerRecursive(mockPages, 'page2');
            expect(page).toBeDefined();
            expect(page?.type).toBe('_page_');
            expect(isPageLayer(page!)).toBe(true);
        });
    });

    describe('createId', () => {
        it('should create a unique ID of length 7', () => {
            const id = createId();
            expect(id).toHaveLength(7);
            expect(/^[0-9A-Za-z]{7}$/.test(id)).toBe(true);
        });

        it('should generate different IDs on multiple calls', () => {
            const id1 = createId();
            const id2 = createId();
            expect(id1).not.toBe(id2);
        });
    });

    describe('hasChildren', () => {
        it('should return true if the layer has children', () => {
            const layer: ComponentLayer = {
                id: 'component1',
                type: 'component',
                name: 'Component Layer',
                props: {},
                children: [
                    {
                        id: 'child1',
                        type: 'child',
                        name: 'Child Layer',
                        props: {},
                        children: [],
                    },
                ],
            };
            expect(hasChildren(layer)).toBe(true);
        });

        it('should return false if the layer does not have children', () => {
            const layer: TextLayer = {
                id: 'text1',
                type: '_text_',
                name: 'Text Layer',
                text: 'Sample Text',
                textType: 'text',
                props: {},
                // children is omitted as TextLayer doesn't have children
            };
            expect(hasChildren(layer)).toBe(false);
        });
    });

    describe('isTextLayer', () => {
        it('should return true for text layers', () => {
            const layer: TextLayer = {
                id: 'text2',
                type: '_text_',
                name: 'Another Text Layer',
                text: 'Another text',
                textType: 'markdown',
                props: {},
            };
            expect(isTextLayer(layer)).toBe(true);
        });

        it('should return false for non-text layers', () => {
            const layer: ComponentLayer = {
                id: 'comp2',
                type: 'input',
                name: 'Input Layer',
                props: { placeholder: 'Enter' },
                children: [],
            };
            expect(isTextLayer(layer)).toBe(false);
        });
    });

    describe('isPageLayer', () => {
        it('should return true for page layers', () => {
            const layer: PageLayer = {
                id: 'page3',
                type: '_page_',
                name: 'Page 3',
                props: { className: 'page3-class' },
                children: [], // Ensure children is present
            };
            expect(isPageLayer(layer)).toBe(true);
        });

        it('should return false for non-page layers', () => {
            const layer: ComponentLayer = {
                id: 'comp3',
                type: 'checkbox',
                name: 'Checkbox Layer',
                props: { checked: true },
                children: [],
            };
            expect(isPageLayer(layer)).toBe(false);
        });
    });
});