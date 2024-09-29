import { BaseColor } from "@/components/ui/ui-builder/internal/base-colors";
import { PageLayer } from "@/components/ui/ui-builder/internal/store/component-store";

export function getPageStyles(page: PageLayer) {
  const themeColors = page?.props?.themeColors as BaseColor | undefined;
  const themeMode = (page?.props?.mode || "light") as "light" | "dark";

  const styleVariables = Object.entries(
    themeColors?.cssVars[themeMode] || {}
  ).reduce(
    (acc, [key, value]) => {
      acc[`--${key}`] = value;
      return acc;
    },
    {} as { [key: string]: string }
  );
  return { styleVariables, themeColors, themeMode };
}

export function themeToStyleVars(
  colors: BaseColor["cssVars"]["dark"] | BaseColor["cssVars"]["light"] | undefined,
) {
  if (!colors) {
    return undefined;
  }
  const styleVariables = Object.entries(colors).reduce(
    (acc, [key, value]) => {
      acc[`--${key}`] = value;
      return acc;
    },
    {} as { [key: string]: string }
  );
  return styleVariables;
}
