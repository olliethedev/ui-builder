import { ComponentType as ReactComponentType } from 'react';
import { create } from 'zustand';
import { generateMock } from '@anatine/zod-mock';
import { z, ZodTypeAny, ZodUnion, ZodLiteral, ZodOptional, ZodNullable, ZodEnum, ZodObject, ZodRawShape, ZodNumber, ZodDate, ZodArray, ZodString, ZodTuple, ZodRecord } from 'zod';
// import { ComponentDefinitions } from '@/components/ui/generated-schemas';
import { customAlphabet } from "nanoid";
import { Button } from '../../button';
import { Badge } from '../../badge';
import { Transactions } from '../../transactions';


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
  Badge:{
    component: Badge,
    schema: patchSchema(z.object({
      children: z.any().optional(),
      variant: z.enum(['default', 'secondary', 'destructive', 'outline']).default('default'),
    })),
    from: '@/components/ui/badge'
  },
  Transactions:{
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
  }
};

// Update the CustomComponentType interface
export interface CustomComponentType<T = any> {
  name: keyof typeof componentRegistry;
  component: ReactComponentType<T>;
  schema: ZodObject<any>;
}

export type LayerType = keyof typeof componentRegistry | '_text_';

export type Layer = {
  id: string;
} & (
    | {
      type: keyof typeof componentRegistry;
      props: Record<string, any>;
      children?: Layer[];
    }
    | {
      type: '_text_';
      text: string;
    }
  );

export type ComponentLayer = Exclude<Layer, { type: '_text_'; text: string }>;

interface ComponentStore {
  components: CustomComponentType[];
  layers: Layer[];
  addComponentLayer: (layerType: keyof typeof componentRegistry, parentId?: string, parentPosition?: number) => void;
  addTextLayer: (text: string, parentId?: string, parentPosition?: number) => void;
  duplicateLayer: (layerId: string, parentId?: string) => void;
  removeLayer: (layerId: string) => void;
  updateLayerProps: (layerId: string, newProps: Record<string, any>) => void;
  selectLayer: (layerId: string) => void;
  selectedLayer: ComponentLayer | null;
}

export const useComponentStore = create<ComponentStore>((set: any) => ({
  components: Object.entries(componentRegistry).map(([name, { component, schema }]) => ({
    name: name as keyof typeof componentRegistry,
    component,
    schema,
  })),
  layers: [],
  selectedLayer: null,
  addComponentLayer: (layerType: keyof typeof componentRegistry, parentId?: string, parentPosition?: number) => set((state: ComponentStore) => {
    const defaultProps = getDefaultProps(componentRegistry[layerType].schema);
    console.log({defaultProps});
    const initialProps = Object.entries(defaultProps).reduce((acc, [key, propDef]) => {
      if (key !== 'children') {
        acc[key] = propDef;
      }
      return acc;
    }, {} as Record<string, any>);
    const newLayer: Layer = {
      id: createId(),
      type: layerType,
      props: initialProps,
      children: []
    };

    return addLayerToState(state, newLayer, parentId, parentPosition);
  }),

  addTextLayer: (text: string, parentId?: string, parentPosition?: number) => set((state: ComponentStore) => {
    const newLayer: Layer = {
      id: createId(),
      type: '_text_',
      text
    };

    return addLayerToState(state, newLayer, parentId, parentPosition);
  }),
  duplicateLayer: (layerId: string) => set((state: ComponentStore) => {
    const layerToDuplicate = findLayerRecursive(state.layers, layerId);
    if (layerToDuplicate) {
      const duplicateWithNewIds = (layer: Layer): Layer => {
        const newLayer = { ...layer, id: createId() };
        if (!isTextLayer(newLayer) && newLayer.children) {
          newLayer.children = newLayer.children.map(duplicateWithNewIds);
        }
        return newLayer;
      };

      const newLayer = duplicateWithNewIds(layerToDuplicate);
      const parentLayer = findParentLayerRecursive(state.layers, layerId);
      return addLayerToState(state, newLayer, parentLayer?.id);
    }
    return state;
  }),
  removeLayer: (layerId: string) => set((state: ComponentStore) => {


    const updatedLayers = removeLayerRecursive(state.layers, layerId);

    // Find the parent of the removed layer

    const parentLayer = findParentLayerRecursive(updatedLayers, layerId);

    // Select the parent layer or null if the removed layer was a top-level layer
    const updatedSelectedLayer = parentLayer && !isTextLayer(parentLayer) ? parentLayer :
      (updatedLayers.length > 0 && !isTextLayer(updatedLayers[0]) ? updatedLayers[0] : null);

    return {
      layers: updatedLayers,
      selectedLayer: updatedSelectedLayer
    };
  }),
  updateLayerProps: (layerId: string, newProps: Record<string, any>) => set((state: ComponentStore) => {
    const updateLayerRecursive = (layers: Layer[]): Layer[] => {
      return layers.map(layer => {
        if (layer.id === layerId) {
          if (isTextLayer(layer)) {
            // For text layers, update the text property
            return { ...layer, text: newProps.text || layer.text };
          } else {
            // For component layers, update the props
            return { ...layer, props: { ...layer.props, ...newProps } };
          }
        }
        if (!isTextLayer(layer) && layer.children) {
          return { ...layer, children: updateLayerRecursive(layer.children) };
        }
        return layer;
      });
    };

    const updatedLayers = updateLayerRecursive(state.layers);
    const updatedSelectedLayer = state.selectedLayer && state.selectedLayer.id === layerId && !isTextLayer(state.selectedLayer) ?
      updateLayerRecursive([state.selectedLayer])[0] as ComponentLayer :
      state.selectedLayer;

    return {
      layers: updatedLayers,
      selectedLayer: updatedSelectedLayer
    };
  }),
  selectLayer: (layerId: string) => set((state: ComponentStore) => {


    const layer = findLayerRecursive(state.layers, layerId);
    if (layer) {
      return {
        selectedLayer: layer,
      };
    }
    return {};
  }),
}));

function isTextLayer(layer: Layer): layer is Layer & { type: '_text_'; text: string } {
  return layer.type === '_text_';
}

const addLayerToState = (
  state: ComponentStore, 
  newLayer: Layer, 
  parentId?: string, 
  parentPosition?: number
): ComponentStore => {
  const addLayerRecursive = (layers: Layer[]): Layer[] => {
    return layers.map(layer => {
      if (layer.id === parentId && !isTextLayer(layer)) {
        const updatedChildren = layer.children ? [...layer.children] : [];

        if (parentPosition !== undefined) {
          // Insert the new layer at the specified position
          updatedChildren.splice(parentPosition, 0, newLayer);
        } else {
          // Append the new layer to the children
          updatedChildren.push(newLayer);
        }

        return { ...layer, children: updatedChildren };
      }

      if (!isTextLayer(layer) && layer.children) {
        return { 
          ...layer, 
          children: addLayerRecursive(layer.children) 
        };
      }

      return layer;
    });
  };

  let updatedLayers = [...state.layers];

  if (parentId) {
    updatedLayers = addLayerRecursive(state.layers);
  } else if (parentPosition !== undefined) {
    // Respect the parentPosition when adding to root layers
    updatedLayers.splice(parentPosition, 0, newLayer);
  } else {
    // Append to the root layers if no position is specified
    updatedLayers.push(newLayer);
  }

  // Update selectedLayer only if the new layer is not a text layer
  const updatedSelectedLayer = !isTextLayer(newLayer) 
    ? newLayer 
    : state.selectedLayer;

  return {
    ...state,
    layers: updatedLayers,
    selectedLayer: updatedSelectedLayer,
  };
};

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

const findLayerRecursive = (layers: Layer[], layerId: string): ComponentLayer | undefined => {
  for (const layer of layers) {
    if (layer.id === layerId && !isTextLayer(layer)) {
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

const removeLayerRecursive = (layers: Layer[], layerId: string): Layer[] => {
  return layers.filter(layer => {
    if (layer.id === layerId) {
      return false;
    }
    if (!isTextLayer(layer) && layer.children) {
      layer.children = removeLayerRecursive(layer.children, layerId);
    }
    return true;
  });
};

const createId = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

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
  const mockData = generateMock(requiredSchema, {seed: 1234});
  
  return mockData;
}

function patchSchema(schema: ZodObject<any>): ZodObject<any> {
  const schemaWithFixedEnums = transformUnionToEnum(schema);
  const schemaWithCoercedTypes = addCoerceToNumberAndDate(schemaWithFixedEnums);
  const schemaWithCommon = addCommon(schemaWithCoercedTypes);
  //log the patched schema in a readable way
  console.log({patchSchema: schemaWithCommon.shape});
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
      );

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




export { componentRegistry, isTextLayer };