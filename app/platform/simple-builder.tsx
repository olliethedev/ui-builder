"use client";

import React from "react";
import { z } from "zod";
import { toast } from "sonner";
import UIBuilder from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { blockDefinitions } from "@/lib/ui-builder/registry/block-definitions";
import { shadcnComponentDefinitions } from "@/lib/ui-builder/registry/shadcn-component-definitions";
import type { FunctionRegistry, Variable } from "@/components/ui/ui-builder/types";

/**
 * Example function registry for the simple builder demo.
 * These functions can be bound to component event handlers via the Data panel.
 */
const functionRegistry: FunctionRegistry = {
  showWelcomeToast: {
    name: "Show Welcome Toast",
    schema: z.tuple([]),
    fn: () => {
      toast.success("Welcome! Let's get started 🚀");
    },
    description: "Shows a welcome notification",
  },
  showSuccessToast: {
    name: "Show Success Toast",
    schema: z.tuple([]),
    fn: () => {
      toast.success("Action completed successfully!");
    },
    description: "Shows a success notification",
  },
  showInfoToast: {
    name: "Show Info Toast",
    schema: z.tuple([]),
    fn: () => {
      toast.info("Here's some helpful information.");
    },
    description: "Shows an info notification",
  },
  logToConsole: {
    name: "Log to Console",
    schema: z.tuple([]),
    fn: () => {
      console.log("[Demo] Button clicked at", new Date().toISOString());
    },
    description: "Logs a message to the browser console",
  },
  handleClick: {
    name: "Handle Click Event",
    schema: z.tuple([z.custom<React.MouseEvent>()]),
    fn: (e: React.MouseEvent) => {
      console.log("[Demo] Click event:", { x: e.clientX, y: e.clientY });
    },
    description: "Handles click events with coordinates",
    typeSignature: "(e: React.MouseEvent) => void",
  },
};

/**
 * Initial variables that demonstrate variable binding.
 * Users can see how dynamic data flows into the UI.
 */
const initialVariables: Variable[] = [
  {
    id: "userName",
    name: "User Name",
    type: "string",
    defaultValue: "Alex",
  },
  {
    id: "userRole",
    name: "User Role",
    type: "string",
    defaultValue: "Developer",
  },
  {
    id: "welcomeMessage",
    name: "Welcome Message",
    type: "string",
    defaultValue: "Welcome to UI Builder! This card demonstrates variable binding and interactive functions.",
  },
  {
    id: "getStartedFn",
    name: "Get Started Action",
    type: "function",
    defaultValue: "showWelcomeToast",
  },
];

const initialLayers = [
  {
    id: "page-root",
    type: "div",
    name: "Page",
    props: {
      className: "min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-8",
    },
    children: [
      {
        id: "welcome-card",
        type: "Card",
        name: "Welcome Card",
        props: {
          className: "w-full max-w-md shadow-xl",
        },
        children: [
          {
            id: "card-header",
            type: "CardHeader",
            name: "Card Header",
            props: {
              className: "flex flex-row items-center gap-4 pb-2",
            },
            children: [
              {
                id: "avatar",
                type: "Avatar",
                name: "Avatar",
                props: {
                  className: "h-16 w-16 border-2 border-primary",
                },
                children: [
                  {
                    id: "avatar-fallback",
                    type: "AvatarFallback",
                    name: "Avatar Fallback",
                    props: {
                      className: "text-xl font-bold bg-primary text-primary-foreground",
                    },
                    children: "A",
                  },
                ],
              },
              {
                id: "header-text",
                type: "div",
                name: "Header Text",
                props: {
                  className: "flex flex-col gap-1",
                },
                children: [
                  {
                    id: "greeting",
                    type: "CardTitle",
                    name: "Greeting",
                    props: {
                      className: "text-2xl",
                    },
                    children: [
                      {
                        id: "greeting-text",
                        type: "span",
                        name: "Greeting Text",
                        props: {},
                        children: "Hello, ",
                      },
                      {
                        id: "user-name",
                        type: "span",
                        name: "User Name",
                        props: {
                          className: "text-primary",
                          children: { __variableRef: "userName" },
                        },
                        children: [],
                      },
                      {
                        id: "greeting-emoji",
                        type: "span",
                        name: "Emoji",
                        props: {},
                        children: " 👋",
                      },
                    ],
                  },
                  {
                    id: "role-badge",
                    type: "Badge",
                    name: "Role Badge",
                    props: {
                      variant: "secondary",
                      className: "w-fit",
                      children: { __variableRef: "userRole" },
                    },
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            id: "card-content",
            type: "CardContent",
            name: "Card Content",
            props: {},
            children: [
              {
                id: "welcome-text",
                type: "CardDescription",
                name: "Welcome Message",
                props: {
                  className: "text-base leading-relaxed",
                  children: { __variableRef: "welcomeMessage" },
                },
                children: [],
              },
            ],
          },
          {
            id: "card-footer",
            type: "CardFooter",
            name: "Card Footer",
            props: {
              className: "flex gap-3",
            },
            children: [
              {
                id: "get-started-btn",
                type: "Button",
                name: "Get Started Button",
                props: {
                  className: "flex-1",
                  __function_onClick: "getStartedFn",
                },
                children: [
                  {
                    id: "btn-text",
                    type: "span",
                    name: "Button Text",
                    props: {},
                    children: "Get Started",
                  },
                ],
              },
              {
                id: "learn-more-btn",
                type: "Button",
                name: "Learn More Button",
                props: {
                  variant: "outline",
                  className: "flex-1",
                },
                children: [
                  {
                    id: "learn-more-text",
                    type: "span",
                    name: "Button Text",
                    props: {},
                    children: "Learn More",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const SimpleBuilder = () => {
  return (
    <UIBuilder
      initialLayers={initialLayers}
      initialVariables={initialVariables}
      persistLayerStore={false}
      componentRegistry={{
        ...complexComponentDefinitions,
        ...primitiveComponentDefinitions,
        ...shadcnComponentDefinitions,
      }}
      blocks={blockDefinitions}
      functionRegistry={functionRegistry}
    />
  );
}
