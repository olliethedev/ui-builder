"use client";

import { useState, useEffect, ReactNode, useMemo } from "react";
import {
  Eraser,
  Heading,
  MoreVertical,
  Palette,
  Percent,
  Redo2,
  Space,
  Type,
  UnfoldHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TAILWIND_AUTO_HEIGHT_CLASSES,
  TAILWIND_AUTO_WIDTH_CLASSES,
  TAILWIND_BOTTOM_PADDING_CLASSES,
  TAILWIND_FIXED_HEIGHT_CLASSES,
  TAILWIND_FIXED_WIDTH_CLASSES,
  TAILWIND_HORIZONTAL_PADDING_CLASSES,
  TAILWIND_LEFT_PADDING_CLASSES,
  TAILWIND_PERCENTAGE_HEIGHT_CLASSES,
  TAILWIND_PERCENTAGE_WIDTH_CLASSES,
  TAILWIND_RIGHT_PADDING_CLASSES,
  TAILWIND_TOP_PADDING_CLASSES,
  TAILWIND_VERTICAL_PADDING_CLASSES,
  TAILWIND_PADDING_CLASSES,
  TAILWIND_MARGIN_CLASSES,
  TAILWIND_HORIZONTAL_MARGIN_CLASSES,
  TAILWIND_VERTICAL_MARGIN_CLASSES,
  TAILWIND_TOP_MARGIN_CLASSES,
  TAILWIND_RIGHT_MARGIN_CLASSES,
  TAILWIND_BOTTOM_MARGIN_CLASSES,
  TAILWIND_LEFT_MARGIN_CLASSES,
  TAILWIND_CORNER_RADIUS_CLASSES,
  TAILWIND_BORDER_WIDTH_CLASSES,
  TAILWIND_BORDER_COLOR_CLASSES,
  TAILWIND_OPACITY_CLASSES,
  TAILWIND_BACKGROUND_COLOR_CLASSES,
  TAILWIND_TEXT_ALIGN_CLASSES,
  TAILWIND_LETTER_SPACING_CLASSES,
  TAILWIND_LINE_HEIGHT_CLASSES,
  TAILWIND_FONT_SIZE_CLASSES,
  TAILWIND_FONT_WEIGHT_CLASSES,
  TAILWIND_TEXT_COLOR_CLASSES,
  TAILWIND_BOX_SHADOW_CLASSES,
  TAILWIND_BOX_SHADOW_COLOR_CLASSES,
  TAILWIND_DISPLAY_CLASSES,
  TAILWIND_GAP_CLASSES,
  TAILWIND_FLEX_DIRECTION_CLASSES,
  TAILWIND_JUSTIFY_CONTENT_CLASSES,
  TAILWIND_ALIGN_ITEMS_CLASSES,
} from "@/components/ui/ui-builder/internal/tailwind-classes";
import ClassNameMultiselect from "./classname-multiselect";

type ConfigItem = {
  label: string;
  possibleTypes: readonly (string | null)[];
  component: typeof ToggleGroup;
  options: ToggleOption[];
  parse: (token: string) => string | null;
  multiple?: boolean;
};

type ConfigType = {
  [key: string]: ConfigItem;
};

type StateType = {
  [key in keyof typeof CONFIG]:
    | (typeof CONFIG)[key]["possibleTypes"][number]
    | string[]
    | null;
};

// Type guards for Tailwind class arrays
function isTailwindClass<T extends readonly string[]>(
  arr: T,
  token: string
): token is T[number] {
  return arr.includes(token as any);
}

const CONFIG: ConfigType = {
  width: {
    label: "Width",
    possibleTypes: [
      null,
      "w-full",
      "auto",
      ...TAILWIND_FIXED_WIDTH_CLASSES,
      ...TAILWIND_PERCENTAGE_WIDTH_CLASSES,
    ] as const,
    component: ToggleGroup,
    options: [
      { value: "w-full", tooltip: "Fill (w-full)", icon: <FillIcon /> },
      { value: "w-auto", tooltip: "Hug (w-auto)", icon: <HugIcon /> },
      {
        value: "_w-fixed",
        label: "Fixed",
        tooltip: "Fixed (w-*)",
        icon: <FixedIcon />,
        dropdown: {
          items: [...TAILWIND_FIXED_WIDTH_CLASSES].map((cls) => ({
            value: cls,
            label: cls.replace("w-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_w-percentage",
        label: "Percentage (w-*/*)",
        tooltip: "Percentage",
        icon: <Percent className="!size-4" strokeWidth={1} />,
        dropdown: {
          items: TAILWIND_PERCENTAGE_WIDTH_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("w-", "") as ReactNode,
          })),
        },
      },
    ],
    parse: (token: string) => {
      if (/^w-/.test(token)) {
        if (isTailwindClass(TAILWIND_AUTO_WIDTH_CLASSES, token)) return token;
        if (isTailwindClass(TAILWIND_FIXED_WIDTH_CLASSES, token)) return token;
        if (isTailwindClass(TAILWIND_PERCENTAGE_WIDTH_CLASSES, token))
          return token;
      }
      return null;
    },
  },
  height: {
    label: "Height",
    possibleTypes: [
      null,
      ...TAILWIND_AUTO_HEIGHT_CLASSES,
      ...TAILWIND_FIXED_HEIGHT_CLASSES,
      ...TAILWIND_PERCENTAGE_HEIGHT_CLASSES,
    ] as const,
    component: ToggleGroup,
    options: [
      { value: "h-full", tooltip: "Fill (h-auto)", icon: <FillIcon /> },
      { value: "h-auto", tooltip: "Hug (h-auto)", icon: <HugIcon /> },
      {
        value: "_h-fixed",
        label: "Fixed",
        tooltip: "Fixed (h-*)",
        icon: <FixedIcon />,
        dropdown: {
          items: TAILWIND_FIXED_HEIGHT_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("h-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_h-percentage",
        label: "Percentage",
        tooltip: "Percentage  (h-*/*)",
        icon: <Percent className="!size-4" strokeWidth={1} />,
        dropdown: {
          items: TAILWIND_PERCENTAGE_HEIGHT_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("h-", "") as ReactNode,
          })),
        },
      },
    ],
    parse: (token: string) => {
      if (/^h-/.test(token)) {
        if (isTailwindClass(TAILWIND_AUTO_HEIGHT_CLASSES, token)) return token;
        if (isTailwindClass(TAILWIND_FIXED_HEIGHT_CLASSES, token)) return token;
        if (isTailwindClass(TAILWIND_PERCENTAGE_HEIGHT_CLASSES, token))
          return token;
      }
      return null;
    },
  },
  border: {
    label: "Border",
    possibleTypes: [
      null,
      ...TAILWIND_BORDER_WIDTH_CLASSES,
      ...TAILWIND_BORDER_COLOR_CLASSES,
      ...TAILWIND_CORNER_RADIUS_CLASSES,
    ] as const,
    component: ToggleGroup,
    multiple: true,
    options: [
      {
        value: "_border-width",
        label: "Width",
        tooltip: "Border Width (border-*)",
        icon: <BorderWidthIcon />,
        dropdown: {
          items: TAILWIND_BORDER_WIDTH_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("border-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_corner-radius",
        label: "Radius",
        tooltip: "Corner Radius (rounded-*)",
        icon: <CornerRadiusIcon />,
        dropdown: {
          items: TAILWIND_CORNER_RADIUS_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("rounded-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_border-color",
        label: "Color",
        tooltip: "Border Color (border-*)",
        icon: <Palette className="!size-4" strokeWidth={1} />,
        dropdown: {
          dropdownDisplay: "grid",
          items: TAILWIND_BORDER_COLOR_CLASSES.map((cls) => {
            const colorName = cls.replace("border-", "");
            return {
              value: cls,
              label: (
                <DropdownOption color={cls.replace("border-", "bg-")}>
                  {colorName}
                </DropdownOption>
              ),
            };
          }),
        },
      },
    ],
    parse: (token: string) => {
      if (isTailwindClass(TAILWIND_BORDER_WIDTH_CLASSES, token)) {
        return token;
      } else if (isTailwindClass(TAILWIND_BORDER_COLOR_CLASSES, token)) {
        return token;
      } else if (isTailwindClass(TAILWIND_CORNER_RADIUS_CLASSES, token)) {
        return token;
      } else {
        return null;
      }
    },
  },
  background: {
    label: "Fill & Opacity",
    possibleTypes: [
      null,
      ...TAILWIND_BACKGROUND_COLOR_CLASSES,
      ...TAILWIND_OPACITY_CLASSES,
    ] as const,
    component: ToggleGroup,
    multiple: true,
    options: [
      {
        value: "_bg-color",
        label: "Color",
        tooltip: "Background Color (bg-*)",
        icon: <Palette className="!size-4" strokeWidth={1} />,
        dropdown: {
          dropdownDisplay: "grid",
          items: TAILWIND_BACKGROUND_COLOR_CLASSES.map((cls) => {
            const colorName = cls.replace("bg-", "");
            return {
              value: cls,
              label: <DropdownOption color={cls}>{colorName}</DropdownOption>,
            };
          }),
        },
      },
      {
        value: "_opacity",
        label: "Opacity",
        tooltip: "Opacity (opacity-*)",
        icon: <OpacityIcon />,
        dropdown: {
          items: TAILWIND_OPACITY_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("opacity-", "") as ReactNode,
          })),
        },
      },
    ],
    parse: (token: string) => {
      if (isTailwindClass(TAILWIND_BACKGROUND_COLOR_CLASSES, token)) {
        return token;
      } else if (isTailwindClass(TAILWIND_OPACITY_CLASSES, token)) {
        return token;
      } else {
        return null;
      }
    },
  },
  typography: {
    label: "Typography",
    possibleTypes: [
      null,
      ...TAILWIND_FONT_SIZE_CLASSES,
      ...TAILWIND_FONT_WEIGHT_CLASSES,
      ...TAILWIND_LINE_HEIGHT_CLASSES,
      ...TAILWIND_LETTER_SPACING_CLASSES,
      ...TAILWIND_TEXT_ALIGN_CLASSES,
      ...TAILWIND_TEXT_COLOR_CLASSES,
    ] as const,
    component: ToggleGroup,
    multiple: true,
    options: [
      {
        value: "_font-size",
        label: "Size",
        tooltip: "Font Size (text-*)",
        icon: <Heading className="!size-4" strokeWidth={1} />,
        dropdown: {
          items: TAILWIND_FONT_SIZE_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("text-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_font-weight",
        label: "Weight",
        tooltip: "Font Weight (font-*)",
        icon: <Type className="!size-4" strokeWidth={1} />,
        dropdown: {
          items: TAILWIND_FONT_WEIGHT_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("font-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_text-align",
        label: "Align",
        tooltip: "Text Align (text-*)",
        icon: <UnfoldHorizontal className="!size-4" strokeWidth={1} />,
        dropdown: {
          items: TAILWIND_TEXT_ALIGN_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("text-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_text-color",
        label: "Color",
        tooltip: "Text Color (text-*)",
        icon: <Palette className="!size-4" strokeWidth={1} />,
        dropdown: {
          dropdownDisplay: "grid",
          items: TAILWIND_TEXT_COLOR_CLASSES.map((cls) => {
            const colorName = cls.replace("text-", "");
            return {
              value: cls,
              label: (
                <DropdownOption color={cls.replace("text-", "bg-")}>
                  {colorName}
                </DropdownOption>
              ),
            };
          }),
        },
      },
      {
        value: "_line-height",
        label: "Line Height",
        tooltip: "Line Height (leading-*)",
        icon: <LineHeightIcon />,
        dropdown: {
          items: TAILWIND_LINE_HEIGHT_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("leading-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_letter-spacing",
        label: "Letter Spacing",
        tooltip: "Letter Spacing (tracking-*)",
        icon: <LetterSpacingIcon />,
        dropdown: {
          items: TAILWIND_LETTER_SPACING_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("tracking-", "") as ReactNode,
          })),
        },
      },
    ],
    parse: (token: string) => {
      if (isTailwindClass(TAILWIND_FONT_SIZE_CLASSES, token)) {
        return token;
      } else if (isTailwindClass(TAILWIND_FONT_WEIGHT_CLASSES, token)) {
        return token;
      } else if (isTailwindClass(TAILWIND_LINE_HEIGHT_CLASSES, token)) {
        return token;
      } else if (isTailwindClass(TAILWIND_LETTER_SPACING_CLASSES, token)) {
        return token;
      } else if (isTailwindClass(TAILWIND_TEXT_ALIGN_CLASSES, token)) {
        return token;
      } else if (isTailwindClass(TAILWIND_TEXT_COLOR_CLASSES, token)) {
        return token;
      } else {
        return null;
      }
    },
  },
  padding: {
    label: "Padding",
    possibleTypes: [null, ...TAILWIND_PADDING_CLASSES] as const,
    component: ToggleGroup,
    options: [
      {
        value: "_p",
        label: "All",
        tooltip: "All Padding (p-*)",
        icon: <PaddingIcon />,
        dropdown: {
          items: TAILWIND_PADDING_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("p-", "") as ReactNode,
          })),
        },
      },
      {
        value: "p-0",
        tooltip: "No padding",
        icon: <Eraser className="!size-4" strokeWidth={1} />,
      },
    ],
    parse: (token: string) => {
      if (/^p-/.test(token)) {
        if (isTailwindClass(TAILWIND_PADDING_CLASSES, token)) return token;
      }
      return null;
    },
  },
  directionalPadding: {
    label: "X and Y Padding",
    possibleTypes: [
      null,
      ...TAILWIND_HORIZONTAL_PADDING_CLASSES,
      ...TAILWIND_VERTICAL_PADDING_CLASSES,
    ] as const,
    component: ToggleGroup,
    options: [
      {
        value: "_p-horizontal",
        label: "Horizontal",
        tooltip: "Horizontal Padding (px-*)",
        icon: <PaddingAxisIcon axis="x" />,
        dropdown: {
          items: TAILWIND_HORIZONTAL_PADDING_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("px-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_p-vertical",
        label: "Vertical",
        tooltip: "Vertical Padding (py-*)",
        icon: <PaddingAxisIcon axis="y" />,
        dropdown: {
          items: TAILWIND_VERTICAL_PADDING_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("py-", "") as ReactNode,
          })),
        },
      },
      {
        value: "p-0",
        tooltip: "No padding",
        icon: <Eraser className="!size-4" strokeWidth={1} />,
      },
    ],
    parse: (token: string) => {
      if (/^px-/.test(token)) {
        if (isTailwindClass(TAILWIND_HORIZONTAL_PADDING_CLASSES, token))
          return token;
      } else if (/^py-/.test(token)) {
        if (isTailwindClass(TAILWIND_VERTICAL_PADDING_CLASSES, token))
          return token;
      } else if (token === "p-0") {
        return token;
      }
      return null;
    },
  },
  individualPadding: {
    label: "Individual Padding",
    possibleTypes: [
      null,
      ...TAILWIND_TOP_PADDING_CLASSES,
      ...TAILWIND_RIGHT_PADDING_CLASSES,
      ...TAILWIND_BOTTOM_PADDING_CLASSES,
      ...TAILWIND_LEFT_PADDING_CLASSES,
    ] as const,
    component: ToggleGroup,
    options: [
      {
        value: "_pt",
        label: "Top",
        tooltip: "Top Padding (pt-*)",
        icon: <PaddingSideIcon side="top" />,
        dropdown: {
          items: TAILWIND_TOP_PADDING_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("pt-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_pr",
        label: "Right",
        tooltip: "Right Padding (pr-*)",
        icon: <PaddingSideIcon side="right" />,
        dropdown: {
          items: TAILWIND_RIGHT_PADDING_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("pr-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_pb",
        label: "Bottom",
        tooltip: "Bottom Padding (pb-*)",
        icon: <PaddingSideIcon side="bottom" />,
        dropdown: {
          items: TAILWIND_BOTTOM_PADDING_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("pb-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_pl",
        label: "Left",
        tooltip: "Left Padding (pl-*)",
        icon: <PaddingSideIcon side="left" />,
        dropdown: {
          items: TAILWIND_LEFT_PADDING_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("pl-", "") as ReactNode,
          })),
        },
      },
      {
        value: "p-0",
        tooltip: "No padding",
        icon: <Eraser className="!size-4" strokeWidth={1} />,
      },
    ],
    parse: (token: string) => {
      if (/^pl-/.test(token)) {
        if (isTailwindClass(TAILWIND_LEFT_PADDING_CLASSES, token)) return token;
      } else if (/^pr-/.test(token)) {
        if (isTailwindClass(TAILWIND_RIGHT_PADDING_CLASSES, token))
          return token;
      } else if (/^pb-/.test(token)) {
        if (isTailwindClass(TAILWIND_BOTTOM_PADDING_CLASSES, token))
          return token;
      } else if (/^pt-/.test(token)) {
        if (isTailwindClass(TAILWIND_TOP_PADDING_CLASSES, token)) return token;
      }
      return null;
    },
  },
  margin: {
    label: "Margin",
    possibleTypes: [null, ...TAILWIND_MARGIN_CLASSES] as const,
    component: ToggleGroup,
    options: [
      {
        value: "_m",
        label: "All",
        tooltip: "All Margin (m-*)",
        icon: <PaddingIcon />,
        dropdown: {
          items: TAILWIND_MARGIN_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("m-", "") as ReactNode,
          })),
        },
      },
      {
        value: "m-0",
        tooltip: "No margin",
        icon: <Eraser className="!size-4" strokeWidth={1} />,
      },
    ],
    parse: (token: string) => {
      if (/^m-/.test(token)) {
        if (isTailwindClass(TAILWIND_MARGIN_CLASSES, token)) return token;
      }
      return null;
    },
  },
  directionalMargin: {
    label: "X and Y Margin",
    possibleTypes: [
      null,
      ...TAILWIND_HORIZONTAL_MARGIN_CLASSES,
      ...TAILWIND_VERTICAL_MARGIN_CLASSES,
    ] as const,
    component: ToggleGroup,
    options: [
      {
        value: "_m-horizontal",
        label: "Horizontal",
        tooltip: "Horizontal Margin (mx-*)",
        icon: <PaddingAxisIcon axis="x" />,
        dropdown: {
          items: TAILWIND_HORIZONTAL_MARGIN_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("mx-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_m-vertical",
        label: "Vertical",
        tooltip: "Vertical Margin (my-*)",
        icon: <PaddingAxisIcon axis="y" />,
        dropdown: {
          items: TAILWIND_VERTICAL_MARGIN_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("my-", "") as ReactNode,
          })),
        },
      },
      {
        value: "m-0",
        tooltip: "No margin",
        icon: <Eraser className="!size-4" strokeWidth={1} />,
      },
    ],
    parse: (token: string) => {
      if (/^mx-/.test(token)) {
        if (isTailwindClass(TAILWIND_HORIZONTAL_MARGIN_CLASSES, token))
          return token;
      } else if (/^my-/.test(token)) {
        if (isTailwindClass(TAILWIND_VERTICAL_MARGIN_CLASSES, token))
          return token;
      } else if (token === "m-0") {
        return token;
      }
      return null;
    },
  },
  individualMargin: {
    label: "Individual Margin",
    possibleTypes: [
      null,
      ...TAILWIND_TOP_MARGIN_CLASSES,
      ...TAILWIND_RIGHT_MARGIN_CLASSES,
      ...TAILWIND_BOTTOM_MARGIN_CLASSES,
      ...TAILWIND_LEFT_MARGIN_CLASSES,
    ] as const,
    component: ToggleGroup,
    options: [
      {
        value: "_mt",
        label: "Top",
        tooltip: "Top Margin (mt-*)",
        icon: <PaddingSideIcon side="top" />,
        dropdown: {
          items: TAILWIND_TOP_MARGIN_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("mt-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_mr",
        label: "Right",
        tooltip: "Right Margin (mr-*)",
        icon: <PaddingSideIcon side="right" />,
        dropdown: {
          items: TAILWIND_RIGHT_MARGIN_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("mr-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_mb",
        label: "Bottom",
        tooltip: "Bottom Margin (mb-*)",
        icon: <PaddingSideIcon side="bottom" />,
        dropdown: {
          items: TAILWIND_BOTTOM_MARGIN_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("mb-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_ml",
        label: "Left",
        tooltip: "Left Margin (ml-*)",
        icon: <PaddingSideIcon side="left" />,
        dropdown: {
          items: TAILWIND_LEFT_MARGIN_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("ml-", "") as ReactNode,
          })),
        },
      },
      {
        value: "m-0",
        tooltip: "No margin",
        icon: <Eraser className="!size-4" strokeWidth={1} />,
      },
    ],
    parse: (token: string) => {
      if (/^ml-/.test(token)) {
        if (isTailwindClass(TAILWIND_LEFT_MARGIN_CLASSES, token)) return token;
      } else if (/^mr-/.test(token)) {
        if (isTailwindClass(TAILWIND_RIGHT_MARGIN_CLASSES, token)) return token;
      } else if (/^mb-/.test(token)) {
        if (isTailwindClass(TAILWIND_BOTTOM_MARGIN_CLASSES, token))
          return token;
      } else if (/^mt-/.test(token)) {
        if (isTailwindClass(TAILWIND_TOP_MARGIN_CLASSES, token)) return token;
      }
      return null;
    },
  },
  boxShadow: {
    label: "Box Shadow",
    possibleTypes: [
      null,
      ...TAILWIND_BOX_SHADOW_CLASSES,
      ...TAILWIND_BOX_SHADOW_COLOR_CLASSES,
    ] as const,
    component: ToggleGroup,
    multiple: true,
    options: [
      {
        value: "_shadow",
        label: "Shadow",
        tooltip: "Box Shadow (shadow-*)",
        icon: <ShadowIcon />,
        dropdown: {
          items: TAILWIND_BOX_SHADOW_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("shadow-", "") as ReactNode,
          })),
        },
      },
      {
        value: "_shadow-color",
        label: "Color",
        tooltip: "Box Shadow Color (shadow-*)",
        icon: <Palette className="!size-4" strokeWidth={1} />,
        dropdown: {
          dropdownDisplay: "grid",
          items: TAILWIND_BOX_SHADOW_COLOR_CLASSES.map((cls) => {
            const colorName = cls.replace("shadow-", "");
            return {
              value: cls,
              label: (
                <DropdownOption color={cls.replace("shadow-", "bg-")}>
                  {colorName}
                </DropdownOption>
              ),
            };
          }),
        },
      },
    ],
    parse: (token: string) => {
      if (isTailwindClass(TAILWIND_BOX_SHADOW_CLASSES, token)) {
        return token;
      } else if (isTailwindClass(TAILWIND_BOX_SHADOW_COLOR_CLASSES, token)) {
        return token;
      } else {
        return null;
      }
    },
  },
  display: {
    label: "Layout",
    possibleTypes: [null, "block", "inline", "flex"] as const,
    component: ToggleGroup,
    options: [
      { value: "block", tooltip: "Block", label: "Block" },
      { value: "inline", tooltip: "Inline", label: "Inline" },
      { value: "flex", tooltip: "Flex Box", label: "Flex Box" },
    ],
    parse: (token: string) => {
      if (token === "block" || token === "inline" || token === "flex")
        return token;
      return null;
    },
  },
  flexSettings: {
    label: "Flex Settings",
    possibleTypes: [
      null,
      ...TAILWIND_FLEX_DIRECTION_CLASSES,
      ...TAILWIND_ALIGN_ITEMS_CLASSES,
      ...TAILWIND_JUSTIFY_CONTENT_CLASSES,
      ...TAILWIND_GAP_CLASSES,
      "flex-wrap",
      "flex-nowrap",
      "flex-wrap-reverse",
    ] as const,
    component: ToggleGroup,
    multiple: true,
    options: [
      {
        value: "_flex-direction",
        label: "Direction",
        tooltip: "Flex Direction",
        dropdown: {
          items: TAILWIND_FLEX_DIRECTION_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("flex-", ""),
          })),
        },
      },
      {
        value: "_align",
        label: "Align",
        tooltip: "Align Items",
        dropdown: {
          items: TAILWIND_ALIGN_ITEMS_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("items-", ""),
          })),
        },
      },
      {
        value: "_justify",
        label: "Justify",
        tooltip: "Justify Content",
        dropdown: {
          items: TAILWIND_JUSTIFY_CONTENT_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("justify-", ""),
          })),
        },
      },
      {
        value: "_gap",
        label: "Gap",
        tooltip: "Gap",
        icon: <Space className="!size-4" strokeWidth={1} />,
        dropdown: {
          items: TAILWIND_GAP_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("gap-", ""),
          })),
        },
      },

      {
        value: "_wrap",
        label: "Wrap",
        tooltip: "Wrap",
        icon: <Redo2 strokeWidth={1} className="rotate-180 !size-4" />,
        dropdown: {
          items: [
            { value: "flex-wrap", label: "wrap" },
            { value: "flex-nowrap", label: "nowrap" },
            { value: "flex-wrap-reverse", label: "wrap-reverse" },
          ],
        },
      },
    ],
    parse: (token: string) => {
      if (isTailwindClass(TAILWIND_FLEX_DIRECTION_CLASSES, token)) return token;
      if (isTailwindClass(TAILWIND_ALIGN_ITEMS_CLASSES, token)) return token;
      if (isTailwindClass(TAILWIND_JUSTIFY_CONTENT_CLASSES, token))
        return token;
      if (isTailwindClass(TAILWIND_GAP_CLASSES, token)) return token;
      if (["flex-wrap", "flex-nowrap", "flex-wrap-reverse"].includes(token))
        return token;
      return null;
    },
  },
};

const LAYOUT_GROUPS: {
  label: string;
  keys: string[];
  clearState?: (
    currentSelectedKey: string,
    state: Record<string, string | string[] | null>
  ) => string[];
}[] = [
  {
    label: "Padding",
    keys: ["padding", "directionalPadding", "individualPadding"],
    clearState: () => [
      ...TAILWIND_PADDING_CLASSES,
      ...TAILWIND_HORIZONTAL_PADDING_CLASSES,
      ...TAILWIND_VERTICAL_PADDING_CLASSES,
      ...TAILWIND_TOP_PADDING_CLASSES,
      ...TAILWIND_RIGHT_PADDING_CLASSES,
      ...TAILWIND_BOTTOM_PADDING_CLASSES,
      ...TAILWIND_LEFT_PADDING_CLASSES,
      "p-0",
      "px-0",
      "py-0",
      "pt-0",
      "pr-0",
      "pb-0",
      "pl-0",
    ],
  },
  {
    label: "Margin",
    keys: ["margin", "directionalMargin", "individualMargin"],
    clearState: () => [
      ...TAILWIND_MARGIN_CLASSES,
      ...TAILWIND_HORIZONTAL_MARGIN_CLASSES,
      ...TAILWIND_VERTICAL_MARGIN_CLASSES,
      ...TAILWIND_TOP_MARGIN_CLASSES,
      ...TAILWIND_RIGHT_MARGIN_CLASSES,
      ...TAILWIND_BOTTOM_MARGIN_CLASSES,
      ...TAILWIND_LEFT_MARGIN_CLASSES,
      "m-0",
      "mx-0",
      "my-0",
      "mt-0",
      "mr-0",
      "mb-0",
      "ml-0",
    ],
  },
];

const LAYOUT_ORDER: Array<
  | { type: "group"; label: string; isVisible?: (state: StateType) => boolean }
  | {
      type: "item";
      key: keyof typeof CONFIG;
      isVisible?: (state: StateType) => boolean;
    }
> = [
  { type: "item", key: "width" },
  { type: "item", key: "height" },
  { type: "group", label: "Margin" },
  { type: "group", label: "Padding" },
  { type: "item", key: "display" },
  {
    type: "item",
    key: "flexSettings",
    isVisible: (state) => state.display === "flex",
  },
  { type: "item", key: "typography" },
  { type: "item", key: "background" },
  { type: "item", key: "border" },
  { type: "item", key: "boxShadow" },
];

interface DesignPanelProps {
  onChange?: (classes: string) => void;
  value?: string;
}

export default function ClassNameAdvancedField({
  onChange,
  value,
}: DesignPanelProps) {
  // Helper to parse classString into base, md, rest
  const parseClassString = (str: string) => {
    const tokens = str.trim().split(/\s+/);
    const base: string[] = [];
    const md: string[] = [];
    const rest: string[] = [];
    for (const token of tokens) {
      if (token.startsWith("md:")) {
        md.push(token.slice(3));
      } else if (token.includes(":")) {
        rest.push(token);
      } else if (token) {
        base.push(token);
      }
    }
    return {
      base: base.join(" "),
      md: md.join(" "),
      rest: rest.join(" "),
    };
  };

  // State for the full class string
  const [classString, setClassString] = useState(value || "");
  // State for the tab
  const [tab, setTab] = useState<"base" | "md">("base");

  // Sync classString with value prop (uncontrolled to controlled fix)
  useEffect(() => {
    if (typeof value === "string" && value !== classString) {
      setClassString(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Parse the class string for the tabs
  const { base, md, rest } = parseClassString(classString);

  // Handlers for each tab
  const handleBaseChange = (newBase: string) => {
    const newClassString = [
      newBase,
      md &&
        md
          .split(" ")
          .map((cls) => `md:${cls}`)
          .join(" "),
      rest,
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    setClassString(newClassString);
  };
  const handleMdChange = (newMd: string) => {
    const mdClasses = newMd
      .split(" ")
      .filter(Boolean)
      .map((cls) => `md:${cls}`)
      .join(" ");
    const newClassString = [base, mdClasses, rest]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    setClassString(newClassString);
  };

  // When classString changes, call parent onChange
  useEffect(() => {
    if (onChange) onChange(classString);
  }, [classString, onChange]);

  // When multiselect changes, update classString (and tabs will re-parse)
  const handleMultiselectChange = (newClassString: string) => {
    console.log({ newClassString });
    setClassString(newClassString);
  };

  return (
    <div className="w-full">
      <TooltipProvider>
        <Tabs
          value={tab}
          onValueChange={(val) => setTab(val as "base" | "md")}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="base">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Base</span>
                </TooltipTrigger>
                <TooltipContent>
                  Base styles for all screen sizes
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
            <TabsTrigger value="md">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Tablet & Desktop</span>
                </TooltipTrigger>
                <TooltipContent>
                  Overrides for screens larger than 768px (md:*)
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="base">
            <ClassUtilities value={base} onChange={handleBaseChange} />
          </TabsContent>
          <TabsContent value="md">
            <ClassUtilities value={md} onChange={handleMdChange} />
          </TabsContent>
        </Tabs>
      </TooltipProvider>
      <ClassNameMultiselect
        value={classString}
        onChange={handleMultiselectChange}
      />
    </div>
  );
}

function ClassUtilities({ value, onChange }: DesignPanelProps) {
  // Memoize parsing for performance
  const parsed = useMemo(() => {
    if (value) {
      const tokens = value.trim().split(/\s+/);
      // Parse all keys
      const parsedState = Object.entries(CONFIG).reduce(
        (acc, [key, config]) => {
          if (config.multiple) {
            const parsed = tokens.filter((token) => config.parse(token));
            if (parsed.length) {
              (acc as any)[key] = parsed;
            }
          } else {
            const parsed = tokens.find((token) => config.parse(token));
            if (parsed) {
              (acc as any)[key] = parsed;
            }
          }
          return acc;
        },
        Object.fromEntries(Object.keys(CONFIG).map((k) => [k, null])) as Record<
          string,
          any
        >
      ) as StateType;
      // For each group, only allow one key to be active at a time
      const initialSelected: { [groupLabel: string]: string } = {};
      LAYOUT_GROUPS.forEach((group) => {
        const foundKey = group.keys.find((key) => parsedState[key]);
        // If multiple keys have values, clear all but the first
        let found = false;
        group.keys.forEach((key) => {
          if (parsedState[key]) {
            if (!found) {
              found = true;
              initialSelected[group.label] = key;
            } else {
              parsedState[key] = null;
            }
          }
        });
        if (!found) initialSelected[group.label] = group.keys[0];
      });
      // Find handled tokens
      const handledTokens = new Set(
        Object.values(parsedState).flatMap((v) =>
          Array.isArray(v) ? v : v ? [v] : []
        )
      );
      const unhandledTokens = tokens.filter(
        (token) => !handledTokens.has(token)
      );
      return {
        parsedState,
        unhandledTokens,
        initialSelected,
      };
    } else {
      // Reset state if value is empty
      const initialSelected: { [groupLabel: string]: string } = {};
      LAYOUT_GROUPS.forEach((group) => {
        initialSelected[group.label] = group.keys[0];
      });
      return {
        parsedState: {} as StateType,
        unhandledTokens: [],
        initialSelected,
      };
    }
  }, [value]);

  const [state, setState] = useState<StateType>(parsed.parsedState);
  const [unhandled, setUnhandled] = useState<string[]>(parsed.unhandledTokens);
  const [selectedKeys, setSelectedKeys] = useState<{
    [groupLabel: string]: string;
  }>(parsed.initialSelected);

  // Only update state if parsed result changes (deep compare)
  useEffect(() => {
    const stateChanged =
      JSON.stringify(state) !== JSON.stringify(parsed.parsedState);
    const unhandledChanged =
      JSON.stringify(unhandled) !== JSON.stringify(parsed.unhandledTokens);
    const selectedChanged =
      JSON.stringify(selectedKeys) !== JSON.stringify(parsed.initialSelected);
    if (stateChanged) setState(parsed.parsedState);
    if (unhandledChanged) setUnhandled(parsed.unhandledTokens);
    if (selectedChanged) setSelectedKeys(parsed.initialSelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed]);

  // Helper to build class string from state and unhandled
  const buildClassString = (
    customState: StateType = state,
    customUnhandled: string[] = unhandled
  ) => {
    const classes: string[] = [];
    for (const key in customState) {
      const value = customState[key as keyof StateType];
      if (value) {
        if (Array.isArray(value)) {
          classes.push(...value);
        } else {
          classes.push(value);
        }
      }
    }
    return [...classes, ...customUnhandled].join(" ").trim();
  };

  // Handler for UI changes (toggles, dropdowns, etc.)
  const handleStateChange = (
    key: keyof StateType,
    value: string | string[] | null
  ) => {
    setState((prev) => {
      const newState = { ...prev, [key]: value };
      // If this key is part of a group, update selectedKeys and clear other keys in the group
      const group = LAYOUT_GROUPS.find((g) => g.keys.includes(key as string));
      if (group) {
        setSelectedKeys((prevSel) => ({
          ...prevSel,
          [group.label]: key as string,
        }));
        // Clear other keys in the group
        group.keys.forEach((k) => {
          if (k !== key) newState[k] = null;
        });
        // Also clear from unhandled
        if (typeof group.clearState === "function") {
          const classesToClear = group.clearState(key as string, newState);
          setUnhandled((prevUnhandled) =>
            prevUnhandled.filter((token) => !classesToClear.includes(token))
          );
        }
      }

      console.log({
        newState,
      });
      // if visibility changes from visible to invisible null the value for that key in the newState
      const layoutOrderItemsInvisible = LAYOUT_ORDER.filter(
        (item) => item.isVisible && !item.isVisible(newState)
      );
      layoutOrderItemsInvisible.forEach((item) => {
        if (item.type === "item") {
          newState[item.key] = null;
        } else if (item.type === "group") {
          const group = LAYOUT_GROUPS.find((g) => g.label === item.label);
          if (group) {
            group.keys.forEach((key) => {
              newState[key] = null;
            });
          }
        }
      });

      return newState;
    });
  };

  // Handler for group key selection
  const handleGroupKeySelect = (groupLabel: string, key: string) => {
    setSelectedKeys((prev) => ({
      ...prev,
      [groupLabel]: key,
    }));
    const group = LAYOUT_GROUPS.find((g) => g.label === groupLabel);
    if (group) {
      let classesToClear: string[] = [];
      setState((prevState) => {
        const newState = { ...prevState };
        if (typeof group.clearState === "function") {
          classesToClear = group.clearState(key, newState);
        }
        // Remove all classes in classesToClear from state for all keys in the group except the selected one
        for (const k of group.keys) {
          if (k !== key) {
            const config = CONFIG[k];
            if (!config) continue;
            if (config.multiple && Array.isArray(newState[k])) {
              newState[k] = (newState[k] as string[]).filter(
                (v) => !classesToClear.includes(v as any)
              );
              if (Array.isArray(newState[k]) && newState[k].length === 0)
                newState[k] = null;
            } else if (classesToClear.includes(newState[k] as any)) {
              newState[k] = null;
            }
          }
        }
        // Remove from unhandled synchronously
        setUnhandled((prevUnhandled) =>
          prevUnhandled.filter((token) => !classesToClear.includes(token))
        );
        // Set the selected key's value to null if it was not previously set
        if (!newState[key]) newState[key] = null;
        return newState;
      });
    }
  };

  // Call onChange with the new class string after state/unhandled change
  useEffect(() => {
    const classString = buildClassString(state, unhandled);
    if (onChange) onChange(classString);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, unhandled]);

  return (
    <div className="w-full bg-white border rounded-lg shadow-sm">
      <div className="flex flex-col p-4 gap-px">
        {LAYOUT_ORDER.map((entry) => {
          if (entry.type === "group") {
            const group = LAYOUT_GROUPS.find((g) => g.label === entry.label);
            if (!group) return null;
            const keys = group.keys.map(String);
            const selectedKey = selectedKeys[group.label] || keys[0];
            if (entry.isVisible && !entry.isVisible(state)) return null;
            const groupConfig = CONFIG[selectedKey as keyof typeof CONFIG];

            return (
              <div key={group.label}>
                <NewLayoutGroup
                  groupConfig={groupConfig}
                  group={group}
                  state={state}
                  handleStateChange={handleStateChange}
                  handleGroupKeySelect={handleGroupKeySelect}
                  selectedKey={selectedKey}
                />
              </div>
            );
          } else if (entry.type === "item") {
            if (entry.isVisible && !entry.isVisible(state)) return null;
            const configKey = entry.key;
            const ungroupedConfig = CONFIG[configKey];
            return (
              <div key={configKey}>
                <ungroupedConfig.component
                  {...ungroupedConfig}
                  {...("multiple" in ungroupedConfig
                    ? { multiple: ungroupedConfig.multiple }
                    : {})}
                  value={state[configKey]}
                  onChange={(value: string | string[] | null) =>
                    handleStateChange(configKey, value)
                  }
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

type NewLayoutGroupProps = {
  groupConfig: ConfigItem;
  group: {
    label: string;
    keys: string[];
  };
  state: StateType;
  handleStateChange: (
    key: keyof StateType,
    value: string | string[] | null
  ) => void;
  handleGroupKeySelect: (groupLabel: string, key: string) => void;
  selectedKey: string | string[] | null;
};

function NewLayoutGroup({
  groupConfig,
  group,
  state,
  handleStateChange,
  handleGroupKeySelect,
  selectedKey,
}: NewLayoutGroupProps) {
  return (
    <>
      <span className="text-xs font-medium text-muted-foreground">
        {group.label}
      </span>
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex-1">
          <groupConfig.component
            {...groupConfig}
            {...("multiple" in groupConfig
              ? { multiple: groupConfig.multiple }
              : {})}
            hideLabel={true}
            value={state[selectedKey as keyof StateType]}
            onChange={(value: string | string[] | null) =>
              handleStateChange(selectedKey as keyof StateType, value)
            }
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="text-xs px-2 py-1">
              <MoreVertical className="!size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {group.keys.map((key) => (
              <DropdownMenuItem
                key={String(key)}
                onClick={() => handleGroupKeySelect(group.label, String(key))}
                className={
                  selectedKey === String(key)
                    ? "bg-secondary-foreground/10"
                    : ""
                }
              >
                {CONFIG[String(key)].label || String(key)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

type ToggleGroupProps = {
  label: string;
  options: ToggleOption[];
  value?: string | string[] | null;
  onChange?: (value: string | string[] | null) => void;
  className?: string;
  allowDeselect?: boolean;
  hideLabel?: boolean;
  multiple?: boolean;
};

type ToggleOption = {
  value: string;
  tooltip: string;
  label?: string;
  icon?: ReactNode;
  dropdown?: {
    items: { value: string; label: ReactNode }[];
    defaultValue?: string;
    dropdownDisplay?: "grid";
  };
};

function ToggleGroup({
  label,
  options,
  value = null,
  onChange,
  className,
  allowDeselect = true,
  hideLabel = false,
  multiple = false,
}: ToggleGroupProps) {
  // Helper to normalize value to array for multi-select
  const valueArray = multiple
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : value;

  const getIsSelected = (option: ToggleOption) => {
    if (option.dropdown) {
      if (multiple) {
        return option.dropdown.items.some((item) =>
          (valueArray as string[]).includes(
            typeof item.value === "string" ? item.value : ""
          )
        );
      } else {
        return option.dropdown.items.some(
          (item) =>
            value === (typeof item.value === "string" ? item.value : undefined)
        );
      }
    }
    if (multiple) {
      return (valueArray as string[]).includes(option.value);
    }
    return value === option.value;
  };

  const handleToggleClick = (option: ToggleOption) => {
    if (multiple) {
      let newValue: string[] = Array.isArray(valueArray) ? [...valueArray] : [];
      if (option.dropdown) {
        // For dropdown, add/remove all dropdown items
        const dropdownValues = option.dropdown.items.map((item) =>
          typeof item.value === "string" ? item.value : ""
        );
        const hasAny = dropdownValues.some((v) => newValue.includes(v));
        if (hasAny && allowDeselect) {
          newValue = newValue.filter((v) => !dropdownValues.includes(v));
        } else {
          // Add first dropdown value if none selected
          if (!hasAny && dropdownValues[0]) {
            newValue.push(dropdownValues[0]);
          }
        }
      } else {
        const idx = newValue.indexOf(option.value);
        if (idx > -1 && allowDeselect) {
          newValue.splice(idx, 1);
        } else if (idx === -1) {
          newValue.push(option.value);
        }
      }
      onChange?.(newValue.length ? newValue : null);
    } else {
      if (getIsSelected(option) && allowDeselect) {
        onChange?.(null);
        return;
      }
      if (option.dropdown) {
        const dropdownValue =
          option.dropdown.defaultValue ||
          (option.dropdown.items[0] &&
          typeof option.dropdown.items[0].value === "string"
            ? option.dropdown.items[0].value
            : null) ||
          null;
        onChange?.(dropdownValue);
      } else {
        onChange?.(option.value);
      }
    }
  };

  const handleDropdownSelect = (optionValue: string, dropdownValue: string) => {
    if (multiple) {
      let newValue: string[] = Array.isArray(valueArray) ? [...valueArray] : [];
      // Remove all values from this dropdown's set
      const dropdownValues =
        options
          .find((opt) => opt.value === optionValue)
          ?.dropdown?.items.map((item) =>
            typeof item.value === "string" ? item.value : ""
          ) || [];
      newValue = newValue.filter((v) => !dropdownValues.includes(v));
      // Add the selected value
      if (!newValue.includes(dropdownValue)) {
        newValue.push(dropdownValue);
      }
      onChange?.(newValue.length ? newValue : null);
    } else {
      onChange?.(dropdownValue);
    }
  };

  const selectedClass = "bg-background font-semibold shadow-sm";

  return (
    <div>
      {!hideLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <div
        className={cn(
          "flex items-center gap-1 flex-wrap bg-muted rounded-md p-1 w-fit",
          className
        )}
      >
        {options.map((option) => {
          const isSelected = getIsSelected(option);

          if (option.dropdown) {
            // For multi, show selected dropdown item if any
            let selectedDropdownItem = null;
            if (multiple) {
              selectedDropdownItem = option.dropdown.items.find((item) =>
                (valueArray as string[]).includes(
                  typeof item.value === "string" ? item.value : ""
                )
              );
            } else {
              selectedDropdownItem = option.dropdown.items.find(
                (item) =>
                  value ===
                  (typeof item.value === "string" ? item.value : undefined)
              );
            }
            return (
              <DropdownMenu key={option.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "gap-px p-1 min-w-8 h-8",
                          isSelected && selectedClass, 
                          !option.icon && "flex flex-col items-center justify-center"
                        )}
                        onClick={() => handleToggleClick(option)}
                        aria-label={
                          option.tooltip || option.label || option.value
                        }
                        aria-pressed={isSelected}
                      >
                        {}
                        {option.icon ? option.icon : <div className="text-muted-foreground text-xs leading-3">{option.label}</div>}
                        {isSelected && option.dropdown && (
                          <DropdownOption>
                            {selectedDropdownItem?.label ||
                              option.dropdown.defaultValue ||
                              ""}
                          </DropdownOption>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{option.tooltip}</TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                  align="end"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  className={cn(
                    "max-h-96 overflow-y-auto",
                    option.dropdown.dropdownDisplay === "grid"
                      ? "grid grid-cols-5 gap-px p-1 "
                      : ""
                  )}
                >
                  {option.dropdown.items.map((item) => (
                    <DropdownMenuItem
                      key={
                        typeof item.value === "string" ? item.value : undefined
                      }
                      className={
                        (
                          multiple
                            ? (valueArray as string[]).includes(
                                typeof item.value === "string" ? item.value : ""
                              )
                            : value ===
                              (typeof item.value === "string"
                                ? item.value
                                : undefined)
                        )
                          ? selectedClass
                          : ""
                      }
                      onClick={() =>
                        handleDropdownSelect(
                          option.value,
                          typeof item.value === "string" ? item.value : ""
                        )
                      }
                      aria-label={
                        typeof item.label === "string" ? item.label : undefined
                      }
                      aria-selected={
                        multiple
                          ? (valueArray as string[]).includes(
                              typeof item.value === "string" ? item.value : ""
                            )
                          : value ===
                            (typeof item.value === "string"
                              ? item.value
                              : undefined)
                      }
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <Tooltip key={option.value}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "p-1 min-w-8 h-8 text-[12px] text-muted-foreground",
                    isSelected && selectedClass
                  )}
                  onClick={() => handleToggleClick(option)}
                  aria-label={option.tooltip || option.label || option.value}
                  aria-pressed={isSelected}
                >
                  {option.icon}
                  {option.label && (
                    <span className={cn(option.icon && "ml-2")}>
                      {option.label}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{option.tooltip}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

function DropdownOption({
  color,
  children,
}: {
  color?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center w-full">
      {color && (
        <span
          className={cn(
            "inline-block size-[14px] rounded-full border border-border",
            color
          )}
        />
      )}
      <span className="text-[10px] text-muted-foreground leading-3">
        {children}
      </span>
    </div>
  );
}

function HugIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M7.146 8.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .707l-3 3a.5.5 0 1 1-.708-.707L9.793 11.5 7.146 8.854a.5.5 0 0 1 0-.708m9.708 0a.5.5 0 0 1 0 .708L14.207 11.5l2.647 2.646a.5.5 0 0 1-.708.707l-3-3a.5.5 0 0 1 0-.707l3-3a.5.5 0 0 1 .708 0"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
function FillIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9.354 8.146a.5.5 0 0 1 0 .708L7.207 11h9.586l-2.146-2.146a.5.5 0 0 1 .707-.708l3 3a.5.5 0 0 1 0 .707l-3 3a.5.5 0 0 1-.708-.707L16.793 12H7.207l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
function FixedIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16.5 8.5a.5.5 0 0 1 .5.5v5a.5.5 0 1 1-1 0v-2H7v2a.5.5 0 0 1-1 0V9a.5.5 0 0 1 1 0v2h9V9a.5.5 0 0 1 .5-.5"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
function PaddingIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 9.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zm9 0a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zm-8-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m.5 8.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function PaddingSideIcon({
  side,
}: {
  side: "top" | "right" | "bottom" | "left";
}) {
  return (
    <svg
      className={cn(
        "!size-6",
        side === "left" && "rotate-0",
        side === "top" && "rotate-90",
        side === "right" && "rotate-180",
        side === "bottom" && "-rotate-90"
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 7.5a.5.5 0 0 0-1 0v9a.5.5 0 0 0 1 0zm5 3.5v2h-2v-2zm0-1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function PaddingAxisIcon({ axis }: { axis: "x" | "y" }) {
  return (
    <svg
      className={cn(
        "!size-6",
        axis === "x" && "rotate-0",
        axis === "y" && "rotate-90"
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 7.5a.5.5 0 0 0-1 0v9a.5.5 0 0 0 1 0zm8.5-.5a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 .5-.5M13 13v-2h-2v2zm1-2a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function OpacityIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 7h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1M6 8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm8.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1M13 10.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 2a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 2a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m1.5.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2-2a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m.5 1.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m2-4a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-.5 2.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m.5 1.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function CornerRadiusIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8.9 6h-.02c-.403 0-.735 0-1.006.022-.28.023-.54.072-.782.196a2 2 0 0 0-.874.874c-.124.243-.173.501-.196.782C6 8.144 6 8.477 6 8.88v.62a.5.5 0 0 0 1 0v-.6c0-.428 0-.72.019-.944.018-.22.05-.332.09-.41a1 1 0 0 1 .437-.437c.078-.04.19-.072.41-.09C8.18 7 8.472 7 8.9 7h.6a.5.5 0 0 0 0-1zm6.2 0h.02c.403 0 .735 0 1.006.022.281.023.54.072.782.196a2 2 0 0 1 .874.874c.124.243.173.501.196.782.022.27.022.603.022 1.005V9.5a.5.5 0 0 1-1 0v-.6c0-.428 0-.72-.019-.944-.018-.22-.05-.332-.09-.41a1 1 0 0 0-.437-.437c-.078-.04-.19-.072-.41-.09A13 13 0 0 0 15.1 7h-.6a.5.5 0 0 1 0-1zm.02 12h-.62a.5.5 0 0 1 0-1h.6c.428 0 .72 0 .944-.019.22-.018.332-.05.41-.09a1 1 0 0 0 .437-.437c.04-.078.072-.19.09-.41.019-.225.019-.516.019-.944v-.6a.5.5 0 0 1 1 0v.62c0 .403 0 .735-.022 1.006-.023.281-.072.54-.196.782a2 2 0 0 1-.874.874c-.243.124-.501.173-.782.196-.27.022-.603.022-1.005.022M8.9 18h-.02c-.403 0-.735 0-1.006-.022-.281-.023-.54-.072-.782-.196a2 2 0 0 1-.874-.874c-.124-.243-.173-.501-.196-.782A13 13 0 0 1 6 15.12v-.62a.5.5 0 0 1 1 0v.6c0 .428 0 .72.019.944.018.22.05.332.09.41a1 1 0 0 0 .437.437c.078.04.19.072.41.09.225.019.516.019.944.019h.6a.5.5 0 0 1 0 1z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function BorderWidthIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M6 6.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5M7 10v1h10v-1zm-.25-1a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h10.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75zM7 17v-2h10v2zm-1-2.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function ShadowIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M16.204 6.01A2 2 0 0 1 18 8v8l-.01.204a2 2 0 0 1-1.786 1.785L16 18H8l-.204-.01a2 2 0 0 1-1.785-1.786L6 16V8a2 2 0 0 1 1.796-1.99L8 6h8zM8 7a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z"
      ></path>
      <path
        fill="currentColor"
        className="opacity-30"
        d="M16 4a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zM8 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"
      ></path>
    </svg>
  );
}

function LineHeightIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5 5.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5m0 13a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5M8.564 16H9.58l.804-2.266h3.236L14.424 16h1.016l-2.938-8h-1zm4.75-3.125-1.28-3.61h-.063l-1.282 3.61z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function LetterSpacingIcon() {
  return (
    <svg className="!size-6" fill="none" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4.5 6a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5M8.564 16H9.58l.804-2.266h3.236L14.424 16h1.016l-2.938-8h-1zm4.75-3.125-1.28-3.61h-.063l-1.282 3.61z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
