import { ComponentRegistry, ComponentLayer } from '@/components/ui/ui-builder/types';
import { z } from 'zod';

// Import all shadcn components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from "@/components/ui/dropdown-menu";
import { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";

// Additional shadcn components
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup } from "@/components/ui/context-menu";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarGroup } from "@/components/ui/menubar";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport } from "@/components/ui/navigation-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { ButtonGroup, ButtonGroupText, ButtonGroupSeparator } from "@/components/ui/button-group";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldContent, FieldTitle } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea } from "@/components/ui/input-group";
import { Item, ItemMedia, ItemContent, ItemActions, ItemGroup, ItemSeparator, ItemTitle, ItemDescription, ItemHeader, ItemFooter } from "@/components/ui/item";

import { classNameFieldOverrides, childrenFieldOverrides, commonFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";

/**
 * Shadcn/UI component definitions for the UI Builder.
 * These are the official shadcn components with proper Zod schemas
 * and default children structures for compound components.
 */
export const shadcnComponentDefinitions: ComponentRegistry = {
    // ============================================
    // BUTTON & BADGE
    // ============================================
    Button: {
        component: Button,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
            variant: z
                .enum(["default", "destructive", "outline", "secondary", "ghost", "link"])
                .default("default"),
            size: z.enum(["default", "sm", "lg", "icon"]).default("default"),
            disabled: z.boolean().optional(),
            type: z.enum(["button", "submit", "reset"]).optional(),
        }),
        from: "@/components/ui/button",
        defaultChildren: [
            {
                id: "button-text",
                type: "span",
                name: "span",
                props: {},
                children: "Button",
            } satisfies ComponentLayer,
        ],
        fieldOverrides: commonFieldOverrides()
    },
    Badge: {
        component: Badge,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            variant: z
                .enum(["default", "secondary", "destructive", "outline"])
                .default("default"),
        }),
        from: "@/components/ui/badge",
        defaultChildren: [
            {
                id: "badge-text",
                type: "span",
                name: "span",
                props: {},
                children: "Badge",
            } satisfies ComponentLayer,
        ],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // ACCORDION
    // ============================================
    Accordion: {
        component: Accordion,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            type: z.enum(["single", "multiple"]).default("single"),
            collapsible: z.boolean().optional(),
            defaultValue: z.string().optional(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/accordion",
        defaultChildren: [
            {
                id: "acc-item-1",
                type: "AccordionItem",
                name: "AccordionItem",
                props: { value: "item-1" },
                children: [
                    {
                        id: "acc-trigger-1",
                        type: "AccordionTrigger",
                        name: "AccordionTrigger",
                        props: {},
                        children: [
                            { id: "acc-trigger-1-text", type: "span", name: "span", props: {}, children: "Accordion Item #1" } satisfies ComponentLayer,
                        ],
                    },
                    {
                        id: "acc-content-1",
                        type: "AccordionContent",
                        name: "AccordionContent",
                        props: {},
                        children: [
                            { id: "acc-content-1-text", type: "span", name: "span", props: {}, children: "Accordion Content Text" } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
            {
                id: "acc-item-2",
                type: "AccordionItem",
                name: "AccordionItem",
                props: { value: "item-2" },
                children: [
                    {
                        id: "acc-trigger-2",
                        type: "AccordionTrigger",
                        name: "AccordionTrigger",
                        props: {},
                        children: [
                            { id: "acc-trigger-2-text", type: "span", name: "span", props: {}, children: "Accordion Item #2" } satisfies ComponentLayer,
                        ],
                    },
                    {
                        id: "acc-content-2",
                        type: "AccordionContent",
                        name: "AccordionContent",
                        props: {},
                        children: [
                            { id: "acc-content-2-text", type: "span", name: "span", props: {}, children: "Accordion Content Text" } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    AccordionItem: {
        component: AccordionItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            value: z.string(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/accordion",
        childOf: ["Accordion"],
        defaultChildren: [
            {
                id: "acc-trigger-default",
                type: "AccordionTrigger",
                name: "AccordionTrigger",
                props: {},
                children: [
                    { id: "acc-trigger-default-text", type: "span", name: "span", props: {}, children: "Accordion Trigger" } satisfies ComponentLayer,
                ],
            },
            {
                id: "acc-content-default",
                type: "AccordionContent",
                name: "AccordionContent",
                props: {},
                children: [
                    { id: "acc-content-default-text", type: "span", name: "span", props: {}, children: "Accordion Content" } satisfies ComponentLayer,
                ],
            },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    AccordionTrigger: {
        component: AccordionTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/accordion",
        childOf: ["AccordionItem"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer),
            children: (layer) => childrenFieldOverrides(layer)
        }
    },
    AccordionContent: {
        component: AccordionContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/accordion",
        childOf: ["AccordionItem"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // CARD
    // ============================================
    Card: {
        component: Card,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        defaultChildren: [
            {
                id: "card-header",
                type: "CardHeader",
                name: "CardHeader",
                props: {},
                children: [
                    {
                        id: "card-title",
                        type: "CardTitle",
                        name: "CardTitle",
                        props: {},
                        children: [
                            { id: "card-title-text", type: "span", name: "span", props: {}, children: "Card Title" } satisfies ComponentLayer,
                        ],
                    },
                    {
                        id: "card-description",
                        type: "CardDescription",
                        name: "CardDescription",
                        props: {},
                        children: [
                            { id: "card-description-text", type: "span", name: "span", props: {}, children: "Card Description" } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
            {
                id: "card-content",
                type: "CardContent",
                name: "CardContent",
                props: {},
                children: [
                    { id: "card-content-text", type: "span", name: "span", props: {}, children: "Card Content" } satisfies ComponentLayer,
                ],
            },
            {
                id: "card-footer",
                type: "CardFooter",
                name: "CardFooter",
                props: {},
                children: [
                    { id: "card-footer-text", type: "span", name: "span", props: {}, children: "Card Footer" } satisfies ComponentLayer,
                ],
            },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    CardHeader: {
        component: CardHeader,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        childOf: ["Card"],
        fieldOverrides: commonFieldOverrides()
    },
    CardFooter: {
        component: CardFooter,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        childOf: ["Card"],
        fieldOverrides: commonFieldOverrides()
    },
    CardTitle: {
        component: CardTitle,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        childOf: ["CardHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    CardDescription: {
        component: CardDescription,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        childOf: ["CardHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    CardContent: {
        component: CardContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: '@/components/ui/card',
        childOf: ["Card"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // DIALOG
    // ============================================
    Dialog: {
        component: Dialog,
        schema: z.object({
            children: z.any().optional(),
            defaultOpen: z.boolean().optional(),
            open: z.boolean().optional(),
            modal: z.boolean().optional(),
        }),
        from: "@/components/ui/dialog",
        defaultChildren: [
            {
                id: "dialog-trigger",
                type: "DialogTrigger",
                name: "DialogTrigger",
                props: { asChild: true },
                children: [
                    {
                        id: "dialog-trigger-button",
                        type: "Button",
                        name: "Button",
                        props: { variant: "outline" },
                        children: [
                            { id: "dialog-trigger-text", type: "span", name: "span", props: {}, children: "Open Dialog" } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
            {
                id: "dialog-content",
                type: "DialogContent",
                name: "DialogContent",
                props: {},
                children: [
                    {
                        id: "dialog-header",
                        type: "DialogHeader",
                        name: "DialogHeader",
                        props: {},
                        children: [
                            {
                                id: "dialog-title",
                                type: "DialogTitle",
                                name: "DialogTitle",
                                props: {},
                                children: [
                                    { id: "dialog-title-text", type: "span", name: "span", props: {}, children: "Dialog Title" } satisfies ComponentLayer,
                                ],
                            },
                            {
                                id: "dialog-description",
                                type: "DialogDescription",
                                name: "DialogDescription",
                                props: {},
                                children: [
                                    { id: "dialog-description-text", type: "span", name: "span", props: {}, children: "Dialog description goes here." } satisfies ComponentLayer,
                                ],
                            },
                        ],
                    },
                    {
                        id: "dialog-footer",
                        type: "DialogFooter",
                        name: "DialogFooter",
                        props: {},
                        children: [
                            {
                                id: "dialog-footer-button",
                                type: "Button",
                                name: "Button",
                                props: {},
                                children: [
                                    { id: "dialog-footer-text", type: "span", name: "span", props: {}, children: "Close" } satisfies ComponentLayer,
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        fieldOverrides: {
            children: (layer) => childrenFieldOverrides(layer)
        }
    },
    DialogTrigger: {
        component: DialogTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/dialog",
        childOf: ["Dialog"],
        fieldOverrides: commonFieldOverrides()
    },
    DialogContent: {
        component: DialogContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/dialog",
        childOf: ["Dialog"],
        fieldOverrides: commonFieldOverrides()
    },
    DialogHeader: {
        component: DialogHeader,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/dialog",
        childOf: ["DialogContent"],
        fieldOverrides: commonFieldOverrides()
    },
    DialogFooter: {
        component: DialogFooter,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/dialog",
        childOf: ["DialogContent"],
        fieldOverrides: commonFieldOverrides()
    },
    DialogTitle: {
        component: DialogTitle,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/dialog",
        childOf: ["DialogHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    DialogDescription: {
        component: DialogDescription,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/dialog",
        childOf: ["DialogHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    DialogClose: {
        component: DialogClose,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/dialog",
        childOf: ["DialogContent"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // SHEET
    // ============================================
    Sheet: {
        component: Sheet,
        schema: z.object({
            children: z.any().optional(),
            defaultOpen: z.boolean().optional(),
            open: z.boolean().optional(),
            modal: z.boolean().optional(),
        }),
        from: "@/components/ui/sheet",
        defaultChildren: [
            {
                id: "sheet-trigger",
                type: "SheetTrigger",
                name: "SheetTrigger",
                props: { asChild: true },
                children: [
                    {
                        id: "sheet-trigger-button",
                        type: "Button",
                        name: "Button",
                        props: { variant: "outline" },
                        children: [
                            { id: "sheet-trigger-text", type: "span", name: "span", props: {}, children: "Open Sheet" } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
            {
                id: "sheet-content",
                type: "SheetContent",
                name: "SheetContent",
                props: {},
                children: [
                    {
                        id: "sheet-header",
                        type: "SheetHeader",
                        name: "SheetHeader",
                        props: {},
                        children: [
                            {
                                id: "sheet-title",
                                type: "SheetTitle",
                                name: "SheetTitle",
                                props: {},
                                children: [
                                    { id: "sheet-title-text", type: "span", name: "span", props: {}, children: "Sheet Title" } satisfies ComponentLayer,
                                ],
                            },
                            {
                                id: "sheet-description",
                                type: "SheetDescription",
                                name: "SheetDescription",
                                props: {},
                                children: [
                                    { id: "sheet-description-text", type: "span", name: "span", props: {}, children: "Sheet description goes here." } satisfies ComponentLayer,
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        fieldOverrides: {
            children: (layer) => childrenFieldOverrides(layer)
        }
    },
    SheetTrigger: {
        component: SheetTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/sheet",
        childOf: ["Sheet"],
        fieldOverrides: commonFieldOverrides()
    },
    SheetContent: {
        component: SheetContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            side: z.enum(["top", "bottom", "left", "right"]).default("right"),
        }),
        from: "@/components/ui/sheet",
        childOf: ["Sheet"],
        fieldOverrides: commonFieldOverrides()
    },
    SheetHeader: {
        component: SheetHeader,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sheet",
        childOf: ["SheetContent"],
        fieldOverrides: commonFieldOverrides()
    },
    SheetFooter: {
        component: SheetFooter,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sheet",
        childOf: ["SheetContent"],
        fieldOverrides: commonFieldOverrides()
    },
    SheetTitle: {
        component: SheetTitle,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sheet",
        childOf: ["SheetHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    SheetDescription: {
        component: SheetDescription,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sheet",
        childOf: ["SheetHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    SheetClose: {
        component: SheetClose,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/sheet",
        childOf: ["SheetContent"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // TABS
    // ============================================
    Tabs: {
        component: Tabs,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            defaultValue: z.string().optional(),
            value: z.string().optional(),
            orientation: z.enum(["horizontal", "vertical"]).optional(),
            activationMode: z.enum(["automatic", "manual"]).optional(),
        }),
        from: "@/components/ui/tabs",
        defaultChildren: [
            {
                id: "tabs-list",
                type: "TabsList",
                name: "TabsList",
                props: {},
                children: [
                    {
                        id: "tabs-trigger-1",
                        type: "TabsTrigger",
                        name: "TabsTrigger",
                        props: { value: "tab1" },
                        children: [
                            { id: "tabs-trigger-1-text", type: "span", name: "span", props: {}, children: "Tab 1" } satisfies ComponentLayer,
                        ],
                    },
                    {
                        id: "tabs-trigger-2",
                        type: "TabsTrigger",
                        name: "TabsTrigger",
                        props: { value: "tab2" },
                        children: [
                            { id: "tabs-trigger-2-text", type: "span", name: "span", props: {}, children: "Tab 2" } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
            {
                id: "tabs-content-1",
                type: "TabsContent",
                name: "TabsContent",
                props: { value: "tab1" },
                children: [
                    { id: "tabs-content-1-text", type: "span", name: "span", props: {}, children: "Tab 1 content" } satisfies ComponentLayer,
                ],
            },
            {
                id: "tabs-content-2",
                type: "TabsContent",
                name: "TabsContent",
                props: { value: "tab2" },
                children: [
                    { id: "tabs-content-2-text", type: "span", name: "span", props: {}, children: "Tab 2 content" } satisfies ComponentLayer,
                ],
            },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    TabsList: {
        component: TabsList,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/tabs",
        childOf: ["Tabs"],
        fieldOverrides: commonFieldOverrides()
    },
    TabsTrigger: {
        component: TabsTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            value: z.string(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/tabs",
        childOf: ["TabsList"],
        fieldOverrides: commonFieldOverrides()
    },
    TabsContent: {
        component: TabsContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            value: z.string(),
            forceMount: z.boolean().optional(),
        }),
        from: "@/components/ui/tabs",
        childOf: ["Tabs"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // TABLE
    // ============================================
    Table: {
        component: Table,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/table",
        defaultChildren: [
            {
                id: "table-header",
                type: "TableHeader",
                name: "TableHeader",
                props: {},
                children: [
                    {
                        id: "table-row-header",
                        type: "TableRow",
                        name: "TableRow",
                        props: {},
                        children: [
                            { id: "table-head-1", type: "TableHead", name: "TableHead", props: {}, children: [{ id: "th1-text", type: "span", name: "span", props: {}, children: "Header 1" } satisfies ComponentLayer] },
                            { id: "table-head-2", type: "TableHead", name: "TableHead", props: {}, children: [{ id: "th2-text", type: "span", name: "span", props: {}, children: "Header 2" } satisfies ComponentLayer] },
                        ],
                    },
                ],
            },
            {
                id: "table-body",
                type: "TableBody",
                name: "TableBody",
                props: {},
                children: [
                    {
                        id: "table-row-1",
                        type: "TableRow",
                        name: "TableRow",
                        props: {},
                        children: [
                            { id: "table-cell-1-1", type: "TableCell", name: "TableCell", props: {}, children: [{ id: "tc11-text", type: "span", name: "span", props: {}, children: "Cell 1" } satisfies ComponentLayer] },
                            { id: "table-cell-1-2", type: "TableCell", name: "TableCell", props: {}, children: [{ id: "tc12-text", type: "span", name: "span", props: {}, children: "Cell 2" } satisfies ComponentLayer] },
                        ],
                    },
                ],
            },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    TableHeader: {
        component: TableHeader,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/table",
        childOf: ["Table"],
        fieldOverrides: commonFieldOverrides()
    },
    TableBody: {
        component: TableBody,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/table",
        childOf: ["Table"],
        fieldOverrides: commonFieldOverrides()
    },
    TableFooter: {
        component: TableFooter,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/table",
        childOf: ["Table"],
        fieldOverrides: commonFieldOverrides()
    },
    TableHead: {
        component: TableHead,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/table",
        childOf: ["TableRow"],
        fieldOverrides: commonFieldOverrides()
    },
    TableRow: {
        component: TableRow,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/table",
        childOf: ["TableHeader", "TableBody", "TableFooter"],
        fieldOverrides: commonFieldOverrides()
    },
    TableCell: {
        component: TableCell,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/table",
        childOf: ["TableRow"],
        fieldOverrides: commonFieldOverrides()
    },
    TableCaption: {
        component: TableCaption,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/table",
        childOf: ["Table"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // DROPDOWN MENU
    // ============================================
    DropdownMenu: {
        component: DropdownMenu,
        schema: z.object({
            children: z.any().optional(),
            defaultOpen: z.boolean().optional(),
            open: z.boolean().optional(),
            modal: z.boolean().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        defaultChildren: [
            {
                id: "dropdown-trigger",
                type: "DropdownMenuTrigger",
                name: "DropdownMenuTrigger",
                props: { asChild: true },
                children: [
                    {
                        id: "dropdown-trigger-button",
                        type: "Button",
                        name: "Button",
                        props: { variant: "outline" },
                        children: [
                            { id: "dropdown-trigger-text", type: "span", name: "span", props: {}, children: "Open Menu" } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
            {
                id: "dropdown-content",
                type: "DropdownMenuContent",
                name: "DropdownMenuContent",
                props: {},
                children: [
                    {
                        id: "dropdown-label",
                        type: "DropdownMenuLabel",
                        name: "DropdownMenuLabel",
                        props: {},
                        children: [
                            { id: "dropdown-label-text", type: "span", name: "span", props: {}, children: "My Account" } satisfies ComponentLayer,
                        ],
                    },
                    { id: "dropdown-separator", type: "DropdownMenuSeparator", name: "DropdownMenuSeparator", props: {}, children: [] },
                    {
                        id: "dropdown-item-1",
                        type: "DropdownMenuItem",
                        name: "DropdownMenuItem",
                        props: {},
                        children: [
                            { id: "dropdown-item-1-text", type: "span", name: "span", props: {}, children: "Profile" } satisfies ComponentLayer,
                        ],
                    },
                    {
                        id: "dropdown-item-2",
                        type: "DropdownMenuItem",
                        name: "DropdownMenuItem",
                        props: {},
                        children: [
                            { id: "dropdown-item-2-text", type: "span", name: "span", props: {}, children: "Settings" } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
        ],
        fieldOverrides: {
            children: (layer) => childrenFieldOverrides(layer)
        }
    },
    DropdownMenuTrigger: {
        component: DropdownMenuTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenu"],
        fieldOverrides: commonFieldOverrides()
    },
    DropdownMenuContent: {
        component: DropdownMenuContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            sideOffset: z.number().optional(),
            align: z.enum(["start", "center", "end"]).optional(),
            side: z.enum(["top", "right", "bottom", "left"]).optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenu"],
        fieldOverrides: commonFieldOverrides()
    },
    DropdownMenuItem: {
        component: DropdownMenuItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            inset: z.boolean().optional(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenuContent", "DropdownMenuGroup", "DropdownMenuSubContent"],
        fieldOverrides: commonFieldOverrides()
    },
    DropdownMenuCheckboxItem: {
        component: DropdownMenuCheckboxItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            checked: z.boolean().optional(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenuContent", "DropdownMenuGroup", "DropdownMenuSubContent"],
        fieldOverrides: commonFieldOverrides()
    },
    DropdownMenuRadioItem: {
        component: DropdownMenuRadioItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            value: z.string(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenuRadioGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    DropdownMenuLabel: {
        component: DropdownMenuLabel,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            inset: z.boolean().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenuContent", "DropdownMenuGroup", "DropdownMenuSubContent"],
        fieldOverrides: commonFieldOverrides()
    },
    DropdownMenuSeparator: {
        component: DropdownMenuSeparator,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenuContent", "DropdownMenuGroup", "DropdownMenuSubContent"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    DropdownMenuShortcut: {
        component: DropdownMenuShortcut,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenuItem", "DropdownMenuCheckboxItem", "DropdownMenuRadioItem"],
        fieldOverrides: commonFieldOverrides()
    },
    DropdownMenuGroup: {
        component: DropdownMenuGroup,
        schema: z.object({
            children: z.any().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenuContent"],
        fieldOverrides: {
            children: (layer) => childrenFieldOverrides(layer)
        }
    },
    DropdownMenuSub: {
        component: DropdownMenuSub,
        schema: z.object({
            children: z.any().optional(),
            defaultOpen: z.boolean().optional(),
            open: z.boolean().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenuContent", "DropdownMenuGroup"],
        fieldOverrides: {
            children: (layer) => childrenFieldOverrides(layer)
        }
    },
    DropdownMenuSubContent: {
        component: DropdownMenuSubContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenuSub"],
        fieldOverrides: commonFieldOverrides()
    },
    DropdownMenuSubTrigger: {
        component: DropdownMenuSubTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            inset: z.boolean().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenuSub"],
        fieldOverrides: commonFieldOverrides()
    },
    DropdownMenuRadioGroup: {
        component: DropdownMenuRadioGroup,
        schema: z.object({
            children: z.any().optional(),
            value: z.string().optional(),
        }),
        from: "@/components/ui/dropdown-menu",
        childOf: ["DropdownMenuContent", "DropdownMenuGroup", "DropdownMenuSubContent"],
        fieldOverrides: {
            children: (layer) => childrenFieldOverrides(layer)
        }
    },

    // ============================================
    // SELECT
    // ============================================
    Select: {
        component: Select,
        schema: z.object({
            children: z.any().optional(),
            defaultValue: z.string().optional(),
            value: z.string().optional(),
            defaultOpen: z.boolean().optional(),
            open: z.boolean().optional(),
            disabled: z.boolean().optional(),
            name: z.string().optional(),
            required: z.boolean().optional(),
        }),
        from: "@/components/ui/select",
        defaultChildren: [
            {
                id: "select-trigger",
                type: "SelectTrigger",
                name: "SelectTrigger",
                props: { className: "w-[180px]" },
                children: [
                    { id: "select-value", type: "SelectValue", name: "SelectValue", props: { placeholder: "Select an option" }, children: [] },
                ],
            },
            {
                id: "select-content",
                type: "SelectContent",
                name: "SelectContent",
                props: {},
                children: [
                    { id: "select-item-1", type: "SelectItem", name: "SelectItem", props: { value: "option1" }, children: [{ id: "si1-text", type: "span", name: "span", props: {}, children: "Option 1" } satisfies ComponentLayer] },
                    { id: "select-item-2", type: "SelectItem", name: "SelectItem", props: { value: "option2" }, children: [{ id: "si2-text", type: "span", name: "span", props: {}, children: "Option 2" } satisfies ComponentLayer] },
                    { id: "select-item-3", type: "SelectItem", name: "SelectItem", props: { value: "option3" }, children: [{ id: "si3-text", type: "span", name: "span", props: {}, children: "Option 3" } satisfies ComponentLayer] },
                ],
            },
        ],
        fieldOverrides: {
            children: (layer) => childrenFieldOverrides(layer)
        }
    },
    SelectGroup: {
        component: SelectGroup,
        schema: z.object({
            children: z.any().optional(),
        }),
        from: "@/components/ui/select",
        childOf: ["SelectContent"],
        fieldOverrides: {
            children: (layer) => childrenFieldOverrides(layer)
        }
    },
    SelectValue: {
        component: SelectValue,
        schema: z.object({
            className: z.string().optional(),
            placeholder: z.string().optional(),
        }),
        from: "@/components/ui/select",
        childOf: ["SelectTrigger"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    SelectTrigger: {
        component: SelectTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/select",
        childOf: ["Select"],
        fieldOverrides: commonFieldOverrides()
    },
    SelectContent: {
        component: SelectContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            position: z.enum(["popper", "item-aligned"]).optional(),
        }),
        from: "@/components/ui/select",
        childOf: ["Select"],
        fieldOverrides: commonFieldOverrides()
    },
    SelectLabel: {
        component: SelectLabel,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/select",
        childOf: ["SelectContent", "SelectGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    SelectItem: {
        component: SelectItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            value: z.string(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/select",
        childOf: ["SelectContent", "SelectGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    SelectSeparator: {
        component: SelectSeparator,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/select",
        childOf: ["SelectContent", "SelectGroup"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },

    // ============================================
    // POPOVER
    // ============================================
    Popover: {
        component: Popover,
        schema: z.object({
            children: z.any().optional(),
            defaultOpen: z.boolean().optional(),
            open: z.boolean().optional(),
            modal: z.boolean().optional(),
        }),
        from: "@/components/ui/popover",
        defaultChildren: [
            {
                id: "popover-trigger",
                type: "PopoverTrigger",
                name: "PopoverTrigger",
                props: { asChild: true },
                children: [
                    {
                        id: "popover-trigger-button",
                        type: "Button",
                        name: "Button",
                        props: { variant: "outline" },
                        children: [
                            { id: "popover-trigger-text", type: "span", name: "span", props: {}, children: "Open Popover" } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
            {
                id: "popover-content",
                type: "PopoverContent",
                name: "PopoverContent",
                props: {},
                children: [
                    { id: "popover-content-text", type: "span", name: "span", props: {}, children: "Popover content here" } satisfies ComponentLayer,
                ],
            },
        ],
        fieldOverrides: {
            children: (layer) => childrenFieldOverrides(layer)
        }
    },
    PopoverTrigger: {
        component: PopoverTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/popover",
        childOf: ["Popover"],
        fieldOverrides: commonFieldOverrides()
    },
    PopoverContent: {
        component: PopoverContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            align: z.enum(["start", "center", "end"]).optional(),
            side: z.enum(["top", "right", "bottom", "left"]).optional(),
            sideOffset: z.number().optional(),
        }),
        from: "@/components/ui/popover",
        childOf: ["Popover"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // TOOLTIP
    // ============================================
    TooltipProvider: {
        component: TooltipProvider,
        schema: z.object({
            children: z.any().optional(),
            delayDuration: z.number().optional(),
            skipDelayDuration: z.number().optional(),
        }),
        from: "@/components/ui/tooltip",
        fieldOverrides: {
            children: (layer) => childrenFieldOverrides(layer)
        }
    },
    Tooltip: {
        component: Tooltip,
        schema: z.object({
            children: z.any().optional(),
            defaultOpen: z.boolean().optional(),
            open: z.boolean().optional(),
            delayDuration: z.number().optional(),
        }),
        from: "@/components/ui/tooltip",
        defaultChildren: [
            {
                id: "tooltip-trigger",
                type: "TooltipTrigger",
                name: "TooltipTrigger",
                props: { asChild: true },
                children: [
                    {
                        id: "tooltip-trigger-button",
                        type: "Button",
                        name: "Button",
                        props: { variant: "outline" },
                        children: [
                            { id: "tooltip-trigger-text", type: "span", name: "span", props: {}, children: "Hover me" } satisfies ComponentLayer,
                        ],
                    },
                ],
            },
            {
                id: "tooltip-content",
                type: "TooltipContent",
                name: "TooltipContent",
                props: {},
                children: [
                    { id: "tooltip-content-text", type: "span", name: "span", props: {}, children: "Tooltip content" } satisfies ComponentLayer,
                ],
            },
        ],
        fieldOverrides: {
            children: (layer) => childrenFieldOverrides(layer)
        }
    },
    TooltipTrigger: {
        component: TooltipTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/tooltip",
        childOf: ["Tooltip"],
        fieldOverrides: commonFieldOverrides()
    },
    TooltipContent: {
        component: TooltipContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            side: z.enum(["top", "right", "bottom", "left"]).optional(),
            sideOffset: z.number().optional(),
        }),
        from: "@/components/ui/tooltip",
        childOf: ["Tooltip"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // COMMAND
    // ============================================
    Command: {
        component: Command,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/command",
        defaultChildren: [
            { id: "command-input", type: "CommandInput", name: "CommandInput", props: { placeholder: "Type a command or search..." }, children: [] },
            {
                id: "command-list",
                type: "CommandList",
                name: "CommandList",
                props: {},
                children: [
                    { id: "command-empty", type: "CommandEmpty", name: "CommandEmpty", props: {}, children: [{ id: "ce-text", type: "span", name: "span", props: {}, children: "No results found." } satisfies ComponentLayer] },
                    {
                        id: "command-group",
                        type: "CommandGroup",
                        name: "CommandGroup",
                        props: { heading: "Suggestions" },
                        children: [
                            { id: "command-item-1", type: "CommandItem", name: "CommandItem", props: {}, children: [{ id: "ci1-text", type: "span", name: "span", props: {}, children: "Calendar" } satisfies ComponentLayer] },
                            { id: "command-item-2", type: "CommandItem", name: "CommandItem", props: {}, children: [{ id: "ci2-text", type: "span", name: "span", props: {}, children: "Search" } satisfies ComponentLayer] },
                        ],
                    },
                ],
            },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    CommandInput: {
        component: CommandInput,
        schema: z.object({
            className: z.string().optional(),
            placeholder: z.string().optional(),
        }),
        from: "@/components/ui/command",
        childOf: ["Command"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    CommandList: {
        component: CommandList,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/command",
        childOf: ["Command"],
        fieldOverrides: commonFieldOverrides()
    },
    CommandEmpty: {
        component: CommandEmpty,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/command",
        childOf: ["CommandList"],
        fieldOverrides: commonFieldOverrides()
    },
    CommandGroup: {
        component: CommandGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            heading: z.string().optional(),
        }),
        from: "@/components/ui/command",
        childOf: ["CommandList"],
        fieldOverrides: commonFieldOverrides()
    },
    CommandItem: {
        component: CommandItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/command",
        childOf: ["CommandGroup", "CommandList"],
        fieldOverrides: commonFieldOverrides()
    },
    CommandShortcut: {
        component: CommandShortcut,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/command",
        childOf: ["CommandItem"],
        fieldOverrides: commonFieldOverrides()
    },
    CommandSeparator: {
        component: CommandSeparator,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/command",
        childOf: ["CommandList", "CommandGroup"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },

    // ============================================
    // FORM INPUTS
    // ============================================
    Input: {
        component: Input,
        schema: z.object({
            className: z.string().optional(),
            type: z.enum(["text", "password", "email", "number", "tel", "url", "search", "date", "time", "datetime-local", "month", "week", "color", "file", "hidden"]).default("text"),
            placeholder: z.string().optional(),
            disabled: z.boolean().optional(),
            required: z.boolean().optional(),
            name: z.string().optional(),
            id: z.string().optional(),
            defaultValue: z.string().optional(),
        }),
        from: "@/components/ui/input",
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    Textarea: {
        component: Textarea,
        schema: z.object({
            className: z.string().optional(),
            placeholder: z.string().optional(),
            disabled: z.boolean().optional(),
            required: z.boolean().optional(),
            name: z.string().optional(),
            id: z.string().optional(),
            rows: z.number().optional(),
            defaultValue: z.string().optional(),
        }),
        from: "@/components/ui/textarea",
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    Label: {
        component: Label,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            htmlFor: z.string().optional(),
        }),
        from: "@/components/ui/label",
        defaultChildren: "Label",
        fieldOverrides: commonFieldOverrides()
    },
    Checkbox: {
        component: Checkbox,
        schema: z.object({
            className: z.string().optional(),
            checked: z.boolean().optional(),
            defaultChecked: z.boolean().optional(),
            disabled: z.boolean().optional(),
            required: z.boolean().optional(),
            name: z.string().optional(),
            id: z.string().optional(),
        }),
        from: "@/components/ui/checkbox",
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    RadioGroup: {
        component: RadioGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            defaultValue: z.string().optional(),
            value: z.string().optional(),
            disabled: z.boolean().optional(),
            required: z.boolean().optional(),
            name: z.string().optional(),
            orientation: z.enum(["horizontal", "vertical"]).optional(),
        }),
        from: "@/components/ui/radio-group",
        defaultChildren: [
            { id: "radio-item-1", type: "RadioGroupItem", name: "RadioGroupItem", props: { value: "option1", id: "option1" }, children: [] },
            { id: "radio-item-2", type: "RadioGroupItem", name: "RadioGroupItem", props: { value: "option2", id: "option2" }, children: [] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    RadioGroupItem: {
        component: RadioGroupItem,
        schema: z.object({
            className: z.string().optional(),
            value: z.string(),
            id: z.string().optional(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/radio-group",
        childOf: ["RadioGroup"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    Switch: {
        component: Switch,
        schema: z.object({
            className: z.string().optional(),
            checked: z.boolean().optional(),
            defaultChecked: z.boolean().optional(),
            disabled: z.boolean().optional(),
            required: z.boolean().optional(),
            name: z.string().optional(),
            id: z.string().optional(),
        }),
        from: "@/components/ui/switch",
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },

    // ============================================
    // LAYOUT & UTILITY
    // ============================================
    Separator: {
        component: Separator,
        schema: z.object({
            className: z.string().optional(),
            orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
            decorative: z.boolean().optional(),
        }),
        from: "@/components/ui/separator",
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    Skeleton: {
        component: Skeleton,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/skeleton",
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    Toggle: {
        component: Toggle,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            variant: z.enum(["default", "outline"]).default("default"),
            size: z.enum(["default", "sm", "lg"]).default("default"),
            pressed: z.boolean().optional(),
            defaultPressed: z.boolean().optional(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/toggle",
        defaultChildren: [
            { id: "toggle-text", type: "span", name: "span", props: {}, children: "Toggle" } satisfies ComponentLayer,
        ],
        fieldOverrides: commonFieldOverrides()
    },
    ToggleGroup: {
        component: ToggleGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            type: z.enum(["single", "multiple"]).default("single"),
            variant: z.enum(["default", "outline"]).optional(),
            size: z.enum(["default", "sm", "lg"]).optional(),
            disabled: z.boolean().optional(),
            defaultValue: z.union([z.string(), z.array(z.string())]).optional(),
        }),
        from: "@/components/ui/toggle-group",
        defaultChildren: [
            { id: "toggle-group-item-1", type: "ToggleGroupItem", name: "ToggleGroupItem", props: { value: "a" }, children: [{ id: "tgi1-text", type: "span", name: "span", props: {}, children: "A" } satisfies ComponentLayer] },
            { id: "toggle-group-item-2", type: "ToggleGroupItem", name: "ToggleGroupItem", props: { value: "b" }, children: [{ id: "tgi2-text", type: "span", name: "span", props: {}, children: "B" } satisfies ComponentLayer] },
            { id: "toggle-group-item-3", type: "ToggleGroupItem", name: "ToggleGroupItem", props: { value: "c" }, children: [{ id: "tgi3-text", type: "span", name: "span", props: {}, children: "C" } satisfies ComponentLayer] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    ToggleGroupItem: {
        component: ToggleGroupItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            value: z.string(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/toggle-group",
        childOf: ["ToggleGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    Calendar: {
        component: Calendar,
        schema: z.object({
            className: z.string().optional(),
            mode: z.enum(["single", "multiple", "range"]).optional(),
            showOutsideDays: z.boolean().optional(),
            numberOfMonths: z.number().optional(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/calendar",
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },

    // ============================================
    // BREADCRUMB
    // ============================================
    Breadcrumb: {
        component: Breadcrumb,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/breadcrumb",
        defaultChildren: [
            {
                id: "breadcrumb-list",
                type: "BreadcrumbList",
                name: "BreadcrumbList",
                props: {},
                children: [
                    {
                        id: "breadcrumb-item-1",
                        type: "BreadcrumbItem",
                        name: "BreadcrumbItem",
                        props: {},
                        children: [
                            { id: "breadcrumb-link-1", type: "BreadcrumbLink", name: "BreadcrumbLink", props: { href: "/" }, children: [{ id: "bl1-text", type: "span", name: "span", props: {}, children: "Home" } satisfies ComponentLayer] },
                        ],
                    },
                    { id: "breadcrumb-separator-1", type: "BreadcrumbSeparator", name: "BreadcrumbSeparator", props: {}, children: [] },
                    {
                        id: "breadcrumb-item-2",
                        type: "BreadcrumbItem",
                        name: "BreadcrumbItem",
                        props: {},
                        children: [
                            { id: "breadcrumb-page-1", type: "BreadcrumbPage", name: "BreadcrumbPage", props: {}, children: [{ id: "bp1-text", type: "span", name: "span", props: {}, children: "Current Page" } satisfies ComponentLayer] },
                        ],
                    },
                ],
            },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    BreadcrumbList: {
        component: BreadcrumbList,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/breadcrumb",
        childOf: ["Breadcrumb"],
        fieldOverrides: commonFieldOverrides()
    },
    BreadcrumbItem: {
        component: BreadcrumbItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/breadcrumb",
        childOf: ["BreadcrumbList"],
        fieldOverrides: commonFieldOverrides()
    },
    BreadcrumbLink: {
        component: BreadcrumbLink,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            href: z.string().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/breadcrumb",
        childOf: ["BreadcrumbItem"],
        fieldOverrides: commonFieldOverrides()
    },
    BreadcrumbPage: {
        component: BreadcrumbPage,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/breadcrumb",
        childOf: ["BreadcrumbItem"],
        fieldOverrides: commonFieldOverrides()
    },
    BreadcrumbSeparator: {
        component: BreadcrumbSeparator,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/breadcrumb",
        childOf: ["BreadcrumbList"],
        fieldOverrides: commonFieldOverrides()
    },
    BreadcrumbEllipsis: {
        component: BreadcrumbEllipsis,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/breadcrumb",
        childOf: ["BreadcrumbItem"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },

    // ============================================
    // RESIZABLE
    // ============================================
    ResizablePanelGroup: {
        component: ResizablePanelGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            direction: z.enum(["horizontal", "vertical"]).default("horizontal"),
        }),
        from: "@/components/ui/resizable",
        defaultChildren: [
            {
                id: "resizable-panel-1",
                type: "ResizablePanel",
                name: "ResizablePanel",
                props: { defaultSize: 50 },
                children: [
                    { id: "rp1-text", type: "span", name: "span", props: {}, children: "Panel 1" } satisfies ComponentLayer,
                ],
            },
            { id: "resizable-handle", type: "ResizableHandle", name: "ResizableHandle", props: {}, children: [] },
            {
                id: "resizable-panel-2",
                type: "ResizablePanel",
                name: "ResizablePanel",
                props: { defaultSize: 50 },
                children: [
                    { id: "rp2-text", type: "span", name: "span", props: {}, children: "Panel 2" } satisfies ComponentLayer,
                ],
            },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    ResizablePanel: {
        component: ResizablePanel,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            defaultSize: z.number().optional(),
            minSize: z.number().optional(),
            maxSize: z.number().optional(),
            collapsible: z.boolean().optional(),
            collapsedSize: z.number().optional(),
        }),
        from: "@/components/ui/resizable",
        childOf: ["ResizablePanelGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    ResizableHandle: {
        component: ResizableHandle,
        schema: z.object({
            className: z.string().optional(),
            withHandle: z.boolean().optional(),
        }),
        from: "@/components/ui/resizable",
        childOf: ["ResizablePanelGroup"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },

    // ============================================
    // SIDEBAR (Core components only)
    // ============================================
    SidebarProvider: {
        component: SidebarProvider,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            defaultOpen: z.boolean().optional(),
            open: z.boolean().optional(),
        }),
        from: "@/components/ui/sidebar",
        fieldOverrides: commonFieldOverrides()
    },
    Sidebar: {
        component: Sidebar,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            side: z.enum(["left", "right"]).optional(),
            variant: z.enum(["sidebar", "floating", "inset"]).optional(),
            collapsible: z.enum(["offcanvas", "icon", "none"]).optional(),
        }),
        from: "@/components/ui/sidebar",
        defaultChildren: [
            { id: "sidebar-header", type: "SidebarHeader", name: "SidebarHeader", props: {}, children: [{ id: "sh-text", type: "span", name: "span", props: {}, children: "Sidebar Header" } satisfies ComponentLayer] },
            { id: "sidebar-content", type: "SidebarContent", name: "SidebarContent", props: {}, children: [{ id: "sc-text", type: "span", name: "span", props: {}, children: "Sidebar Content" } satisfies ComponentLayer] },
            { id: "sidebar-footer", type: "SidebarFooter", name: "SidebarFooter", props: {}, children: [{ id: "sf-text", type: "span", name: "span", props: {}, children: "Sidebar Footer" } satisfies ComponentLayer] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarHeader: {
        component: SidebarHeader,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["Sidebar"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarContent: {
        component: SidebarContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["Sidebar"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarFooter: {
        component: SidebarFooter,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["Sidebar"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarGroup: {
        component: SidebarGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarContent", "SidebarHeader", "SidebarFooter"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarGroupLabel: {
        component: SidebarGroupLabel,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarGroupAction: {
        component: SidebarGroupAction,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarGroupContent: {
        component: SidebarGroupContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarMenu: {
        component: SidebarMenu,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarGroupContent", "SidebarHeader", "SidebarFooter"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarMenuItem: {
        component: SidebarMenuItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarMenu"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarMenuButton: {
        component: SidebarMenuButton,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
            isActive: z.boolean().optional(),
            variant: z.enum(["default", "outline"]).optional(),
            size: z.enum(["default", "sm", "lg"]).optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarMenuItem"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarMenuAction: {
        component: SidebarMenuAction,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
            showOnHover: z.boolean().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarMenuItem"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarMenuBadge: {
        component: SidebarMenuBadge,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarMenuItem"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarMenuSkeleton: {
        component: SidebarMenuSkeleton,
        schema: z.object({
            className: z.string().optional(),
            showIcon: z.boolean().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarMenuItem"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    SidebarMenuSub: {
        component: SidebarMenuSub,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarMenuItem"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarMenuSubItem: {
        component: SidebarMenuSubItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarMenuSub"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarMenuSubButton: {
        component: SidebarMenuSubButton,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
            size: z.enum(["sm", "md"]).optional(),
            isActive: z.boolean().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarMenuSubItem"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarInput: {
        component: SidebarInput,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarHeader", "SidebarGroup"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    SidebarInset: {
        component: SidebarInset,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarProvider"],
        fieldOverrides: commonFieldOverrides()
    },
    SidebarRail: {
        component: SidebarRail,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["Sidebar"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    SidebarSeparator: {
        component: SidebarSeparator,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["Sidebar", "SidebarContent", "SidebarGroup"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },
    SidebarTrigger: {
        component: SidebarTrigger,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/sidebar",
        childOf: ["SidebarHeader", "SidebarInset"],
        fieldOverrides: {
            className: (layer) => classNameFieldOverrides(layer)
        }
    },

    // ============================================
    // ALERT
    // ============================================
    Alert: {
        component: Alert,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            variant: z.enum(["default", "destructive"]).optional(),
        }),
        from: "@/components/ui/alert",
        defaultChildren: [
            { id: "alert-title", type: "AlertTitle", name: "AlertTitle", props: {}, children: [{ id: "at-text", type: "span", name: "span", props: {}, children: "Alert Title" } satisfies ComponentLayer] },
            { id: "alert-desc", type: "AlertDescription", name: "AlertDescription", props: {}, children: [{ id: "ad-text", type: "span", name: "span", props: {}, children: "Alert description text." } satisfies ComponentLayer] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    AlertTitle: {
        component: AlertTitle,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/alert",
        childOf: ["Alert"],
        fieldOverrides: commonFieldOverrides()
    },
    AlertDescription: {
        component: AlertDescription,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/alert",
        childOf: ["Alert"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // ALERT DIALOG
    // ============================================
    AlertDialog: {
        component: AlertDialog,
        schema: z.object({
            children: z.any().optional(),
            defaultOpen: z.boolean().optional(),
            open: z.boolean().optional(),
        }),
        from: "@/components/ui/alert-dialog",
        defaultChildren: [
            { id: "alertdialog-trigger", type: "AlertDialogTrigger", name: "AlertDialogTrigger", props: { asChild: true }, children: [{ id: "adt-btn", type: "Button", name: "Button", props: { variant: "outline" }, children: [{ id: "adt-text", type: "span", name: "span", props: {}, children: "Open Alert" } satisfies ComponentLayer] } satisfies ComponentLayer] },
            { id: "alertdialog-content", type: "AlertDialogContent", name: "AlertDialogContent", props: {}, children: [
                { id: "adc-header", type: "AlertDialogHeader", name: "AlertDialogHeader", props: {}, children: [
                    { id: "adc-title", type: "AlertDialogTitle", name: "AlertDialogTitle", props: {}, children: [{ id: "adct-text", type: "span", name: "span", props: {}, children: "Are you sure?" } satisfies ComponentLayer] },
                    { id: "adc-desc", type: "AlertDialogDescription", name: "AlertDialogDescription", props: {}, children: [{ id: "adcd-text", type: "span", name: "span", props: {}, children: "This action cannot be undone." } satisfies ComponentLayer] },
                ] },
                { id: "adc-footer", type: "AlertDialogFooter", name: "AlertDialogFooter", props: {}, children: [
                    { id: "adc-cancel", type: "AlertDialogCancel", name: "AlertDialogCancel", props: {}, children: [{ id: "adcc-text", type: "span", name: "span", props: {}, children: "Cancel" } satisfies ComponentLayer] },
                    { id: "adc-action", type: "AlertDialogAction", name: "AlertDialogAction", props: {}, children: [{ id: "adca-text", type: "span", name: "span", props: {}, children: "Continue" } satisfies ComponentLayer] },
                ] },
            ] },
        ],
        fieldOverrides: { children: (layer) => childrenFieldOverrides(layer) }
    },
    AlertDialogTrigger: {
        component: AlertDialogTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/alert-dialog",
        childOf: ["AlertDialog"],
        fieldOverrides: commonFieldOverrides()
    },
    AlertDialogContent: {
        component: AlertDialogContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/alert-dialog",
        childOf: ["AlertDialog"],
        fieldOverrides: commonFieldOverrides()
    },
    AlertDialogHeader: {
        component: AlertDialogHeader,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/alert-dialog",
        childOf: ["AlertDialogContent"],
        fieldOverrides: commonFieldOverrides()
    },
    AlertDialogFooter: {
        component: AlertDialogFooter,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/alert-dialog",
        childOf: ["AlertDialogContent"],
        fieldOverrides: commonFieldOverrides()
    },
    AlertDialogTitle: {
        component: AlertDialogTitle,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/alert-dialog",
        childOf: ["AlertDialogHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    AlertDialogDescription: {
        component: AlertDialogDescription,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/alert-dialog",
        childOf: ["AlertDialogHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    AlertDialogAction: {
        component: AlertDialogAction,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/alert-dialog",
        childOf: ["AlertDialogFooter"],
        fieldOverrides: commonFieldOverrides()
    },
    AlertDialogCancel: {
        component: AlertDialogCancel,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/alert-dialog",
        childOf: ["AlertDialogFooter"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // ASPECT RATIO
    // ============================================
    AspectRatio: {
        component: AspectRatio,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            ratio: z.coerce.number().optional(),
        }),
        from: "@/components/ui/aspect-ratio",
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // AVATAR
    // ============================================
    Avatar: {
        component: Avatar,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/avatar",
        defaultChildren: [
            { id: "avatar-image", type: "AvatarImage", name: "AvatarImage", props: { src: "https://github.com/shadcn.png", alt: "Avatar" }, children: [] },
            { id: "avatar-fallback", type: "AvatarFallback", name: "AvatarFallback", props: {}, children: [{ id: "af-text", type: "span", name: "span", props: {}, children: "CN" } satisfies ComponentLayer] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    AvatarImage: {
        component: AvatarImage,
        schema: z.object({
            className: z.string().optional(),
            src: z.string().optional(),
            alt: z.string().optional(),
        }),
        from: "@/components/ui/avatar",
        childOf: ["Avatar"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },
    AvatarFallback: {
        component: AvatarFallback,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/avatar",
        childOf: ["Avatar"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // CAROUSEL
    // ============================================
    Carousel: {
        component: Carousel,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            orientation: z.enum(["horizontal", "vertical"]).optional(),
        }),
        from: "@/components/ui/carousel",
        defaultChildren: [
            { id: "carousel-content", type: "CarouselContent", name: "CarouselContent", props: {}, children: [
                { id: "carousel-item-1", type: "CarouselItem", name: "CarouselItem", props: {}, children: [{ id: "ci1-text", type: "span", name: "span", props: {}, children: "Slide 1" } satisfies ComponentLayer] },
                { id: "carousel-item-2", type: "CarouselItem", name: "CarouselItem", props: {}, children: [{ id: "ci2-text", type: "span", name: "span", props: {}, children: "Slide 2" } satisfies ComponentLayer] },
                { id: "carousel-item-3", type: "CarouselItem", name: "CarouselItem", props: {}, children: [{ id: "ci3-text", type: "span", name: "span", props: {}, children: "Slide 3" } satisfies ComponentLayer] },
            ] },
            { id: "carousel-prev", type: "CarouselPrevious", name: "CarouselPrevious", props: {}, children: [] },
            { id: "carousel-next", type: "CarouselNext", name: "CarouselNext", props: {}, children: [] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    CarouselContent: {
        component: CarouselContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/carousel",
        childOf: ["Carousel"],
        fieldOverrides: commonFieldOverrides()
    },
    CarouselItem: {
        component: CarouselItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/carousel",
        childOf: ["CarouselContent"],
        fieldOverrides: commonFieldOverrides()
    },
    CarouselPrevious: {
        component: CarouselPrevious,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/carousel",
        childOf: ["Carousel"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },
    CarouselNext: {
        component: CarouselNext,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/carousel",
        childOf: ["Carousel"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },

    // ============================================
    // CHART (Note: Chart requires special config prop)
    // ============================================
    ChartContainer: {
        component: ChartContainer,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/chart",
        fieldOverrides: commonFieldOverrides()
    },
    ChartTooltip: {
        component: ChartTooltip,
        schema: z.object({
            cursor: z.boolean().optional(),
            content: z.any().optional(),
        }),
        from: "@/components/ui/chart",
        childOf: ["ChartContainer"],
        fieldOverrides: {}
    },
    ChartTooltipContent: {
        component: ChartTooltipContent,
        schema: z.object({
            className: z.string().optional(),
            hideLabel: z.boolean().optional(),
            hideIndicator: z.boolean().optional(),
            indicator: z.enum(["line", "dot", "dashed"]).optional(),
            nameKey: z.string().optional(),
            labelKey: z.string().optional(),
        }),
        from: "@/components/ui/chart",
        childOf: ["ChartTooltip"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },
    ChartLegend: {
        component: ChartLegend,
        schema: z.object({
            content: z.any().optional(),
        }),
        from: "@/components/ui/chart",
        childOf: ["ChartContainer"],
        fieldOverrides: {}
    },
    ChartLegendContent: {
        component: ChartLegendContent,
        schema: z.object({
            className: z.string().optional(),
            hideIcon: z.boolean().optional(),
            nameKey: z.string().optional(),
        }),
        from: "@/components/ui/chart",
        childOf: ["ChartLegend"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },

    // ============================================
    // COLLAPSIBLE
    // ============================================
    Collapsible: {
        component: Collapsible,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            defaultOpen: z.boolean().optional(),
            open: z.boolean().optional(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/collapsible",
        defaultChildren: [
            { id: "collapsible-trigger", type: "CollapsibleTrigger", name: "CollapsibleTrigger", props: { asChild: true }, children: [{ id: "ct-btn", type: "Button", name: "Button", props: { variant: "ghost" }, children: [{ id: "ct-text", type: "span", name: "span", props: {}, children: "Toggle" } satisfies ComponentLayer] } satisfies ComponentLayer] },
            { id: "collapsible-content", type: "CollapsibleContent", name: "CollapsibleContent", props: {}, children: [{ id: "cc-text", type: "span", name: "span", props: {}, children: "Collapsible content here" } satisfies ComponentLayer] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    CollapsibleTrigger: {
        component: CollapsibleTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/collapsible",
        childOf: ["Collapsible"],
        fieldOverrides: commonFieldOverrides()
    },
    CollapsibleContent: {
        component: CollapsibleContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/collapsible",
        childOf: ["Collapsible"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // CONTEXT MENU
    // ============================================
    ContextMenu: {
        component: ContextMenu,
        schema: z.object({
            children: z.any().optional(),
        }),
        from: "@/components/ui/context-menu",
        defaultChildren: [
            { id: "contextmenu-trigger", type: "ContextMenuTrigger", name: "ContextMenuTrigger", props: { className: "flex h-24 w-48 items-center justify-center rounded-md border border-dashed text-sm" }, children: [{ id: "cmt-text", type: "span", name: "span", props: {}, children: "Right click here" } satisfies ComponentLayer] },
            { id: "contextmenu-content", type: "ContextMenuContent", name: "ContextMenuContent", props: { className: "w-48" }, children: [
                { id: "cmc-item1", type: "ContextMenuItem", name: "ContextMenuItem", props: {}, children: [{ id: "cmi1-text", type: "span", name: "span", props: {}, children: "Menu Item 1" } satisfies ComponentLayer] },
                { id: "cmc-item2", type: "ContextMenuItem", name: "ContextMenuItem", props: {}, children: [{ id: "cmi2-text", type: "span", name: "span", props: {}, children: "Menu Item 2" } satisfies ComponentLayer] },
            ] },
        ],
        fieldOverrides: { children: (layer) => childrenFieldOverrides(layer) }
    },
    ContextMenuTrigger: {
        component: ContextMenuTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenu"],
        fieldOverrides: commonFieldOverrides()
    },
    ContextMenuContent: {
        component: ContextMenuContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenu"],
        fieldOverrides: commonFieldOverrides()
    },
    ContextMenuItem: {
        component: ContextMenuItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            inset: z.boolean().optional(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenuContent", "ContextMenuGroup", "ContextMenuSubContent"],
        fieldOverrides: commonFieldOverrides()
    },
    ContextMenuCheckboxItem: {
        component: ContextMenuCheckboxItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            checked: z.boolean().optional(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenuContent", "ContextMenuGroup", "ContextMenuSubContent"],
        fieldOverrides: commonFieldOverrides()
    },
    ContextMenuRadioItem: {
        component: ContextMenuRadioItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            value: z.string(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenuRadioGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    ContextMenuLabel: {
        component: ContextMenuLabel,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            inset: z.boolean().optional(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenuContent", "ContextMenuGroup", "ContextMenuSubContent"],
        fieldOverrides: commonFieldOverrides()
    },
    ContextMenuSeparator: {
        component: ContextMenuSeparator,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenuContent", "ContextMenuGroup", "ContextMenuSubContent"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },
    ContextMenuShortcut: {
        component: ContextMenuShortcut,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenuItem", "ContextMenuCheckboxItem", "ContextMenuRadioItem"],
        fieldOverrides: commonFieldOverrides()
    },
    ContextMenuGroup: {
        component: ContextMenuGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenuContent"],
        fieldOverrides: commonFieldOverrides()
    },
    ContextMenuSub: {
        component: ContextMenuSub,
        schema: z.object({
            children: z.any().optional(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenuContent", "ContextMenuGroup"],
        fieldOverrides: { children: (layer) => childrenFieldOverrides(layer) }
    },
    ContextMenuSubContent: {
        component: ContextMenuSubContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenuSub"],
        fieldOverrides: commonFieldOverrides()
    },
    ContextMenuSubTrigger: {
        component: ContextMenuSubTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            inset: z.boolean().optional(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenuSub"],
        fieldOverrides: commonFieldOverrides()
    },
    ContextMenuRadioGroup: {
        component: ContextMenuRadioGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            value: z.string().optional(),
        }),
        from: "@/components/ui/context-menu",
        childOf: ["ContextMenuContent", "ContextMenuGroup", "ContextMenuSubContent"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // DRAWER
    // ============================================
    Drawer: {
        component: Drawer,
        schema: z.object({
            children: z.any().optional(),
            shouldScaleBackground: z.boolean().optional(),
        }),
        from: "@/components/ui/drawer",
        defaultChildren: [
            { id: "drawer-trigger", type: "DrawerTrigger", name: "DrawerTrigger", props: { asChild: true }, children: [{ id: "dt-btn", type: "Button", name: "Button", props: { variant: "outline" }, children: [{ id: "dt-text", type: "span", name: "span", props: {}, children: "Open Drawer" } satisfies ComponentLayer] } satisfies ComponentLayer] },
            { id: "drawer-content", type: "DrawerContent", name: "DrawerContent", props: {}, children: [
                { id: "dc-header", type: "DrawerHeader", name: "DrawerHeader", props: {}, children: [
                    { id: "dc-title", type: "DrawerTitle", name: "DrawerTitle", props: {}, children: [{ id: "dct-text", type: "span", name: "span", props: {}, children: "Drawer Title" } satisfies ComponentLayer] },
                    { id: "dc-desc", type: "DrawerDescription", name: "DrawerDescription", props: {}, children: [{ id: "dcd-text", type: "span", name: "span", props: {}, children: "Drawer description" } satisfies ComponentLayer] },
                ] },
                { id: "dc-footer", type: "DrawerFooter", name: "DrawerFooter", props: {}, children: [
                    { id: "df-close", type: "DrawerClose", name: "DrawerClose", props: { asChild: true }, children: [{ id: "dfc-btn", type: "Button", name: "Button", props: { variant: "outline" }, children: [{ id: "dfc-text", type: "span", name: "span", props: {}, children: "Close" } satisfies ComponentLayer] } satisfies ComponentLayer] },
                ] },
            ] },
        ],
        fieldOverrides: { children: (layer) => childrenFieldOverrides(layer) }
    },
    DrawerTrigger: {
        component: DrawerTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/drawer",
        childOf: ["Drawer"],
        fieldOverrides: commonFieldOverrides()
    },
    DrawerContent: {
        component: DrawerContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/drawer",
        childOf: ["Drawer"],
        fieldOverrides: commonFieldOverrides()
    },
    DrawerHeader: {
        component: DrawerHeader,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/drawer",
        childOf: ["DrawerContent"],
        fieldOverrides: commonFieldOverrides()
    },
    DrawerFooter: {
        component: DrawerFooter,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/drawer",
        childOf: ["DrawerContent"],
        fieldOverrides: commonFieldOverrides()
    },
    DrawerTitle: {
        component: DrawerTitle,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/drawer",
        childOf: ["DrawerHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    DrawerDescription: {
        component: DrawerDescription,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/drawer",
        childOf: ["DrawerHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    DrawerClose: {
        component: DrawerClose,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/drawer",
        childOf: ["DrawerContent", "DrawerFooter"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // HOVER CARD
    // ============================================
    HoverCard: {
        component: HoverCard,
        schema: z.object({
            children: z.any().optional(),
            openDelay: z.coerce.number().optional(),
            closeDelay: z.coerce.number().optional(),
        }),
        from: "@/components/ui/hover-card",
        defaultChildren: [
            { id: "hovercard-trigger", type: "HoverCardTrigger", name: "HoverCardTrigger", props: { asChild: true }, children: [{ id: "hct-btn", type: "Button", name: "Button", props: { variant: "link" }, children: [{ id: "hct-text", type: "span", name: "span", props: {}, children: "Hover me" } satisfies ComponentLayer] } satisfies ComponentLayer] },
            { id: "hovercard-content", type: "HoverCardContent", name: "HoverCardContent", props: { className: "w-80" }, children: [{ id: "hcc-text", type: "span", name: "span", props: {}, children: "Hover card content" } satisfies ComponentLayer] },
        ],
        fieldOverrides: { children: (layer) => childrenFieldOverrides(layer) }
    },
    HoverCardTrigger: {
        component: HoverCardTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/hover-card",
        childOf: ["HoverCard"],
        fieldOverrides: commonFieldOverrides()
    },
    HoverCardContent: {
        component: HoverCardContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            align: z.enum(["start", "center", "end"]).optional(),
            sideOffset: z.coerce.number().optional(),
        }),
        from: "@/components/ui/hover-card",
        childOf: ["HoverCard"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // INPUT OTP
    // ============================================
    InputOTP: {
        component: InputOTP,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            maxLength: z.coerce.number().default(6),
        }),
        from: "@/components/ui/input-otp",
        defaultChildren: [
            { id: "inputotp-group", type: "InputOTPGroup", name: "InputOTPGroup", props: {}, children: [
                { id: "otp-slot-0", type: "InputOTPSlot", name: "InputOTPSlot", props: { index: 0 }, children: [] },
                { id: "otp-slot-1", type: "InputOTPSlot", name: "InputOTPSlot", props: { index: 1 }, children: [] },
                { id: "otp-slot-2", type: "InputOTPSlot", name: "InputOTPSlot", props: { index: 2 }, children: [] },
                { id: "otp-sep", type: "InputOTPSeparator", name: "InputOTPSeparator", props: {}, children: [] },
                { id: "otp-slot-3", type: "InputOTPSlot", name: "InputOTPSlot", props: { index: 3 }, children: [] },
                { id: "otp-slot-4", type: "InputOTPSlot", name: "InputOTPSlot", props: { index: 4 }, children: [] },
                { id: "otp-slot-5", type: "InputOTPSlot", name: "InputOTPSlot", props: { index: 5 }, children: [] },
            ] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    InputOTPGroup: {
        component: InputOTPGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/input-otp",
        childOf: ["InputOTP"],
        fieldOverrides: commonFieldOverrides()
    },
    InputOTPSlot: {
        component: InputOTPSlot,
        schema: z.object({
            className: z.string().optional(),
            index: z.coerce.number(),
        }),
        from: "@/components/ui/input-otp",
        childOf: ["InputOTPGroup"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },
    InputOTPSeparator: {
        component: InputOTPSeparator,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/input-otp",
        childOf: ["InputOTPGroup"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },

    // ============================================
    // PAGINATION
    // ============================================
    Pagination: {
        component: Pagination,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/pagination",
        defaultChildren: [
            { id: "pagination-content", type: "PaginationContent", name: "PaginationContent", props: {}, children: [
                { id: "pagination-prev", type: "PaginationItem", name: "PaginationItem", props: {}, children: [{ id: "pp-link", type: "PaginationPrevious", name: "PaginationPrevious", props: { href: "#" }, children: [] }] },
                { id: "pagination-1", type: "PaginationItem", name: "PaginationItem", props: {}, children: [{ id: "p1-link", type: "PaginationLink", name: "PaginationLink", props: { href: "#" }, children: [{ id: "p1-text", type: "span", name: "span", props: {}, children: "1" } satisfies ComponentLayer] }] },
                { id: "pagination-2", type: "PaginationItem", name: "PaginationItem", props: {}, children: [{ id: "p2-link", type: "PaginationLink", name: "PaginationLink", props: { href: "#", isActive: true }, children: [{ id: "p2-text", type: "span", name: "span", props: {}, children: "2" } satisfies ComponentLayer] }] },
                { id: "pagination-3", type: "PaginationItem", name: "PaginationItem", props: {}, children: [{ id: "p3-link", type: "PaginationLink", name: "PaginationLink", props: { href: "#" }, children: [{ id: "p3-text", type: "span", name: "span", props: {}, children: "3" } satisfies ComponentLayer] }] },
                { id: "pagination-ellipsis", type: "PaginationItem", name: "PaginationItem", props: {}, children: [{ id: "pe-el", type: "PaginationEllipsis", name: "PaginationEllipsis", props: {}, children: [] }] },
                { id: "pagination-next", type: "PaginationItem", name: "PaginationItem", props: {}, children: [{ id: "pn-link", type: "PaginationNext", name: "PaginationNext", props: { href: "#" }, children: [] }] },
            ] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    PaginationContent: {
        component: PaginationContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/pagination",
        childOf: ["Pagination"],
        fieldOverrides: commonFieldOverrides()
    },
    PaginationItem: {
        component: PaginationItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/pagination",
        childOf: ["PaginationContent"],
        fieldOverrides: commonFieldOverrides()
    },
    PaginationLink: {
        component: PaginationLink,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            href: z.string().optional(),
            isActive: z.boolean().optional(),
            size: z.enum(["default", "sm", "lg", "icon"]).optional(),
        }),
        from: "@/components/ui/pagination",
        childOf: ["PaginationItem"],
        fieldOverrides: commonFieldOverrides()
    },
    PaginationPrevious: {
        component: PaginationPrevious,
        schema: z.object({
            className: z.string().optional(),
            href: z.string().optional(),
        }),
        from: "@/components/ui/pagination",
        childOf: ["PaginationItem"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },
    PaginationNext: {
        component: PaginationNext,
        schema: z.object({
            className: z.string().optional(),
            href: z.string().optional(),
        }),
        from: "@/components/ui/pagination",
        childOf: ["PaginationItem"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },
    PaginationEllipsis: {
        component: PaginationEllipsis,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/pagination",
        childOf: ["PaginationItem"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },

    // ============================================
    // PROGRESS
    // ============================================
    Progress: {
        component: Progress,
        schema: z.object({
            className: z.string().optional(),
            value: z.coerce.number().optional(),
        }),
        from: "@/components/ui/progress",
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },

    // ============================================
    // SCROLL AREA
    // ============================================
    ScrollArea: {
        component: ScrollArea,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/scroll-area",
        fieldOverrides: commonFieldOverrides()
    },
    ScrollBar: {
        component: ScrollBar,
        schema: z.object({
            className: z.string().optional(),
            orientation: z.enum(["vertical", "horizontal"]).optional(),
        }),
        from: "@/components/ui/scroll-area",
        childOf: ["ScrollArea"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },

    // ============================================
    // SLIDER
    // ============================================
    Slider: {
        component: Slider,
        schema: z.object({
            className: z.string().optional(),
            defaultValue: z.array(z.coerce.number()).optional(),
            max: z.coerce.number().optional(),
            min: z.coerce.number().optional(),
            step: z.coerce.number().optional(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/slider",
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },

    // ============================================
    // MENUBAR
    // ============================================
    Menubar: {
        component: Menubar,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/menubar",
        defaultChildren: [
            { id: "menubar-menu1", type: "MenubarMenu", name: "MenubarMenu", props: {}, children: [
                { id: "mm1-trigger", type: "MenubarTrigger", name: "MenubarTrigger", props: {}, children: [{ id: "mm1t-text", type: "span", name: "span", props: {}, children: "File" } satisfies ComponentLayer] },
                { id: "mm1-content", type: "MenubarContent", name: "MenubarContent", props: {}, children: [
                    { id: "mm1c-item1", type: "MenubarItem", name: "MenubarItem", props: {}, children: [{ id: "mm1ci1-text", type: "span", name: "span", props: {}, children: "New Tab" } satisfies ComponentLayer] },
                    { id: "mm1c-item2", type: "MenubarItem", name: "MenubarItem", props: {}, children: [{ id: "mm1ci2-text", type: "span", name: "span", props: {}, children: "New Window" } satisfies ComponentLayer] },
                ] },
            ] },
            { id: "menubar-menu2", type: "MenubarMenu", name: "MenubarMenu", props: {}, children: [
                { id: "mm2-trigger", type: "MenubarTrigger", name: "MenubarTrigger", props: {}, children: [{ id: "mm2t-text", type: "span", name: "span", props: {}, children: "Edit" } satisfies ComponentLayer] },
                { id: "mm2-content", type: "MenubarContent", name: "MenubarContent", props: {}, children: [
                    { id: "mm2c-item1", type: "MenubarItem", name: "MenubarItem", props: {}, children: [{ id: "mm2ci1-text", type: "span", name: "span", props: {}, children: "Undo" } satisfies ComponentLayer] },
                    { id: "mm2c-item2", type: "MenubarItem", name: "MenubarItem", props: {}, children: [{ id: "mm2ci2-text", type: "span", name: "span", props: {}, children: "Redo" } satisfies ComponentLayer] },
                ] },
            ] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    MenubarMenu: {
        component: MenubarMenu,
        schema: z.object({
            children: z.any().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["Menubar"],
        fieldOverrides: { children: (layer) => childrenFieldOverrides(layer) }
    },
    MenubarTrigger: {
        component: MenubarTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarMenu"],
        fieldOverrides: commonFieldOverrides()
    },
    MenubarContent: {
        component: MenubarContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            align: z.enum(["start", "center", "end"]).optional(),
            alignOffset: z.coerce.number().optional(),
            sideOffset: z.coerce.number().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarMenu"],
        fieldOverrides: commonFieldOverrides()
    },
    MenubarItem: {
        component: MenubarItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            inset: z.boolean().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarContent", "MenubarGroup", "MenubarSubContent"],
        fieldOverrides: commonFieldOverrides()
    },
    MenubarSeparator: {
        component: MenubarSeparator,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarContent", "MenubarGroup", "MenubarSubContent"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },
    MenubarLabel: {
        component: MenubarLabel,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            inset: z.boolean().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarContent", "MenubarGroup", "MenubarSubContent"],
        fieldOverrides: commonFieldOverrides()
    },
    MenubarCheckboxItem: {
        component: MenubarCheckboxItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            checked: z.boolean().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarContent", "MenubarGroup", "MenubarSubContent"],
        fieldOverrides: commonFieldOverrides()
    },
    MenubarRadioGroup: {
        component: MenubarRadioGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            value: z.string().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarContent", "MenubarGroup", "MenubarSubContent"],
        fieldOverrides: commonFieldOverrides()
    },
    MenubarRadioItem: {
        component: MenubarRadioItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            value: z.string(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarRadioGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    MenubarShortcut: {
        component: MenubarShortcut,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarItem", "MenubarCheckboxItem", "MenubarRadioItem"],
        fieldOverrides: commonFieldOverrides()
    },
    MenubarSub: {
        component: MenubarSub,
        schema: z.object({
            children: z.any().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarContent", "MenubarGroup"],
        fieldOverrides: { children: (layer) => childrenFieldOverrides(layer) }
    },
    MenubarSubContent: {
        component: MenubarSubContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarSub"],
        fieldOverrides: commonFieldOverrides()
    },
    MenubarSubTrigger: {
        component: MenubarSubTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            inset: z.boolean().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarSub"],
        fieldOverrides: commonFieldOverrides()
    },
    MenubarGroup: {
        component: MenubarGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/menubar",
        childOf: ["MenubarContent"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // NAVIGATION MENU
    // ============================================
    NavigationMenu: {
        component: NavigationMenu,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/navigation-menu",
        defaultChildren: [
            { id: "navmenu-list", type: "NavigationMenuList", name: "NavigationMenuList", props: {}, children: [
                { id: "nm-item1", type: "NavigationMenuItem", name: "NavigationMenuItem", props: {}, children: [
                    { id: "nmi1-trigger", type: "NavigationMenuTrigger", name: "NavigationMenuTrigger", props: {}, children: [{ id: "nmi1t-text", type: "span", name: "span", props: {}, children: "Getting Started" } satisfies ComponentLayer] },
                    { id: "nmi1-content", type: "NavigationMenuContent", name: "NavigationMenuContent", props: {}, children: [{ id: "nmi1c-text", type: "span", name: "span", props: {}, children: "Content here" } satisfies ComponentLayer] },
                ] },
                { id: "nm-item2", type: "NavigationMenuItem", name: "NavigationMenuItem", props: {}, children: [
                    { id: "nmi2-link", type: "NavigationMenuLink", name: "NavigationMenuLink", props: { className: "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" }, children: [{ id: "nmi2l-text", type: "span", name: "span", props: {}, children: "Documentation" } satisfies ComponentLayer] },
                ] },
            ] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    NavigationMenuList: {
        component: NavigationMenuList,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/navigation-menu",
        childOf: ["NavigationMenu"],
        fieldOverrides: commonFieldOverrides()
    },
    NavigationMenuItem: {
        component: NavigationMenuItem,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/navigation-menu",
        childOf: ["NavigationMenuList"],
        fieldOverrides: commonFieldOverrides()
    },
    NavigationMenuContent: {
        component: NavigationMenuContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/navigation-menu",
        childOf: ["NavigationMenuItem"],
        fieldOverrides: commonFieldOverrides()
    },
    NavigationMenuTrigger: {
        component: NavigationMenuTrigger,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/navigation-menu",
        childOf: ["NavigationMenuItem"],
        fieldOverrides: commonFieldOverrides()
    },
    NavigationMenuLink: {
        component: NavigationMenuLink,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/navigation-menu",
        childOf: ["NavigationMenuItem", "NavigationMenuContent"],
        fieldOverrides: commonFieldOverrides()
    },
    NavigationMenuIndicator: {
        component: NavigationMenuIndicator,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/navigation-menu",
        childOf: ["NavigationMenuList"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },
    NavigationMenuViewport: {
        component: NavigationMenuViewport,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/navigation-menu",
        childOf: ["NavigationMenu"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },

    // ============================================
    // BUTTON GROUP
    // ============================================
    ButtonGroup: {
        component: ButtonGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            orientation: z.enum(["horizontal", "vertical"]).optional(),
        }),
        from: "@/components/ui/button-group",
        defaultChildren: [
            { id: "bg-btn1", type: "Button", name: "Button", props: { variant: "outline" }, children: [{ id: "bg-btn1-text", type: "span", name: "span", props: {}, children: "Button 1" } satisfies ComponentLayer] },
            { id: "bg-btn2", type: "Button", name: "Button", props: { variant: "outline" }, children: [{ id: "bg-btn2-text", type: "span", name: "span", props: {}, children: "Button 2" } satisfies ComponentLayer] },
            { id: "bg-btn3", type: "Button", name: "Button", props: { variant: "outline" }, children: [{ id: "bg-btn3-text", type: "span", name: "span", props: {}, children: "Button 3" } satisfies ComponentLayer] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    ButtonGroupText: {
        component: ButtonGroupText,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/button-group",
        childOf: ["ButtonGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    ButtonGroupSeparator: {
        component: ButtonGroupSeparator,
        schema: z.object({
            className: z.string().optional(),
            orientation: z.enum(["horizontal", "vertical"]).optional(),
        }),
        from: "@/components/ui/button-group",
        childOf: ["ButtonGroup"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },

    // ============================================
    // EMPTY
    // ============================================
    Empty: {
        component: Empty,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/empty",
        defaultChildren: [
            { id: "empty-header", type: "EmptyHeader", name: "EmptyHeader", props: {}, children: [
                { id: "eh-media", type: "EmptyMedia", name: "EmptyMedia", props: { variant: "icon" }, children: [] },
                { id: "eh-title", type: "EmptyTitle", name: "EmptyTitle", props: {}, children: [{ id: "eht-text", type: "span", name: "span", props: {}, children: "No items found" } satisfies ComponentLayer] },
                { id: "eh-desc", type: "EmptyDescription", name: "EmptyDescription", props: {}, children: [{ id: "ehd-text", type: "span", name: "span", props: {}, children: "There are no items to display." } satisfies ComponentLayer] },
            ] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    EmptyHeader: {
        component: EmptyHeader,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/empty",
        childOf: ["Empty"],
        fieldOverrides: commonFieldOverrides()
    },
    EmptyTitle: {
        component: EmptyTitle,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/empty",
        childOf: ["EmptyHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    EmptyDescription: {
        component: EmptyDescription,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/empty",
        childOf: ["EmptyHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    EmptyContent: {
        component: EmptyContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/empty",
        childOf: ["Empty"],
        fieldOverrides: commonFieldOverrides()
    },
    EmptyMedia: {
        component: EmptyMedia,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            variant: z.enum(["default", "icon"]).optional(),
        }),
        from: "@/components/ui/empty",
        childOf: ["EmptyHeader"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // KBD
    // ============================================
    Kbd: {
        component: Kbd,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/kbd",
        defaultChildren: [
            { id: "kbd-text", type: "span", name: "span", props: {}, children: "⌘K" } satisfies ComponentLayer,
        ],
        fieldOverrides: commonFieldOverrides()
    },
    KbdGroup: {
        component: KbdGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/kbd",
        childOf: ["Kbd"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // SPINNER
    // ============================================
    Spinner: {
        component: Spinner,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/spinner",
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },

    // ============================================
    // FIELD
    // ============================================
    Field: {
        component: Field,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            orientation: z.enum(["vertical", "horizontal", "responsive"]).optional(),
        }),
        from: "@/components/ui/field",
        defaultChildren: [
            { id: "field-label", type: "FieldLabel", name: "FieldLabel", props: {}, children: [{ id: "fl-text", type: "span", name: "span", props: {}, children: "Label" } satisfies ComponentLayer] },
            { id: "field-input", type: "Input", name: "Input", props: { placeholder: "Enter value..." }, children: [] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    FieldSet: {
        component: FieldSet,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/field",
        childOf: ["Field"],
        fieldOverrides: commonFieldOverrides()
    },
    FieldLegend: {
        component: FieldLegend,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            variant: z.enum(["legend", "label"]).optional(),
        }),
        from: "@/components/ui/field",
        childOf: ["FieldSet"],
        fieldOverrides: commonFieldOverrides()
    },
    FieldGroup: {
        component: FieldGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/field",
        childOf: ["FieldSet", "Field"],
        fieldOverrides: commonFieldOverrides()
    },
    FieldContent: {
        component: FieldContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/field",
        childOf: ["Field"],
        fieldOverrides: commonFieldOverrides()
    },
    FieldLabel: {
        component: FieldLabel,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/field",
        childOf: ["Field"],
        fieldOverrides: commonFieldOverrides()
    },
    FieldTitle: {
        component: FieldTitle,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/field",
        childOf: ["Field"],
        fieldOverrides: commonFieldOverrides()
    },
    FieldDescription: {
        component: FieldDescription,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/field",
        childOf: ["Field"],
        fieldOverrides: commonFieldOverrides()
    },
    FieldSeparator: {
        component: FieldSeparator,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/field",
        childOf: ["FieldSet", "FieldGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    FieldError: {
        component: FieldError,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/field",
        childOf: ["Field"],
        fieldOverrides: commonFieldOverrides()
    },

    // ============================================
    // INPUT GROUP
    // ============================================
    InputGroup: {
        component: InputGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/input-group",
        defaultChildren: [
            { id: "ig-addon", type: "InputGroupAddon", name: "InputGroupAddon", props: {}, children: [{ id: "iga-text", type: "span", name: "span", props: {}, children: "@" } satisfies ComponentLayer] },
            { id: "ig-input", type: "InputGroupInput", name: "InputGroupInput", props: { placeholder: "username" }, children: [] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    InputGroupAddon: {
        component: InputGroupAddon,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            align: z.enum(["inline-start", "inline-end", "block-start", "block-end"]).optional(),
        }),
        from: "@/components/ui/input-group",
        childOf: ["InputGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    InputGroupButton: {
        component: InputGroupButton,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            variant: z.enum(["default", "destructive", "outline", "secondary", "ghost", "link"]).optional(),
            size: z.enum(["xs", "sm", "icon-xs", "icon-sm"]).optional(),
        }),
        from: "@/components/ui/input-group",
        childOf: ["InputGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    InputGroupText: {
        component: InputGroupText,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/input-group",
        childOf: ["InputGroup"],
        fieldOverrides: commonFieldOverrides()
    },
    InputGroupInput: {
        component: InputGroupInput,
        schema: z.object({
            className: z.string().optional(),
            placeholder: z.string().optional(),
            type: z.string().optional(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/input-group",
        childOf: ["InputGroup"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },
    InputGroupTextarea: {
        component: InputGroupTextarea,
        schema: z.object({
            className: z.string().optional(),
            placeholder: z.string().optional(),
            disabled: z.boolean().optional(),
        }),
        from: "@/components/ui/input-group",
        childOf: ["InputGroup"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },

    // ============================================
    // ITEM
    // ============================================
    Item: {
        component: Item,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            variant: z.enum(["default", "outline", "muted"]).optional(),
            size: z.enum(["default", "sm"]).optional(),
            asChild: z.boolean().optional(),
        }),
        from: "@/components/ui/item",
        defaultChildren: [
            { id: "item-media", type: "ItemMedia", name: "ItemMedia", props: { variant: "icon" }, children: [] },
            { id: "item-content", type: "ItemContent", name: "ItemContent", props: {}, children: [
                { id: "ic-title", type: "ItemTitle", name: "ItemTitle", props: {}, children: [{ id: "ict-text", type: "span", name: "span", props: {}, children: "Item Title" } satisfies ComponentLayer] },
                { id: "ic-desc", type: "ItemDescription", name: "ItemDescription", props: {}, children: [{ id: "icd-text", type: "span", name: "span", props: {}, children: "Item description text" } satisfies ComponentLayer] },
            ] },
        ],
        fieldOverrides: commonFieldOverrides()
    },
    ItemGroup: {
        component: ItemGroup,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/item",
        childOf: ["Item"],
        fieldOverrides: commonFieldOverrides()
    },
    ItemSeparator: {
        component: ItemSeparator,
        schema: z.object({
            className: z.string().optional(),
        }),
        from: "@/components/ui/item",
        childOf: ["ItemGroup"],
        fieldOverrides: { className: (layer) => classNameFieldOverrides(layer) }
    },
    ItemMedia: {
        component: ItemMedia,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
            variant: z.enum(["default", "icon", "image"]).optional(),
        }),
        from: "@/components/ui/item",
        childOf: ["Item"],
        fieldOverrides: commonFieldOverrides()
    },
    ItemContent: {
        component: ItemContent,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/item",
        childOf: ["Item"],
        fieldOverrides: commonFieldOverrides()
    },
    ItemTitle: {
        component: ItemTitle,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/item",
        childOf: ["ItemContent", "ItemHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    ItemDescription: {
        component: ItemDescription,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/item",
        childOf: ["ItemContent", "ItemHeader"],
        fieldOverrides: commonFieldOverrides()
    },
    ItemActions: {
        component: ItemActions,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/item",
        childOf: ["Item"],
        fieldOverrides: commonFieldOverrides()
    },
    ItemHeader: {
        component: ItemHeader,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/item",
        childOf: ["Item"],
        fieldOverrides: commonFieldOverrides()
    },
    ItemFooter: {
        component: ItemFooter,
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/item",
        childOf: ["Item"],
        fieldOverrides: commonFieldOverrides()
    },
};
