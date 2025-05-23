"use client";
import React, { useEffect, useState } from "react";
import {
  baseColors,
  BaseColor,
} from "@/components/ui/ui-builder/internal/base-colors";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckIcon, InfoIcon, MoonIcon, SunIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer } from '@/components/ui/ui-builder/types';
import { Toggle } from "@/components/ui/toggle";

export function TailwindThemePanel() {
  const {
    selectedPageId,
    updateLayer: updateLayerProps,
    findLayerById,
  } = useLayerStore();
  const selectedPageData = findLayerById(selectedPageId) as ComponentLayer;
  const [isCustomTheme, setIsCustomTheme] = useState(
    selectedPageData?.props["data-color-theme"] !== undefined
  );
  //if not isCustomTheme we delete the themeColors from the pageLayer
  useEffect(() => {
    if (!isCustomTheme) {
      updateLayerProps(selectedPageId, {
        style: undefined,
        "data-mode": undefined,
        "data-color-theme": undefined,
        "data-border-radius": undefined,
      });
    }
  }, [isCustomTheme, updateLayerProps, selectedPageId]);
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
          <InfoIcon className="size-4" /> Using Your Project&apos;s Theme
        </span>
      )}
      {selectedPageData && isCustomTheme && (
        <ThemePicker key={selectedPageId} isDisabled={!isCustomTheme} pageLayer={selectedPageData} />
      )}
    </div>
  );
}

function ThemePicker({
  className,
  isDisabled,
  pageLayer,
}: {
  className?: string;
  isDisabled: boolean;
  pageLayer: ComponentLayer;
}) {
  const { updateLayer: updateLayerProps } = useLayerStore();

  const [colorTheme, setColorTheme] = useState<BaseColor["name"]>(
    pageLayer.props?.["data-color-theme"] || "red"
  );
  const [borderRadius, setBorderRadius] = useState(
    pageLayer.props?.["data-border-radius"] || 0.3
  );
  const [mode, setMode] = useState<"light" | "dark">(
    pageLayer.props?.["data-mode"] || "light"
  );

  useEffect(() => {
    if (isDisabled) return;

    const colorData = baseColors.find((color) => color.name === colorTheme);
    if (colorData) {
      const colorDataWithBorder = {
        ...colorData,
        cssVars: {
          ...colorData.cssVars,
          [mode]: {
            ...colorData.cssVars[mode],
            radius: `${borderRadius}rem`,
          },
        },
      } as const;

      const themeStyle = themeToStyleVars(colorDataWithBorder.cssVars[mode]);

      updateLayerProps(pageLayer.id, {
        style: themeStyle,
        "data-mode": mode,
        "data-color-theme": colorTheme,
        "data-border-radius": borderRadius,
      });
    }
  }, [pageLayer.id, updateLayerProps, colorTheme, borderRadius, mode, isDisabled]);

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
        {modeOption === "light" ? (
          <SunIcon className="mr-1 -translate-x-1" />
        ) : (
          <MoonIcon className="mr-1 -translate-x-1" />
        )}
        {modeOption}
      </Button>
    );
  });

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        className,
        isDisabled && "opacity-30 pointer-events-none"
      )}
    >
      <Label className="mt-2">Colors</Label>
      <div className="flex gap-2 flex-wrap">{colorOptions}</div>
      <Label className="mt-2">Border Radius</Label>
      <div className="flex gap-2 flex-wrap">{borderRadiusOptions}</div>
      <Label className="mt-2">Mode</Label>
      <div className="flex gap-2">{modeOptions}</div>
    </div>
  );
}

function themeToStyleVars(
  colors:
    | BaseColor["cssVars"]["dark"]
    | BaseColor["cssVars"]["light"]
    | undefined
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
  const globalOverrides = {
    color: `hsl(${colors.foreground})`,
    borderColor: `hsl(${colors.border})`,
  };
  return { ...styleVariables, ...globalOverrides };
}
