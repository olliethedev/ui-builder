import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export type LucideIconName = keyof typeof LucideIcons;
type LucideIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const iconVariants = cva("inline-flex", {
  variants: {
    size: {
      small: "h-4 w-4",
      medium: "h-6 w-6",
      large: "h-8 w-8",
    },
    color: {
      accent: "text-accent",
      accentForeground: "text-accent-foreground",
      primary: "text-primary",
      primaryForeground: "text-primary-foreground",
      secondary: "text-secondary",
      secondaryForeground: "text-secondary-foreground",
      destructive: "text-destructive",
      destructiveForeground: "text-destructive-foreground",
      muted: "text-muted",
      mutedForeground: "text-muted-foreground",
      background: "text-background",
      foreground: "text-foreground",
    },
    rotate: {
      none: "rotate-0",
      "90": "rotate-90",
      "180": "rotate-180",
      "270": "rotate-270",
    },
  },
  defaultVariants: {
    size: "medium",
    color: "primary",
    rotate: "none",
  },
});

export interface IconProps
  extends Omit<React.HTMLAttributes<SVGElement>, "color">,
    VariantProps<typeof iconVariants> {
  iconName: LucideIconName;
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, iconName, size, color, rotate, ...props }, ref) => {
    const IconComponent = LucideIcons[iconName] as LucideIconComponent;

    if (!IconComponent) {
      console.error(`Icon "${iconName}" does not exist in lucide-react`);
      return null;
    }

    return (
      <IconComponent
        className={cn(iconVariants({ size, color, rotate, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Icon.displayName = "Icon";

export const iconNames = Object.keys(LucideIcons)
  .filter((key) => (!key.startsWith("Lucide") && !key.endsWith("Icon")) && key !== "icons")
  .map((key) => key as LucideIconName) as [LucideIconName, ...LucideIconName[]];

export { Icon, iconVariants };
