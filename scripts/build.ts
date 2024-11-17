import { readFile, writeFile } from "fs/promises";
import { z } from "zod";
import { registryItemSchema } from "./schema";
import { glob } from "glob";

console.log("Building unified registry...");

// Define the RegistryConfig interface using a single RegistryType
type RegistryType = z.infer<typeof registryItemSchema>["type"];

interface RegistryConfig {
    type: RegistryType;
    path: string;
    targetFunction: (path: string) => string;
}

const registryConfigs: RegistryConfig[] = [
    {
        type: "registry:ui",
        path: "./components/ui/ui-builder/**/*",
        targetFunction: (path: string) => path.replace("components/ui/ui-builder", "components/ui/ui-builder"),
    },
    {
        type: "registry:lib",
        path: "./lib/ui-builder/**/*",
        targetFunction: (path: string) => path.replace("lib/ui-builder", "lib/ui-builder"),
    },
    {
        type: "registry:hook",
        path: "./hooks/**/*",
        targetFunction: (path: string) => path,
    },
    {
        type: "registry:example",
        path: "./app/example/page.tsx",
        targetFunction: (path: string) => path.replace("app/example", "/app/ui-builder"),
    },
    {
        type: "registry:ui",
        path: "./components/ui/date-picker.tsx",
        targetFunction: (path: string) => path,
    },
];

async function buildRegistry() {
    const unifiedRegistry: z.infer<typeof registryItemSchema> = {
        name: "unified-registry",
        type: "registry:block",
        registryDependencies: getRegistryDependencies(),
        dependencies: getDependencies(),
        devDependencies: getDevDependencies(),
        tailwind: {
            config: {
                plugins: ["require(\"tailwindcss-animate\")", "require(\"@tailwindcss/typography\")"],
                theme: {
                    extend: {
                        typography: {
                            DEFAULT: {
                                css: {
                                    'code::before': {
                                        content: `''`,
                                    },
                                    'code::after': {
                                        content: `''`,
                                    },
                                    code: {
                                        background: '#f3f3f3',
                                        wordWrap: 'break-word',
                                        padding: '.1rem .2rem',
                                        borderRadius: '.2rem',
                                    }
                                }
                            }
                        }
                    }
                }
            },
        },
        cssVars: {},
        files: [],
    };

    for (const config of registryConfigs) {
        const files = await glob(config.path, { nodir: true });
        for (const file of files) {
            await processFile(file, unifiedRegistry, config);
        }
    }

    const registryFileName = "block-registry.json";

    await writeFile(
        `./registry/${registryFileName}`,
        JSON.stringify(unifiedRegistry, null, 2)
    );

    console.log(`Unified registry (${ registryFileName }) built successfully!`);
}



function getDependencies(): string[] {
    // Consolidate dependencies or define as needed
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
        "react-markdown",
        "remark-gfm",
        "remark-math",
        "react-syntax-highlighter",
        "lodash.template",
        "he-tree-react"
    ];
}

function getDevDependencies(): string[] {
    return [
        "@tailwindcss/typography",
        "@types/lodash.template",
        "@types/react-syntax-highlighter",
        "react-docgen-typescript",
        "tailwindcss-animate",
        "ts-morph",
        "ts-to-zod"
    ];
}

function getRegistryDependencies(): string[] {
    return ["https://raw.githubusercontent.com/vantezzen/autoform/refs/heads/pure-shadcn/registry/auto-form.json",
        "badge",
        "command",
        "dropdown-menu",
        "tabs",
        "resizable",
    ];
}

async function processFile(
    file: string,
    registry: z.infer<typeof registryItemSchema>,
    config: RegistryConfig
) {

    const targetPath = config.targetFunction(file);
    console.log("Processing file", { file, type: config.type, target: targetPath });

    const content = await readFile(file, "utf-8");

    const fileEntry = {
        path: file,
        content,
        type: config.type,
        target: targetPath,
    };

    registry.files!.push(fileEntry);
}

buildRegistry();