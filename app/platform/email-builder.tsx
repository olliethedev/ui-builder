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
// Initial layers — rich email template showcasing all theme customizations
// ---------------------------------------------------------------------------
const initialLayers: ComponentLayer[] = [
  {
    id: "email-page-1",
    type: "Html",
    name: "Welcome Email",
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
        children: "Welcome to UIBuilder — build beautiful emails visually with your own components.",
      },
      {
        id: "email-tailwind-1",
        type: "Tailwind",
        name: "Tailwind",
        props: { config: DEFAULT_EMAIL_TAILWIND_CONFIG },
        children: [
          {
            id: "email-body-1",
            type: "Body",
            name: "Body",
            props: { className: "bg-muted font-sans m-0 p-0" },
            children: [

              // ── Header ─────────────────────────────────────────────────────
              {
                id: "email-header-section",
                type: "Section",
                name: "Header",
                props: { className: "bg-primary px-6 py-4" },
                children: [
                  {
                    id: "email-header-container",
                    type: "Container",
                    name: "Header Container",
                    props: { className: "max-w-xl mx-auto" },
                    children: [
                      {
                        id: "email-logo-row",
                        type: "Row",
                        name: "Logo Row",
                        props: {},
                        children: [
                          {
                            id: "email-logo-col",
                            type: "Column",
                            name: "Logo",
                            props: {},
                            children: [
                              {
                                id: "email-logo-text",
                                type: "Text",
                                name: "Brand Name",
                                props: { className: "text-primary-foreground text-xl font-bold m-0" },
                                children: "⚡ UIBuilder",
                              },
                            ],
                          },
                          {
                            id: "email-nav-col",
                            type: "Column",
                            name: "Nav Links",
                            props: { className: "text-right" },
                            children: [
                              {
                                id: "email-nav-link-1",
                                type: "Link",
                                name: "Docs Link",
                                props: {
                                  href: "https://uibuilder.app/docs",
                                  className: "text-primary-foreground text-sm no-underline mr-4 opacity-80",
                                },
                                children: "Docs",
                              },
                              {
                                id: "email-nav-link-2",
                                type: "Link",
                                name: "GitHub Link",
                                props: {
                                  href: "https://github.com/olliethedev/ui-builder",
                                  className: "text-primary-foreground text-sm no-underline opacity-80",
                                },
                                children: "GitHub",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },

              // ── Hero ───────────────────────────────────────────────────────
              {
                id: "email-hero-section",
                type: "Section",
                name: "Hero",
                props: { className: "bg-card px-6 pt-10 pb-8" },
                children: [
                  {
                    id: "email-hero-container",
                    type: "Container",
                    name: "Hero Container",
                    props: { className: "max-w-xl mx-auto text-center" },
                    children: [
                      {
                        id: "email-hero-badge",
                        type: "Text",
                        name: "Badge",
                        props: { className: "inline-block bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest m-0 mb-4" },
                        children: "New Release · v3.0",
                      },
                      {
                        id: "email-hero-heading",
                        type: "Text",
                        name: "Hero Heading",
                        props: { className: "text-3xl font-bold text-foreground leading-tight mt-0 mb-3" },
                        children: "Build beautiful emails — visually.",
                      },
                      {
                        id: "email-hero-subheading",
                        type: "Text",
                        name: "Hero Subheading",
                        props: { className: "text-base text-muted-foreground mt-0 mb-6 leading-relaxed" },
                        children: "UIBuilder gives your team a Figma-style editor for React. Drag, drop, and theme email templates using the exact components you already ship.",
                      },
                      {
                        id: "email-hero-cta",
                        type: "Button",
                        name: "Primary CTA",
                        props: {
                          href: "https://uibuilder.app",
                          className: "bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold text-base no-underline inline-block",
                        },
                        children: "Get Started Free →",
                      },
                      {
                        id: "email-hero-secondary-link",
                        type: "Text",
                        name: "Secondary Link",
                        props: { className: "text-sm text-muted-foreground mt-4 mb-0" },
                        children: "No credit card required",
                      },
                    ],
                  },
                ],
              },

              // ── Hero Image ─────────────────────────────────────────────────
              {
                id: "email-img-section",
                type: "Section",
                name: "Hero Image",
                props: { className: "bg-card px-6 pb-10" },
                children: [
                  {
                    id: "email-img-container",
                    type: "Container",
                    name: "Image Container",
                    props: { className: "max-w-xl mx-auto" },
                    children: [
                      {
                        id: "email-hero-img",
                        type: "Img",
                        name: "Preview Image",
                        props: {
                          src: "https://uibuilder.app/demo.gif",
                          alt: "UIBuilder demo",
                          width: 560,
                          className: "rounded-lg border border-border w-full",
                        },
                        children: [],
                      },
                    ],
                  },
                ],
              },

              // ── Divider ────────────────────────────────────────────────────
              {
                id: "email-divider-1-section",
                type: "Section",
                name: "Divider",
                props: { className: "bg-card px-6" },
                children: [
                  {
                    id: "email-divider-1-container",
                    type: "Container",
                    name: "Divider Container",
                    props: { className: "max-w-xl mx-auto" },
                    children: [
                      {
                        id: "email-hr-1",
                        type: "Hr",
                        name: "Divider",
                        props: { className: "border-border my-0" },
                        children: [],
                      },
                    ],
                  },
                ],
              },

              // ── Features ───────────────────────────────────────────────────
              {
                id: "email-features-section",
                type: "Section",
                name: "Features",
                props: { className: "bg-card px-6 py-8" },
                children: [
                  {
                    id: "email-features-container",
                    type: "Container",
                    name: "Features Container",
                    props: { className: "max-w-xl mx-auto" },
                    children: [
                      {
                        id: "email-features-heading",
                        type: "Text",
                        name: "Features Heading",
                        props: { className: "text-xl font-bold text-foreground text-center mt-0 mb-6" },
                        children: "Everything you need to ship faster",
                      },
                      {
                        id: "email-features-row",
                        type: "Row",
                        name: "Features Row",
                        props: { className: "gap-4" },
                        children: [
                          {
                            id: "email-feature-1-col",
                            type: "Column",
                            name: "Feature 1",
                            props: { className: "bg-muted rounded-lg p-4 align-top" },
                            children: [
                              {
                                id: "email-feature-1-icon",
                                type: "Text",
                                name: "Feature Icon",
                                props: { className: "text-2xl mt-0 mb-2" },
                                children: "🧩",
                              },
                              {
                                id: "email-feature-1-title",
                                type: "Text",
                                name: "Feature Title",
                                props: { className: "font-semibold text-foreground text-sm mt-0 mb-1" },
                                children: "Component Registry",
                              },
                              {
                                id: "email-feature-1-desc",
                                type: "Text",
                                name: "Feature Desc",
                                props: { className: "text-xs text-muted-foreground mt-0 mb-0 leading-relaxed" },
                                children: "Use your existing React components directly in the editor.",
                              },
                            ],
                          },
                          {
                            id: "email-feature-2-col",
                            type: "Column",
                            name: "Feature 2",
                            props: { className: "bg-muted rounded-lg p-4 align-top" },
                            children: [
                              {
                                id: "email-feature-2-icon",
                                type: "Text",
                                name: "Feature Icon",
                                props: { className: "text-2xl mt-0 mb-2" },
                                children: "🎨",
                              },
                              {
                                id: "email-feature-2-title",
                                type: "Text",
                                name: "Feature Title",
                                props: { className: "font-semibold text-foreground text-sm mt-0 mb-1" },
                                children: "Live Theming",
                              },
                              {
                                id: "email-feature-2-desc",
                                type: "Text",
                                name: "Feature Desc",
                                props: { className: "text-xs text-muted-foreground mt-0 mb-0 leading-relaxed" },
                                children: "Switch colors, radius, and dark mode in real time.",
                              },
                            ],
                          },
                          {
                            id: "email-feature-3-col",
                            type: "Column",
                            name: "Feature 3",
                            props: { className: "bg-muted rounded-lg p-4 align-top" },
                            children: [
                              {
                                id: "email-feature-3-icon",
                                type: "Text",
                                name: "Feature Icon",
                                props: { className: "text-2xl mt-0 mb-2" },
                                children: "💾",
                              },
                              {
                                id: "email-feature-3-title",
                                type: "Text",
                                name: "Feature Title",
                                props: { className: "font-semibold text-foreground text-sm mt-0 mb-1" },
                                children: "JSON Output",
                              },
                              {
                                id: "email-feature-3-desc",
                                type: "Text",
                                name: "Feature Desc",
                                props: { className: "text-xs text-muted-foreground mt-0 mb-0 leading-relaxed" },
                                children: "Layouts save as plain JSON — version-control friendly.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },

              // ── Stats ──────────────────────────────────────────────────────
              {
                id: "email-stats-section",
                type: "Section",
                name: "Stats",
                props: { className: "bg-primary px-6 py-8" },
                children: [
                  {
                    id: "email-stats-container",
                    type: "Container",
                    name: "Stats Container",
                    props: { className: "max-w-xl mx-auto" },
                    children: [
                      {
                        id: "email-stats-row",
                        type: "Row",
                        name: "Stats Row",
                        props: {},
                        children: [
                          {
                            id: "email-stat-1-col",
                            type: "Column",
                            name: "Stat 1",
                            props: { className: "text-center" },
                            children: [
                              {
                                id: "email-stat-1-num",
                                type: "Text",
                                name: "Stat Number",
                                props: { className: "text-3xl font-bold text-primary-foreground mt-0 mb-1" },
                                children: "10k+",
                              },
                              {
                                id: "email-stat-1-label",
                                type: "Text",
                                name: "Stat Label",
                                props: { className: "text-xs text-primary-foreground opacity-75 mt-0 mb-0 uppercase tracking-wide" },
                                children: "Developers",
                              },
                            ],
                          },
                          {
                            id: "email-stat-2-col",
                            type: "Column",
                            name: "Stat 2",
                            props: { className: "text-center" },
                            children: [
                              {
                                id: "email-stat-2-num",
                                type: "Text",
                                name: "Stat Number",
                                props: { className: "text-3xl font-bold text-primary-foreground mt-0 mb-1" },
                                children: "98%",
                              },
                              {
                                id: "email-stat-2-label",
                                type: "Text",
                                name: "Stat Label",
                                props: { className: "text-xs text-primary-foreground opacity-75 mt-0 mb-0 uppercase tracking-wide" },
                                children: "Satisfaction",
                              },
                            ],
                          },
                          {
                            id: "email-stat-3-col",
                            type: "Column",
                            name: "Stat 3",
                            props: { className: "text-center" },
                            children: [
                              {
                                id: "email-stat-3-num",
                                type: "Text",
                                name: "Stat Number",
                                props: { className: "text-3xl font-bold text-primary-foreground mt-0 mb-1" },
                                children: "4.9 ★",
                              },
                              {
                                id: "email-stat-3-label",
                                type: "Text",
                                name: "Stat Label",
                                props: { className: "text-xs text-primary-foreground opacity-75 mt-0 mb-0 uppercase tracking-wide" },
                                children: "GitHub Stars",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },

              // ── Body copy ──────────────────────────────────────────────────
              {
                id: "email-copy-section",
                type: "Section",
                name: "Body Copy",
                props: { className: "bg-card px-6 py-8" },
                children: [
                  {
                    id: "email-copy-container",
                    type: "Container",
                    name: "Copy Container",
                    props: { className: "max-w-xl mx-auto" },
                    children: [
                      {
                        id: "email-copy-heading",
                        type: "Text",
                        name: "Section Heading",
                        props: { className: "text-lg font-bold text-foreground mt-0 mb-3" },
                        children: "Here's what you can do today",
                      },
                      {
                        id: "email-copy-item-1",
                        type: "Text",
                        name: "List Item 1",
                        props: { className: "text-sm text-foreground mt-0 mb-2 leading-relaxed" },
                        children: "✅  Drag and drop your React components onto a live canvas",
                      },
                      {
                        id: "email-copy-item-2",
                        type: "Text",
                        name: "List Item 2",
                        props: { className: "text-sm text-foreground mt-0 mb-2 leading-relaxed" },
                        children: "✅  Edit props and see changes reflected instantly in the preview",
                      },
                      {
                        id: "email-copy-item-3",
                        type: "Text",
                        name: "List Item 3",
                        props: { className: "text-sm text-foreground mt-0 mb-2 leading-relaxed" },
                        children: "✅  Switch themes using the Appearance tab on the left",
                      },
                      {
                        id: "email-copy-item-4",
                        type: "Text",
                        name: "List Item 4",
                        props: { className: "text-sm text-foreground mt-0 mb-2 leading-relaxed" },
                        children: "✅  Export as JSX or copy the JSON to persist in your database",
                      },
                      {
                        id: "email-copy-body",
                        type: "Text",
                        name: "Body Paragraph",
                        props: { className: "text-sm text-muted-foreground mt-4 mb-0 leading-relaxed" },
                        children: "Have questions or feedback? Reply to this email — we read every message. You can also check out the full documentation or browse the community on GitHub.",
                      },
                      {
                        id: "email-copy-doc-link",
                        type: "Link",
                        name: "Docs Link",
                        props: {
                          href: "https://uibuilder.app/docs",
                          className: "text-primary text-sm font-medium",
                        },
                        children: "Read the documentation →",
                      },
                    ],
                  },
                ],
              },

              // ── Divider ────────────────────────────────────────────────────
              {
                id: "email-divider-2-section",
                type: "Section",
                name: "Divider 2",
                props: { className: "bg-card px-6" },
                children: [
                  {
                    id: "email-divider-2-container",
                    type: "Container",
                    name: "Divider Container",
                    props: { className: "max-w-xl mx-auto" },
                    children: [
                      {
                        id: "email-hr-2",
                        type: "Hr",
                        name: "Divider",
                        props: { className: "border-border my-0" },
                        children: [],
                      },
                    ],
                  },
                ],
              },

              // ── Secondary CTA ──────────────────────────────────────────────
              {
                id: "email-secondary-section",
                type: "Section",
                name: "Secondary CTA",
                props: { className: "bg-card px-6 py-8" },
                children: [
                  {
                    id: "email-secondary-container",
                    type: "Container",
                    name: "Secondary Container",
                    props: { className: "max-w-xl mx-auto" },
                    children: [
                      {
                        id: "email-secondary-inner",
                        type: "Section",
                        name: "Secondary Inner",
                        props: { className: "bg-accent rounded-lg px-6 py-6 text-center" },
                        children: [
                          {
                            id: "email-secondary-heading",
                            type: "Text",
                            name: "Secondary Heading",
                            props: { className: "text-base font-bold text-accent-foreground mt-0 mb-2" },
                            children: "Need help getting started?",
                          },
                          {
                            id: "email-secondary-body",
                            type: "Text",
                            name: "Secondary Body",
                            props: { className: "text-sm text-accent-foreground opacity-80 mt-0 mb-4" },
                            children: "Our team is happy to walk you through the setup. Book a free 30-minute onboarding call.",
                          },
                          {
                            id: "email-secondary-btn",
                            type: "Button",
                            name: "Secondary Button",
                            props: {
                              href: "https://uibuilder.app",
                              className: "bg-secondary text-secondary-foreground px-6 py-2 rounded font-semibold text-sm no-underline inline-block",
                            },
                            children: "Book a Call",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },

              // ── Footer ─────────────────────────────────────────────────────
              {
                id: "email-footer-section",
                type: "Section",
                name: "Footer",
                props: { className: "bg-muted px-6 py-6" },
                children: [
                  {
                    id: "email-footer-container",
                    type: "Container",
                    name: "Footer Container",
                    props: { className: "max-w-xl mx-auto text-center" },
                    children: [
                      {
                        id: "email-footer-links-row",
                        type: "Row",
                        name: "Footer Links Row",
                        props: { className: "mb-4" },
                        children: [
                          {
                            id: "email-footer-link-1-col",
                            type: "Column",
                            name: "Footer Link 1",
                            props: { className: "text-center" },
                            children: [
                              {
                                id: "email-footer-link-1",
                                type: "Link",
                                name: "Privacy Link",
                                props: {
                                  href: "https://uibuilder.app",
                                  className: "text-muted-foreground text-xs no-underline",
                                },
                                children: "Privacy Policy",
                              },
                            ],
                          },
                          {
                            id: "email-footer-link-2-col",
                            type: "Column",
                            name: "Footer Link 2",
                            props: { className: "text-center" },
                            children: [
                              {
                                id: "email-footer-link-2",
                                type: "Link",
                                name: "Terms Link",
                                props: {
                                  href: "https://uibuilder.app",
                                  className: "text-muted-foreground text-xs no-underline",
                                },
                                children: "Terms of Service",
                              },
                            ],
                          },
                          {
                            id: "email-footer-link-3-col",
                            type: "Column",
                            name: "Footer Link 3",
                            props: { className: "text-center" },
                            children: [
                              {
                                id: "email-footer-link-3",
                                type: "Link",
                                name: "Unsubscribe Link",
                                props: {
                                  href: "https://uibuilder.app",
                                  className: "text-muted-foreground text-xs no-underline",
                                },
                                children: "Unsubscribe",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        id: "email-footer-copyright",
                        type: "Text",
                        name: "Copyright",
                        props: { className: "text-xs text-muted-foreground mt-0 mb-0" },
                        children: "© 2025 UIBuilder · 123 Main St, San Francisco, CA 94105",
                      },
                    ],
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
