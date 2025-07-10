"use client"

import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { demoComponentRegistry } from "./demo-components";
import { advancedDemoComponentRegistry } from "./advanced-demo-components";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { ComponentLayer, ComponentRegistry } from '@/components/ui/ui-builder/types';
import { z } from 'zod';
import { commonFieldOverrides, childrenAsTextareaFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";

// Extended primitive components for HTML elements not included in the main registry
const extendedPrimitiveDefinitions: ComponentRegistry = {
  'h1': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer)
    },
    defaultChildren: "Heading 1"
  },
  'h2': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer)
    },
    defaultChildren: "Heading 2"
  },
  'h3': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer)
    },
    defaultChildren: "Heading 3"
  },
  'p': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer)
    },
    defaultChildren: "Paragraph text"
  },
  'li': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: {
      ...commonFieldOverrides(),
      children: (layer) => childrenAsTextareaFieldOverrides(layer)
    },
    defaultChildren: "List item"
  },
  'ul': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: commonFieldOverrides()
  },
  'ol': {
    schema: z.object({
      className: z.string().optional(),
      children: z.string().optional(),
    }),
    fieldOverrides: commonFieldOverrides()
  }
};

// Comprehensive initial layers showcasing various drag and drop scenarios
const initialLayers: ComponentLayer[] = [{
  "id": "drag-drop-test-page",
  "type": "div",
  "name": "Drag & Drop Test Page",
  "props": {
    "className": "min-h-screen bg-gray-50 p-4",
  },
  "children": [
    {
      "id": "header",
      "type": "div",
      "name": "Header",
      "props": {
        "className": "mb-8 text-center"
      },
      "children": [
        {
          "id": "main-title",
          "type": "h1",
          "name": "Main Title",
          "props": {
            "className": "text-4xl font-bold text-gray-900 mb-2"
          },
          "children": "🚀 Drag & Drop Testing Arena"
        },
        {
          "id": "subtitle",
          "type": "p",
          "name": "Subtitle",
          "props": {
            "className": "text-lg text-gray-600"
          },
          "children": "Test various layout combinations and drag/drop behaviors"
        }
      ]
    },

    // Flex Layout Testing Section
    {
      "id": "flex-section",
      "type": "div",
      "name": "Flex Layout Section",
      "props": {
        "className": "mb-12"
      },
      "children": [
        {
          "id": "flex-title",
          "type": "h2",
          "name": "Flex Title",
          "props": {
            "className": "text-2xl font-semibold mb-4 text-gray-800"
          },
          "children": "🔄 Flex Layouts"
        },
        {
          "id": "flex-containers-grid",
          "type": "GridContainer",
          "name": "Flex Containers Grid",
          "props": {
            "columns": 2,
            "gap": "lg",
            "className": "mb-8"
          },
          "children": [
            {
              "id": "flex-row-card",
              "type": "Card",
              "name": "Flex Row Card",
              "props": {
                "title": "Flex Row Layout",
                "variant": "bordered"
              },
              "children": [
                {
                  "id": "flex-row-container",
                  "type": "FlexContainer",
                  "name": "Flex Row Container",
                  "props": {
                    "direction": "row",
                    "justify": "start",
                    "align": "center", 
                    "gap": "md",
                    "className": "p-4 bg-blue-50 rounded min-h-[120px]"
                  },
                  "children": [
                    {
                      "id": "flex-item-1",
                      "type": "div",
                      "name": "Flex Item 1",
                      "props": {
                        "className": "bg-blue-200 px-4 py-2 rounded"
                      },
                      "children": "Item 1"
                    },
                    {
                      "id": "flex-item-2",
                      "type": "div",
                      "name": "Flex Item 2", 
                      "props": {
                        "className": "bg-blue-300 px-4 py-2 rounded"
                      },
                      "children": "Item 2"
                    }
                  ]
                }
              ]
            },
            {
              "id": "flex-col-card",
              "type": "Card",
              "name": "Flex Column Card",
              "props": {
                "title": "Flex Column Layout",
                "variant": "bordered"
              },
              "children": [
                {
                  "id": "flex-col-container",
                  "type": "FlexContainer",
                  "name": "Flex Column Container",
                  "props": {
                    "direction": "col",
                    "justify": "start",
                    "align": "stretch",
                    "gap": "sm",
                    "className": "p-4 bg-green-50 rounded min-h-[120px]"
                  },
                  "children": [
                    {
                      "id": "flex-col-item-1",
                      "type": "div",
                      "name": "Column Item 1",
                      "props": {
                        "className": "bg-green-200 px-4 py-2 rounded"
                      },
                      "children": "Column 1"
                    },
                    {
                      "id": "flex-col-item-2",
                      "type": "div",
                      "name": "Column Item 2",
                      "props": {
                        "className": "bg-green-300 px-4 py-2 rounded"
                      },
                      "children": "Column 2"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },

    // Grid Layout Testing Section
    {
      "id": "grid-section",
      "type": "div",
      "name": "Grid Layout Section",
      "props": {
        "className": "mb-12"
      },
      "children": [
        {
          "id": "grid-title",
          "type": "h2",
          "name": "Grid Title",
          "props": {
            "className": "text-2xl font-semibold mb-4 text-gray-800"
          },
          "children": "🎯 Grid Layouts"
        },
        {
          "id": "grid-demo-card",
          "type": "Card",
          "name": "Grid Demo Card",
          "props": {
            "title": "Grid Container with Various Items",
            "variant": "elevated"
          },
          "children": [
            {
              "id": "main-grid",
              "type": "GridContainer",
              "name": "Main Grid",
              "props": {
                "columns": 3,
                "gap": "md",
                "className": "p-4 bg-purple-50 rounded min-h-[200px]"
              },
              "children": [
                {
                  "id": "grid-item-1",
                  "type": "div",
                  "name": "Grid Item 1",
                  "props": {
                    "className": "bg-purple-200 p-4 rounded text-center"
                  },
                  "children": "Grid 1"
                },
                {
                  "id": "grid-item-2", 
                  "type": "div",
                  "name": "Grid Item 2",
                  "props": {
                    "className": "bg-purple-300 p-4 rounded text-center"
                  },
                  "children": "Grid 2"
                },
                {
                  "id": "grid-item-3",
                  "type": "div",
                  "name": "Grid Item 3",
                  "props": {
                    "className": "bg-purple-400 p-4 rounded text-center"
                  },
                  "children": "Grid 3"
                }
              ]
            }
          ]
        }
      ]
    },

    // Block Layout Testing Section
    {
      "id": "block-section",
      "type": "div",
      "name": "Block Layout Section",
      "props": {
        "className": "mb-12"
      },
      "children": [
        {
          "id": "block-title",
          "type": "h2",
          "name": "Block Title",
          "props": {
            "className": "text-2xl font-semibold mb-4 text-gray-800"
          },
          "children": "📄 Block Layouts"
        },
        {
          "id": "block-demo-card",
          "type": "Card",
          "name": "Block Demo Card",
          "props": {
            "title": "Block Elements with Vertical Stacking",
            "variant": "default"
          },
          "children": [
            {
              "id": "block-container",
              "type": "div",
              "name": "Block Container",
              "props": {
                "className": "p-4 bg-orange-50 rounded min-h-[200px]"
              },
              "children": [
                {
                  "id": "block-item-1",
                  "type": "div",
                  "name": "Block Item 1",
                  "props": {
                    "className": "bg-orange-200 p-4 rounded mb-4"
                  },
                  "children": "Block Element 1"
                },
                {
                  "id": "block-item-2",
                  "type": "div",
                  "name": "Block Item 2",
                  "props": {
                    "className": "bg-orange-300 p-4 rounded mb-4"
                  },
                  "children": "Block Element 2"
                },
                {
                  "id": "block-item-3",
                  "type": "div",
                  "name": "Block Item 3",
                  "props": {
                    "className": "bg-orange-400 p-4 rounded"
                  },
                  "children": "Block Element 3"
                }
              ]
            }
          ]
        }
      ]
    },

    // Inline Layout Testing Section
    {
      "id": "inline-section",
      "type": "div",
      "name": "Inline Layout Section", 
      "props": {
        "className": "mb-12"
      },
      "children": [
        {
          "id": "inline-title",
          "type": "h2",
          "name": "Inline Title",
          "props": {
            "className": "text-2xl font-semibold mb-4 text-gray-800"
          },
          "children": "↔️ Inline Layouts"
        },
        {
          "id": "inline-demo-card",
          "type": "Card",
          "name": "Inline Demo Card",
          "props": {
            "title": "Inline Elements within Text Flow",
            "variant": "outlined"
          },
          "children": [
            {
              "id": "inline-paragraph",
              "type": "p",
              "name": "Inline Paragraph",
              "props": {
                "className": "p-4 bg-teal-50 rounded leading-relaxed text-lg"
              },
              "children": "This is text with inline element and another inline element mixed with regular text content."
            }
          ]
        }
      ]
    },

    // Complex Nested Layout Section
    {
      "id": "nested-section",
      "type": "div",
      "name": "Nested Layout Section",
      "props": {
        "className": "mb-12"
      },
      "children": [
        {
          "id": "nested-title",
          "type": "h2",
          "name": "Nested Title",
          "props": {
            "className": "text-2xl font-semibold mb-4 text-gray-800"
          },
          "children": "🏗️ Complex Nested Layouts"
        },
        {
          "id": "nested-layout-card",
          "type": "Card",
          "name": "Nested Layout Card",
          "props": {
            "title": "Multi-level Container Nesting",
            "variant": "elevated"
          },
          "children": [
            {
              "id": "main-flex-wrapper",
              "type": "FlexContainer",
              "name": "Main Flex Wrapper",
              "props": {
                "direction": "row",
                "gap": "lg",
                "className": "p-4 bg-indigo-50 rounded"
              },
              "children": [
                {
                  "id": "left-panel",
                  "type": "Panel",
                  "name": "Left Panel",
                  "props": {
                    "position": "left",
                    "width": "sm",
                    "className": "bg-indigo-100"
                  },
                  "children": [
                    {
                      "id": "panel-nav",
                      "type": "Navigation",
                      "name": "Panel Navigation",
                      "props": {
                        "orientation": "vertical",
                        "variant": "pills"
                      },
                      "children": [
                        {
                          "id": "nav-item-1",
                          "type": "div",
                          "name": "Nav Item 1",
                          "props": {
                            "className": "px-3 py-2 rounded bg-indigo-200"
                          },
                          "children": "Nav 1"
                        },
                        {
                          "id": "nav-item-2",
                          "type": "div", 
                          "name": "Nav Item 2",
                          "props": {
                            "className": "px-3 py-2 rounded bg-indigo-300"
                          },
                          "children": "Nav 2"
                        }
                      ]
                    }
                  ]
                },
                {
                  "id": "content-area",
                  "type": "div",
                  "name": "Content Area",
                  "props": {
                    "className": "flex-1 p-4 bg-white rounded shadow-sm"
                  },
                  "children": [
                    {
                      "id": "content-grid",
                      "type": "GridContainer",
                      "name": "Content Grid",
                      "props": {
                        "columns": 2,
                        "gap": "md"
                      },
                      "children": [
                        {
                          "id": "content-card-1",
                          "type": "Card",
                          "name": "Content Card 1",
                          "props": {
                            "title": "Nested Card 1",
                            "variant": "bordered"
                          },
                          "children": [
                            {
                              "id": "card-1-list",
                              "type": "List",
                              "name": "Card 1 List",
                              "props": {
                                "variant": "default",
                                "spacing": "normal"
                              },
                              "children": [
                                {
                                  "id": "list-item-1",
                                  "type": "li",
                                  "name": "List Item 1",
                                  "props": {},
                                  "children": "List Item 1"
                                },
                                {
                                  "id": "list-item-2",
                                  "type": "li",
                                  "name": "List Item 2",
                                  "props": {},
                                  "children": "List Item 2"
                                }
                              ]
                            }
                          ]
                        },
                        {
                          "id": "content-card-2",
                          "type": "Card",
                          "name": "Content Card 2",
                          "props": {
                            "title": "Nested Card 2",
                            "variant": "bordered"
                          },
                          "children": [
                            {
                              "id": "card-2-form",
                              "type": "FormGroup",
                              "name": "Card 2 Form",
                              "props": {
                                "label": "Sample Form Field",
                                "layout": "vertical"
                              },
                              "children": [
                                {
                                  "id": "form-input",
                                  "type": "input",
                                  "name": "Form Input",
                                  "props": {
                                    "className": "w-full px-3 py-2 border rounded",
                                    "placeholder": "Enter text..."
                                  },
                                  "children": ""
                                },
                                {
                                  "id": "form-button",
                                  "type": "button",
                                  "name": "Form Button",
                                  "props": {
                                    "className": "mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                  },
                                  "children": "Submit"
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
            }
          ]
        }
      ]
    },

    // Component Library Showcase
    {
      "id": "component-showcase",
      "type": "div",
      "name": "Component Showcase",
      "props": {
        "className": "mb-12"
      },
      "children": [
        {
          "id": "showcase-title",
          "type": "h2",
          "name": "Showcase Title",
          "props": {
            "className": "text-2xl font-semibold mb-4 text-gray-800"
          },
          "children": "🎨 Component Library"
        },
        {
          "id": "components-grid",
          "type": "GridContainer",
          "name": "Components Grid",
          "props": {
            "columns": 4,
            "gap": "md"
          },
          "children": [
            {
              "id": "demo-user-profile",
              "type": "UserProfile",
              "name": "Demo User Profile",
              "props": {
                "userId": "user123",
                "displayName": "John Doe",
                "email": "john@example.com",
                "role": "Developer"
              },
              "children": []
            },
            {
              "id": "demo-branded-button",
              "type": "BrandedButton",
              "name": "Demo Branded Button",
              "props": {
                "text": "Click Me",
                "brandColor": "#3b82f6",
                "companyName": "DemoApp",
                "variant": "primary",
                "size": "md"
              },
              "children": []
            },
            {
              "id": "demo-system-alert",
              "type": "SystemAlert",
              "name": "Demo System Alert",
              "props": {
                "message": "System is running normally",
                "type": "success",
                "systemVersion": "1.0.0",
                "maintenanceMode": false
              },
              "children": []
            },
            {
              "id": "demo-empty-slot",
              "type": "div",
              "name": "Empty Slot",
              "props": {
                "className": "h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500"
              },
              "children": "Drop components here"
            }
          ]
        }
      ]
    },

    // Testing Instructions
    {
      "id": "instructions-section",
      "type": "div",
      "name": "Instructions Section",
      "props": {
        "className": "mb-8"
      },
      "children": [
        {
          "id": "instructions-card",
          "type": "Card",
          "name": "Instructions Card",
          "props": {
            "title": "🧪 Testing Instructions",
            "variant": "elevated",
            "className": "bg-gradient-to-r from-blue-50 to-purple-50"
          },
          "children": [
            {
              "id": "instructions-content",
              "type": "div",
              "name": "Instructions Content",
              "props": {
                "className": "space-y-4"
              },
              "children": [
                {
                  "id": "test-scenarios-title",
                  "type": "h3",
                  "name": "Test Scenarios Title",
                  "props": {
                    "className": "font-semibold text-lg text-gray-900"
                  },
                  "children": "Test Scenarios:"
                },
                {
                  "id": "test-list",
                  "type": "List",
                  "name": "Test List",
                  "props": {
                    "variant": "ordered",
                    "spacing": "normal"
                  },
                  "children": [
                    {
                      "id": "test-1",
                      "type": "li",
                      "name": "Test 1",
                      "props": {},
                      "children": "Drag between flex-row containers (horizontal placeholders)"
                    },
                    {
                      "id": "test-2",
                      "type": "li", 
                      "name": "Test 2",
                      "props": {},
                      "children": "Drag between flex-column containers (vertical placeholders)"
                    },
                    {
                      "id": "test-3",
                      "type": "li",
                      "name": "Test 3",
                      "props": {},
                      "children": "Drag into grid containers (grid-specific placeholders)"
                    },
                    {
                      "id": "test-4",
                      "type": "li",
                      "name": "Test 4", 
                      "props": {},
                      "children": "Drag into block containers (block stacking placeholders)"
                    },
                    {
                      "id": "test-5",
                      "type": "li",
                      "name": "Test 5",
                      "props": {},
                      "children": "Drag inline elements within text (inline placeholders)"
                    },
                    {
                      "id": "test-6",
                      "type": "li",
                      "name": "Test 6",
                      "props": {},
                      "children": "Cross-layout dragging (flex → grid → block)"
                    },
                    {
                      "id": "test-7",
                      "type": "li",
                      "name": "Test 7",
                      "props": {},
                      "children": "Nested container interactions"
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

export const BuilderDragDropTest = () => {
  const handleChange = (updatedPages: ComponentLayer[]) => {
    console.log("🔄 Drag & Drop Test - Builder state changed:", updatedPages);
  };

  return (
    <UIBuilder 
      initialLayers={initialLayers}
      componentRegistry={{
        ...demoComponentRegistry,
        ...advancedDemoComponentRegistry,
        ...complexComponentDefinitions,
        ...primitiveComponentDefinitions,
        ...extendedPrimitiveDefinitions,
      }}
      onChange={handleChange}
      allowPagesCreation={true}
      allowPagesDeletion={true}
      allowVariableEditing={true}
    />
  );
}; 