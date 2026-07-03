#!/usr/bin/env npx tsx

/**
 * Build Shadcn Components Registry
 * 
 * This script builds the shadcn-components-registry.json file that contains
 * all shadcn component definitions and block definitions for use with the UI Builder.
 * 
 * Usage:
 *   npx tsx scripts/build-shadcn-registry.ts
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { 
    registryItemSchema, 
    type RegistryItem, 
    type RegistryItemFile,
    type RegistryItemType
} from "./schema";
import { glob } from "glob";

console.log("Building shadcn components registry...");

interface RegistryConfig {
    type: RegistryItemType;
    path: string;
}

// Files to include in the shadcn components registry
const registryConfigs: RegistryConfig[] = [
    // Shadcn component definitions
    {
        type: "registry:lib",
        path: "./lib/ui-builder/registry/shadcn-component-definitions.ts",
    },
    // Block definitions
    {
        type: "registry:lib",
        path: "./lib/ui-builder/registry/block-definitions.ts",
    },
    // Form field overrides (dependency)
    {
        type: "registry:lib",
        path: "./lib/ui-builder/registry/form-field-overrides.tsx",
    },
    // Custom chart demo components (not available in the shadcn registry)
    {
        type: "registry:ui",
        path: "./components/ui/chart-demos.tsx",
    },
];

async function buildRegistry() {
    const files: RegistryItemFile[] = [];

    // Ensure registry directory exists
    if (!existsSync('./registry')) {
        await mkdir('./registry', { recursive: true });
    }

    // Process all files from configs
    for (const config of registryConfigs) {
        const matchedFiles = await glob(config.path, { nodir: true });
        
        for (const file of matchedFiles) {
            const content = await readFile(file, "utf-8");
            
            const normalizedPath = file.replace(/^\.\//, "");
            
            console.log("Processing file", { file: normalizedPath, type: config.type, target: normalizedPath });

            files.push({
                path: normalizedPath,
                content,
                type: config.type,
                target: normalizedPath,
            });
        }
    }

    // Create the registry item
    const shadcnRegistryItem: RegistryItem = {
        name: "shadcn-components",
        type: "registry:block",
        title: "Shadcn Components for UI Builder",
        description: "All 54 shadcn/ui component definitions and 124 block templates for use with the UI Builder visual editor.",
        registryDependencies: getShadcnDependencies(),
        dependencies: getDependencies(),
        devDependencies: [],
        files,
        cssVars: {
            theme: {},
            light: {},
            dark: {},
        },
    };

    // Validate the registry item against the schema
    const validationResult = registryItemSchema.safeParse(shadcnRegistryItem);
    if (!validationResult.success) {
        console.error("Registry item validation failed:", validationResult.error);
        process.exit(1);
    }

    const registryFileName = "shadcn-components-registry.json";

    // Output as single registry item
    await writeFile(
        `./registry/${registryFileName}`,
        JSON.stringify(shadcnRegistryItem, null, 2)
    );

    console.log(`Registry (${registryFileName}) built successfully!`);
    console.log(`  - ${files.length} files processed`);
    console.log(`  - ${getDependencies().length} dependencies`);
    console.log(`  - ${getShadcnDependencies().length} registry dependencies`);
}

function getDependencies(): string[] {
    return [
        "zod",
        "recharts",
        "@tiptap/core@3.20.1",
        "@tiptap/react@3.20.1",
        "@tiptap/pm@3.20.1",
        "@tiptap/starter-kit@3.20.1",
        "@tiptap/extensions@3.20.1",
        "@tiptap/markdown@3.20.1",
        "@tiptap/extension-blockquote@3.20.1",
        "@tiptap/extension-bold@3.20.1",
        "@tiptap/extension-bubble-menu@3.20.1",
        "@tiptap/extension-bullet-list@3.20.1",
        "@tiptap/extension-code@3.20.1",
        "@tiptap/extension-code-block@3.20.1",
        "@tiptap/extension-code-block-lowlight@3.20.1",
        "@tiptap/extension-color@3.20.1",
        "@tiptap/extension-document@3.20.1",
        "@tiptap/extension-dropcursor@3.20.1",
        "@tiptap/extension-floating-menu@3.20.1",
        "@tiptap/extension-gapcursor@3.20.1",
        "@tiptap/extension-hard-break@3.20.1",
        "@tiptap/extension-heading@3.20.1",
        "@tiptap/extension-horizontal-rule@3.20.1",
        "@tiptap/extension-image@3.20.1",
        "@tiptap/extension-italic@3.20.1",
        "@tiptap/extension-link@3.20.1",
        "@tiptap/extension-list@3.20.1",
        "@tiptap/extension-list-item@3.20.1",
        "@tiptap/extension-list-keymap@3.20.1",
        "@tiptap/extension-ordered-list@3.20.1",
        "@tiptap/extension-paragraph@3.20.1",
        "@tiptap/extension-strike@3.20.1",
        "@tiptap/extension-table@3.20.1",
        "@tiptap/extension-text@3.20.1",
        "@tiptap/extension-text-style@3.20.1",
        "@tiptap/extension-typography@3.20.1",
        "@tiptap/extension-underline@3.20.1",
    ];
}

function getShadcnDependencies(): string[] {
    // All shadcn components that the definitions reference
    return [
        "accordion",
        "alert",
        "alert-dialog",
        "aspect-ratio",
        "avatar",
        "badge",
        "breadcrumb",
        "button",
        "button-group",
        "calendar",
        "card",
        "carousel",
        "chart",
        "checkbox",
        "collapsible",
        "command",
        "context-menu",
        "dialog",
        "drawer",
        "dropdown-menu",
        "empty",
        "field",
        "form",
        "hover-card",
        "input",
        "input-group",
        "input-otp",
        "item",
        "kbd",
        "label",
        "menubar",
        "navigation-menu",
        "pagination",
        "popover",
        "progress",
        "radio-group",
        "resizable",
        "scroll-area",
        "select",
        "separator",
        "sheet",
        "sidebar",
        "skeleton",
        "slider",
        "sonner",
        "spinner",
        "switch",
        "table",
        "tabs",
        "textarea",
        "toggle",
        "toggle-group",
        "tooltip",
    ];
}

buildRegistry();
