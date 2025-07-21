import { AppSidebar } from "@/app/platform/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Suspense } from "react";
import { DocRenderer } from "@/app/platform/doc-renderer";
import { getBreadcrumbsFromUrl, getDocPageForSlug } from "@/app/docs/docs-data/data";
import { ThemeToggle } from "@/app/platform/theme-toggle";
import {  notFound } from "next/navigation";

export default async function DocPage({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }){
    const { slug } = await params;
    const page = getDocPageForSlug(slug);
    if (!page) {
        notFound();
    }
    const breadcrumbs = getBreadcrumbsFromUrl(slug);
    console.log({slug});
    return <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb className="flex-1">
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={breadcrumbs.category.url}>
                {breadcrumbs.category.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumbs.page.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ThemeToggle />
      </header>
      <Suspense fallback={<div>Loading...</div>}>
        <DocRenderer className="max-w-6xl mx-auto my-8" page={page} />
      </Suspense>
    </SidebarInset>
  </SidebarProvider>
}