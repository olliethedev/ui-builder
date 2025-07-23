import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MENU_DATA } from "@/app/docs/docs-data/data";
import { ArrowRightIcon } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about building UIs with our drag-and-drop builder.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MENU_DATA.map((section) => (
            <Card key={section.title} className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription>
                  {getCardDescription(section.title)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.items?.map((item) => (
                    <Link
                      key={item.title}
                      href={item.url}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group"
                    >
                      <span className="text-sm font-medium">{item.title}</span>
                      <ArrowRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function getCardDescription(title: string): string {
  const descriptions: Record<string, string> = {
    "Core": "Get started with the fundamentals of the UI builder",
    "Component System": "Learn about components, customization, and configuration",
    "Editor Features": "Explore the powerful editor panels and features",
    "Data & Variables": "Master data binding and variable management",
    "Layout & Persistence": "Understand structure and state management",
    "Rendering": "Learn how to render and theme your pages"
  };
  
  return descriptions[title] || "Explore this section";
}