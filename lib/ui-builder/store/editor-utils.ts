import type { ComponentType as ReactComponentType } from "react";
import type { ComponentRegistry, ComponentLayer, RegistryEntry } from '@/components/ui/ui-builder/types';
import type { FieldConfigItem } from "@/components/ui/auto-form/types";

// Cache for field overrides to avoid regenerating them
const fieldOverrideCache = new Map<string, Record<string, FieldConfigItem>>();

// Helper to create a cache key for a layer
const createCacheKey = (layer: ComponentLayer): string => {
  // Include layer type, id, and a hash of props to detect changes
  const propsHash = JSON.stringify(layer.props);
  return `${layer.type}-${layer.id}-${propsHash}`;
};

export const generateFieldOverrides = (registry: ComponentRegistry, layer: ComponentLayer): Record<string, FieldConfigItem> => {
    const componentDefinition = registry[layer.type];
    if (!componentDefinition) {
        return {};
    }

    if (!componentDefinition.fieldOverrides) {
        return {};
    }

    // Create cache key for this layer
    const cacheKey = createCacheKey(layer);
    
    // Check if we have cached overrides for this exact layer state
    if (fieldOverrideCache.has(cacheKey)) {
        return fieldOverrideCache.get(cacheKey)!;
    }

    // Generate field overrides
    const fieldOverrides: Record<string, FieldConfigItem> = {};
    Object.keys(componentDefinition.fieldOverrides).forEach(key => {
        const override = componentDefinition.fieldOverrides?.[key];
        if (override) {
            fieldOverrides[key] = override(layer);
        }
    });

    // Cache the result
    fieldOverrideCache.set(cacheKey, fieldOverrides);
    
    // Clean up old cache entries to prevent memory leaks (keep last 100 entries)
    if (fieldOverrideCache.size > 100) {
        const firstKey = fieldOverrideCache.keys().next().value;
        if (firstKey) {
            fieldOverrideCache.delete(firstKey);
        }
    }

    return fieldOverrides;
}

//Checking of component type, checked via from property, if undefined or null then its a primitive like <div/>, <img/>, etc
export function isPrimitiveComponent(component: RegistryEntry<ReactComponentType<any>>): boolean {
    return component.from === undefined || component.from === null;
}

//Checking of component type, checked via from property, if defined and not null then its a complex component like <Button/>, <Badge/>, etc
export function isCustomComponent(component: RegistryEntry<ReactComponentType<any>>): boolean {
    return component.from !== undefined && component.from !== null;
}