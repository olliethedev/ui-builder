/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import template from "lodash.template";
import { hasLayerChildren } from "@/lib/ui-builder/store/layer-utils";
import { ComponentRegistry, ComponentLayer, Variable } from '@/components/ui/ui-builder/types';
import { isVariableReference } from '@/lib/ui-builder/utils/variable-resolver';

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

export const pageLayerToCode = (page: ComponentLayer, componentRegistry: ComponentRegistry, variables: Variable[] = []) => {
  const layers = page.children;
  const { mode, colorTheme, borderRadius, ...restOfProps } = page.props;
  
  // Generate unique identifiers for all variables
  const variableIdentifiers = generateVariableIdentifiers(variables);
  
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

  // Generate variable props interface
  const variablePropsInterface = generateVariablePropsInterface(variables, variableIdentifiers);
  const variablePropsParam = variables.length > 0 ? "{ variables }: PageProps" : "";

  const compiled = template(reactComponentTemplate);
  const finalCode = compiled({
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

  const propsArray = Object.entries(props)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      let propValue;
      if (isVariableReference(value)) {
        // Find the variable by ID
        const variable = variables.find(v => v.id === value.__variableRef);
        if (variable && variableIdentifiers) {
          propValue = `{variables.${variableIdentifiers.get(variable.id)}}`;
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

  return propsArray.length > 0 ? ` ${ propsArray.join(" ") }` : "";
};

const generateVariablePropsInterface = (variables: Variable[], variableIdentifiers?: Map<string, string>): string => {
  if (variables.length === 0) return "";
  
  // Generate identifiers if not provided
  if (!variableIdentifiers) {
    variableIdentifiers = generateVariableIdentifiers(variables);
  }
  
  const variableTypes = variables.map(variable => {
    let tsType = 'any';
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

  return `interface PageProps {
  variables: {
${variableTypes}
  };
}

`;
};

const reactComponentTemplate =
  `import React from "react";
<%= imports %>

<%= variablePropsInterface %>const Page = (<%= variablePropsParam %>) => {
  return (
    <div<%= pageProps %>>
<%= children %>
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
