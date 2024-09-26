import { readFile, writeFile } from "fs/promises";
import { z } from "zod";
import { registryEntrySchema } from "./schema";
import { glob } from "glob";

console.log("Building registry...");

// Define the possible registry types as a union type
type RegistryType = "registry:ui" | "registry:lib";

// Update the RegistryConfig interface to use the RegistryType
interface RegistryConfig {
    type: RegistryType;
    path: string;
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
];

async function buildRegistry() {
    for (const config of registryConfigs) {
        // Initialize registry based on config.type
        const registry: z.infer<typeof registryEntrySchema> = {
            name: getRegistryName(config.type),
            type: config.type,
            registryDependencies: getRegistryComponentDependencies(config.type),
            dependencies: getDependencies(config.type),
            devDependencies: getDevDependencies(config.type),
            tailwind: {
                config: {
                    plugins: ["tailwindcss-animate", "@tailwindcss/typography"],
                    theme: {
                        extend: {
                            typography: {
                                DEFAULT: {
                                    css: {
                                        'code::before': {
                                            content: '""',
                                        },
                                        'code::after': {
                                            content: '""',
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

        const srcRegistry = structuredClone(registry);

        const files = await glob(config.path, { nodir: true });
        for (const file of files) {
            await processFile(file, registry, srcRegistry, config.type);
        }

        const registryFileName = getRegistryFileName(config.type);
        const srcRegistryFileName = getSrcRegistryFileName(config.type);

        await writeFile(
            `./registry/${ registryFileName }`,
            JSON.stringify(registry, null, 2)
        );
        await writeFile(
            `./registry/${ srcRegistryFileName }`,
            JSON.stringify(srcRegistry, null, 2)
        );

        console.log(`Registry for ${ config.type } built!`);
    }
}

function getRegistryName(type: RegistryType): string {
    switch (type) {
        case "registry:ui":
            return "UI Builder Components";
        case "registry:lib":
            return "UI Builder Schema Generator Utils";
        default:
            return "Unknown Registry";
    }
}

function getRegistryComponentDependencies(type: RegistryType): string[] {
    switch (type) {
        case "registry:ui":
            return [
                "accordion",
                "button",
                "calendar",
                "card",
                "checkbox",
                "command",
                "dialog",
                "form",
                "input",
                "label",
                "popover",
                "radio-group",
                "select",
                "separator",
                "switch",
                "tabs",
                "textarea",
                "tooltip",
                "toggle",
                "https://raw.githubusercontent.com/vantezzen/auto-form/main/registry/auto-form.json"
            ];
        case "registry:lib":
            return [];
        // Add more cases as needed
        default:
            return [];
    }
}

function getDependencies(type: RegistryType): string[] {
    switch (type) {
        case "registry:ui":
            return ["@anatine/zod-mock", "react-error-boundary", "react-hook-form", "swapy", "zod", "zustand", "zundo", "immer", "fast-deep-equal", "next-themes", "react-markdown", "remark-gfm", "remark-math", "react-syntax-highlighter", "@types/react-syntax-highlighter"];
        case "registry:lib":
            return ["react-docgen-typescript", "ts-morph", "ts-to-zod"]; // all dependencies for the lib can be devDependencies but shadcn/ui is not seeing them for some reason
        default:
            return [];
    }
}

function getDevDependencies(type: RegistryType): string[] {
    switch (type) {
        case "registry:ui":
            return [];
        case "registry:lib":
            return ["react-docgen-typescript", "ts-morph", "ts-to-zod"]; // Generator Utils dependencies are devDependencies because they are only used during development
        default:
            return [];
    }
}

function getRegistryFileName(type: RegistryType): string {
    switch (type) {
        case "registry:ui":
            return "ui-builder.json";
        case "registry:lib":
            return "ui-builder-lib.json";
        default:
            return "unknown.json";
    }
}

function getSrcRegistryFileName(type: RegistryType): string {
    switch (type) {
        case "registry:ui":
            return "ui-builder-src.json";
        case "registry:lib":
            return "ui-builder-lib-src.json";
        default:
            return "unknown-src.json";
    }
}

async function processFile(
    file: string,
    registry: z.infer<typeof registryEntrySchema>,
    srcRegistry: z.infer<typeof registryEntrySchema>,
    registryType: RegistryType
) {
    const content = await readFile(file, "utf-8");
    const relativePath = file.replace("components/", "");

    const fileEntry = {
        path: relativePath,
        target: file,
        content,
        type: registryType,
    };

    const srcFileEntry = {
        path: relativePath,
        target: `src/${ file }`,
        content,
        type: registryType,
    };

    registry.files!.push(fileEntry);
    srcRegistry.files!.push(srcFileEntry);
}

buildRegistry();