"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Sandpack, useSandpack } from "@codesandbox/sandpack-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TrashIcon, PlusIcon, CheckIcon } from "@radix-ui/react-icons";
import { useEditorStore, CustomComponent } from "@/lib/ui-builder/store/editor-store";
import { RegistryEntry } from "@/components/ui/ui-builder/types";
import { z } from "zod";
import { toast } from "sonner";
import { 
  evaluateSchema, 
  createPlaceholderComponent, 
  getDefaultFieldOverrides,
  validateComponentName,
  validateComponentCode 
} from "@/lib/ui-builder/utils/component-evaluator";

const DEFAULT_COMPONENT_CODE = `import React from "react";

interface Props {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  variant?: "default" | "outline";
}

export default function CustomComponent({ 
  className = "", 
  children, 
  title = "Custom Component",
  variant = "default" 
}: Props) {
  return (
    <div className={\`\${className} p-4 border rounded-lg \${
      variant === "outline" ? "border-gray-300" : "bg-gray-50 border-gray-200"
    }\`}>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}`;

const DEFAULT_SCHEMA_CODE = `z.object({
  className: z.string().optional(),
  children: z.any().optional(),
  title: z.string().default("Custom Component"),
  variant: z.enum(["default", "outline"]).default("default"),
})`;

export function SandpackComponentCreator() {
  const [componentName, setComponentName] = useState("");
  const [schemaCode, setSchemaCode] = useState(DEFAULT_SCHEMA_CODE);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [sandpackReady, setSandpackReady] = useState(false);
  const [currentCode, setCurrentCode] = useState(DEFAULT_COMPONENT_CODE);

  const { customComponents, addCustomComponent, removeCustomComponent, updateCustomComponent } = useEditorStore();

  const selectedComponent = useMemo(() => 
    customComponents.find(c => c.id === selectedComponentId),
    [customComponents, selectedComponentId]
  );

  const sandpackFiles = useMemo(() => ({
    "/App.js": {
      code: selectedComponent?.code || currentCode,
    },
    "/package.json": {
      code: JSON.stringify({
        dependencies: {
          react: "^18.0.0",
          "react-dom": "^18.0.0",
        },
      }, null, 2),
    },
  }), [selectedComponent?.code, currentCode]);

  const handleCreateComponent = useCallback(async () => {
    // Validate component name
    const nameValidation = validateComponentName(componentName);
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    // Check for duplicate names
    if (customComponents.some(c => c.name === componentName && c.id !== selectedComponentId)) {
      toast.error("A component with this name already exists");
      return;
    }

    setIsCreating(true);

    try {
      // Get the current code from the editor
      const componentCode = currentCode;
      
      // Validate component code
      const codeValidation = validateComponentCode(componentCode);
      if (!codeValidation.isValid) {
        toast.error(codeValidation.error);
        setIsCreating(false);
        return;
      }

      // Parse the schema
      const parsedSchema = evaluateSchema(schemaCode);
      if (!parsedSchema) {
        toast.error("Invalid schema code. Please check your Zod schema syntax.");
        setIsCreating(false);
        return;
      }

      // Create a placeholder component for the UI builder
      const dynamicComponent = createPlaceholderComponent(componentName, componentCode);

      const registryEntry: RegistryEntry<React.ComponentType<any>> = {
        component: dynamicComponent,
        schema: parsedSchema,
        from: `@/custom-components/${componentName}`,
        fieldOverrides: getDefaultFieldOverrides(),
      };

      const componentData: CustomComponent = {
        id: selectedComponentId || crypto.randomUUID(),
        name: componentName,
        code: componentCode,
        schema: schemaCode,
        createdAt: new Date(),
      };

      if (selectedComponentId) {
        updateCustomComponent(selectedComponentId, componentData, registryEntry);
        toast.success("Component updated successfully!");
      } else {
        addCustomComponent(componentData, registryEntry);
        toast.success("Component created successfully!");
        setComponentName("");
        setSchemaCode(DEFAULT_SCHEMA_CODE);
        setCurrentCode(DEFAULT_COMPONENT_CODE);
      }
    } catch (error) {
      console.error("Failed to create component:", error);
      toast.error("Failed to create component. Please check your code.");
    } finally {
      setIsCreating(false);
    }
  }, [componentName, schemaCode, currentCode, selectedComponentId, customComponents, addCustomComponent, updateCustomComponent]);

  const handleDeleteComponent = useCallback((componentId: string) => {
    removeCustomComponent(componentId);
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
      setComponentName("");
      setSchemaCode(DEFAULT_SCHEMA_CODE);
    }
    toast.success("Component deleted successfully!");
  }, [removeCustomComponent, selectedComponentId]);

  const handleSelectComponent = useCallback((component: CustomComponent) => {
    setSelectedComponentId(component.id);
    setComponentName(component.name);
    setSchemaCode(component.schema || DEFAULT_SCHEMA_CODE);
    setCurrentCode(component.code);
  }, []);

  const handleNewComponent = useCallback(() => {
    setSelectedComponentId(null);
    setComponentName("");
    setSchemaCode(DEFAULT_SCHEMA_CODE);
    setCurrentCode(DEFAULT_COMPONENT_CODE);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Component Creator</h2>
        <Button onClick={handleNewComponent} size="sm" variant="outline">
          <PlusIcon className="w-4 h-4 mr-2" />
          New Component
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="editor" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="components">My Components</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="flex-1 p-4 space-y-4 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Component Details</CardTitle>
                <CardDescription>
                  Define your component name and schema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="componentName">Component Name</Label>
                  <Input
                    id="componentName"
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                    placeholder="e.g., CustomButton"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schemaCode">Zod Schema</Label>
                  <Textarea
                    id="schemaCode"
                    value={schemaCode}
                    onChange={(e) => setSchemaCode(e.target.value)}
                    placeholder="Define your component's props schema..."
                    className="font-mono text-sm min-h-[120px]"
                  />
                </div>

                <Button 
                  onClick={handleCreateComponent} 
                  disabled={isCreating || !componentName.trim()}
                  className="w-full"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {selectedComponentId ? "Update Component" : "Create Component"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Code Editor</CardTitle>
                <CardDescription>
                  Write your React component code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <SandpackWithCodeSync 
                    files={sandpackFiles}
                    onCodeChange={setCurrentCode}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="flex-1 p-4 overflow-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Custom Components</h3>
                <Badge variant="secondary">{customComponents.length} components</Badge>
              </div>

              {customComponents.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No custom components yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create your first component using the editor tab.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {customComponents.map((component) => (
                    <Card key={component.id} className={selectedComponentId === component.id ? "ring-2 ring-primary" : ""}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{component.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Created {component.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectComponent(component)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteComponent(component.id)}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper component to sync code changes from Sandpack
function SandpackWithCodeSync({ 
  files, 
  onCodeChange 
}: { 
  files: Record<string, { code: string }>;
  onCodeChange: (code: string) => void;
}) {
  return (
    <Sandpack
      template="react"
      files={files}
      options={{
        showNavigator: false,
        showTabs: false,
        showLineNumbers: true,
        editorHeight: 400,
      }}
      theme="light"
      customSetup={{
        dependencies: {
          "react": "^18.0.0",
          "react-dom": "^18.0.0"
        }
      }}
    />
  );
}