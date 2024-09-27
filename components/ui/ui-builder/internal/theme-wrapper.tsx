import React from "react";
import { baseColors, BaseColor } from "./base-colors";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface ThemeWrapperProps {
    style: React.CSSProperties;
    className?: string;
    children: React.ReactNode;
  }
  
  const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ style, className, children }) => {
    console.log("ThemeWrapper", style, className);
    // const color = baseColors.find((c) => c.name === colorName);

    // const { theme } = useTheme();
  
    // if (!color) {
    //   console.error(`Color ${colorName} not found in baseColors`);
    //   return <>{children}</>;
    // }
  
    // const style = {
    //   "--radius": radius,
    //   "--primary": color.activeColor[theme === "light" ? "light" : "dark"],
    //   ...Object.entries(color.cssVars[theme === "light" ? "light" : "dark"]).reduce((acc, [key, value]) => {
    //     acc[`--${key}`] = value;
    //     return acc;
    //   }, {} as { [key: string]: string }),
    // } as React.CSSProperties;
  
    return (
      <div className={cn("theme-wrapper", className)} style={style}>
        {children}
      </div>
    );
  };

export default ThemeWrapper;