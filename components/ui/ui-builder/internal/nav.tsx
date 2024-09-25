"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardCopy, Redo, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layer,
  useComponentStore,
  isTextLayer,
  componentRegistry,
} from "@/components/ui/ui-builder/internal/store/component-store";

export function NavBar() {
  const { layers, } = useComponentStore();
  const { undo, redo, futureStates, pastStates } = useComponentStore.temporal.getState();
  console.log({ layers, futureStates: JSON.stringify(futureStates), pastStates: JSON.stringify(pastStates) });

  const canUndo = !!pastStates.length;
  const canRedo = !!futureStates.length;

  // Handle keyboard shortcuts for Undo and Redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;
      const key = event.key.toLowerCase(); 

  
      const isUndo = modifierKey && !event.shiftKey && key === 'z';
      const isRedo = modifierKey && event.shiftKey && key === 'z';
      
      if (isUndo) {
        event.preventDefault();
        if (canUndo) {
          undo();
        }
      } else if (isRedo) {
        event.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, undo, redo]);

  const generatePropsString = (props: Record<string, any>): string => {
    return Object.entries(props)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        let propValue;
        if (typeof value === "string") {
          propValue = `"${value}"`;
        } else if (typeof value === "number") {
          propValue = value;
        } else {
          propValue = `{${JSON.stringify(value)}}`;
        }
        return `${key}=${propValue}`;
      })
      .join(" ");
  };

  const generateLayerCode = (layer: Layer, indent = 0): string => {
    if (isTextLayer(layer)) {
      if (layer.textType === "markdown") {
        const indentation = "  ".repeat(indent);
        // Wrap markdown with Markdown component
        return `${indentation}<Markdown ${generatePropsString(
          layer.props
        )}>\n${layer.text
          .split("\n")
          .map((line) => `${indentation + "  "}${line}`)
          .join("\n")}\n${indentation}</Markdown>`;
      }
      const indentation = "  ".repeat(indent);
      return `${indentation}<span ${generatePropsString(layer.props)}>${layer.text}</span>`;
    }

    const { type, children } = layer;

    const indentation = "  ".repeat(indent);

    let childrenCode = "";
    if (children && children.length > 0) {
      childrenCode = children
        .map((child) => generateLayerCode(child, indent + 1))
        .join("\n");
    }

    if (childrenCode) {
      return `${indentation}<${type} ${generatePropsString(
        layer.props
      )}>\n${childrenCode}\n${indentation}</${type}>`;
    } else {
      return `${indentation}<${type} ${generatePropsString(layer.props)} />`;
    }
  };

  const generateComponentCode = () => {
    const imports = new Set<string>();

    const collectImports = (layer: Layer) => {
      if (isTextLayer(layer)) {
        if (layer.textType === "markdown") {
          imports.add(
            `import { Markdown } from "@/components/ui/ui-builder/markdown";`
          );
        }
      } else {
        const componentDefinition = componentRegistry[layer.type];
        if (layer.type && componentDefinition) {
          imports.add(
            `import { ${layer.type} } from "${componentDefinition.from}";`
          );
        }
        if (layer.children) {
          layer.children.forEach(collectImports);
        }
      }
    };

    layers.forEach(collectImports);

    const code = layers.map((layer) => generateLayerCode(layer)).join("\n");
    const importsString = Array.from(imports).join("\n");

    return `${importsString}\n\n${code}`;
  };

  const codeBlocks = {
    React: generateComponentCode(),
    Serialized: JSON.stringify(
      layers,
      (key, value) => (typeof value === "function" ? undefined : value),
      2
    ),
  };

   // Empty click handler for Undo
   const handleUndo = useCallback(() => {
    undo();
  }, []);

  // Empty click handler for Redo
  const handleRedo = useCallback(() => {
    redo();
  }, []);

  return (
    <div className="bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">UI Builder</h1>
        <div className="flex space-x-2">
          <Button onClick={handleUndo} variant="secondary" size="icon" disabled={!canUndo}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button onClick={handleRedo} variant="secondary" size="icon" disabled={!canRedo}>
            <Redo className="w-4 h-4" />
          </Button>
          <CodeDialog codeBlocks={codeBlocks} />
        </div>
      </header>
    </div>
  );
}

const CodeDialog = ({
  codeBlocks,
}: {
  codeBlocks: Record<"React" | "Serialized", string>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button>Export</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[625px]">
        <DialogHeader>
          <DialogTitle>Generated Code</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="react" className="w-full overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="React">React</TabsTrigger>
            <TabsTrigger value="Serialized">Serialized</TabsTrigger>
          </TabsList>
          {Object.entries(codeBlocks).map(([lang, code]) => (
            <TabsContent key={lang} value={lang} className="mt-4">
              <div className="relative">
                <div className="overflow-x-auto max-h-[400px] w-full">
                  <pre className="rounded-md bg-muted p-4 whitespace-pre inline-block min-w-full">
                    <code>{code}</code>
                  </pre>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(code)}
                >
                  <ClipboardCopy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
