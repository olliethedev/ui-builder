/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  componentRegistry,
  generateFieldOverrides,
  RegistryEntry,
  ComponentRegistry,
} from "@/lib/ui-builder/registry/component-registry";
import { ComponentLayer, PageLayer } from "@/lib/ui-builder/store/layer-store";
import { FieldConfigItem } from "@/components/ui/auto-form/types";

describe("generateFieldOverrides", () => {
  it("should return empty object if component is not in registry", () => {
    const layer: ComponentLayer = {
      id: "1",
      type: "UnknownComponent",
      props: {},
      children: [],
    };
    const overrides = generateFieldOverrides(layer);
    expect(overrides).toEqual({});
  });

  it("should return empty object if component has no fieldOverrides", () => {
    const mockComponent: RegistryEntry<React.ComponentType<any>> = {
      schema: {} as any, // Simplified for testing
    };

    componentRegistry["TestComponent"] = mockComponent;

    const layer: ComponentLayer = {
      id: "2",
      type: "TestComponent",
      props: {},
      children: [],
    };
    const overrides = generateFieldOverrides(layer);
    expect(overrides).toEqual({});
  });

  it("should return field overrides when component has fieldOverrides", () => {
    const mockFieldConfig: FieldConfigItem = { label: "Test Label" };
    const mockComponent: RegistryEntry<React.ComponentType<any>> = {
      schema: {} as any, // Simplified for testing
      fieldOverrides: {
        title: (layer: ComponentLayer) => mockFieldConfig,
      },
    };

    componentRegistry["OverriddenComponent"] = mockComponent;

    const layer: ComponentLayer = {
      id: "3",
      type: "OverriddenComponent",
      props: { title: "Original Title" },
      children: [],
    };
    const overrides = generateFieldOverrides(layer);
    expect(overrides).toEqual({ title: mockFieldConfig });
  });

  it("should handle multiple field overrides", () => {
    const mockFieldConfig1: FieldConfigItem = { label: "Title Label" };
    const mockFieldConfig2: FieldConfigItem = { label: "Description Label" };

    const mockComponent: RegistryEntry<React.ComponentType<any>> = {
      schema: {} as any, // Simplified for testing
      fieldOverrides: {
        title: (layer: ComponentLayer) => mockFieldConfig1,
        description: (layer: ComponentLayer) => mockFieldConfig2,
      },
    };

    componentRegistry["MultiOverrideComponent"] = mockComponent;

    const layer: ComponentLayer = {
      id: "4",
      type: "MultiOverrideComponent",
      props: { title: "Original Title", description: "Original Description" },
      children: [],
    };
    const overrides = generateFieldOverrides(layer);
    expect(overrides).toEqual({
      title: mockFieldConfig1,
      description: mockFieldConfig2,
    });
  });

  it("should ignore field overrides if they return undefined", () => {
    const mockFieldConfig: FieldConfigItem = { label: "Test Label" };
    const mockComponent: RegistryEntry<React.ComponentType<any>> = {
      schema: {} as any, // Simplified for testing
      fieldOverrides: {
        subtitle: (layer: ComponentLayer) => mockFieldConfig,
      },
    };

    componentRegistry["PartialOverrideComponent"] = mockComponent;

    const layer: ComponentLayer = {
      id: "5",
      type: "PartialOverrideComponent",
      props: { title: "Original Title", subtitle: "Original Subtitle" },
      children: [],
    };
    const overrides = generateFieldOverrides(layer);
    expect(overrides).toEqual({ subtitle: mockFieldConfig });
  });
});
