/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState, useRef } from "react";
import { z } from "zod";
import {
  useLayerStore,
  ComponentLayer,
  Layer,
} from "@/lib/ui-builder/store/layer-store";
import { componentRegistry } from "@/lib/ui-builder/registry/component-registry";
import { Button } from "@/components/ui/button";
import AutoForm from "@/components/ui/auto-form";
import { addDefaultValues } from "@/lib/ui-builder/store/schema-utils";
import { generateFieldOverrides } from "@/lib/ui-builder/registry/component-registry";
import { useDebounce } from "@/hooks/use-debounce";

interface PropsPanelProps {
  className?: string;
}

const PropsPanel: React.FC<PropsPanelProps> = ({ className }) => {
  const { selectedLayerId, findLayerById } = useLayerStore();

  const selectedLayer = findLayerById(selectedLayerId);

  //first check if selectedLayer.type is a valid key in componentRegistry
  if (selectedLayer && !componentRegistry[selectedLayer.type as keyof typeof componentRegistry]) {
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
      {selectedLayer && <PropsPanelForm selectedLayer={selectedLayer} />}
    </div>
  );
};
PropsPanel.displayName = "PropsPanel";
export default PropsPanel;

interface PropsPanelFormProps {
  selectedLayer: ComponentLayer;
}

function PropsPanelForm({ selectedLayer }: PropsPanelFormProps) {
  const { removeLayer, duplicateLayer, updateLayer } = useLayerStore();

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
      rest?: Omit<Layer, "props" | "children">
    ) => {
      updateLayer(id, props, rest);
    },
    [updateLayer]
  );

  return (
    <ComponentPropsAutoForm
      key={selectedLayer.id}
      selectedLayer={selectedLayer}
      removeLayer={handleDeleteLayer}
      duplicateLayer={handleDuplicateLayer}
      updateLayer={handleUpdateLayer}
    />
  );
}


interface ComponentPropsAutoFormProps {
  selectedLayer: ComponentLayer;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  updateLayer: (id: string, props: Record<string, any>) => void;
}

const ComponentPropsAutoForm: React.FC<ComponentPropsAutoFormProps> =
  React.memo(
    ({
      selectedLayer,
      removeLayer,
      duplicateLayer,
      updateLayer,
    }: ComponentPropsAutoFormProps) => {
      const [values, setValues] = useState<Partial<z.infer<typeof schema>>>(
        selectedLayer.props
      );

      const debouncedValues = useDebounce(values, 1);

      const { schema } =
        componentRegistry[selectedLayer.type as keyof typeof componentRegistry];

      const fieldOverrides = generateFieldOverrides(selectedLayer);
      // Ref to track the initial mount
      const isInitialMount = useRef(true);

      useEffect(() => {
        if (isInitialMount.current) {
          isInitialMount.current = false;
          return; // Skip the effect on initial render
        }

        // Identify keys that have changed by comparing new data with existing props
        const changedFields = Object.keys(debouncedValues).reduce(
          (acc, key) => {
            const newValue = debouncedValues[key];
            const oldValue = selectedLayer.props[key];
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
              acc[key] = newValue;
            }

            return acc;
          },
          {} as Partial<z.infer<typeof schema>>
        );

        const hasChanges = Object.keys(changedFields).length > 0;

        if (hasChanges) {
          // Merge the changed fields into the existing props
          const mergedValues = { ...selectedLayer.props, ...changedFields };

          // setValues(mergedValues);
          updateLayer(selectedLayer.id, mergedValues);
        }
      }, [debouncedValues, selectedLayer, updateLayer]);

      return (
        <AutoForm
          key={selectedLayer.id}
          values={selectedLayer.props}
          onValuesChange={setValues}
          // onParsedValuesChange={handleSetValues}
          formSchema={addDefaultValues(schema, selectedLayer.props)}
          // onSubmit={(data) => {
          //   console.log({ onSubmit: data });
          // }}
          fieldConfig={{
            ...fieldOverrides,
          }}
        >
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => duplicateLayer(selectedLayer.id)}
          >
            Duplicate Component
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="mt-4 w-full"
            onClick={() => removeLayer(selectedLayer.id)}
          >
            Delete Component
          </Button>
        </AutoForm>
      );
    }
  );

ComponentPropsAutoForm.displayName = "ComponentPropsAutoForm";

const nameForLayer = (layer: Layer) => {
  return layer.name || layer.type.replaceAll("_", "");
};
