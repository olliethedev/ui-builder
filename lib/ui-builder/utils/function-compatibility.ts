import type { z } from 'zod';
import type { FunctionRegistry, Variable } from '@/components/ui/ui-builder/types';

/**
 * Checks if the given Zod schema represents a function type.
 * This is used to detect when a component prop expects a function (e.g., onClick).
 */
export function isZodFunctionSchema(schema: z.ZodTypeAny): boolean {
  const def = (schema as any)?._zod?.def;
  if (!def) return false;
  
  // Check for function type
  if (def.type === 'function') {
    return true;
  }
  
  // Check wrapped types (optional, nullable, default)
  if (def.type === 'optional' || def.type === 'nullable' || def.type === 'default') {
    const innerSchema = def.innerType ?? def.schema;
    if (innerSchema) {
      return isZodFunctionSchema(innerSchema);
    }
  }
  
  return false;
}

/**
 * Extracts the function arguments schema from a Zod function schema.
 * Returns undefined if the schema is not a function schema or has no args defined.
 */
export function extractFunctionArgsSchema(schema: z.ZodTypeAny): z.ZodTuple<any, any> | z.ZodObject<any> | undefined {
  const def = (schema as any)?._zod?.def;
  if (!def) return undefined;
  
  if (def.type === 'function' && def.args) {
    return def.args;
  }
  
  // Handle wrapped types
  if (def.type === 'optional' || def.type === 'nullable' || def.type === 'default') {
    const innerSchema = def.innerType ?? def.schema;
    if (innerSchema) {
      return extractFunctionArgsSchema(innerSchema);
    }
  }
  
  return undefined;
}

/**
 * Checks if two function signatures are compatible.
 * 
 * Compatibility rules:
 * 1. Positional args: (a, b, c, d) => void can accept (a) => void (extra args are ignored by the function)
 * 2. Object params: ({a, b, c}) => void can accept ({a}) => void (subset of object properties)
 * 
 * @param targetSchema - The schema expected by the component prop (what the component will call with)
 * @param candidateSchema - The schema of the function being tested (what it actually accepts)
 * @returns true if the candidate function can be safely called with the target arguments
 */
export function areFunctionSignaturesCompatible(
  targetSchema: z.ZodTuple<any, any> | z.ZodObject<any> | z.ZodTypeAny | undefined,
  candidateSchema: z.ZodTuple<any, any> | z.ZodObject<any> | z.ZodTypeAny | undefined
): boolean {
  // If no schemas provided, assume compatible (permissive)
  if (!targetSchema || !candidateSchema) {
    return true;
  }
  
  const targetDef = (targetSchema as any)?._zod?.def;
  const candidateDef = (candidateSchema as any)?._zod?.def;
  
  if (!targetDef || !candidateDef) {
    return true; // If we can't introspect, assume compatible
  }
  
  // Handle tuple (positional args) comparison
  if (targetDef.type === 'tuple' && candidateDef.type === 'tuple') {
    const targetItems = targetDef.items || [];
    const candidateItems = candidateDef.items || [];
    
    // Candidate can have fewer arguments than target (extra args ignored)
    // But candidate cannot require more arguments than target provides
    return candidateItems.length <= targetItems.length;
  }
  
  // Handle object (named params) comparison
  if (targetDef.type === 'object' && candidateDef.type === 'object') {
    const targetShape = targetDef.shape || {};
    const candidateShape = candidateDef.shape || {};
    
    // All required properties in candidate must exist in target
    for (const key of Object.keys(candidateShape)) {
      if (!(key in targetShape)) {
        return false;
      }
    }
    return true;
  }
  
  // Mixed comparison - be permissive
  return true;
}

/**
 * Returns a list of function IDs from the registry that are compatible with the target schema.
 * 
 * @param functionRegistry - The available functions
 * @param targetSchema - The function schema expected by the component prop
 * @returns Array of function IDs that are compatible
 */
export function getCompatibleFunctions(
  functionRegistry: FunctionRegistry | undefined,
  targetSchema: z.ZodTypeAny | undefined
): string[] {
  if (!functionRegistry) {
    return [];
  }
  
  const targetArgsSchema = targetSchema ? extractFunctionArgsSchema(targetSchema) : undefined;
  
  return Object.entries(functionRegistry)
    .filter(([, definition]) => {
      return areFunctionSignaturesCompatible(targetArgsSchema, definition.schema);
    })
    .map(([id]) => id);
}

/**
 * Returns function-type variables from the provided variables array.
 * 
 * @param variables - Array of all variables
 * @returns Array of variables with type 'function'
 */
export function getFunctionTypeVariables(variables: Variable[]): Variable[] {
  return variables.filter(v => v.type === 'function');
}

/**
 * Gets compatible function-type variables for a given target schema.
 * This combines variable filtering with function compatibility checking.
 * 
 * @param variables - All variables
 * @param functionRegistry - The function registry
 * @param targetSchema - The function schema expected by the component prop
 * @returns Array of function-type variables whose referenced functions are compatible
 */
export function getCompatibleFunctionVariables(
  variables: Variable[],
  functionRegistry: FunctionRegistry | undefined,
  targetSchema: z.ZodTypeAny | undefined
): Variable[] {
  if (!functionRegistry) {
    return [];
  }
  
  const functionVariables = getFunctionTypeVariables(variables);
  const compatibleFunctionIds = getCompatibleFunctions(functionRegistry, targetSchema);
  
  return functionVariables.filter(v => {
    // v.defaultValue is the functionRegistry key for function-type variables
    const functionId = v.defaultValue as string;
    return compatibleFunctionIds.includes(functionId);
  });
}
