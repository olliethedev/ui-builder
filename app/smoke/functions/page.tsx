"use client";

import React from "react";
import { z } from "zod";
import { toast } from "sonner";
import UIBuilder from "@/components/ui/ui-builder";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { shadcnComponentDefinitions } from "@/lib/ui-builder/registry/shadcn-component-definitions";
import { blockDefinitions } from "@/lib/ui-builder/registry/block-definitions";
import type { FunctionRegistry } from "@/components/ui/ui-builder/types";
import { submitFormAction } from "./actions";

/**
 * Function registry for the smoke test.
 * Contains functions that can be bound to component event handlers.
 */
const functionRegistry: FunctionRegistry = {
  showSuccessToast: {
    name: "Show Success Toast",
    schema: z.tuple([]),
    fn: () => {
      toast.success("Action completed successfully!");
    },
    description: "Shows a success notification toast",
  },
  showErrorToast: {
    name: "Show Error Toast",
    schema: z.tuple([]),
    fn: () => {
      toast.error("Something went wrong!");
    },
    description: "Shows an error notification toast",
  },
  handleFormSubmit: {
    name: "Submit Form",
    schema: z.tuple([z.custom<React.FormEvent<HTMLFormElement>>()]),
    fn: async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      const submitPromise = submitFormAction(formData).then((result) => {
        if (result.success) {
          form.reset();
          return result.message;
        } else {
          throw new Error(result.message);
        }
      });
      
      toast.promise(submitPromise, {
        loading: "Submitting form...",
        success: (message) => message,
        error: (err) => err.message ?? "Failed to submit form",
      });
      
      await submitPromise.catch(() => {
        // Already handled by toast.promise
      });
    },
    description: "Submits form data to server action",
    // Explicit type signature for code generation (z.custom can't be inferred at runtime)
    typeSignature: "(e: React.FormEvent<HTMLFormElement>) => Promise<void>",
  },
  logToConsole: {
    name: "Log to Console",
    schema: z.tuple([z.string().optional()]),
    fn: (message?: string) => {
      const logMessage = message ?? "Button clicked";
      console.log("[Function Registry]", logMessage, "at", new Date().toISOString());
    },
    description: "Logs a message to the browser console",
    // typeSignature inferred from schema: (arg0?: string) => void
  },
};

/**
 * Initial layers for the smoke test page.
 * Pre-configured with forms and buttons for testing.
 */
const initialLayers = [
  {
    id: "smoke-functions-page",
    type: "div",
    name: "Page",
    props: {
      className: "bg-background flex flex-col gap-8 p-6 w-full min-h-screen",
    },
    children: [
      // Header section
      {
        id: "heading",
        type: "h1",
        name: "Page Heading",
        props: {
          className: "text-2xl font-bold",
        },
        children: "Function Registry Smoke Test",
      },
      {
        id: "description",
        type: "p",
        name: "Description",
        props: {
          className: "text-muted-foreground mb-4",
        },
        children: "This page demonstrates the function registry feature. Test form submissions and button clicks below.",
      },

      // HTML Form Section
      {
        id: "html-form-section",
        type: "div",
        name: "HTML Form Section",
        props: {
          className: "flex flex-col gap-4 p-4 border rounded-lg",
        },
        children: [
          {
            id: "html-form-title",
            type: "h2",
            name: "HTML Form Title",
            props: {
              className: "text-lg font-semibold",
            },
            children: "HTML Form (Server Action)",
          },
          {
            id: "html-form",
            type: "form",
            name: "HTML Contact Form",
            props: {
              className: "flex flex-col gap-4",
              // Bind onSubmit to handleFormSubmit function
              __function_onSubmit: "handleFormSubmit",
            },
            children: [
              {
                id: "html-name-field",
                type: "div",
                name: "Name Field Container",
                props: {
                  className: "flex flex-col gap-2",
                },
                children: [
                  {
                    id: "html-name-label",
                    type: "label",
                    name: "Name Label",
                    props: {
                      className: "text-sm font-medium",
                    },
                    children: "Name",
                  },
                  {
                    id: "html-name-input",
                    type: "input",
                    name: "Name Input",
                    props: {
                      type: "text",
                      name: "name",
                      placeholder: "Enter your name",
                      className: "px-3 py-2 border rounded-md",
                      required: true,
                    },
                    children: [],
                  },
                ],
              },
              {
                id: "html-email-field",
                type: "div",
                name: "Email Field Container",
                props: {
                  className: "flex flex-col gap-2",
                },
                children: [
                  {
                    id: "html-email-label",
                    type: "label",
                    name: "Email Label",
                    props: {
                      className: "text-sm font-medium",
                    },
                    children: "Email",
                  },
                  {
                    id: "html-email-input",
                    type: "input",
                    name: "Email Input",
                    props: {
                      type: "email",
                      name: "email",
                      placeholder: "Enter your email",
                      className: "px-3 py-2 border rounded-md",
                      required: true,
                    },
                    children: [],
                  },
                ],
              },
              {
                id: "html-submit-btn",
                type: "button",
                name: "Submit Button",
                props: {
                  type: "submit",
                  className: "px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90",
                },
                children: "Submit HTML Form",
              },
            ],
          },
        ],
      },

      // Shadcn Form Section
      {
        id: "shadcn-form-section",
        type: "Card",
        name: "Shadcn Form Card",
        props: {
          className: "",
        },
        children: [
          {
            id: "shadcn-card-header",
            type: "CardHeader",
            name: "Card Header",
            props: {},
            children: [
              {
                id: "shadcn-form-title",
                type: "CardTitle",
                name: "Card Title",
                props: {},
                children: [
                  {
                    id: "shadcn-form-title-text",
                    type: "span",
                    name: "Title Text",
                    props: {},
                    children: "Shadcn Form (Server Action)",
                  },
                ],
              },
              {
                id: "shadcn-form-desc",
                type: "CardDescription",
                name: "Card Description",
                props: {},
                children: [
                  {
                    id: "shadcn-form-desc-text",
                    type: "span",
                    name: "Description Text",
                    props: {},
                    children: "A form built with shadcn components",
                  },
                ],
              },
            ],
          },
          {
            id: "shadcn-card-content",
            type: "CardContent",
            name: "Card Content",
            props: {},
            children: [
              {
                id: "shadcn-form",
                type: "form",
                name: "Shadcn Form",
                props: {
                  className: "flex flex-col gap-4",
                  // Bind onSubmit to handleFormSubmit function
                  __function_onSubmit: "handleFormSubmit",
                },
                children: [
                  {
                    id: "shadcn-name-input",
                    type: "Input",
                    name: "Name Input",
                    props: {
                      type: "text",
                      name: "name",
                      placeholder: "Your name",
                    },
                    children: [],
                  },
                  {
                    id: "shadcn-email-input",
                    type: "Input",
                    name: "Email Input",
                    props: {
                      type: "email",
                      name: "email",
                      placeholder: "your@email.com",
                    },
                    children: [],
                  },
                  {
                    id: "shadcn-submit-btn",
                    type: "Button",
                    name: "Submit Button",
                    props: {
                      type: "submit",
                    },
                    children: [
                      {
                        id: "shadcn-submit-text",
                        type: "span",
                        name: "Button Text",
                        props: {},
                        children: "Submit Shadcn Form",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },

      // Toast Buttons Section
      {
        id: "toast-section",
        type: "div",
        name: "Toast Buttons Section",
        props: {
          className: "flex flex-col gap-4 p-4 border rounded-lg",
        },
        children: [
          {
            id: "toast-title",
            type: "h2",
            name: "Toast Title",
            props: {
              className: "text-lg font-semibold",
            },
            children: "Toast Notifications",
          },
          {
            id: "toast-description",
            type: "p",
            name: "Toast Description",
            props: {
              className: "text-sm text-muted-foreground mb-2",
            },
            children: "Click the buttons below to trigger toast notifications. Use the Props panel to bind onClick to functions.",
          },
          {
            id: "toast-buttons-row",
            type: "div",
            name: "Toast Buttons Row",
            props: {
              className: "flex gap-2 flex-wrap",
            },
            children: [
              {
                id: "success-toast-btn",
                type: "Button",
                name: "Success Toast Button",
                props: {
                  variant: "default",
                  // Bind onClick to showSuccessToast function
                  __function_onClick: "showSuccessToast",
                },
                children: [
                  {
                    id: "success-toast-text",
                    type: "span",
                    name: "Button Text",
                    props: {},
                    children: "Show Success Toast",
                  },
                ],
              },
              {
                id: "error-toast-btn",
                type: "Button",
                name: "Error Toast Button",
                props: {
                  variant: "destructive",
                  // Bind onClick to showErrorToast function
                  __function_onClick: "showErrorToast",
                },
                children: [
                  {
                    id: "error-toast-text",
                    type: "span",
                    name: "Button Text",
                    props: {},
                    children: "Show Error Toast",
                  },
                ],
              },
              {
                id: "console-log-btn",
                type: "Button",
                name: "Console Log Button",
                props: {
                  variant: "outline",
                  // Bind onClick to logToConsole function
                  __function_onClick: "logToConsole",
                },
                children: [
                  {
                    id: "console-log-text",
                    type: "span",
                    name: "Button Text",
                    props: {},
                    children: "Log to Console",
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

/**
 * Smoke test page for the Function Registry feature.
 * Demonstrates:
 * - Form submission with Next.js server action
 * - Button with sonner toast notification
 * - Function-type variables bound to event handlers
 */
export default function SmokeFunctionsPage() {
  return (
    <main data-testid="smoke-functions-page" className="flex flex-col h-dvh">
      <UIBuilder
        initialLayers={initialLayers}
        persistLayerStore={false}
        componentRegistry={{
          ...complexComponentDefinitions,
          ...primitiveComponentDefinitions,
          ...shadcnComponentDefinitions,
        }}
        blocks={blockDefinitions}
        functionRegistry={functionRegistry}
      />
    </main>
  );
}
