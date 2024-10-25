import React, { ReactNode } from "react";

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
import { componentRegistry, useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { cn } from "@/lib/utils";

type AddComponentsPopoverProps = {
  className?: string;
  children: ReactNode;
  addPosition?: number;
  parentLayerId: string;
  onOpenChange?: (open: boolean) => void;
  onChange?: ({ layerType, parentLayerId, addPosition }: { layerType: string, parentLayerId: string, addPosition?: number }) => void;
};

export function AddComponentsPopover({
  className,
  children,
  addPosition,
  parentLayerId,
  onOpenChange,
  onChange,
}: AddComponentsPopoverProps) {
  const [open, setOpen] = React.useState(false);

  const [inputValue, setInputValue] = React.useState("")
  

  const componentOptions = Object.keys(componentRegistry).map((name) => ({
    value: name,
    label: name,
    type: "component",
    from: componentRegistry[name as keyof typeof componentRegistry].from,
  }));

  const groupedOptions = componentOptions.reduce(
    (acc, option) => {
      const fromRoot = option.from?.split('/').slice(0,-1).join('/'); // removes file name from path
      
      const group = fromRoot || "other";
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
  } = useLayerStore((state) => ({
    addComponentLayer: state.addComponentLayer,
  }));

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      if (onChange) {
        onChange({ layerType: currentValue, parentLayerId, addPosition })
      } else if (componentRegistry[currentValue as keyof typeof componentRegistry]) {
        addComponentLayer(currentValue as keyof typeof componentRegistry, parentLayerId, addPosition)
      }
      setOpen(false);
      onOpenChange?.(false);
    },
    [addComponentLayer, parentLayerId, addPosition, setOpen, onOpenChange, onChange]
  );


  return (
    <div className={cn("relative flex justify-center", className)}>
      <Popover open={open} onOpenChange={(open) => {
        setOpen(open)
        onOpenChange?.(open)
      }}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Add component"
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>
                No components found
              </CommandEmpty>
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
