/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentLayer } from '../types';
import template from "lodash.template";
import { hasLayerChildren } from "@/lib/ui-builder/store/layer-utils";
import { ComponentRegistry } from '../types';

export const pageLayerToCode = (page: ComponentLayer, componentRegistry: ComponentRegistry) => {
  const layers = page.children;
  const { mode, colorTheme, borderRadius, ...restOfProps } = page.props;
  const pageProps = generatePropsString(restOfProps);
  const imports = new Set<string>();

  const collectImports = (layer: ComponentLayer) => {
    if (hasLayerChildren(layer) ) {
      const componentDefinition = componentRegistry[layer.type];
      if (layer.type && componentDefinition && componentDefinition.from) {
        imports.add(
          `import { ${ layer.type } } from "${ componentDefinition.from }";`
        );
      }
      if (layer.children) {
        layer.children.forEach(collectImports);
      }
    }
  };

  let code = "";

  if (Array.isArray(layers)) {
    layers.forEach(collectImports);
    code = layers.map((layer) => generateLayerCode(layer, 1)).join("\n");
  } else {
    code = `{"${ layers }"}`;
  }

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

export const generateLayerCode = (layer: ComponentLayer, indent = 0): string => {

  const indentation = "  ".repeat(indent);

  let childrenCode = "";
  if (hasLayerChildren(layer) && layer.children.length > 0) {
    childrenCode = layer.children
      .map((child) => generateLayerCode(child, indent + 1))
      .join("\n");
  }
  //else if children is a string, then we need render children as a text node
  else if (typeof layer.children === "string") {
    childrenCode = `{${JSON.stringify(layer.children)}}`;
  }

  if (childrenCode) {
    return `${ indentation }<${ layer.type }${ generatePropsString(
      layer.props
    ) }>\n${ childrenCode }\n${ indentation }</${ layer.type }>`;
  } else {
    return `${ indentation }<${ layer.type }${ generatePropsString(layer.props) } />`;
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