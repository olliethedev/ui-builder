/**
 * Builds the react-email components shadcn registry.
 *
 * Produces: registry/react-email-components-registry.json
 *
 * Install in a consumer project:
 *   npx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/react-email-components-registry.json
 *
 * Includes:
 *   - react-email-component-definitions.ts — ComponentRegistry for all @react-email/components
 *   - email-builder-utils.tsx — canvas substitutes, emailPageRenderer, emailCodeGenerator
 */

import { readFile, writeFile } from "fs/promises";
import {
  registryItemSchema,
  type RegistryItem,
  type RegistryItemFile,
} from "./schema";

console.log("Building react-email components registry...");

const DEFAULT_BLOCK_REGISTRY_URL =
  "https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json";
const blockRegistryDependencyUrl =
  process.env.UI_BUILDER_BLOCK_REGISTRY_URL ?? DEFAULT_BLOCK_REGISTRY_URL;

const EMAIL_FILES: Array<{ path: string; type: RegistryItemFile["type"] }> = [
  {
    path: "lib/ui-builder/registry/react-email-component-definitions.ts",
    type: "registry:lib",
  },
  {
    path: "lib/ui-builder/email/email-builder-utils.tsx",
    type: "registry:lib",
  },
];

async function buildEmailRegistry() {
  const files: RegistryItemFile[] = [];

  for (const { path, type } of EMAIL_FILES) {
    const content = await readFile(`./${path}`, "utf-8");
    console.log("Processing file", { file: path, type });
    files.push({ path, content, type, target: path });
  }

  const item: RegistryItem = {
    name: "react-email-component-definitions",
    type: "registry:lib",
    title: "React Email Component Definitions",
    description:
      "UIBuilder component registry definitions for @react-email/components. Enables email page editing inside UIBuilder. Includes emailPageRenderer and emailCodeGenerator for wiring UIBuilder as an email editor.",
    registryDependencies: [blockRegistryDependencyUrl],
    dependencies: [
      "@react-email/components",
      "@react-email/render",
      "web-streams-polyfill",
    ],
    devDependencies: [],
    files,
  };

  const validationResult = registryItemSchema.safeParse(item);
  if (!validationResult.success) {
    console.error(
      "Registry item validation failed:",
      validationResult.error.flatten()
    );
    process.exit(1);
  }

  const outFile = "./registry/react-email-components-registry.json";
  await writeFile(outFile, JSON.stringify(item, null, 2));

  console.log(`React-email registry built successfully → ${outFile}`);
  console.log(`  - ${files.length} files`);
  console.log(`  - Block registry dependency: ${blockRegistryDependencyUrl}`);
  console.log(
    `  - Dependencies: ${item.dependencies?.join(", ")}`
  );
}

buildEmailRegistry();
