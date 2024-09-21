import React, { useCallback, useState } from "react";
import { PlusIcon, X as XIcon, ChevronsUpDown } from "lucide-react";
import { z, ZodObject, ZodTypeAny } from "zod";
import {
  useComponentStore,
  componentRegistry,
  ComponentLayer,
  isTextLayer,
} from "@/components/ui/ui-builder/store/component-store";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AutoForm from "@/components/ui/auto-form";
import { AutoFormInputComponentProps } from "@/components/ui/auto-form/types";
import DraggableList from "./draggable-list";

interface PropsPanelProps {
  className?: string;
}

const PropsPanel: React.FC<PropsPanelProps> = ({ className }) => {
  const {
    selectedLayer,
    addComponentLayer,
    addTextLayer,
    removeLayer,
    duplicateLayer,
    updateLayerProps,
    reorderChildrenLayers,
  } = useComponentStore();

  const handleAddComponentLayer = useCallback(
    (componentName: keyof typeof componentRegistry) => {
      addComponentLayer(componentName, selectedLayer?.id);
    },
    [selectedLayer?.id, addComponentLayer]
  );

  const handleAddTextLayer = useCallback(
    (text: string) => {
      addTextLayer(text, selectedLayer?.id);
    },
    [selectedLayer?.id, addTextLayer]
  );

  const handleDeleteLayer = useCallback(() => {
    if (selectedLayer) {
      removeLayer(selectedLayer.id);
    }
  }, [selectedLayer?.id, removeLayer]);

  const handleDuplicateLayer = useCallback(() => {
    if (selectedLayer) {
      duplicateLayer(selectedLayer.id);
    }
  }, [selectedLayer?.id, duplicateLayer]);

  const handleUpdateLayerProps = useCallback(
    (id: string, props: Record<string, any>) => {
      updateLayerProps(id, props);
    },
    [selectedLayer?.id, updateLayerProps]
  );

  const handleReorderChildrenLayers = useCallback(
    (parentId: string, childIds: string[]) => {
      reorderChildrenLayers(parentId, childIds);
    },
    [reorderChildrenLayers]
  );

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">
        {selectedLayer?.type ?? "Component"} Properties
      </h2>
      {!selectedLayer && <p>No component selected</p>}
      {selectedLayer && (
        <WrappedAutoForm
          key={selectedLayer.id}
          selectedLayer={selectedLayer}
          handleAddComponentLayer={handleAddComponentLayer}
          handleAddTextLayer={handleAddTextLayer}
          removeLayer={handleDeleteLayer}
          duplicateLayer={handleDuplicateLayer}
          updateLayerProps={handleUpdateLayerProps}
          handleReorderChildrenLayers={handleReorderChildrenLayers}
        />
      )}
    </div>
  );
};

interface WrappedAutoFormProps {
  selectedLayer: ComponentLayer;
  handleAddComponentLayer: (
    componentName: keyof typeof componentRegistry
  ) => void;
  handleAddTextLayer: (text: string) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  updateLayerProps: (id: string, props: Record<string, any>) => void;
  handleReorderChildrenLayers: (parentId: string, childIds: string[]) => void;
}

const WrappedAutoForm: React.FC<WrappedAutoFormProps> = React.memo(
  ({
    selectedLayer,
    handleAddComponentLayer,
    handleAddTextLayer,
    removeLayer,
    duplicateLayer,
    updateLayerProps,
    handleReorderChildrenLayers,
  }: WrappedAutoFormProps) => {
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
                          handleAddComponentLayer={handleAddComponentLayer}
                          handleAddTextLayer={handleAddTextLayer}
                          removeLayer={removeLayer}
                          handleReorderChildrenLayers={handleReorderChildrenLayers}
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
  handleAddComponentLayer: (
    componentName: keyof typeof componentRegistry
  ) => void;
  handleAddTextLayer: (text: string) => void;
  removeLayer: (id: string) => void;
  handleReorderChildrenLayers: (parentId: string, childIds: string[]) => void;
}

function ChildrenSearchableMultiSelect({
  field,
  handleAddComponentLayer,
  handleAddTextLayer,
  removeLayer,
  handleReorderChildrenLayers
}: ChildrenInputProps) {
  console.log("ChildrenSearchableMultiSelect", "render");
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [textInputValue, setTextInputValue] = React.useState("");

  const {selectedLayer} = useComponentStore();

  console.log({selectedLayer});

  const componentOptions = Object.keys(componentRegistry).map((name) => ({
    value: name,
    label: name,
    type: "component",
    from: componentRegistry[name as keyof typeof componentRegistry].from,
  }));

  const groupedOptions = componentOptions.reduce(
    (acc, option) => {
      const group = option.from || "Other";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(option);
      return acc;
    },
    {} as Record<string, typeof componentOptions>
  );


  const handleSelect = React.useCallback(
    (currentValue: string) => {
      if (currentValue === "text" && inputValue.trim()) {
        handleAddTextLayer(inputValue.trim());
        setInputValue("");
      } else {
        // Check if the currentValue is a valid component name
        if (componentRegistry[currentValue as keyof typeof componentRegistry]) {
          handleAddComponentLayer(
            currentValue as keyof typeof componentRegistry
          );
        }
      }
      setOpen(false);
    },
    [handleAddComponentLayer, handleAddTextLayer, inputValue]
  );

  const handleRemove = React.useCallback(
    (childId: string) => {
      removeLayer(childId);
    },
    [removeLayer]
  );

  const textInputForm = (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        handleAddTextLayer(textInputValue);
        setTextInputValue("");
      }}
    >
      <div className="w-full flex items-center space-x-2">
        <Input
          className="w-full flex-grow"
          placeholder="Enter text..."
          value={textInputValue}
          onChange={(e) => setTextInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTextLayer(textInputValue);
              setTextInputValue("");
            }
          }}
        />
        <Button type="submit" variant="secondary">
          {" "}
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );

  return (
    <div className="w-full space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            Add Component or Text
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Add component or text..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>
                No components found
                {textInputForm}
              </CommandEmpty>
              <CommandGroup heading="Text">
                <CommandItem>{textInputForm}</CommandItem>
              </CommandGroup>
              <CommandSeparator />
              {Object.entries(groupedOptions).map(
                ([group, components]) => (
                  <CommandGroup key={group} heading={group}>
                    {components.map((component) => (
                      <CommandItem
                        key={component.value}
                        onSelect={() => handleSelect(component.value)}
                      >
                        {component.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedLayer && (
      <DraggableList
        // className={`w-full grid grid-cols-1 grid-rows-${selectedLayer.children?.length || 0} gap-1`}
        onOrderChange={(newOrder) => {
          console.log("new order", newOrder);
          handleReorderChildrenLayers(selectedLayer.id, newOrder.map(item => item.id));
        }}
        items={selectedLayer.children?.map((child, index) => ({id: child.id, reactElement:
          <div
            key={child.id}
            className="flex items-center space-x-2"
          >
            <span>{isTextLayer(child) ? `"${child.text}"` : child.type}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                handleRemove(child.id)
              }
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        })) || []}
      ></DraggableList>
      )}
    </div>
  );
}

PropsPanel.displayName = "PropsPanel";

export default PropsPanel;

// patch for autoform to respect existing values
function addDefaultValues<T extends ZodObject<any>>(
  schema: T,
  defaultValues: Partial<z.infer<T>>
): T {
  const shape = schema.shape;

  const updatedShape = { ...shape };

  for (const key in defaultValues) {
    if (updatedShape[key]) {
      // Apply the default value to the existing schema field
      updatedShape[key] = updatedShape[key].default(defaultValues[key]);
    } else {
      console.warn(`Key "${key}" does not exist in the schema and will be ignored.`);
    }
  }

  return z.object(updatedShape) as T;
}
