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
  MoreVertical,
  PanelLeft,
  PanelRight,
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
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
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
import { CodePanel } from "@/components/ui/ui-builder/components/code-panel";
import {
  EditorStore,
  useEditorStore,
} from "@/lib/ui-builder/store/editor-store";
import {
  ComponentRegistry,
  ComponentLayer,
} from "@/components/ui/ui-builder/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  KeyCombination,
  useKeyboardShortcuts,
} from "@/hooks/use-keyboard-shortcuts";
import { useStore } from "zustand";

const Z_INDEX = 1000;



export function NavBar() {
  const selectedPageId = useLayerStore((state) => state.selectedPageId);
  const findLayerById = useLayerStore((state) => state.findLayerById);
  const componentRegistry = useEditorStore((state) => state.registry);
  const incrementRevision = useEditorStore((state) => state.incrementRevision);
  
  // Panel visibility state
  const showLeftPanel = useEditorStore((state) => state.showLeftPanel);
  const setShowLeftPanel = useEditorStore((state) => state.setShowLeftPanel);
  const showRightPanel = useEditorStore((state) => state.showRightPanel);
  const setShowRightPanel = useEditorStore((state) => state.setShowRightPanel);

  // Fix: Subscribe to temporal state changes using useStoreWithEqualityFn
  const pastStates = useStore(
    useLayerStore.temporal,
    (state) => state.pastStates
  );
  const futureStates = useStore(
    useLayerStore.temporal,
    (state) => state.futureStates
  );
  const { undo, redo } = useLayerStore.temporal.getState();

  const page = findLayerById(selectedPageId) as ComponentLayer;

  const canUndo = !!pastStates.length;
  const canRedo = !!futureStates.length;

  // **Lifted State for Modals**
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleUndo = useCallback(() => {
    undo();
    // Increment revision counter to trigger form revalidation
    incrementRevision();
  }, [undo, incrementRevision]);

  const handleRedo = useCallback(() => {
    redo();
    // Increment revision counter to trigger form revalidation
    incrementRevision();
  }, [redo, incrementRevision]);

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

  const handleOpenPreview = useCallback(() => {
    setIsPreviewModalOpen(true);
  }, []);
  const handleOpenExport = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  const handleToggleLeftPanel = useCallback(() => {
    setShowLeftPanel(!showLeftPanel);
  }, [showLeftPanel, setShowLeftPanel]);

  const handleToggleRightPanel = useCallback(() => {
    setShowRightPanel(!showRightPanel);
  }, [showRightPanel, setShowRightPanel]);

  const style = useMemo(() => ({ zIndex: Z_INDEX }), []);

  return (
    <div
      className="flex items-center justify-between bg-background px-2 md:px-6 py-4 border-b"
      style={style}
    >
      <div className="flex items-center gap-2">
        <div className="hidden md:contents">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggleLeftPanel}
              variant={showLeftPanel ? "secondary" : "outline"}
              size="icon"
              className="flex flex-col justify-center"
            >
              <span className="sr-only">Toggle Left Panel</span>
              <PanelLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {showLeftPanel ? "Hide" : "Show"} Left Panel
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggleRightPanel}
              variant={showRightPanel ? "secondary" : "outline"}
              size="icon"
              className="flex flex-col justify-center"
            >
              <span className="sr-only">Toggle Right Panel</span>
              <PanelRight className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {showRightPanel ? "Hide" : "Show"} Right Panel
          </TooltipContent>
        </Tooltip>
        </div>
        <div className="hidden md:flex h-10 w-px bg-border"></div>
        <PagesPopover />
        <PreviewModeToggle />
      </div>

      <div className="w-full flex items-center justify-end gap-2">
        {/* Action Buttons for Larger Screens */}
        <div className="hidden md:flex space-x-2">
          <ActionButtons
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onOpenPreview={handleOpenPreview}
            onOpenExport={handleOpenExport}
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
            onOpenPreview={handleOpenPreview}
            onOpenExport={handleOpenExport}
          />
        </div>
      </div>

      {/* **Dialogs Controlled by NavBar State** */}
      <PreviewDialog
        isOpen={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        page={page}
        componentRegistry={componentRegistry}
      />
      <CodeDialog
        isOpen={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
      />
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
  const style = useMemo(() => ({ zIndex: Z_INDEX + 1 }), []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <span className="sr-only">Actions</span>
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={style}>
        <DropdownMenuItem
          className="gap-2"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo className="w-4 h-4" />
          Undo
          <span className="ml-auto text-xs text-muted-foreground">⌘Z</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2"
          onClick={onRedo}
          disabled={!canRedo}
        >
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
  page: ComponentLayer;
  componentRegistry: ComponentRegistry;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({
  isOpen,
  onOpenChange,
  page,
  componentRegistry,
}) => {
  const style = useMemo(() => ({ zIndex: Z_INDEX + 1 }), []);

  const shortcuts = useMemo(
    () => [
      {
        keys: { metaKey: true, shiftKey: true },
        key: "p",
        handler: () => {
          onOpenChange(true);
        },
      },
    ],
    [onOpenChange]
  );

  useKeyboardShortcuts(shortcuts);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger />
      <DialogContentWithZIndex
        className="max-w-[calc(100dvw)] max-h-[calc(100dvh)] overflow-auto p-0 gap-0"
        style={style}
      >
        <DialogHeader>
          <DialogTitle className="py-3 bg-yellow-600 text-center">
            <span className="text-lg font-semibold">Page Preview</span>
          </DialogTitle>
        </DialogHeader>
        <LayerRenderer
          className="w-full h-full flex flex-col overflow-x-hidden"
          page={page}
          componentRegistry={componentRegistry}
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
  const style = useMemo(() => ({ zIndex: Z_INDEX + 1 }), []);

  const shortcuts = useMemo(
    () => [
      {
        keys: { metaKey: true, shiftKey: true },
        key: "e",
        handler: () => {
          onOpenChange(true);
        },
      },
    ],
    [onOpenChange]
  );

  useKeyboardShortcuts(shortcuts);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger />
      <DialogContentWithZIndex
        className="sm:max-w-[625px] max-h-[625px]"
        style={style}
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

  const style = useMemo(() => ({ zIndex: Z_INDEX + 1 }), []);

  const handleSetLightTheme = useCallback(() => {
    setTheme("light");
  }, [setTheme]);
  const handleSetDarkTheme = useCallback(() => {
    setTheme("dark");
  }, [setTheme]);
  const handleSetSystemTheme = useCallback(() => {
    setTheme("system");
  }, [setTheme]);

  return (
    <DropdownMenu>
      <Tooltip>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
              <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </TooltipTrigger>
        </DropdownMenuTrigger>
        <TooltipContent>Toggle theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" style={style}>
        <DropdownMenuItem onClick={handleSetLightTheme}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={handleSetDarkTheme}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={handleSetSystemTheme}>
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
  const allowPagesCreation = useEditorStore(
    (state) => state.allowPagesCreation
  );

  const selectedPageData = useMemo(() => {
    return pages.find((page) => page.id === selectedPageId);
  }, [pages, selectedPageId]);

  const handleSelect = useCallback(
    (pageId: string) => {
      setSelectedPage(pageId);
      selectPage(pageId);
      setOpen(false);
    },
    [selectPage, setOpen]
  );

  const handleAddPageLayer = useCallback(
    (pageName: string) => {
      addPageLayer(pageName);
      setTextInputValue("");
    },
    [addPageLayer, setTextInputValue]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleAddPageLayer(textInputValue);
    },
    [handleAddPageLayer, textInputValue]
  );

  const handleTextInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTextInputValue(e.target.value);
    },
    [setTextInputValue]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddPageLayer(textInputValue);
      }
    },
    [handleAddPageLayer, textInputValue]
  );

  const style = useMemo(() => ({ zIndex: Z_INDEX + 1 }), []);

  const textInputForm = (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="w-full flex items-center space-x-2">
        <Input
          className="w-full flex-grow"
          placeholder="New page name..."
          value={textInputValue}
          onChange={handleTextInputChange}
          onKeyDown={handleKeyDown}
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
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="default"
                className="max-w-30 overflow-hidden"
              >
                {selectedPageData?.name}
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent>Select page</TooltipContent>
        </Tooltip>
        <PopoverContent className="w-[300px] p-0" style={style}>
          <Command>
            <CommandInput
              placeholder="Select page or create new..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>
                No pages found
                {allowPagesCreation && textInputForm}
              </CommandEmpty>
              {pages.map((page) => (
                <PageItem
                  key={page.id}
                  selectedPageId={selectedPageId}
                  page={page}
                  onSelect={handleSelect}
                />
              ))}
              <CommandSeparator />
              {allowPagesCreation && (
                <CommandGroup heading="Create new page">
                  <CommandItem>{textInputForm}</CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const PageItem = ({
  selectedPageId,
  page,
  onSelect,
}: {
  selectedPageId: string;
  page: ComponentLayer;
  onSelect: (pageId: string) => void;
}) => {
  const handleSelect = useCallback(() => {
    onSelect(page.id);
  }, [onSelect, page.id]);

  return (
    <CommandItem
      value={page.name}
      onSelect={handleSelect}
      className={cn(selectedPageId === page.id && "font-bold")}
    >
      {selectedPageId === page.id ? (
        <CheckIcon className="w-4 h-4 mr-2" />
      ) : null}
      {page.name}
    </CommandItem>
  );
};

const DialogContentWithZIndex = forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, children, ...props }, ref) => {
  const style = useMemo(() => ({ zIndex: Z_INDEX + 1 }), []);
  return (
    <DialogPortal>
      <DialogOverlay style={style} />
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
  );
});

DialogContentWithZIndex.displayName = "DialogContentWithZIndex";

const PreviewModeToggle = () => {
  const { previewMode, setPreviewMode } = useEditorStore();

  const handleSelect = useCallback((mode: EditorStore["previewMode"]) => {
    setPreviewMode(mode);
  }, [setPreviewMode]);

  const style = useMemo(() => ({ zIndex: Z_INDEX + 1 }), []);

  const previewModeIcon = useMemo(() => {
    return {
      mobile: <Smartphone className="h-4 w-4" />,
      tablet: <Tablet className="h-4 w-4" />,
      desktop: <Monitor className="h-4 w-4" />,
      responsive: <Maximize className="h-4 w-4" />,
    }[previewMode];
  }, [previewMode]);

  const handleSelectMobile = useCallback(() => {
    handleSelect("mobile");
  }, [handleSelect]);
  const handleSelectTablet = useCallback(() => {
    handleSelect("tablet");
  }, [handleSelect]);
  const handleSelectDesktop = useCallback(() => {
    handleSelect("desktop");
  }, [handleSelect]);
  const handleSelectResponsive = useCallback(() => {
    handleSelect("responsive");
  }, [handleSelect]);

  return (
    <DropdownMenu>
      <Tooltip>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
              {previewModeIcon}
              <span className="sr-only">Select screen size</span>
            </Button>
          </TooltipTrigger>
        </DropdownMenuTrigger>
        <TooltipContent>Select screen size</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" style={style}>
        <DropdownMenuItem
          onSelect={handleSelectMobile}
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
          onSelect={handleSelectTablet}
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
          onSelect={handleSelectDesktop}
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
          onSelect={handleSelectResponsive}
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
