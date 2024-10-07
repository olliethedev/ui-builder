/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState } from "react";
import { z } from "zod";
import {
  useLayerStore,
  componentRegistry,
  ComponentLayer,
  isTextLayer,
  TextLayer,
  Layer,
} from "@/lib/ui-builder/store/layer-store";
import { Button } from "@/components/ui/button";
import AutoForm from "@/components/ui/auto-form";
import { Label } from "@/components/ui/label";
import { addDefaultValues } from "@/lib/ui-builder/store/schema-utils";
import { generateFieldOverrides } from "@/lib/ui-builder/registry/component-registry";
import { classNameFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";

interface PropsPanelProps {
  className?: string;
}

const PropsPanel: React.FC<PropsPanelProps> = ({ className }) => {
  const { selectedLayerId, findLayerById } = useLayerStore();

  const selectedLayer = findLayerById(selectedLayerId);

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
  selectedLayer: ComponentLayer | TextLayer;
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

  if (isTextLayer(selectedLayer)) {
    return (
      <TextLayerForm
        key={selectedLayer.id}
        selectedLayer={selectedLayer}
        removeLayer={handleDeleteLayer}
        duplicateLayer={handleDuplicateLayer}
        updateLayer={handleUpdateLayer}
      />
    );
  }
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

interface TextLayerFormProps {
  selectedLayer: TextLayer;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  updateLayer: (
    id: string,
    props: Record<string, any>,
    rest?: Omit<Layer, "props" | "children">
  ) => void;
}

const TextLayerForm: React.FC<TextLayerFormProps> = ({
  selectedLayer,
  removeLayer,
  duplicateLayer,
  updateLayer,
}) => {
  const schema = z.object({
    text: z.string(),
    textType: z.enum(["text", "markdown"]),
    className: z.string().optional(),
  });

  const handleSetValues = useCallback(
    (data: Partial<z.infer<typeof schema>>) => {
      // Merge the changed fields into the existing props
      const { text, textType, className } = data;
      const mergedValues = {
        ...selectedLayer,
        text,
        textType,
        props: { ...selectedLayer.props, className },
      };

      const { props, ...rest } = mergedValues;

      updateLayer(selectedLayer.id, props, rest);
    },
    [selectedLayer, updateLayer]
  );

  return (
    <AutoForm
      formSchema={addDefaultValues(schema, {
        text: selectedLayer.text,
        textType: selectedLayer.textType,
        className: selectedLayer.props.className,
      })}
      onValuesChange={handleSetValues}
      onSubmit={(data) => {
        console.log({ onSubmit: data });
      }}
      values={{
        text: selectedLayer.text,
        textType: selectedLayer.textType,
        className: selectedLayer.props.className,
      }}
      fieldConfig={{
        text: {
          inputProps: {
            value: selectedLayer.text,
            // defaultValue: selectedLayer.text,
          },
          fieldType: "textarea",
        },
        textType: {
          inputProps: {
            value: selectedLayer.textType,
            // defaultValue: selectedLayer.textType,
          },
          description: (
            <>
              <Label>
                What Is{" "}
                <a
                  href="https://www.markdownguide.org/basic-syntax/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-accent-foreground"
                >
                  Markdown
                </a>
                ?
              </Label>
            </>
          ),
        },
        className:classNameFieldOverrides(selectedLayer),
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
};

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [values, setValues] = useState<Partial<z.infer<typeof schema>>>(
        selectedLayer.props
      );

      const { schema } =
        componentRegistry[selectedLayer.type as keyof typeof componentRegistry];

      const fieldOverrides = generateFieldOverrides(selectedLayer);

      const handleSetValues = useCallback(
        (data: Partial<z.infer<typeof schema>>) => {
          // Identify keys that have changed by comparing new data with existing props
          const changedFields = Object.keys(data).reduce(
            (acc, key) => {
              const newValue = data[key];
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
        },
        [selectedLayer, updateLayer]
      );

      return (
        <AutoForm
          key={selectedLayer.id}
          values={selectedLayer.props}
          onValuesChange={handleSetValues}
          // onParsedValuesChange={handleSetValues}
          formSchema={addDefaultValues(schema, selectedLayer.props)}
          onSubmit={(data) => {
            console.log({ onSubmit: data });
          }}
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
