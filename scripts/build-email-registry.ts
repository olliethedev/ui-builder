/**
 * Builds the react-email components shadcn registry.
 *
 * Produces: registry/react-email-components-registry.json
 *
 * Install in a consumer project:
 *   npx shadcn@latest add https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/react-email-components-registry.json
 */

import { readFile, writeFile } from "fs/promises";
import {
  registryItemSchema,
  type RegistryItem,
  type RegistryItemFile,
} from "./schema";

console.log("Building react-email components registry...");

const EMAIL_FILES: Array<{ path: string; type: RegistryItemFile["type"] }> = [
  {
    path: "lib/ui-builder/registry/react-email-component-definitions.ts",
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
      "UIBuilder component registry definitions for @react-email/components. Enables email page editing inside UIBuilder.",
    registryDependencies: [
      "https://raw.githubusercontent.com/olliethedev/ui-builder/main/registry/block-registry.json",
    ],
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
  console.log(
    `  - Dependencies: ${item.dependencies?.join(", ")}`
  );
}

buildEmailRegistry();
