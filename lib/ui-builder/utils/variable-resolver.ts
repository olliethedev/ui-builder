import { Variable, VariableReference, ComponentProps, PropValue, isVariableReference } from '@/components/ui/ui-builder/types';
import React from 'react';

/**
 * Resolves variable references in props using provided variable values
 * @param props - The props object that may contain variable references
 * @param variables - Array of available variables
 * @param variableValues - Object mapping variable IDs to their resolved values
 * @returns Props with variable references resolved
 */
export function resolveVariableReferences<T extends ComponentProps>(
  props: T,
  variables: Variable[],
  variableValues?: Record<string, PropValue>
): T {
  const resolved = {} as T;

  for (const [key, value] of Object.entries(props)) {
    if (isVariableReference(value)) {
      const variable = variables.find(v => v.id === value.__variableRef);
      if (variable) {
        // Use provided value or fall back to default value
        (resolved as any)[key] = variableValues?.[variable.id] ?? variable.defaultValue;
      } else {
        // Variable not found, use undefined
        (resolved as any)[key] = undefined;
      }
    } else if (
      typeof value === 'object' && 
      value !== null && 
      !Array.isArray(value) && 
      !React.isValidElement(value) &&
      Object.prototype.toString.call(value) === '[object Object]'
    ) {
      // Recursively resolve nested plain objects only
      (resolved as any)[key] = resolveVariableReferences(value as ComponentProps, variables, variableValues);
    } else {
      // Regular value, keep as is (including React elements, arrays, etc.)
      (resolved as any)[key] = value;
    }
  }

  return resolved;
}
