import { Config, PluginCreator } from "tailwindcss/types/config";

import {
  ComponentLayer,
  PropValue,
  Tailwind,
} from "@/components/ui/ui-builder/types";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { ComponentType } from "react";

/**
 * Recursively collects all complex component types from a ComponentLayer tree
 */
function collectComplexComponents(layer: ComponentLayer): Set<string> {
  const complexComponents = new Set<string>();
  const { type, children } = layer;

  // Check if this is a complex component
  if (complexComponentDefinitions[type]) {
    complexComponents.add(type);
  }

  // Recursively check children
  if (Array.isArray(children)) {
    children.forEach((child) => {
      const childComplex = collectComplexComponents(child);
      childComplex.forEach((comp) => complexComponents.add(comp));
    });
  }

  return complexComponents;
}

/**
 * Generates import statements for complex components
 */
const registryDependencies: Array<string | undefined> = [];

function generateImports(complexComponents: Set<string>): string {
  if (complexComponents.size === 0) {
    return "import React from 'react';";
  }

  // Group components by their import path
  const importsByPath = new Map<string, string[]>();

  // List of parent components that have children
  const PARENT_COMPONENTS = [
    "card",
    "accordion",
    "alertdialog",
    "dialog",
    "dropdownmenu",
    "menubar",
    "navigationmenu",
    "popover",
    "select",
    "sidebar",
    "skeleton",
    "tabs",
    "tooltip",
  ];

  complexComponents.forEach((componentType) => {
    const componentDef = complexComponentDefinitions[componentType];
    const componentName: string | undefined =
      componentDef?.component?.displayName;

    if (!componentName) return;

    const componentNameLower = componentName.toLowerCase();

    if (registryDependencies.includes(componentNameLower)) return;

    const isChildComponent = PARENT_COMPONENTS.some((parent) => {
      return (
        componentNameLower.startsWith(parent) && componentNameLower !== parent
      );
    });

    if (isChildComponent) {
      // For child components, find the parent
      const parentComponent = PARENT_COMPONENTS.find((parent) =>
        componentNameLower.startsWith(parent)
      );

      if (parentComponent) {
        const parentExists = registryDependencies.includes(parentComponent);

        if (!parentExists) {
          registryDependencies.push(parentComponent);
        }
      }
    } else {
      registryDependencies.push(componentNameLower);
    }
    if (componentDef?.from) {
      const importPath = componentDef.from;
      if (!importsByPath.has(importPath)) {
        importsByPath.set(importPath, []);
      }
      importsByPath.get(importPath)!.push(componentType);
    }
  });

  const importStatements = Array.from(importsByPath.entries())
    .map(([path, components]) => {
      const componentsList = components.sort().join(", ");
      return `import { ${componentsList} } from '${path}';`;
    })
    .sort();

  return `import React from 'react';\n${
    importStatements && importStatements.join("\n")
  }`;
}

/**
 * Converts a ComponentLayer to a React component string
 */
function componentLayerToReactString(layer: ComponentLayer, depth = 0): string {
  const indent = "  ".repeat(depth);
  const { type, props, children } = layer;

  // Handle props - filter out undefined/null values and format properly
  const validProps = Object.entries(props)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}="${value}"`;
      } else if (typeof value === "boolean") {
        return value ? key : `${key}={false}`;
      } else if (typeof value === "number") {
        return `${key}={${value}}`;
      } else if (typeof value === "object" && value !== null) {
        return `${key}={${JSON.stringify(value)}}`;
      }
      return `${key}={${JSON.stringify(value)}}`;
    })
    .join(" ");

  const propsString = validProps ? ` ${validProps}` : "";

  if (typeof children === "string") {
    return `${indent}<${type}${propsString}>${children}</${type}>`;
  } else if (Array.isArray(children) && children.length > 0) {
    const childrenString = children
      .map((child) => componentLayerToReactString(child, depth + 1))
      .join("\n");
    return `${indent}<${type}${propsString}>\n${childrenString}\n${indent}</${type}>`;
  } else {
    return `${indent}<${type}${propsString} />`;
  }
}

/**
 * Generates a complete React component file from a page layer
 */
function generateReactComponent(
  page: ComponentLayer,
  componentName: string
): string {
  const componentString = componentLayerToReactString(page);

  // Collect all complex components used in the page
  const complexComponents = collectComplexComponents(page);
  const imports = generateImports(complexComponents);

  return `${imports}

export function ${componentName}() {
  return (
    <div className="w-full">
${componentString}
    </div>
  );
}

export default ${componentName};
`;
}

/**
 * Generates a valid shadcn registry item from UI builder pages
 */
export function generateRegistryItem({
  name,
  tailwindConfig,
  pages,
}: {
  name: string;
  pages: ComponentLayer<Record<string, PropValue>>[];
  tailwindConfig: Tailwind | null;
}): {
  $schema: string;
  name: string;
  type: string;
  description: string;
  dependencies: string[];
  registryDependencies: Array<string | undefined>;
  devDependencies: string[];
  files: Array<{
    path: string;
    content: string;
    type: string;
  }>;
  tailwind?: Tailwind | null;
} {
  const dependencies = [
    "lucide-react",
    "tailwind-merge",
    "class-variance-authority",
    "clsx",
    "tailwind",
  ];
  const devDependencies = [
    "@tailwindcss/typography",
    "@testing-library/dom",
    "@testing-library/jest-dom",
    "@testing-library/react",
    "@testing-library/user-event",
    "@types/jest",
    "@types/lodash.template",
    "@types/object-hash",
    "@types/react",
    "@types/react-dom",
    "@types/react-syntax-highlighter",
    "autoprefixer",
    "eslint",
    "eslint-config-next",
    "eslint-plugin-local-rules",
    "eslint-plugin-react-hooks",
    "eslint-plugin-react-perf",
    "jest",
    "jest-environment-jsdom",
    "postcss",
    "react-docgen-typescript",
    "tailwindcss",
    "tailwindcss-animate",
    "ts-morph",
    "ts-to-zod",
    "typescript",
  ];

  // Generate React components
  const files = pages.map((page, index) => {
    const componentName = page.name || `${name}Page${index + 1}`;
    const fileName = `${componentName}.tsx`;
    const content = generateReactComponent(page, componentName);

    return {
      path: `components/${fileName}`,
      content,
      type: "registry:component",
      target: `components/${fileName}`,
    };
  });

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: name.toLowerCase().replace(/\s+/g, "-"),
    type: "registry:page",
    description: `A Next.js project generated from UI Builder: ${name}`,
    dependencies: dependencies,
    devDependencies: devDependencies,
    tailwind: tailwindConfig,
    registryDependencies: registryDependencies
      ? registryDependencies
      : ["card"],
    files,
  };
}
