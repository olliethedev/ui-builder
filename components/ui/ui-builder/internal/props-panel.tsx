/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useMemo } from "react";
import { z } from "zod";
import {
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { ComponentRegistry, ComponentLayer } from '@/components/ui/ui-builder/types';
import { Button } from "@/components/ui/button";
import AutoForm from "@/components/ui/auto-form";
import { generateFieldOverrides } from "@/lib/ui-builder/store/editor-utils";
import { addDefaultValues } from "@/lib/ui-builder/store/schema-utils";
import { getBaseType } from "@/components/ui/auto-form/utils";

interface PropsPanelProps {
  className?: string;
  pagePropsForm: React.ReactNode;
}

const PropsPanel: React.FC<PropsPanelProps> = ({ className, pagePropsForm }) => {
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const selectedPageId = useLayerStore((state) => state.selectedPageId);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const removeLayer = useLayerStore((state) => state.removeLayer);
  const duplicateLayer = useLayerStore((state) => state.duplicateLayer);
  const updateLayer = useLayerStore((state) => state.updateLayer);
  const addComponentLayer = useLayerStore((state) => state.addComponentLayer);
  const componentRegistry = useEditorStore((state) => state.registry);
  const selectedLayer = findLayerById(selectedLayerId);

  const handleAddComponentLayer = useCallback((layerType: string, parentLayerId: string, addPosition?: number) => {
    addComponentLayer(layerType, parentLayerId, addPosition);
  }, [addComponentLayer]);

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
          <h2 className="text-xl font-semibold mb-2">
            {nameForLayer(selectedLayer)} Properties
          </h2>
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
      {selectedLayerId === selectedPageId && (
        pagePropsForm
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
};
PropsPanel.displayName = "PropsPanel";
export default PropsPanel;

interface ComponentPropsAutoFormProps {
  selectedLayerId: string;
  componentRegistry: ComponentRegistry;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  updateLayer: (id: string, props: Record<string, any>, rest?: Partial<Omit<ComponentLayer, "props">>) => void;
  addComponentLayer: (layerType: string, parentLayerId: string, addPosition?: number) => void;
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
  const selectedLayer = findLayerById(selectedLayerId) as ComponentLayer | undefined;
  
  const handleDeleteLayer = useCallback(() => {
    removeLayer(selectedLayerId);
  }, [removeLayer, selectedLayerId]);

  const handleDuplicateLayer = useCallback(() => {
    duplicateLayer(selectedLayerId);
  }, [duplicateLayer, selectedLayerId]);

  const onParsedValuesChange = useCallback(
    (parsedValues: z.infer<typeof schema> & { children?: string | { layerType: string, addPosition: number } }) => {
      const { children, ...dataProps } = parsedValues;
      if(typeof children === "string") {
        updateLayer(selectedLayerId, dataProps, { children: children  });
      }else if(children && children.layerType) {
        updateLayer(selectedLayerId, dataProps, { children: selectedLayer?.children });
        addComponentLayer(children.layerType, selectedLayerId, children.addPosition)
      }else{
        updateLayer(selectedLayerId, dataProps);
      }
    },
    [updateLayer, selectedLayerId, selectedLayer, addComponentLayer]
  );

  // Retrieve the appropriate schema from componentRegistry
  const { schema } = useMemo(() => {
    if (selectedLayer && componentRegistry[selectedLayer.type as keyof typeof componentRegistry]) {
      return componentRegistry[selectedLayer.type as keyof typeof componentRegistry];
    }
    return { schema: EMPTY_ZOD_SCHEMA }; // Fallback schema
  }, [selectedLayer, componentRegistry]);

  // Prepare values for AutoForm, converting enum values to strings as select elements only accept string values
  const formValues = useMemo(() => {
    if (!selectedLayer) return EMPTY_FORM_VALUES;

    const transformedProps: Record<string, any> = {};
    const schemaShape = schema?.shape as z.ZodRawShape | undefined; // Get shape from the memoized schema
    
    if (schemaShape) {
      for (const [key, value] of Object.entries(selectedLayer.props)) {
        const fieldDef = schemaShape[key];
        // Check if the field definition exists and if its base type is ZodEnum
        if (fieldDef && getBaseType(fieldDef as z.ZodAny) === z.ZodFirstPartyTypeKind.ZodEnum) {
          // Convert enum value to string if it's not already a string
          transformedProps[key] = typeof value === 'string' ? value : String(value);
        } else {
          transformedProps[key] = value;
        }
      }
      
    } else {
       // Fallback if schema shape isn't available: copy props as is
       Object.assign(transformedProps, selectedLayer.props);
    }

    return { ...transformedProps, children: selectedLayer.children };
  }, [selectedLayer, schema]); // Depend on selectedLayer and schema

  const autoFormSchema = useMemo(() => {
    return addDefaultValues(schema, formValues);
  }, [schema, formValues]);

  const autoFormFieldConfig = useMemo(() => {
    if (!selectedLayer) return undefined; // Or a default config if appropriate
    return generateFieldOverrides(componentRegistry, selectedLayer);
  }, [componentRegistry, selectedLayer]);

  if (!selectedLayer || !componentRegistry[selectedLayer.type as keyof typeof componentRegistry]) {
    return null;
  }

  return (
    <AutoForm
      formSchema={autoFormSchema}
      values={formValues} // Use the memoized and transformed values
      onParsedValuesChange={onParsedValuesChange}
      fieldConfig={autoFormFieldConfig}
      className="space-y-4 mt-4"
      onSubmit={() => {}} // Optional: no-op or remove if not needed
    >
      <Button
        type="button"
        variant="secondary"
        className="mt-4 w-full"
        onClick={handleDuplicateLayer}
      >
        Duplicate Component
      </Button>
      <Button
        type="button"
        variant="destructive"
        className="mt-4 w-full"
        onClick={handleDeleteLayer}
      >
        Delete Component
      </Button>
    </AutoForm>
  );
};

ComponentPropsAutoForm.displayName = "ComponentPropsAutoForm";

const nameForLayer = (layer: ComponentLayer) => {
  return layer.name || layer.type.replaceAll("_", "");
};
