import { BaseColor } from "@/components/ui/ui-builder/internal/base-colors";

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
