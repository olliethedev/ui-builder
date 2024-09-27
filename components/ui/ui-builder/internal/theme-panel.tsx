import React, { useEffect, useState, useMemo } from "react";
import {
  baseColors,
  BaseColor,
} from "@/components/ui/ui-builder/internal/base-colors";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckIcon, InfoIcon, MoonIcon, SunIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageLayer, useComponentStore } from "@/components/ui/ui-builder/internal/store/component-store";
import { Toggle } from "@/components/ui/toggle";

export function ThemePanel() {
    const {pages, selectedPageId, updateLayerProps} = useComponentStore();
    const selectedPageData = useMemo(() => {
        return pages.find((page) => page.id === selectedPageId);
      }, [pages, selectedPageId]);
  const [isCustomTheme, setIsCustomTheme] = useState(false);
  //if not isCustomTheme we delete the themeColors from the pageLayer
  useEffect(() => {
    if (!isCustomTheme) {
      updateLayerProps(selectedPageId, {
        themeColors: null,
      });
    }
  }, [isCustomTheme]);
  return (
    <div className="flex flex-col gap-4 mt-4">
      <Toggle
      variant="outline"
        onPressedChange={() => setIsCustomTheme(!isCustomTheme)}
        aria-label="Toggle italic"
      >
        {isCustomTheme ? "Use Default Theme" : "Use Custom Theme"}
      </Toggle>
      {!isCustomTheme && (
        <span className="flex items-center gap-2">
        <InfoIcon className="size-4" /> Using Default Theme
      </span>
      )}
      {selectedPageData && (
        <ThemePicker isDisabled={!isCustomTheme} pageLayer={selectedPageData} />
      )}
    </div>
  );
}

function ThemePicker({ className, isDisabled, pageLayer }: { className?: string, isDisabled: boolean, pageLayer: PageLayer }) {
  
    const {updateLayerProps} = useComponentStore();

  const [colorTheme, setColorTheme] = useState<BaseColor["name"]>(pageLayer.props.themeColors?.name || "red");
  const [borderRadius, setBorderRadius] = useState(pageLayer.props.themeColors?.cssVars.radius || 0.3);
  const [mode, setMode] = useState<"light" | "dark">(pageLayer.props.themeColors?.mode || "light");

  useEffect(() => {
    if (isDisabled) return;
    console.log({ colorTheme, borderRadius, mode });
    
    const colorData = baseColors.find((color) => color.name === colorTheme);
    if (colorData) {
        const colorDataWithBorder = {
            ...colorData,
            cssVars: {
                ...colorData.cssVars,
                [mode]: {
                    ...colorData.cssVars[mode],
                    radius: `${borderRadius}rem`
                }
            }
        };

        updateLayerProps(pageLayer.id, {
            themeColors: colorDataWithBorder,
            mode, //mode is separate from colorTheme so that user can toggle light/dark modes without changing the colorTheme
        });
    }
}, [colorTheme, borderRadius, mode, isDisabled]);

  const colorOptions = baseColors.map((color: BaseColor) => {
    return (
      <Button
        key={color.name}
        variant="outline"
        size="sm"
        className={cn(
          "gap-2",
          color.name === colorTheme && "border-primary border-2"
        )}
        onClick={() => setColorTheme(color.name)}
      >
        <div
          className="size-4 rounded-full"
          style={{
            backgroundColor: `hsl(${
              color.activeColor[mode === "dark" ? "dark" : "light"]
            })`,
          }}
        >
          {color.name === colorTheme && <CheckIcon className="size-4" />}
        </div>
        {color.label}
      </Button>
    );
  });
  const borderRadiusOptions = [0.0, 0.15, 0.3, 0.5, 0.75, 1.0].map((radius) => {
    return (
      <Button
        key={radius}
        variant="outline"
        size="sm"
        className={cn(
          "gap-2",
          radius === borderRadius && "border-primary border-2"
        )}
        onClick={() => setBorderRadius(radius)}
        >
        <div className="size-6 rounded-sm bg-secondary overflow-hidden">
          <div
            className="size-10 ml-2 mt-2 border-2 border-secondary-foreground"
            style={{ borderRadius: `${radius}rem` }}
          />
        </div>
        {radius}
      </Button>
    );
  });

  const modeOptions = (["light", "dark"] as const).map((modeOption) => {
    return (
      <Button
        key={modeOption}
        variant="outline"
        size="sm"
        onClick={() => setMode(modeOption)}
        className={cn(mode === modeOption && "border-2 border-primary")}
      >    
      {modeOption === "light" ? <SunIcon className="mr-1 -translate-x-1" /> : <MoonIcon className="mr-1 -translate-x-1" />}
      {modeOption}
      </Button>
    );
  });

  return (
    <div className={cn("flex flex-col gap-2", className, isDisabled && "opacity-30")}>
      <Label className="mt-2">Colors</Label>
      <div className="flex gap-2 flex-wrap">{colorOptions}</div>
      <Label className="mt-2">Border Radius</Label>
      <div className="flex gap-2 flex-wrap">{borderRadiusOptions}</div>
      <Label className="mt-2">Mode</Label>
      <div className="flex gap-2">{modeOptions}</div>
    </div>
  );
}
