"use client";
import { useTheme } from "next-themes"
import { useCallback } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { SunIcon, MoonIcon } from "lucide-react"

export function ThemeToggle() {
  const { setTheme } = useTheme();


  const handleSetLightTheme = useCallback(() => {
    setTheme("light");
  }, [setTheme]);
  const handleSetDarkTheme = useCallback(() => {
    setTheme("dark");
  }, [setTheme]);
  const handleSetSystemTheme = useCallback(() => {
    setTheme("system");
  }, [setTheme]);

  return (
    <DropdownMenu>
      <Tooltip>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
              <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </TooltipTrigger>
        </DropdownMenuTrigger>
        <TooltipContent>Toggle theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" >
        <DropdownMenuItem onClick={handleSetLightTheme}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={handleSetDarkTheme}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={handleSetSystemTheme}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}