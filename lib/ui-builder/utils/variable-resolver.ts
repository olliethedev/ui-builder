import { Variable, VariableReference, ComponentProps, PropValue, isVariableReference } from '@/components/ui/ui-builder/types';

/**
 * Resolves variable references in props using provided variable values
 * @param props - The props object that may contain variable references
 * @param variables - Array of available variables
 * @param variableValues - Object mapping variable IDs to their resolved values
 * @returns Props with variable references resolved
 */
export function resolveVariableReferences(
  props: ComponentProps,
  variables: Variable[],
  variableValues?: Record<string, PropValue>
): ComponentProps {
  const resolved: ComponentProps = {};

  for (const [key, value] of Object.entries(props)) {
    if (isVariableReference(value)) {
      const variable = variables.find(v => v.id === value.__variableRef);
      if (variable) {
        // Use provided value or fall back to default value
        resolved[key] = variableValues?.[variable.id] ?? variable.defaultValue;
      } else {
        // Variable not found, use undefined
        resolved[key] = undefined;
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively resolve nested objects
      resolved[key] = resolveVariableReferences(value as ComponentProps, variables, variableValues);
    } else {
      // Regular value, keep as is
      resolved[key] = value;
    }
  }

  return resolved;
}
