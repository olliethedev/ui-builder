import {
  TAILWIND_BORDER_COLOR_CLASSES,
  TAILWIND_BACKGROUND_COLOR_CLASSES,
  TAILWIND_TEXT_COLOR_CLASSES,
  TAILWIND_BOX_SHADOW_COLOR_CLASSES,
  SHADCN_TAILWIND_BORDER_COLOR_CLASSES,
  SHADCN_TAILWIND_BACKGROUND_COLOR_CLASSES,
  SHADCN_TAILWIND_TEXT_COLOR_CLASSES,
} from "@/components/ui/ui-builder/internal/utils/tailwind-classes";
import { ThemeAwareDropdownOption } from "@/components/ui/ui-builder/internal/form-fields/classname-control/theme-aware-dropdown-option";
import { DropdownOption } from "@/components/ui/ui-builder/internal/form-fields/classname-control/toggle-group";

// Create theme-aware color dropdown items (for shadcn theme colors)
export function createThemeAwareColorDropdown(
  colorClasses: readonly string[],
  classPrefix: string,
  bgPrefix: string
) {
  return colorClasses.map((cls) => {
    const colorName = cls.replace(classPrefix, "");
    const colorClass = cls.replace(classPrefix, bgPrefix);
    
    return {
      value: cls,
      label: (
        <ThemeAwareDropdownOption color={colorClass}>
          {colorName}
        </ThemeAwareDropdownOption>
      ),
    };
  });
}

// Create regular color dropdown items (for standard Tailwind colors)
export function createRegularColorDropdown(
  colorClasses: readonly string[],
  classPrefix: string,
  bgPrefix: string
) {
  return colorClasses.map((cls) => {
    const colorName = cls.replace(classPrefix, "");
    const colorClass = cls.replace(classPrefix, bgPrefix);
    
    return {
      value: cls,
      label: (
        <DropdownOption color={colorClass}>
          {colorName}
        </DropdownOption>
      ),
    };
  });
}

// Combine theme-aware and regular colors for a complete dropdown
export function createCombinedColorDropdown(
  shadcnClasses: readonly string[],
  tailwindClasses: readonly string[],
  classPrefix: string,
  bgPrefix: string
) {
  const themeColors = createThemeAwareColorDropdown(shadcnClasses, classPrefix, bgPrefix);
  const regularColors = createRegularColorDropdown(tailwindClasses, classPrefix, bgPrefix);
  
  return [
    ...themeColors,
    ...regularColors,
  ];
}

// Theme-aware border colors (prioritizing shadcn theme colors)
export const THEME_AWARE_BORDER_COLOR_ITEMS = createCombinedColorDropdown(
  SHADCN_TAILWIND_BORDER_COLOR_CLASSES,
  TAILWIND_BORDER_COLOR_CLASSES,
  "border-",
  "bg-"
);

// Theme-aware background colors (prioritizing shadcn theme colors) 
export const THEME_AWARE_BACKGROUND_COLOR_ITEMS = createCombinedColorDropdown(
  SHADCN_TAILWIND_BACKGROUND_COLOR_CLASSES,
  TAILWIND_BACKGROUND_COLOR_CLASSES,
  "bg-",
  "bg-"
);

// Theme-aware text colors (prioritizing shadcn theme colors)
export const THEME_AWARE_TEXT_COLOR_ITEMS = createCombinedColorDropdown(
  SHADCN_TAILWIND_TEXT_COLOR_CLASSES,
  TAILWIND_TEXT_COLOR_CLASSES,
  "text-",
  "bg-"
);

// For box shadow colors, we'll use regular Tailwind colors since there's no shadcn equivalent
export const THEME_AWARE_SHADOW_COLOR_ITEMS = createRegularColorDropdown(
  TAILWIND_BOX_SHADOW_COLOR_CLASSES,
  "shadow-",
  "bg-"
); 