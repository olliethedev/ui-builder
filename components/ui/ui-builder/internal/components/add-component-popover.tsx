import React, { type ReactNode, useCallback, useMemo, memo, Suspense, useState, useEffect, useRef } from "react";

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
import type { ComponentLayer, ComponentRegistry, BlockDefinition } from "@/components/ui/ui-builder/types";
import { createComponentLayer } from "@/lib/ui-builder/store/layer-utils";
import { DraggableNewComponent } from "@/components/ui/ui-builder/internal/dnd/draggable-new-component";

const fallback = <div className="w-full h-full bg-muted rounded border animate-pulse" />;

// Cache for preview layers to avoid recreation
const previewLayerCache = new Map<string, ComponentLayer>();

/**
 * Check if a component can be added as a child of the given parent type.
 * A component is valid if:
 * - It has no `childOf` constraint (can be added anywhere)
 * - OR its `childOf` array includes the parent type
 */
function isValidChildOfParent(
  componentRegistry: ComponentRegistry,
  componentType: string,
  parentType: string | undefined
): boolean {
  const def = componentRegistry[componentType];
  if (!def?.childOf) {
    // No constraint - can be added anywhere
    return true;
  }
  if (!parentType) {
    // Component has childOf but no parent type provided - hide it
    return false;
  }
  return def.childOf.includes(parentType);
}

/**
 * Check if a component requires a parent context to render properly.
 * Components with childOf defined are child-only components.
 */
function isChildOnlyComponent(
  componentRegistry: ComponentRegistry,
  componentType: string
): boolean {
  const def = componentRegistry[componentType];
  return Boolean(def?.childOf);
}

type AddComponentsPopoverProps = {
  className?: string;
  children: ReactNode;
  addPosition?: number;
  parentLayerId: string;
  onOpenChange?: (open: boolean) => void;
  /** 
   * Enable drag handles on component items. 
   * When true, items can be dragged to the canvas.
   * Default: false (for tree panel usage)
   */
  enableDragToCanvas?: boolean;
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
  enableDragToCanvas = false,
  onChange,
}: AddComponentsPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [activeView, setActiveView] = React.useState<"components" | "blocks">("components");

  const componentRegistry = useEditorStore((state) => state.registry);
  const blocks = useEditorStore((state) => state.blocks);
  const findLayerById = useLayerStore((state) => state.findLayerById);

  // Get the parent layer type to filter valid child components
  const parentLayerType = useMemo(() => {
    const parentLayer = findLayerById(parentLayerId);
    return parentLayer?.type;
  }, [findLayerById, parentLayerId]);

  const groupedOptions = useMemo(() => {
    const componentOptions = Object.keys(componentRegistry)
      // Filter to only show components that are valid children of the parent
      .filter((name) => isValidChildOfParent(componentRegistry, name, parentLayerType))
      .map((name) => ({
        value: name,
        label: name,
        type: "component",
        from: componentRegistry[name as keyof typeof componentRegistry]?.from,
      }));
    return componentOptions.reduce(
      (acc, option) => {
        const fromRoot = option.from?.split("/").slice(0, -1).join("/"); // removes file name from path

        const group = fromRoot || "other";
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group]?.push(option);
        return acc;
      },
      {} as Record<string, typeof componentOptions>
    );
  }, [componentRegistry, parentLayerType]);

  // Get categories for tabs
  const categories = useMemo(() => {
    return Object.keys(groupedOptions);
  }, [groupedOptions]);

  // Group blocks by category
  const groupedBlocks = useMemo(() => {
    if (!blocks) return {};
    return Object.values(blocks).reduce<Record<string, BlockDefinition[]>>(
      (acc, block: BlockDefinition) => {
        if (!acc[block.category]) {
          acc[block.category] = [];
        }
        acc[block.category]?.push(block);
        return acc;
      },
      {}
    );
  }, [blocks]);

  const blockCategories = useMemo(() => {
    return Object.keys(groupedBlocks);
  }, [groupedBlocks]);

  const hasBlocks = blocks && Object.keys(blocks).length > 0;

  const addComponentLayer = useLayerStore((state) => state.addComponentLayer);
  const addLayerDirect = useLayerStore((state) => state.addLayerDirect);

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

  const handleBlockSelect = React.useCallback(
    (block: BlockDefinition) => {
      // Clone the template with new unique IDs
      const clonedTemplate = cloneLayerWithNewIds(block.template);
      addLayerDirect(clonedTemplate, parentLayerId, addPosition);
      setOpen(false);
      onOpenChange?.(false);
    },
    [addLayerDirect, parentLayerId, addPosition, onOpenChange]
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  // Close popover when drag starts
  const handleDragStart = useCallback(() => {
    setOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const defaultTab = categories[0] || "";
  const defaultBlockCategory = blockCategories[0] || "";

  return (
    <div className={cn("relative flex justify-center", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          {/* Top-level toggle between Components and Blocks */}
          {hasBlocks && (
            <div className="flex border-b">
              <button
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                  activeView === "components" 
                    ? "bg-background border-b-2 border-primary" 
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveView("components")}
              >
                Components
              </button>
              <button
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                  activeView === "blocks" 
                    ? "bg-background border-b-2 border-primary" 
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveView("blocks")}
              >
                Blocks
              </button>
            </div>
          )}

          {/* Components View */}
          {activeView === "components" && categories.length > 0 ? (
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className={cn(categories.length > 1 ? "h-14 w-full rounded-none border-b flex flex-row overflow-x-scroll justify-start": "hidden")}>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="flex flex-col justify-start items-start overflow-hidden px-2 py-1 min-w-24 min-h-11 shrink-0">
                    <div className="text-sm">{formatCategoryName(category)}</div>
                    <div className="w-full min-h-[12px] text-[8px] leading-[9px] text-left text-muted-foreground text-wrap">{category}</div>
                    
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category} value={category} className="m-0">
                  <Command className="border-0">
                    <div className="flex items-center px-3 w-full [&>div:first-child]:w-full">
                      <CommandInput 
                        placeholder="Find components" 
                        className="border-0 focus:ring-0 w-full" 
                      />
                    </div>
                    <CommandList className="max-h-[250px]">
                      <CommandEmpty>No components found</CommandEmpty>
                      <CommandGroup>
                        {groupedOptions[category]?.map((component) => (
                          <GroupedComponentItem
                            key={component.value}
                            component={component}
                            onClick={handleSelect}
                            onDragStart={handleDragStart}
                            enableDrag={enableDragToCanvas}
                          />
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </TabsContent>
              ))}
            </Tabs>
          ) : activeView === "components" ? (
            <Command>
              <CommandInput placeholder="Add component" />
              <CommandList>
                <CommandEmpty>No components found</CommandEmpty>
              </CommandList>
            </Command>
          ) : null}

          {/* Blocks View */}
          {activeView === "blocks" && hasBlocks && (
            <Tabs defaultValue={defaultBlockCategory} className="w-full">
              <TabsList className="h-14 w-full rounded-none border-b flex flex-row overflow-x-scroll justify-start">
                {blockCategories.map((category) => (
                  <TabsTrigger key={category} value={category} className="flex flex-col justify-start items-start overflow-hidden px-2 py-1 min-w-24 min-h-11 shrink-0">
                    <div className="text-sm">{formatCategoryName(category)}</div>
                    <div className="w-full min-h-[12px] text-[8px] leading-[9px] text-left text-muted-foreground">
                      {groupedBlocks[category]?.length} blocks
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {blockCategories.map((category) => (
                <TabsContent key={category} value={category} className="m-0">
                  <Command className="border-0">
                    <div className="flex items-center px-3 w-full [&>div:first-child]:w-full">
                      <CommandInput 
                        placeholder="Find blocks" 
                        className="border-0 focus:ring-0 w-full" 
                      />
                    </div>
                    <CommandList className="max-h-[250px]">
                      <CommandEmpty>No blocks found</CommandEmpty>
                      <CommandGroup>
                        {groupedBlocks[category]?.map((block) => (
                          <BlockItem
                            key={block.name}
                            block={block}
                            onClick={handleBlockSelect}
                          />
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Clone a layer tree with new unique IDs
 */
function cloneLayerWithNewIds(layer: ComponentLayer): ComponentLayer {
  const newId = generateUniqueId();
  
  let newChildren: ComponentLayer["children"];
  
  if (Array.isArray(layer.children)) {
    newChildren = layer.children.map(child => cloneLayerWithNewIds(child));
  } else if (typeof layer.children === "string") {
    newChildren = layer.children;
  } else if (layer.children && typeof layer.children === "object" && "__variableRef" in layer.children) {
    // Handle VariableReference - keep as-is
    newChildren = layer.children;
  } else {
    newChildren = layer.children;
  }
  
  return {
    ...layer,
    id: newId,
    children: newChildren,
  };
}

/**
 * Generate a simple unique ID
 */
function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Block item component for the blocks list
 */
const BlockItem = memo(({
  block,
  onClick,
}: {
  block: BlockDefinition;
  onClick: (block: BlockDefinition) => void;
}) => {
  const handleSelect = useCallback(() => {
    onClick(block);
  }, [onClick, block]);

  return (
    <CommandItem 
      onSelect={handleSelect}
      className="cursor-pointer flex flex-col items-start gap-1 py-3"
    >
      <div className="font-medium">{formatBlockName(block.name)}</div>
      {block.description && (
        <div className="text-xs text-muted-foreground line-clamp-2">
          {block.description}
        </div>
      )}
    </CommandItem>
  );
});

BlockItem.displayName = "BlockItem";

/**
 * Format block name for display (e.g., "login-01" -> "Login 01")
 */
function formatBlockName(name: string): string {
  return name
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const GroupedComponentItem = memo(({
  component,
  onClick,
  onDragStart,
  enableDrag = false,
}: {
  component: { value: string; label: string };
  onClick: (value: string) => void;
  onDragStart?: () => void;
  enableDrag?: boolean;
}) => {
  const handleSelect = useCallback(() => {
    onClick(component.value);
  }, [onClick, component.value]);

  const componentRegistry = useEditorStore((state) => state.registry);

  const content = (
    <div className="flex items-center gap-3">
      {/* Component preview */}
      <div className="shrink-0 w-10 h-6 overflow-hidden">
        <LazyComponentPreview 
          componentType={component.value}
          componentRegistry={componentRegistry}
        />
      </div>
      <div className="flex items-center flex-1 min-w-0">
        <span className="truncate">{component.label}</span>
      </div>
    </div>
  );

  return (
    <CommandItem 
      key={component.value} 
      onSelect={handleSelect}
      className="cursor-pointer flex items-center gap-2 py-2"
    >
      {enableDrag ? (
        <DraggableNewComponent
          componentType={component.value}
          onDragStart={onDragStart}
          className="flex-1"
        >
          {content}
        </DraggableNewComponent>
      ) : (
        <div className="flex-1">
          {content}
        </div>
      )}
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

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // Delay loading slightly to improve tab switching performance
          timeoutId = setTimeout(() => setShouldLoad(true), 50);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
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

/**
 * Placeholder for child-only components that can't render without parent context
 */
const ChildOnlyPlaceholder = memo(({ componentType }: { componentType: string }) => {
  // Get first letter or first two letters for better recognition
  const initials = componentType
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="w-full h-full bg-muted/50 rounded border border-dashed flex items-center justify-center">
      <span className="text-[8px] font-medium text-muted-foreground">{initials}</span>
    </div>
  );
});

ChildOnlyPlaceholder.displayName = "ChildOnlyPlaceholder";

const ComponentPreview = memo(({
  componentType,
  componentRegistry,
}: {
  componentType: string;
  componentRegistry: ComponentRegistry;
}) => {
  const isChildOnly = isChildOnlyComponent(componentRegistry, componentType);

  // useMemo must be called unconditionally to follow React's Rules of Hooks
  const previewLayer = useMemo(() => {
    // Skip creating layer for child-only components
    if (isChildOnly) {
      return null;
    }

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
  }, [componentType, componentRegistry, isChildOnly]);

  // Render child-only placeholder after hooks are called
  if (isChildOnly) {
    return <ChildOnlyPlaceholder componentType={componentType} />;
  }

  if (!previewLayer) {
    return <div className="w-full h-full bg-muted rounded border" />;
  }

  const style = { width: '200%', height: '200%' } as const;

  return (
    <div 
      className="w-full h-full bg-background rounded border overflow-hidden transform scale-50 origin-top-left pointer-events-none" 
      style={style}
      // inert prevents all interactions and stops internal components (like poppers)
      // from attaching scroll listeners that interfere with parent scroll
      inert={true}
    >
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
  return lastWord?.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase()) ?? "";
}
