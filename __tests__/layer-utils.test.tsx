/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  visitLayer,
  countLayers,
  addLayer,
  findLayerRecursive,
  findAllParentLayersRecursive,
  createId,
  hasLayerChildren,
  isPageLayer,
  duplicateWithNewIdsAndName,
  migrateV1ToV2
} from "../lib/ui-builder/store/layer-utils";
import {
  Layer,
  PageLayer,
  ComponentLayer,
} from "../lib/ui-builder/store/layer-store";

describe("Layer Utils", () => {
  let mockPages: PageLayer[];

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
      const visitor = jest.fn((layer: Layer, parent: Layer | null) => layer);
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
      const visitor = (layer: Layer, parent: Layer | null): Layer => {
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
      const updatedPages = visitLayer(mockPages[0], null, visitor) as PageLayer;

      const updatedButton = updatedPages.children!.find(
        (layer) => layer.id === "layer1"
      ) as ComponentLayer;
      expect(updatedButton.props.label).toBe("Updated Label");

      const textLayer = updatedPages.children!.find(
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
      ) as PageLayer;
      expect(page1.children).toHaveLength(3);
      const addedLayer = page1.children.find((layer) => layer.id === "layer3");
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
      ) as PageLayer;
      expect(page1.children).toHaveLength(3);
      expect(page1.children[1].id).toBe("layer3");
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
      ) as PageLayer;
      expect(page1.children).toHaveLength(3);
      expect(page1.children[2].id).toBe("layer3");
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
      ) as PageLayer;
      expect(page1.children).toHaveLength(3);
      expect(page1.children[0].id).toBe("layer0");
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
      ) as PageLayer;
      expect(page1.children).toHaveLength(3);
      expect(page1.children[2].id).toBe("layer4");
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
      expect(isPageLayer(page!)).toBe(true);
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
  });

  describe("isPageLayer", () => {
    it("should return true for page layers", () => {
      const layer: PageLayer = {
        id: "page3",
        type: "_page_",
        name: "Page 3",
        props: { className: "page3-class" },
        children: [], // Ensure children is present
      };
      expect(isPageLayer(layer)).toBe(true);
    });

    it("should return false for non-page layers", () => {
      const layer: ComponentLayer = {
        id: "comp3",
        type: "checkbox",
        name: "Checkbox Layer",
        props: { checked: true },
        children: [],
      };
      expect(isPageLayer(layer)).toBe(false);
    });
  });

  describe("findAllParentLayersRecursive", () => {
    it("should find all parent layers for a given layer", () => {
      const layers: Layer[] = [
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
      const layers: Layer[] = [
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
      const layers: Layer[] = [
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
      const originalLayer: Layer = {
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
      const originalLayer: Layer = {
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
      const originalLayer: Layer = {
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

      const duplicatedLayer = duplicateWithNewIdsAndName(originalLayer);

      expect(duplicatedLayer.id).not.toBe(originalLayer.id);
      expect(duplicatedLayer.name).toBe(`${originalLayer.name} (Copy)`);
      expect(duplicatedLayer.children).toHaveLength(
        originalLayer.children.length
      );

      if (Array.isArray(duplicatedLayer.children)) {
        duplicatedLayer.children.forEach((child, index) => {
          expect(child.id).not.toBe((originalLayer.children![index] as ComponentLayer).id);
          expect(child.name).toBe(
          `${(originalLayer.children![index] as ComponentLayer).name} (Copy)`
        );
        expect(child.type).toBe((originalLayer.children![index] as ComponentLayer).type);
        expect(child.props).toEqual((originalLayer.children![index] as ComponentLayer).props);
        expect(child.children).toEqual((originalLayer.children![index] as ComponentLayer).children);
        });
      }
    });

    it("should handle layers without a name", () => {
      const originalLayer: Layer = {
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
      const originalLayer: Layer = {
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
      const originalLayer: Layer = {
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
        `${(originalLayer.children![0] as ComponentLayer).name} (Copy)`
      );

      const duplicatedDeepChild = duplicatedChild.children![0] as ComponentLayer;
      expect(duplicatedDeepChild.id).not.toBe(
        ((originalLayer.children![0] as ComponentLayer).children![0] as ComponentLayer).id
      );
      expect(duplicatedDeepChild.name).toBe(
        `${((originalLayer.children![0] as ComponentLayer).children![0] as ComponentLayer).name} (Copy)`
      );
    });

    it("should preserve the structure and properties of the original layers", () => {
      const originalLayer: Layer = {
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
      const migratedTextLayer = migratedPage.children.find((layer: Layer) => layer.id === "layer1");
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

      const migratedTextLayer = migratedState.pages[0].children.find((layer: Layer) => layer.id === "layer1");
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

      const migratedTextLayer = migratedState.pages[0].children.find((layer: Layer) => layer.id === "layer1");
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

      const migratedButtonLayer = migratedState.pages[0].children.find((layer: Layer) => layer.id === "layer1");
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

      const migratedNestedTextLayer = (migratedState.pages[0].children[0].children as ComponentLayer[]).find((layer: ComponentLayer) => layer.id === "layer1-1");
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
});
