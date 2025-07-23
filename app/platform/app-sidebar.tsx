"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { MENU_DATA } from "@/app/docs/docs-data/data"
import Image from "next/image";
import { GithubIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/app/platform/theme-toggle"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentPath?: string;
}

function AppSidebarContent({ currentPath, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-row justify-between items-center h-16 border-b border-border shadow-sm py-4">
        <Link href="/" className="flex flex-row items-center gap-1 hover:no-underline">
          <Image src="/logo.svg" alt="UI Builder" width={32} height={32} className="dark:invert" />
          <span className="text-2xl font-medium"><span className="sr-only">UI</span> Builder</span>
        </Link>
        <ThemeToggle />
      </SidebarHeader>
      <SidebarContent>
        {MENU_DATA.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items?.map((item) => {
                  const isActive = currentPath === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                      >
                        <Link href={item.url}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="flex flex-row justify-between items-center border-t border-border shadow-sm">
        <Link href="https://github.com/olliethedev/ui-builder" target="_blank">
          <Button size="icon" className="p-1 aspect-square">
            <GithubIcon />
          </Button>
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function AppSidebar(props: Omit<AppSidebarProps, 'currentPath'>) {
  const pathname = usePathname()
  return <AppSidebarContent currentPath={pathname} {...props} />
}
