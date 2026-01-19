"use client";

import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { shadcnComponentDefinitions } from "@/lib/ui-builder/registry/shadcn-component-definitions";
import { blockDefinitions } from "@/lib/ui-builder/registry/block-definitions";
import type { Variable } from "@/components/ui/ui-builder/types";

/**
 * Smoke test page with pre-populated layers and variables.
 * Used for testing selection, editing, undo/redo, and export flows.
 */
const initialLayers = [
  {
    id: "smoke-populated-page",
    type: "div",
    name: "Page",
    props: {
      className: "bg-background flex flex-col gap-4 p-4 w-full min-h-screen",
    },
    children: [
      {
        id: "smoke-header",
        type: "div",
        name: "Header",
        props: {
          className: "flex items-center justify-between p-4 bg-primary/10 rounded-lg",
        },
        children: [
          {
            id: "smoke-title",
            type: "h1",
            name: "Title",
            props: {
              className: "text-2xl font-bold text-foreground",
            },
            children: "Smoke Test Page",
          },
        ],
      },
      {
        id: "smoke-content",
        type: "div",
        name: "Content",
        props: {
          className: "flex flex-col gap-4 p-4",
        },
        children: [
          {
            id: "smoke-button",
            type: "Button",
            name: "Test Button",
            props: {
              variant: "default",
              size: "default",
            },
            children: "Click Me",
          },
          {
            id: "smoke-card",
            type: "div",
            name: "Card",
            props: {
              className: "p-4 border rounded-lg bg-card",
            },
            children: [
              {
                id: "smoke-card-text",
                type: "p",
                name: "Card Text",
                props: {
                  className: "text-muted-foreground",
                },
                children: "This is a test card with some content.",
              },
            ],
          },
        ],
      },
    ],
  },
];

const initialVariables: Variable[] = [
  {
    id: "var-username",
    name: "Username",
    type: "string",
    defaultValue: "TestUser",
  },
  {
    id: "var-count",
    name: "Item Count",
    type: "number",
    defaultValue: 42,
  },
  {
    id: "var-enabled",
    name: "Feature Enabled",
    type: "boolean",
    defaultValue: true,
  },
];

export default function SmokePopulatedPage() {
  return (
    <main data-testid="smoke-populated-page" className="flex flex-col h-dvh">
      <UIBuilder
        initialLayers={initialLayers}
        initialVariables={initialVariables}
        persistLayerStore={false}
        componentRegistry={{
          ...complexComponentDefinitions,
          ...primitiveComponentDefinitions,
          ...shadcnComponentDefinitions,
        }}
        blocks={blockDefinitions}
      />
    </main>
  );
}

