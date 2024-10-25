import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PageLayer,
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { pageLayerToCode } from "@/components/ui/ui-builder/internal/templates";
import { CodeBlock } from "@/components/ui/ui-builder/codeblock";
import { cn } from "@/lib/utils";


//todo: improve performance of this component
export function CodePanel({className}: {className?: string}) {
    
  const { selectedPageId, findLayerById } = useLayerStore();

  const page = findLayerById(selectedPageId) as PageLayer;
  const codeBlocks = {
    react: pageLayerToCode(page),
    serialized: JSON.stringify(
      page,
      (key, value) => (typeof value === "function" ? undefined : value),
      2
    ),
  };
  return <CodeContent codeBlocks={codeBlocks} className={className} />;
}

const CodeContent = ({
  codeBlocks,
  className,
}: {
  codeBlocks: Record<"react" | "serialized", string>;
  className?: string;
}) => {
  return (
    <Tabs defaultValue="react" className={cn("w-full overflow-hidden", className)}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="react">React</TabsTrigger>
        <TabsTrigger value="serialized">Serialized</TabsTrigger>
      </TabsList>
      {Object.entries(codeBlocks).map(([lang, code]) => (
        <TabsContent key={lang} value={lang}>
          <div className="relative">
            <div className="overflow-auto max-h-[400px] w-full">
              <CodeBlock language="tsx" value={code} />
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
