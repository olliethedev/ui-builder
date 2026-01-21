/* eslint-disable @typescript-eslint/no-unused-vars */
 
// Simple template renderer using native string replacement
// Replaces variables in the format <%~ it.variableName %>
const renderTemplate = (template: string, data: Record<string, any>): string => {
  return template.replace(/<%~\s*it\.(\w+)\s*%>/g, (_, key) => {
    return data[key] ?? '';
  });
};
import { hasLayerChildren } from "@/lib/ui-builder/store/layer-utils";
import type { ComponentRegistry, ComponentLayer, Variable, FunctionRegistry } from '@/components/ui/ui-builder/types';
import { isVariableReference } from '@/lib/ui-builder/utils/variable-resolver';

// Type for accessing Zod internal structure (works with both v3 and v4)
interface ZodInternalDef {
  type?: string;
  typeName?: string;
  items?: unknown[];
  rest?: { items?: unknown[] };
  innerType?: unknown;
  wrapped?: unknown;
}

interface ZodSchemaInternal {
  _zod?: { def?: ZodInternalDef };
  _def?: ZodInternalDef;
}

/**
 * Converts a Zod schema to a TypeScript type string for code generation.
 * Inspects the schema structure to generate appropriate type signatures.
 */
const zodSchemaToTypeString = (schema: unknown): string => {
  const zodSchema = schema as ZodSchemaInternal;
  
  // Check for Zod v4 _zod structure
  const def = zodSchema?._zod?.def ?? zodSchema?._def;
  if (!def) {
    return '(...args: unknown[]) => unknown';
  }
  
  const typeName = def.type ?? def.typeName;
  
  // Handle tuple schemas (most common for function args)
  if (typeName === 'tuple' || typeName === 'ZodTuple') {
    const items = def.items ?? def.rest?.items ?? [];
    
    if (!items || items.length === 0) {
      // No arguments: () => void
      return '() => void';
    }
    
    // Generate parameter types
    const paramTypes = items.map((item: unknown, index: number) => {
      const { type: paramType, isOptional } = zodSchemaToParamType(item);
      const optionalMark = isOptional ? '?' : '';
      return `arg${index}${optionalMark}: ${paramType}`;
    }).join(', ');
    
    return `(${paramTypes}) => void`;
  }
  
  // Handle object schemas
  if (typeName === 'object' || typeName === 'ZodObject') {
    return '(params: Record<string, unknown>) => void';
  }
  
  // Handle function schemas directly
  if (typeName === 'function' || typeName === 'ZodFunction') {
    return '(...args: unknown[]) => unknown';
  }
  
  // Default fallback
  return '(...args: unknown[]) => unknown';
};

/**
 * Converts a Zod schema to a parameter type, indicating if it's optional.
 * Used for function parameter generation where optional params use `?` syntax.
 */
const zodSchemaToParamType = (schema: unknown): { type: string; isOptional: boolean } => {
  const zodSchema = schema as ZodSchemaInternal;
  
  const def = zodSchema?._zod?.def ?? zodSchema?._def;
  if (!def) {
    return { type: 'unknown', isOptional: false };
  }
  
  const typeName = def.type ?? def.typeName;
  
  // Check if it's an optional type
  if (typeName === 'optional' || typeName === 'ZodOptional') {
    const innerType = def.innerType ?? def.wrapped;
    return { type: zodSchemaToSingleType(innerType), isOptional: true };
  }
  
  return { type: zodSchemaToSingleType(schema), isOptional: false };
};

/**
 * Converts a single Zod schema to a TypeScript type string.
 */
const zodSchemaToSingleType = (schema: unknown): string => {
  const zodSchema = schema as ZodSchemaInternal;
  
  const def = zodSchema?._zod?.def ?? zodSchema?._def;
  if (!def) {
    return 'unknown';
  }
  
  const typeName = def.type ?? def.typeName;
  
  switch (typeName) {
    case 'string':
    case 'ZodString':
      return 'string';
    case 'number':
    case 'ZodNumber':
      return 'number';
    case 'boolean':
    case 'ZodBoolean':
      return 'boolean';
    case 'void':
    case 'ZodVoid':
      return 'void';
    case 'undefined':
    case 'ZodUndefined':
      return 'undefined';
    case 'null':
    case 'ZodNull':
      return 'null';
    case 'any':
    case 'ZodAny':
      return 'unknown';
    case 'unknown':
    case 'ZodUnknown':
      return 'unknown';
    case 'custom':
    case 'ZodType':
      // Custom types - we can't extract the generic parameter at runtime
      // Check if it looks like an event type based on common patterns
      return 'unknown';
    case 'object':
    case 'ZodObject':
      return 'Record<string, unknown>';
    case 'array':
    case 'ZodArray':
      return 'unknown[]';
    case 'optional':
    case 'ZodOptional': {
      const innerOptional = def.innerType ?? def.wrapped;
      return `${zodSchemaToSingleType(innerOptional)} | undefined`;
    }
    case 'nullable':
    case 'ZodNullable': {
      const innerNullable = def.innerType ?? def.wrapped;
      return `${zodSchemaToSingleType(innerNullable)} | null`;
    }
    default:
      return 'unknown';
  }
};

// Helper function to convert display name to valid JavaScript identifier
const toValidIdentifier = (input: string): string => {
  // Remove leading/trailing whitespace
  let identifier = input.trim();
  
  // If it's already a valid identifier, return as-is
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(identifier)) {
    return identifier;
  }
  
  // Replace spaces and special characters with camelCase
  identifier = identifier
    .replace(/[^a-zA-Z0-9_$]/g, ' ') // Replace special chars with spaces
    .split(' ')
    .filter(word => word.length > 0)
    .map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toLowerCase() + word.slice(1);
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
  
  // Ensure it starts with a letter, underscore, or dollar sign
  if (identifier && !/^[a-zA-Z_$]/.test(identifier)) {
    identifier = '_' + identifier;
  }
  
  // If empty or still invalid, provide a default
  if (!identifier || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(identifier)) {
    identifier = 'variable';
  }
  
  return identifier;
};

// Helper function to generate unique identifiers for variables
const generateVariableIdentifiers = (variables: Variable[]): Map<string, string> => {
  const identifierMap = new Map<string, string>();
  const usedIdentifiers = new Set<string>();
  
  variables.forEach(variable => {
    const baseIdentifier = toValidIdentifier(variable.name);
    let identifier = baseIdentifier;
    let counter = 1;
    
    // Ensure uniqueness
    while (usedIdentifiers.has(identifier)) {
      identifier = `${baseIdentifier}${counter}`;
      counter++;
    }
    
    usedIdentifiers.add(identifier);
    identifierMap.set(variable.id, identifier);
  });
  
  return identifierMap;
};

// Helper function to collect all __function_* metadata function IDs from layers
const collectFunctionMetadataIds = (layer: ComponentLayer): Set<string> => {
  const functionIds = new Set<string>();
  
  // Collect from current layer's props
  for (const [key, value] of Object.entries(layer.props)) {
    if (key.startsWith('__function_') && typeof value === 'string') {
      functionIds.add(value);
    }
  }
  
  // Recursively collect from children
  if (hasLayerChildren(layer)) {
    layer.children.forEach(child => {
      const childIds = collectFunctionMetadataIds(child);
      childIds.forEach(id => functionIds.add(id));
    });
  }
  
  return functionIds;
};

export const pageLayerToCode = (
  page: ComponentLayer, 
  componentRegistry: ComponentRegistry, 
  variables: Variable[] = [],
  functionRegistry?: FunctionRegistry
) => {
  const layers = page.children;
  const { mode, colorTheme, borderRadius, ...restOfProps } = page.props;
  
  // Generate unique identifiers for all variables
  const variableIdentifiers = generateVariableIdentifiers(variables);
  
  // Collect all function IDs from __function_* metadata across all layers
  const functionMetadataIds = new Set<string>();
  if (Array.isArray(layers)) {
    layers.forEach(layer => {
      const layerFuncIds = collectFunctionMetadataIds(layer);
      layerFuncIds.forEach(id => functionMetadataIds.add(id));
    });
  }
  
  const pageProps = generatePropsString(restOfProps, variables, variableIdentifiers);
  const imports = new Set<string>();

  const collectImports = (layer: ComponentLayer) => {

    const componentDefinition = componentRegistry[layer.type];
    if (componentDefinition && componentDefinition.from) {
      imports.add(
        createFromString(componentDefinition.from, layer.type, componentDefinition.isFromDefaultExport)
        );
      if (hasLayerChildren(layer)) {
        layer.children.forEach(collectImports);
      }
    }
  };

  let code = "";

  if (Array.isArray(layers)) {
    layers.forEach(collectImports);
    code = layers.map((layer) => generateLayerCode(layer, 1, variables, variableIdentifiers)).join("\n");
  } else {
    code = `{"${ layers }"}`;
  }

  const importsString = Array.from(imports).join("\n");

  // Generate variable props interface (including function metadata IDs with types from registry)
  const variablePropsInterface = generateVariablePropsInterface(
    variables, 
    variableIdentifiers, 
    functionMetadataIds,
    functionRegistry
  );
  
  // Determine which props to destructure based on variable types and function metadata
  const hasRegularVariables = variables.some(v => v.type !== 'function');
  const hasFunctionVariables = variables.some(v => v.type === 'function');
  const hasFunctionMetadata = functionMetadataIds.size > 0;
  const hasFunctions = hasFunctionVariables || hasFunctionMetadata;
  
  let variablePropsParam = "";
  if (hasRegularVariables && hasFunctions) {
    variablePropsParam = "{ variables, functions }: PageProps";
  } else if (hasRegularVariables) {
    variablePropsParam = "{ variables }: PageProps";
  } else if (hasFunctions) {
    variablePropsParam = "{ functions }: PageProps";
  }

  const finalCode = renderTemplate(reactComponentTemplate, {
    imports: importsString,
    variablePropsInterface,
    variablePropsParam,
    pageProps,
    children: code
      .split("\n")
      .map((line) => `    ${ line }`)
      .join("\n"),
  });

  return finalCode;

};

export const generateLayerCode = (layer: ComponentLayer, indent = 0, variables: Variable[] = [], variableIdentifiers?: Map<string, string>): string => {
  // Generate identifiers if not provided
  if (!variableIdentifiers && variables.length > 0) {
    variableIdentifiers = generateVariableIdentifiers(variables);
  }

  const indentation = "  ".repeat(indent);

  let childrenCode = "";
  if (hasLayerChildren(layer) && layer.children.length > 0) {
    childrenCode = layer.children
      .map((child) => generateLayerCode(child, indent + 1, variables, variableIdentifiers))
      .join("\n");
  }
  //else if children is a string, then we need render children as a text node
  else if (typeof layer.children === "string") {
    childrenCode = `${ indentation }${"  "}{${JSON.stringify(layer.children)}}`;
  }

  if (childrenCode) {
    return `${ indentation }<${ layer.type }${ generatePropsString(
      layer.props,
      variables,
      variableIdentifiers
    ) }>\n${ childrenCode }\n${ indentation }</${ layer.type }>`;
  } else {
    return `${ indentation }<${ layer.type }${ generatePropsString(layer.props, variables, variableIdentifiers) } />`;
  }
};

export const generatePropsString = (props: Record<string, any>, variables: Variable[] = [], variableIdentifiers?: Map<string, string>): string => {
  // Generate identifiers if not provided
  if (!variableIdentifiers && variables.length > 0) {
    variableIdentifiers = generateVariableIdentifiers(variables);
  }

  // First pass: collect __function_* metadata to resolve function props
  const functionMetadata = new Map<string, string>();
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('__function_') && typeof value === 'string') {
      // Extract the prop name from __function_propName (e.g., __function_onClick -> onClick)
      const propName = key.replace('__function_', '');
      functionMetadata.set(propName, value); // value is the function ID
    }
  }

  const propsArray = Object.entries(props)
    // Filter out __function_* metadata props
    .filter(([key, _]) => !key.startsWith('__function_'))
    // Filter out props that will be handled by __function_* metadata
    .filter(([key, _]) => !functionMetadata.has(key))
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      let propValue;
      if (isVariableReference(value)) {
        // Find the variable by ID
        const variable = variables.find(v => v.id === value.__variableRef);
        if (variable && variableIdentifiers) {
          // Function-type variables go in `functions`, other types in `variables`
          if (variable.type === 'function') {
            propValue = `{functions.${variableIdentifiers.get(variable.id)}}`;
          } else {
            propValue = `{variables.${variableIdentifiers.get(variable.id)}}`;
          }
        } else {
          // Fallback if variable not found
          propValue = `{undefined}`;
        }
      } else if (typeof value === "string") {
        propValue = `"${ value }"`;
      } else if (typeof value === "number") {
        propValue = `{${ value }}`;
      } else {
        propValue = `{${ JSON.stringify(value) }}`;
      }
      return `${ key }=${ propValue }`;
    });

  // Add function props from __function_* metadata
  functionMetadata.forEach((funcId, propName) => {
    propsArray.push(`${propName}={functions.${funcId}}`);
  });

  return propsArray.length > 0 ? ` ${ propsArray.join(" ") }` : "";
};

const generateVariablePropsInterface = (
  variables: Variable[], 
  variableIdentifiers?: Map<string, string>,
  functionMetadataIds?: Set<string>,
  functionRegistry?: FunctionRegistry
): string => {
  const hasFunctionMetadata = functionMetadataIds && functionMetadataIds.size > 0;
  
  if (variables.length === 0 && !hasFunctionMetadata) return "";
  
  // Generate identifiers if not provided
  if (!variableIdentifiers) {
    variableIdentifiers = generateVariableIdentifiers(variables);
  }
  
  // Separate regular variables from function variables
  const regularVariables = variables.filter(v => v.type !== 'function');
  const functionVariables = variables.filter(v => v.type === 'function');
  
  // Generate regular variable types
  const variableTypes = regularVariables.map(variable => {
    let tsType = 'unknown';
    switch (variable.type) {
      case 'string':
        tsType = 'string';
        break;
      case 'number':
        tsType = 'number';
        break;
      case 'boolean':
        tsType = 'boolean';
        break;
    }
    return `    ${variableIdentifiers!.get(variable.id)}: ${tsType};`;
  }).join('\n');
  
  // Generate function types from function-type variables
  // For function variables, we try to look up the function in the registry by defaultValue (which is the function ID)
  const functionVariableTypes = functionVariables.map(variable => {
    const funcId = variable.defaultValue;
    // defaultValue for function variables should be a string (function ID), but check to be safe
    const funcDef = typeof funcId === 'string' ? functionRegistry?.[funcId] : undefined;
    
    // Use explicit typeSignature if provided, otherwise infer from schema
    if (funcDef?.typeSignature) {
      return `    ${variableIdentifiers!.get(variable.id)}: ${funcDef.typeSignature};`;
    }
    
    if (funcDef?.schema) {
      const typeString = zodSchemaToTypeString(funcDef.schema);
      return `    ${variableIdentifiers!.get(variable.id)}: ${typeString};`;
    }
    
    // Fallback to generic function type
    return `    ${variableIdentifiers!.get(variable.id)}: (...args: unknown[]) => unknown;`;
  });
  
  // Generate function types from __function_* metadata (function registry references)
  const functionMetadataTypes = hasFunctionMetadata
    ? Array.from(functionMetadataIds).map(funcId => {
        const funcDef = functionRegistry?.[funcId];
        
        // Use explicit typeSignature if provided, otherwise infer from schema
        if (funcDef?.typeSignature) {
          return `    ${funcId}: ${funcDef.typeSignature};`;
        }
        
        if (funcDef?.schema) {
          const typeString = zodSchemaToTypeString(funcDef.schema);
          return `    ${funcId}: ${typeString};`;
        }
        
        // Fallback to generic function type
        return `    ${funcId}: (...args: unknown[]) => unknown;`;
      })
    : [];
  
  // Combine all function types (deduplicate in case of overlap)
  const allFunctionTypes = [...functionVariableTypes, ...functionMetadataTypes].join('\n');

  // Build the interface
  const hasVariables = regularVariables.length > 0;
  const hasFunctions = functionVariables.length > 0 || hasFunctionMetadata;
  
  if (!hasVariables && !hasFunctions) return "";
  
  let interfaceContent = 'interface PageProps {\n';
  
  if (hasVariables) {
    interfaceContent += `  variables: {\n${variableTypes}\n  };\n`;
  }
  
  if (hasFunctions) {
    interfaceContent += `  functions: {\n${allFunctionTypes}\n  };\n`;
  }
  
  interfaceContent += '}\n\n';
  
  return interfaceContent;
};

const reactComponentTemplate =
  `import React from "react";
<%~ it.imports %>

<%~ it.variablePropsInterface %>const Page = (<%~ it.variablePropsParam %>) => {
  return (
    <div<%~ it.pageProps %>>
<%~ it.children %>
    </div>
  );
};

export default Page;
`;

const createFromString = (from: string, layerType: string, isFromDefaultExport?: boolean) => {
  if (isFromDefaultExport) {
    return `import ${ layerType } from "${ from }";`;
  }
  return `import { ${ layerType } } from "${ from }";`;
};
