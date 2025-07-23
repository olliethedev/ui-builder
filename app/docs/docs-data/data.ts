import { INTRODUCTION_LAYER } from "@/app/docs/docs-data/docs-page-layers/introduction";
import { QUICK_START_LAYER } from "@/app/docs/docs-data/docs-page-layers/quick-start";
import { COMPONENT_REGISTRY_LAYER } from "@/app/docs/docs-data/docs-page-layers/component-registry";
import { FIELD_OVERRIDES_LAYER } from "@/app/docs/docs-data/docs-page-layers/field-overrides";
import { CUSTOM_COMPONENTS_LAYER } from "@/app/docs/docs-data/docs-page-layers/custom-components";
import { CANVAS_EDITOR_LAYER } from "@/app/docs/docs-data/docs-page-layers/canvas-editor";
import { PAGES_PANEL_LAYER } from "@/app/docs/docs-data/docs-page-layers/pages-panel";
import { VARIABLES_PANEL_LAYER } from "@/app/docs/docs-data/docs-page-layers/variables-panel";
import { PROPS_PANEL_LAYER } from "@/app/docs/docs-data/docs-page-layers/props-panel";
import { APPEARANCE_PANEL_LAYER } from "@/app/docs/docs-data/docs-page-layers/appearance-panel";
import { IMMUTABLE_PAGES_LAYER } from "@/app/docs/docs-data/docs-page-layers/immutable-pages";
import { PANEL_CONFIGURATION_LAYER } from "@/app/docs/docs-data/docs-page-layers/panel-configuration";
import { VARIABLES_LAYER } from "@/app/docs/docs-data/docs-page-layers/variables";
import { VARIABLE_BINDING_LAYER } from "@/app/docs/docs-data/docs-page-layers/variable-binding";
import { READ_ONLY_MODE_LAYER } from "@/app/docs/docs-data/docs-page-layers/read-only-mode";
import { DATA_BINDING_LAYER } from "@/app/docs/docs-data/docs-page-layers/data-binding";
import { LAYER_STRUCTURE_LAYER } from "@/app/docs/docs-data/docs-page-layers/layer-structure";
import { PERSISTENCE_LAYER } from "@/app/docs/docs-data/docs-page-layers/persistence";
import { RENDERING_PAGES_LAYER } from "@/app/docs/docs-data/docs-page-layers/rendering-pages";
import { PAGE_THEMING_LAYER } from "@/app/docs/docs-data/docs-page-layers/page-theming";
import { EDITOR_PANEL_CONFIG_LAYER } from "@/app/docs/docs-data/docs-page-layers/editor-panel-config";
import { PROPS_PANEL_CUSTOMIZATION_LAYER } from "@/app/docs/docs-data/docs-page-layers/props-panel-customization";

export const DOCS_PAGES = [
    // Core
    INTRODUCTION_LAYER,
    QUICK_START_LAYER,
    
    // Component System
    COMPONENT_REGISTRY_LAYER,
    CUSTOM_COMPONENTS_LAYER,
    FIELD_OVERRIDES_LAYER,
    
    // Editor Features
    CANVAS_EDITOR_LAYER,
    PAGES_PANEL_LAYER,
    IMMUTABLE_PAGES_LAYER,
    APPEARANCE_PANEL_LAYER,
    PROPS_PANEL_LAYER,
    VARIABLES_PANEL_LAYER,
    PANEL_CONFIGURATION_LAYER,
    EDITOR_PANEL_CONFIG_LAYER,
    PROPS_PANEL_CUSTOMIZATION_LAYER,
    
    // Data & Variables
    VARIABLES_LAYER,
    VARIABLE_BINDING_LAYER,
    READ_ONLY_MODE_LAYER,
    DATA_BINDING_LAYER,
    
    // Layout & Persistence
    LAYER_STRUCTURE_LAYER,
    PERSISTENCE_LAYER,
    
    // Rendering
    RENDERING_PAGES_LAYER,
    PAGE_THEMING_LAYER,

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
                title: "Getting Started with Components",
                url: "/docs/component-registry",
            },
            {
                title: "Creating Custom Components",
                url: "/docs/custom-components",
            },
            {
                title: "Advanced Component Configuration",
                url: "/docs/field-overrides",
            }
        ],
    },
    {
        title: "Editor Features",
        items: [
            {
                title: "Canvas Editor",
                url: "/docs/canvas-editor",
            },
            {
                title: "Pages Panel",
                url: "/docs/pages-panel",
            },
            {
                title: "Immutable Pages",
                url: "/docs/immutable-pages",
            },
            {
                title: "Appearance Panel",
                url: "/docs/appearance-panel",
            },
            {
                title: "Props Panel",
                url: "/docs/props-panel",
            },
            {
                title: "Variables Panel",
                url: "/docs/variables-panel",
            },
            {
                title: "Panel Configuration",
                url: "/docs/panel-configuration",
            },
            {
                title: "Editor Panel Config",
                url: "/docs/editor-panel-config",
            },
            {
                title: "Props Panel Customization",
                url: "/docs/props-panel-customization",
            },
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
                title: "Read Only Mode",
                url: "/docs/read-only-mode",
            },
            {
                title: "Data Binding",
                url: "/docs/data-binding",
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
            {
                title: "Page Theming",
                url: "/docs/page-theming",
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
            title: "Page",
            url: url
        }
    };
}

export function getDocPageForSlug(slug: string) {
    return DOCS_PAGES.find((page) => page.id === slug);
}
