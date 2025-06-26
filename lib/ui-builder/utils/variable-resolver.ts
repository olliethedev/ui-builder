import React from 'react';
import { Variable, PropValue, isVariableReference } from '@/components/ui/ui-builder/types';

/**
 * Resolves variable references in props using provided variable values
 * @param props - The props object that may contain variable references
 * @param variables - Array of available variables
 * @param variableValues - Object mapping variable IDs to their resolved values
 * @returns Props with variable references resolved
 */
export function resolveVariableReferences(
  props: Record<string, PropValue>,
  variables: Variable[],
  variableValues?: Record<string, PropValue>
): Record<string, PropValue> {
  const resolved: Record<string, PropValue> = {};

  for (const [key, value] of Object.entries(props)) {
    if (isVariableReference(value)) {
      const variable = variables.find(v => v.id === value.__variableRef);
      if (variable) {
        // Use provided value or fall back to default value
        resolved[key] = variableValues?.[variable.id] ?? variable.defaultValue;
      } else {
        // Variable not found, use default value or undefined
        resolved[key] = undefined;
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !React.isValidElement(value)) {
      // Recursively resolve nested objects (but not React elements or arrays)
      resolved[key] = resolveVariableReferences(value as Record<string, PropValue>, variables, variableValues);
    } else {
      // Regular value, keep as is
      resolved[key] = value;
    }
  }

  return resolved;
}

// Export the isVariableReference function for backward compatibility
export { isVariableReference };
