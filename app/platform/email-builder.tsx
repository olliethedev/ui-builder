"use client";

/**
 * Example: Email Builder wired up with react-email page type support.
 *
 * This file is the demo/app entry point. Wiring utilities are imported from
 * @/lib/ui-builder/email/email-builder-utils (part of the email registry).
 */

import "web-streams-polyfill/polyfill";
import React from "react";
import UIBuilder from "@/components/ui/ui-builder";
import { reactEmailComponentDefinitions } from "@/lib/ui-builder/registry/react-email-component-definitions";
import {
  DEFAULT_EMAIL_TAILWIND_CONFIG,
  EmailTailwindThemePanel,
  emailPageRenderer,
  emailCodeGenerator,
} from "@/lib/ui-builder/email/email-builder-utils";
import type { ComponentLayer } from "@/components/ui/ui-builder/types";

// ---------------------------------------------------------------------------
// Initial layers — start with a minimal email structure
// ---------------------------------------------------------------------------
const initialLayers: ComponentLayer[] = [
  {
    id: "email-page-1",
    type: "Html",
    name: "Email 1",
    pageType: "email",
    props: { lang: "en" },
    children: [
      {
        id: "email-head-1",
        type: "Head",
        name: "Head",
        props: {},
        children: [],
      },
      {
        id: "email-preview-1",
        type: "Preview",
        name: "Preview",
        props: {},
        children: "Welcome to our email",
      },
      {
        id: "email-tailwind-1",
        type: "Tailwind",
        name: "Tailwind",
        props: {
          config: DEFAULT_EMAIL_TAILWIND_CONFIG,
        },
        children: [
          {
            id: "email-body-1",
            type: "Body",
            name: "Body",
            props: { className: "bg-background font-sans" },
            children: [
              {
                id: "email-container-1",
                type: "Container",
                name: "Container",
                props: { className: "max-w-2xl mx-auto p-6 bg-card text-card-foreground rounded-lg border border-border" },
                children: [
                  {
                    id: "email-text-1",
                    type: "Text",
                    name: "Heading",
                    props: { className: "text-2xl font-bold text-foreground" },
                    children: "Hello from UIBuilder Email!",
                  },
                  {
                    id: "email-text-2",
                    type: "Text",
                    name: "Body Text",
                    props: { className: "text-base text-muted-foreground" },
                    children: "Edit this email template using the UIBuilder editor.",
                  },
                  {
                    id: "email-button-1",
                    type: "Button",
                    name: "CTA Button",
                    props: {
                      href: "https://example.com",
                      className: "bg-primary text-primary-foreground px-6 py-3 rounded font-semibold",
                    },
                    children: "Get Started",
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

// ---------------------------------------------------------------------------
// EmailBuilder component
// ---------------------------------------------------------------------------
export function EmailBuilder() {
  return (
    <UIBuilder
      initialLayers={initialLayers}
      persistLayerStore={false}
      componentRegistry={reactEmailComponentDefinitions}
      pageTypeRenderers={{ email: emailPageRenderer }}
      pageTypeCodeGenerators={{ email: emailCodeGenerator }}
      tailwindThemePanel={<EmailTailwindThemePanel />}
      allowPagesCreation
      allowPagesDeletion
    />
  );
}
