"use client"

import React, { useState } from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { ComponentLayer, Variable } from '@/components/ui/ui-builder/types';
import { Button } from "@/components/ui/button";

// Sample template for read-only demonstrations
const sampleTemplate: ComponentLayer[] = [{
  "id": "read-only-demo-page",
  "type": "div",
  "name": "Read-Only Demo Page",
  "props": {
    "className": "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8",
  },
  "children": [
    {
      "id": "header-section",
      "type": "div",
      "name": "Header",
      "props": {
        "className": "max-w-4xl mx-auto text-center mb-12"
      },
      "children": [
        {
          "id": "main-title",
          "type": "span",
          "name": "Main Title",
          "props": {
            "className": "text-4xl font-bold text-gray-900 block mb-4",
            "children": { __variableRef: "pageTitle" }
          },
          "children": []
        },
        {
          "id": "subtitle",
          "type": "span",
          "name": "Subtitle",
          "props": {
            "className": "text-lg text-gray-600 block",
            "children": { __variableRef: "pageSubtitle" }
          },
          "children": []
        }
      ]
    },
    {
      "id": "content-section",
      "type": "div",
      "name": "Content Section",
      "props": {
        "className": "max-w-4xl mx-auto grid md:grid-cols-2 gap-8"
      },
      "children": [
        {
          "id": "info-card",
          "type": "Card",
          "name": "Info Card",
          "props": {
            "className": "p-6"
          },
          "children": [
            {
              "id": "info-title",
              "type": "CardHeader",
              "name": "Card Header",
              "props": {},
              "children": [
                {
                  "id": "info-card-title",
                  "type": "CardTitle",
                  "name": "Card Title",
                  "props": {},
                  "children": [
                    {
                      "type": "span",
                      "id": "info-title-text",
                      "name": "Title Text",
                      "props": {
                        "children": { __variableRef: "cardTitle" }
                      },
                      "children": []
                    }
                  ]
                }
              ]
            },
            {
              "id": "info-content",
              "type": "CardContent",
              "name": "Card Content",
              "props": {},
              "children": [
                {
                  "type": "span",
                  "id": "info-content-text",
                  "name": "Content Text",
                  "props": {
                    "children": { __variableRef: "cardContent" }
                  },
                  "children": []
                }
              ]
            }
          ]
        },
        {
          "id": "action-card",
          "type": "Card",
          "name": "Action Card",
          "props": {
            "className": "p-6"
          },
          "children": [
            {
              "id": "action-header",
              "type": "CardHeader",
              "name": "Action Header",
              "props": {},
              "children": [
                {
                  "id": "action-card-title",
                  "type": "CardTitle",
                  "name": "Action Title",
                  "props": {},
                  "children": [
                    {
                      "type": "span",
                      "children": "Take Action",
                      "id": "action-title-text",
                      "name": "Action Title Text",
                      "props": {}
                    }
                  ]
                }
              ]
            },
            {
              "id": "action-content",
              "type": "CardContent",
              "name": "Action Content",
              "props": {
                "className": "space-y-4"
              },
              "children": [
                {
                  "id": "primary-button",
                  "type": "Button",
                  "name": "Primary Button",
                  "props": {
                    "variant": "default",
                    "className": "w-full"
                  },
                  "children": [
                    {
                      "type": "span",
                      "id": "primary-btn-text",
                      "name": "Primary Button Text",
                      "props": {
                        "children": { __variableRef: "primaryButtonText" }
                      },
                      "children": []
                    }
                  ]
                },
                {
                  "id": "secondary-button",
                  "type": "Button",
                  "name": "Secondary Button",
                  "props": {
                    "variant": "outline",
                    "className": "w-full"
                  },
                  "children": [
                    {
                      "type": "span",
                      "id": "secondary-btn-text",
                      "name": "Secondary Button Text",
                      "props": {
                        "children": { __variableRef: "secondaryButtonText" }
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
    }
  ]
}];

// Sample variables bound to the template
const sampleVariables: Variable[] = [
  {
    id: "pageTitle",
    name: "Page Title",
    type: "string",
    defaultValue: "Read-Only Mode Demo"
  },
  {
    id: "pageSubtitle",
    name: "Page Subtitle",
    type: "string",
    defaultValue: "Demonstrating different levels of editing restrictions"
  },
  {
    id: "cardTitle",
    name: "Card Title",
    type: "string",
    defaultValue: "System Information"
  },
  {
    id: "cardContent",
    name: "Card Content",
    type: "string",
    defaultValue: "This content is bound to variables that may be restricted based on your permissions."
  },
  {
    id: "primaryButtonText",
    name: "Primary Button Text",
    type: "string",
    defaultValue: "Get Started"
  },
  {
    id: "secondaryButtonText",
    name: "Secondary Button Text",
    type: "string",
    defaultValue: "Learn More"
  }
];

type ReadOnlyMode = 'full-edit' | 'content-only' | 'no-variables' | 'full-readonly';

export const ReadOnlyDemo = () => {
  const [mode, setMode] = useState<ReadOnlyMode>('full-edit');

  const modeConfigs = {
    'full-edit': {
      title: 'Full Editing Mode',
      description: 'All editing capabilities enabled',
      allowVariableEditing: true,
      allowPagesCreation: true,
      allowPagesDeletion: true,
    },
    'content-only': {
      title: 'Content-Only Mode',
      description: 'Variables editable, but page structure locked',
      allowVariableEditing: true,
      allowPagesCreation: false,
      allowPagesDeletion: false,
    },
    'no-variables': {
      title: 'No Variable Editing',
      description: 'Page structure editable, but variables locked',
      allowVariableEditing: false,
      allowPagesCreation: true,
      allowPagesDeletion: true,
    },
    'full-readonly': {
      title: 'Full Read-Only Mode',
      description: 'All structural changes disabled',
      allowVariableEditing: false,
      allowPagesCreation: false,
      allowPagesDeletion: false,
    }
  };

  const currentConfig = modeConfigs[mode];

  return (
    <div className="h-dvh flex flex-col">
      {/* Mode Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{currentConfig.title}</h1>
              <p className="text-sm text-gray-600">{currentConfig.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(modeConfigs) as ReadOnlyMode[]).map((modeKey) => (
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
          }}
          allowVariableEditing={currentConfig.allowVariableEditing}
          allowPagesCreation={currentConfig.allowPagesCreation}
          allowPagesDeletion={currentConfig.allowPagesDeletion}
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