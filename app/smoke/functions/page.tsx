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
import { Toaster } from "@/components/ui/sonner";
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
      
      toast.loading("Submitting form...");
      
      try {
        const result = await submitFormAction(formData);
        
        if (result.success) {
          toast.success(result.message);
          form.reset();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to submit form");
        console.error("Form submission error:", error);
      }
    },
    description: "Submits form data to server action",
  },
  logToConsole: {
    name: "Log to Console",
    schema: z.tuple([]),
    fn: () => {
      console.log("[Function Registry] Button clicked at", new Date().toISOString());
      toast.info("Check the console for log output");
    },
    description: "Logs a message to the browser console",
  },
};

/**
 * Initial layers for the smoke test page.
 * Pre-configured with a form and button for testing.
 */
const initialLayers = [
  {
    id: "smoke-functions-page",
    type: "div",
    name: "Page",
    props: {
      className: "bg-background flex flex-col gap-4 p-4 w-full min-h-screen",
    },
    children: [
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
          className: "text-muted-foreground",
        },
        children: "This page demonstrates the function registry feature. Use the Data panel to create function-type variables and bind them to component event handlers.",
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
      <Toaster position="bottom-right" />
    </main>
  );
}
