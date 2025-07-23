"use client";

import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";

import { ComponentLayer } from "@/components/ui/ui-builder/types";
const COMPONENT_REGISTRY = {
    ...complexComponentDefinitions,
    ...primitiveComponentDefinitions,
}
export const DocRenderer = ({page, className}: {page: ComponentLayer, className?: string}) => {
  return <LayerRenderer className={className} page={page} componentRegistry={COMPONENT_REGISTRY} />;
};