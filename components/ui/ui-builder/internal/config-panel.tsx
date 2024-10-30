/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback } from "react";
import { z } from "zod";
import {
  useLayerStore,
  PageLayer,
  Layer,
} from "@/lib/ui-builder/store/layer-store";
import { Button } from "@/components/ui/button";
import AutoForm from "@/components/ui/auto-form";
import { AutoFormInputComponentProps } from "@/components/ui/auto-form/types";
import ClassNameField from "@/components/ui/ui-builder/internal/classname-field";
import { addDefaultValues } from "@/lib/ui-builder/store/schema-utils";

export const ConfigPanel = () => {
  const {
    selectedPageId,
    findLayerById,
    removeLayer,
    duplicateLayer,
    updateLayer,
    pages,
  } = useLayerStore();

  

  const selectedLayer = findLayerById(selectedPageId) as PageLayer;

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

  const handleUpdateLayerProps = useCallback(
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
    <PageLayerForm
      selectedLayer={selectedLayer}
      removeLayer={handleDeleteLayer}
      duplicateLayer={handleDuplicateLayer}
      updateLayerProps={handleUpdateLayerProps}
      allowDelete={pages.length > 1}
    />
  );
};

interface PageLayerFormProps {
  selectedLayer: PageLayer;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  updateLayerProps: (
    id: string,
    props: Record<string, any>,
    rest?: Omit<Layer, "props" | "children">
  ) => void;
  allowDelete: boolean;
}

const PageLayerForm: React.FC<PageLayerFormProps> = ({
  selectedLayer,
  removeLayer,
  duplicateLayer,
  updateLayerProps,
  allowDelete,
}) => {
  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    className: z.string().optional(),
  });

  const handleSetValues = useCallback(
    (data: Partial<z.infer<typeof schema>>) => {
      const { name, className } = data;

      // Merge the changed fields into the existing layer
      const mergedValues = { ...selectedLayer, name, props: { className } };
      const { props, ...rest } = mergedValues;

      updateLayerProps(selectedLayer.id, props, rest);
    },
    [selectedLayer, updateLayerProps]
  );

  return (
    <AutoForm
      formSchema={addDefaultValues(schema, {
        name: selectedLayer.name,
        className: selectedLayer.props.className,
      })}
      onValuesChange={handleSetValues}
      values={{
        name: selectedLayer.name,
        className: selectedLayer.props.className,
      }}
      fieldConfig={{
        name: {
          inputProps: {
            value: selectedLayer.name,
            // defaultValue: selectedLayer.name,
          },
          description: "The name of the page.",
        },
        className: {
          fieldType: ({
            label,
            isRequired,
          }: AutoFormInputComponentProps) => (
            <ClassNameField
              label={label}
              isRequired={isRequired}
              className={selectedLayer.props.className}
              onChange={(value) => {
                updateLayerProps(selectedLayer.id, {
                  className: value,
                });
              }}
            />
          ),
        },
      }}
    >
      <Button
        type="button"
        variant="secondary"
        className="mt-4 w-full"
        onClick={() => duplicateLayer(selectedLayer.id)}
      >
        Duplicate Page
      </Button>
      {allowDelete && (
        <Button
          type="button"
          variant="destructive"
          className="mt-4 w-full"
          onClick={() => removeLayer(selectedLayer.id)}
        >
          Delete Page
        </Button>
      )}
    </AutoForm>
  );
};

export default PageLayerForm;
