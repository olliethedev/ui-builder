import React, { useCallback, useState } from "react";
import {
  PlusIcon,
  X as XIcon,
  ChevronsUpDown,
} from "lucide-react";
import { z } from "zod";
import {
  useComponentStore,
  componentRegistry,
  ComponentLayer,
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

interface PropsPanelProps {
  className?: string;
}

const PropsPanel: React.FC<PropsPanelProps> = ({ className }) => {
  const { selectedLayer } = useComponentStore();

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">
        {selectedLayer?.type ?? "Component"} Properties
      </h2>
      {!selectedLayer && <p>No component selected</p>}
      {selectedLayer && (
        <WrappedAutoForm key={selectedLayer.id} selectedLayer={selectedLayer} />
      )}
    </div>
  );
};

const WrappedAutoForm = 
  ({ selectedLayer }: { selectedLayer: ComponentLayer }) => {
    console.log("autoform rerender");

    const [values, setValues] = useState<Partial<z.infer<typeof schema>>>(
      selectedLayer.props
    );

    const { schema } =
      componentRegistry[selectedLayer.type as keyof typeof componentRegistry];

    const {
      updateLayerProps,
      addComponentLayer,
      addTextLayer,
      removeLayer,
      duplicateLayer,
    } = useComponentStore();

    const handleAddComponentLayer = (
      componentName: keyof typeof componentRegistry
    ) => {
      addComponentLayer(componentName, selectedLayer.id);
    };

    const handleAddTextLayer = (text: string) => {
      addTextLayer(text, selectedLayer.id);
    };

    const handleDeleteLayer = () => {
      removeLayer(selectedLayer.id);
    };

    const handleDuplicateLayer = () => {
      duplicateLayer(selectedLayer.id);
    };

    const handleSetValues = useCallback((data: Partial<z.infer<typeof schema>>) => {
      console.log("handleSetValues", { data });
      console.log("old values", selectedLayer.props);
      const hasChanges = Object.keys(data).some((key) => {
        console.log("key", key);
        const notEqual =
          JSON.stringify(data[key]) !==
          JSON.stringify(selectedLayer.props[key]);
        if (notEqual) {
          console.log(
            "not equal at:",
            key,
            data[key],
            selectedLayer.props[key]
          );
        }
        return notEqual;
      });

      if (hasChanges) {
        console.log("updating layer props", { data });
        updateLayerProps(selectedLayer.id, data);
        setValues(data);
      }
    }, [selectedLayer.id, updateLayerProps, setValues]);

    return (
      <AutoForm
        key={selectedLayer.id}
        values={values}
        onValuesChange={handleSetValues}
        formSchema={schema}
        // onSubmit={(data) => {
        //   console.log({ data });
        // }}
        // onValuesChange={(data) => {
        //   console.log("onValuesChange", { data });
        //   const hasChanges = Object.keys(data).some(
        //     (key) =>
        //       JSON.stringify(data[key as keyof typeof data]) !==
        //       JSON.stringify(selectedLayer.props[key])
        //   );

        //   if (hasChanges) {
        //     updateLayerProps(selectedLayer.id, data);
        //   }
        // }}
        fieldConfig={{
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
                  {isRequired && <span className="text-destructive"> *</span>}
                </FormLabel>
                <FormControl>
                  {/* <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  {...fieldProps}
                /> */}
                  <ChildrenSearchableMultiSelect
                    field={field}
                    selectedLayer={selectedLayer}
                    handleAddComponentLayer={handleAddComponentLayer}
                    handleAddTextLayer={handleAddTextLayer}
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
        }}
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



interface ChildrenInputProps {
  field: any;
  selectedLayer: ComponentLayer;
  handleAddComponentLayer: (
    componentName: keyof typeof componentRegistry
  ) => void;
  handleAddTextLayer: (text: string) => void;
  removeLayer: (id: string) => void;
}

function ChildrenSearchableMultiSelect({
  field,
  selectedLayer,
  handleAddComponentLayer,
  handleAddTextLayer,
  removeLayer,
}: ChildrenInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [textInputValue, setTextInputValue] = React.useState("");

  const options = React.useMemo(() => {
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

    return {
      groupedOptions,
      textOption: { value: "text", label: "Add as Text", type: "text" },
    };
  }, []);

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
              {Object.entries(options.groupedOptions).map(
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

      <div className="space-y-2">
        <span>Children: {selectedLayer.children?.length}</span>
        {selectedLayer.children?.map((child, index) => (
          <div
            key={typeof child === "string" ? index : child.id}
            className="flex items-center space-x-2"
          >
            <span>{typeof child === "string" ? `"${child}"` : child.type}</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                handleRemove(typeof child === "string" ? `${index}` : child.id)
              }
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

PropsPanel.displayName = "PropsPanel";

export default PropsPanel;
