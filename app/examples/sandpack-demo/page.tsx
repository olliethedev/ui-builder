"use client";

import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { ComponentLayer } from "@/components/ui/ui-builder/types";

const initialLayers: ComponentLayer[] = [
  {
    id: "root",
    type: "div",
    name: "Root Container",
    props: {
      className: "min-h-screen bg-gray-50 p-8",
    },
    children: [
      {
        id: "header",
        type: "div",
        name: "Header",
        props: {
          className: "max-w-4xl mx-auto mb-8",
        },
        children: [
          {
            id: "title",
            type: "h1",
            name: "Page Title",
            props: {
              className: "text-3xl font-bold text-gray-900",
            },
            children: "Welcome to Sandpack Component Creator",
          },
          {
            id: "subtitle",
            type: "p",
            name: "Subtitle",
            props: {
              className: "text-lg text-gray-600 mt-2",
            },
            children: "Create custom React components using the live code editor",
          },
        ],
      },
      {
        id: "content",
        type: "div",
        name: "Content Area",
        props: {
          className: "max-w-4xl mx-auto",
        },
        children: [
          {
            id: "instructions",
            type: "Card",
            name: "Instructions Card",
            props: {
              className: "mb-6",
            },
            children: [
              {
                id: "card-header",
                type: "CardHeader",
                name: "Card Header",
                props: {},
                children: [
                  {
                    id: "card-title",
                    type: "CardTitle",
                    name: "Card Title",
                    props: {},
                    children: "How to Use",
                  },
                ],
              },
              {
                id: "card-content",
                type: "CardContent",
                name: "Card Content",
                props: {},
                children: [
                  {
                    id: "instructions-list",
                    type: "div",
                    name: "Instructions",
                    props: {
                      className: "space-y-2",
                    },
                    children: [
                      {
                        id: "step1",
                        type: "p",
                        name: "Step 1",
                        props: {
                          className: "text-sm",
                        },
                        children: "1. Click on the 'Components' tab in the left panel",
                      },
                      {
                        id: "step2",
                        type: "p",
                        name: "Step 2",
                        props: {
                          className: "text-sm",
                        },
                        children: "2. Use the Sandpack editor to write your React component",
                      },
                      {
                        id: "step3",
                        type: "p",
                        name: "Step 3",
                        props: {
                          className: "text-sm",
                        },
                        children: "3. Define the Zod schema for your component's props",
                      },
                      {
                        id: "step4",
                        type: "p",
                        name: "Step 4",
                        props: {
                          className: "text-sm",
                        },
                        children: "4. Click 'Create Component' to add it to the registry",
                      },
                      {
                        id: "step5",
                        type: "p",
                        name: "Step 5",
                        props: {
                          className: "text-sm",
                        },
                        children: "5. Use your new component by adding it from the 'Layers' tab",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: "demo-area",
            type: "div",
            name: "Demo Area",
            props: {
              className: "bg-white rounded-lg border p-6",
            },
            children: [
              {
                id: "demo-text",
                type: "p",
                name: "Demo Text",
                props: {
                  className: "text-gray-600 text-center",
                },
                children: "This area will show your custom components once created",
              },
            ],
          },
        ],
      },
    ],
  },
];

export default function SandpackDemoPage() {
  return (
    <div className="h-screen">
      <UIBuilder
        initialLayers={initialLayers}
        componentRegistry={{
          ...complexComponentDefinitions,
          ...primitiveComponentDefinitions,
        }}
        persistLayerStore={false}
        allowVariableEditing={true}
        allowPagesCreation={false}
        allowPagesDeletion={false}
      />
    </div>
  );
}