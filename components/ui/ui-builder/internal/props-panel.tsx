import React, { useCallback, useState } from "react";
import { z } from "zod";
import { X as XIcon, ChevronsUpDown } from "lucide-react";
import {
  useComponentStore,
  componentRegistry,
  ComponentLayer,
  isTextLayer,
  TextLayer,
  Layer,
} from "@/components/ui/ui-builder/internal/store/component-store";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import AutoForm from "@/components/ui/auto-form";
import { AutoFormInputComponentProps } from "@/components/ui/auto-form/types";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/add-component-popover";
import ClassNameField from "@/components/ui/ui-builder/internal/classname-field";
import { addDefaultValues } from "@/components/ui/ui-builder/internal/store/schema-utils";
import { Badge } from "@/components/ui/badge";

interface PropsPanelProps {
  className?: string;
}

const PropsPanel: React.FC<PropsPanelProps> = ({ className }) => {
  const { selectedLayerId, findLayerById } = useComponentStore();

  const selectedLayer = findLayerById(selectedLayerId);

  return (
    <div className={className}>
      {selectedLayer && (
        <>
          <h2 className="text-xl font-semibold mb-2">
            {nameForLayer(selectedLayer)} Properties
          </h2>
          <h3 className="text-base font-medium mb-4">
            Type: {selectedLayer.type}
          </h3>
        </>
      )}

      {!selectedLayer && <p>No component selected</p>}
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
  const {
    removeLayer,
    duplicateLayer,
    updateLayer,
  } = useComponentStore();

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
  }, [selectedLayer?.id, duplicateLayer]);

  const handleUpdateLayerProps = useCallback(
    (
      id: string,
      props: Record<string, any>,
      rest?: Omit<Layer, "props" | "children">
    ) => {
      updateLayer(id, props, rest);
    },
    [selectedLayer?.id, updateLayer]
  );

  if (isTextLayer(selectedLayer)) {
    return (
      <TextLayerForm
        key={selectedLayer.id}
        selectedLayer={selectedLayer}
        removeLayer={handleDeleteLayer}
        duplicateLayer={handleDuplicateLayer}
        updateLayerProps={handleUpdateLayerProps}
      />
    );
  }
  return (
    <ComponentPropsAutoForm
      key={selectedLayer.id}
      selectedLayer={selectedLayer}
      removeLayer={handleDeleteLayer}
      duplicateLayer={handleDuplicateLayer}
      updateLayerProps={handleUpdateLayerProps}
    />
  );
}

interface TextLayerFormProps {
  selectedLayer: TextLayer;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  updateLayerProps: (
    id: string,
    props: Record<string, any>,
    rest?: Omit<Layer, "props" | "children">
  ) => void;
}

const TextLayerForm: React.FC<TextLayerFormProps> = ({
  selectedLayer,
  removeLayer,
  duplicateLayer,
  updateLayerProps,
}) => {
  const schema = z.object({
    text: z.string(),
    textType: z.enum(["text", "markdown"]),
    className: z.string().optional(),
  });

  const handleSetValues = useCallback(
    (data: Partial<z.infer<typeof schema>>) => {
      console.log("handleSetValues", { data });
      console.log("old values", selectedLayer);

      // Merge the changed fields into the existing props
      const mergedValues = { ...selectedLayer, ...data };

      const { props, ...rest } = mergedValues;

      // setValues(mergedValues);
      console.log("calling updateLayerProps with", { props, rest });
      updateLayerProps(selectedLayer.id, props, rest);
    },
    [selectedLayer.id, selectedLayer, updateLayerProps]
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
            defaultValue: selectedLayer.text,
          },
          fieldType: "textarea",
        },
        textType: {
          inputProps: {
            value: selectedLayer.textType,
            defaultValue: selectedLayer.textType,
          },
          description: (
            <>
              <Label>
                What Is{" "}
                <Link
                  href="https://www.markdownguide.org/basic-syntax/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link underline"
                >
                  Markdown
                </Link>
                ?
              </Label>
            </>
          ),
        },
        className: {
          fieldType: ({
            label,
            isRequired,
            field,
            fieldConfigItem,
            fieldProps,
          }: AutoFormInputComponentProps) => (
            <ClassNameField
              label={label}
              isRequired={isRequired}
              className={selectedLayer.props.className}
              onChange={(value) => {
                console.log({ value });
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
  updateLayerProps: (id: string, props: Record<string, any>) => void;
}

const ComponentPropsAutoForm: React.FC<ComponentPropsAutoFormProps> =
  React.memo(
    ({
      selectedLayer,
      removeLayer,
      duplicateLayer,
      updateLayerProps,
    }: ComponentPropsAutoFormProps) => {
      console.log(
        "autoform rerender for",
        selectedLayer.id,
        "with props",
        selectedLayer.props
      );

      const [values, setValues] = useState<Partial<z.infer<typeof schema>>>(
        selectedLayer.props
      );

      const { schema } =
        componentRegistry[selectedLayer.type as keyof typeof componentRegistry];

      const hasChildrenInSchema = schema.shape.children !== undefined;
      const hasClassNameInSchema = schema.shape.className !== undefined;

      const handleSetValues = useCallback(
        (data: Partial<z.infer<typeof schema>>) => {
          console.log("handleSetValues", { data });
          console.log("old values", selectedLayer.props);

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

          console.log("changed fields", changedFields);

          const hasChanges = Object.keys(changedFields).length > 0;

          if (hasChanges) {
            console.log("updating layer props with", changedFields);

            // Merge the changed fields into the existing props
            const mergedValues = { ...selectedLayer.props, ...changedFields };

            // setValues(mergedValues);
            updateLayerProps(selectedLayer.id, mergedValues);
          }
        },
        [selectedLayer.id, selectedLayer.props, updateLayerProps, setValues]
      );

      const defualtFieldConfig = Object.fromEntries(
        Object.entries(selectedLayer.props).map(([key, value]) => [
          key,
          {
            inputProps: {
              value,
              defaultValue: value,
            },
          },
        ])
      );
      console.log({ defualtFieldConfig });
      console.log({ initialValues: selectedLayer.props });

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
            // ...defualtFieldConfig,
            ...(hasChildrenInSchema
              ? {
                  children: {
                    fieldType: ({
                      label,
                      isRequired,
                      field,
                      fieldConfigItem,
                      fieldProps,
                    }: AutoFormInputComponentProps) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          {label}
                          {isRequired && (
                            <span className="text-destructive"> *</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <ChildrenSearchableMultiSelect
                            field={field}
                            selectedLayer={selectedLayer}
                            removeLayer={removeLayer}
                          />
                        </FormControl>
                        {fieldConfigItem.description && (
                          <FormDescription>
                            {fieldConfigItem.description}
                          </FormDescription>
                        )}
                      </FormItem>
                    ),
                  },
                }
              : undefined),
            ...(hasClassNameInSchema
              ? {
                  className: {
                    fieldType: ({
                      label,
                      isRequired,
                      field,
                      fieldConfigItem,
                      fieldProps,
                    }: AutoFormInputComponentProps) => (
                      <ClassNameField
                        label={label}
                        isRequired={isRequired}
                        className={selectedLayer.props.className}
                        onChange={(value) => {
                          console.log({ value });
                          updateLayerProps(selectedLayer.id, {
                            ...selectedLayer.props,
                            className: value,
                          });
                        }}
                      />
                    ),
                  },
                }
              : undefined),
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

interface ChildrenInputProps {
  field: any;
  selectedLayer: ComponentLayer;
  removeLayer: (id: string) => void;
}

function ChildrenSearchableMultiSelect({
  field,
  removeLayer,
}: ChildrenInputProps) {
  console.log("ChildrenSearchableMultiSelect", "render");

  const { selectedLayerId, findLayerById } = useComponentStore();
  const selectedLayer = findLayerById(selectedLayerId);

  const handleRemove = React.useCallback(
    (childId: string) => {
      removeLayer(childId);
    },
    [removeLayer]
  );

  return (
    <div className="w-full space-y-4">
      {selectedLayer && (
        <AddComponentsPopover parentLayerId={selectedLayer?.id}>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            Add Component or Text
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </AddComponentsPopover>
      )}

      {selectedLayer && !isTextLayer(selectedLayer) && (
        <div className="w-full flex gap-2 flex-wrap">
          {selectedLayer.children?.map((child) => (
            <Badge key={child.id} className="flex items-center space-x-2 pl-2 pr-0 py-0" variant="secondary">
              {nameForLayer(child)}
              <Button className="p-0 size-6 rounded-full" variant="ghost" size="icon" onClick={() => handleRemove(child.id)}>
                <XIcon className="w-4 h-4" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

const nameForLayer = (layer: Layer) => {
  return layer.name || layer.type;
};
