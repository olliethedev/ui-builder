import { INTRODUCTION_LAYER } from "@/app/docs/docs-data/docs-page-layers/introduction";

export const DOCS_PAGES = [
    INTRODUCTION_LAYER
] as const;

type ExistingDocPageNames = `${Capitalize<(typeof DOCS_PAGES)[number]["name"]>}`;
type ExistingDocPageIds = (typeof DOCS_PAGES)[number]["id"];
type ExistingDocGroupNames = `${Capitalize<(typeof DOCS_PAGES)[0]["props"]["data-group"]>}`;


type DocPageNavItem = {
    title: ExistingDocGroupNames | string;
    items: {
        title: ExistingDocPageNames | string;
        url: `/${ExistingDocPageIds}` | `/${string}`;
    }[];
}

export const MENU_DATA: DocPageNavItem[] = [
    {
        title: "Core",
        items: [
            {
                title: "Introduction",
                url: "/introduction",
            },
            {
                title: "Quick Start",
                url: "/quick-start",
            },
        ],
    },
    {
        title: "Component System",
        items: [
            {
                title: "Component Registry",
                url: "/component-registry",
            },
            {
                title: "Field Overrides",
                url: "/field-overrides",
            },
            {
                title: "Default Children",
                url: "/default-children",
            },
            {
                title: "Custom Components",
                url: "/custom-components",
            }
        ],
    },
    {
        title: "Editor Features",
        items: [
            {
                title: "Canvas Editor",
                url: "/canvas-editor",
            },
            {
                title: "Pages Panel",
                url: "/pages-panel",
            },
            {
                title: "Immutable Pages",
                url: "/immutable-pages",
            },
            {
                title: "Appearance Panel",
                url: "/appearance-panel",
            },
            {
                title: "Props Panel",
                url: "/props-panel",
            },
            {
                title: "Variables Panel",
                url: "/variables-panel",
            },
            {
                title: "Panel Configuration",
                url: "/panel-configuration",
            },
            {
                title: "Editor Panel Config",
                url: "/editor-panel-config",
            },
            {
                title: "NavBar Customization",
                url: "/navbar-customization",
            },
            {
                title: "Props Panel Customization",
                url: "/props-panel-customization",
            },
        ],
    },
    {
        title: "Data & Variables",
        items: [
            {
                title: "Variables",
                url: "/variables",
            },
            {
                title: "Variable Binding",
                url: "/variable-binding",
            },
            {
                title: "Read-Only Mode",
                url: "/read-only-mode",
            },
            {
                title: "Data Binding",
                url: "/data-binding",
            },
        ],
    },
    {
        title: "Layout & Persistence",
        items: [
            {
                title: "Layer Structure",
                url: "/layer-structure",
            },
            {
                title: "Persistence",
                url: "/persistence",
            },
            {
                title: "Persist Layer Store",
                url: "/persist-layer-store",
            },
        ],
    },
    {
        title: "Rendering",
        items: [
            {
                title: "Rendering Pages",
                url: "/rendering-pages",
            },
            {
                title: "Page Theming",
                url: "/page-theming",
            },
        ],
    },
    {
        title: "Code & Extensibility",
        items: [
            {
                title: "Code Generation",
                url: "/code-generation",
            },
            {
                title: "Blocks (Planned)",
                url: "/blocks-planned",
            },
        ],
    },
] as const;



// Utility function to generate breadcrumbs from navigation data
export function getBreadcrumbsFromUrl(url: string) {
    // Remove leading slash if present
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    
    // Find the category and item that matches the URL
    for (const category of MENU_DATA) {
        for (const item of category.items) {
            // Remove leading slash from item URL for comparison
            const itemUrl = item.url.startsWith('/') ? item.url.substring(1) : item.url;
            
            if (itemUrl === cleanUrl) {
                return {
                    category: {
                        title: category.title,
                        // Create a category URL from the first item in the category
                        url: category.items[0]?.url || '#'
                    },
                    page: {
                        title: item.title,
                        url: item.url
                    }
                };
            }
        }
    }
    
    // Fallback if URL not found
    return {
        category: {
            title: "Documentation",
            url: "#"
        },
        page: {
            title: "Page",
            url: url
        }
    };
}

export function getDocPageForSlug(slug: string) {
    return DOCS_PAGES.find((page) => page.id === slug);
}
