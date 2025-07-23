import { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "@/app/platform/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DocBreadcrumbs } from "../platform/doc-breadcrumbs";

export const metadata = {
  title: "Documentation - UI Builder",
  description: "Everything you need to know about building UIs with our drag-and-drop builder.",
};

export default function DocsLayout({ 
  children
}: { 
  children: React.ReactNode,
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DocsHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}

function DocsHeader() {
  return (
    <header className="sticky z-50 top-0 bg-background flex h-16 shrink-0 items-center gap-1 border-b px-4 shadow-sm">
      <SidebarTrigger className="-ml-1" />
      <Suspense fallback={<div/>}>
        <DocBreadcrumbs />
      </Suspense>
    </header>
  );
}