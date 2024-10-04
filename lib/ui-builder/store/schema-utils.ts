import { z, ZodTypeAny, ZodUnion, ZodLiteral, ZodOptional, ZodNullable, ZodEnum, ZodObject, ZodRawShape, ZodNumber, ZodDate, ZodArray, ZodString, ZodTuple, ZodRecord, set } from 'zod';
import { generateMock } from '@anatine/zod-mock';

export function getDefaultProps(schema: ZodObject<any>) {
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

export function patchSchema(schema: ZodObject<any>): ZodObject<any> {
    const schemaWithFixedEnums = transformUnionToEnum(schema);
    const schemaWithCoercedTypes = addCoerceToNumberAndDate(schemaWithFixedEnums);
    const schemaWithCommon = addCommon(schemaWithCoercedTypes);

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

// patch for autoform to respect existing values
export function addDefaultValues<T extends ZodObject<any>>(
  schema: T,
  defaultValues: Partial<z.infer<T>>
): T {
  const shape = schema.shape;

  const updatedShape = { ...shape };

  for (const key in defaultValues) {
    if (updatedShape[key]) {
      // Apply the default value to the existing schema field
      updatedShape[key] = updatedShape[key].default(defaultValues[key]);
    } else {
      console.warn(
        `Key "${key}" does not exist in the schema and will be ignored.`
      );
    }
  }

  return z.object(updatedShape) as T;
}