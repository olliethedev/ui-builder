import React, { ReactNode, useState } from "react";
import { Layer, useComponentStore, isTextLayer } from "@/components/ui/ui-builder/internal/store/component-store";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { hasChildren as layerHasChildren } from "./store/layer-utils";
import { Button } from "../../button";

interface LayersPanelProps {
  className?: string;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ className }) => {
  const {
    selectedPageId,
    findLayersForPageId,
    selectLayer,
    selectedLayerId,
  } = useComponentStore();

  const layers = findLayersForPageId(selectedPageId);

  

  return (
    <div className={cn(className, "flex flex-col flex-shrink-0")}>
      {layers.map((layer: Layer) => (
        <LayerItem key={layer.id} layer={layer} />
      ))}
    </div>
  );
};


const LayerItem: React.FC<{ layer: Layer; depth?: number }> = ({
  layer,
  depth = 0,
}) => {

  const {
    selectLayer,
    selectedLayerId,
  } = useComponentStore();

  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = layerHasChildren(layer) && layer.children.length > 0;

  return (
    <div key={layer.id} className="min-w-20" style={{ marginLeft: depth === 0 ? "0px" : "20px" }}>
      <div className="flex items-center">
        {hasChildren && (
          <Button
            variant="link"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="size-[20px] focus:outline-none"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            selectLayer(layer.id);
          }}
          className={cn(
            "text-left mb-1 w-full p-1 rounded justify-start",
            layer.id === selectedLayerId
              ? "text-accent-foreground"
              : "text-muted-foreground  hover:text-accent-foreground"
          )}
        >
          {isTextLayer(layer) ? "Text" : layer.type}
        </Button>
      </div>
      {hasChildren && (
        <Collapse open={isOpen}>
          {layer.children!.map((child) => (
            <LayerItem key={child.id} layer={child} depth={depth + 1} />
          ))}
        </Collapse>
      )}
    </div>
  );
};

interface CollapseProps {
  open: boolean;
  children: ReactNode;
}

const Collapse = ({ open, children }: CollapseProps) => {
  return (
    <div
      className={`overflow-hidden transition-all duration-100 ease-in-out ${
        open ? "max-h-96" : "max-h-0"
      }`}
    >
      {children}
    </div>
  );
};


export default LayersPanel;