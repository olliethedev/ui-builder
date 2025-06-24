/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useMemo } from "react";
import { z } from "zod";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import {
  ComponentRegistry,
  ComponentLayer,
} from "@/components/ui/ui-builder/types";
import { Button } from "@/components/ui/button";
import AutoForm from "@/components/ui/auto-form";
import { generateFieldOverrides } from "@/lib/ui-builder/store/editor-utils";
import { addDefaultValues } from "@/lib/ui-builder/store/schema-utils";
import { getBaseType } from "@/components/ui/auto-form/utils";
import { isVariableReference } from "@/lib/ui-builder/utils/variable-resolver";
import { resolveVariableReferences } from "@/lib/ui-builder/utils/variable-resolver";

interface PropsPanelProps {
  className?: string;
}

const PropsPanel: React.FC<PropsPanelProps> = React.memo(({ className }) => {
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const removeLayer = useLayerStore((state) => state.removeLayer);
  const duplicateLayer = useLayerStore((state) => state.duplicateLayer);
  const updateLayer = useLayerStore((state) => state.updateLayer);
  const addComponentLayer = useLayerStore((state) => state.addComponentLayer);
  const componentRegistry = useEditorStore((state) => state.registry);
  const selectedLayer = findLayerById(selectedLayerId);

  const handleAddComponentLayer = useCallback(
    (layerType: string, parentLayerId: string, addPosition?: number) => {
      addComponentLayer(layerType, parentLayerId, addPosition);
    },
    [addComponentLayer]
  );

  const handleDeleteLayer = useCallback(
    (layerId: string) => {
      removeLayer(layerId);
    },
    [removeLayer]
  );

  const handleDuplicateLayer = useCallback(() => {
    if (selectedLayer) {
      duplicateLayer(selectedLayer.id);
    }
  }, [selectedLayer, duplicateLayer]);

  const handleUpdateLayer = useCallback(
    (
      id: string,
      props: Record<string, any>,
      rest?: Partial<Omit<ComponentLayer, "props">>
    ) => {
      updateLayer(id, props, rest);
    },
    [updateLayer]
  );

  //first check if selectedLayer.type is a valid key in componentRegistry
  if (
    selectedLayer &&
    !componentRegistry[selectedLayer.type as keyof typeof componentRegistry]
  ) {
    return null;
  }

  return (
    <div className={className}>
      {selectedLayer && (
        <>
          <Title />
          <h3 className="text-base font-medium mb-4">
            Type: {selectedLayer.type.replaceAll("_", "")}
          </h3>
        </>
      )}

      {!selectedLayer && (
        <>
          <h2 className="text-xl font-semibold mb-2">Component Properties</h2>
          <p>No component selected</p>
        </>
      )}
      {selectedLayer && (
        <ComponentPropsAutoForm
          key={selectedLayer.id}
          componentRegistry={componentRegistry}
          selectedLayerId={selectedLayer.id}
          removeLayer={handleDeleteLayer}
          duplicateLayer={handleDuplicateLayer}
          updateLayer={handleUpdateLayer}
          addComponentLayer={handleAddComponentLayer}
        />
      )}
    </div>
  );
});
PropsPanel.displayName = "PropsPanel";
export default PropsPanel;

interface ComponentPropsAutoFormProps {
  selectedLayerId: string;
  componentRegistry: ComponentRegistry;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  updateLayer: (
    id: string,
    props: Record<string, any>,
    rest?: Partial<Omit<ComponentLayer, "props">>
  ) => void;
  addComponentLayer: (
    layerType: string,
    parentLayerId: string,
    addPosition?: number
  ) => void;
}

const EMPTY_ZOD_SCHEMA = z.object({});
const EMPTY_FORM_VALUES = {};

const ComponentPropsAutoForm: React.FC<ComponentPropsAutoFormProps> = ({
  selectedLayerId,
  componentRegistry,
  removeLayer,
  duplicateLayer,
  updateLayer,
  addComponentLayer,
}) => {
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const revisionCounter = useEditorStore((state) => state.revisionCounter);
  const selectedLayer = findLayerById(selectedLayerId) as
    | ComponentLayer
    | undefined;
  const isPage = useLayerStore((state) => state.isLayerAPage(selectedLayerId));
  const allowPagesCreation = useEditorStore(
    (state) => state.allowPagesCreation
  );
  const allowPagesDeletion = useEditorStore(
    (state) => state.allowPagesDeletion
  );

  // Retrieve the appropriate schema from componentRegistry
  const { schema } = useMemo(() => {
    if (
      selectedLayer &&
      componentRegistry[selectedLayer.type as keyof typeof componentRegistry]
    ) {
      return componentRegistry[
        selectedLayer.type as keyof typeof componentRegistry
      ];
    }
    return { schema: EMPTY_ZOD_SCHEMA }; // Fallback schema
  }, [selectedLayer, componentRegistry]);

  const handleDeleteLayer = useCallback(() => {
    removeLayer(selectedLayerId);
  }, [removeLayer, selectedLayerId]);

  const handleDuplicateLayer = useCallback(() => {
    duplicateLayer(selectedLayerId);
  }, [duplicateLayer, selectedLayerId]);

  const onParsedValuesChange = useCallback(
    (
      parsedValues: z.infer<typeof schema> & {
        children?: string | { layerType: string; addPosition: number };
      }
    ) => {
      const { children, ...dataProps } = parsedValues;

      // Preserve variable references by merging with original props
      const preservedProps: Record<string, any> = {};
      if (selectedLayer) {
        // Start with all original props to preserve any that aren't in the form update
        Object.assign(preservedProps, selectedLayer.props);

        // Then update only the props that came from the form, preserving variable references
        Object.keys(dataProps as Record<string, any>).forEach((key) => {
          const originalValue = selectedLayer.props[key];
          const newValue = (dataProps as Record<string, any>)[key];
          const fieldDef = ('shape' in schema && schema.shape) ? schema.shape[key] : undefined;
          const baseType = fieldDef
            ? getBaseType(fieldDef as z.ZodAny)
            : undefined;
          // If the original value was a variable reference, preserve it
          if (isVariableReference(originalValue)) {
            // Keep the variable reference - the form should not override variable bindings
            preservedProps[key] = originalValue;
          } else {
            // Handle date serialization
            if (
              baseType === z.ZodFirstPartyTypeKind.ZodDate &&
              newValue instanceof Date
            ) {
              preservedProps[key] = newValue.toISOString();
            } else {
              preservedProps[key] = newValue;
            }
          }
        });
      }

      if (typeof children === "string") {
        updateLayer(selectedLayerId, preservedProps, { children: children });
      } else if (children && children.layerType) {
        updateLayer(selectedLayerId, preservedProps, {
          children: selectedLayer?.children,
        });
        addComponentLayer(
          children.layerType,
          selectedLayerId,
          children.addPosition
        );
      } else {
        updateLayer(selectedLayerId, preservedProps);
      }
    },
    [updateLayer, selectedLayerId, selectedLayer, addComponentLayer, schema]
  );

  // Memoize variables to avoid accessing store state on every render
  const variables = useLayerStore((state) => state.variables);

  // Prepare values for AutoForm, converting enum values to strings as select elements only accept string values
  const formValues = useMemo(() => {
    if (!selectedLayer) return EMPTY_FORM_VALUES;

    // First resolve variable references to get display values
    const resolvedProps = resolveVariableReferences(
      selectedLayer.props,
      variables
    );

    const transformedProps: Record<string, any> = {};
    const schemaShape = ('shape' in schema && schema.shape) ? schema.shape as z.ZodRawShape : undefined; // Get shape from the memoized schema

    if (schemaShape) {
      for (const [key, value] of Object.entries(resolvedProps)) {
        const fieldDef = schemaShape[key];
        if (fieldDef) {
          const baseType = getBaseType(fieldDef as z.ZodAny);
          if (baseType === z.ZodFirstPartyTypeKind.ZodEnum) {
            // Convert enum value to string if it's not already a string
            transformedProps[key] =
              typeof value === "string" ? value : String(value);
          } else if (baseType === z.ZodFirstPartyTypeKind.ZodDate) {
            // Convert string to Date if necessary
            if (value instanceof Date) {
              transformedProps[key] = value;
            } else if (typeof value === "string" || typeof value === "number") {
              const date = new Date(value);
              transformedProps[key] = isNaN(date.getTime()) ? undefined : date;
            } else {
              transformedProps[key] = undefined;
            }
          } else {
            transformedProps[key] = value;
          }
        } else {
          transformedProps[key] = value;
        }
      }
    } else {
      // Fallback if schema shape isn't available: copy resolved props as is
      Object.assign(transformedProps, resolvedProps);
    }

    return { ...transformedProps, children: selectedLayer.children };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayer, schema, revisionCounter]); // Include revisionCounter to detect undo/redo changes

  const autoFormSchema = useMemo(() => {
    // Only pass ZodObject schemas to addDefaultValues, otherwise return the original schema
    if ('shape' in schema && typeof schema.shape === 'object') {
      try {
        return addDefaultValues(schema as any, formValues);
      } catch (error) {
        console.warn('Failed to add default values to schema:', error);
        return schema;
      }
    }
    return schema;
  }, [schema, formValues]);

  const autoFormFieldConfig = useMemo(() => {
    if (!selectedLayer) return undefined; // Or a default config if appropriate
    return generateFieldOverrides(componentRegistry, selectedLayer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentRegistry, selectedLayer, selectedLayer?.props]);

  // Create a unique key that changes when we need to force re-render the form
  // This includes selectedLayerId and revisionCounter to handle both layer changes and undo/redo
  const formKey = useMemo(() => {
    return `${selectedLayerId}-${revisionCounter}`;
  }, [selectedLayerId, revisionCounter]);

  if (
    !selectedLayer ||
    !componentRegistry[selectedLayer.type as keyof typeof componentRegistry]
  ) {
    return null;
  }

  return (
    <AutoForm
      key={formKey} // Force re-render when layer changes or undo/redo occurs
      formSchema={autoFormSchema}
      values={formValues} // Use the memoized and transformed values
      onParsedValuesChange={onParsedValuesChange}
      fieldConfig={autoFormFieldConfig}
      className="space-y-4 mt-4"
    >
      {(!isPage || allowPagesCreation) && (
        <Button
          type="button"
          variant="secondary"
          className="mt-4 w-full"
          onClick={handleDuplicateLayer}
          data-testid={`button-Duplicate ,${isPage ? "Page" : "Component"}`}
        >
          Duplicate {isPage ? "Page" : "Component"}
        </Button>
      )}
      {(!isPage || allowPagesDeletion) && (
        <Button
          type="button"
          variant="destructive"
          className="mt-4 w-full"
          onClick={handleDeleteLayer}
          data-testid={`button-Delete ,${isPage ? "Page" : "Component"}`}
        >
          Delete {isPage ? "Page" : "Component"}
        </Button>
      )}
    </AutoForm>
  );
};

ComponentPropsAutoForm.displayName = "ComponentPropsAutoForm";

const nameForLayer = (layer: ComponentLayer) => {
  return layer.name || layer.type.replaceAll("_", "");
};

const Title = React.memo(() => {
  const selectedLayer = useLayerStore((state) => {
    const selectedLayerId = state.selectedLayerId;
    return selectedLayerId ? state.findLayerById(selectedLayerId) : null;
  });
  
  return (
    <h2 className="text-xl font-semibold mb-2">
      {selectedLayer ? nameForLayer(selectedLayer) : ""} Properties
    </h2>
  );
});

Title.displayName = "Title";
