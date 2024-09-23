"use client";

import { useState } from "react";
import { ClipboardCopy } from "lucide-react";
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
  const { layers } = useComponentStore();
  console.log({ layers });

  const generateLayerCode = (layer: Layer, indent = 0): string => {
    if (isTextLayer(layer)) {
      if (layer.textType === "markdown") {
        const indentation = "  ".repeat(indent);
        // Wrap markdown with Markdown component
        return `${indentation}<Markdown>\n${layer.text
          .split("\n")
          .map((line) => `${indentation+"  "}${line}`)
          .join("\n")}\n${indentation}</Markdown>`;
      }
      const indentation = "  ".repeat(indent);
      return `${indentation}${layer.text}`;
    }

    const { type, props, children } = layer;

    let propsString = Object.entries(props)
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

    const indentation = "  ".repeat(indent);

    let childrenCode = "";
    if (children && children.length > 0) {
      childrenCode = children
        .map((child) => generateLayerCode(child, indent + 1))
        .join("\n");
    }

    if (childrenCode) {
      return `${indentation}<${type} ${propsString}>\n${childrenCode}\n${indentation}</${type}>`;
    } else {
      return `${indentation}<${type} ${propsString} />`;
    }
  };

  const generateComponentCode = () => {
    const imports = new Set<string>();

    const collectImports = (layer: Layer) => {
      if (isTextLayer(layer)) {
        if (layer.textType === "markdown") {
          imports.add(`import { Markdown } from "@/components/ui/ui-builder/markdown";`); 
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

  return (
    <div className="bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">UI Builder</h1>
        <CodeDialog codeBlocks={codeBlocks} />
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
        <Button>Save</Button>
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
