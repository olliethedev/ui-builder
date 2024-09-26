"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, FileUp, Redo, Undo, SunIcon, MoonIcon, CheckIcon } from "lucide-react";
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
  isPageLayer,
} from "@/components/ui/ui-builder/internal/store/component-store";
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { CodeBlock } from "@/components/ui/ui-builder/codeblock";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavBar() {
  const { pages, selectedPageId, findLayersForPageId } = useComponentStore();
  const { undo, redo, futureStates, pastStates } =
    useComponentStore.temporal.getState();

  const layers = findLayersForPageId(selectedPageId);
  console.log({
    layers,
    futureStates: JSON.stringify(futureStates),
    pastStates: JSON.stringify(pastStates),
  });

  const canUndo = !!pastStates.length;
  const canRedo = !!futureStates.length;

  // Handle keyboard shortcuts for Undo and Redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;
      const key = event.key.toLowerCase();

      const isUndo = modifierKey && !event.shiftKey && key === "z";
      const isRedo = modifierKey && event.shiftKey && key === "z";

      const isSpin = modifierKey && event.shiftKey && key === "9";
      const isStopSpin = modifierKey && event.shiftKey && key === "0";

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
      } else if (isSpin) {
        event.preventDefault();
        const elements = document.querySelectorAll('*');
        elements.forEach((element) => {
          element.classList.add('animate-spin', 'origin-center');
        });
      } else if (isStopSpin) {
        event.preventDefault();
        const elements = document.querySelectorAll('*');
        elements.forEach((element) => {
          element.classList.remove('animate-spin', 'origin-center');
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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
        )}>{${JSON.stringify(layer.text)}}</Markdown>`;
      }
      const indentation = "  ".repeat(indent);
      return `${indentation}<span ${generatePropsString(layer.props)}>{${JSON.stringify(layer.text)}}</span>`;
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
      } else if (isPageLayer(layer)) {
        imports.add(
          `import { Page } from "@/components/ui/ui-builder/theme-wrapper";`
        );
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

    const reactComponentTemplate = (imports: string, children: string) => {
      return `
import React from "react";\n
${imports}\n
const Component = () => {
  return (
    <>
${children.split("\n").map((line) => `      ${line}`).join("\n")}
    </>
  );
};\n`;
    };

    return reactComponentTemplate(importsString, code);
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
      <div className="flex items-center justify-between px-6 py-4 border-b h-full">
        <h1 className="text-2xl font-bold min-w-60">UI Builder</h1>
        <PagesPopover />
        <div className="flex space-x-2">
          <Button
            onClick={handleUndo}
            variant="secondary"
            size="icon"
            disabled={!canUndo}
          >
            <span className="sr-only">Undo</span>
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleRedo}
            variant="secondary"
            size="icon"
            disabled={!canRedo}
          >
            <span className="sr-only">Redo</span>
            <Redo className="w-4 h-4" />
          </Button>
          <div className="h-10 flex w-px bg-border"></div>
          <PreviewDialog layers={layers} />
          <CodeDialog codeBlocks={codeBlocks} />
          <div className="h-10 flex w-px bg-border"></div>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}

const PreviewDialog = ({ layers }: { layers: Layer[] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon">
          <span className="sr-only">Preview</span>
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100dvw)] max-h-[calc(100dvh)] overflow-auto p-0">
        <LayerRenderer layers={layers} />
      </DialogContent>
    </Dialog>
  );
};

const CodeDialog = ({
  codeBlocks,
}: {
  codeBlocks: Record<"React" | "Serialized", string>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="icon">
          <span className="sr-only">Export</span>
          <FileUp className="w-4 h-4" />
        </Button>
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
                <div className="overflow-auto max-h-[400px] w-full">
                  <CodeBlock language="tsx" value={code} />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

function ModeToggle() {
  const { setTheme } = useTheme()
 
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PagesPopover(){
  const {pages, selectedPageId, addPageLayer, selectPage} = useComponentStore();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedPage, setSelectedPage] = useState<string | null>(selectedPageId);
  const [textInputValue, setTextInputValue] = useState("");

  const selectedPageData = useMemo(() => {
    return pages.find((page) => page.id === selectedPageId);
  }, [pages, selectedPageId]);

  const handleSelect = (pageId: string) => {
    setSelectedPage(pageId);
    selectPage(pageId);
    setOpen(false);
  };

  const handleAddPageLayer = (pageName: string) => {
    addPageLayer(pageName);
    setTextInputValue("");
  };

  const textInputForm = (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        handleAddPageLayer(textInputValue);
      }}
    >
      <div className="w-full flex items-center space-x-2">
        <Input
          className="w-full flex-grow"
          placeholder="New page name..."
          value={textInputValue}
          onChange={(e) => setTextInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddPageLayer(textInputValue);
            }
          }}
        />
        <Button type="submit" variant="secondary">
          {" "}
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
  return (
    <div className="relative flex justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="default">
            Page: {selectedPageData?.name}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Select page or create new..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>
                No pages found
                {textInputForm}
              </CommandEmpty>
              {pages.map((page) => (
                <CommandItem
                  key={page.id}
                  value={page.name}
                  onSelect={() => handleSelect(page.id)}
                  className={cn(selectedPageId === page.id ? "bg-secondary text-secondary-foreground" : "")}
                >
                  {selectedPageId === page.id ? <CheckIcon className="w-4 h-4 mr-2" /> : null}
                  {page.name}
                </CommandItem>
              ))}
              <CommandSeparator />
              <CommandGroup heading="Create new page">
                <CommandItem>{textInputForm}</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

