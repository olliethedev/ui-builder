"use client";

import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";

export const SimpleBuilder = () => {
  return (
    <UIBuilder
      persistLayerStore={true}
      componentRegistry={{
        ...complexComponentDefinitions,
        ...primitiveComponentDefinitions,
      }}
    />
  );
}
