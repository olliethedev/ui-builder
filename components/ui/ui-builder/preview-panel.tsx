import React, {
  ErrorInfo,
  ReactNode,
  Component as ReactComponent,
  Suspense,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { PlusCircle, ChevronRight, Plus, Trash, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  componentRegistry,
  isTextLayer,
  Layer,
  useComponentStore,
} from "@/components/ui/ui-builder/store/component-store";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
  className?: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ className }) => {
  const {
    layers,
    selectLayer,
    addComponentLayer,
    selectedLayer,
    duplicateLayer,
    removeLayer,
  } = useComponentStore();
  console.log("PreviewPanel", { selectedLayer });
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onAddElement = (
    componentName: keyof typeof componentRegistry,
    parentId?: string,
    parentPosition?: number
  ) => {
    addComponentLayer(componentName, parentId, parentPosition);
  };

  const onSelectElement = (layerId: string, event: React.MouseEvent) => {
    selectLayer(layerId);
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
    setIsMenuOpen(true);
  };

  const handleDeleteLayer = () => {
    if (selectedLayer) {
      removeLayer(selectedLayer.id);
    }
  };

  const handleDuplicateLayer = () => {
    if (selectedLayer) {
      duplicateLayer(selectedLayer.id);
    }
  };

  // Update menu position when selectedLayer changes
  useLayoutEffect(() => {
    if (selectedLayer && !isTextLayer(selectedLayer) && containerRef.current) {
      const element = containerRef.current.querySelector<HTMLElement>(
        `[data-layer-id="${selectedLayer.id}"]`
      );
      if (element) {
        const rect = element.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        setMenuPosition({
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        });
        setIsMenuOpen(true);
      }
    } else {
      setIsMenuOpen(false);
    }
  }, [selectedLayer]);

  const renderLayer = (layer: Layer) => {
    if (isTextLayer(layer)) {
      return (
        <span key={layer.id} data-layer-id={layer.id}>
          {layer.text}
        </span>
      );
    }

    const { component: Component } =
      componentRegistry[layer.type as keyof typeof componentRegistry];
    if (!Component) return null;

    const childProps = { ...layer.props };
    if (layer.children && layer.children.length > 0) {
      childProps.children = layer.children.map(renderLayer);
    }

    const isSelected = layer.id === selectedLayer?.id;

    return (
      <ErrorBoundary key={layer.id}>
        <Suspense key={layer.id} fallback={<div>Loading...</div>}>
          <Component
            {...(childProps as any)}
            className={`${
              isSelected
                ? "border-2 border-blue-500"
                : " hover:ring-1 hover:ring-blue-300 hover:ring-offset-0" //ring-2 ring-blue-500 ring-offset-0
            } ${childProps.className || ""}`}
            data-layer-id={layer.id}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("selectedLayer", selectedLayer);
              onSelectElement(layer.id, e);
            }}
            // onClickCapture={(e: React.MouseEvent) => {
            //   // Prevent click events from reaching child elements
            //   e.stopPropagation();
            //   e.preventDefault();
            //   onSelectElement(layer.id, e);
            // }}
            onMouseDown={(e: React.MouseEvent) => {
              if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
              ) {
              }
            }}
          >
            {childProps.children}
          </Component>
        </Suspense>
      </ErrorBoundary>
    );
  };

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">Preview</h2>

      <div className="border p-4 relative" ref={containerRef}>
        <DividerControl
          handleAddComponent={(elem) => onAddElement(elem, undefined, 0)}
          availableComponents={
            Object.keys(componentRegistry) as Array<
              keyof typeof componentRegistry
            >
          }
        />
        <div className="flex flex-col w-min max-w-full">
          {layers.map(renderLayer)}
        </div>
        <DividerControl
          handleAddComponent={(elem) => onAddElement(elem)}
          availableComponents={
            Object.keys(componentRegistry) as Array<
              keyof typeof componentRegistry
            >
          }
        />
        {isMenuOpen && menuPosition && selectedLayer && (
          <LayerMenu
            x={menuPosition.x}
            y={menuPosition.y}
            width={menuPosition.width}
            height={menuPosition.height}
            handleAddComponent={(elem) => onAddElement(elem, selectedLayer.id)}
            handleDuplicateComponent={handleDuplicateLayer}
            handleDeleteComponent={handleDeleteLayer}
            availableComponents={
              Object.keys(componentRegistry) as Array<
                keyof typeof componentRegistry
              >
            }
          />
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;

// Menu component that appears at the top-left corner of a selected layer
interface MenuProps {
  x: number;
  y: number;
  width: number;
  height: number;
  handleAddComponent: (componentName: keyof typeof componentRegistry) => void;
  handleDuplicateComponent: () => void;
  handleDeleteComponent: () => void;
  availableComponents: Array<keyof typeof componentRegistry>;
}

const LayerMenu: React.FC<MenuProps> = ({
  x,
  y,
  width,
  height,
  handleAddComponent,
  handleDuplicateComponent,
  handleDeleteComponent,
  availableComponents,
}) => {
  return (
    <div
      className="absolute"
      style={{
        top: y + height - 2,
        left: x - 3,
        zIndex: 1000,
      }}
    >
      <span className="h-5 group flex items-center rounded-bl-full rounded-r-full bg-white/90 p-0 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50/95 hover:h-10 transition-all duration-200 ease-in-out overflow-hidden cursor-pointer hover:cursor-auto">
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:size-8 transition-all duration-200 ease-in-out group-hover:opacity-30" />
        <span className="sr-only">Add component</span>
        <div className="overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-200 ease-in-out">
          <AddComponentsPopover
            className="flex-shrink w-min inline-flex"
            handleAddComponent={handleAddComponent}
            availableComponents={availableComponents}
          >
            <Button size="sm" variant="ghost">
              <span className="sr-only">Duplicate</span>
              <Plus className="h-5 w-5 text-gray-400" />
            </Button>
          </AddComponentsPopover>
          <Button size="sm" variant="ghost" onClick={handleDuplicateComponent}>
            <span className="sr-only">Duplicate</span>
            <Copy className="h-5 w-5 text-gray-400" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDeleteComponent}>
            <span className="sr-only">Delete</span>
            <Trash className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
      </span>
    </div>
  );
};

type DividerControlProps = {
  className?: string;
  handleAddComponent: (componentId: keyof typeof componentRegistry) => void;
  availableComponents: Array<keyof typeof componentRegistry>;
};

function DividerControl({
  handleAddComponent,
  availableComponents = [],
}: DividerControlProps) {
  return (
    <div className="relative py-0">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300 border-dashed" />
      </div>
      <AddComponentsPopover
        handleAddComponent={handleAddComponent}
        availableComponents={availableComponents}
      >
        <Button
          variant="outline"
          className="group flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-200 ease-in-out"
        >
          <PlusCircle className="h-5 w-5 text-gray-400" />
          <span className="sr-only">Add component</span>
          <span className="overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-200 ease-in-out group-hover:pl-2">
            Add component
          </span>
        </Button>
      </AddComponentsPopover>
    </div>
  );
}

function AddComponentsPopover({
  className,
  handleAddComponent,
  availableComponents = [],
  children,
}: DividerControlProps & { children: ReactNode }) {
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

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends ReactComponent<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (process.env.NODE_ENV === "production") {
        return null;
      }

      return (
        <div className="p-4 border border-red-500 bg-red-100 text-red-700 rounded">
          <h3 className="font-bold mb-2">Component Error</h3>
          <p>Error: {this.state.error?.message || "Unknown error"}</p>
          <details className="mt-2">
            <summary className="cursor-pointer">Stack trace</summary>
            <pre className="mt-2 text-xs whitespace-pre-wrap">
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
