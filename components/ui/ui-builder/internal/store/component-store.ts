import { ComponentType as ReactComponentType } from 'react';
import { create, useStore } from 'zustand';
import { produce } from 'immer';
import { temporal, TemporalState } from 'zundo';
import { generateMock } from '@anatine/zod-mock';
import isDeepEqual from 'fast-deep-equal';
import { z, ZodTypeAny, ZodUnion, ZodLiteral, ZodOptional, ZodNullable, ZodEnum, ZodObject, ZodRawShape, ZodNumber, ZodDate, ZodArray, ZodString, ZodTuple, ZodRecord, set } from 'zod';
// import { ComponentDefinitions } from '@/components/ui/generated-schemas';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transactions } from '@/components/ui/transactions';
import { Flexbox } from '@/components/ui/ui-builder/flexbox';


// Component registry with Zod schemas or add manually like:
// Button: {
//   component: Button,
//   schema: z.object({
//     children: z.array(z.object({
//       type: z.enum(['Button']),
//       props: z.object({
//         children: z.string(),
//         variant: z.string(),
//         size: z.string(),
//         disabled: z.boolean(),
//       }),
//     })),
//   }),
//   from: '@/components/ui/button'
// }
const componentRegistry = {
  // ...ComponentDefinitions
  Button: {
    component: Button,
    schema: patchSchema(z.object({
      asChild: z.boolean().optional(),
      children: z.any().optional(),
      variant: z.union([z.literal("default"), z.literal("destructive"), z.literal("outline"), z.literal("secondary"), z.literal("ghost"), z.literal("link")]).optional().nullable(),
      size: z.union([z.literal("default"), z.literal("sm"), z.literal("lg"), z.literal("icon")]).optional().nullable()

    })),
    from: '@/components/ui/button'
  },
  Badge: {
    component: Badge,
    schema: patchSchema(z.object({
      children: z.any().optional(),
      variant: z.enum(['default', 'secondary', 'destructive', 'outline']).default('default'),
    })),
    from: '@/components/ui/badge'
  },
  Transactions: {
    component: Transactions,
    schema: patchSchema(z.object({
      data: z.array(z.object({
        id: z.string(),
        customer: z.string(),
        email: z.string(),
        amount: z.number()
      }))
    })),
    from: '@/components/ui/transactions'
  },
  Flexbox: {
    component: Flexbox,
    schema: patchSchema(z.object({
      children: z.any().optional(),
      direction: z.union([z.literal("row"), z.literal("column"), z.literal("rowReverse"), z.literal("columnReverse")]).optional().nullable(),
      justify: z.union([z.literal("start"), z.literal("end"), z.literal("center"), z.literal("between"), z.literal("around"), z.literal("evenly")]).optional().nullable(),
      align: z.union([z.literal("start"), z.literal("end"), z.literal("center"), z.literal("baseline"), z.literal("stretch")]).optional().nullable(),
      wrap: z.union([z.literal("wrap"), z.literal("nowrap"), z.literal("wrapReverse")]).optional().nullable(),
      gap: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(4), z.literal(8)]).optional().nullable()
    })),
    from: '@/components/ui/ui-builder/flexbox'
  }
};

// Update the CustomComponentType interface
export interface CustomComponentType<T = any> {
  name: keyof typeof componentRegistry;
  component: ReactComponentType<T>;
  schema: ZodObject<any>;
}

export type LayerType = keyof typeof componentRegistry | '_text_';

export type Layer =
  | {
    id: string;
    name?: string;
    type: keyof typeof componentRegistry;
    props: Record<string, any>;
    children?: Layer[];
  }
  | TextLayer
  | PageLayer;

export type ComponentLayer = Exclude<Layer, TextLayer>;

export type TextLayer = {
  id: string;
  name?: string;
  type: '_text_';
  props: Record<string, any>;
  text: string;
  textType: 'text' | 'markdown';
};

export type PageLayer = {
  id: string;
  name?: string;
  type: '_page_';
  props: Record<string, any>;
  children: Layer[];
}

interface ComponentStore {
  // components: CustomComponentType[];
  pages: PageLayer[];
  addComponentLayer: (layerType: keyof typeof componentRegistry, parentId: string, parentPosition?: number) => void;
  addTextLayer: (text: string, textType: 'text' | 'markdown', parentId: string, parentPosition?: number) => void;
  addPageLayer: (pageId: string) => void;
  duplicateLayer: (layerId: string, parentId?: string) => void;
  removeLayer: (layerId: string) => void;
  updateLayerProps: (layerId: string, newProps: Record<string, any>) => void;
  selectLayer: (layerId: string) => void;
  selectPage: (pageId: string) => void;
  reorderChildrenLayers: (parentId: string, orderedChildrenIds: string[]) => void;
  selectedLayerId: string | null;
  selectedPageId: string;
  findLayerById: (layerId: string | null) => Layer | undefined;
  findLayersForPageId: (pageId: string) => Layer[];
}

const useComponentStore = create(temporal<ComponentStore>((set, get) => ({

  // components: Object.entries(componentRegistry).map(([name, { component, schema }]) => ({
  //   name: name as keyof typeof componentRegistry,
  //   component,
  //   schema,
  // })),

  pages: [
    {
      id: '1',
      type: '_page_',
      name: 'Page 1',
      props: {},
      children: [],
    }
  ],

  selectedLayerId: null,
  selectedPageId: '1',
  findLayerById: (layerId: string | null) => {
    const { selectedPageId, findLayersForPageId, pages } = get();
    if (!layerId || !selectedPageId) return undefined;
    if (layerId === selectedPageId) {
      return pages.find(page => page.id === selectedPageId);
    }
    const layers = findLayersForPageId(selectedPageId);
    if (!layers) return undefined;
    return findLayerRecursive(layers, layerId);
  },
  findLayersForPageId: (pageId: string) => {
    const { pages } = get();
    const page = pages.find(page => page.id === pageId);
    return page?.children || [];
  },

  addComponentLayer: (layerType: keyof typeof componentRegistry, parentId: string, parentPosition?: number) => set(produce((state: ComponentStore) => {
    const defaultProps = getDefaultProps(componentRegistry[layerType].schema);
    console.log("addComponentLayer", { layerType, parentId, parentPosition, defaultProps });

    const initialProps = Object.entries(defaultProps).reduce((acc, [key, propDef]) => {
      if (key !== "children") {
        acc[key] = propDef;
      }
      return acc;
    }, {} as Record<string, any>);

    const newLayer: Layer = {
      id: createId(),
      type: layerType,
      props: initialProps,
      children: [],
    };

    // Traverse and update the pages to add the new layer
    const updatedPages = addLayer(state.pages, newLayer, parentId, parentPosition);
    console.log("updatedPages", { updatedPages });
    return {
      ...state,
      pages: updatedPages
    };
  })),

  addTextLayer: (text: string, textType: 'text' | 'markdown', parentId: string, parentPosition?: number) => set(produce((state: ComponentStore) => {
    const newLayer: TextLayer = {
      id: createId(),
      type: '_text_',
      text,
      textType,
      props: {},
    };

    // Traverse and update the pages to add the new text layer
    const updatedPages = addLayer(state.pages, newLayer, parentId, parentPosition);
    console.log("updatedPages", { updatedPages });
    return {
      ...state,
      pages: updatedPages
    };
  })),

  addPageLayer: (pageName: string) => set(produce((state: ComponentStore) => {
    const newPage: PageLayer = {
      id: createId(),
      type: '_page_',
      name: pageName,
      props: {},
      children: [],
    };
    return {
      pages: [...state.pages, newPage],
      selectedPageId: newPage.id,
    };
  })),

  duplicateLayer: (layerId: string) => set(produce((state: ComponentStore) => {
    let layerToDuplicate: Layer | undefined;
    let parentId: string | undefined;
    let parentPosition: number | undefined;
    // Find the layer to duplicate
    state.pages.forEach((page) =>
      visitLayer(page, null, (layer, parent) => {
        if (layer.id === layerId) {
          layerToDuplicate = layer;
          parentId = parent?.id;
          if (parent && hasChildren(parent)) {
            parentPosition = parent.children.indexOf(layer) + 1;
          }
        }
        return layer;
      })
    );
    if (!layerToDuplicate) {
      console.warn(`Layer with ID ${ layerId } not found.`);
      return;
    }

    // Create a deep copy of the layer with new IDs
    const duplicateWithNewIds = (layer: Layer): Layer => {
      const newLayer: Layer = { ...layer, id: createId() };
      if (hasChildren(newLayer) && hasChildren(layer)) {
        newLayer.children = layer.children.map(duplicateWithNewIds);
      }
      return newLayer;
    };

    const newLayer = duplicateWithNewIds(layerToDuplicate);

    const updatedPages = addLayer(state.pages, newLayer, parentId, parentPosition);

    // Insert the duplicated layer
    return {
      ...state,
      pages: updatedPages
    };
  })),

  removeLayer: (layerId: string) => set(produce((state: ComponentStore) => {
    const { selectedLayerId, pages } = get();

    let newSelectedLayerId = selectedLayerId;

    // Traverse and update the pages to remove the specified layer
    const updatedPages = pages.map((page) =>
      visitLayer(page, null, (layer, parent) => {

        console.log("removeLayer", { layer, parent });
        if (hasChildren(layer)) {

          // Remove the layer by filtering it out from the children
          const updatedChildren = layer.children.filter((child) => child.id !== layerId);
          return { ...layer, children: updatedChildren };
        }

        return layer;
      })
    );

    if (selectedLayerId === layerId) {
      // If the removed layer was selected, deselect it 
      newSelectedLayerId = null;
    }
    return {
      ...state,
      selectedLayerId: newSelectedLayerId,
      pages: updatedPages,
    };
  })),

  updateLayerProps: (layerId: string, newProps: Record<string, any>) => set(
    produce((state: ComponentStore) => {
      const { selectedPageId, findLayersForPageId, pages } = get();

      if (!selectedPageId) {
        console.warn("No page is currently selected.");
        return state;
      }

      console.log("updateLayerProps", { layerId, newProps });

      // Handle updating the root page's properties
      if (layerId === selectedPageId) {
        const updatedPages = pages.map(page =>
          page.id === selectedPageId
            ? { ...page, props: { ...page.props, ...newProps } }
            : page
        );
        console.log("updatedPages", { updatedPages });
        return { ...state, pages: updatedPages };
      }

      const layers = findLayersForPageId(selectedPageId);
      if (!layers) {
        console.warn(`No layers found for page ID: ${ selectedPageId }`);
        return state;
      }

      // Visitor function to update layer properties
      const visitor = (layer: Layer): Layer => {
        if (layer.id === layerId) {
          if (isTextLayer(layer)) {
            const { text, textType, ...rest } = newProps;
            return {
              ...layer,
              text: text !== undefined ? text : layer.text,
              textType: textType !== undefined ? textType : layer.textType,
              props: { ...layer.props, ...rest },
            };
          } else {
            return {
              ...layer,
              props: { ...layer.props, ...newProps },
            };
          }
        }
        return layer;
      };

      // Apply the visitor to update layers
      const updatedLayers = layers.map(layer => visitLayer(layer, null, visitor));

      if (updatedLayers === layers) {
        console.warn(`Layer with ID ${ layerId } was not found.`);
        return state;
      }

      // Update the state with the modified layers
      const updatedPages = state.pages.map(page =>
        page.id === selectedPageId ? { ...page, children: updatedLayers } : page
      );

      return { ...state, pages: updatedPages };
    })
  ),


  selectLayer: (layerId: string) => set(produce((state: ComponentStore) => {
    const { selectedPageId, findLayersForPageId } = get();
    if (!selectedPageId) return state;
    const layers = findLayersForPageId(selectedPageId);
    if (!layers) return state;
    const layer = findLayerRecursive(layers, layerId);
    if (layer) {
      return {
        selectedLayerId: layer.id
      };
    }
    return {};
  })),

  selectPage: (pageId: string) => set(produce((state: ComponentStore) => {
    const page = state.pages.find(page => page.id === pageId);
    if (!page) return state;
    return {
      selectedPageId: pageId
    };
  })),

  reorderChildrenLayers: (parentId: string, orderedChildrenIds: string[]) => set(produce((state: ComponentStore) => {
    console.log("reorderChildrenLayers", parentId, orderedChildrenIds);
    const { pages } = get();

    // Define the visitor function
    const visitor = (layer: Layer, parent: Layer | null): Layer => {
      if (layer.id === parentId && hasChildren(layer)) {
        if (!layer.children) {
          // If the parent layer has no children, return it unchanged
          return layer;
        }

        console.log("layer.children before reorder", layer.children);

        // Reorder children based on orderedChildrenIds
        const newChildren = orderedChildrenIds
          .map(id => layer.children!.find(child => child.id === id))
          .filter(child => child !== undefined) as Layer[];

        console.log("newChildren after reorder", newChildren);

        return {
          ...layer,
          children: newChildren,
        };
      }

      return layer;
    };

    // Apply the visitor to all layers
    const updatedPages = pages.map(page => ({
      ...page,
      children: page.children.map(layer => visitLayer(layer, null, visitor)),
    }));

    return {
      ...state,
      pages: updatedPages,
    };
  })),
}),
  {
    onSave: (state: ComponentStore) => {
      console.log("onSave", state);
    },
    equality: (pastState, currentState) =>
      isDeepEqual(pastState, currentState),
  }
))

const findParentLayerRecursive = (layers: Layer[], layerId: string): Layer | null => {
  for (const layer of layers) {
    if (!isTextLayer(layer) && layer.children && layer.children.some(child => child.id === layerId)) {
      return layer;
    }
    if (!isTextLayer(layer) && layer.children) {
      const parent = findParentLayerRecursive(layer.children, layerId);
      if (parent) return parent;
    }
  }
  return null;
};

const findLayerRecursive = (layers: Layer[], layerId: string): Layer | undefined => {
  for (const layer of layers) {
    if (layer.id === layerId) {
      return layer;
    }
    if (!isTextLayer(layer) && layer.children) {
      const foundInChildren = findLayerRecursive(layer.children, layerId);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }
  return undefined;
};

const addLayer = (layers: Layer[], newLayer: Layer, parentId?: string, parentPosition?: number): Layer[] => {
  const updatedPages = layers.map((page) =>
    visitLayer(page, null, (layer, parent) => {
      if (layer.id === parentId && hasChildren(layer)) {
        let updatedChildren = layer.children ? [...layer.children] : [];

        if (parentPosition !== undefined) {
          if (parentPosition < 0) {
            // If parentPosition is negative, insert at the beginning
            updatedChildren = [newLayer, ...updatedChildren];
          } else if (parentPosition >= updatedChildren.length) {
            // If parentPosition is greater than or equal to the length, append to the end
            updatedChildren = [...updatedChildren, newLayer];
          } else {
            // Insert at the specified position
            updatedChildren = [
              ...updatedChildren.slice(0, parentPosition),
              newLayer,
              ...updatedChildren.slice(parentPosition)
            ];
          }
        } else {
          // If parentPosition is undefined, append to the end
          updatedChildren = [...updatedChildren, newLayer];
        }

        return { ...layer, children: updatedChildren };
      }

      return layer;
    })
  );
  return updatedPages;
}


function createId(): string {
  const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const ID_LENGTH = 7;
  let result = '';
  const alphabetLength = ALPHABET.length;

  for (let i = 0; i < ID_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * alphabetLength);
    result += ALPHABET.charAt(randomIndex);
  }

  return result;
}

function getDefaultProps(schema: ZodObject<any>) {
  // Transform schema to a new schema with only the required fields from the original schema
  const shape = schema.shape; // Use Zod's public API to access the shape
  const requiredShape: Record<string, z.ZodTypeAny> = {};

  for (const [key, fieldSchema] of Object.entries(shape)) {
    // Include only required fields (those that are not instances of ZodOptional)
    if (!(fieldSchema instanceof z.ZodOptional)) {
      requiredShape[key] = fieldSchema as z.ZodTypeAny;
    }
  }

  const requiredSchema = z.object(requiredShape);

  // Generate mock data based on the requiredSchema
  const mockData = generateMock(requiredSchema, { seed: 1234 });

  return mockData;
}

function patchSchema(schema: ZodObject<any>): ZodObject<any> {
  const schemaWithFixedEnums = transformUnionToEnum(schema);
  const schemaWithCoercedTypes = addCoerceToNumberAndDate(schemaWithFixedEnums);
  const schemaWithCommon = addCommon(schemaWithCoercedTypes);
  //log the patched schema in a readable way
  console.log({ patchSchema: schemaWithCommon.shape });
  return schemaWithCommon;
}

/**
 * Extends the given Zod object schema by adding an optional `className` property.
 *
 * @param schema - The original Zod object schema.
 * @returns A new Zod object schema with the `className` property added.
 */
function addCommon<T extends ZodRawShape>(
  schema: ZodObject<T>
) {
  return schema.extend({
    className: z.string().optional(),
  });
}

/**
 * Transforms a ZodUnion of ZodLiterals into a ZodEnum with a default value.
 * If the schema is nullable or optional, it recursively applies the transformation to the inner schema.
 *
 * @param schema - The original Zod schema, which can be a ZodUnion, ZodNullable, ZodOptional, or ZodObject.
 * @returns A transformed Zod schema with unions of literals converted to enums, or the original schema if no transformation is needed.
 */
function transformUnionToEnum<T extends ZodTypeAny>(schema: T): T {
  // Handle ZodUnion of string literals
  if (schema instanceof ZodUnion) {
    const options = schema.options;

    // Check if all options are ZodLiteral instances with string values
    if (
      options.every(
        (option: any) => option instanceof ZodLiteral && typeof option._def.value === 'string'
      )
    ) {
      const enumValues = options.map(
        (option: ZodLiteral<string>) => option.value
      ).reverse();

      // Ensure there is at least one value to create an enum
      if (enumValues.length === 0) {
        throw new Error("Cannot create enum with no values.");
      }

      // Create a ZodEnum from the string literals
      const enumSchema = z.enum(enumValues as [string, ...string[]]);

      // Determine if the original schema was nullable or optional
      let transformedSchema: ZodTypeAny = enumSchema;

      // Apply default before adding modifiers to ensure it doesn't get overridden
      transformedSchema = enumSchema.default(enumValues[0]);


      if (schema.isNullable()) {
        transformedSchema = transformedSchema.nullable();
      }

      if (schema.isOptional()) {
        transformedSchema = transformedSchema.optional();
      }

      return transformedSchema as unknown as T;
    }
  }

  // Recursively handle nullable and optional schemas
  if (schema instanceof ZodNullable) {
    const inner = schema.unwrap();
    const transformedInner = transformUnionToEnum(inner);
    return transformedInner.nullable() as any;
  }

  if (schema instanceof ZodOptional) {
    const inner = schema.unwrap();
    const transformedInner = transformUnionToEnum(inner);
    return transformedInner.optional() as any;
  }

  // Recursively handle ZodObjects by transforming their shape
  if (schema instanceof ZodObject) {
    const transformedShape: Record<string, ZodTypeAny> = {};

    for (const [key, value] of Object.entries(schema.shape)) {
      transformedShape[key] = transformUnionToEnum(value as ZodTypeAny);
    }

    return z.object(transformedShape) as unknown as T;
  }

  // Handle ZodArrays by transforming their element type
  if (schema instanceof ZodArray) {
    const transformedElement = transformUnionToEnum(schema.element);
    return z.array(transformedElement) as unknown as T;
  }

  // Handle ZodTuples by transforming each element type
  if (schema instanceof ZodTuple) {
    const transformedItems = schema.items.map((item: any) => transformUnionToEnum(item));
    return z.tuple(transformedItems) as unknown as T;
  }

  // If none of the above, return the schema unchanged
  return schema;
}

/**
 * Recursively applies coercion to number and date fields within the given Zod schema.
 * Handles nullable, optional, objects, arrays, unions, and enums appropriately to ensure type safety.
 *
 * @param schema - The original Zod schema to transform.
 * @returns A new Zod schema with coercions applied where necessary.
 */
function addCoerceToNumberAndDate<T extends ZodTypeAny>(schema: T): T {
  // Handle nullable schemas
  if (schema instanceof ZodNullable) {
    const inner = schema.unwrap();
    return addCoerceToNumberAndDate(inner).nullable() as any;
  }

  // Handle optional schemas
  if (schema instanceof ZodOptional) {
    const inner = schema.unwrap();
    return addCoerceToNumberAndDate(inner).optional() as any;
  }

  // Handle objects by recursively applying the transformation to each property
  if (schema instanceof ZodObject) {
    const shape: ZodRawShape = schema.shape;
    const transformedShape: ZodRawShape = {};

    for (const [key, value] of Object.entries(shape)) {
      transformedShape[key] = addCoerceToNumberAndDate(value);
    }

    return z.object(transformedShape) as any;
  }

  // Handle arrays by applying the transformation to the array's element type
  if (schema instanceof ZodArray) {
    const innerType = schema.element;
    return z.array(addCoerceToNumberAndDate(innerType)) as any;
  }

  // Apply coercion to number fields
  if (schema instanceof ZodNumber) {
    return z.coerce.number().optional() as any; // Adjust `.optional()` based on your schema requirements
  }

  // Apply coercion to date fields
  if (schema instanceof ZodDate) {
    return z.coerce.date().optional() as any; // Adjust `.optional()` based on your schema requirements
  }

  // Handle unions by applying the transformation to each option
  if (schema instanceof ZodUnion) {
    const transformedOptions = schema.options.map((option: any) => addCoerceToNumberAndDate(option));
    return z.union(transformedOptions) as any;
  }

  // Handle enums by returning them as-is
  if (schema instanceof ZodEnum) {
    return schema;
  }

  // If none of the above, return the schema unchanged
  return schema;
}


/**
 * Recursively visits each layer in the layer tree and applies the provided visitor function to each layer.
 * The visitor function can modify the layer and its children as needed.
 *
 * @param layer - The current layer to visit.
 * @param visitor - A function that takes a layer and returns a modified layer.
 * @returns The modified layer after applying the visitor function.
 */
const visitLayer = (layer: Layer, parentLayer: Layer | null, visitor: (layer: Layer, parentLayer: Layer | null) => Layer): Layer => {
  // Apply the visitor to the current layer
  const updatedLayer = visitor(layer, parentLayer);

  // Recursively traverse and update children if they exist
  if (hasChildren(updatedLayer)) {
    const updatedChildren = updatedLayer.children.map((child) =>
      visitLayer(child, updatedLayer, visitor)
    );
    return { ...updatedLayer, children: updatedChildren };
  }

  return updatedLayer;
};

const hasChildren = (layer: Layer): layer is ComponentLayer & { children: Layer[] } => {
  return 'children' in layer && Array.isArray(layer.children);
};

function isTextLayer(layer: Layer): layer is TextLayer {
  return layer.type === '_text_';
}

function isPageLayer(layer: Layer): layer is PageLayer {
  return layer.type === '_page_';
}




export { useComponentStore, componentRegistry, isTextLayer, isPageLayer };