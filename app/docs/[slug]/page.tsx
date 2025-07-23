import { Suspense } from "react";
import { DocRenderer } from "@/app/platform/doc-renderer";
import {
  getDocPageForSlug,
} from "@/app/docs/docs-data/data";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";

export async function generateMetadata(
  { params }: {
    params: Promise<{slug: string}>,
  }
): Promise<Metadata> {
  const slug = (await params).slug
 
  const page = getDocPageForSlug(slug);
  
  return {
    title: page?.name ? `${page.name} - UI Builder` : "Documentation - UI Builder",
    description: page?.props["data-group"] ? `Learn about ${page.props["data-group"]} features of the UI Builder component.` : "Documentation - UI Builder",
  }
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getDocPageForSlug(slug);
  if (!page) {
    notFound();
  }
  
  return (
    <div className="flex-1 overflow-auto">
      <Suspense fallback={<DocSkeleton />}>
        <DocRenderer className="max-w-6xl mx-auto my-8" page={page} />
      </Suspense>
    </div>
  );
}

function DocSkeleton() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto my-8 flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
