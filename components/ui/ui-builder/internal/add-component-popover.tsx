import React, { ReactNode, useCallback } from "react";

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
import { componentRegistry, useComponentStore } from "@/components/ui/ui-builder/internal/store/component-store";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AddComponentsPopoverProps = {
  className?: string;
  children: ReactNode;
  addPosition?: number;
  parentLayerId?: string;
};

export function AddComponentsPopover({
  className,
  children,
  addPosition,
  parentLayerId,
}: AddComponentsPopoverProps) {
  const [open, setOpen] = React.useState(false);

  const [textInputValue, setTextInputValue] = React.useState("");

  const [inputValue, setInputValue] = React.useState("")
  

  const componentOptions = Object.keys(componentRegistry).map((name) => ({
    value: name,
    label: name,
    type: "component",
    from: componentRegistry[name as keyof typeof componentRegistry].from,
  }));

  const groupedOptions = componentOptions.reduce(
    (acc, option) => {
      const fromRoot = option.from.split('/').slice(0,-1).join('/'); // removes file name from path
      
      const group = fromRoot || "Other";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(option);
      return acc;
    },
    {} as Record<string, typeof componentOptions>
  );

  const {
    addComponentLayer,
    addTextLayer,
    findLayerById
  } = useComponentStore();


  const handleAddComponentLayer = useCallback(
    (componentName: keyof typeof componentRegistry) => {
      addComponentLayer(componentName, parentLayerId, addPosition);
    },
    [parentLayerId, addComponentLayer, addPosition]
  );

  const handleAddTextLayer = useCallback(
    (text: string, textType: "text" | "markdown") => {
      addTextLayer(text, textType, parentLayerId, addPosition);
    },
    [parentLayerId, addTextLayer, addPosition]
  );

  const textInputForm = (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        handleAddTextLayer(textInputValue, "text");
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
              handleAddTextLayer(textInputValue, "text");
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

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      if (currentValue === "text" && inputValue.trim()) {
        handleAddTextLayer(inputValue.trim(), "text");
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


  return (
    <div className={cn("relative flex justify-center", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {children}
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
              {Object.entries(groupedOptions).map(([group, components]) => (
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
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
