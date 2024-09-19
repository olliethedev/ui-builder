import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useComponentStore,
  componentRegistry,
  Layer,
  ComponentLayer,
} from "@/components/ui/ui-builder/store/component-store";
import { z } from "zod";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
// import { Badge } from "@/components/ui/badge";
import {
  PlusIcon,
  TrashIcon,
  X as XIcon,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        <DynamicPropsForm
          key={selectedLayer.id}
          selectedLayer={selectedLayer}
        />
      )}
    </div>
  );
};

const DynamicPropsForm = ({
  selectedLayer,
}: {
  selectedLayer: ComponentLayer;
}) => {
  console.log({ selectedLayer });
  const {
    updateLayerProps,
    addComponentLayer,
    addTextLayer,
    removeLayer,
    duplicateLayer,
  } = useComponentStore();

  const { schema } =
    componentRegistry[selectedLayer.type as keyof typeof componentRegistry];

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: selectedLayer.props,
  });

  // Watch all fields
  const watchedFields = form.watch();

  // Update layer props on change
  React.useEffect(() => {
    const hasChanges = Object.keys(watchedFields).some(
      (key) =>
        JSON.stringify(watchedFields[key]) !==
        JSON.stringify(selectedLayer.props[key])
    );

    if (hasChanges) {
      updateLayerProps(selectedLayer.id, watchedFields);
    }
  }, [watchedFields, selectedLayer.id, selectedLayer.props, updateLayerProps]);

  const handleAddComponentLayer = (
    componentName: keyof typeof componentRegistry
  ) => {
    addComponentLayer(componentName, selectedLayer.id);
  };

  const handleAddTextLayer = (text: string) => {
    addTextLayer(text, selectedLayer.id);
  };

  const getFieldType = (
    field: z.ZodTypeAny
  ): { fieldType: string; innerFieldType?: string } => {
    if (field instanceof z.ZodOptional) {
      return getFieldType(field._def.innerType);
    }
    if (field instanceof z.ZodDefault) {
      return getFieldType(field._def.innerType);
    }

    if (field instanceof z.ZodArray) {
      const innerType = getFieldType(field._def.type);
      return { fieldType: "ZodArray", innerFieldType: innerType.fieldType };
    }

    if (field instanceof z.ZodObject) {
      return { fieldType: "ZodObject" };
    }

    return { fieldType: field._def.typeName };
  };

  const getEnumValues = (field: z.ZodTypeAny): string[] => {
    if (field instanceof z.ZodDefault) {
      return getEnumValues(field._def.innerType);
    }
    return field instanceof z.ZodEnum ? field.options : [];
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleDeleteLayer = () => {
    removeLayer(selectedLayer.id);
  };

  const handleDuplicateLayer = () => {
    duplicateLayer(selectedLayer.id);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        {Object.entries(schema.shape).map(([key, schemaField]) => {
          const { fieldType, innerFieldType } = getFieldType(schemaField);
          console.log({ fieldType, innerFieldType });
          return (
            <FormField
              key={key}
              control={form.control}
              name={key}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{key}</FormLabel>
                  <FormControl>
                    {fieldType === "ZodArray" && key === "children" ? (
                      <ChildrenSearchableMultiSelect
                        field={field}
                        selectedLayer={selectedLayer}
                        handleAddComponentLayer={handleAddComponentLayer}
                        handleAddTextLayer={handleAddTextLayer}
                        removeLayer={removeLayer}
                      />
                    ) : fieldType === "ZodEnum" ? (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select ${key}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {getEnumValues(schemaField).map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : fieldType === "ZodBoolean" ? (
                      <input
                        type="checkbox"
                        {...field}
                        checked={field.value}
                        className="p-2 border rounded"
                      />
                    ) : fieldType === "ZodObject" ? (
                      <JsonInput
                        isArray={false}
                        field={field}
                        onChange={field.onChange}
                      />
                    ) : fieldType === "ZodArray" &&
                      innerFieldType === "ZodObject" ? (
                      <JsonInput
                        isArray={true}
                        field={field}
                        onChange={field.onChange}
                      />
                    ) : fieldType === "ZodArray" ? (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a component to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(componentRegistry).map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <input {...field} className="w-full p-2 border rounded" />
                    )}
                  </FormControl>
                </FormItem>
              )}
            />
          );
        })}
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
      </form>
    </Form>
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

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function JsonEditor({
  value,
  onChange,
}: {
  value: JsonValue;
  onChange: (value: JsonValue) => void;
}) {
  const [currentKey, setCurrentKey] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const addKeyValue = () => {
    if (currentKey && currentValue) {
      onChange({
        ...(value as Record<string, JsonValue>),
        [currentKey]: currentValue,
      });
      setCurrentKey("");
      setCurrentValue("");
    }
  };

  const updateKeyValue = (key: string, newValue: string) => {
    onChange({
      ...(value as Record<string, JsonValue>),
      [key]: newValue,
    });
    setEditingKey(null);
  };

  const removeKey = (key: string) => {
    const newValue = { ...(value as Record<string, JsonValue>) };
    delete newValue[key];
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Key"
          value={currentKey}
          onChange={(e) => setCurrentKey(e.target.value)}
        />
        <Input
          placeholder="Value"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
        />
        <Button onClick={addKeyValue}>Set</Button>
      </div>

      {Object.entries(value as Record<string, JsonValue>).map(([key, val]) => (
        <div key={key} className="flex items-center space-x-2">
          <span className="font-semibold">{key}:</span>
          {editingKey === key ? (
            <Input
              value={String(val)}
              onChange={(e) => updateKeyValue(key, e.target.value)}
              onBlur={() => setEditingKey(null)}
              autoFocus
            />
          ) : (
            <span onClick={() => setEditingKey(key)} className="cursor-pointer">
              {JSON.stringify(val)}
            </span>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => removeKey(key)}
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <Textarea
        readOnly
        value={JSON.stringify(value, null, 2)}
        rows={10}
        className="font-mono"
      />
    </div>
  );
}

function ArrayJsonEditor({
  value,
  onChange,
}: {
  value: JsonValue[];
  onChange: (value: JsonValue[]) => void;
}) {
  const addNewObject = () => {
    onChange([...value, {}]);
  };

  const removeObject = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateObject = (index: number, newValue: JsonValue) => {
    onChange(value.map((item, i) => (i === index ? newValue : item)));
  };

  return (
    <div className="space-y-6">
      <Button onClick={addNewObject}>Add New Object</Button>

      {value.map((item, index) => (
        <div key={index} className="border p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Object {index + 1}</h4>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => removeObject(index)}
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
          <JsonEditor
            value={item}
            onChange={(newValue) => updateObject(index, newValue)}
          />
        </div>
      ))}

      <Textarea
        readOnly
        value={JSON.stringify(value, null, 2)}
        rows={10}
        className="font-mono"
      />
    </div>
  );
}

function JsonInput({
  isArray,
  field,
  onChange,
}: {
  isArray: boolean;
  field: any;
  onChange: (value: JsonValue) => void;
}) {
  const [jsonData, setJsonData] = useState<JsonValue>(
    isArray ? field?.value ?? [] : field?.value ?? {}
  );

  useEffect(() => {
    onChange(jsonData);
  }, [jsonData, onChange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Label htmlFor="array-mode">
          {isArray ? "Array Mode" : "Object Mode"}
        </Label>
      </div>

      {isArray ? (
        <ArrayJsonEditor
          value={jsonData as JsonValue[]}
          onChange={setJsonData}
        />
      ) : (
        <JsonEditor value={jsonData} onChange={setJsonData} />
      )}
    </div>
  );
}

interface Option {
  value: string;
  label: string;
}

const initialOptions: Option[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

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

    const groupedOptions = componentOptions.reduce((acc, option) => {
      const group = option.from || "Other";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(option);
      return acc;
    }, {} as Record<string, typeof componentOptions>);

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
          handleAddComponentLayer(currentValue as keyof typeof componentRegistry);
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
