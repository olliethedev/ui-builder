import React, { ReactNode } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { componentRegistry } from "@/components/ui/ui-builder/internal/store/component-store";
import { cn } from "@/lib/utils";

type AddComponentsPopoverProps = {
  className?: string;
  handleAddComponent: (componentId: keyof typeof componentRegistry) => void;
  availableComponents: Array<keyof typeof componentRegistry>;
  children: ReactNode;
};

export function AddComponentsPopover({
  className,
  handleAddComponent,
  availableComponents = [],
  children,
}: AddComponentsPopoverProps) {
  const [open, setOpen] = React.useState(false);

  const handleComponentSelect = (
    componentId: keyof typeof componentRegistry
  ) => {
    handleAddComponent(componentId);
    setOpen(false);
  };
  return (
    <div className={cn("relative flex justify-center", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="center">
          <Command>
            <CommandInput placeholder="Search components..." />
            <CommandList>
              <CommandEmpty>No components found.</CommandEmpty>
              <CommandGroup>
                {availableComponents.map((component) => (
                  <CommandItem
                    key={component}
                    onSelect={() => handleComponentSelect(component)}
                  >
                    {component}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
