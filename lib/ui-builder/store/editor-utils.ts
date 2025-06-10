/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentRegistry } from '@/components/ui/ui-builder/types';
import { ComponentLayer, RegistryEntry } from '@/components/ui/ui-builder/types';
import { FieldConfigItem } from "@/components/ui/auto-form/types";
import { ComponentType as ReactComponentType } from "react";

export const generateFieldOverrides = (registry: ComponentRegistry, layer: ComponentLayer): Record<string, FieldConfigItem> => {
    const componentDefinition = registry[layer.type];
    if (!componentDefinition) {
        return {};
    }

    if (componentDefinition.fieldOverrides) {
        const fieldOverrides: Record<string, FieldConfigItem> = {};
        Object.keys(componentDefinition.fieldOverrides).forEach(key => {
            const override = componentDefinition.fieldOverrides?.[key];
            if (override) {
                fieldOverrides[key] = override(layer);
            }
        });
        return fieldOverrides;
    }
    return {};

}

//Checking of component type, checked via from property, if undefined or null then its a primitive like <div/>, <img/>, etc
export function isPrimitiveComponent(component: RegistryEntry<ReactComponentType<any>>): boolean {
    return component.from === undefined || component.from === null;
}

//Checking of component type, checked via from property, if defined and not null then its a complex component like <Button/>, <Badge/>, etc
export function isCustomComponent(component: RegistryEntry<ReactComponentType<any>>): boolean {
    return component.from !== undefined && component.from !== null;
}