"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBreadcrumbsFromUrl } from "@/app/docs/docs-data/data";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PencilIcon } from "lucide-react";

export function DocBreadcrumbs() {
  const pathname = usePathname();
  const slug = pathname.replace("/docs/", "");

  const currentPath = `/docs/${slug}`;
  const breadcrumbs = getBreadcrumbsFromUrl(currentPath);
  return (
    <>
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbPage className="text-muted-foreground">
            {breadcrumbs.category.title}
          </BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{breadcrumbs.page.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    {pathname != "/docs" && (
    <Link href={`${pathname}/edit`}>
      <Button variant="ghost" size="sm">
        <PencilIcon className="w-4 h-4" />
      </Button>
    </Link>
    )}
    </>
  );
}
