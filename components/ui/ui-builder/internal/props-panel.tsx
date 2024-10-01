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
import DraggableList from "@/components/ui/ui-builder/internal/draggable-list";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { AddComponentsPopover } from "@/components/ui/ui-builder/internal/add-component-popover";
import ClassNameField from "@/components/ui/ui-builder/internal/classname-field";
import { addDefaultValues } from "@/components/ui/ui-builder/internal/store/schema-utils";

interface PropsPanelProps {
  className?: string;
}

const PropsPanel: React.FC<PropsPanelProps> = ({ className }) => {
  const { selectedLayerId, findLayerById } = useComponentStore();

  const selectedLayer = findLayerById(selectedLayerId);

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">
        {selectedLayer && isTextLayer(selectedLayer)
          ? "Text Properties"
          : selectedLayer?.type
          ? selectedLayer.type + " Properties"
          : "Component Properties"}
      </h2>
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
    updateLayer: updateLayerProps,
    reorderChildrenLayers,
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
    (id: string, props: Record<string, any>, rest?: Omit<Layer, 'props' | 'children'>) => {
      updateLayerProps(id, props, rest);
    },
    [selectedLayer?.id, updateLayerProps]
  );

  const handleReorderChildrenLayers = useCallback(
    (parentId: string, childIds: string[]) => {
      reorderChildrenLayers(parentId, childIds);
    },
    [reorderChildrenLayers]
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
      handleReorderChildrenLayers={handleReorderChildrenLayers}
    />
  );
}

interface TextLayerFormProps {
  selectedLayer: TextLayer;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  updateLayerProps: (id: string, props: Record<string, any>, rest?: Omit<Layer, 'props' | 'children'>) => void;
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

      const {props, ...rest} = mergedValues;

      // setValues(mergedValues);
      console.log("calling updateLayerProps with", {props, rest});
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
  handleReorderChildrenLayers: (parentId: string, childIds: string[]) => void;
}

const ComponentPropsAutoForm: React.FC<ComponentPropsAutoFormProps> =
  React.memo(
    ({
      selectedLayer,
      removeLayer,
      duplicateLayer,
      updateLayerProps,
      handleReorderChildrenLayers,
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
                            handleReorderChildrenLayers={
                              handleReorderChildrenLayers
                            }
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
  handleReorderChildrenLayers: (parentId: string, childIds: string[]) => void;
}

function ChildrenSearchableMultiSelect({
  field,
  removeLayer,
  handleReorderChildrenLayers,
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
      <AddComponentsPopover
        parentLayerId={selectedLayer?.id}
      >
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

      {selectedLayer && (
        <DraggableList
          // className={`w-full grid grid-cols-1 grid-rows-${selectedLayer.children?.length || 0} gap-1`}
          onOrderChange={(newOrder) => {
            console.log("new order", newOrder);
            handleReorderChildrenLayers(
              selectedLayer.id,
              newOrder.map((item) => item.id)
            );
          }}
          items={
            isTextLayer(selectedLayer)
              ? []
              : selectedLayer.children?.map((child, index) => ({
                  id: child.id,
                  reactElement: (
                    <div key={child.id} className="flex items-center space-x-2">
                      <span className="truncate inline-block max-w-[150px]">
                        {isTextLayer(child) ? `"${child.text}"` : child.type}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(child.id)}
                      >
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ),
                })) || []
          }
        ></DraggableList>
      )}
    </div>
  );
}

