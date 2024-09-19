import React, {
  ErrorInfo,
  ReactNode,
  Component as ReactComponent,
  Suspense,
} from "react";
import { PlusCircle } from "lucide-react";
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

interface PreviewPanelProps {
  className?: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ className }) => {
  const { layers, selectLayer, addComponentLayer, selectedLayer } = useComponentStore();


  const onAddElement = (componentName: keyof typeof componentRegistry) => {
    addComponentLayer(componentName);
  };

  const onSelectElement = (layerId: string) => {
    selectLayer(layerId);
  };

  const renderLayer = (layer: Layer) => {
    if (isTextLayer(layer)) {
      return <span key={layer.id}>{layer.text}</span>;
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
            {...childProps}
            className={`${isSelected ? 'ring-2 ring-blue-500 ring-offset-0' : ''} ${
              childProps.className || ""
            }`}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onSelectElement(layer.id);
            }}
            onMouseDown={(e: React.MouseEvent) => {
              if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                e.preventDefault();
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
      
      <div className="border p-4">
        {layers.map(renderLayer)}
        <DividerControl
          onComponentSelect={onAddElement}
          availableComponents={
            Object.keys(componentRegistry) as Array<
              keyof typeof componentRegistry
            >
          }
        />
      </div>
    </div>
  );
};

export default PreviewPanel;

type DividerControlProps = {
  onComponentSelect: (componentId: keyof typeof componentRegistry) => void;
  availableComponents: Array<keyof typeof componentRegistry>;
};

function DividerControl({
  onComponentSelect,
  availableComponents = [],
}: DividerControlProps) {
  const [open, setOpen] = React.useState(false);

  const handleComponentSelect = (
    componentId: keyof typeof componentRegistry
  ) => {
    onComponentSelect(componentId);
    setOpen(false);
  };

  return (
    <div className="relative py-0">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300 border-dashed" />
      </div>
      <div className="relative flex justify-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
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
          </PopoverTrigger>
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
