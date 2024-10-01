"use client";

import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  FileUp,
  Redo,
  Undo,
  SunIcon,
  MoonIcon,
  CheckIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useComponentStore,
  PageLayer,
} from "@/components/ui/ui-builder/internal/store/component-store";
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { CodeBlock } from "@/components/ui/ui-builder/codeblock";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { pageLayerToCode } from "@/components/ui/ui-builder/internal/templates";

const Z_INDEX = 1000;

export function NavBar() {
  const { selectedPageId, findLayerById } = useComponentStore();
  const { undo, redo, futureStates, pastStates } =
    useComponentStore.temporal.getState();

  const page = findLayerById(selectedPageId) as PageLayer;

  const layers = page?.children || [];
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
        const elements = document.querySelectorAll("*");
        elements.forEach((element) => {
          element.classList.add("animate-spin", "origin-center");
        });
      } else if (isStopSpin) {
        event.preventDefault();
        const elements = document.querySelectorAll("*");
        elements.forEach((element) => {
          element.classList.remove("animate-spin", "origin-center");
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canUndo, canRedo, undo, redo]);

  const codeBlocks = {
    React: pageLayerToCode(page),
    Serialized: JSON.stringify(
      page,
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
    <div
      className="flex items-center justify-between bg-background px-2 md:px-6 py-4 border-b gap-2"
      style={{ zIndex: Z_INDEX }}
    >
      <h1 className="md:block hidden text-2xl font-bold md:min-w-60 min-w-max">
        UI Builder
      </h1>
      <PagesPopover />
      <div className="flex space-x-2">
        <Button
          onClick={handleUndo}
          variant="secondary"
          size="icon"
          disabled={!canUndo}
          className="flex flex-col justify-center"
        >
          <span className="sr-only">Undo</span>
          <Undo className="w-4 h-4" />
          <CommandShortcut className="ml-0 text-[8px] leading-3">
            ⌘Z
          </CommandShortcut>
        </Button>
        <Button
          onClick={handleRedo}
          variant="secondary"
          size="icon"
          disabled={!canRedo}
          className="flex flex-col justify-center"
        >
          <span className="sr-only">Redo</span>
          <Redo className="w-4 h-4" />
          <CommandShortcut className="ml-0 text-[8px] leading-3">
            ⌘+⇧+Z
          </CommandShortcut>
        </Button>
        <div className="h-10 flex w-px bg-border"></div>
        <PreviewDialog page={page} />
        <CodeDialog codeBlocks={codeBlocks} />
        <div className="h-10 flex w-px bg-border"></div>
        <ModeToggle />
      </div>
    </div>
  );
}

const PreviewDialog = ({ page }: { page: PageLayer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon">
          <span className="sr-only">Preview</span>
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContentWithZIndex className="max-w-[calc(100dvw)] max-h-[calc(100dvh)] overflow-auto p-0 gap-0" style={{ zIndex: Z_INDEX+1 }}>
        <DialogHeader>
          <DialogTitle className="py-3 bg-yellow-600 text-center">
            <span className="text-lg font-semibold">Page Preview</span>
          </DialogTitle>
        </DialogHeader>
        <LayerRenderer className="w-full h-full flex flex-col" page={page} />
      </DialogContentWithZIndex>
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
      <DialogContentWithZIndex className="sm:max-w-[625px] max-h-[625px]" style={{ zIndex: Z_INDEX+1 }}>
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
      </DialogContentWithZIndex>
    </Dialog>
  );
};

function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ zIndex: Z_INDEX+1 }}>
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
  );
}

function PagesPopover() {
  const { pages, selectedPageId, addPageLayer, selectPage } =
    useComponentStore();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedPage, setSelectedPage] = useState<string | null>(
    selectedPageId
  );
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
          <Button variant="outline" size="default" className="max-w-30 overflow-hidden">
            {selectedPageData?.name}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" style={{ zIndex: Z_INDEX+1 }}>
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
                  className={cn(
                    selectedPageId === page.id
                      ? "bg-secondary text-secondary-foreground"
                      : ""
                  )}
                >
                  {selectedPageId === page.id ? (
                    <CheckIcon className="w-4 h-4 mr-2" />
                  ) : null}
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
  );
}

const DialogContentWithZIndex = forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay style={{ zIndex: Z_INDEX+1 }} />
    <DialogContent
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4 rounded-full p-1" />
        <span className="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
))
