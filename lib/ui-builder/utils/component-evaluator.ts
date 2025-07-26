import React from 'react';
import { z } from 'zod';

/**
 * Safely evaluates a component's schema code
 * @param schemaCode - The Zod schema code as a string
 * @returns The evaluated Zod schema or null if invalid
 */
export function evaluateSchema(schemaCode: string): z.ZodSchema<any> | null {
  try {
    // Create a safe evaluation context with only the necessary imports
    const evalContext = {
      z,
      React,
    };
    
    // Create a function that evaluates the schema in a controlled environment
    const schemaFunction = new Function('z', 'React', `return ${schemaCode}`);
    const schema = schemaFunction(evalContext.z, evalContext.React);
    
    // Validate that it's actually a Zod schema
    if (schema && typeof schema.parse === 'function') {
      return schema;
    }
    
    return null;
  } catch (error) {
    console.error('Schema evaluation error:', error);
    return null;
  }
}

/**
 * Creates a placeholder component for user-created components
 * In a production environment, you would want to implement proper
 * code sandboxing and compilation
 * @param componentName - Name of the component
 * @param componentCode - The React component code
 * @returns A React component
 */
export function createPlaceholderComponent(
  componentName: string, 
  componentCode: string
): React.ComponentType<any> {
  return React.memo((props: any) => {
    return React.createElement('div', {
      ...props,
      'data-custom-component': componentName,
      className: `${props.className || ''} custom-component p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50`,
      style: {
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...props.style,
      }
    }, [
      React.createElement('div', {
        key: 'placeholder-content',
        className: 'text-center text-gray-500'
      }, [
        React.createElement('div', {
          key: 'name',
          className: 'font-medium'
        }, componentName),
        React.createElement('div', {
          key: 'desc',
          className: 'text-sm'
        }, 'Custom Component'),
        props.children && React.createElement('div', {
          key: 'children',
          className: 'mt-2'
        }, props.children)
      ])
    ]);
  });
}

/**
 * Default field overrides for custom components
 */
export function getDefaultFieldOverrides() {
  return {
    className: (layer: any) => ({
      type: "text",
      label: "Class Name",
      placeholder: "Enter CSS classes...",
    }),
    children: (layer: any) => ({
      type: "children",
      label: "Children",
    }),
  };
}

/**
 * Validates component name
 * @param name - Component name to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateComponentName(name: string): { isValid: boolean; error?: string } {
  if (!name.trim()) {
    return { isValid: false, error: "Component name is required" };
  }
  
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return { isValid: false, error: "Component name must start with a capital letter and contain only letters and numbers" };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: "Component name must be at least 2 characters long" };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: "Component name must be less than 50 characters long" };
  }
  
  return { isValid: true };
}

/**
 * Basic validation for React component code
 * @param code - The component code to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateComponentCode(code: string): { isValid: boolean; error?: string } {
  if (!code.trim()) {
    return { isValid: false, error: "Component code is required" };
  }
  
  // Basic checks for React component structure
  const hasReactImport = /import\s+React/.test(code);
  const hasExportDefault = /export\s+default/.test(code);
  const hasFunction = /function\s+\w+|const\s+\w+\s*=|=>\s*{/.test(code);
  
  if (!hasReactImport) {
    return { isValid: false, error: "Component must import React" };
  }
  
  if (!hasExportDefault) {
    return { isValid: false, error: "Component must have a default export" };
  }
  
  if (!hasFunction) {
    return { isValid: false, error: "Component must define a function or component" };
  }
  
  return { isValid: true };
}