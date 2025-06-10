"use client"

import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { demoComponentRegistry } from "./demo-components";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { ComponentLayer, Variable } from '@/components/ui/ui-builder/types';
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";

// Initial page structure showcasing immutable bindings
const initialLayers: ComponentLayer[] = [{
  "id": "demo-page",
  "type": "div",
  "name": "Immutable Bindings Demo",
  "props": {
    "className": "min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8",
  },
  "children": [
    {
      "id": "header",
      "type": "div",
      "name": "Header Section",
      "props": {
        "className": "max-w-4xl mx-auto mb-12"
      },
      "children": [
        {
          "id": "title",
          "type": "span",
          "name": "Main Title",
          "props": {
            "className": "text-4xl font-bold text-gray-900 block mb-4"
          },
          "children": "🔒 Immutable Variable Bindings Demo"
        },
        {
          "id": "subtitle",
          "type": "span", 
          "name": "Subtitle",
          "props": {
            "className": "text-lg text-gray-600 block mb-8"
          },
          "children": "Explore how immutable bindings protect critical data while allowing content customization"
        }
      ]
    },
    {
      "id": "demo-grid",
      "type": "div",
      "name": "Demo Grid",
      "props": {
        "className": "max-w-4xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-1"
      },
      "children": [
        {
          "id": "user-profile-section",
          "type": "div",
          "name": "User Profile Section", 
          "props": {
            "className": "space-y-4"
          },
          "children": [
            {
              "id": "user-section-title",
              "type": "span",
              "name": "User Section Title",
              "props": {
                "className": "text-2xl font-semibold text-gray-800 block"
              },
              "children": "👤 User Profile Component"
            },
            {
              "id": "user-description",
              "type": "span",
              "name": "User Description",
              "props": {
                "className": "text-gray-600 block mb-4"
              },
              "children": "This component has immutable user data (ID, email, role) but allows customizing the display name."
            },
            {
              "id": "user-profile-demo",
              "type": "UserProfile",
              "name": "User Profile Demo",
              "props": {
                "userId": { "__variableRef": "current_user_id" },
                "displayName": { "__variableRef": "current_user_name" },
                "email": { "__variableRef": "current_user_email" },
                "role": { "__variableRef": "current_user_role" }
              },
              "children": []
            }
          ]
        },
        {
          "id": "branded-button-section",
          "type": "div",
          "name": "Branded Button Section",
          "props": {
            "className": "space-y-4"
          },
          "children": [
            {
              "id": "button-section-title",
              "type": "span",
              "name": "Button Section Title", 
              "props": {
                "className": "text-2xl font-semibold text-gray-800 block"
              },
              "children": "🎨 Branded Button Component"
            },
            {
              "id": "button-description",
              "type": "span",
              "name": "Button Description",
              "props": {
                "className": "text-gray-600 block mb-4"
              },
              "children": "Brand color and company name are immutable, but button text can be customized by content creators."
            },
            {
              "id": "button-container",
              "type": "div",
              "name": "Button Container",
              "props": {
                "className": "flex flex-wrap gap-4"
              },
              "children": [
                {
                  "id": "primary-button-demo",
                  "type": "BrandedButton", 
                  "name": "Primary Button",
                  "props": {
                    "text": { "__variableRef": "button_text" },
                    "brandColor": { "__variableRef": "company_brand_color" },
                    "companyName": { "__variableRef": "company_name" },
                    "variant": "primary",
                    "size": "md"
                  },
                  "children": []
                },
                {
                  "id": "secondary-button-demo",
                  "type": "BrandedButton",
                  "name": "Secondary Button", 
                  "props": {
                    "text": "Learn More",
                    "brandColor": { "__variableRef": "company_brand_color" },
                    "companyName": { "__variableRef": "company_name" },
                    "variant": "secondary",
                    "size": "md"
                  },
                  "children": []
                }
              ]
            }
          ]
        },
        {
          "id": "system-alert-section",
          "type": "div",
          "name": "System Alert Section",
          "props": {
            "className": "space-y-4"
          },
          "children": [
            {
              "id": "alert-section-title",
              "type": "span",
              "name": "Alert Section Title",
              "props": {
                "className": "text-2xl font-semibold text-gray-800 block"
              },
              "children": "⚠️ System Alert Component"
            },
            {
              "id": "alert-description", 
              "type": "span",
              "name": "Alert Description",
              "props": {
                "className": "text-gray-600 block mb-4"
              },
              "children": "System version and maintenance mode are immutable system settings, but alert messages can be customized."
            },
            {
              "id": "system-alert-demo",
              "type": "SystemAlert",
              "name": "System Alert Demo",
              "props": {
                "message": { "__variableRef": "alert_message" },
                "type": "info",
                "systemVersion": { "__variableRef": "system_version" },
                "maintenanceMode": { "__variableRef": "maintenance_mode" }
              },
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "instructions",
      "type": "div",
      "name": "Instructions",
      "props": {
        "className": "max-w-4xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg border-l-4 border-blue-500"
      },
      "children": [
        {
          "id": "instructions-title",
          "type": "span",
          "name": "Instructions Title",
          "props": {
            "className": "text-xl font-bold text-gray-900 block mb-4"
          },
          "children": "🔍 How to Explore This Demo:"
        },
        {
          "id": "instructions-list",
          "type": "div",
          "name": "Instructions List",
          "props": {
            "className": "space-y-2 text-gray-700"
          },
          "children": [
            {
              "id": "instruction-1",
              "type": "span",
              "name": "Instruction 1", 
              "props": {
                "className": "block"
              },
              "children": "1. Select any of the demo components above"
            },
            {
              "id": "instruction-2",
              "type": "span",
              "name": "Instruction 2",
              "props": {
                "className": "block"
              },
              "children": "2. Open the Props Panel on the right"
            },
            {
              "id": "instruction-3",
              "type": "span",
              "name": "Instruction 3",
              "props": {
                "className": "block"
              },
              "children": "3. Notice the 🔗 variable binding indicators and 🔒 'Immutable' badges"
            },
            {
              "id": "instruction-4", 
              "type": "span",
              "name": "Instruction 4",
              "props": {
                "className": "block"
              },
              "children": "4. Try to unbind immutable variables (you can't!) vs mutable ones (you can)"
            },
            {
              "id": "instruction-5",
              "type": "span",
              "name": "Instruction 5", 
              "props": {
                "className": "block"
              },
              "children": "5. Check the Variables Panel to see the underlying variable system"
            }
          ]
        }
      ]
    }
  ]
}];

// Variables that will be automatically bound to components
const initialVariables: Variable[] = [
  // User-related variables
  {
    id: "current_user_id",
    name: "Current User ID",
    type: "string",
    defaultValue: "usr_789xyz"
  },
  {
    id: "current_user_name", 
    name: "Current User Name",
    type: "string",
    defaultValue: "Alex Rivera"
  },
  {
    id: "current_user_email",
    name: "Current User Email",
    type: "string", 
    defaultValue: "alex.rivera@company.com"
  },
  {
    id: "current_user_role",
    name: "Current User Role",
    type: "string",
    defaultValue: "Senior Developer"
  },

  // Brand-related variables
  {
    id: "company_brand_color",
    name: "Company Brand Color",
    type: "string",
    defaultValue: "#6366f1"
  },
  {
    id: "company_name",
    name: "Company Name", 
    type: "string",
    defaultValue: "TechCorp Inc."
  },
  {
    id: "button_text",
    name: "Button Text",
    type: "string",
    defaultValue: "Get Started"
  },

  // System-related variables
  {
    id: "system_version",
    name: "System Version",
    type: "string",
    defaultValue: "2.1.4"
  },
  {
    id: "maintenance_mode",
    name: "Maintenance Mode",
    type: "boolean", 
    defaultValue: false
  },
  {
    id: "alert_message",
    name: "Alert Message",
    type: "string",
    defaultValue: "Welcome to the new immutable bindings feature! This message can be customized."
  }
];

export const BuilderWithImmutableBindings = () => {
  const handleChange = (updatedPages: ComponentLayer[]) => {
    console.log("🔄 Builder state changed:", updatedPages);
  };

  return (
    <UIBuilder 
      initialLayers={initialLayers}
      initialVariables={initialVariables}
      componentRegistry={{
        ...demoComponentRegistry,
        ...complexComponentDefinitions,
        ...primitiveComponentDefinitions,
      }}
      onChange={handleChange}
      allowPagesCreation={true}
      allowPagesDeletion={true}
      allowVariableEditing={false}
    />
  );
}; 