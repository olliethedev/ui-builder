import React, { ReactNode, useCallback, useMemo, memo, Suspense, useState, useEffect, useRef } from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { cn } from "@/lib/utils";
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { ComponentLayer, ComponentRegistry } from "@/components/ui/ui-builder/types";
import { createComponentLayer } from "@/lib/ui-builder/store/layer-utils";

const fallback = <div className="w-full h-full bg-muted rounded border animate-pulse" />;

// Cache for preview layers to avoid recreation
const previewLayerCache = new Map<string, ComponentLayer>();

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

  // Get categories for tabs
  const categories = useMemo(() => {
    return Object.keys(groupedOptions);
  }, [groupedOptions]);

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

  const defaultTab = categories[0] || "";

  return (
    <div className={cn("relative flex justify-center", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          {categories.length > 0 ? (
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className={cn(categories.length > 1 ? "h-14 w-full rounded-none border-b flex flex-row overflow-x-scroll justify-start": "hidden")}>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="flex flex-col justify-start items-start overflow-hidden px-2 py-1 min-w-24 min-h-11 flex-shrink-0">
                    <div className="text-sm">{formatCategoryName(category)}</div>
                    <div className="w-full min-h-[12px] text-[8px] leading-[9px] text-left text-muted-foreground text-wrap">{category}</div>
                    
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category} value={category} className="m-0">
                  <Command className="border-0">
                    <div className="flex items-center px-3 w-full [&>div:first-child]:w-full">
                      {/* <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" /> */}
                      <CommandInput 
                        placeholder="Find components" 
                        className="border-0 focus:ring-0 w-full" 
                      />
                    </div>
                    <CommandList className="max-h-[250px]">
                      <CommandEmpty>No components found</CommandEmpty>
                      <CommandGroup>
                        {groupedOptions[category].map((component) => (
                          <GroupedComponentItem
                            key={component.value}
                            component={component}
                            onClick={handleSelect}
                          />
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Command>
              <CommandInput placeholder="Add component" />
              <CommandList>
                <CommandEmpty>No components found</CommandEmpty>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

const GroupedComponentItem = memo(({
  component,
  onClick,
}: {
  component: { value: string; label: string };
  onClick: (value: string) => void;
}) => {
  const handleSelect = useCallback(() => {
    onClick(component.value);
  }, [onClick, component.value]);

  const componentRegistry = useEditorStore((state) => state.registry);

  return (
    <CommandItem 
      key={component.value} 
      onSelect={handleSelect}
      className="cursor-pointer flex items-center gap-3 py-3"
    >
      {/* Component preview */}
      <div className="flex-shrink-0 w-10 h-8 overflow-hidden">
        <LazyComponentPreview 
          componentType={component.value}
          componentRegistry={componentRegistry}
        />
      </div>
      <div className="flex items-center flex-1 min-w-0">
        <span className="truncate">{component.label}</span>
      </div>
    </CommandItem>
  );
});

GroupedComponentItem.displayName = "GroupedComponentItem";

const LazyComponentPreview = memo(({
  componentType,
  componentRegistry,
}: {
  componentType: string;
  componentRegistry: ComponentRegistry;
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay loading slightly to improve tab switching performance
          setTimeout(() => setShouldLoad(true), 50);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full h-full">
      {shouldLoad ? (
        <Suspense fallback={fallback}>
          <ComponentPreview 
            componentType={componentType}
            componentRegistry={componentRegistry}
          />
        </Suspense>
      ) : (
        <div className="w-full h-full bg-muted rounded border" />
      )}
    </div>
  );
});

LazyComponentPreview.displayName = "LazyComponentPreview";

/* istanbul ignore next */

const ComponentPreview = memo(({
  componentType,
  componentRegistry,
}: {
  componentType: string;
  componentRegistry: ComponentRegistry;
}) => {
  const style = { width: '200%', height: '200%' } as const;

  const previewLayer = useMemo(() => {
    // Check cache first
    const cacheKey = `${componentType}-${JSON.stringify(componentRegistry[componentType as keyof typeof componentRegistry]?.schema)}`;
    if (previewLayerCache.has(cacheKey)) {
      return previewLayerCache.get(cacheKey)!;
    }

    try {
      // Use the utility function to create the preview layer
      const layer = createComponentLayer(componentType, componentRegistry, {
        id: `preview-${componentType}`, // Use stable ID for previews
      });

      // Cache the layer
      previewLayerCache.set(cacheKey, layer);
      return layer;
    } catch (error) {
      console.warn(`Failed to create preview for component ${componentType}:`, error);
      return null;
    }
  }, [componentType, componentRegistry]);

  if (!previewLayer) {
    return <div className="w-full h-full bg-muted rounded border" />;
  }

  return (
    <div className="w-full h-full bg-background rounded border overflow-hidden transform scale-50 origin-top-left" 
         style={style}>
      <LayerRenderer
        page={previewLayer}
        componentRegistry={componentRegistry}
        className="pointer-events-none"
      />
    </div>
  );
});

ComponentPreview.displayName = "ComponentPreview";

// @components/ui/ui-builder becomes Components UI Builder
function formatCategoryName(name: string) {
  const words = name.split("/");
  const lastWord = words[words.length - 1];
  return lastWord.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}
