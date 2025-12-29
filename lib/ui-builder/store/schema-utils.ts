/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

/**
 * Helper to get the Zod v4 def type from a schema.
 */
function getDefType(schema: z.ZodType): string {
    return (schema as any)._zod?.def?.type || "";
}

/**
 * Helper to get the def object from a Zod v4 schema.
 */
function getDef(schema: z.ZodType): any {
    return (schema as any)._zod?.def;
}

/**
 * Generates default props based on the provided Zod schema.
 * Supports boolean, date, number, string, enum, objects composed of these primitives, and arrays of these primitives.
 * Logs a warning for unsupported types.
 *
 * @param schema - The Zod schema object.
 * @returns An object containing default values for the schema.
 */
export function getDefaultProps(schema: z.ZodObject<any>): Record<string, any> {
    const shape = schema.shape;
    const defaultProps: Record<string, any> = {};

    for (const key in shape) {
        if (Object.prototype.hasOwnProperty.call(shape, key)) {
            const fieldSchema = shape[key];
            const value = getDefaultValue(fieldSchema, key);
            if(value !== undefined){
                defaultProps[key] = value;
            }
        }
    }

    return defaultProps;
}

/**
 * Determines the default value for a given Zod schema.
 * Handles nullable and coerced fields appropriately.
 *
 * @param schema - The Zod schema for the field.
 * @param fieldName - The name of the field (used for logging).
 * @returns The default value for the field.
 */
function getDefaultValue(schema: z.ZodType, fieldName: string): any {
    const defType = getDefType(schema);
    const def = getDef(schema);
    
    // Handle ZodDefault to return the specified default value
    if (defType === "default" && def) {
        // In Zod v4, defaultValue can be the value directly or a function
        const defaultValue = def.defaultValue;
        if (typeof defaultValue === "function") {
            return defaultValue();
        }
        return defaultValue;
    }

    if (!schema.isOptional()){
        console.warn(`No default value set for required field "${fieldName}".`);
    }
    return undefined;
}

/**
 * Patches the given Zod object schema by transforming unions of literals to enums,
 * coercing number and date types, and adding an optional `className` property.
 *
 * @param schema - The original Zod object schema to be patched.
 * @returns A new Zod object schema with the specified transformations applied.
 */

export function patchSchema(schema: z.ZodObject<any>): z.ZodObject<any> {
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
function addCommon<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>
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
function transformUnionToEnum<T extends z.ZodType>(schema: T): T {
    const defType = getDefType(schema);
    const def = getDef(schema);
    
    // Handle ZodUnion of string literals
    if (defType === "union" && def?.options) {
        const options = def.options;

        // Check if all options are ZodLiteral instances with string values
        const allStringLiterals = options.every((option: any) => {
            const optDef = getDef(option);
            return optDef?.type === "literal" && typeof optDef?.value === 'string';
        });
        
        if (allStringLiterals) {
            const enumValues = options.map((option: any) => {
                const optDef = getDef(option);
                return optDef.value;
            }).reverse();

            // Ensure there is at least one value to create an enum
            if (enumValues.length === 0) {
                throw new Error("Cannot create enum with no values.");
            }

            // Create a ZodEnum from the string literals
            const enumSchema = z.enum(enumValues as [string, ...string[]]);

            // Determine if the original schema was nullable or optional
            let transformedSchema: z.ZodType = enumSchema;

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

    // Recursively handle nullable schemas
    if (defType === "nullable" && def?.innerType) {
        const inner = def.innerType;
        const transformedInner = transformUnionToEnum(inner);
        return transformedInner.nullable() as any;
    }

    // Recursively handle optional schemas
    if (defType === "optional" && def?.innerType) {
        const inner = def.innerType;
        const transformedInner = transformUnionToEnum(inner);
        return transformedInner.optional() as any;
    }

    // Recursively handle ZodObjects by transforming their shape
    if (defType === "object") {
        const shape = (schema as unknown as z.ZodObject<any>).shape;
        const transformedShape: Record<string, z.ZodType> = {};

        for (const [key, value] of Object.entries(shape)) {
            transformedShape[key] = transformUnionToEnum(value as z.ZodType);
        }

        return z.object(transformedShape) as unknown as T;
    }

    // Handle ZodArrays by transforming their element type
    if (defType === "array" && def?.element) {
        const transformedElement = transformUnionToEnum(def.element);
        return z.array(transformedElement) as unknown as T;
    }

    // Handle ZodTuples by transforming each element type
    if (defType === "tuple" && def?.items) {
        const transformedItems = def.items.map((item: any) => transformUnionToEnum(item));
        return z.tuple(transformedItems as [z.ZodType, ...z.ZodType[]]) as unknown as T;
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
function addCoerceToNumberAndDate<T extends z.ZodType>(schema: T): T {
    const defType = getDefType(schema);
    const def = getDef(schema);
    
    // Handle nullable schemas
    if (defType === "nullable" && def?.innerType) {
        const inner = def.innerType;
        return addCoerceToNumberAndDate(inner).nullable() as any;
    }

    // Handle optional schemas
    if (defType === "optional" && def?.innerType) {
        const inner = def.innerType;
        return addCoerceToNumberAndDate(inner).optional() as any;
    }

    // Handle objects by recursively applying the transformation to each property
    if (defType === "object") {
        const shape = (schema as unknown as z.ZodObject<any>).shape;
        const transformedShape: Record<string, z.ZodType> = {};

        for (const [key, value] of Object.entries(shape)) {
            transformedShape[key] = addCoerceToNumberAndDate(value as z.ZodType);
        }

        return z.object(transformedShape) as any;
    }

    // Handle arrays by applying the transformation to the array's element type
    if (defType === "array" && def?.element) {
        const innerType = def.element;
        return z.array(addCoerceToNumberAndDate(innerType)) as any;
    }

    // Apply coercion to number fields (handles number, int, float in Zod v4)
    if (["number", "int", "float"].includes(defType)) {
        return z.coerce.number().optional() as any;
    }

    // Apply coercion to date fields
    if (defType === "date") {
        return z.coerce.date().optional() as any;
    }

    // Handle unions by applying the transformation to each option
    if (defType === "union" && def?.options) {
        const transformedOptions = def.options.map((option: any) => addCoerceToNumberAndDate(option));
        return z.union(transformedOptions as [z.ZodType, z.ZodType, ...z.ZodType[]]) as any;
    }

    // Handle enums by returning them as-is
    if (defType === "enum") {
        return schema;
    }

    // If none of the above, return the schema unchanged
    return schema;
}

// patch for autoform to respect existing values, specifically for enums
export function addDefaultValues<T extends z.ZodObject<any>>(
  schema: T,
  defaultValues: Partial<z.infer<T>>
): T {
  const shape = schema.shape;

  const updatedShape = { ...shape };

  for (const key in defaultValues) {
    if (updatedShape[key]) {
      // Apply the default value to the existing schema field
      updatedShape[key] = updatedShape[key].default(defaultValues[key]);
    } else if (process.env.NODE_ENV !== "production") {
      console.warn(
        `Key "${key}" does not exist in the schema and will be ignored.`
      );
    }
  }

  return z.object(updatedShape) as T;
}

/**
 * Checks if a Zod schema has a children field of type ANY
 */
export function hasAnyChildrenField(schema: z.ZodObject<any>): boolean {
    const shape = schema.shape;
    if (!shape.children) {
        return false;
    }
    
    // Unwrap optional and nullable wrappers to get the inner type
    let childrenSchema = shape.children;
    let childDefType = getDefType(childrenSchema);
    
    while (childDefType === "optional" || childDefType === "nullable") {
        const childDef = getDef(childrenSchema);
        if (childDef?.innerType) {
            childrenSchema = childDef.innerType;
            childDefType = getDefType(childrenSchema);
        } else {
            break;
        }
    }
    
    return childDefType === "any";
}

/**
* Checks if a Zod schema has a children field of type String
*/
export function hasChildrenFieldOfTypeString(schema: z.ZodObject<any>): boolean {
    const shape = schema.shape;
    if (!shape.children) {
        return false;
    }
    
    // Unwrap optional and nullable wrappers to get the inner type
    let childrenSchema = shape.children;
    let childDefType = getDefType(childrenSchema);
    
    while (childDefType === "optional" || childDefType === "nullable") {
        const childDef = getDef(childrenSchema);
        if (childDef?.innerType) {
            childrenSchema = childDef.innerType;
            childDefType = getDefType(childrenSchema);
        } else {
            break;
        }
    }
    
    return childDefType === "string";
}
