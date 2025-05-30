import React, { ReactNode, useCallback, useMemo } from "react";

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
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { cn } from "@/lib/utils";

type AddComponentsPopoverProps = {
  className?: string;
  children: ReactNode;
  addPosition?: number;
  parentLayerId: string;
  onOpenChange?: (open: boolean) => void;
  onChange?: ({
    layerType,
    parentLayerId,
    addPosition,
  }: {
    layerType: string;
    parentLayerId: string;
    addPosition?: number;
  }) => void;
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

  const [inputValue, setInputValue] = React.useState("");

  const componentRegistry = useEditorStore((state) => state.registry);

  const groupedOptions = useMemo(() => {
    const componentOptions = Object.keys(componentRegistry).map((name) => ({
      value: name,
      label: name,
      type: "component",
      from: componentRegistry[name as keyof typeof componentRegistry].from,
    }));
    return componentOptions.reduce(
      (acc, option) => {
        const fromRoot = option.from?.split("/").slice(0, -1).join("/"); // removes file name from path

        const group = fromRoot || "other";
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(option);
        return acc;
      },
      {} as Record<string, typeof componentOptions>
    );
  }, [componentRegistry]);

  const addComponentLayer = useLayerStore((state) => state.addComponentLayer);

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      if (onChange) {
        onChange({ layerType: currentValue, parentLayerId, addPosition });
      } else if (
        componentRegistry[currentValue as keyof typeof componentRegistry]
      ) {
        addComponentLayer(
          currentValue as keyof typeof componentRegistry,
          parentLayerId,
          addPosition
        );
      }
      setOpen(false);
      onOpenChange?.(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      addComponentLayer,
      parentLayerId,
      addPosition,
      setOpen,
      onOpenChange,
      onChange,
    ]
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  const content = useMemo(() => {
    return Object.entries(groupedOptions).map(([group, components]) => (
      <CommandGroup key={group} heading={group}>
        {components.map((component) => (
          <GroupedComponentItem
            key={component.value}
            component={component}
            onClick={handleSelect}
          />
        ))}
      </CommandGroup>
    ));
  }, [groupedOptions, handleSelect]);

  return (
    <div className={cn("relative flex justify-center", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Add component"
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>No components found</CommandEmpty>
              <CommandSeparator />
              {content}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function GroupedComponentItem({
  component,
  onClick,
}: {
  component: { value: string; label: string };
  onClick: (value: string) => void;
}) {
  const handleSelect = useCallback(() => {
    onClick(component.value);
  }, [onClick, component.value]);

  return (
    <CommandItem key={component.value} onSelect={handleSelect}>
      {component.label}
    </CommandItem>
  );
}
