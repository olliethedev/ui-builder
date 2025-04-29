"use client";


import UIBuilder from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { ThemePanel } from "@/components/ui/ui-builder/internal/theme-panel";

export function SimpleBuilder() {
  return <UIBuilder
  componentRegistry={{
    ...complexComponentDefinitions,
    ...primitiveComponentDefinitions,
  }}
  pagePropsForm={<ThemePanel />}
/>;
}