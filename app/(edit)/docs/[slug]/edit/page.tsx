
import {  notFound } from "next/navigation";
import { DocEditor } from "@/app/platform/doc-editor";
import { getDocPageForSlug } from "../../../../docs/docs-data/data";

export default async function DocEditPage({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }){
    const { slug } = await params;
    const page = getDocPageForSlug(slug);
    if (!page) {
        notFound();
    }
    
    return <DocEditor page={page} />
}