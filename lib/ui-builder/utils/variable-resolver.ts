import React from 'react';
import type { Variable, PropValue, ComponentLayer, FunctionRegistry } from '@/components/ui/ui-builder/types';
import { isVariableReference } from '@/components/ui/ui-builder/types';

/**
 * Resolves a variable reference in layer children to its actual value
 * @param children - The children value which may be a VariableReference, string, or ComponentLayer[]
 * @param variables - Array of available variables
 * @param variableValues - Object mapping variable IDs to their resolved values
 * @returns The resolved children value (string for variable references, or original value)
 */
export function resolveChildrenVariableReference(
  children: ComponentLayer['children'],
  variables: Variable[],
  variableValues?: Record<string, PropValue>
): ComponentLayer['children'] {
  if (isVariableReference(children)) {
    const variable = variables.find(v => v.id === children.__variableRef);
    if (variable) {
      // Use provided value or fall back to default value
      const resolvedValue = variableValues?.[variable.id] ?? variable.defaultValue;
      // Ensure we return a string for text content
      return String(resolvedValue);
    }
    // Variable not found, return empty string
    return '';
  }
  // Return original value for string or ComponentLayer[]
  return children;
}

/**
 * Resolves variable references in props using provided variable values.
 * Also resolves __function_* metadata props by looking up functions from the registry.
 * 
 * @param props - The props object that may contain variable references or function metadata
 * @param variables - Array of available variables
 * @param variableValues - Object mapping variable IDs to their resolved values
 * @param functionRegistry - Optional function registry for resolving function-type variables
 * @returns Props with variable references resolved and functions looked up
 */
export function resolveVariableReferences(
  props: Record<string, PropValue>,
  variables: Variable[],
  variableValues?: Record<string, PropValue>,
  functionRegistry?: FunctionRegistry
): Record<string, PropValue> {
  const resolved: Record<string, PropValue> = {};

  // First pass: collect all __function_* metadata to resolve function props
  const functionMetadata: Record<string, string> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('__function_') && typeof value === 'string') {
      // Extract the prop name from __function_propName
      const propName = key.replace('__function_', '');
      functionMetadata[propName] = value;
    }
  }

  // Resolve function metadata props first (these may not have a corresponding base prop)
  for (const [propName, functionId] of Object.entries(functionMetadata)) {
    if (functionRegistry) {
      const funcDef = functionRegistry[functionId];
      if (funcDef) {
        resolved[propName] = funcDef.fn;
      } else {
        console.warn(`Function "${functionId}" not found in function registry for prop "${propName}"`);
        resolved[propName] = undefined;
      }
    }
  }

  for (const [key, value] of Object.entries(props)) {
    // Skip __function_* metadata props (they're handled separately)
    if (key.startsWith('__function_')) {
      continue;
    }
    
    // Skip props that were already resolved via __function_* metadata
    // Only skip if functionRegistry was provided, otherwise preserve the original value
    if (functionMetadata[key]) {
      if (!functionRegistry) {
        // Warn when function metadata exists but no registry is provided
        console.warn(
          `Function metadata "__function_${key}" found but no functionRegistry provided. ` +
          `Falling back to original prop value for "${key}".`
        );
      } else {
        continue;
      }
    }
    
    if (isVariableReference(value)) {
      const variable = variables.find(v => v.id === value.__variableRef);
      if (variable) {
        // Handle function-type variables specially
        if (variable.type === 'function') {
          // For function variables, look up the actual function from the registry
          const varFunctionId = String(variable.defaultValue);
          if (functionRegistry) {
            const funcDef = functionRegistry[varFunctionId];
            if (funcDef) {
              resolved[key] = funcDef.fn;
            } else {
              // Function not found in registry
              console.warn(`Function "${varFunctionId}" not found in function registry`);
              resolved[key] = undefined;
            }
          } else {
            // No function registry provided
            console.warn('Function-type variable found but no functionRegistry provided');
            resolved[key] = undefined;
          }
        } else {
          // Use provided value or fall back to default value
          resolved[key] = variableValues?.[variable.id] ?? variable.defaultValue;
        }
      } else {
        // Variable not found, use default value or undefined
        resolved[key] = undefined;
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !React.isValidElement(value)) {
      // Recursively resolve nested objects (but not React elements or arrays)
      resolved[key] = resolveVariableReferences(value as Record<string, PropValue>, variables, variableValues, functionRegistry);
    } else {
      // Regular value, keep as is
      resolved[key] = value;
    }
  }

  return resolved;
}

// Export the isVariableReference function for backward compatibility
export { isVariableReference };
