"use client";

import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { ComponentLayer } from "@/components/ui/ui-builder/types";
import { ComponentRegistry } from "@/components/ui/ui-builder/types";
import { Variable } from '@/components/ui/ui-builder/types';
import SimpleComponent from "app/platform/simple-component";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import z from "zod";


const myComponentRegistry: ComponentRegistry = {
  SimpleComponent: {
    component: SimpleComponent,
    schema: z.object({
        someString: z.string(),
        someNumber: z.number(),
        someBoolean: z.boolean()
    }),
    from: "app/platform/simple-component"
  },
  ...primitiveComponentDefinitions
}; 

const page: ComponentLayer = {
    id: "example-page",
    type: "div",
    props: {
        className: "flex flex-col items-center justify-center gap-4 p-4 bg-gray-100"
    },
    children: [
        {
            id: "simple-component",
            type: "SimpleComponent",
            props: {
                someString: "Hello",
                someNumber: 123,
                someBoolean: true
            },
            children: []
        }
    ]
} 

// Define variables for the page
const variables: Variable[] = [
  {
    id: "someString",
    name: "String Variable",
    type: "string",
    defaultValue: "Hello"
  },
  {
    id: "someNumber",
    name: "Number Variable", 
    type: "number",
    defaultValue: 123
  },
  {
    id: "someBoolean",
    name: "Boolean Variable",
    type: "boolean",
    defaultValue: true
  }
];

const variableValues = {
  someString: "Hello",
  someNumber: 123,
  someBoolean: true
};

export function RendererWithVars() {
  return (
    <LayerRenderer 
      page={page} 
      componentRegistry={myComponentRegistry}
      variables={variables}
      variableValues={variableValues}
    />
  );
}