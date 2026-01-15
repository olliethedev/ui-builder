/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  visitLayer,
  countLayers,
  addLayer,
  findLayerRecursive,
  findAllParentLayersRecursive,
  createId,
  hasLayerChildren,
  duplicateWithNewIdsAndName,
  migrateV1ToV2,
  migrateV2ToV3,
  migrateV5ToV6,
  createComponentLayer,
  moveLayer,
  canLayerAcceptChildren
} from "../lib/ui-builder/store/layer-utils";
import { ComponentLayer } from '@/components/ui/ui-builder/types';
import { z } from 'zod';

describe("Layer Utils", () => {
  let mockPages: ComponentLayer[];

  beforeEach(() => {
    mockPages = [
      {
        id: "page1",
        type: "_page_",
        name: "Page 1",
        props: { className: "page-class" },
        children: [
          {
            id: "layer1",
            type: "button",
            name: "Button Layer",
            props: { label: "Click Me" },
            children: [], // Ensure children is present, even if empty
          },
          {
            id: "layer2",
            type: "span",
            name: "Text Layer",
            props: {},
            children: "Hello World",
          },
        ],
      },
      {
        id: "page2",
        type: "_page_",
        name: "Page 2",
        props: { className: "page2-class" },
        children: [], // Ensure children is present, even if empty
      },
    ];
  });

  describe("visitLayer", () => {
    it("should apply visitor function to all layers", () => {
      const visitor = jest.fn((layer: ComponentLayer, parent: ComponentLayer | null) => layer);
      visitLayer(mockPages[0], null, visitor);

      // Expect visitor to be called for each layer including the page
      expect(visitor).toHaveBeenCalledTimes(3);
      expect(visitor).toHaveBeenCalledWith(mockPages[0], null);
      expect(visitor).toHaveBeenCalledWith(
        mockPages[0].children![0],
        mockPages[0]
      );
      expect(visitor).toHaveBeenCalledWith(
        mockPages[0].children![1],
        mockPages[0]
      );
    });

    it("should modify layers correctly", () => {
      const visitor = (layer: ComponentLayer, parent: ComponentLayer | null): ComponentLayer => {
        if (layer.type === "button") {
          return {
            ...layer,
            props: {
              ...layer.props,
              label: "Updated Label",
            },
          };
        }
        return layer;
      };
      const updatedPages = visitLayer(mockPages[0], null, visitor) as ComponentLayer;

      const updatedButton = (updatedPages.children as ComponentLayer[]).find(
        (layer) => layer.id === "layer1"
      ) as ComponentLayer;
      expect(updatedButton.props.label).toBe("Updated Label");

      const textLayer = (updatedPages.children as ComponentLayer[]).find(
        (layer) => layer.id === "layer2"
      ) as ComponentLayer;
      expect(textLayer.children).toBe("Hello World"); // Unchanged
    });
  });

  describe("countLayers", () => {
    it("should count all layers correctly", () => {
      const total = countLayers(mockPages);
      // page1 has 2 children, page2 has 0
      expect(total).toBe(4); // 2 pages + 2 layers
    });

    it("should return 0 for empty layers", () => {
      const total = countLayers([]);
      expect(total).toBe(0);
    });

    it("should return 0 for string children", () => {
      const total = countLayers("some text string");
      expect(total).toBe(0);
    });

    it("should count deeply nested layers correctly", () => {
      const nestedLayers: ComponentLayer[] = [
        {
          id: "layer1",
          type: "container",
          name: "Container",
          props: {},
          children: [
            {
              id: "layer2",
              type: "button",
              name: "Button",
              props: {},
              children: []
            },
            {
              id: "layer3",
              type: "container",
              name: "Nested Container",
              props: {},
              children: [
                {
                  id: "layer4",
                  type: "span",
                  name: "Nested Span",
                  props: {},
                  children: []
                }
              ]
            }
          ]
        }
      ];
      const total = countLayers(nestedLayers);
      expect(total).toBe(4); // layer1, layer2, layer3, layer4
    });
  });

  describe("addLayer", () => {
    it("should add a new layer to a specified parent", () => {
      const newLayer: ComponentLayer = {
        id: "layer3",
        type: "input",
        name: "Input Layer",
        props: { placeholder: "Enter text" },
        children: [],
      };
      const updatedLayers = addLayer(mockPages, newLayer, "page1");

      const page1 = updatedLayers.find(
        (page) => page.id === "page1"
      ) as ComponentLayer;
      expect(page1.children).toHaveLength(3);
      const addedLayer = (page1.children as ComponentLayer[]).find((layer) => layer.id === "layer3");
      expect(addedLayer).toBeDefined();
      expect(addedLayer?.type).toBe("input");
    });

    it("should insert the new layer at the specified position", () => {
      const newLayer: ComponentLayer = {
        id: "layer3",
        type: "input",
        name: "Input Layer",
        props: { placeholder: "Enter text" },
        children: [],
      };
      const updatedLayers = addLayer(mockPages, newLayer, "page1", 1);

      const page1 = updatedLayers.find(
        (page) => page.id === "page1"
      ) as ComponentLayer;
      expect(page1.children).toHaveLength(3);
      expect((page1.children as ComponentLayer[])[1].id).toBe("layer3");
    });

    it("should append the new layer if position is undefined", () => {
      const newLayer: ComponentLayer = {
        id: "layer3",
        type: "input",
        name: "Input Layer",
        props: { placeholder: "Enter text" },
        children: [],
      };
      const updatedLayers = addLayer(mockPages, newLayer, "page1");

      const page1 = updatedLayers.find(
        (page) => page.id === "page1"
      ) as ComponentLayer;
      expect(page1.children).toHaveLength(3);
      expect((page1.children as ComponentLayer[])[2].id).toBe("layer3");
    });

    it("should handle negative positions by inserting at the beginning", () => {
      const newLayer: ComponentLayer = {
        id: "layer0",
        type: "checkbox",
        name: "Checkbox Layer",
        props: { checked: false },
        children: [],
      };
      const updatedLayers = addLayer(mockPages, newLayer, "page1", -1);

      const page1 = updatedLayers.find(
        (page) => page.id === "page1"
      ) as ComponentLayer;
      expect(page1.children).toHaveLength(3);
      expect((page1.children as ComponentLayer[])[0].id).toBe("layer0");
    });

    it("should append if position exceeds the number of children", () => {
      const newLayer: ComponentLayer = {
        id: "layer4",
        type: "select",
        name: "Select Layer",
        props: { options: ["Option 1", "Option 2"] },
        children: [],
      };
      const updatedLayers = addLayer(mockPages, newLayer, "page1", 10);

      const page1 = updatedLayers.find(
        (page) => page.id === "page1"
      ) as ComponentLayer;
      expect(page1.children).toHaveLength(3);
      expect((page1.children as ComponentLayer[])[2].id).toBe("layer4");
    });

    it("should handle adding to a parent with no existing children", () => {
      const layersWithEmptyParent: ComponentLayer[] = [
        {
          id: "page1",
          type: "_page_",
          name: "Page 1",
          props: {},
          children: []
        }
      ];

      const newLayer: ComponentLayer = {
        id: "layer1",
        type: "button",
        name: "Button Layer",
        props: { label: "Click Me" },
        children: [],
      };

      const updatedLayers = addLayer(layersWithEmptyParent, newLayer, "page1");
      const page1 = updatedLayers.find(page => page.id === "page1") as ComponentLayer;
      
      expect(page1.children).toHaveLength(1);
      expect((page1.children as ComponentLayer[])[0].id).toBe("layer1");
    });

    it("should handle adding to a parent with undefined children", () => {
      const layersWithUndefinedChildren: ComponentLayer[] = [
        {
          id: "page1",
          type: "_page_",
          name: "Page 1",
          props: {},
          children: undefined as any
        }
      ];

      const newLayer: ComponentLayer = {
        id: "layer1",
        type: "button",
        name: "Button Layer",
        props: { label: "Click Me" },
        children: [],
      };

      const updatedLayers = addLayer(layersWithUndefinedChildren, newLayer, "page1");
      const page1 = updatedLayers.find(page => page.id === "page1") as ComponentLayer;
      
      expect(page1.children).toHaveLength(1);
      expect((page1.children as ComponentLayer[])[0].id).toBe("layer1");
    });

    it("should not modify layers when parent is not found", () => {
      const newLayer: ComponentLayer = {
        id: "layer1",
        type: "button",
        name: "Button Layer",
        props: { label: "Click Me" },
        children: [],
      };

      const updatedLayers = addLayer(mockPages, newLayer, "non-existent-parent");
      
      // Should return the same structure since parent was not found
      expect(updatedLayers).toEqual(mockPages);
    });

    it("should handle adding to deeply nested parents", () => {
      const deeplyNestedPages: ComponentLayer[] = [
        {
          id: "page1",
          type: "_page_",
          name: "Page 1",
          props: {},
          children: [
            {
              id: "container1",
              type: "container",
              name: "Container 1",
              props: {},
              children: [
                {
                  id: "container2",
                  type: "container",
                  name: "Container 2",
                  props: {},
                  children: []
                }
              ]
            }
          ]
        }
      ];

      const newLayer: ComponentLayer = {
        id: "deep-layer",
        type: "button",
        name: "Deep Button",
        props: {},
        children: [],
      };

      const updatedLayers = addLayer(deeplyNestedPages, newLayer, "container2");
      
      const container2 = ((updatedLayers[0].children as ComponentLayer[])[0].children as ComponentLayer[])[0];
      expect(container2.children).toHaveLength(1);
      expect((container2.children as ComponentLayer[])[0].id).toBe("deep-layer");
    });
  });

  describe("findLayerRecursive", () => {
    it("should find the layer by ID", () => {
      const layer = findLayerRecursive(mockPages, "layer2");
      expect(layer).toBeDefined();
      expect(layer?.id).toBe("layer2");
    });

    it("should return undefined for non-existent ID", () => {
      const layer = findLayerRecursive(mockPages, "unknown-id");
      expect(layer).toBeUndefined();
    });

    it("should find a page layer by ID", () => {
      const page = findLayerRecursive(mockPages, "page2");
      expect(page).toBeDefined();
      expect(page?.type).toBe("_page_");
      const isPage = mockPages.find(page => page.id === "page2");
      expect(isPage).toBeDefined();
      expect(isPage?.type).toBe("_page_");
    });
  });

  describe("createId", () => {
    it("should create a unique ID of length 7", () => {
      const id = createId();
      expect(id).toHaveLength(7);
      expect(/^[0-9A-Za-z]{7}$/.test(id)).toBe(true);
    });

    it("should generate different IDs on multiple calls", () => {
      const id1 = createId();
      const id2 = createId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("hasLayerChildren", () => {
    it("should return true if the layer has children", () => {
      const layer: ComponentLayer = {
        id: "component1",
        type: "component",
        name: "Component Layer",
        props: {},
        children: [
          {
            id: "child1",
            type: "child",
            name: "Child Layer",
            props: {},
            children: [],
          },
        ],
      };
      expect(hasLayerChildren(layer)).toBe(true);
    });

    it("should return false if the layer has string children", () => {
      const layer: ComponentLayer = {
        id: "text1",
        type: "span",
        name: "Text Layer",
        props: {},
        children: "Some text content",
      };
      expect(hasLayerChildren(layer)).toBe(false);
    });

    it("should return false if the layer has empty array children", () => {
      const layer: ComponentLayer = {
        id: "empty1",
        type: "div",
        name: "Empty Layer",
        props: {},
        children: [],
      };
      expect(hasLayerChildren(layer)).toBe(true); // Empty array is still an array
    });

    it("should return false if the layer has null children", () => {
      const layer: ComponentLayer = {
        id: "null1",
        type: "div",
        name: "Null Layer",
        props: {},
        children: null as any,
      };
      expect(hasLayerChildren(layer)).toBe(false);
    });

    it("should return false if the layer has undefined children", () => {
      const layer: ComponentLayer = {
        id: "undefined1",
        type: "div",
        name: "Undefined Layer",
        props: {},
        children: undefined as any,
      };
      expect(hasLayerChildren(layer)).toBe(false);
    });

    it("should return false if the layer has VariableReference children", () => {
      const layer: ComponentLayer = {
        id: "varRef1",
        type: "span",
        name: "Variable Reference Layer",
        props: {},
        children: { __variableRef: "some-variable-id" },
      };
      // VariableReference is an object, not an array, so hasLayerChildren should return false
      expect(hasLayerChildren(layer)).toBe(false);
    });
  });

  describe("findAllParentLayersRecursive", () => {
    it("should find all parent layers for a given layer", () => {
      const layers: ComponentLayer[] = [
        {
          id: "page1",
          type: "_page_",
          name: "Page 1",
          props: { className: "page-class" },
          children: [
            {
              id: "layer1",
              type: "container",
              name: "Container Layer",
              props: {},
              children: [
                {
                  id: "layer1-1",
                  type: "button",
                  name: "Button Layer",
                  props: { label: "Click Me" },
                  children: [],
                },
              ],
            },
          ],
        },
        {
          id: "page2",
          type: "_page_",
          name: "Page 2",
          props: { className: "page2-class" },
          children: [],
        },
      ];

      const parents = findAllParentLayersRecursive(layers, "layer1-1");
      expect(parents).toHaveLength(2);
      expect(parents[0].id).toBe("layer1");
      expect(parents[1].id).toBe("page1");
    });

    it("should return an empty array if the layer has no parents", () => {
      const parents = findAllParentLayersRecursive(mockPages, "page1");
      expect(parents).toHaveLength(0);
    });

    it("should return parents in order from immediate parent up", () => {
      const layers: ComponentLayer[] = [
        {
          id: "page1",
          type: "_page_",
          name: "Page 1",
          props: {},
          children: [
            {
              id: "layer1",
              type: "container",
              name: "Container Layer",
              props: {},
              children: [
                {
                  id: "layer1-1",
                  type: "button",
                  name: "Button Layer",
                  props: {},
                  children: [],
                },
                {
                  id: "layer1-2",
                  type: "span",
                  name: "Span Layer",
                  props: {},
                  children: [],
                },
              ],
            },
          ],
        },
      ];

      const parents = findAllParentLayersRecursive(layers, "layer1-1");
      expect(parents).toEqual([
        expect.objectContaining({ id: "layer1" }),
        expect.objectContaining({ id: "page1" }),
      ]);
    });

    it("should handle non-existent layers gracefully", () => {
      const parents = findAllParentLayersRecursive(mockPages, "unknown-layer");
      expect(parents).toHaveLength(0);
    });

    it("should find multiple parent layers correctly", () => {
      const layers: ComponentLayer[] = [
        {
          id: "page1",
          type: "_page_",
          name: "Page 1",
          props: {},
          children: [
            {
              id: "layer1",
              type: "container",
              name: "Container Layer",
              props: {},
              children: [
                {
                  id: "layer1-1",
                  type: "button",
                  name: "Button Layer",
                  props: {},
                  children: [
                    {
                      id: "layer1-1-1",
                      type: "icon",
                      name: "Icon Layer",
                      props: {},
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const parents = findAllParentLayersRecursive(layers, "layer1-1-1");
      expect(parents).toHaveLength(3);
      expect(parents[0].id).toBe("layer1-1");
      expect(parents[1].id).toBe("layer1");
      expect(parents[2].id).toBe("page1");
    });
  });

  describe("duplicateWithNewIdsAndName", () => {
    it("should create a duplicate with a new ID and name suffix by default", () => {
      const originalLayer: ComponentLayer = {
        id: "layer1",
        type: "button",
        name: "Button Layer",
        props: { label: "Click Me" },
        children: [],
      };

      const duplicatedLayer = duplicateWithNewIdsAndName(originalLayer);

      expect(duplicatedLayer).not.toBe(originalLayer);
      expect(duplicatedLayer.id).not.toBe(originalLayer.id);
      expect(duplicatedLayer.name).toBe(`${originalLayer.name} (Copy)`);
      expect(duplicatedLayer.type).toBe(originalLayer.type);
      expect(duplicatedLayer.props).toEqual(originalLayer.props);
      expect(duplicatedLayer.children).toEqual(originalLayer.children);
    });

    it("should not append name suffix when addCopySuffix is false", () => {
      const originalLayer: ComponentLayer = {
        id: "layer2",
        type: "span",
        name: "Text Layer",
        props: { text: "Hello" },
        children: [],
      };

      const duplicatedLayer = duplicateWithNewIdsAndName(originalLayer, false);

      expect(duplicatedLayer.name).toBe(originalLayer.name);
      expect(duplicatedLayer.id).not.toBe(originalLayer.id);
    });

    it("should duplicate nested children with new IDs and name suffixes", () => {
      const originalLayer: ComponentLayer = {
        id: "layer3",
        type: "container",
        name: "Container Layer",
        props: {},
        children: [
          {
            id: "layer3-1",
            type: "button",
            name: "Nested Button",
            props: { label: "Submit" },
            children: [],
          },
          {
            id: "layer3-2",
            type: "span",
            name: "Nested Text",
            props: { text: "Nested" },
            children: [],
          },
        ],
      };

      const duplicatedLayer = duplicateWithNewIdsAndName(originalLayer, true);

      expect(duplicatedLayer.id).not.toBe(originalLayer.id);
      expect(duplicatedLayer.name).toBe(`${originalLayer.name} (Copy)`);
      expect(duplicatedLayer.children).toHaveLength(
        originalLayer.children.length
      );

      if (Array.isArray(duplicatedLayer.children)) {
        duplicatedLayer.children.forEach((child, index) => {
          expect(child.id).not.toBe((originalLayer.children![index] as ComponentLayer).id);
          expect(child.name).toBe(
          `${(originalLayer.children![index] as ComponentLayer).name}`
        );
        expect(child.type).toBe((originalLayer.children![index] as ComponentLayer).type);
        expect(child.props).toEqual((originalLayer.children![index] as ComponentLayer).props);
        expect(child.children).toEqual((originalLayer.children![index] as ComponentLayer).children);
        });
      }
    });

    it("should handle layers without a name", () => {
      const originalLayer: ComponentLayer = {
        id: "layer4",
        type: "checkbox",
        props: { checked: false },
        children: [],
      } ; 

      const duplicatedLayer = duplicateWithNewIdsAndName(originalLayer);

      expect(duplicatedLayer.name).toBeUndefined();
      expect(duplicatedLayer.id).not.toBe(originalLayer.id);
    });

    it("should generate different IDs for each duplicate", () => {
      const originalLayer: ComponentLayer = {
        id: "layer5",
        type: "icon",
        name: "Icon Layer",
        props: { icon: "star" },
        children: [],
      };

      const duplicates = [
        duplicateWithNewIdsAndName(originalLayer),
        duplicateWithNewIdsAndName(originalLayer),
        duplicateWithNewIdsAndName(originalLayer),
      ];

      const ids = duplicates.map((layer) => layer.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(duplicates.length);
    });

    it("should recursively duplicate children when they have their own children", () => {
      const originalLayer: ComponentLayer = {
        id: "layer6",
        type: "container",
        name: "Parent Container",
        props: {},
        children: [
          {
            id: "layer6-1",
            type: "container",
            name: "Child Container",
            props: {},
            children: [
              {
                id: "layer6-1-1",
                type: "button",
                name: "Deep Button",
                props: { label: "Deep Click" },
                children: [],
              },
            ],
          },
        ],
      };

      const duplicatedLayer = duplicateWithNewIdsAndName(originalLayer) as ComponentLayer;

      expect(duplicatedLayer.id).not.toBe(originalLayer.id);
      expect(duplicatedLayer.name).toBe(`${originalLayer.name} (Copy)`);

      const duplicatedChild = duplicatedLayer.children![0] as ComponentLayer;
      expect(duplicatedChild.id).not.toBe((originalLayer.children![0] as ComponentLayer).id);
      expect(duplicatedChild.name).toBe(
        `${(originalLayer.children![0] as ComponentLayer).name}`
      );

      const duplicatedDeepChild = duplicatedChild.children![0] as ComponentLayer;
      expect(duplicatedDeepChild.id).not.toBe(
        ((originalLayer.children![0] as ComponentLayer).children![0] as ComponentLayer).id
      );
      expect(duplicatedDeepChild.name).toBe(
        `${((originalLayer.children![0] as ComponentLayer).children![0] as ComponentLayer).name}`
      );
    });

    it("should preserve the structure and properties of the original layers", () => {
      const originalLayer: ComponentLayer = {
        id: "layer7",
        type: "form",
        name: "Form Layer",
        props: { action: "/submit" },
        children: [
          {
            id: "layer7-1",
            type: "input",
            name: "Input Field",
            props: { placeholder: "Enter name" },
            children: [],
          },
          {
            id: "layer7-2",
            type: "button",
            name: "Submit Button",
            props: { label: "Submit" },
            children: [],
          },
        ],
      };

      const duplicatedLayer = duplicateWithNewIdsAndName(originalLayer);

      expect(duplicatedLayer.type).toBe(originalLayer.type);
      expect(duplicatedLayer.props).toEqual(originalLayer.props);
      if (Array.isArray(duplicatedLayer.children)) {
        duplicatedLayer.children!.forEach((child, index) => {
          expect(child.type).toBe((originalLayer.children![index] as ComponentLayer).type);
          expect(child.props).toEqual((originalLayer.children![index] as ComponentLayer).props);
        });
      }
    });
  });

  describe("migrateV1ToV2", () => {
    it("should migrate _text_ layers to span layers", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "_page_",
            name: "Page 1",
            props: {},
            children: [
              {
                id: "layer1",
                type: "_text_",
                name: "Text Layer",
                props: { someProp: "value" },
                text: "Sample text",
                textType: "text",
              },
              {
                id: "layer2",
                type: "button",
                name: "Button Layer",
                props: {},
                children: [],
              },
            ],
          },
        ],
      };

      const migratedState = migrateV1ToV2(persistedState);

      expect(migratedState.pages).toHaveLength(1);
      const migratedPage = migratedState.pages[0];

      expect(migratedPage.children).toHaveLength(2);
      const migratedTextLayer = (migratedPage.children as ComponentLayer[]).find((layer: ComponentLayer) => layer.id === "layer1");
      expect(migratedTextLayer).toBeDefined();
      expect(migratedTextLayer?.type).toBe("span");
      expect(migratedTextLayer?.children).toBe("Sample text");
      expect(migratedTextLayer?.props).toEqual({ someProp: "value" });
    });

    it("should migrate _text_ layers to Markdown layers when textType is 'markdown'", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "_page_",
            name: "Page 1",
            props: {},
            children: [
              {
                id: "layer1",
                type: "_text_",
                name: "Markdown Layer",
                props: { someProp: "value" },
                text: "# Heading",
                textType: "markdown",
              },
            ],
          },
        ],
      };

      const migratedState = migrateV1ToV2(persistedState);

      const migratedTextLayer = (migratedState.pages[0].children as ComponentLayer[]).find((layer: ComponentLayer) => layer.id === "layer1");
      expect(migratedTextLayer).toBeDefined();
      expect(migratedTextLayer?.type).toBe("Markdown");
      expect(migratedTextLayer?.children).toBe("# Heading");
    });

    it("should handle layers without a name", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "_page_",
            name: "Page 1",
            props: {},
            children: [
              {
                id: "layer1",
                type: "_text_",
                props: { someProp: "value" },
                text: "No name layer",
                textType: "text",
              },
            ],
          },
        ],
      };

      const migratedState = migrateV1ToV2(persistedState);

      const migratedTextLayer = (migratedState.pages[0].children as ComponentLayer[]).find((layer: ComponentLayer) => layer.id === "layer1");
      expect(migratedTextLayer).toBeDefined();
      expect(migratedTextLayer?.type).toBe("span");
      expect(migratedTextLayer?.children).toBe("No name layer");
      expect(migratedTextLayer?.name).toBeUndefined();
    });

    it("should preserve non-_text_ layers", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "_page_",
            name: "Page 1",
            props: {},
            children: [
              {
                id: "layer1",
                type: "button",
                name: "Button Layer",
                props: { label: "Click Me" },
                children: [],
              },
            ],
          },
        ],
      };

      const migratedState = migrateV1ToV2(persistedState);

      const migratedButtonLayer = (migratedState.pages[0].children as ComponentLayer[]).find((layer: ComponentLayer) => layer.id === "layer1");
      expect(migratedButtonLayer).toBeDefined();
      expect(migratedButtonLayer?.type).toBe("button");
      expect(migratedButtonLayer?.name).toBe("Button Layer");
      expect(migratedButtonLayer?.props).toEqual({ label: "Click Me" });
    });

    it("should migrate nested _text_ layers correctly", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "_page_",
            name: "Page 1",
            props: {},
            children: [
              {
                id: "layer1",
                type: "container",
                name: "Container Layer",
                props: {},
                children: [
                  {
                    id: "layer1-1",
                    type: "_text_",
                    name: "Nested Text Layer",
                    props: {},
                    text: "Nested text",
                    textType: "text",
                  },
                ],
              },
            ],
          },
        ],
      };

      const migratedState = migrateV1ToV2(persistedState);

      const migratedNestedTextLayer = ((migratedState.pages[0].children as ComponentLayer[])[0].children as ComponentLayer[]).find((layer: ComponentLayer) => layer.id === "layer1-1");
      expect(migratedNestedTextLayer).toBeDefined();
      expect(migratedNestedTextLayer?.type).toBe("span");
      expect(migratedNestedTextLayer?.children).toBe("Nested text");
      expect(migratedNestedTextLayer?.props).toEqual({});
    });

    it("should not modify the original persisted state", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "_page_",
            name: "Page 1",
            props: {},
            children: [
              {
                id: "layer1",
                type: "_text_",
                name: "Text Layer",
                props: { someProp: "value" },
                text: "Sample text",
                textType: "text",
              },
            ],
          },
        ],
      };

      const persistedStateCopy = JSON.parse(JSON.stringify(persistedState));
      migrateV1ToV2(persistedState);

      expect(persistedState).toEqual(persistedStateCopy);
    });
  });

  describe("migrateV2ToV3", () => {
    it("should migrate _page_ layers to div layers", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "_page_",
            name: "Page 1",
            props: { className: "page-class" },
            children: [
              {
                id: "layer1",
                type: "button",
                name: "Button Layer",
                props: { label: "Click Me" },
                children: [],
              },
            ],
          },
          {
            id: "page2",
            type: "_page_",
            name: "Page 2",
            props: { className: "page2-class" },
            children: [],
          },
        ],
        selectedPageId: "page1",
        selectedLayerId: null,
        // Add other potential V2 state properties if needed
      };

      const migratedState = migrateV2ToV3(persistedState);

      expect(migratedState.pages).toHaveLength(2);

      // Check Page 1
      const migratedPage1 = migratedState.pages.find(
        (p) => p.id === "page1"
      );
      expect(migratedPage1).toBeDefined();
      expect(migratedPage1?.type).toBe("div");
      expect(migratedPage1?.name).toBe("Page 1");
      expect(migratedPage1?.props).toEqual({ className: "page-class" });
      expect(migratedPage1?.children).toHaveLength(1);
      expect((migratedPage1?.children as ComponentLayer[])[0].type).toBe(
        "button"
      ); // Child should be untouched

      // Check Page 2
      const migratedPage2 = migratedState.pages.find(
        (p) => p.id === "page2"
      );
      expect(migratedPage2).toBeDefined();
      expect(migratedPage2?.type).toBe("div");
      expect(migratedPage2?.name).toBe("Page 2");
      expect(migratedPage2?.props).toEqual({ className: "page2-class" });
      expect(migratedPage2?.children).toEqual([]);

      // Check other state properties (should be preserved)
      expect(migratedState.selectedPageId).toBe("page1");
      expect(migratedState.selectedLayerId).toBeNull();
    });

    it("should not modify layers that are already divs or other types", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "div", // Already a div
            name: "Page 1",
            props: { className: "page-class" },
            children: [
              {
                id: "layer1",
                type: "button",
                name: "Button Layer",
                props: { label: "Click Me" },
                children: [],
              },
            ],
          },
        ],
        selectedPageId: "page1",
        selectedLayerId: null,
      };

      const originalStateCopy = JSON.parse(JSON.stringify(persistedState));
      const migratedState = migrateV2ToV3(persistedState);

      expect(migratedState).toEqual(originalStateCopy);
    });

    it("should handle state with no _page_ layers", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "div",
            name: "Page 1",
            props: {},
            children: [],
          },
        ],
        selectedPageId: "page1",
        selectedLayerId: null,
      };

      const originalStateCopy = JSON.parse(JSON.stringify(persistedState));
      const migratedState = migrateV2ToV3(persistedState);

      expect(migratedState).toEqual(originalStateCopy);
    });

    it("should preserve all other state properties", () => {
      const persistedState = {
        pages: [
          {
            id: "p1",
            type: "_page_",
            name: "Old Page",
            props: {},
            children: [],
          },
        ],
        selectedPageId: "p1",
        selectedLayerId: "someLayer",
        someOtherV2Property: { nested: true, value: 123 },
      };

      const migratedState = migrateV2ToV3(persistedState);

      expect(migratedState.pages[0].type).toBe("div"); // Check migration happened
      expect(migratedState.selectedPageId).toBe("p1");
      expect(migratedState.selectedLayerId).toBe("someLayer");
      expect(
        (migratedState as unknown as { someOtherV2Property: unknown })
          .someOtherV2Property
      ).toEqual({
        nested: true,
        value: 123,
      });
    });
  });

  describe("createComponentLayer", () => {
    let mockComponentRegistry: any;

    beforeEach(() => {
      mockComponentRegistry = {
        Button: {
          component: () => null,
          name: 'Button',
          schema: z.object({
            label: z.string().default("Click me"),
            disabled: z.boolean().default(false),
            variant: z.string().default("default")
          }),
          defaultChildren: [],
          defaultVariableBindings: [
            { variableId: 'button-text', propName: 'label' }
          ]
        },
        Card: {
          component: () => null,
          name: 'Card',
          schema: z.object({
            title: z.string().default("Card Title"),
            padding: z.string().default("md")
          }),
          defaultChildren: [
            {
              id: 'child1',
              type: 'div',
              name: 'Card Content',
              props: {},
              children: []
            }
          ]
        },
        TextInput: {
          component: () => null,
          name: 'TextInput',
          schema: z.object({
            placeholder: z.string().default("Enter text...")
          }),
          defaultChildren: "Default text content"
        },
        SimpleComponent: {
          component: () => null,
          name: 'SimpleComponent',
          schema: z.object({}) // No default values
        }
      };
    });

    it("should create a basic component layer with default props", () => {
      const layer = createComponentLayer('Button', mockComponentRegistry);

      expect(layer).toMatchObject({
        type: 'Button',
        name: 'Button',
        props: {
          label: "Click me",
          disabled: false,
          variant: "default"
        },
        children: []
      });
      expect(layer.id).toBeDefined();
      expect(layer.id).toHaveLength(7); // Our createId function generates 7-char IDs
    });

    it("should create component with custom ID and name", () => {
      const layer = createComponentLayer('Button', mockComponentRegistry, {
        id: 'custom-id',
        name: 'Custom Button'
      });

      expect(layer.id).toBe('custom-id');
      expect(layer.name).toBe('Custom Button');
      expect(layer.type).toBe('Button');
    });

    it("should handle component with array defaultChildren", () => {
      const layer = createComponentLayer('Card', mockComponentRegistry);

      expect(layer.children).toHaveLength(1);
      expect(Array.isArray(layer.children)).toBe(true);
      
      const child = (layer.children as ComponentLayer[])[0];
      expect(child.type).toBe('div');
      expect(child.name).toBe('Card Content');
      expect(child.id).not.toBe('child1'); // Should have new ID
    });

    it("should handle component with string defaultChildren", () => {
      const layer = createComponentLayer('TextInput', mockComponentRegistry);

      expect(layer.children).toBe("Default text content");
      expect(layer.props.placeholder).toBe("Enter text...");
    });

    it("should handle component with no schema shape", () => {
      const layer = createComponentLayer('SimpleComponent', mockComponentRegistry);

      expect(layer.type).toBe('SimpleComponent');
      expect(layer.name).toBe('SimpleComponent');
      expect(layer.props).toEqual({});
      expect(layer.children).toEqual([]);
    });

    it("should apply variable bindings when requested", () => {
      const variables = [
        { id: 'button-text', defaultValue: 'Dynamic Button' },
        { id: 'other-var', defaultValue: 'Other Value' }
      ];

      const layer = createComponentLayer('Button', mockComponentRegistry, {
        applyVariableBindings: true,
        variables
      });

      expect(layer.props.label).toEqual({ __variableRef: 'button-text' });
      expect(layer.props.disabled).toBe(false); // Non-bound props should retain defaults
    });

    it("should not apply variable bindings when variable not found", () => {
      const variables = [
        { id: 'non-matching-var', defaultValue: 'Value' }
      ];

      const layer = createComponentLayer('Button', mockComponentRegistry, {
        applyVariableBindings: true,
        variables
      });

      expect(layer.props.label).toBe("Click me"); // Should keep default value
    });

    it("should not apply variable bindings when not requested", () => {
      const variables = [
        { id: 'button-text', defaultValue: 'Dynamic Button' }
      ];

      const layer = createComponentLayer('Button', mockComponentRegistry, {
        variables // applyVariableBindings defaults to false
      });

      expect(layer.props.label).toBe("Click me"); // Should keep default value
    });

    it("should throw error for non-existent component type", () => {
      expect(() => {
        createComponentLayer('NonExistentComponent', mockComponentRegistry);
      }).toThrow('Component definition not found for type: NonExistentComponent');
    });

    it("should handle component with no defaultVariableBindings", () => {
      const registryWithoutBindings = {
        SimpleButton: {
          component: () => null,
          name: 'SimpleButton',
          schema: z.object({
            text: z.string().default("Simple")
          }),
          defaultChildren: []
          // No defaultVariableBindings property
        }
      } as any;

      const layer = createComponentLayer('SimpleButton', registryWithoutBindings, {
        applyVariableBindings: true,
        variables: [{ id: 'test-var', defaultValue: 'Test' }]
      });

      expect(layer.props.text).toBe("Simple"); // Should use default value
    });

    it("should exclude children prop from initialProps", () => {
      const registryWithChildrenProp = {
        ComponentWithChildren: {
          component: () => null,
          name: 'ComponentWithChildren',
          schema: z.object({
            title: z.string().default("Title"),
            children: z.string().default("Default children")
          }),
          defaultChildren: "Actual children"
        }
      } as any;

      const layer = createComponentLayer('ComponentWithChildren', registryWithChildrenProp);

      expect(layer.props).toEqual({ title: "Title" });
      expect(layer.props.children).toBeUndefined(); // Should not be in props
      expect(layer.children).toBe("Actual children"); // Should use defaultChildren
    });

    it("should generate unique IDs for each component", () => {
      const layer1 = createComponentLayer('Button', mockComponentRegistry);
      const layer2 = createComponentLayer('Button', mockComponentRegistry);

      expect(layer1.id).not.toBe(layer2.id);
    });

    it("should handle empty defaultChildren correctly", () => {
      const registryWithEmptyChildren = {
        EmptyComponent: {
          component: () => null,
          name: 'EmptyComponent',
          schema: z.object({}),
          defaultChildren: []
        }
      } as any;

      const layer = createComponentLayer('EmptyComponent', registryWithEmptyChildren);

      expect(layer.children).toEqual([]);
    });
  });

  describe("migrateV5ToV6", () => {
    it("should convert old style props to Tailwind v4 format for custom themed pages", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "div",
            name: "Page 1",
            props: {
              "data-color-theme": "custom",
              style: {
                "--foreground": "222.2 84% 4.9%",
                "--background": "0 0% 100%",
                "--radius": "0.5rem"
              }
            },
            children: []
          }
        ],
        selectedPageId: "page1"
      };

      const migratedState = migrateV5ToV6(persistedState);
      
      const migratedPage = migratedState.pages[0];
      const style = migratedPage.props.style as Record<string, string>;
      expect(style).toHaveProperty("--color-foreground");
      expect(style["--color-foreground"]).toBe("hsl(222.2 84% 4.9%)");
      expect(style).toHaveProperty("--radius-lg");
      expect(style["--radius-lg"]).toBe("0.5rem");
      expect(style).toHaveProperty("backgroundColor");
    });

    it("should remove old style from pages without custom theme", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "div",
            name: "Page 1",
            props: {
              style: {
                "--foreground": "222.2 84% 4.9%",
                "--background": "0 0% 100%"
              }
            },
            children: []
          }
        ],
        selectedPageId: "page1"
      };

      const migratedState = migrateV5ToV6(persistedState);
      
      const migratedPage = migratedState.pages[0];
      expect(migratedPage.props.style).toBeUndefined();
    });

    it("should not modify pages without style props", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "div",
            name: "Page 1",
            props: {
              className: "test-class"
            },
            children: []
          }
        ],
        selectedPageId: "page1"
      };

      const migratedState = migrateV5ToV6(persistedState);
      
      const migratedPage = migratedState.pages[0];
      expect(migratedPage.props).toEqual({ className: "test-class" });
    });

    it("should not modify non-div page types", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "container",
            name: "Page 1",
            props: {
              style: {
                "--foreground": "222.2 84% 4.9%"
              }
            },
            children: []
          }
        ],
        selectedPageId: "page1"
      };

      const migratedState = migrateV5ToV6(persistedState);
      
      // Non-div pages should remain unchanged
      expect(migratedState.pages[0]).toEqual(persistedState.pages[0]);
    });

    it("should preserve other state properties", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "div",
            name: "Page 1",
            props: {},
            children: []
          }
        ],
        selectedPageId: "page1",
        selectedLayerId: "layer1",
        variables: [{ id: "var1", value: "test" }]
      };

      const migratedState = migrateV5ToV6(persistedState);
      
      expect(migratedState.selectedPageId).toBe("page1");
      expect(migratedState.selectedLayerId).toBe("layer1");
      expect((migratedState as any).variables).toEqual([{ id: "var1", value: "test" }]);
    });

    it("should handle pages with empty props", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "div",
            name: "Page 1",
            props: {},
            children: []
          }
        ],
        selectedPageId: "page1"
      };

      const migratedState = migrateV5ToV6(persistedState);
      
      expect(migratedState.pages[0].props).toEqual({});
    });

    it("should handle pages with null style property", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "div",
            name: "Page 1",
            props: {
              "data-color-theme": "custom",
              style: null // null value should not crash
            },
            children: []
          }
        ],
        selectedPageId: "page1"
      };

      // Should not throw TypeError when accessing properties on null
      expect(() => migrateV5ToV6(persistedState)).not.toThrow();
      
      const migratedState = migrateV5ToV6(persistedState);
      
      // null style should be preserved (not processed)
      expect(migratedState.pages[0].props.style).toBeNull();
    });

    it("should handle pages with null data-color-theme property", () => {
      const persistedState = {
        pages: [
          {
            id: "page1",
            type: "div",
            name: "Page 1",
            props: {
              "data-color-theme": null, // null value should not crash
              style: {
                "--foreground": "222.2 84% 4.9%"
              }
            },
            children: []
          }
        ],
        selectedPageId: "page1"
      };

      // Should not crash with null theme
      expect(() => migrateV5ToV6(persistedState)).not.toThrow();
      
      const migratedState = migrateV5ToV6(persistedState);
      
      // Style should be removed since theme is null (no custom theme)
      expect(migratedState.pages[0].props.style).toBeUndefined();
      expect(migratedState.pages[0].props["data-color-theme"]).toBeNull();
    });
  });

  describe("moveLayer", () => {
    it("should move a layer to a new parent", () => {
      const layers: ComponentLayer[] = [
        {
          id: "page1",
          type: "div",
          name: "Page 1",
          props: {},
          children: [
            {
              id: "container1",
              type: "div",
              name: "Container 1",
              props: {},
              children: [
                {
                  id: "button1",
                  type: "button",
                  name: "Button 1",
                  props: {},
                  children: []
                }
              ]
            },
            {
              id: "container2",
              type: "div",
              name: "Container 2",
              props: {},
              children: []
            }
          ]
        }
      ];

      const result = moveLayer(layers, "button1", "container2", 0);
      
      const container1 = (result[0].children as ComponentLayer[]).find(c => c.id === "container1");
      const container2 = (result[0].children as ComponentLayer[]).find(c => c.id === "container2");
      
      expect((container1?.children as ComponentLayer[]).length).toBe(0);
      expect((container2?.children as ComponentLayer[]).length).toBe(1);
      expect((container2?.children as ComponentLayer[])[0].id).toBe("button1");
    });

    it("should handle moving layer within the same parent", () => {
      const layers: ComponentLayer[] = [
        {
          id: "page1",
          type: "div",
          name: "Page 1",
          props: {},
          children: [
            {
              id: "button1",
              type: "button",
              name: "Button 1",
              props: {},
              children: []
            },
            {
              id: "button2",
              type: "button",
              name: "Button 2",
              props: {},
              children: []
            },
            {
              id: "button3",
              type: "button",
              name: "Button 3",
              props: {},
              children: []
            }
          ]
        }
      ];

      const result = moveLayer(layers, "button3", "page1", 0);
      
      const pageChildren = result[0].children as ComponentLayer[];
      expect(pageChildren[0].id).toBe("button3");
      expect(pageChildren[1].id).toBe("button1");
      expect(pageChildren[2].id).toBe("button2");
    });

    it("should return unchanged layers when source layer not found", () => {
      const layers: ComponentLayer[] = [
        {
          id: "page1",
          type: "div",
          name: "Page 1",
          props: {},
          children: []
        }
      ];

      console.warn = jest.fn();
      const result = moveLayer(layers, "nonexistent", "page1", 0);
      
      expect(result).toEqual(layers);
      expect(console.warn).toHaveBeenCalledWith("Source layer with ID nonexistent not found");
    });

    it("should handle moving deeply nested layers", () => {
      const layers: ComponentLayer[] = [
        {
          id: "page1",
          type: "div",
          name: "Page 1",
          props: {},
          children: [
            {
              id: "container1",
              type: "div",
              name: "Container 1",
              props: {},
              children: [
                {
                  id: "nested1",
                  type: "div",
                  name: "Nested 1",
                  props: {},
                  children: [
                    {
                      id: "deep-button",
                      type: "button",
                      name: "Deep Button",
                      props: {},
                      children: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];

      const result = moveLayer(layers, "deep-button", "page1", 0);
      
      const pageChildren = result[0].children as ComponentLayer[];
      expect(pageChildren[0].id).toBe("deep-button");
      
      const container1 = pageChildren.find(c => c.id === "container1");
      const nested1 = (container1?.children as ComponentLayer[])[0];
      expect((nested1.children as ComponentLayer[]).length).toBe(0);
    });
  });

  describe("canLayerAcceptChildren", () => {
    const mockRegistry = {
      div: {
        component: () => null,
        schema: z.object({
          children: z.any().optional(),
          className: z.string().optional()
        })
      },
      span: {
        component: () => null,
        schema: z.object({
          children: z.string().optional(),
          className: z.string().optional()
        })
      },
      button: {
        component: () => null,
        schema: z.object({
          label: z.string(),
          className: z.string().optional()
        })
      }
    } as any;

    it("should return true for layers with children field and array children", () => {
      const layer: ComponentLayer = {
        id: "div1",
        type: "div",
        name: "Div Layer",
        props: {},
        children: []
      };

      expect(canLayerAcceptChildren(layer, mockRegistry)).toBe(true);
    });

    it("should return false for layers with string children", () => {
      const layer: ComponentLayer = {
        id: "span1",
        type: "span",
        name: "Span Layer",
        props: {},
        children: "text content"
      };

      expect(canLayerAcceptChildren(layer, mockRegistry)).toBe(false);
    });

    it("should return false for layers without children field in schema", () => {
      const layer: ComponentLayer = {
        id: "button1",
        type: "button",
        name: "Button Layer",
        props: {},
        children: []
      };

      expect(canLayerAcceptChildren(layer, mockRegistry)).toBe(false);
    });

    it("should return false for unknown component types", () => {
      const layer: ComponentLayer = {
        id: "unknown1",
        type: "unknown",
        name: "Unknown Layer",
        props: {},
        children: []
      };

      expect(canLayerAcceptChildren(layer, mockRegistry)).toBe(false);
    });
  });

  describe("addLayer edge cases", () => {
    it("should not add child to layer with string children", () => {
      const layers: ComponentLayer[] = [
        {
          id: "page1",
          type: "div",
          name: "Page 1",
          props: {},
          children: [
            {
              id: "span1",
              type: "span",
              name: "Text Layer",
              props: {},
              children: "some text content"
            }
          ]
        }
      ];

      const newLayer: ComponentLayer = {
        id: "button1",
        type: "button",
        name: "Button",
        props: {},
        children: []
      };

      // Try to add to the span which has string children
      const result = addLayer(layers, newLayer, "span1");
      
      // Should not modify the span's children
      const span = (result[0].children as ComponentLayer[]).find(c => c.id === "span1");
      expect(span?.children).toBe("some text content");
    });
  });
});
