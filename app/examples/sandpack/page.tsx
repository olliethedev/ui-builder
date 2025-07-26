"use client";

import UIBuilder from "@/components/ui/ui-builder";
import { ComponentRegistry, ComponentLayer } from "@/components/ui/ui-builder/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";

// Simple component registry for the example
const exampleRegistry: ComponentRegistry = {
  Button: {
    component: Button,
    schema: z.object({
      children: z.string().default("Click me"),
      variant: z.enum(["default", "destructive", "outline", "secondary", "ghost", "link"]).default("default"),
      size: z.enum(["default", "sm", "lg", "icon"]).default("default"),
      disabled: z.boolean().default(false),
    }),
  },
  Card: {
    component: Card,
    schema: z.object({
      className: z.string().optional(),
    }),
    defaultChildren: [],
  },
  CardHeader: {
    component: CardHeader,
    schema: z.object({
      className: z.string().optional(),
    }),
    defaultChildren: [],
  },
  CardTitle: {
    component: CardTitle,
    schema: z.object({
      children: z.string().default("Card Title"),
      className: z.string().optional(),
    }),
  },
  CardContent: {
    component: CardContent,
    schema: z.object({
      className: z.string().optional(),
    }),
    defaultChildren: [],
  },
  div: {
    component: "div",
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
    }),
    defaultChildren: [],
  },
  h1: {
    component: "h1",
    schema: z.object({
      className: z.string().optional(),
      children: z.string().default("Heading"),
    }),
  },
  p: {
    component: "p",
    schema: z.object({
      className: z.string().optional(),
      children: z.string().default("Paragraph text"),
    }),
  },
};

// Initial layers for the example
const initialLayers: ComponentLayer[] = [
  {
    id: "page-1",
    name: "Main Page",
    type: "div",
    props: {
      className: "p-8 space-y-6",
    },
    children: [
      {
        id: "heading-1",
        name: "Main Heading",
        type: "h1",
        props: {
          className: "text-3xl font-bold text-center",
          children: "Sandpack UI Builder Demo",
        },
        children: [],
      },
      {
        id: "card-1",
        name: "Example Card",
        type: "Card",
        props: {
          className: "max-w-md mx-auto",
        },
        children: [
          {
            id: "card-header-1",
            name: "Card Header",
            type: "CardHeader",
            props: {},
            children: [
              {
                id: "card-title-1",
                name: "Card Title",
                type: "CardTitle",
                props: {
                  children: "Interactive Card",
                },
                children: [],
              },
            ],
          },
          {
            id: "card-content-1",
            name: "Card Content",
            type: "CardContent",
            props: {
              className: "space-y-4",
            },
            children: [
              {
                id: "paragraph-1",
                name: "Description",
                type: "p",
                props: {
                  children: "This card is rendered inside a Sandpack iframe with full interactivity.",
                },
                children: [],
              },
              {
                id: "button-1",
                name: "Action Button",
                type: "Button",
                props: {
                  children: "Click Me!",
                  variant: "default",
                },
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

export default function SandpackBuilderExample() {
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-background border-b p-4">
        <h1 className="text-2xl font-bold">Sandpack UI Builder Example</h1>
        <p className="text-muted-foreground">
          This example uses UIBuilder with useSandpack=true to render components inside a Sandpack iframe.
        </p>
      </div>
      <div className="flex-1">
        <UIBuilder
          useSandpack={true}
          componentRegistry={exampleRegistry}
          initialLayers={initialLayers}
          onChange={(layers) => {
            console.log("Layers changed:", layers);
          }}
          allowPagesCreation={true}
          allowPagesDeletion={true}
          allowVariableEditing={true}
        />
      </div>
    </div>
  );
}