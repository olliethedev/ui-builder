import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLayerStore,
} from "@/lib/ui-builder/store/layer-store";
import { ComponentLayer } from '../types';
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import { pageLayerToCode } from "@/components/ui/ui-builder/internal/utils/templates";
import { CodeBlock } from "@/components/ui/ui-builder/components/codeblock";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Label } from "../../label";


export function CodePanel({className}: {className?: string}) {
  const componentRegistry = useEditorStore((state) => state.registry);
  const selectedPageId = useLayerStore( state => state.selectedPageId);
  const findLayerById = useLayerStore( state => state.findLayerById);
  const variables = useLayerStore( state => state.variables);

  const page = findLayerById(selectedPageId) as ComponentLayer;
  const codeBlocks = useMemo(() => {
    // Create separate serialized data for variables and layers
    const serializedVariables = variables.map(v => ({
      id: v.id,
      name: v.name,
      type: v.type,
      defaultValue: v.defaultValue
    }));

    return {
      react: pageLayerToCode(page, componentRegistry, variables),
      variables: JSON.stringify(
        serializedVariables,
        (key, value) => (typeof value === "function" ? undefined : value),
        2
      ),
      layers: JSON.stringify(
        page,
        (key, value) => (typeof value === "function" ? undefined : value),
        2
      ),
    };
  }, [page, componentRegistry, variables]);

  return <CodeContent codeBlocks={codeBlocks} className={className} />;
}

const CodeContent = ({
  codeBlocks,
  className,
}: {
  codeBlocks: Record<"react" | "variables" | "layers", string>;
  className?: string;
}) => {
  return (
    <Tabs defaultValue="react" className={cn("w-full overflow-hidden", className)}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="react">React</TabsTrigger>
        <TabsTrigger value="serialized">Serialized</TabsTrigger>
      </TabsList>
      <TabsContent value="react">
        <div className="relative">
          <div className="overflow-auto max-h-[400px] w-full">
            <CodeBlock language="tsx" value={codeBlocks.react} />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="serialized">
        <div className="space-y-4">
          {codeBlocks.variables!=='[]' && (
          <div className="relative">
            <Label>Variables</Label>
            <div className="overflow-auto max-h-[200px] w-full">
              <CodeBlock language="json" value={codeBlocks.variables} />
            </div>
          </div>
          )}
          <div className="relative">
            <Label>Layers</Label>
            <div className="overflow-auto max-h-[200px] w-full">
              <CodeBlock language="json" value={codeBlocks.layers} />
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
