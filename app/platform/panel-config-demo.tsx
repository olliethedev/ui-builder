"use client"

import React, { useState } from "react";
import UIBuilder, { defaultConfigTabsContent, TabsContentConfig } from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { shadcnComponentDefinitions } from "@/lib/ui-builder/registry/shadcn-component-definitions";
import { blockDefinitions } from "@/lib/ui-builder/registry/block-definitions";
import { ComponentLayer, Variable } from '@/components/ui/ui-builder/types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Layout, Home, Code, Eye } from "lucide-react";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";

// Super Simple Custom Nav Component
const SimpleNav = () => {
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  const selectedPageId = useLayerStore((state: any) => state.selectedPageId);
  const findLayerById = useLayerStore((state: any) => state.findLayerById);
  const componentRegistry = useEditorStore((state: any) => state.registry);
  
  const page = findLayerById(selectedPageId) as ComponentLayer;

  return (
    <>
      <div className="flex items-center justify-between bg-slate-50 px-4 py-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-800">UI Builder</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={() => setShowCodeDialog(true)}
          >
            <Code className="h-3 w-3 mr-1" />
            Code
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={() => setShowPreviewDialog(true)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Simple Code Dialog */}
      {showCodeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Generated Code</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCodeDialog(false)}>
                ×
              </Button>
            </div>
            <div className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              <pre>{`// Code export functionality would go here`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Simple Preview Dialog */}
      {showPreviewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Page Preview</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPreviewDialog(false)}>
                ×
              </Button>
            </div>
            <div className="border rounded-lg p-4">
              {page && (
                <LayerRenderer
                  className="w-full"
                  page={page}
                  componentRegistry={componentRegistry}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Sample template for panel configuration demonstrations
const sampleTemplate: ComponentLayer[] = [{
  "id": "panel-config-demo-page",
  "type": "div",
  "name": "Panel Config Demo Page",
  "props": {
    "className": "min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8",
  },
  "children": [
    {
      "id": "demo-header",
      "type": "div",
      "name": "Demo Header",
      "props": {
        "className": "max-w-4xl mx-auto text-center mb-8"
      },
      "children": [
        {
          "id": "demo-title",
          "type": "span",
          "name": "Demo Title",
          "props": {
            "className": "text-3xl font-bold text-gray-900 block mb-2",
            "children": { __variableRef: "demoTitle" }
          },
          "children": []
        },
        {
          "id": "demo-description",
          "type": "span",
          "name": "Demo Description", 
          "props": {
            "className": "text-lg text-gray-600 block",
            "children": { __variableRef: "demoDescription" }
          },
          "children": []
        }
      ]
    },
    {
      "id": "demo-content",
      "type": "div",
      "name": "Demo Content",
      "props": {
        "className": "max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
      },
      "children": [
        {
          "id": "card-1",
          "type": "Card",
          "name": "Custom Panel Card 1",
          "props": {
            "className": "hover:shadow-lg transition-shadow"
          },
          "children": [
            {
              "id": "card-1-header",
              "type": "CardHeader",
              "name": "Card 1 Header",
              "props": {},
              "children": [
                {
                  "id": "card-1-title",
                  "type": "CardTitle",
                  "name": "Card 1 Title",
                  "props": {
                    "children": { __variableRef: "card1Title" }
                  },
                  "children": []
                }
              ]
            },
            {
              "id": "card-1-content",
              "type": "CardContent",
              "name": "Card 1 Content",
              "props": {},
              "children": [
                {
                  "id": "card-1-text",
                  "type": "span",
                  "name": "Card 1 Text",
                  "props": {
                    "className": "text-gray-600",
                    "children": { __variableRef: "card1Content" }
                  },
                  "children": []
                }
              ]
            }
          ]
        },
        {
          "id": "card-2",
          "type": "Card", 
          "name": "Custom Panel Card 2",
          "props": {
            "className": "hover:shadow-lg transition-shadow"
          },
          "children": [
            {
              "id": "card-2-header",
              "type": "CardHeader",
              "name": "Card 2 Header",
              "props": {},
              "children": [
                {
                  "id": "card-2-title",
                  "type": "CardTitle",
                  "name": "Card 2 Title",
                  "props": {
                    "children": { __variableRef: "card2Title" }
                  },
                  "children": []
                }
              ]
            },
            {
              "id": "card-2-content", 
              "type": "CardContent",
              "name": "Card 2 Content",
              "props": {},
              "children": [
                {
                  "id": "card-2-text",
                  "type": "span",
                  "name": "Card 2 Text",
                  "props": {
                    "className": "text-gray-600",
                    "children": { __variableRef: "card2Content" }
                  },
                  "children": []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}];

// Sample variables for the demo
const sampleVariables: Variable[] = [
  {
    id: "demoTitle",
    name: "demoTitle",
    type: "string",
    defaultValue: "Panel Configuration Demo"
  },
  {
    id: "demoDescription", 
    name: "demoDescription",
    type: "string",
    defaultValue: "This demo showcases custom panel configurations"
  },
  {
    id: "card1Title",
    name: "card1Title", 
    type: "string",
    defaultValue: "Custom Panel Feature"
  },
  {
    id: "card1Content",
    name: "card1Content",
    type: "string", 
    defaultValue: "Customize the editor interface to match your workflow"
  },
  {
    id: "card2Title",
    name: "card2Title",
    type: "string",
    defaultValue: "Advanced Configuration"
  },
  {
    id: "card2Content",
    name: "card2Content",
    type: "string",
    defaultValue: "Override default panels with your own components"
  }
];

type PanelConfigMode = 'default' | 'custom-tabs' | 'custom-content' | 'minimal' | 'simple-nav';

// Custom appearance panel component
const CustomAppearancePanel = () => (
  <div className="p-4 space-y-4">
    <div className="text-sm font-medium">🎨 Custom Design Panel</div>
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">Brand Colors</div>
      <div className="grid grid-cols-4 gap-2">
        {['#3b82f6', '#ef4444', '#10b981', '#f59e0b'].map((color) => (
          <div 
            key={color}
            className="h-8 rounded border cursor-pointer hover:scale-105 transition-transform"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">Typography Scale</div>
      <div className="space-y-1">
        <div className="text-sm border-l-2 border-blue-500 pl-2">Headings</div>
        <div className="text-xs border-l-2 border-green-500 pl-2">Body Text</div>
        <div className="text-xs border-l-2 border-orange-500 pl-2">Captions</div>
      </div>
    </div>
  </div>
);

// Custom data panel component  
const CustomDataPanel = () => (
  <div className="p-4 space-y-4">
    <div className="text-sm font-medium flex items-center gap-2">
      <Database className="h-4 w-4" />
      Data Sources
    </div>
    <div className="space-y-2">
      <div className="p-2 border rounded text-xs">
        <div className="font-medium">User Database</div>
        <div className="text-muted-foreground">Connected • 1,247 users</div>
      </div>
      <div className="p-2 border rounded text-xs">
        <div className="font-medium">Content API</div>
        <div className="text-muted-foreground">Connected • 89 articles</div>
      </div>
      <div className="p-2 border rounded text-xs">
        <div className="font-medium">Analytics</div>
        <div className="text-muted-foreground">Connected • Live data</div>
      </div>
    </div>
    <Button size="sm" className="w-full">
      Add Data Source
    </Button>
  </div>
);

// Custom settings panel component
const CustomSettingsPanel = () => (
  <div className="p-4 space-y-4">
    <div className="text-sm font-medium flex items-center gap-2">
      <Settings className="h-4 w-4" />
      Project Settings
    </div>
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">Environment</div>
        <Badge variant="secondary">Development</Badge>
      </div>
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">Framework</div>
        <div className="text-sm">Next.js 14</div>
      </div>
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">Deploy Target</div>
        <div className="text-sm">Vercel</div>
      </div>
    </div>
  </div>
);

export const PanelConfigDemo = () => {
  const [mode, setMode] = useState<PanelConfigMode>('default');

  const modeConfigs = {
    'default': {
      title: 'Default Config',
      description: 'Standard panels with default content',
      panelConfig: undefined,
    },
    'custom-tabs': {
      title: 'Custom Tab Names',
      description: 'Same content with custom tab labels',
      panelConfig: {
        navBar: undefined,
        pageConfigPanelTabsContent: {
          layers: { title: "Structure", content: defaultConfigTabsContent().layers.content },
          appearance: { title: "Design", content: defaultConfigTabsContent().appearance?.content },
          data: { title: "Variables", content: defaultConfigTabsContent().data?.content }
        } as TabsContentConfig
      },
    },
    'custom-content': {
      title: 'Custom Panel Content',
      description: 'Custom components in each panel tab',
      panelConfig: {
        navBar: undefined,
        pageConfigPanelTabsContent: {
          layers: { title: "Layers", content: defaultConfigTabsContent().layers.content },
          appearance: { title: "Theme", content: <CustomAppearancePanel /> },
          data: { title: "Data", content: <CustomDataPanel /> },
          settings: { title: "Settings", content: <CustomSettingsPanel /> }
        } as TabsContentConfig
      },
    },
    'minimal': {
      title: 'Minimal',
      description: 'Only essential panels shown',
      panelConfig: {
        navBar: undefined,
        pageConfigPanelTabsContent: {
          layers: { title: "Structure", content: defaultConfigTabsContent().layers.content }
        } as TabsContentConfig
      },
    },
    'simple-nav': {
      title: 'Custom Nav',
      description: 'A super simple custom navigation bar',
      panelConfig: {
        navBar: <SimpleNav />,
        pageConfigPanelTabsContent: {
          layers: { title: "Layers", content: defaultConfigTabsContent().layers.content },
          appearance: { title: "Appearance", content: defaultConfigTabsContent().appearance?.content },
          data: { title: "Data", content: defaultConfigTabsContent().data?.content }
        } as TabsContentConfig
      },
    }
  };

  const currentConfig = modeConfigs[mode];

  return (
    <div className="h-dvh flex flex-col">
      {/* Mode Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Layout className="h-5 w-5" />
                {currentConfig.title}
              </h1>
              <p className="text-sm text-gray-600">{currentConfig.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(modeConfigs) as PanelConfigMode[]).map((modeKey) => (
                <Button
                  key={modeKey}
                  variant={mode === modeKey ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode(modeKey)}
                >
                  {modeConfigs[modeKey].title}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* UI Builder */}
      <div className="flex-1 overflow-hidden">
        <UIBuilder
          key={mode} // Force remount when mode changes
          initialLayers={sampleTemplate}
          initialVariables={sampleVariables}
          componentRegistry={{
            ...complexComponentDefinitions,
            ...primitiveComponentDefinitions,
            ...shadcnComponentDefinitions,
          }}
          blocks={blockDefinitions}
          panelConfig={currentConfig.panelConfig as typeof currentConfig.panelConfig & { navBar?: undefined }}
          persistLayerStore={false}
          onChange={(updatedPages) => {
            console.log(`[${mode}] Pages updated:`, updatedPages);
          }}
          onVariablesChange={(updatedVariables) => {
            console.log(`[${mode}] Variables updated:`, updatedVariables);
          }}
        />
      </div>
    </div>
  );
}; 