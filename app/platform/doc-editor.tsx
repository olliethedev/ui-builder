"use client";

import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import type { ComponentLayer } from "@/components/ui/ui-builder/types";



export const DocEditor = ({page}: {page: ComponentLayer}) => {
  return (
    <UIBuilder
      initialLayers={[page]}
      persistLayerStore={false}
      componentRegistry={{
        ...complexComponentDefinitions,
        ...primitiveComponentDefinitions,
      }}
    />
  );
}
