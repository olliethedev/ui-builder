import React from "react";
import {
  baseColors,
  BaseColor,
} from "@/components/ui/ui-builder/internal/base-colors";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "../../label";
import { CheckIcon, MoonIcon, SunIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemePanel() {
  return (
    <div>
      <ThemePicker />
    </div>
  );
}

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  console.log({ theme });
  const currentColorTheme = "red";
  const currentBorderRadius = 0.3;

  const colorOptions = baseColors.map((color: BaseColor) => {
    return (
      <Button
        key={color.name}
        variant="outline"
        size="sm"
        className={cn("gap-2", color.name === currentColorTheme && "border-primary border-2")}
      >
        <div
          className="size-4 rounded-full"
          style={{
            backgroundColor: `hsl(${
              color.activeColor[theme === "dark" ? "dark" : "light"]
            })`,
          }}
        >
          {color.name === currentColorTheme && <CheckIcon className="size-4" />}
        </div>
        {color.label}
      </Button>
    );
  });
  const borderRadiusOptions = [0.0, 0.15, 0.3, 0.5, 0.75, 1.0].map((radius) => {
    return (
      <Button key={radius} variant="outline" size="sm" className={cn("gap-2", radius === currentBorderRadius && "border-primary border-2")}>
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
  const handleColorClick = (color: BaseColor) => {
    // setTheme(color.name);
    console.log({ color });
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="mt-2">Colors</Label>
      <div className="flex gap-2 flex-wrap">{colorOptions}</div>
      <Label className="mt-2">Border Radius</Label>
      <div className="flex gap-2 flex-wrap">{borderRadiusOptions}</div>
      <Label className="mt-2">Mode</Label>
      <div className="flex gap-2">
        <Button
          variant={"outline"}
          size="sm"
          onClick={() => setTheme("light")}
          className={cn(theme === "light" && "border-2 border-primary")}
        >
          <SunIcon className="mr-1 -translate-x-1" />
          Light
        </Button>
        <Button
          variant={"outline"}
          size="sm"
          onClick={() => setTheme("dark")}
          className={cn(theme === "dark" && "border-2 border-primary")}
        >
          <MoonIcon className="mr-1 -translate-x-1" />
          Dark
        </Button>
      </div>
    </div>
  );
}
