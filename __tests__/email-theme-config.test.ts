jest.mock("@react-email/components", () => ({
  pixelBasedPreset: { preset: true },
}));

jest.mock("@/components/ui/ui-builder/internal/utils/base-colors", () => ({
  baseColors: [
    {
      name: "zinc",
      label: "Zinc",
      activeColor: { light: "0 0% 100%", dark: "0 0% 10%" },
      cssVars: {
        light: {
          background: "0 0% 100%",
          foreground: "0 0% 10%",
          card: "0 0% 98%",
          "card-foreground": "0 0% 10%",
          popover: "0 0% 98%",
          "popover-foreground": "0 0% 10%",
          primary: "200 100% 30%",
          "primary-foreground": "0 0% 100%",
          secondary: "210 40% 96%",
          "secondary-foreground": "0 0% 10%",
          muted: "210 40% 96%",
          "muted-foreground": "0 0% 40%",
          accent: "210 40% 96%",
          "accent-foreground": "0 0% 10%",
          destructive: "0 84% 60%",
          border: "0 0% 90%",
          input: "0 0% 90%",
          ring: "200 100% 30%",
        },
        dark: {
          background: "0 0% 10%",
          foreground: "0 0% 98%",
          card: "0 0% 12%",
          "card-foreground": "0 0% 98%",
          popover: "0 0% 12%",
          "popover-foreground": "0 0% 98%",
          primary: "200 100% 60%",
          "primary-foreground": "0 0% 10%",
          secondary: "210 40% 20%",
          "secondary-foreground": "0 0% 98%",
          muted: "210 40% 20%",
          "muted-foreground": "0 0% 70%",
          accent: "210 40% 20%",
          "accent-foreground": "0 0% 98%",
          destructive: "0 84% 60%",
          border: "0 0% 20%",
          input: "0 0% 20%",
          ring: "200 100% 60%",
        },
      },
    },
    {
      name: "no-dark",
      label: "NoDark",
      activeColor: { light: "0 0% 100%", dark: "0 0% 10%" },
      cssVars: {
        light: {
          background: "0 0% 100%",
        },
      },
    },
  ],
}));

import {
  getEmailThemeColors,
  createEmailTailwindConfig,
  DEFAULT_EMAIL_TAILWIND_CONFIG,
} from "@/lib/ui-builder/email/email-theme-config";

describe("email-theme-config", () => {
  it("returns semantic color tokens mapped to hsl values", () => {
    const colors = getEmailThemeColors("light", "zinc" as any);
    expect(colors).toHaveProperty("primary", "hsl(200 100% 30%)");
    expect(colors).toHaveProperty("background", "hsl(0 0% 100%)");
    expect(colors).toHaveProperty("muted-foreground", "hsl(0 0% 40%)");
  });

  it("returns empty object when mode vars are missing", () => {
    const colors = getEmailThemeColors("dark", "no-dark" as any);
    expect(colors).toEqual({});
  });

  it("creates tailwind config with preset and border radius scale", () => {
    const config = createEmailTailwindConfig("zinc" as any, "dark", 0.75);
    expect(config.presets).toEqual([{ preset: true }]);
    expect(config.theme.extend.borderRadius).toEqual({
      lg: "0.75rem",
      md: "calc(0.75rem - 2px)",
      sm: "calc(0.75rem - 4px)",
    });
    expect(config.theme.extend.colors).toHaveProperty("primary");
  });

  it("exports default email config with extend colors", () => {
    expect(DEFAULT_EMAIL_TAILWIND_CONFIG.theme.extend.colors).toBeDefined();
    expect(DEFAULT_EMAIL_TAILWIND_CONFIG.theme.extend.borderRadius).toBeDefined();
  });
});
