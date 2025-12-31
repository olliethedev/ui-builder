"use client";

import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";

/**
 * Smoke test page with an empty builder (no initial layers).
 * Used for testing component creation flows.
 */
const initialLayers = [
  {
    id: "smoke-page-1",
    type: "div",
    name: "Page",
    props: {
      className: "bg-background flex flex-col gap-4 p-4 w-full min-h-screen",
    },
    children: [],
  },
];

export default function SmokeNewPage() {
  return (
    <main data-testid="smoke-new-page" className="flex flex-col h-dvh">
      <UIBuilder
        initialLayers={initialLayers}
        persistLayerStore={false}
        componentRegistry={{
          ...complexComponentDefinitions,
          ...primitiveComponentDefinitions,
        }}
      />
    </main>
  );
}

