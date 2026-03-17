"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { pixelBasedPreset } from "@react-email/components";
import { CheckIcon, InfoIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import {
  baseColors,
  type BaseColor,
} from "@/components/ui/ui-builder/internal/utils/base-colors";
import type { ComponentLayer } from "@/components/ui/ui-builder/types";
import {
  createEmailTailwindConfig,
  getEmailThemeColors,
} from "@/lib/ui-builder/email/email-theme-config";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { cn } from "@/lib/utils";

function findFirstTailwindLayer(layer: ComponentLayer | undefined): ComponentLayer | null {
  if (!layer) return null;
  if (layer.type === "Tailwind") return layer;

  if (!Array.isArray(layer.children)) return null;
  for (const child of layer.children) {
    const found = findFirstTailwindLayer(child);
    if (found) return found;
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function getTailwindLayerConfig(layer: ComponentLayer | null): Record<string, unknown> {
  if (!layer) return {};
  const layerProps = asRecord(layer.props);
  return asRecord(layerProps.config);
}

export function EmailTailwindThemePanel() {
  const selectedPageId = useLayerStore((state) => state.selectedPageId);
  const updateLayer = useLayerStore((state) => state.updateLayer);
  const findLayerById = useLayerStore((state) => state.findLayerById);

  const selectedPage = findLayerById(selectedPageId) as ComponentLayer | undefined;
  const tailwindLayer = useMemo(
    () => findFirstTailwindLayer(selectedPage),
    [selectedPage]
  );

  const [isCustomTheme, setIsCustomTheme] = useState(false);
  const [colorTheme, setColorTheme] = useState<BaseColor["name"]>("blue");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [radius, setRadius] = useState(0.5);

  useEffect(() => {
    if (!tailwindLayer) return;
    const existingConfig = getTailwindLayerConfig(tailwindLayer);
    const theme = asRecord(existingConfig.theme);
    const themeExtend = asRecord(theme.extend);
    const currentColors = asRecord(themeExtend.colors);
    const currentRadius = asRecord(themeExtend.borderRadius);
    const defaultColors = getEmailThemeColors("light", "zinc");
    const defaultRadius = {
      lg: "0.5rem",
      md: "calc(0.5rem - 2px)",
      sm: "calc(0.5rem - 4px)",
    };
    const hasCustomColors =
      JSON.stringify(currentColors) !== JSON.stringify(defaultColors) ||
      JSON.stringify(currentRadius) !== JSON.stringify(defaultRadius);

    setIsCustomTheme((prev) => (prev === hasCustomColors ? prev : hasCustomColors));
  }, [tailwindLayer]);

  useEffect(() => {
    if (!tailwindLayer) return;

    const existingConfig = getTailwindLayerConfig(tailwindLayer);

    if (!isCustomTheme) {
      const nextConfig = createEmailTailwindConfig();
      if (JSON.stringify(existingConfig) !== JSON.stringify(nextConfig)) {
        updateLayer(tailwindLayer.id, { config: nextConfig });
      }
      return;
    }

    const existingTheme = asRecord(existingConfig.theme);
    const existingExtend = asRecord(existingTheme.extend);
    const colors = getEmailThemeColors(mode, colorTheme);

    const nextConfig = {
      ...existingConfig,
      presets: [pixelBasedPreset],
      theme: {
        ...existingTheme,
        extend: {
          ...existingExtend,
          colors,
          borderRadius: {
            lg: `${radius}rem`,
            md: `calc(${radius}rem - 2px)`,
            sm: `calc(${radius}rem - 4px)`,
          },
        },
      },
    };

    if (JSON.stringify(existingConfig) !== JSON.stringify(nextConfig)) {
      updateLayer(tailwindLayer.id, { config: nextConfig });
    }
  }, [tailwindLayer, isCustomTheme, colorTheme, mode, radius, updateLayer]);

  const handleToggleCustomTheme = useCallback((pressed: boolean) => {
    setIsCustomTheme(pressed);
  }, []);

  if (!tailwindLayer) {
    return (
      <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
        <InfoIcon className="size-4" />
        Add a Tailwind layer to enable email theme controls.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <Toggle
        variant="outline"
        onPressedChange={handleToggleCustomTheme}
        pressed={isCustomTheme}
      >
        {isCustomTheme ? "Use Default Email Theme" : "Use Custom Email Theme"}
      </Toggle>

      {!isCustomTheme && (
        <span className="flex items-center gap-2 text-sm">
          <InfoIcon className="size-4" /> Using default Tailwind email preset.
        </span>
      )}

      {isCustomTheme && (
        <div className="flex flex-col gap-2">
          <Label className="mt-2">Colors</Label>
          <div className="flex gap-2 flex-wrap">
            {baseColors.map((color) => (
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
                    backgroundColor: `hsl(${color.activeColor[mode === "dark" ? "dark" : "light"]})`,
                  }}
                >
                  {color.name === colorTheme && <CheckIcon className="size-4" />}
                </div>
                {color.label}
              </Button>
            ))}
          </div>

          <Label className="mt-2">Border Radius</Label>
          <div className="flex gap-2 flex-wrap">
            {[0.0, 0.15, 0.3, 0.5, 0.75, 1.0].map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                className={cn("gap-2", radius === value && "border-primary border-2")}
                onClick={() => setRadius(value)}
              >
                {value}
              </Button>
            ))}
          </div>

          <Label className="mt-2">Mode</Label>
          <div className="flex gap-2">
            {(["light", "dark"] as const).map((modeOption) => (
              <Button
                key={modeOption}
                variant="outline"
                size="sm"
                className={cn(mode === modeOption && "border-primary border-2")}
                onClick={() => setMode(modeOption)}
              >
                {modeOption === "light" ? (
                  <SunIcon className="mr-1 -translate-x-1" />
                ) : (
                  <MoonIcon className="mr-1 -translate-x-1" />
                )}
                {modeOption}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
