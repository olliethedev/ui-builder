"use client";

import { ReactNode, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { baseColors } from "@/components/ui/ui-builder/internal/utils/base-colors";
import { ComponentLayer } from "@/components/ui/ui-builder/types";

// Known prefixes for shadcn theme colors
const THEME_COLOR_PREFIXES = ["bg-", "text-", "border-", "shadow-"] as const;

export function ThemeAwareDropdownOption({
  color,
  children,
}: {
  color?: string;
  children: ReactNode;
}) {
  const  selectedPageId = useLayerStore( state => state.selectedPageId);
  const findLayerById = useLayerStore( state => state.findLayerById);
  
  // Get current theme information
  const selectedPageData = findLayerById(selectedPageId) as ComponentLayer;
  const currentTheme = selectedPageData?.props?.["data-color-theme"];
  const currentMode = selectedPageData?.props?.["data-mode"] || "light";
  
  
  // Resolve the actual color value
  const getResolvedColor = (colorClass?: string): string | undefined => {
    if (!colorClass) {
      return undefined;
    }
    
    // Check if this is a theme color by trying to strip known prefixes
    let themeColorKey: string | undefined;
    for (const prefix of THEME_COLOR_PREFIXES) {
      if (colorClass.startsWith(prefix)) {
        themeColorKey = colorClass.substring(prefix.length);
        break;
      }
    }
    
    if (themeColorKey && currentTheme) {
      try {
        // Find the current theme data
        const themeData = baseColors.find((theme) => theme.name === currentTheme);
        
        if (themeData?.cssVars) {
          const modeColors = themeData.cssVars[currentMode as "light" | "dark"];
          
          if (modeColors) {
            const colorValue = (modeColors as any)[themeColorKey];
            
            if (colorValue) {
              const hslColor = `hsl(${colorValue})`;
              return hslColor;
            }
          }
        }
      } catch (error) {
        // Silently fail and fall back to using the class name
        console.warn(`Failed to resolve theme color for ${colorClass}:`, error);
      }
    }
    
    // Fallback to using the Tailwind class (for non-theme colors like bg-red-500)
    return undefined;
  };

  const resolvedColor = getResolvedColor(color);

  const style = useMemo(() => ({ backgroundColor: resolvedColor }), [resolvedColor]);
  

  return (
    <div className="flex flex-row items-center justify-start text-center w-full">
      {color && (
        <span
          className={cn(
            "inline-block size-[14px] rounded-full border border-border mr-1",
            // Use resolved color as inline style if available, otherwise fall back to class
            !resolvedColor && color
          )}
          style={resolvedColor ? style : undefined}
        />
      )}
      <span className="text-xs text-muted-foreground">{children}</span>
    </div>
  );
} 