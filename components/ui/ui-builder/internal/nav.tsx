"use client";

import { forwardRef, useCallback, useMemo, useState } from "react";
import {
  Eye,
  FileUp,
  Redo,
  Undo,
  SunIcon,
  MoonIcon,
  CheckIcon,
  X,
  PlusIcon,
  Monitor,
  Tablet,
  Smartphone,
  Maximize,
  MoreVertical, // Ensure this import is present
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
import { useLayerStore, PageLayer } from "@/lib/ui-builder/store/layer-store";
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { cn } from "@/lib/utils";
import { CodePanel } from "@/components/ui/ui-builder/code-panel";
import {
  EditorStore,
  useEditorStore,
} from "@/lib/ui-builder/store/editor-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  KeyCombination,
  useKeyboardShortcuts,
} from "@/hooks/use-keyboard-shortcuts";

const Z_INDEX = 1000;

interface NavBarProps {
  useCanvas?: boolean;
}

export function NavBar({ useCanvas }: NavBarProps) {
  const { selectedPageId, findLayerById } = useLayerStore();
  const { undo, redo, futureStates, pastStates } =
    useLayerStore.temporal.getState();

  const page = findLayerById(selectedPageId) as PageLayer;

  const canUndo = !!pastStates.length;
  const canRedo = !!futureStates.length;

  // **Lifted State for Modals**
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  const keyCombinations = useMemo<KeyCombination[]>(
    () => [
      {
        keys: { metaKey: true, shiftKey: false },
        key: "z",
        handler: handleUndo,
      },
      {
        keys: { metaKey: true, shiftKey: true },
        key: "z",
        handler: handleRedo,
      },
      {
        keys: { metaKey: true, shiftKey: true },
        key: "9",
        handler: () => {
          const elements = document.querySelectorAll("*");
          elements.forEach((element) => {
            element.classList.add("animate-spin", "origin-center");
          });
        },
      },
      {
        keys: { metaKey: true, shiftKey: true },
        key: "0",
        handler: () => {
          const elements = document.querySelectorAll("*");
          elements.forEach((element) => {
            element.classList.remove("animate-spin", "origin-center");
          });
        },
      },
    ],
    [handleUndo, handleRedo]
  );

  useKeyboardShortcuts(keyCombinations);

  return (
    <div
      className="flex items-center justify-between bg-background px-2 md:px-6 py-4 border-b"
      style={{ zIndex: Z_INDEX }}
    >
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <h1 className="block text-lg md:text-2xl font-bold whitespace-nowrap">
            UI Builder
          </h1>
          <div className="flex h-10 w-px bg-border"></div>
          <PagesPopover />
          {useCanvas && <PreviewModeToggle />}
        </div>

        <div className="w-full flex items-center justify-end gap-2">
          {/* Action Buttons for Larger Screens */}
          <div className="hidden md:flex space-x-2">
            <ActionButtons
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onOpenPreview={() => setIsPreviewModalOpen(true)}
              onOpenExport={() => setIsExportModalOpen(true)}
            />
            <div className="h-10 flex w-px bg-border"></div>
          </div>

          <ModeToggle />

          {/* Dropdown for Smaller Screens */}
          <div className="flex md:hidden space-x-2">
            <div className="h-10 flex w-px bg-border"></div>
            <ResponsiveDropdown
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onOpenPreview={() => setIsPreviewModalOpen(true)}
              onOpenExport={() => setIsExportModalOpen(true)}
            />
          </div>
        </div>

        {/* **Dialogs Controlled by NavBar State** */}
        <PreviewDialog
          isOpen={isPreviewModalOpen}
          onOpenChange={setIsPreviewModalOpen}
          page={page}
        />
        <CodeDialog
          isOpen={isExportModalOpen}
          onOpenChange={setIsExportModalOpen}
        />
      </TooltipProvider>
    </div>
  );
}

/**
 * Reusable Action Buttons Component
 */
interface ActionButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenPreview: () => void;
  onOpenExport: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenPreview,
  onOpenExport,
}) => {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onUndo}
            variant="secondary"
            size="icon"
            disabled={!canUndo}
            className="flex flex-col justify-center"
          >
            <span className="sr-only">Undo</span>
            <Undo className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2">
          Undo
          <CommandShortcut className="ml-0 text-sm leading-3">
            ⌘Z
          </CommandShortcut>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onRedo}
            variant="secondary"
            size="icon"
            disabled={!canRedo}
            className="flex flex-col justify-center"
          >
            <span className="sr-only">Redo</span>
            <Redo className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2">
          Redo
          <CommandShortcut className="ml-0 text-sm leading-3">
            ⌘+⇧+Z
          </CommandShortcut>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onOpenPreview}
            variant="secondary"
            size="icon"
            className="flex flex-col justify-center"
          >
            <span className="sr-only">Preview</span>
            <Eye className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2">
          Preview
          <CommandShortcut className="ml-0 text-sm leading-3">
            ⌘+⇧+P
          </CommandShortcut>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onOpenExport}
            variant="secondary"
            size="icon"
            className="flex flex-col justify-center"
          >
            <span className="sr-only">Export</span>
            <FileUp className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2">
          Export Code
          <CommandShortcut className="ml-0 text-sm leading-3">
            ⌘+⇧+E
          </CommandShortcut>
        </TooltipContent>
      </Tooltip>
    </>
  );
};

/**
 * Dropdown containing Action Buttons for Smaller Screens
 */
interface ResponsiveDropdownProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenPreview: () => void;
  onOpenExport: () => void;
}

const ResponsiveDropdown: React.FC<ResponsiveDropdownProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenPreview,
  onOpenExport,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <span className="sr-only">Actions</span>
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ zIndex: Z_INDEX + 1 }}>
        <DropdownMenuItem className="gap-2" onClick={onUndo} disabled={!canUndo}>
          <Undo className="w-4 h-4" />
          Undo
          <span className="ml-auto text-xs text-muted-foreground">⌘Z</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={onRedo} disabled={!canRedo}>
          <Redo className="w-4 h-4" />
          Redo
          <span className="ml-auto text-xs text-muted-foreground">⌘+⇧+Z</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onClick={onOpenPreview}>
          <Eye className="w-4 h-4" />
          Preview
          <span className="ml-auto text-xs text-muted-foreground">⌘+⇧+P</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={onOpenExport}>
          <FileUp className="w-4 h-4" />
          Export
          <span className="ml-auto text-xs text-muted-foreground">⌘+⇧+E</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Preview Dialog Component
 */
interface PreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  page: PageLayer;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({
  isOpen,
  onOpenChange,
  page,
}) => {
  useKeyboardShortcuts([
    {
      keys: { metaKey: true, shiftKey: true },
      key: "p",
      handler: () => {
        onOpenChange(true);
      },
    },
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger />
      <DialogContentWithZIndex
        className="max-w-[calc(100dvw)] max-h-[calc(100dvh)] overflow-auto p-0 gap-0"
        style={{ zIndex: Z_INDEX + 1 }}
      >
        <DialogHeader>
          <DialogTitle className="py-3 bg-yellow-600 text-center">
            <span className="text-lg font-semibold">Page Preview</span>
          </DialogTitle>
        </DialogHeader>
        <LayerRenderer
          className="w-full h-full flex flex-col overflow-x-hidden"
          page={page}
        />
      </DialogContentWithZIndex>
    </Dialog>
  );
};

/**
 * Code Dialog Component
 */
interface CodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CodeDialog: React.FC<CodeDialogProps> = ({ isOpen, onOpenChange }) => {
  useKeyboardShortcuts([
    {
      keys: { metaKey: true, shiftKey: true },
      key: "e",
      handler: () => {
        onOpenChange(true);
      },
    },
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger />
      <DialogContentWithZIndex
        className="sm:max-w-[625px] max-h-[625px]"
        style={{ zIndex: Z_INDEX + 1 }}
      >
        <DialogHeader>
          <DialogTitle>Generated Code</DialogTitle>
        </DialogHeader>
        <CodePanel />
      </DialogContentWithZIndex>
    </Dialog>
  );
};

function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
              <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ zIndex: Z_INDEX + 1 }}>
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
  const { pages, selectedPageId, addPageLayer, selectPage } = useLayerStore();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
  return (
    <div className="relative flex justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="default"
                className="max-w-30 overflow-hidden"
              >
                {selectedPageData?.name}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select page</TooltipContent>
          </Tooltip>
        </PopoverTrigger>
        <PopoverContent
          className="w-[300px] p-0"
          style={{ zIndex: Z_INDEX + 1 }}
        >
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
                  className={cn(selectedPageId === page.id && "font-bold")}
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
    <DialogOverlay style={{ zIndex: Z_INDEX + 1 }} />
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
));
DialogContentWithZIndex.displayName = "DialogContentWithZIndex";

const PreviewModeToggle = () => {
  const { previewMode, setPreviewMode } = useEditorStore();

  const handleSelect = (mode: EditorStore["previewMode"]) => {
    setPreviewMode(mode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
              {
                {
                  mobile: <Smartphone className="h-4 w-4" />,
                  tablet: <Tablet className="h-4 w-4" />,
                  desktop: <Monitor className="h-4 w-4" />,
                  responsive: <Maximize className="h-4 w-4" />,
                }[previewMode]
              }
              <span className="sr-only">Select screen size</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Select screen size</TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ zIndex: Z_INDEX + 1 }}>
        <DropdownMenuItem
          onSelect={() => handleSelect("mobile")}
          className={
            previewMode === "mobile"
              ? "bg-secondary text-secondary-foreground"
              : ""
          }
        >
          <Smartphone className="mr-2 h-4 w-4" />
          <span>Mobile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => handleSelect("tablet")}
          className={
            previewMode === "tablet"
              ? "bg-secondary text-secondary-foreground"
              : ""
          }
        >
          <Tablet className="mr-2 h-4 w-4" />
          <span>Tablet</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => handleSelect("desktop")}
          className={
            previewMode === "desktop"
              ? "bg-secondary text-secondary-foreground"
              : ""
          }
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Desktop</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => handleSelect("responsive")}
          className={
            previewMode === "responsive"
              ? "bg-secondary text-secondary-foreground"
              : ""
          }
        >
          <Maximize className="mr-2 h-4 w-4" />
          <span>Responsive</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
