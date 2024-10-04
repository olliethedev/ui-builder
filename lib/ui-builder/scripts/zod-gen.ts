
import * as fs from 'fs';
import * as path from 'path';
import { fileToDoc } from './file-to-doc';
import { docToInterface, PropInterfaceData } from './doc-to-interface';
import { interfacesToSchema } from './interfaces-to-schema';


// Path to be scanned for components
const componentsDir = path.join(__dirname, '..', '..', '..', 'components');

interface Config {
  filesToProcess?: string[];
  foldersToIgnore: string[];
  filesToIgnore: string[];
}

/**
 * Recursively traverses the components directory to find and process .tsx files.
 * @param dir - The directory to traverse.
 */
function generateDocs(dir: string, config: Config) {
  const files = fs.readdirSync(dir);
  const interfaceDataArray: PropInterfaceData[] = [];

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      generateDocs(filePath, config);
    } else if (file.endsWith('.tsx')) {
      const { filesToProcess, foldersToIgnore, filesToIgnore } = config;

      if (filesToProcess && filesToProcess.length > 0 && !filesToProcess.includes(file)) {
        return;
      }

      if (foldersToIgnore.some(folder => filePath.includes(folder))) {
        return;
      }

      if (filesToIgnore.some(file => filePath.includes(file))) {
        return;
      }

      try {

        console.log("\x1b[32mProcessing file:", file, "\x1b[0m");
        // Parse the component file to extract prop types
        const docs = fileToDoc(filePath);

        if (docs.length === 0) {
          console.log("\x1b[33mFound 0 components in " + file + "\x1b[0m");
        } else {
          console.log(`Found ${ docs.length } components in ${ file }`);
        }
        if (docs.length === 0) {
          return;
        }

        for (const doc of docs) {
          const interfaceData = docToInterface(doc, componentsDir, dir);
          // console.log(`Interface data for ${ doc.displayName }:\n`, interfaceData);
          interfaceDataArray.push(interfaceData);
        }
      } catch (error) {
        console.error(`Error processing file ${ filePath }:`, error);
      }
    }
  });

  if (interfaceDataArray.length > 0) {
    // Generate the consolidated schemas file
    const dirParts = dir !== componentsDir ? path.relative(componentsDir, dir).split(path.sep) : [];
    const schemaFileContent = interfacesToSchema(interfaceDataArray);
    console.log({ componentsDir, dirParts });
    const schemaPathParts: string[] = [componentsDir, ...dirParts, 'generated-schemas.ts'];
    const schemaFilePath = path.join(...schemaPathParts);

    fs.writeFileSync(schemaFilePath, schemaFileContent);
    console.log(`==========================================================
\x1b[32m✔️ Generated component definitions file: ${ schemaFilePath }\x1b[0m
==========================================================`);
  }
}


// Initiate the documentation and schema generation
generateDocs(componentsDir, {
  foldersToIgnore: ['/internal', '/auto-form'],
  filesToIgnore: ['/ui-builder/multi-select.tsx'],
});
