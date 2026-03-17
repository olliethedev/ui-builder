"use client";

import {
  baseColors,
  type BaseColor,
} from "@/components/ui/ui-builder/internal/utils/base-colors";
import { pixelBasedPreset } from "@react-email/components";

export function getEmailThemeColors(
  mode: "light" | "dark",
  colorName: BaseColor["name"]
) {
  const color = baseColors.find((item) => item.name === colorName) ?? baseColors[0];
  const vars = color?.cssVars[mode];
  if (!vars) return {};

  return {
    background: `hsl(${vars.background})`,
    foreground: `hsl(${vars.foreground})`,
    card: `hsl(${vars.card})`,
    "card-foreground": `hsl(${vars["card-foreground"]})`,
    popover: `hsl(${vars.popover})`,
    "popover-foreground": `hsl(${vars["popover-foreground"]})`,
    primary: `hsl(${vars.primary})`,
    "primary-foreground": `hsl(${vars["primary-foreground"]})`,
    secondary: `hsl(${vars.secondary})`,
    "secondary-foreground": `hsl(${vars["secondary-foreground"]})`,
    muted: `hsl(${vars.muted})`,
    "muted-foreground": `hsl(${vars["muted-foreground"]})`,
    accent: `hsl(${vars.accent})`,
    "accent-foreground": `hsl(${vars["accent-foreground"]})`,
    destructive: `hsl(${vars.destructive})`,
    border: `hsl(${vars.border})`,
    input: `hsl(${vars.input})`,
    ring: `hsl(${vars.ring})`,
  };
}

export function createEmailTailwindConfig(
  colorName: BaseColor["name"] = "zinc",
  mode: "light" | "dark" = "light",
  radius = 0.5
) {
  return {
    presets: [pixelBasedPreset],
    theme: {
      extend: {
        colors: getEmailThemeColors(mode, colorName),
        borderRadius: {
          lg: `${radius}rem`,
          md: `calc(${radius}rem - 2px)`,
          sm: `calc(${radius}rem - 4px)`,
        },
      },
    },
  };
}

export const DEFAULT_EMAIL_TAILWIND_CONFIG = {
  ...createEmailTailwindConfig(),
};
