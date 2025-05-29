import { Variable } from '@/components/ui/ui-builder/types';

/**
 * Checks if a value is a variable reference
 */
export function isVariableReference(value: any): value is { __variableRef: string } {
  return typeof value === 'object' && value !== null && '__variableRef' in value;
}

/**
 * Resolves variable references in props using provided variable values
 * @param props - The props object that may contain variable references
 * @param variables - Array of available variables
 * @param variableValues - Object mapping variable IDs to their resolved values
 * @returns Props with variable references resolved
 */
export function resolveVariableReferences(
  props: Record<string, any>,
  variables: Variable[],
  variableValues?: Record<string, any>
): Record<string, any> {
  const resolved: Record<string, any> = {};

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
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively resolve nested objects
      resolved[key] = resolveVariableReferences(value, variables, variableValues);
    } else {
      // Regular value, keep as is
      resolved[key] = value;
    }
  }

  return resolved;
}
