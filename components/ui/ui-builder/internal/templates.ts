/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageLayer, Layer, isPageLayer, isTextLayer, componentRegistry } from "@/lib/ui-builder/store/layer-store";
import template from "lodash.template";
import { hasChildren } from "@/lib/ui-builder/store/layer-utils";

export const pageLayerToCode = (page: PageLayer) => {
  const layers = page.children;
  const { mode, colorTheme, borderRadius, ...restOfProps } = page.props;
  const pageProps = generatePropsString(restOfProps);
  const imports = new Set<string>();

  const collectImports = (layer: Layer) => {
    if (isTextLayer(layer)) {
      if (layer.textType === "markdown") {
        imports.add(
          `import { Markdown } from "@/components/ui/ui-builder/markdown";`
        );
      }
    } else if (hasChildren(layer) && !isPageLayer(layer)) {
      const componentDefinition = componentRegistry[layer.type];
      if (layer.type && componentDefinition) {
        imports.add(
          `import { ${ layer.type } } from "${ componentDefinition.from }";`
        );
      }
      if (layer.children) {
        layer.children.forEach(collectImports);
      }
    }
  };

  layers.forEach(collectImports);

  const code = layers.map((layer) => generateLayerCode(layer, 1)).join("\n");
  const importsString = Array.from(imports).join("\n");

  const compiled = template(reactComponentTemplate);
  const finalCode = compiled({
    imports: importsString,
    pageProps,
    children: code
      .split("\n")
      .map((line) => `    ${ line }`)
      .join("\n"),
  });

  return finalCode;

};

export const generateLayerCode = (layer: Layer, indent = 0): string => {
  if (isTextLayer(layer)) {
    if (layer.textType === "markdown") {
      const indentation = "  ".repeat(indent);
      // Wrap markdown with Markdown component
      return `${ indentation }<Markdown${ generatePropsString(
        layer.props
      ) }>{${ JSON.stringify(layer.text) }}</Markdown>`;
    }
    const indentation = "  ".repeat(indent);
    return `${ indentation }<span${ generatePropsString(
      layer.props
    ) }>{${ JSON.stringify(layer.text) }}</span>`;
  }

  const { type, children } = layer;

  const indentation = "  ".repeat(indent);

  let childrenCode = "";
  if (children && children.length > 0) {
    childrenCode = children
      .map((child) => generateLayerCode(child, indent + 1))
      .join("\n");
  }

  if (childrenCode) {
    return `${ indentation }<${ type }${ generatePropsString(
      layer.props
    ) }>\n${ childrenCode }\n${ indentation }</${ type }>`;
  } else {
    return `${ indentation }<${ type }${ generatePropsString(layer.props) } />`;
  }
};

export const generatePropsString = (props: Record<string, any>): string => {
  const propsArray = Object.entries(props)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      let propValue;
      if (typeof value === "string") {
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

const reactComponentTemplate =
  `import React from "react";
<%= imports %>

const Page = () => {
  return (
    <div<%= pageProps %>>
<%= children %>
    </div>
  );
};

export default Page;
`;