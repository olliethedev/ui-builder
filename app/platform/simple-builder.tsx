"use client";

import React from "react";
import { z } from "zod";
import UIBuilder from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { blockDefinitions } from "@/lib/ui-builder/registry/block-definitions";
import { shadcnComponentDefinitions } from "@/lib/ui-builder/registry/shadcn-component-definitions";
import type { FunctionRegistry } from "@/components/ui/ui-builder/types";

/**
 * Example function registry for the simple builder demo.
 * These functions can be bound to component event handlers via the Data panel.
 */
const functionRegistry: FunctionRegistry = {
  showAlert: {
    name: "Show Alert",
    schema: z.tuple([]),
    fn: () => {
      alert("Button clicked!");
    },
    description: "Shows a browser alert dialog",
  },
  logToConsole: {
    name: "Log to Console",
    schema: z.tuple([]),
    fn: () => {
      console.log("[Demo] Button clicked at", new Date().toISOString());
    },
    description: "Logs a message to the browser console",
  },
  handleClick: {
    name: "Handle Click Event",
    schema: z.tuple([z.custom<React.MouseEvent>()]),
    fn: (e: React.MouseEvent) => {
      console.log("[Demo] Click event:", { x: e.clientX, y: e.clientY });
    },
    description: "Handles click events with coordinates",
  },
};

const initialLayers = [
  {
    id: "1",
    type: "div",
    name: "Page",
    props: {
      className: "bg-gray-200 flex flex-col justify-center items-center gap-4 p-2 w-full h-screen",
    },
    children: [
      {
        id: "2",
        type: "div",
        name: "Box A",
        props: {
          className: "flex flex-row justify-center items-center bg-red-300 p-2 w-full md:w-1/2 h-1/3 text-center",
        },
        children: [
          {
            id: "3",
            type: "span",
            name: "Text",
            props: {
              className: "text-4xl font-bold text-secondary",
            },
            children: "A",
          }
        ],
      },
      {
        id: "4",
        type: "div",
        name: "Box B",
        props: {
          className: "flex flex-row justify-center items-center bg-green-300 p-2 w-full md:w-1/2 h-1/3 text-center",
        },
        children: [
          {
            id: "5",
            type: "span",
            name: "Text",
            props: {
              className: "text-4xl font-bold text-secondary",
            },
            children: "B",
          }
        ],
      },
      {
        id: "6",
        type: "div",
        name: "Box C",
        props: {
          className: "flex flex-row justify-center items-center bg-blue-300 p-2 w-full md:w-1/2 h-1/3 p-2 w-1/2 h-1/3 text-center",
        },
        children: [
          {
            id: "8",
            type: "div",
            name: "Inner Box D",
            props: {
              className: "bg-yellow-300 p-2 w-1/2 p-2 w-1/2 h-auto text-center",
            },
            children: [
              {
                id: "7",
                type: "span",
                name: "Text",
                props: {
                  className: "text-4xl font-bold text-secondary-foreground",
                },
                children: "C",
              }
            ],
          },
          
        ],
      },
    ],
  },
];

export const SimpleBuilder = () => {
  return (
    <UIBuilder
      initialLayers={initialLayers}
      persistLayerStore={false}
      componentRegistry={{
        ...complexComponentDefinitions,
        ...primitiveComponentDefinitions,
        ...shadcnComponentDefinitions,
      }}
      blocks={blockDefinitions}
      functionRegistry={functionRegistry}
    />
  );
}
