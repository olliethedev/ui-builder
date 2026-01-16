"use client";

import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { blockDefinitions } from "@/lib/ui-builder/registry/block-definitions";
import { shadcnComponentDefinitions } from "@/lib/ui-builder/registry/shadcn-component-definitions";

/**
 * Smoke test page with blocks enabled.
 * Used for testing blocks tab functionality.
 */
const initialLayers = [
  {
    id: "smoke-blocks-page",
    type: "div",
    name: "Page",
    props: {
      className: "bg-background flex flex-col gap-4 p-4 w-full min-h-screen",
    },
    children: [],
  },
];

export default function SmokeBlocksPage() {
  return (
    <main data-testid="smoke-blocks-page" className="flex flex-col h-dvh">
      <UIBuilder
        initialLayers={initialLayers}
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
