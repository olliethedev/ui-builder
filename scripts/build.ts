import { readFile, writeFile } from "fs/promises";
import { 
    registrySchema, 
    registryItemSchema, 
    type Registry, 
    type RegistryItem, 
    type RegistryItemType,
    type RegistryItemFile 
} from "./schema";
import { glob } from "glob";

console.log("Building shadcn registry (v4 format)...");

interface RegistryConfig {
    type: RegistryItemType;
    path: string;
    /** Only needed for registry:page and registry:file types */
    targetFunction?: (path: string) => string;
}

const registryConfigs: RegistryConfig[] = [
    {
        type: "registry:ui",
        path: "./components/ui/ui-builder/**/*",
    },
    {
        type: "registry:lib",
        path: "./lib/ui-builder/**/*",
    },
    {
        type: "registry:hook",
        path: "./hooks/**/*",
    },
    {
        type: "registry:page",
        path: "./app/example/page.tsx",
        targetFunction: (path: string) => path.replace("app/example", "app/ui-builder"),
    },
    {
        type: "registry:ui",
        path: "./components/ui/date-picker.tsx",
    },
];

async function buildRegistry() {
    const files: RegistryItemFile[] = [];

    // Process all files from configs
    for (const config of registryConfigs) {
        const matchedFiles = await glob(config.path, { nodir: true });
        for (const file of matchedFiles) {
            const content = await readFile(file, "utf-8");
            
            // Only set target for registry:page and registry:file types
            const needsTarget = config.type === "registry:page" || config.type === "registry:file";
            const targetPath = needsTarget && config.targetFunction ? config.targetFunction(file) : undefined;
            
            console.log("Processing file", { file, type: config.type, ...(targetPath && { target: targetPath }) });

            files.push({
                path: file,
                content,
                type: config.type,
                ...(targetPath && { target: targetPath }),
            });
        }
    }

    // Create the main registry item
    const uiBuilderItem: RegistryItem = {
        name: "ui-builder",
        type: "registry:block",
        title: "UI Builder",
        description: "A Figma-style visual editor for React applications that allows non-developers to compose pages using existing React components.",
        registryDependencies: getRegistryDependencies(),
        dependencies: getDependencies(),
        devDependencies: getDevDependencies(),
        files,
        cssVars: {
            theme: {
                "radius": "0.5rem",
            },
            light: {},
            dark: {},
        },
    };

    // Validate the registry item against the schema
    const validationResult = registryItemSchema.safeParse(uiBuilderItem);
    if (!validationResult.success) {
        console.error("Registry item validation failed:", validationResult.error);
        process.exit(1);
    }

    const registryFileName = "block-registry.json";

    // Output as single registry item (not collection) for compatibility with `shadcn init <url>`
    await writeFile(
        `./registry/${registryFileName}`,
        JSON.stringify(uiBuilderItem, null, 2)
    );

    console.log(`Registry (${registryFileName}) built successfully!`);
    console.log(`  - ${files.length} files processed`);
    console.log(`  - ${getDependencies().length} dependencies`);
    console.log(`  - ${getRegistryDependencies().length} registry dependencies`);
}

function getDependencies(): string[] {
    return [
        "@use-gesture/react",
        "react-error-boundary",
        "react-hook-form",
        "zod",
        "zustand@4.5.5",
        "zundo",
        "immer",
        "fast-deep-equal",
        "next-themes",
        "react-markdown@^9.0.0",
        "remark-gfm",
        "remark-math",
        "react-syntax-highlighter",
        "eta",
        "he-tree-react",
        "@dnd-kit/core",
        "@dnd-kit/sortable",
        "@dnd-kit/utilities",
        "react-zoom-pan-pinch",
        "object-hash",
        "@floating-ui/react",
        "react-resizable-panels@^2.0.0"
    ];
}

function getDevDependencies(): string[] {
    return [
        "@tailwindcss/typography",
        "@types/react-syntax-highlighter",
        "@types/object-hash"
    ];
}

function getRegistryDependencies(): string[] {
    return [
        "https://raw.githubusercontent.com/better-stack-ai/form-builder/refs/heads/main/registry/auto-form.json",
        "https://raw.githubusercontent.com/olliethedev/shadcn-minimal-tiptap/refs/heads/feat/markdown/registry/block-registry.json",
        "accordion",
        "badge",
        "calendar",
        "card",
        "command",
        "dropdown-menu",
        "scroll-area",
        "tabs",
        "resizable",
    ];
}

buildRegistry();
