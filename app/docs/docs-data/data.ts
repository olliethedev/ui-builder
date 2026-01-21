import { INTRODUCTION_LAYER } from "@/app/docs/docs-data/docs-page-layers/introduction";
import { QUICK_START_LAYER } from "@/app/docs/docs-data/docs-page-layers/quick-start";
import { COMPONENT_REGISTRY_LAYER } from "@/app/docs/docs-data/docs-page-layers/component-registry";
import { FIELD_OVERRIDES_LAYER } from "@/app/docs/docs-data/docs-page-layers/field-overrides";
import { CUSTOM_COMPONENTS_LAYER } from "@/app/docs/docs-data/docs-page-layers/custom-components";
import { PANEL_CONFIGURATION_LAYER } from "@/app/docs/docs-data/docs-page-layers/panel-configuration";
import { VARIABLES_LAYER } from "@/app/docs/docs-data/docs-page-layers/variables";
import { VARIABLE_BINDING_LAYER } from "@/app/docs/docs-data/docs-page-layers/variable-binding";
import { FUNCTION_REGISTRY_LAYER } from "@/app/docs/docs-data/docs-page-layers/function-registry";
import { READ_ONLY_MODE_LAYER } from "@/app/docs/docs-data/docs-page-layers/read-only-mode";
import { LAYER_STRUCTURE_LAYER } from "@/app/docs/docs-data/docs-page-layers/layer-structure";
import { PERSISTENCE_LAYER } from "@/app/docs/docs-data/docs-page-layers/persistence";
import { RENDERING_PAGES_LAYER } from "@/app/docs/docs-data/docs-page-layers/rendering-pages";
import { SHADCN_REGISTRY_LAYER } from "@/app/docs/docs-data/docs-page-layers/shadcn-registry";

export const DOCS_PAGES = [
    // Core
    INTRODUCTION_LAYER,
    QUICK_START_LAYER,
    
    // Component System
    COMPONENT_REGISTRY_LAYER,
    SHADCN_REGISTRY_LAYER,
    CUSTOM_COMPONENTS_LAYER,
    FIELD_OVERRIDES_LAYER,
    PANEL_CONFIGURATION_LAYER,
    
    // Data & Variables
    VARIABLES_LAYER,
    VARIABLE_BINDING_LAYER,
    FUNCTION_REGISTRY_LAYER,
    READ_ONLY_MODE_LAYER,
    
    // Layout & Persistence
    LAYER_STRUCTURE_LAYER,
    PERSISTENCE_LAYER,
    
    // Rendering
    RENDERING_PAGES_LAYER,

] as const;

type ExistingDocPageNames = `${Capitalize<(typeof DOCS_PAGES)[number]["name"]>}`;
type ExistingDocPageIds = (typeof DOCS_PAGES)[number]["id"];
type ExistingDocGroupNames = `${Capitalize<(typeof DOCS_PAGES)[0]["props"]["data-group"]>}`;


type DocPageNavItem = {
    title: ExistingDocGroupNames | string;
    items: {
        title: ExistingDocPageNames ;
        url: `/docs/${ExistingDocPageIds}`;
    }[];
}

export const MENU_DATA: DocPageNavItem[] = [
    {
        title: "Core",
        items: [
            {
                title: "Introduction",
                url: "/docs/introduction",
            },
            {
                title: "Quick Start",
                url: "/docs/quick-start",
            },
        ],
    },
    {
        title: "Component System",
        items: [
            {
                title: "Components Intro",
                url: "/docs/component-registry",
            },
            {
                title: "Shadcn Registry",
                url: "/docs/shadcn-registry",
            },
            {
                title: "Custom Components",
                url: "/docs/custom-components",
            },
            {
                title: "Advanced Configuration",
                url: "/docs/field-overrides",
            },
            {
                title: "Panel Configuration",
                url: "/docs/panel-configuration",
            }
        ],
    },
    {
        title: "Data & Variables",
        items: [
            {
                title: "Variables",
                url: "/docs/variables",
            },
            {
                title: "Variable Binding",
                url: "/docs/variable-binding",
            },
            {
                title: "Function Registry",
                url: "/docs/function-registry",
            },
            {
                title: "Editing Restrictions",
                url: "/docs/read-only-mode",
            },
        ],
    },
    {
        title: "Layout & Persistence",
        items: [
            {
                title: "Layer Structure",
                url: "/docs/layer-structure",
            },
            {
                title: "State Management & Persistence",
                url: "/docs/persistence",
            },
        ],
    },
    {
        title: "Rendering",
        items: [
            {
                title: "Rendering Pages",
                url: "/docs/rendering-pages",
            },
        ],
    }
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
            title: "Home",
            url: url
        }
    };
}

export function getDocPageForSlug(slug: string) {
    return DOCS_PAGES.find((page) => page.id === slug);
}
