"use client";

import LayerRenderer from "@/components/ui/ui-builder/layer-renderer";
import type { ComponentLayer } from "@/components/ui/ui-builder/types";
import type { ComponentRegistry } from "@/components/ui/ui-builder/types";
import type { Variable } from '@/components/ui/ui-builder/types';
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";

const myComponentRegistry: ComponentRegistry = {
  ...primitiveComponentDefinitions,
  ...complexComponentDefinitions
}; 

// Page structure with actual variable bindings
const page: ComponentLayer = {
    id: "variables-demo-page",
    type: "div",
    props: {
        className: "max-w-4xl mx-auto p-8 space-y-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen"
    },
    children: [
        // Header with variable binding
        {
            id: "header",
            type: "div",
            props: {
                className: "text-center space-y-4"
            },
            children: [
                {
                    id: "page-title",
                    type: "h1",
                    props: {
                        className: "text-4xl font-bold text-gray-900",
                        children: { __variableRef: "pageTitle" } // Bound to variable
                    },
                    children: []
                },
                {
                    id: "page-subtitle",
                    type: "p",
                    props: {
                        className: "text-xl text-gray-600",
                        children: { __variableRef: "pageSubtitle" } // Bound to variable
                    },
                    children: []
                }
            ]
        },
        // User info card with variable bindings
        {
            id: "user-card",
            type: "div",
            props: {
                className: "bg-white rounded-lg shadow-lg p-6 border border-gray-200"
            },
            children: [
                {
                    id: "user-card-title",
                    type: "h2",
                    props: {
                        className: "text-2xl font-semibold text-gray-800 mb-4",
                        children: "User Information"
                    },
                    children: []
                },
                {
                    id: "user-info",
                    type: "div",
                    props: {
                        className: "space-y-3"
                    },
                    children: [
                        {
                            id: "user-name-row",
                            type: "div",
                            props: {
                                className: "flex items-center gap-2"
                            },
                            children: [
                                {
                                    id: "name-label",
                                    type: "span",
                                    props: {
                                        className: "font-medium text-gray-700 w-20",
                                        children: "Name:"
                                    },
                                    children: []
                                },
                                {
                                    id: "user-name",
                                    type: "span",
                                    props: {
                                        className: "text-gray-900",
                                        children: { __variableRef: "userName" } // Bound to variable
                                    },
                                    children: []
                                }
                            ]
                        },
                        {
                            id: "user-age-row",
                            type: "div",
                            props: {
                                className: "flex items-center gap-2"
                            },
                            children: [
                                {
                                    id: "age-label",
                                    type: "span",
                                    props: {
                                        className: "font-medium text-gray-700 w-20",
                                        children: "Age:"
                                    },
                                    children: []
                                },
                                {
                                    id: "user-age",
                                    type: "span",
                                    props: {
                                        className: "text-gray-900",
                                        children: { __variableRef: "userAge" } // Bound to variable
                                    },
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        // Interactive buttons with variable bindings
        {
            id: "buttons-section",
            type: "div",
            props: {
                className: "bg-white rounded-lg shadow-lg p-6 border border-gray-200"
            },
            children: [
                {
                    id: "buttons-title",
                    type: "h2",
                    props: {
                        className: "text-2xl font-semibold text-gray-800 mb-4",
                        children: "Dynamic Buttons"
                    },
                    children: []
                },
                {
                    id: "buttons-container",
                    type: "div",
                    props: {
                        className: "flex flex-wrap gap-4"
                    },
                    children: [
                        {
                            id: "primary-button",
                            type: "Button",
                            props: {
                                variant: "default",
                                className: "flex-1 min-w-fit",
                                children: { __variableRef: "buttonText" }, // Bound to variable
                                disabled: { __variableRef: "isLoading" } // Bound to variable
                            },
                            children: []
                        },
                        {
                            id: "secondary-button",
                            type: "Button",
                            props: {
                                variant: "outline",
                                className: "flex-1 min-w-fit",
                                children: { __variableRef: "secondaryButtonText" } // Bound to variable
                            },
                            children: []
                        }
                    ]
                }
            ]
        },
        // Feature flags section
        {
            id: "features-section",
            type: "div",
            props: {
                className: "bg-white rounded-lg shadow-lg p-6 border border-gray-200"
            },
            children: [
                {
                    id: "features-title",
                    type: "h2",
                    props: {
                        className: "text-2xl font-semibold text-gray-800 mb-4",
                        children: "Feature Toggles"
                    },
                    children: []
                },
                {
                    id: "features-list",
                    type: "div",
                    props: {
                        className: "space-y-3"
                    },
                    children: [
                        {
                            id: "dark-mode-feature",
                            type: "div",
                            props: {
                                className: "flex items-center justify-between p-3 bg-gray-50 rounded"
                            },
                            children: [
                                {
                                    id: "dark-mode-label",
                                    type: "span",
                                    props: {
                                        className: "font-medium text-gray-700",
                                        children: "Dark Mode"
                                    },
                                    children: []
                                },
                                {
                                    id: "dark-mode-badge",
                                    type: "Badge",
                                    props: {
                                        variant: { __variableRef: "darkModeEnabled" }, // Bound to variable (will resolve to "default" or "secondary")
                                        children: { __variableRef: "darkModeStatus" } // Bound to variable
                                    },
                                    children: []
                                }
                            ]
                        },
                        {
                            id: "notifications-feature",
                            type: "div",
                            props: {
                                className: "flex items-center justify-between p-3 bg-gray-50 rounded"
                            },
                            children: [
                                {
                                    id: "notifications-label",
                                    type: "span",
                                    props: {
                                        className: "font-medium text-gray-700",
                                        children: "Notifications"
                                    },
                                    children: []
                                },
                                {
                                    id: "notifications-badge",
                                    type: "Badge",
                                    props: {
                                        variant: { __variableRef: "notificationsEnabled" }, // Bound to variable
                                        children: { __variableRef: "notificationsStatus" } // Bound to variable
                                    },
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}; 

// Define variables that match the bindings
const variables: Variable[] = [
  {
    id: "pageTitle",
    name: "Page Title",
    type: "string",
    defaultValue: "UI Builder Variables Demo"
  },
  {
    id: "pageSubtitle",
    name: "Page Subtitle",
    type: "string",
    defaultValue: "See how variables make your content dynamic"
  },
  {
    id: "userName",
    name: "User Name",
    type: "string",
    defaultValue: "John Doe"
  },
  {
    id: "userAge",
    name: "User Age",
    type: "number",
    defaultValue: 25
  },
  {
    id: "buttonText",
    name: "Primary Button Text",
    type: "string",
    defaultValue: "Click Me!"
  },
  {
    id: "secondaryButtonText",
    name: "Secondary Button Text",
    type: "string",
    defaultValue: "Learn More"
  },
  {
    id: "isLoading",
    name: "Loading State",
    type: "boolean",
    defaultValue: false
  },
  {
    id: "darkModeEnabled",
    name: "Dark Mode Enabled",
    type: "string",
    defaultValue: "secondary"
  },
  {
    id: "darkModeStatus",
    name: "Dark Mode Status",
    type: "string",
    defaultValue: "Disabled"
  },
  {
    id: "notificationsEnabled",
    name: "Notifications Enabled",
    type: "string",
    defaultValue: "default"
  },
  {
    id: "notificationsStatus",
    name: "Notifications Status",
    type: "string",
    defaultValue: "Enabled"
  }
];

// Override some variable values to show dynamic behavior
const variableValues = {
  pageTitle: "🚀 Dynamic Variables in Action",
  pageSubtitle: "Values injected at runtime - try changing them!",
  userName: "Jane Smith",
  userAge: 30,
  buttonText: "Get Started Now",
  secondaryButtonText: "View Documentation",
  isLoading: false,
  darkModeEnabled: "default",
  darkModeStatus: "Enabled",
  notificationsEnabled: "secondary", 
  notificationsStatus: "Disabled"
};

export function RendererWithVars() {
  return (
    <div className="w-full">
      <LayerRenderer 
        page={page} 
        componentRegistry={myComponentRegistry}
        variables={variables}
        variableValues={variableValues}
      />
    </div>
  );
}