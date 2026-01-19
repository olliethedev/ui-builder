import { ServerLayerRenderer } from "@/components/ui/ui-builder/server-layer-renderer";
import type { ComponentLayer, Variable, ComponentRegistry } from "@/components/ui/ui-builder/types";
import { z } from "zod";

export const metadata = {
  title: "SSR Layer Renderer Example",
  description: "Demonstrates server-side rendering with ServerLayerRenderer",
};

// Simple SSR-compatible component registry using only primitive elements
// For production, you can use any components that work in Server Components
const ssrComponentRegistry: ComponentRegistry = {
  div: {
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
    }),
  },
  span: {
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
    }),
  },
  h1: {
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
    }),
  },
  h2: {
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
    }),
  },
  p: {
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
    }),
  },
  a: {
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
      href: z.string().optional(),
      target: z.string().optional(),
    }),
  },
  img: {
    schema: z.object({
      className: z.string().optional(),
      src: z.string().optional(),
      alt: z.string().optional(),
    }),
  },
};

// Example page structure - could be fetched from a database
const examplePage: ComponentLayer = {
  id: "ssr-demo-page",
  type: "div",
  name: "SSR Demo Page",
  props: {
    className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8",
  },
  children: [
    {
      id: "header",
      type: "div",
      name: "Header",
      props: {
        className: "max-w-4xl mx-auto text-center mb-12",
      },
      children: [
        {
          id: "title",
          type: "h1",
          name: "Title",
          props: {
            className: "text-4xl font-bold text-gray-900 mb-4",
            children: { __variableRef: "pageTitle" },
          },
          children: [],
        },
        {
          id: "subtitle",
          type: "p",
          name: "Subtitle",
          props: {
            className: "text-xl text-gray-600",
            children: { __variableRef: "pageSubtitle" },
          },
          children: [],
        },
      ],
    },
    {
      id: "features",
      type: "div",
      name: "Features Grid",
      props: {
        className: "max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6",
      },
      children: [
        {
          id: "feature-1",
          type: "div",
          name: "Feature Card",
          props: {
            className: "bg-white rounded-lg shadow-lg p-6 border border-gray-200",
          },
          children: [
            {
              id: "feature-1-title",
              type: "h2",
              name: "Feature Title",
              props: {
                className: "text-xl font-semibold text-gray-800 mb-2",
              },
              children: "Server-Side Rendering",
            },
            {
              id: "feature-1-desc",
              type: "p",
              name: "Feature Description",
              props: {
                className: "text-gray-600",
              },
              children: "Pages are rendered on the server for optimal performance and SEO. No client-side JavaScript required for initial render.",
            },
          ],
        },
        {
          id: "feature-2",
          type: "div",
          name: "Feature Card",
          props: {
            className: "bg-white rounded-lg shadow-lg p-6 border border-gray-200",
          },
          children: [
            {
              id: "feature-2-title",
              type: "h2",
              name: "Feature Title",
              props: {
                className: "text-xl font-semibold text-gray-800 mb-2",
              },
              children: "Variable Binding",
            },
            {
              id: "feature-2-desc",
              type: "p",
              name: "Feature Description",
              props: {
                className: "text-gray-600",
              },
              children: "Dynamic content through variables - perfect for personalization with server-side data.",
            },
          ],
        },
        {
          id: "feature-3",
          type: "div",
          name: "Feature Card",
          props: {
            className: "bg-white rounded-lg shadow-lg p-6 border border-gray-200",
          },
          children: [
            {
              id: "feature-3-title",
              type: "h2",
              name: "Feature Title",
              props: {
                className: "text-xl font-semibold text-gray-800 mb-2",
              },
              children: "React Server Components",
            },
            {
              id: "feature-3-desc",
              type: "p",
              name: "Feature Description",
              props: {
                className: "text-gray-600",
              },
              children: "Works seamlessly with Next.js App Router and React Server Components - no 'use client' needed.",
            },
          ],
        },
        {
          id: "feature-4",
          type: "div",
          name: "Feature Card",
          props: {
            className: "bg-white rounded-lg shadow-lg p-6 border border-gray-200",
          },
          children: [
            {
              id: "feature-4-title",
              type: "h2",
              name: "Feature Title",
              props: {
                className: "text-xl font-semibold text-gray-800 mb-2",
              },
              children: "Static Generation",
            },
            {
              id: "feature-4-desc",
              type: "p",
              name: "Feature Description",
              props: {
                className: "text-gray-600",
              },
              children: "Compatible with SSG - generate static pages at build time for maximum performance.",
            },
          ],
        },
      ],
    },
    {
      id: "user-section",
      type: "div",
      name: "User Section",
      props: {
        className: "max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-6 border border-gray-200",
      },
      children: [
        {
          id: "user-title",
          type: "h2",
          name: "User Title",
          props: {
            className: "text-2xl font-semibold text-gray-800 mb-4",
          },
          children: "Dynamic User Data",
        },
        {
          id: "user-info",
          type: "div",
          name: "User Info",
          props: {
            className: "space-y-2",
          },
          children: [
            {
              id: "user-name-row",
              type: "div",
              name: "Name Row",
              props: {
                className: "flex items-center gap-2",
              },
              children: [
                {
                  id: "name-label",
                  type: "span",
                  name: "Label",
                  props: {
                    className: "font-medium text-gray-700 w-24",
                  },
                  children: "Name:",
                },
                {
                  id: "name-value",
                  type: "span",
                  name: "Value",
                  props: {
                    className: "text-gray-900",
                    children: { __variableRef: "userName" },
                  },
                  children: [],
                },
              ],
            },
            {
              id: "user-role-row",
              type: "div",
              name: "Role Row",
              props: {
                className: "flex items-center gap-2",
              },
              children: [
                {
                  id: "role-label",
                  type: "span",
                  name: "Label",
                  props: {
                    className: "font-medium text-gray-700 w-24",
                  },
                  children: "Role:",
                },
                {
                  id: "role-value",
                  type: "span",
                  name: "Value",
                  props: {
                    className: "text-gray-900",
                    children: { __variableRef: "userRole" },
                  },
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "footer",
      type: "div",
      name: "Footer",
      props: {
        className: "max-w-4xl mx-auto mt-8 text-center text-gray-500",
      },
      children: [
        {
          id: "footer-text",
          type: "p",
          name: "Footer Text",
          props: {
            className: "text-sm",
          },
          children: "This page was rendered on the server using ServerLayerRenderer",
        },
      ],
    },
  ],
};

// Variable definitions
const variables: Variable[] = [
  {
    id: "pageTitle",
    name: "Page Title",
    type: "string",
    defaultValue: "UI Builder SSR Demo",
  },
  {
    id: "pageSubtitle",
    name: "Page Subtitle",
    type: "string",
    defaultValue: "Server-rendered pages with dynamic content",
  },
  {
    id: "userName",
    name: "User Name",
    type: "string",
    defaultValue: "Guest User",
  },
  {
    id: "userRole",
    name: "User Role",
    type: "string",
    defaultValue: "Viewer",
  },
];

// Simulate server-side data fetching
async function getServerData() {
  // In a real app, this could be:
  // - Database query
  // - API call
  // - Session data
  // - Any server-side data source
  return {
    pageTitle: "Welcome to SSR Rendering",
    pageSubtitle: "Built with ServerLayerRenderer - fully server-rendered!",
    userName: "Jane Developer",
    userRole: "Admin",
  };
}

// This is a Server Component - no "use client" directive
export default async function SSRExamplePage() {
  // Fetch data on the server
  const serverData = await getServerData();

  return (
    <main data-testid="ssr-example-page">
      <ServerLayerRenderer
        page={examplePage}
        componentRegistry={ssrComponentRegistry}
        variables={variables}
        variableValues={serverData}
      />
    </main>
  );
}
