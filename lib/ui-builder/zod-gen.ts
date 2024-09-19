
import * as fs from 'fs';
import * as path from 'path';
import { fileToDoc } from './file-to-doc';
import { docToInterface, PropInterfaceData } from './doc-to-interface';
import { interfacesToSchema } from './interfaces-to-schema';


// NOTE: for the script to find a component, it must take props

// Define directories and paths
const componentsDir = path.join(__dirname, '..', '..', 'components');

/**
 * Recursively traverses the components directory to find and process .tsx files.
 * @param dir - The directory to traverse.
 */
function generateDocs(dir: string) {
  const files = fs.readdirSync(dir);
  const interfaceDataArray: PropInterfaceData[] = [];

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      generateDocs(filePath);
    } else if (file.endsWith('.tsx')) {
      // Process only specific files or all .tsx files by removing the condition
      const filesToProcess: string[] = [];
      if (filesToProcess.length > 0 && !filesToProcess.includes(file)) {
        return;
      }

      try {

        console.log("Processing file:", file);
        // Parse the component file to extract prop types
        const docs = fileToDoc(filePath);
        // const fileContent = fs.readFileSync(filePath, 'utf8');
        // const zodString = generate({sourceText: fileContent});
        // console.log({ zodString: zodString.getZodSchemasFile(`./TempSchemas.ts`) });
        // throw new Error("stop");
        console.log(`Found ${ docs.length } components in ${ file }`);
        if (docs.length === 0) {
          return;
        }

        for (const doc of docs) {
          const interfaceData = docToInterface(doc, componentsDir, dir);
          console.log(`Interface data for ${ doc.displayName }:\n`, interfaceData);
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
    console.log(`Generated zod schema file: ${ schemaFilePath }`);
  }
}





// Initiate the documentation and schema generation
generateDocs(componentsDir);