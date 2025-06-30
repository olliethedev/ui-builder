import { ReactNode } from "react";
import {
  Heading,
  Palette,
  Percent,
  Type,
  UnfoldHorizontal,
} from "lucide-react";
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
  SHADCN_TAILWIND_BORDER_COLOR_CLASSES,
  TAILWIND_OPACITY_CLASSES,
  TAILWIND_BACKGROUND_COLOR_CLASSES,
  SHADCN_TAILWIND_BACKGROUND_COLOR_CLASSES,
  TAILWIND_TEXT_ALIGN_CLASSES,
  TAILWIND_LETTER_SPACING_CLASSES,
  TAILWIND_LINE_HEIGHT_CLASSES,
  TAILWIND_FONT_SIZE_CLASSES,
  TAILWIND_FONT_WEIGHT_CLASSES,
  TAILWIND_TEXT_COLOR_CLASSES,
  SHADCN_TAILWIND_TEXT_COLOR_CLASSES,
  TAILWIND_BOX_SHADOW_CLASSES,
  TAILWIND_BOX_SHADOW_COLOR_CLASSES,
  TAILWIND_DISPLAY_CLASSES,
  TAILWIND_GAP_CLASSES,
  TAILWIND_FLEX_DIRECTION_CLASSES,
  TAILWIND_JUSTIFY_CONTENT_CLASSES,
  TAILWIND_ALIGN_ITEMS_CLASSES,
  TAILWIND_FLEX_WRAP_CLASSES,
} from "@/components/ui/ui-builder/internal/utils/tailwind-classes";
import {
  ToggleGroup,
  ToggleOption,
} from "@/components/ui/ui-builder/internal/form-fields/classname-control/toggle-group";
import {
  FillIcon,
  HugIcon,
  FixedIcon,
  BorderWidthIcon,
  CornerRadiusIcon,
  OpacityIcon,
  LineHeightIcon,
  LetterSpacingIcon,
  PaddingSideIcon,
  PaddingAxisIcon,
  ShadowIcon,
  PaddingIcon,
} from "@/components/ui/ui-builder/internal/form-fields/classname-control/icons";
import { filterClassnameArray } from "@/components/ui/ui-builder/internal/form-fields/classname-control/utils";
import {
  THEME_AWARE_BORDER_COLOR_ITEMS,
  THEME_AWARE_BACKGROUND_COLOR_ITEMS,
  THEME_AWARE_TEXT_COLOR_ITEMS,
  THEME_AWARE_SHADOW_COLOR_ITEMS,
} from "@/components/ui/ui-builder/internal/form-fields/classname-control/theme-aware-config";

export type ConfigItem = {
  label: string;
  possibleTypes: readonly (string | null)[];
  component: typeof ToggleGroup;
  options: ToggleOption[];
  parse?: (token: string) => string | null;
  multiple?: boolean;
};

export type ConfigType = {
  [key: string]: ConfigItem;
};
export const CONFIG: ConfigType = {
  width: {
    label: "Width",
    possibleTypes: [
      null,
      ...filterClassnameArray(TAILWIND_AUTO_WIDTH_CLASSES, ["w-full","w-max"] as const),
      ...TAILWIND_FIXED_WIDTH_CLASSES,
      ...TAILWIND_PERCENTAGE_WIDTH_CLASSES,
    ] as const,
    component: ToggleGroup,
    options: [
      { value: "w-full", tooltip: "Fill (w-full)", icon: <FillIcon /> },
      { value: "w-max", tooltip: "Hug (w-max)", icon: <HugIcon /> },
      {
        value: "_w-fixed",
        label: "Fixed",
        tooltip: "Fixed (w-*)",
        icon: <FixedIcon />,
        dropdown: {
          items: TAILWIND_FIXED_WIDTH_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("w-", "") as ReactNode,
          }))
        },
      },
      {
        value: "_w-percentage",
        label: "Percentage (w-*/*)",
        tooltip: "Percentage",
        icon: <Percent className="!size-[14px]" />,
        dropdown: {
          items: TAILWIND_PERCENTAGE_WIDTH_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("w-", "") as ReactNode,
          })),
        },
      },
    ],
  },
  height: {
    label: "Height",
    possibleTypes: [
      null,
      ...filterClassnameArray(TAILWIND_AUTO_HEIGHT_CLASSES, ["h-full","h-auto"] as const),
      ...TAILWIND_FIXED_HEIGHT_CLASSES,
      ...TAILWIND_PERCENTAGE_HEIGHT_CLASSES,
    ] as const,
    component: ToggleGroup,
    options: [
      { value: "h-full", tooltip: "Fill (h-full)", icon: <FillIcon className="rotate-90" /> },
      { value: "h-auto", tooltip: "Hug (h-auto)", icon: <HugIcon className="rotate-90" /> },
      {
        value: "_h-fixed",
        label: "Fixed",
        tooltip: "Fixed (h-*)",
        icon: <FixedIcon className="rotate-90" />,
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
        icon: <Percent className="!size-[14px]" />,
        dropdown: {
          items: TAILWIND_PERCENTAGE_HEIGHT_CLASSES.map((cls) => ({
            value: cls,
            label: cls.replace("h-", "") as ReactNode,
          })),
        },
      },
    ],
  },
  border: {
    label: "Border",
    possibleTypes: [
      null,
      ...SHADCN_TAILWIND_BORDER_COLOR_CLASSES,
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
        icon: <Palette className="!size-[14px]"  />,
        dropdown: {
          dropdownDisplay: "grid",
          items: THEME_AWARE_BORDER_COLOR_ITEMS,
        },
      },
    ],
  },
  background: {
    label: "Fill & Opacity",
    possibleTypes: [
      null,
      ...TAILWIND_BACKGROUND_COLOR_CLASSES,
      ...SHADCN_TAILWIND_BACKGROUND_COLOR_CLASSES,
      ...TAILWIND_OPACITY_CLASSES,
    ] as const,
    component: ToggleGroup,
    multiple: true,
    options: [
      {
        value: "_bg-color",
        label: "Color",
        tooltip: "Background Color (bg-*)",
        icon: <Palette className="!size-[14px]"  />,
        dropdown: {
          dropdownDisplay: "grid",
          items: THEME_AWARE_BACKGROUND_COLOR_ITEMS,
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
      ...SHADCN_TAILWIND_TEXT_COLOR_CLASSES,
      ...TAILWIND_TEXT_COLOR_CLASSES,
    ] as const,
    component: ToggleGroup,
    multiple: true,
    options: [
      {
        value: "_font-size",
        label: "Size",
        tooltip: "Font Size (text-*)",
        icon: <Heading className="!size-[14px]"  />,
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
        icon: <Type className="!size-[14px]"  />,
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
        icon: <UnfoldHorizontal className="!size-[14px]"  />,
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
        icon: <Palette className="!size-[14px]"  />,
        dropdown: {
          dropdownDisplay: "grid",
          items: THEME_AWARE_TEXT_COLOR_ITEMS,
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
      }
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
        icon: <Palette className="!size-[14px]"  />,
        dropdown: {
          dropdownDisplay: "grid",
          items: THEME_AWARE_SHADOW_COLOR_ITEMS,
        },
      },
    ],
  },
  display: {
    label: "Layout",
    possibleTypes: [
      null,
      ...filterClassnameArray(TAILWIND_DISPLAY_CLASSES, ["block", "inline", "flex"] as const),
    ] as const,
    component: ToggleGroup,
    options: [
      { value: "block", tooltip: "Block", label: "Block" },
      { value: "inline", tooltip: "Inline", label: "Inline" },
      { value: "flex", tooltip: "Flex Box", label: "Flex Box" },
    ],
  },
  flexSettings: {
    label: "Flex Settings",
    possibleTypes: [
      null,
      ...TAILWIND_FLEX_DIRECTION_CLASSES,
      ...TAILWIND_ALIGN_ITEMS_CLASSES,
      ...TAILWIND_JUSTIFY_CONTENT_CLASSES,
      ...TAILWIND_GAP_CLASSES,
      ...filterClassnameArray(TAILWIND_FLEX_WRAP_CLASSES, ["flex-wrap","flex-nowrap","flex-wrap-reverse"] as const),
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
        dropdown: {
          items: [
            { value: "flex-wrap", label: "wrap" },
            { value: "flex-nowrap", label: "nowrap" },
            { value: "flex-wrap-reverse", label: "wrap-reverse" },
          ],
        },
      },
    ],
  },
};

export type StateType = {
  [key in keyof typeof CONFIG]:
    | (typeof CONFIG)[key]["possibleTypes"][number]
    | string[]
    | null;
};

export const LAYOUT_GROUPS: {
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
      ],
    },
  ];
  
export const LAYOUT_ORDER: Array<
    | { 
        type: "group"; 
        label: string; 
        isVisible?: (state: StateType) => boolean;
        className?: string;
     }
    | {
        type: "item";
        key: keyof typeof CONFIG;
        isVisible?: (state: StateType) => boolean;
        className?: string;
      }
  > = [
    { type: "item", key: "width" },
    { type: "item", key: "height"},
    { type: "group", label: "Margin", className: "w-fit mr-2" },
    { type: "group", label: "Padding", className: "w-fit" },
    { type: "item", key: "display" },
    {
      type: "item",
      key: "flexSettings",
      isVisible: (state) => state.display === "flex",
    },
    { type: "item", key: "typography" },
    { type: "item", key: "background" },
    { type: "item", key: "border", className: "w-fit mr-2" },
    { type: "item", key: "boxShadow", className: "w-fit" },
  ];
