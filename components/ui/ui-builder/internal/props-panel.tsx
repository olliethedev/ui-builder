/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useMemo } from "react";
import { z } from "zod";
import {
  useLayerStore,
  ComponentLayer,
  Layer,
} from "@/lib/ui-builder/store/layer-store";
import { componentRegistry } from "@/lib/ui-builder/registry/component-registry";
import { Button } from "@/components/ui/button";
import AutoForm from "@/components/ui/auto-form";
import { generateFieldOverrides } from "@/lib/ui-builder/registry/component-registry";
import { addDefaultValues } from "@/lib/ui-builder/store/schema-utils";

interface PropsPanelProps {
  className?: string;
}

const PropsPanel: React.FC<PropsPanelProps> = ({ className }) => {
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const removeLayer = useLayerStore((state) => state.removeLayer);
  const duplicateLayer = useLayerStore((state) => state.duplicateLayer);
  const updateLayer = useLayerStore((state) => state.updateLayer);
  const addComponentLayer = useLayerStore((state) => state.addComponentLayer);

  const selectedLayer = findLayerById(selectedLayerId);

  const handleAddComponentLayer = useCallback((layerType: string, parentLayerId: string, addPosition?: number) => {
    addComponentLayer(layerType as keyof typeof componentRegistry, parentLayerId, addPosition);
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
      rest?: Partial<Omit<Layer, "props">>
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
      {selectedLayer && (
        <ComponentPropsAutoForm
          key={selectedLayer.id}
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
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  updateLayer: (id: string, props: Record<string, any>, rest?: Partial<Omit<Layer, "props">>) => void;
  addComponentLayer: (layerType: string, parentLayerId: string, addPosition?: number) => void;
}

const ComponentPropsAutoForm: React.FC<ComponentPropsAutoFormProps> = ({
  selectedLayerId,
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
    return { schema: z.object({}) }; // Fallback schema
  }, [selectedLayer]);

  if (!selectedLayer || !componentRegistry[selectedLayer.type as keyof typeof componentRegistry]) {
    return null;
  }

  return (
    <AutoForm
      formSchema={addDefaultValues(schema, { ...selectedLayer.props, children: selectedLayer.children })}
      values={ { ...selectedLayer.props, children: selectedLayer.children }}
      onParsedValuesChange={onParsedValuesChange}
      fieldConfig={generateFieldOverrides(selectedLayer)}
      className="space-y-4"
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

const nameForLayer = (layer: Layer) => {
  return layer.name || layer.type.replaceAll("_", "");
};
